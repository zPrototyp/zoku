import { useParams } from "react-router-dom";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";

function FBShareProfiles(){
    const {profile, changeY, compassionX} = useParams();
    const {title, subtitle, consumerText} = valueProfiles[profile]
    const url="https://zprototyp.github.io/zoku/#/"
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
        </a>

    </div>
    )
}

export default FBShareProfiles;