import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";

function ComparisonProfileView({profile}){
    // console.log(profile);
    return (<>
    

    <div className="comparison-profile-display">
        <h2>Deras värderingar:</h2>
        <SecondaryPersonalityCard
          personality={profile.primaryPersonality}
          profile={valueProfiles[profile.primaryPersonality.name]}
        />
        <SecondaryPersonalityCard
          personality={profile.secondaryPersonality}
          profile={valueProfiles[profile.secondaryPersonality.name]}
        />
        <SecondaryPersonalityCard
          personality={profile.thirdPersonality}
          profile={valueProfiles[profile.thirdPersonality.name]}
        />
    </div>
    </>)
}

export default ComparisonProfileView;