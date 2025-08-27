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
import { FaPen, FaClock} from "react-icons/fa";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { testValuesAtom } from "../Atoms/TestValuesAtom";
import { API_userSafeFetchJson } from "../Services/API";
import TribeCommunity from "../Components/TribeCommunity";
import RandomBrand from "../Components/RandomBrand";

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
  const [showHistory, setShowHistory] = useState(false);
  const [hiddenBrands, setHiddenBrands] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [token] = useAtom(authTokenAtom);
  const navigate = useNavigate();
  const [uiStatus, setUiStatus] = useState({
      showBrandList: false,
    })

  // const [friendValues] = useAtom(comparisonValueAtom)
  // const [friendProfile] = useAtom(comparisonProfileAtom)
  // const [showComparison, setShowComparison] = useState(false);

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
    }
  }, [profile]);

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

  // const { dialA, dialB, hasFriend } = useMemo(() => {
  //   if (!profile) return { dialA: null, dialB: null, hasFriend: false }
  //   return CreateComparisonDials({ friendValues, friendProfile, profile })
  // }, [friendValues, friendProfile, profile])

  if (error) return <div className="page-content"><p style={{ color: "red" }}>{error}</p></div>;
  if (!profile) return <div className="page-content"><p>Laddar profil...</p></div>;

  // Profile does not contain a userID to set.
  const userId = profile?.userId || profile?.id || null;

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
            onClick={() => setUiStatus(prev => ({ ...prev, showBrandList: !prev.showBrandList }))}
            className={uiStatus.showBrandList ? "active btn-small": "active"}
          >
            {uiStatus.showBrandList ? "Dölj mina matchningar": "Utforska mina matchningar"}
          </button>
        </div>
        {uiStatus.showBrandList && <BrandWardrobe
          brands={brands}
          showHidden={showHidden}
          hiddenBrands={hiddenBrands}
          setHiddenBrands={setHiddenBrands}
          handleShowHidden={handleShowHidden}
        />}

        {!uiStatus.showBrandList &&  
                <RandomBrand category="all" 
                  bearer={token}
                  user={profile}
                  testValues={testValues} 
                  currentBrandList={brands} />
                }
        

        {/* Tribes: Liked celebs + Following users */}
        {uiStatus.showBrandList && <TribeCommunity token={token} user={profile} title="Tribes" />}

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

      </div> 
    </>
  );
}

export default ProfilePage;