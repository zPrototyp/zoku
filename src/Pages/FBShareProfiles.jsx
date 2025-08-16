import { useSearchParams } from "react-router-dom";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
import { Link } from "react-router-dom";

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
        <p>{consumerText}</p>
        <p>Vad är du? Jämför oss</p>
        <Link to={`/test?changeY=${changeY}&compassionX=${compassionX}`}>
        
        
        <img className="mask100" src={ZokuMasks[profile]} />
        

        </Link>

    </div>
    )
}

export default FBShareProfiles;