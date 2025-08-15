import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonalityDial from '../Components/PersonalityDial'
import ValueInfoTooltip from '../Components/ValueInfoTooltip'
import { useAtom } from 'jotai'
import { guestTokenAtom } from '../Atoms/GuestTokenAtom.jsx'
import { authTokenAtom } from '../Atoms/AuthAtom.jsx'
import { valueProfileAtom } from '../Atoms/ValueProfileAtom.jsx'
import { testValuesAtom } from '../Atoms/TestValuesAtom.jsx'
import { comparisonValueAtom } from '../Atoms/ComparisonValueAtom.jsx'
import '../assets/css/App.css'

// Start coding to make a comparison with a friend's Identity
import { useSearchParams } from 'react-router-dom';
import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx'
import ComparisonProfileView from '../Components/ComparisonProfileView.jsx'
// Given a link "http://zoku.se/test?changeY=70&compassionX=82" We can collect the values and compare.

function TestPage () {
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

  // If test values exist (from profile or result), use those as starting position
  useEffect(() => {    
  // If friend values are provided in the URL, set them
  setFriendValues({
      changeVsTradition: searchParams.get('changeY') ? parseInt(searchParams.get('changeY')) : 0,
      compassionVsAmbition: searchParams.get('compassionX') ? parseInt(searchParams.get('compassionX')) : 0
    });
    if (profile) {      
      setPosition({
        x: profile.compassionVsAmbition,
        y: profile.changeVsTradition
      })
    } 
  }, [profile])
  useEffect(()=>{
    friendValues.changeVsTradition > 0 && friendValues.compassionVsAmbition > 0 && (
      fetch('/api/guest/personality-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeVsTradition: friendValues.changeVsTradition,
          compassionVsAmbition: friendValues.compassionVsAmbition,
          sessionToken: sessionToken
        })
         }).then(res => {
          if (!res.ok) throw new Error('Request failed')
          return res.json()
        })
        .then(data => {
          setComparisonProfile(data.data)
        }).catch(err=>{
          console.error('Kunde inte hämta resultat.');
        })
      )
  },[friendValues]);

  // Get guest token if not logged in and no session token
  useEffect(() => {
    if (!authToken && !sessionToken) {
      fetch('/api/guest/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionToken(data.data.sessionToken)
            setProfile(null);
            setTestValues({
              changeVsTradition: 50,
              compassionVsAmbition: 50
            })
          }
        })
        .catch(err => console.error('Failed to get session token', err))
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
      try {
        const res = await fetch('/api/user/personality', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            changeVsTradition: change,
            compassionVsAmbition: compassion
          })
        })

        const data = await res.json()

        if (res.ok && data.success) {
          navigate('/profile')
        } else {
          console.error(
            data.message || 'Misslyckades med att uppdatera personlighet.'
          )
        }
      } catch (err) {
        console.error('Något gick fel vid uppdatering:', err)
      }
    } else {        
      // Otherwise, just show the result
        navigate('/result')
    }
  }

  // console.log(comparisonProfile)

  return (
    <div className='page-content'>
      {comparisonProfile != null && (<ComparisonProfileView profile={comparisonProfile}/>)}
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
            {authToken
              ? 'Redigera dina värderingar'
              : 'Vad är dina värderingar?'}
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

        <PersonalityDial value={position} onChange={setPosition} />

        <button onClick={handleSubmit} className='active'>
          {friendValues?.changeVsTradition>0 && 'Jämför oss - '}
          {authToken ? 'Spara ändringar' : 'Visa Resultat'}
        </button>
      </div>
    </div>
  )
}

export default TestPage