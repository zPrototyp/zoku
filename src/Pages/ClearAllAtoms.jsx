import React from 'react';
import { useAtom } from 'jotai';
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom.jsx";
import { testValuesAtom } from "../Atoms/TestValuesAtom.jsx";
import { feedListAtom } from "../Atoms/FeedListAtom.jsx";
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import { ZokuMasks } from '../assets/uiData/PersonalityImages.js';
import {valueProfiles} from '../assets/uiData/zoku_profiles_se.js';
import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx';
import { comparisonValueAtom } from '../Atoms/ComparisonValueAtom.jsx';

function ClearAllAtoms() {
    const [profile, setProfile] = useAtom(valueProfileAtom);
    const [feed, setFeed] = useAtom(feedListAtom);
    const [testValue, setTestValue] = useAtom(testValuesAtom);
    const [guestToken, setGuestToken] = useAtom(guestTokenAtom);
    const[authToken, setAuthToken] = useAtom(authTokenAtom);
    const [comparisonProfile, setComparisonProfile] = useAtom(comparisonProfileAtom);
    const [friendValues, setFriendValues] = useAtom(comparisonValueAtom);

    
    
    const listOrder= [
      "Advocate",
      "Adventurer",
      "Idealist", 
      "Achiever", 
      "Strategist", 
      "Guardian", 
      "Traditionalist", 
      "Caregiver"
    ];
    
    function ZokuShareCards() {
      return (
        listOrder.map((profile, index) => 
          
          (
            <div className="zokuProfilePopup" key={index} style={{
              backgroundColor:"#E1CA9C",
              borderRadius: "10px",
              marginBottom: "20px",
                padding: "10px",
              }}>
            <div className="zokuProfilePopupHeader">
                <img className="mask100" src={ZokuMasks[profile]} alt={valueProfiles[profile].title} />
                <h2>{valueProfiles[profile].title} </h2>            
                <h2>{valueProfiles[profile].kanji} </h2>
            </div>
            <p>{valueProfiles[profile].subtitle}</p>

            <h3>{valueProfiles[profile].consumerHeader}</h3>
            <p>{valueProfiles[profile].consumerText}</p>

              {/* If logged in - show link to compare yourself, if not - link to test */}
            <div>
                
                    <button>Vad är din Zoku?</button>
                
            </div>
          </div>
            )
          )
        )
      }
      
      
      // Clear all atoms
      
      return (
        <div className="page-content" style={{width:"400px", overflow: "clip"}}>
        <button onClick={() => {
            setProfile(null);
            setFeed(null);
            setTestValue( null);
            setGuestToken(null);
            setAuthToken(null);
            setComparisonProfile(null);
            setFriendValues(null);

            console.log("All atoms cleared");
            
        }}>
            Clear All Atoms
        </button>
            <p>Profile: {profile?.primaryPersonality?.name}</p>
            <p>Feed: {feed?.length}</p>
            <p>Test Values: {testValue?.changeVsTradition}</p>
            <p>Guest Token: {guestToken?.length}</p>
            <p>Token: {authToken?.length}</p> 
            <p>ComparisonProfile: {comparisonProfile?.primaryPersonality?.name}</p>
            <p>Friend Values: {friendValues?.changeVsTradition}</p>


<h1>.</h1>
            <div>

<ZokuShareCards />

            </div>


        </div>
    )

}
export default ClearAllAtoms;