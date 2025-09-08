import { useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import "../assets/css/SharingOverlay.css";

import { FaSquareFacebook , FaInstagram , FaTiktok } from "react-icons/fa6";

import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom";
import { API_shareProfile, API_shareTrack } from "../Services/API";
import OverlayModal from "./OverlayModal";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";

export function ShareOverlay({personality, profile, testValues, brand}){
    const [expanded, setExpanded] = useState(false);
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
        sharedImage = `${url}/${profile.imageUrl ? profile.imageUrl :`dummy-brand_${brand.category}.jpg`}`;

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

    const copyImage = async (imgUrl) => {
        try {
            const img = new Image();
            img.crossOrigin = "anonymous"; // needed if hosted elsewhere
            img.src = imgUrl;

            await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

            await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
            ]);

            alert("Bild kopierad till urklipp!");
        } catch (err) {
            console.error("Failed to copy image: ", err);
        }
    };


    const shareInstagramStory = async () => {

        const shareData = await API_shareProfile("Instagram", bearer, brand ? "Brand":"Personality", brand? brand.id || 0 : 0);
    
        const sharedText=shareData.shareText;
        
        const shareUrl=shareData.shareUrl;
        
        copyText(sharedText);
        
        copyImage(sharedImage);
        
        const backgroundImageUrl = encodeURIComponent(
            sharedImage
        );
    
        const deepLink = `instagram-stories://share?source_application=zoku&backgroundImage=${backgroundImageUrl}`;
        const fallback = "https://www.instagram.com/";
        // Try to open Instagram Stories
        window.open(deepLink, "_blank");

        // Fallback after 800ms
        setTimeout(() => {
             window.location.href = fallback;
        }, 800);
        setExpanded(false);
    };
    
    async function handleFbShare(){
        // send to backend
        
        const shareData = await API_shareProfile("Facebook", bearer, brand ? "Brand":"Personality", brand ? brand.id : 0);
        const shareUrl = shareData.shareUrl;
        
        copyText(shareData.shareText);
        const quote = shareData.shareText;

        let fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
        )}&quote=${encodeURIComponent(quote)}`;

        window.open(fbUrl, "_blank", "width=600,height=900");
        setExpanded(false);
    }

    async function handleTikTokShare(){
        API_shareTrack(bearer, brand ? 'Brand': 'Personality', brand ? brand.id : 0, "TikTok", "Link")
        copyImage(sharedImage);
        setExpanded(false);
    }

    return (
      <div className={`share-profile${expanded ? " expanded": ""}${brand ? " brand-share": ""}`}>
        
        {expanded && (
            <div className="share-icons">
                <FaSquareFacebook
                    title="-Dela på facebook"
                    className="clickable-icon share-icon"
                    onClick={() => {
                        handleFbShare()
                    }}
                    />
                <FaInstagram
                    title="-Dela på instagram"
                    className="clickable-icon share-icon"
                    onClick={()=>{
                        shareInstagramStory()
                    }}
                    />
                <FaTiktok 
                    title="-Dela på TikTok"
                    className="clickable-icon share-icon"
                    onClick={()=>{
                        handleTikTokShare()
                    }}
                     />
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
                <FaTiktok 
                    title="Dela på TikTok"
                    className="clickable-icon share-icon"
                    onClick={()=> {
                        copyText(`${shareText} - Vad är din kombination?`);
                        copyImage(sharedImage);
                        handleTikTokShare()
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
