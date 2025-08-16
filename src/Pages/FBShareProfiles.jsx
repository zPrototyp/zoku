import { useSearchParams } from "react-router-dom";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";

function FBShareProfiles(){
    const [searchParams] = useSearchParams();

    const profile = searchParams.get("profile");
    const changeY = searchParams.get("changeY");
    const compassionX = searchParams.get("compassionX");
    const fb = searchParams.get('fbclid');

    const {title, subtitle, consumerText} = valueProfiles[profile]
    const url="https://zprototyp.github.io/zoku/"
    const zoku_profile_img = `/zoku_${profile}.png`;
    // console.log(title, subtitle, consumerText);
    return (
        <div className="page-content">
        <meta property="og:image" content={`${url}${zoku_profile_img}`} />
        <meta property="og:title" content={`Jag är ${title} - ${subtitle}. Vad är du?`} />
        <meta property="og:description" content={consumerText} />
        <meta property="og:url" content={`${url}/test?changeY=${changeY}&compassionX=${compassionX}`} />
    
        
        <p>{`Jag är ${title} - ${subtitle}.`}</p> 
        <p>Vad är du?</p>
        <p>{consumerText}</p>
        <a href={`${url}/test?changeY=${changeY}&compassionX=${compassionX}`}>
        <img src={zoku_profile_img} />
        <img src={ZokuMasks[profile]} />
        </a>

    </div>
    )
}

export default FBShareProfiles;