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
            <p>Profile: <strong>{profile?.primaryPersonality?.name}</strong></p>
            <p>Feed: <strong>{feed?.length}</strong></p>
            <p>Test Values: <strong>{testValue?.changeVsTradition ? "yes": "no"}</strong></p>
            <p>Guest Token: <strong>{guestToken?.length > 0 ? "Yes": "No"}</strong></p>
            <p>Token: <strong>{authToken?.length > 0 ? "Yes": "No"}</strong></p>
            <p>ComparisonProfile:<strong> {comparisonProfile?.primaryPersonality?.name}</strong></p>
            <p>Friend Values:<strong> {friendValues?.changeVsTradition ? "Yes": "no"}</strong></p>

            <div>

            {/* <ZokuShareCards /> */}

            </div>


        </div>
    )

}
export default ClearAllAtoms;