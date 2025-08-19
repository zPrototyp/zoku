import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../assets/css/App.css'
import { valueProfiles } from '../assets/uiData/zoku_profiles_se'
import PersonalityCard from '../Components/PersonalityCard'
import SecondaryPersonalityCard from '../Components/SecondaryPersonalityCard'
import { useAtom } from 'jotai/react'
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
const AZURE_API = import.meta.env.VITE_AZURE_API;

function ResultPage () {
  const [testValues, setTestValues] = useAtom(testValuesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useAtom(valueProfileAtom)
  const [error, setError] = useState(null)
  // const { x, y } = { x: 50, y: 50 };
  const [friendValues, ] = useAtom(comparisonValueAtom)
  const [friendProfile, ] = useAtom(comparisonProfileAtom)

  // Added sessionToken for sending to backend
  const [sessionToken, setSessionToken] = useAtom(guestTokenAtom)
  const [feedList, setFeedList] = useAtom(feedListAtom)

  useEffect(() => {
    if (
      typeof testValues.changeVsTradition !== 'number' ||
      typeof testValues.compassionVsAmbition !== 'number' ||
      !sessionToken
    )
      return

    if (testValues.changeVsTradition > 0) {
      setLoading(true);
      try {
        // Fetch personality data using the API helper function
        API_guestGetPersonality(sessionToken, testValues, setResult);
      } catch (err) {
        console.error('Error fetching personality data:', err);
        setError('Kunde inte hämta resultat.');
        setLoading(false);
        return;
      }
    
    // Fetch brand matches using the API helper function
      try {
        API_guestGetBrandMatches(sessionToken, testValues, setFeedList, 'all', 3);
      } catch (err) {
        console.error('Error fetching brand matches:', err);
        setError('Kunde inte hämta varumärken.');
        setLoading(false);
        return;
      }
      setLoading(false)
    }

  }, [testValues, sessionToken])



  if (loading)
    return (
      <div className='result-page'>
        <p>Laddar resultat...</p>
      </div>
    )
  if (error)
    return (
      <div className='result-page'>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )


  const {
    primaryPersonality = null,
    secondaryPersonality = null,
    thirdPersonality = null
  } = result || {}

  // Comparison between "new" user and "shared" user
  const hasFriendVals =
    typeof friendValues?.compassionVsAmbition === 'number' &&
    typeof friendValues?.changeVsTradition === 'number' &&
    (friendValues.compassionVsAmbition > 0 || friendValues.changeVsTradition > 0)

  // New
  const dialA = hasFriendVals ?
  {
    name: 'Du',
    compassionVsAmbition: result?.compassionVsAmbition,
    changeVsTradition: result?.changeVsTradition,
    primaryPersonality: result?.primaryPersonality
  } : null

// Shared
  const dialB = hasFriendVals
    ? (friendProfile
        ? { name: 'Vän', ...friendProfile }
        : {
            name: 'Vän',
            compassionVsAmbition: friendValues.compassionVsAmbition,
            changeVsTradition: friendValues.changeVsTradition
          })
    : null


  return (
    <div className='result-page'>
      {/* Comparison dial */}
      {hasFriendVals && dialA && dialB && (
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
      <div className='secondary-container'>
        <SecondaryPersonalityCard
          personality={secondaryPersonality}
          profile={valueProfiles[secondaryPersonality?.name]}
        />
        <SecondaryPersonalityCard
          personality={thirdPersonality}
          profile={valueProfiles[thirdPersonality?.name]}
        />
      </div>

      {/* Brand list */}
      {feedList && feedList.length > 0 && (
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
