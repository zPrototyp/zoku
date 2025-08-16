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

    testValues.changeVsTradition > 0 &&
      fetch(`${AZURE_API}/guest/personality-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeVsTradition: testValues.changeVsTradition,
          compassionVsAmbition: testValues.compassionVsAmbition,
          sessionToken: sessionToken
        })
      })
        .then(res => {
          if (!res.ok) throw new Error('Request failed')
          return res.json()
        })
        .then(data => {
          setResult(data.data)
          setLoading(false)
          // console.log('Resultat:', data.data)
                // Guest -> go to result page unless we're doing a comparison
          // if (friendValues.changeVsTradition || friendValues.compassionVsAmbition) {
          //   // If we have friend's values, navigate to comparison page
          //   navigate('/compare');
          // }
          // Left out to make space for dial
        })
        .catch(() => {
          setError('Kunde inte hämta resultat.')
          setLoading(false)
        })

    fetch(`${AZURE_API}/guest/brand-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changeVsTradition: testValues.changeVsTradition,
        compassionVsAmbition: testValues.compassionVsAmbition,
        sessionToken: sessionToken,
        category: 'all',
        variations: 3
      })
    })
      .then(result => {
        if (!result.ok) throw new Error('Brand matches request failed')
        return result.json()
      })
      .then(data => {
        setFeedList(data.data) // Update the feedList atom with brand matchess
        // console.log("Brand matches:", data.data);
      })
      .catch(error => {
        console.error('Error fetching brand matches:', error)
      })
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

  const { primaryPersonality, secondaryPersonality, thirdPersonality } = result

  // Comparison between "new" user and "shared" user
  const hasFriendVals =
    typeof friendValues?.compassionVsAmbition === 'number' &&
    typeof friendValues?.changeVsTradition === 'number' &&
    (friendValues.compassionVsAmbition > 0 || friendValues.changeVsTradition > 0)

  // New
  const dialA = hasFriendVals ?
  {
    name: 'Du',
    compassionVsAmbition: result.compassionVsAmbition,
    changeVsTradition: result.changeVsTradition,
    primaryPersonality: result.primaryPersonality
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
          <h2 style={{ marginBottom: '.5rem' }}>Jämförelse</h2>
          <CelebrityComparisonDial a={dialA} b={dialB} aLabel="Du" bLabel="Vän" size={260} />
        </div>
      )}

      {/* Primary Personality Card */}
      <PersonalityCard
        personality={primaryPersonality}
        profile={valueProfiles[primaryPersonality.name]}
        testValues={testValues}
        highlight
      />

      {/* Secondary + Third Personality Cards */}
      <div className='secondary-container'>
        <SecondaryPersonalityCard
          personality={secondaryPersonality}
          profile={valueProfiles[secondaryPersonality.name]}
        />
        <SecondaryPersonalityCard
          personality={thirdPersonality}
          profile={valueProfiles[thirdPersonality.name]}
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
