import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { valueProfileAtom } from '../Atoms/ValueProfileAtom';
import { calculateMatchPercentage } from '../Services/type-calculation';
import ResultPage from './ResultPage.jsx';
import ComparisonProfileView from '../Components/ComparisonProfileView.jsx';
import { comparisonProfileAtom } from '../Atoms/ComparisonProfileAtom.jsx';


export default function CompareProfilesPage( ){
    const [valueProfile , setValueProfile] = useAtom(valueProfileAtom);
    const [friendProfile, setFriendProfile] = useAtom(comparisonProfileAtom);
    let match;

// Fetch the comparison result from the backend (mockup for now)
if (friendProfile.changeVsTradition )
    match = calculateMatchPercentage(friendProfile, valueProfile);


return (
    <>
<div 
className='page-content'
>

<h2>{match}% match</h2>
<h3>Dem: {friendProfile.primaryPersonality.name} och Dig: {valueProfile.primaryPersonality.name}</h3>
{/* <ComparisonProfileView profile={friendProfile} /> */}

</div>
<ResultPage />
</>
)

}