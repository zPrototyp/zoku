import {NavLink} from "react-router";
import { useState } from "react";
import OverlayModal from "../Components/OverlayModal.jsx";
import {valueProfiles} from "../assets/uiData/zoku_profiles_se.js";
import { ZokuMasks } from "../assets/uiData/PersonalityImages.js";
import zokuTitle from "../assets/images/ZokuTitle.svg";
import { useSearchParams } from 'react-router-dom';

export default function NewStartPage() {
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);
  const [searchParams] = useSearchParams();
  const [zokuInfo, setZokuInfo] = useState(false);

  const closeZokuInfo = () => setZokuInfo(false);

  searchParams.get('changeY') ? parseInt(searchParams.get('changeY')) : 0;
  searchParams.get('compassionX') ? parseInt(searchParams.get('compassionX')) : 0;

  return (
    <div className="page-content">
      <NavLink to="/">
        <h1>
          <img src={zokuTitle} alt="Logo" className="logo-new" />
          <span className="sr-only">Zoku</span>
        </h1>
      </NavLink>
       <div className="start-page">
        <div className="sp-questionsBox">
                      
          <h2 className="sp-question">Vilka varumärken är du?</h2>
          <p>Upptäck din personlighet och bli matchad med varumärken som delar dina värderingar. </p>
          <p>Jämför med dina vänner och kanske någon artist du gillar.</p>

        </div>
        <div className="sp-whatIsZokuBtn">
          <button className="btn-small active" onClick={()=> setZokuInfo(true) }>Vad är Zoku?</button>
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
          <button className="active sp-quizButton">
            <NavLink to="/test" className="nav-link">Upptäck din personlighet</NavLink>
            </button>
        </div>
      </div>
      <OverlayModal isOpen={!!activeModal} onClose={closeModal}>
        {activeModal && (
          <>
            <div className="zokuProfilePopupHeader">
              
                <img className="mask80" 
                src={ZokuMasks[activeModal]} 
                alt={valueProfiles[activeModal].title} />
                <h3>{valueProfiles[activeModal].title} {valueProfiles[activeModal].kanji} </h3>
            </div>
              <p>{valueProfiles[activeModal].subtitle}</p>
              <p>{valueProfiles[activeModal].consumerText}</p>
          </>
        )}
      </OverlayModal>

      <OverlayModal isOpen={zokuInfo} onClose={closeZokuInfo}>

        <h2>Vad är Zoku?</h2>
        <p>Vi tror att konsumtion handlar om mer än bara produkter. <br />
        Det handlar om vilka vi är, vem vi vill vara och vilka vi vill dela våra liv med.</p>

        <p>Genom att svara på några enkla frågor upptäcker du din värderingspersonlighet och matchar med människor och varumärken som delar dina värderingar.
        </p>
        <button className="active btn-small">
          <NavLink to="/aboutZoku">Läs Zokus manifest</NavLink>
        </button>
        <button className="active">
          <NavLink to="/test" className="nav-link">Upptäck din personlighet</NavLink>
        </button>

      </OverlayModal>
   
    </div>
  );
}