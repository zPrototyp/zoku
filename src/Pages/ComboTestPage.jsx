import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PersonalityDial from '../Components/PersonalityDial.jsx'
import ValueInfoTooltip from '../Components/ValueInfoTooltip.jsx'
import { useAtom } from 'jotai'
import { guestTokenAtom } from '../Atoms/GuestTokenAtom.jsx'
import { authTokenAtom } from '../Atoms/AuthAtom.jsx'
import { valueProfileAtom } from '../Atoms/ValueProfileAtom.jsx'
import { testValuesAtom } from '../Atoms/TestValuesAtom.jsx'
import { comparisonValueAtom } from '../Atoms/ComparisonValueAtom.jsx'
import '../assets/css/App.css'

import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx'
import ComparisonProfileView from '../Components/ComparisonProfileView.jsx'
import { API_guestGetPersonality, API_getGuestToken, API_updatePersonality } from '../Services/API.jsx'
import SplitPersonalityDial from '../Components/SplitPersonalityDial.jsx'

// Given a link "http://zoku.se/test?changeY=70&compassionX=82" We can collect the values and compare.


function TestPage () {
  
  const [uiState, setUiState] = useState({
      firstInput: true,
      secondImput: false,
      resultMap: false,
      showResultButton: false,
      nextButtonTxt:"Nästa steg",
      nextButtonState: false,
  });
  
  const StepCounter = () => {
    if (uiState.firstInput) {
      return "1 / 3";
    }
    else if (uiState.secondImput) {
      return "2 / 3";
    }
    else if (uiState.resultMap) {
      return "3 / 3";
    }
  }

  const [position, setPosition] = useState({ x: 50, y: 50 })
  const navigate = useNavigate()

  const [sessionToken, setSessionToken] = useAtom(guestTokenAtom)
  const [authToken] = useAtom(authTokenAtom)
  const [profile, setProfile] = useAtom(valueProfileAtom)
  const [testValues, setTestValues] = useAtom(testValuesAtom)
  
  // Get search parameters for comparison
  const [searchParams] = useSearchParams();
  const [friendValues, setFriendValues] = useAtom(comparisonValueAtom);
  const [comparisonProfile, setComparisonProfile] = useAtom(comparisonProfileAtom);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)

  // If friend values are provided in the URL, set them on load
  useEffect(() => {
    if (searchParams.get('changeY') && searchParams.get('compassionX')) {
      setFriendValues({
        changeVsTradition: parseInt(searchParams.get('changeY')),
        compassionVsAmbition: parseInt(searchParams.get('compassionX'))
      });
    }
  }, [searchParams, setFriendValues]);

  // If test values exist (from a profile), use those as starting position
  useEffect(() => {    
    if (profile) {      
      setPosition({
        x: profile.compassionVsAmbition,
        y: profile.changeVsTradition
      })
    } 
  }, [profile])

  // If friend values are set, Fetch their profile to display comparison
  useEffect(() => {
  if (
    sessionToken && 
    friendValues?.changeVsTradition > 0 && 
    friendValues?.compassionVsAmbition > 0
  ) {
     setIsLoadingComparison(true)
      API_guestGetPersonality(sessionToken, friendValues, setComparisonProfile)
        .catch(err => console.error('Error fetching comparison profile:', err))
        .finally(() => setIsLoadingComparison(false))
  }
}, [friendValues, sessionToken]);

  // Get guest token if not logged in and no session token
  useEffect(() => {
    if (!authToken && !sessionToken) {
      API_getGuestToken(setSessionToken)
      .catch(err => console.error('Failed to get session token', err))
      .finally(()=>{
        setProfile(null);
        setTestValues({
          changeVsTradition: 50,
          compassionVsAmbition: 50
        })
      });
    }
  }, [authToken, sessionToken])

  // Handle guest or logged-in submit
  const handleSubmit = async () => {
    const change = Math.round(position.y)
    const compassion = Math.round(position.x)

    setTestValues({
      changeVsTradition: change,
      compassionVsAmbition: compassion
    })

    if (authToken) {
      // Logged-in user -> update profile

      API_updatePersonality(authToken, change, compassion)
        .then(success => {
          if (success) {
            navigate('/profile')
          } else {
            console.error('Misslyckades med att uppdatera personlighet.')
          }
        })
        .catch(err => console.error('Något gick fel vid uppdatering:', err))
    } else {        
      // Otherwise, just show the result
        navigate('/result')
    }
  }

  // console.log(comparisonProfile)

  return (
    <div className='page-content'>
        {/* --- Comparison Profile --- */}
      {isLoadingComparison && <p>Laddar jämförelseprofil...</p>}
      {!isLoadingComparison && comparisonProfile && (
        <ComparisonProfileView profile={comparisonProfile} />
      )}
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2em',
            width: '100%',
            marginBottom: '1.5rem'
          }}
        >
          <h1>
            {authToken && profile
              ? `Redigera personlighetstyp `
              : profile ? `Uppdatera personlighetstyp `:`Upptäck din personlighetstyp `}
              ({StepCounter()})
          </h1>
          <ValueInfoTooltip>
            <p>
              <strong>Gemenskap:</strong> Fokus på samhörighet, relationer och
              empati.
            </p>
            <p>
              <strong>Ambition:</strong> Drivkraft, prestation och personlig
              framgång.
            </p>
            <p>
              <strong>Förändring:</strong> Öppenhet för nya idéer, äventyr och
              frihet.
            </p>
            <p>
              <strong>Tradition:</strong> Värdesätter stabilitet, kultur och
              långsiktighet.
            </p>
          </ValueInfoTooltip>
        </div>

        <SplitPersonalityDial value={position} onChange={setPosition} uiState={uiState} setUiState={setUiState} />

      {uiState.showResultButton && (
        <button onClick={handleSubmit} className='active'>
          {friendValues?.changeVsTradition>0 && 'Jämför oss - '}
          {authToken ? 'Spara ändringar' : 'Visa personlighetstyp'}
        </button>
          )}      
    </div>
    </div>
  )
}

export default TestPage