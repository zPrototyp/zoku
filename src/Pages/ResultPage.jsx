import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../assets/css/App.css'
import { valueProfiles } from '../assets/uiData/zoku_profiles_se'
import PersonalityCard from '../Components/PersonalityCard'
import SecondaryPersonalityCard from '../Components/SecondaryPersonalityCard'
import { useAtom, useAtomValue } from 'jotai/react'
import { valueProfileAtom } from '../Atoms/ValueProfileAtom'
import { guestTokenAtom } from '../Atoms/GuestTokenAtom.jsx'
import { testValuesAtom } from '../Atoms/TestValuesAtom.jsx'
import { feedListAtom } from '../Atoms/FeedListAtom.jsx'
import { comparisonValueAtom } from '../Atoms/ComparisonValueAtom.jsx'
import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx'
import CelebrityComparisonDial from '../Components/CelebrityComparisonDial.jsx'
import BrandCards from '../Components/BrandCards'
import { calculateMatchPercentage } from '../Services/type-calculation.js'
import { API_guestGetBrandMatches, API_guestGetPersonality } from '../Services/API.jsx'
import { CreateComparisonDials } from '../Components/CreateComparisonDials.jsx'
import { ApiService, API_getCelebrities, API_getPopularCelebrities } from '../Services/API.jsx'
import CelebrityCard from '../Components/CelebrityCard'
import { FaPen, FaClock } from 'react-icons/fa' // added icons
import RandomBrand from '../Components/RandomBrand.jsx'

// Create a local instance since API.jsx exports the class, not a default singleton
const apiService = new ApiService();

