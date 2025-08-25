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
import apiService, { API_getCelebrities, API_getPopularCelebrities } from '../Services/API.jsx'
import CelebrityCard from '../Components/CelebrityCard'

function ResultPage () {
  const testValues = useAtomValue(testValuesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState(null)
  const [result, setResult] = useAtom(valueProfileAtom)
  const friendValues = useAtomValue(comparisonValueAtom)
  const friendProfile = useAtomValue(comparisonProfileAtom)
  const [uiStatus, setUiStatus] = useState({
    isLoading: true,
    error: null,
    showBrandList: false,
  })

  // Added sessionToken for sending to backend
  const sessionToken = useAtomValue(guestTokenAtom)
  const [feedList, setFeedList] = useAtom(feedListAtom)
  const [topCelebs, setTopCelebs] = useState([])

  useEffect(() => {
    if (
      typeof testValues?.changeVsTradition !== 'number' ||
      typeof testValues?.compassionVsAmbition !== 'number' ||
      !sessionToken
    ) return;

    const fetchData = async () => {
      try {
        setUiStatus(prev => ({ ...prev, isLoading: true, error: null }));

        await API_guestGetPersonality(sessionToken, testValues, setResult);
        await API_guestGetBrandMatches(sessionToken, testValues, setFeedList, 'all', 3);

        let celebs = [];
        const primaryName = (result?.primaryPersonality?.name) ?? null;

        if (primaryName)
        {
          const response = await apiService.getCelebrities({ personality: primaryName, page: 1, pageSize: 3 });
          celebs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
        }
        else
        {
          const response = await apiService.getPopularCelebrities(3);
          celebs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
        }

        if (!celebs || celebs.length === 0)
        {
          if (primaryName)
          {
            celebs = await API_getCelebrities({ personality: primaryName, pageSize: 3 });
          }
          else
          {
            celebs = await API_getPopularCelebrities(3);
          }
        }

        setTopCelebs(celebs || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        // setError('Kunde inte hämta resultat.');
        setUiStatus(prev => ({ ...prev, error: err.message || 'Kunde inte hämta resultat.' }));
      } finally {
        setUiStatus(prev => ({ ...prev, isLoading: false }));
        // setLoading(false);
      }
    };

    fetchData();
  }, [testValues, sessionToken, setResult, setFeedList, result?.primaryPersonality?.name]);

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

    const {
      primaryPersonality = null,
      secondaryPersonality = null,
      thirdPersonality = null
    } = result || {}
    
  return (
    <div className='result-page'>
      {/* Comparison dial */}
      {hasFriend && dialA && dialB && (
        <div className="comparison-inline" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ marginBottom: '.5rem' }}>Jämförelse {calculateMatchPercentage(friendValues, testValues)}% match</h2>
          <CelebrityComparisonDial a={dialA} b={dialB} aLabel="Du" bLabel="Vän" size={260} />
        </div>
      )}


      {/* Primary Personality Card */}
      <PersonalityCard
        personality={primaryPersonality}
        profile={valueProfiles[primaryPersonality?.name]}
        testValues={testValues}
        highlight
      />

      {/* Secondary + Third Personality Cards */}
      {!uiStatus.showBrandList && <div className='secondary-container'>
        <SecondaryPersonalityCard
          personality={secondaryPersonality}
          profile={valueProfiles[secondaryPersonality?.name]}
        />
        <SecondaryPersonalityCard
          personality={thirdPersonality}
          profile={valueProfiles[thirdPersonality?.name]}
        />
      </div>}

      {/* Top 3 celebrity matches (from public controller) */}
      {/* FIX: show celeb matches only when matches view is toggled */}
      {uiStatus.showBrandList && topCelebs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 1000 }}>
          <h2 style={{ marginTop: '1.5rem' }}>Topp 3 kändismatchningar</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {topCelebs.map((celeb) => (
              <CelebrityCard
                key={celeb.id || celeb.name}
                celeb={celeb}
                user={{
                  compassionVsAmbition: testValues.compassionVsAmbition,
                  changeVsTradition: testValues.changeVsTradition,
                  primaryPersonality: result?.primaryPersonality
                }}
                celebBrands={celeb?.brands || []} // if present in DTO
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setUiStatus(prev => ({ ...prev, showBrandList: !prev.showBrandList }))}
        className={uiStatus.showBrandList ? "active btn-small": "active"}
      >
        {uiStatus.showBrandList ? "Dölj varumärken": "Utforska mina matchningar"}
      </button>
      {/* Brand list */}
      {uiStatus.showBrandList && feedList && feedList.length > 0 && (
        <div className='brand-list'>
          <h2>Varumärken som matchar din personlighet</h2>

          <BrandCards brandList={feedList} />
        </div>
      )}

      <button
        onClick={() => navigate('/register', { state: result })}
        className='active'
      >
        Spara och fortsätt
      </button>
    </div>
  )
}

export default ResultPage