import {NavLink} from "react-router";
import { useState } from "react";
import OverlayModal from "../Components/OverlayModal";
import {valueProfiles} from "../assets/uiData/zoku_profiles_se.js";
import { ZokuMasks } from "../assets/uiData/PersonalityImages.js";
import zokuTitle from "/src/assets/images/ZokuTitle.svg";

export default function StartPage() {
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);
  console.log(ZokuMasks);
  return (
    <div className="page-content">
      {/* Logo here */}
      <NavLink to="/">
        <h1>
          <img src={zokuTitle} alt="Logo" className="logo" />
          <span className="sr-only">Zoku</span>
        </h1>
      </NavLink>
       
     <div className="sp-questionsBox">
            <h2 className="sp-question">Zoku är din tribe</h2>
            <h2 className="sp-question">Vem är du idag?</h2>
            <h2 className="sp-question">Vem vill du vara?</h2>
      </div>
      <div className="circle-layout">
   
        <p className="xTop">Förändring</p>
        <p className="xBottom">Tradition</p>
        <p className="yLeft">Gemenskap</p>
        <p className="yRight">Ambition</p>

        {/* Top edge */}
        <img src={ZokuMasks.Idealist} className="top-left" 
          title="Idealisten" onClick={() => setActiveModal("Idealist")} />
        <img src={ZokuMasks.Adventurer} className="top-right" 
          title="Äventyraren" onClick={() => setActiveModal("Adventurer")} />

        {/* Right edge */}
        <img src={ZokuMasks.Achiever} className="right-top" 
          title="Segraren" onClick={() => setActiveModal("Achiever")} />
        <img src={ZokuMasks.Strategist} className="right-bottom" 
          title="Strategen" onClick={() => setActiveModal("Strategist")} />

        {/* Bottom edge */}
        <img src={ZokuMasks.Traditionalist} className="bottom-right" 
          title="Bevararen" onClick={() => setActiveModal("Traditionalist")} />
        <img src={ZokuMasks.Guardian} className="bottom-left" 
          title="Beskyddaren" onClick={() => setActiveModal("Guardian")} />

        {/* Left edge */}
        <img src={ZokuMasks.Advocate} className="left-top" 
          title="Förkämpen" onClick={() => setActiveModal("Advocate")} />
        <img src={ZokuMasks.Caregiver} className="left-bottom" 
          title="Vårdgivaren" onClick={() => setActiveModal("Caregiver")} />
 
      </div>
      
      <div className="sp-quizButtonBox">
        <button className="active">
          <NavLink to="/test" className="nav-link">Vad är min zoku?</NavLink>
          </button>
      </div>

      <OverlayModal isOpen={!!activeModal} onClose={closeModal}>
        {activeModal && (
          <>
            <div className="zokuProfilePopupHeader">
              
                <img className="mask80" 
                src={valueProfiles[activeModal].imgSrc} 
                alt={valueProfiles[activeModal].title} />
                <h3>{valueProfiles[activeModal].title} {valueProfiles[activeModal].kanji} </h3>
            </div>
              <p>{valueProfiles[activeModal].subtitle}</p>
              <p>{valueProfiles[activeModal].consumerText}</p>
          </>
        )}
      </OverlayModal>

   
    </div>
  );
}