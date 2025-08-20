import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { feedListAtom } from "../Atoms/FeedListAtom";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import PersonalityCard from "../Components/PersonalityCard";
import SecondaryPersonalityCard from "../Components/SecondaryPersonalityCard";
import BrandWardrobe from "../Components/BrandWadrobe";
import OverlayModal from "../Components/OverlayModal";
import "../assets/css/App.css";
import { FaPen, FaClock, FaCog } from "react-icons/fa";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { testValuesAtom } from "../Atoms/TestValuesAtom";
import UserSettings from "../Components/UserSettings";
import { API_userSafeFetchJson } from "../Services/API";

function ProfilePage() {
  const [profile, setProfile] = useAtom(valueProfileAtom);
  const [testValues, setTestValues] = useAtom(testValuesAtom);
  const [error, setError] = useState("");
  const [brands, setBrands] = useAtom(feedListAtom)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [hiddenBrands, setHiddenBrands] = useState([])
  const [showHidden, setShowHidden] = useState(false);
  const [token] = useAtom(authTokenAtom);
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false);


// On load fetch all the profile information
  useEffect(() => {
    setProfile(null);
    if (!token) return;

    try { API_userSafeFetchJson(token, 'user/personality', setProfile) }
    catch (err) {
      setError("Kunde inte hämta profil: " + err.message);
      console.error("Fel vid hämtning av profil:", err);
    }
    try { API_userSafeFetchJson(token, 'user/brands/collection', setBrands) }
    catch (err) {
      setError("Kunde inte hämta varumärken: " + err.message);
      console.error("Fel vid hämtning av varumärken:", err);
    }
    try { API_userSafeFetchJson(token, 'user/personality/history', setHistory) }
    catch (err) {
      setError("Kunde inte hämta historik: " + err.message);
      console.error("Fel vid hämtning av historik:", err);
    }

  }, [token]);

  // update testValues when we have a profile
  useEffect(() => {
    if (profile) {
      setTestValues({
        changeVsTradition: profile.changeVsTradition,
        compassionVsAmbition: profile.compassionVsAmbition,
      });
    }}, [profile]);

  
  async function handleShowHidden() {
    if (showHidden) {
      setShowHidden(false);
      return;
    }
    const hidden = await API_userSafeFetchJson(token, 'user/brands/hidden', setHiddenBrands);
    if (!hidden) {
      setError("Kunde inte hämta gömda varumärken");
      return;
    }
    setShowHidden(true);
  }

  if (error) return <div className="page-content"><p style={{ color: "red" }}>{error}</p></div>;
  if (!profile) return <div className="page-content"><p>Laddar profil...</p></div>; 

   const userId = profile?.userId || profile?.id || null;

  const cogBtn = {
    position: "absolute",
    top: 8,
    right: 8,
    width: 44,
    height: 44,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "white",
    border: "1px solid #ddd",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    cursor: "pointer",
    zIndex: 2,
  };

  return (
    <>
      <div className="page-content" style={{ position: "relative" }}>
        <h2>Din Personlighet</h2>

        {profile?.primaryPersonality?.name &&
          valueProfiles[profile.primaryPersonality.name] && (
            <PersonalityCard
              personality={profile.primaryPersonality}
              profile={valueProfiles[profile.primaryPersonality.name]}
              testValues={testValues}
              highlight
            />
          )}

        <div className="secondary-container">
          {profile?.secondaryPersonality?.name &&
            valueProfiles[profile.secondaryPersonality.name] && (
              <SecondaryPersonalityCard
                personality={profile.secondaryPersonality}
                profile={valueProfiles[profile.secondaryPersonality.name]}
              />
            )}

          {profile?.thirdPersonality?.name &&
            valueProfiles[profile.thirdPersonality.name] && (
              <SecondaryPersonalityCard
                personality={profile.thirdPersonality}
                profile={valueProfiles[profile.thirdPersonality.name]}
              />
            )}

          <div className="secondary-icons">
            <FaPen
              className="clickable-icon"
              title="Redigera personlighet"
              onClick={() => navigate("/test")}
            />
            <FaClock
              className="clickable-icon"
              title="Visa historik"
              onClick={() => setShowHistory(true)}
            />
          </div>
        </div>

        <BrandWardrobe
          brands={brands}
          showHidden={showHidden}
          hiddenBrands={hiddenBrands}
          setHiddenBrands={setHiddenBrands}
          handleShowHidden={handleShowHidden}
        />

        <OverlayModal isOpen={showHistory} onClose={() => setShowHistory(false)}>
          <div className="history-list">
            <h3>Tidigare Resultat</h3>
            {history.map((item, idx) => (
              <div key={idx} className="history-entry">
                <p>
                  <strong>{new Date(item.createdAt).toLocaleString()}</strong>
                </p>
                <p>
                  Primär: {valueProfiles[item.primaryType].title} ({item.primaryMatchPercentage}%)
                </p>
                <p>
                  Sekundär: {valueProfiles[item.secondaryType].title} ({item.secondaryMatchPercentage}%)
                </p>
                <p>
                  Tredje: {valueProfiles[item.thirdType].title} ({item.thirdMatchPercentage}%)
                </p>
                <hr />
              </div>
            ))}
          </div>
        </OverlayModal>

        {/* Settings */}
        <button
          className="cogwheel-btn"
          aria-label="Öppna inställningar"
          title="Inställningar"
          onClick={() => setShowSettings(true)}
        >
          <FaCog size={28} />
        </button>

        <OverlayModal isOpen={showSettings} onClose={() => setShowSettings(false)}>
          <UserSettings userId={userId} onClose={() => setShowSettings(false)} />
        </OverlayModal>
      </div>
    </>
  );
}

export default ProfilePage;