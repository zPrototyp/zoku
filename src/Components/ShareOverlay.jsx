import { useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import "../assets/css/SharingOverlay.css";

import { FaSquareFacebook , FaInstagram , FaTiktok } from "react-icons/fa6";
import { useNavigate } from "react-router";

import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom";
import { API_shareProfile } from "../Services/API";

export function ShareOverlay({personality, profile, testValues, brand}){
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const url = "https://zprototyp.github.io/zoku";
    const token = useAtomValue(authTokenAtom);
    const sessionToken = useAtomValue(guestTokenAtom);
    const bearer = token || sessionToken;

    const shareInstagramStory = () => {
        let sharedImage="";
        if (brand){
            sharedImage = `${url}/${profile.imageUrl ? profile.imageUrl :`dummy-brand_${profile.category}.jpg`}`;
                    
        } else {    
            sharedImage =  `${url}/zoku_${personality.name}.png`;
        }
        const backgroundImageUrl = encodeURIComponent(
            sharedImage
        );
    
        const deepLink = `instagram-stories://share?source_application=zoku&backgroundImage=${backgroundImageUrl}`;
        const fallback = "https://www.instagram.com/";
        // Try to open Instagram Stories
        window.location.href = deepLink ;

        console.log(sharedImage, deepLink)
        // Fallback after 800ms
        setTimeout(() => {
             window.location.href = fallback;
        }, 800);
        setExpanded(false);
    };

    function handleFbShare(){
        // send to backend
        API_shareProfile("facebook", bearer);
        
        let shareUrl="";
        let quote="";
        if (brand) {
            // console.log(personality, profile)
            shareUrl=`${url}/${profile.imageUrl ? profile.imageUrl :`dummy-brand_${profile.category}.jpg`}`;
            quote=`Varumärket ${profile.name} matchar mina värderingar till ${profile.matchPercentage}%`;
        } else {
            shareUrl = `${url}/${personality.name}.html?changeY=${testValues?.changeVsTradition}&compassionX=${testValues?.compassionVsAmbition}`; // URL you're sharing
            quote =  `Jag är ${personality.matchPercentage}% ${profile.title} - vad är din Zoku?`; // short text block
        }

        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
        )}&quote=${encodeURIComponent(quote)}`;
        
        // console.log(facebookUrl);

        window.open(facebookUrl, "_blank", "width=600,height=900");
        setExpanded(false);
    }



    return (
      <div className={`share-profile${expanded ? " expanded": ""}${brand ? " brand-share": ""}`}>
        
        {expanded && (
            <div className="share-icons">
                <FaSquareFacebook
                    title="Dela på facebook"
                    className="clickable-icon share-icon"
                    onClick={() => handleFbShare()}
                    />
                <FaInstagram
                    title="Dela på instagram"
                    className="clickable-icon share-icon"
                    onClick={()=>shareInstagramStory()}
                    />
                {/* <FaTiktok 
                    title="Dela på TikTok"
                    className="clickable-icon share-icon" /> */}
            </div>            
        ) }
        <FaShareAlt
          title={brand ? "Dela varumärket": "Dela min profil"}
          className="clickable-icon share-button"
          onClick={()=>setExpanded(prev => !prev)} />
      </div>
      )
}
