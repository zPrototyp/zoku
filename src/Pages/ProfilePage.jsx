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
import { FaPen, FaClock } from "react-icons/fa";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { testValuesAtom } from "../Atoms/TestValuesAtom";
import { API_userSafeFetchJson } from "../Services/API";
import RandomBrand from "../Components/RandomBrand";
import useMediaQuery from "../Components/MediaQuery";
import TribeCommunityOverview from "../Components/TribeCommunityOverview";

// import { comparisonValueAtom } from '../Atoms/ComparisonValueAtom.jsx'
// import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx'
// import { CreateComparisonDials } from '../Components/CreateComparisonDials.jsx'
// import { calculateMatchPercentage } from "../Services/type-calculation";
// import CelebrityComparisonDial from "../Components/CelebrityComparisonDial.jsx";

function ProfilePage() {
  const [profile, setProfile] = useAtom(valueProfileAtom);
  const [testValues, setTestValues] = useAtom(testValuesAtom);
  const [error, setError] = useState("");
  const [brands, setBrands] = useAtom(feedListAtom);
  const [history, setHistory] = useState([]);
  const [hiddenBrands, setHiddenBrands] = useState([]);
  const [token] = useAtom(authTokenAtom);
  const navigate = useNavigate();
  const [uiStatus, setUiStatus] = useState({
     showBrandList: false,
     showHistory: false,
     showHidden: false
    });

  const isComputer = useMediaQuery("(min-width: 1024px)")

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
      setUiStatus(prev => ({ ...prev, showBrandList: true }));
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
  }, [profile, setTestValues]);

  // ---- ALWAYS call hooks before any early returns ----
  // Safe test values so children never see null (prevents crashes)
  const safeTestValues = useMemo(() => {
    if (profile) {
      return {
        changeVsTradition: Number(profile.changeVsTradition ?? 0),
        compassionVsAmbition: Number(profile.compassionVsAmbition ?? 0),
      };
    }
    if (testValues) {
      return {
        changeVsTradition: Number(testValues.changeVsTradition ?? 0),
        compassionVsAmbition: Number(testValues.compassionVsAmbition ?? 0),
      };
    }
    return { changeVsTradition: 0, compassionVsAmbition: 0 };
  }, [profile, testValues]);

  async function handleShowHidden() {
    if (uiStatus.showHidden) {
      setUiStatus((prev) => ({...prev, showHidden: false}))
      return;
    }
    const hidden = await API_userSafeFetchJson(token, "user/brands/hidden", setHiddenBrands);
    if (!hidden) {
      setError("Kunde inte hämta gömda varumärken");
      return;
    }
    setUiStatus((prev) => ({...prev, showHidden: true}))
  }

  // Early returns AFTER hooks are declared
  if (error) return <div className="page-content"><p style={{ color: "red" }}>{error}</p></div>;
  if (!profile) return <div className="page-content"><p>Laddar profil...</p></div>;

  return (
    <>
      <div className="page-content" style={{ position: "relative" }}>
        {/* {showComparison && hasFriend && dialA && dialB && (
          <div className="comparison-inline" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ marginBottom: '.5rem' }}>Jämförelse {calculateMatchPercentage(friendValues, testValues)}% match</h2>
            <CelebrityComparisonDial a={dialA} b={dialB} aLabel="Du" bLabel="Vän" size={260} />
            <button style={{fontSize:"1.2em"}} onClick={()=>setShowComparison(p=> !p)}>Dölj jämförelse</button>
          </div>
          )}
        {!showComparison && hasFriend && (<button style={{fontSize:"1.2em"}} onClick={()=>setShowComparison(p=> !p)}>Visa jämförelse med {valueProfiles[friendProfile?.primaryPersonality.name].title}</button>)} */}
        <h2>Din Personlighet</h2>
      <div className="result-content">
        <div className="personality-result">
          {profile?.primaryPersonality?.name &&
            valueProfiles[profile.primaryPersonality.name] && (
              <PersonalityCard
                personality={profile.primaryPersonality}
                profile={valueProfiles[profile.primaryPersonality.name]}
                fullProfile={profile}
                testValues={safeTestValues}
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
              onClick={() => setUiStatus((prev) => ({...prev, showHistory: true}))}
            />
          </div>
        </div>

        <div className="btn-show-matches">
          <button
            onClick={() => setUiStatus(prev => ({ ...prev, showBrandList: !prev.showBrandList }))}
            className={uiStatus.showBrandList ? "active btn-small btn-show-matches": "active btn-show-matches"}
          >
            {uiStatus.showBrandList ? "Dölj mina matchningar" : "Utforska mina matchningar"}
          </button>
        </div>

        {uiStatus.showBrandList && (
          <BrandWardrobe
            brands={brands}
            showHidden={uiStatus.showHidden}
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
            testValues={safeTestValues}
            currentBrandList={brands}
          />
        )}

        {/* Community overview (your compact component) */}
        <TribeCommunityOverview token={token} title="Tribes" user={profile}/>

        <OverlayModal isOpen={uiStatus.showHistory} onClose={() => setUiStatus((prev) => ({...prev, showHistory:false}))}>
          <div className="history-list">
            <h3>Tidigare Resultat</h3>
            {history.map((item, idx) => (
              <div key={idx} className="history-entry">
                <p>
                  <strong>{new Date(item.createdAt).toLocaleString()}</strong>
                </p>
                <p>
                  Primär: {item.primaryType} ({item.primaryMatchPercentage}%)
                </p>
                <p>
                  Sekundär: {item.secondaryType} ({item.secondaryMatchPercentage}%)
                </p>
                <p>
                  Tredje: {item.thirdType} ({item.thirdMatchPercentage}%)
                </p>
                <hr />
              </div>
            ))}
          </div>
        </OverlayModal>
      </div>
      </div>
    </>
  );
}

export default ProfilePage;