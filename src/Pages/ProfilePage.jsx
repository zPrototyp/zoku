import React, { useEffect, useState, useMemo } from "react";
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
import { API_userSafeFetchJson } from "../Services/API";
import TribeCommunityOverview from "../Components/TribeCommunityOverview";
import RandomBrand from "../Components/RandomBrand";
import { MdKeyboardDoubleArrowDown, MdKeyboardDoubleArrowUp } from "react-icons/md";
import useMediaQuery from "../Components/MediaQuery";
import UserSettings from "../Components/UserSettings";

function ProfilePage() {
  const [profile, setProfile] = useAtom(valueProfileAtom);
  const [testValues, setTestValues] = useAtom(testValuesAtom);
  const [error, setError] = useState("");
  const [brands, setBrands] = useAtom(feedListAtom);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hiddenBrands, setHiddenBrands] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [token] = useAtom(authTokenAtom);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [uiStatus, setUiStatus] = useState({ showBrandList: false });

  const isComputer = useMediaQuery("(min-width: 1024px)");

  // On load fetch all the profile information
  useEffect(() => {
    setProfile(null);
    if (!token) return;

    try { API_userSafeFetchJson(token, "user/personality", setProfile); }
    catch (err) {
      setError("Kunde inte hämta profil: " + err.message);
      console.error("Fel vid hämtning av profil:", err);
    }
    try { API_userSafeFetchJson(token, "user/brands/collection", setBrands); }
    catch (err) {
      setError("Kunde inte hämta varumärken: " + err.message);
      console.error("Fel vid hämtning av varumärken:", err);
    }
    try { API_userSafeFetchJson(token, "user/personality/history", setHistory); }
    catch (err) {
      setError("Kunde inte hämta historik: " + err.message);
      console.error("Fel vid hämtning av historik:", err);
    }
  }, [token]);

  useEffect(() => {
    if (isComputer) {
      setUiStatus((prev) => ({ ...prev, showBrandList: true }));
    }
  }, [isComputer]);

  // update testValues when we have a profile
  useEffect(() => {
    if (profile) {
      setTestValues({
        changeVsTradition: profile.changeVsTradition,
        compassionVsAmbition: profile.compassionVsAmbition,
      });
    }
  }, [profile]);

  async function handleShowHidden() {
    if (showHidden) {
      setShowHidden(false);
      return;
    }
    const hidden = await API_userSafeFetchJson(token, "user/brands/hidden", setHiddenBrands);
    if (!hidden) {
      setError("Kunde inte hämta gömda varumärken");
      return;
    }
    setShowHidden(true);
  }

  if (error) return <div className="page-content"><p style={{ color: "red" }}>{error}</p></div>;
  if (!profile) return <div className="page-content"><p>Laddar profil...</p></div>;

  // Profile does not contain a userID to set.
  const userId = profile?.userId || profile?.id || null;

  // --- helper: safe lookup for titles from valueProfiles ---
  const getProfileTitle = (typeKey) =>
    (typeKey && valueProfiles?.[typeKey]?.title) || String(typeKey ?? "Okänd");

  return (
    <>
      <div className="page-content" style={{ position: "relative" }}>
        <h2>Din Personlighet</h2>

        <div className="result-content">
          <div className="personality-result">
            {profile?.primaryPersonality?.name &&
              valueProfiles[profile.primaryPersonality.name] && (
                <PersonalityCard
                  personality={profile.primaryPersonality}
                  profile={valueProfiles[profile.primaryPersonality.name]}
                  fullProfile={profile}
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
            </div>

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

          <div className="btn-show-matches">
            <button
              onClick={() =>
                setUiStatus((prev) => ({ ...prev, showBrandList: !prev.showBrandList }))
              }
              className={uiStatus.showBrandList ? "active btn-small btn-show-matches" : "active btn-show-matches"}
            >
              {uiStatus.showBrandList ? (
                <>
                  <MdKeyboardDoubleArrowUp className="clickable-icon" />
                  Dölj mina matchningar
                  <MdKeyboardDoubleArrowUp className="clickable-icon" />
                </>
              ) : (
                <>
                  <MdKeyboardDoubleArrowDown className="clickable-icon" />
                  Utforska mina matchningar
                  <MdKeyboardDoubleArrowDown className="clickable-icon" />
                </>
              )}
            </button>
          </div>

          {uiStatus.showBrandList && (
            <BrandWardrobe
              brands={brands}
              showHidden={showHidden}
              hiddenBrands={hiddenBrands}
              setHiddenBrands={setHiddenBrands}
              handleShowHidden={handleShowHidden}
            />
          )}

          {uiStatus.showBrandList && (
            <RandomBrand
              category="all"
              bearer={token}
              user={profile}
              testValues={testValues}
              currentBrandList={brands}
            />
          )}

          {/* Tribes overview */}
          <TribeCommunityOverview token={token} title="Tribes" />

          <OverlayModal isOpen={showHistory} onClose={() => setShowHistory(false)}>
            <div className="history-list">
              <h3>Tidigare Resultat</h3>
              {history.map((item, idx) => (
                <div key={idx} className="history-entry">
                  <p>
                    <strong>{new Date(item.createdAt).toLocaleString()}</strong>
                  </p>
                  <p>
                    Primär: {getProfileTitle(item.primaryType)} ({item.primaryMatchPercentage}%)
                  </p>
                  <p>
                    Sekundär: {getProfileTitle(item.secondaryType)} ({item.secondaryMatchPercentage}%)
                  </p>
                  <p>
                    Tredje: {getProfileTitle(item.thirdType)} ({item.thirdMatchPercentage}%)
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
      </div>
    </>
  );
}

export default ProfilePage;