function ResultPage () {
  const testValues = useAtomValue(testValuesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useAtom(valueProfileAtom)
  const friendValues = useAtomValue(comparisonValueAtom)
  const friendProfile = useAtomValue(comparisonProfileAtom)
  const [uiStatus, setUiStatus] = useState({
    isLoading: true,
    error: null,
    showBrandList: false,
    showComparison: false,
  })

  // Added sessionToken for sending to backend
  const sessionToken = useAtomValue(guestTokenAtom)
  const [feedList, setFeedList] = useAtom(feedListAtom)
  const [topCelebs, setTopCelebs] = useState([])
  const [showHistory, setShowHistory] = useState(false) // for FaClock handler

  useEffect(() => {
    if (
      typeof testValues?.changeVsTradition !== 'number' ||
      typeof testValues?.compassionVsAmbition !== 'number' ||
      !sessionToken
    ) return;

    const fetchPersonalityAndBrands = async () => {
      try {
        setUiStatus(prev => ({ ...prev, isLoading: true, error: null }));

        await API_guestGetPersonality(sessionToken, testValues, setResult);
        await API_guestGetBrandMatches(sessionToken, testValues, setFeedList, 'all', 3);
      } catch (err) {
        console.error('Error fetching data:', err);
        // setError('Kunde inte hämta resultat.');
        setUiStatus(prev => ({ ...prev, error: err.message || 'Kunde inte hämta resultat.' }));
      } finally {
        setUiStatus(prev => ({ ...prev, isLoading: false }));
        // setLoading(false);
      }
    };

    fetchPersonalityAndBrands();
  }, [testValues, sessionToken, setResult, setFeedList]);

  // Fetch celebrities after personality is known (separate effect avoids refetch loops)
  useEffect(() => {
    const fetchCelebs = async () => {
      try {
        const primaryName = result?.primaryPersonality?.name ?? null;

        // 1) Try personality-filtered via ApiService instance
        let celebs = [];
        if (primaryName) {
          const response = await apiService.getCelebrities({ personality: primaryName, page: 1, pageSize: 3 });
          celebs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
        }

        // 2) If still empty, try helper with same filter
        if ((!celebs || celebs.length === 0) && primaryName) {
          celebs = await API_getCelebrities({ personality: primaryName, pageSize: 3 });
        }

        // 3) If still empty, fall back to popular (instance)
        if (!celebs || celebs.length === 0) {
          const popRes = await apiService.getPopularCelebrities(3);
          celebs = Array.isArray(popRes?.data) ? popRes.data : popRes?.data?.data || [];
        }

        // 4) If instance failed, use helper popular
        if (!celebs || celebs.length === 0) {
          celebs = await API_getPopularCelebrities(3);
        }

        setTopCelebs(celebs || []);
      } catch (err) {
        console.error('Error fetching celebrities:', err);
        setTopCelebs([]); // ensure stable UI
      }
    };

    // run once we have either a result or as a popular fallback
    fetchCelebs();
  }, [result?.primaryPersonality?.name]);

 // derive comparison dials with memoization
  const { dialA, dialB, hasFriend } = useMemo(() => {
    if (!result) return { dialA: null, dialB: null, hasFriend: false }
    return CreateComparisonDials({ friendValues, friendProfile, profile: result })
  }, [friendValues, friendProfile, result])


  if (uiStatus.isLoading)
    return (
      <div className='result-page'>
        <p>Laddar resultat...</p>
      </div>
    )
  if (uiStatus.error)
    return (
      <div className='result-page'>
        <p style={{ color: 'red' }}>{uiStatus.error}</p>
      </div>
    )

    
  return (
    <>
      <div className="page-content" style={{ position: "relative" }}>
        {uiStatus.showComparison && hasFriend && dialA && dialB && (
          <div className="comparison-inline" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ marginBottom: '.5rem' }}>Jämförelse {calculateMatchPercentage(friendValues, testValues)}% match</h2>
            <CelebrityComparisonDial a={dialA} b={dialB} aLabel="Du" bLabel="Vän" size={260} />
            <button style={{fontSize:"1.2em"}} onClick={() => setUiStatus(prev => ({ ...prev, showComparison: !prev.showComparison }))}>Dölj jämförelse</button>
          </div>
          )}
        {!uiStatus.showComparison && hasFriend && (<button style={{fontSize:"1.2em"}} onClick={()=>setShowComparison(p=> !p)}>Visa jämförelse med {valueProfiles[friendProfile?.primaryPersonality.name].title}</button>)}
        <h2>Din Personlighet</h2>

        <div className="personality-result">
          {result?.primaryPersonality?.name &&
            valueProfiles[result.primaryPersonality.name] && (
              <PersonalityCard
                personality={result.primaryPersonality}
                profile={valueProfiles[result.primaryPersonality.name]}
                fullProfile={result}
                testValues={testValues}
                highlight
              />
            )}

          <div className="secondary-container">
            {result?.secondaryPersonality?.name &&
              valueProfiles[result.secondaryPersonality.name] && (
                <SecondaryPersonalityCard
                  personality={result.secondaryPersonality}
                  profile={valueProfiles[result.secondaryPersonality.name]}
                />
              )}

            {result?.thirdPersonality?.name &&
              valueProfiles[result.thirdPersonality.name] && (
                <SecondaryPersonalityCard
                  personality={result.thirdPersonality}
                  profile={valueProfiles[result.thirdPersonality.name]}
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

        {/* Top 3 celebrity matches (from public controller) */}
        {uiStatus.showBrandList && topCelebs.length > 0 && (
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <h2 style={{ marginTop: '1.5rem' }}>Topp 3 kändismatchningar</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {topCelebs.map((celeb) => (
                <CelebrityCard
                  key={celeb.id || celeb.name}
                  celeb={celeb}
                  user={result}
                  celebBrands={celeb?.brands || []}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional: friendly empty state if no celebs */}
        {uiStatus.showBrandList && topCelebs.length === 0 && (
          <p style={{ opacity: 0.8, marginTop: '1rem' }}>
            Inga kändismatchningar hittades för din profil ännu.
          </p>
        )}

        {/* Brand list */}
        {uiStatus.showBrandList && feedList && feedList.length > 0 && (
          <div className='brand-list'>
            <h2>Varumärken som matchar din personlighet</h2>
            <BrandCards brandList={feedList} categorize={true} />
          </div>
        )}

        {/* Optional: friendly empty state if no brands */}
        {uiStatus.showBrandList && (!feedList || feedList.length === 0) && (
          <p style={{ opacity: 0.8, marginTop: '1rem' }}>
            Inga varumärken matchade just nu—prova igen senare.
          </p>
        )}

        {uiStatus.showBrandList &&  <RandomBrand category="all" 
          bearer={sessionToken} 
          testValues={testValues} 
          currentBrandList={feedList} />
        }

        <button
          onClick={() => navigate('/register', { state: result })}
          className='active'
        >
          Spara och fortsätt
        </button>
      </div>
    </>
  )
}

export default ResultPage