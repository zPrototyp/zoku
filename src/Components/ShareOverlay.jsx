import { useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import "../assets/css/SharingOverlay.css";

import { FaSquareFacebook , FaInstagram , FaTiktok } from "react-icons/fa6";
import { useNavigate } from "react-router";

import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom";
import { API_shareProfile } from "../Services/API";
import OverlayModal from "./OverlayModal";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";

export function ShareOverlay({personality, profile, testValues, brand}){
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const url = "https://zprototyp.github.io/zoku";
    const token = useAtomValue(authTokenAtom);
    const sessionToken = useAtomValue(guestTokenAtom);
    const bearer = token? token : sessionToken;
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);
    const openShare = (profile) => {
        setActiveModal(profile);
        
    }

    let sharedImage="";
    if (brand){
        sharedImage = `${url}/${profile.imageUrl ? profile.imageUrl :`dummy-brand_${profile.category}.jpg`}`;
                
    } else {    
        sharedImage =  `${url}/zoku_${personality.name}.png`;
    }
    

    const copyText = async (text) => {
        try {
        await navigator.clipboard.writeText(text);
        alert("Text kopierad till urklipp!");
        } catch (err) {
        console.error("Failed to copy: ", err);
        }
    };

const copyImage = async (img) => {
    try {
      const response = await fetch(img); // image in public/wwwroot
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      alert("Image copied!");
    } catch (err) {
      console.error("Failed to copy image: ", err);
    }
  };


    const shareInstagramStory = async () => {

        const shareData = await API_shareProfile("Instagram", bearer, brand ? "Brand":"Personality");
        
    
        const backgroundImageUrl = encodeURIComponent(
            sharedImage
        );
    
        const deepLink = `instagram-stories://share?source_application=zoku&backgroundImage=${backgroundImageUrl}`;
        const fallback = "https://www.instagram.com/";
        // Try to open Instagram Stories
        // window.open(deepLink, "_blank");

        console.log(sharedImage, deepLink)
        // Fallback after 800ms
        setTimeout(() => {
            //  window.location.href = fallback;
        }, 800);
        setExpanded(false);
    };

    

    
    async function handleFbShare(){
        // send to backend
        const shareData = await API_shareProfile("Facebook", bearer, brand ? "Brand":"Personality", brand ? profile.id : 0);
        const shareUrl = shareData.shareUrl;
        
        console.log(shareData);
        copyText(shareData.shareText);
        const quote = shareData.shareText;

        let fbUrl="";

        if (brand) {
            fbUrl = shareUrl;
        } else {
            fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
        )}&quote=${encodeURIComponent(quote)}`;
        }

        console.log(fbUrl);

        window.open(fbUrl, "_blank", "width=600,height=900");
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
          onClick={()=>{ brand ? 
            setExpanded(prev => !prev) :
            openShare(profile);}} />

        <OverlayModal isOpen={!!activeModal} onClose={closeModal}>
        {(() => {
            if (activeModal && !brand) {
            const shareText =
                `Jag är ${valueProfiles
                    [activeModal.primaryPersonality.name].title} med drag av ${valueProfiles
                        [activeModal.secondaryPersonality.name].title} och ${valueProfiles
                            [activeModal.thirdPersonality.name].title}`;
            
            return (
                <div style={{
                textAlign: "center",
                width: "100%",
                backgroundColor: "var(--background)",
                borderRadius: "10px"
                }}>
                <h1>{shareText}</h1>

                <p>Vad är din kombination?</p>
                
                <img src={sharedImage}
                    style={{ maxWidth: "90%", height: "auto" }}
                    alt={personality.name} />
                
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" }}>
                <FaSquareFacebook
                    title="Dela på facebook"
                    className="clickable-icon share-icon"
                    onClick={() => {
                        copyText(`${shareText} - Vad är din kombination?`);
                        handleFbShare()}}
                />
                <FaInstagram
                    title="Dela på instagram"
                    className="clickable-icon share-icon"
                    onClick={() => {
                        copyText(shareText);
                        copyImage(sharedImage);
                        shareInstagramStory();
                    }}
                />
                </div>
                </div>
            );
            }
            return null;
        })()}
        </OverlayModal>



      </div>
      )
}
