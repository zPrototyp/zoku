import React from 'react';
import { useAtom } from 'jotai';
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom.jsx";
import { testValuesAtom } from "../Atoms/TestValuesAtom.jsx";
import { feedListAtom } from "../Atoms/FeedListAtom.jsx";
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';

function ClearAllAtoms() {
    const [profile, setProfile] = useAtom(valueProfileAtom);
    const [feed, setFeed] = useAtom(feedListAtom);
    const [testValue, setTestValue] = useAtom(testValuesAtom);
    const [guestToken, setGuestToken] = useAtom(guestTokenAtom);
    const[authToken, setAuthToken] = useAtom(authTokenAtom);

    // Clear all atoms
    console.log(profile, feed, testValue, guestToken, authToken);

    return (
        <div className="page-content" style={{width:"400px", overflow: "clip"}}>
        <button onClick={() => {
            setProfile(null);
            setFeed(null);
    
            setTestValue( null);
            setGuestToken(null);
            setAuthToken(null);
            console.log("All atoms cleared");
            console.log(profile, feed, testValue, guestToken, authToken);
        }}>
            Clear All Atoms
        </button>
            <p>Profile: {profile?.primaryPersonality?.name}</p>
            <p>Feed: {feed?.length}</p>
            <p>Test Values: {testValue?.changeVsTradition}</p>
            <p>Guest Token: {guestToken?.length}</p>
            <p>Token: {authToken?.length}</p> 

        </div>
    )

}
export default ClearAllAtoms;