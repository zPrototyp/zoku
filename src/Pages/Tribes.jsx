import { NavLink } from "react-router-dom";
import { useState } from "react";
import OverlayModal from "../Components/OverlayModal";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
export default function Tribes() {
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(null);
    const listOrder= [
      "Adventurer",
      "Idealist", 
      "Achiever", 
      "Advocate",
      "Strategist", 
      "Guardian", 
      "Traditionalist", 
      "Caregiver"
    ];


    // Print out the Zoku cards

    function ZokuCards() {
      return (
        listOrder.map((profile, index) => 

         (
            <div className="tribe-card" key={index}
            onClick={() => setActiveModal(profile)}>
                <img className="mask60" src={ZokuMasks[profile]} alt={profile} />
                <h2>{valueProfiles[profile]?.title}</h2>
                <p>{valueProfiles[profile]?.subtitle}</p>
            </div>
            )
          )
        )
    }

    return (
        <div className="page-content">

                <h1>
                Alla Zoku Identiteter
                </h1>

            <div className="tribes-container">
                <ZokuCards />
            </div>

      <OverlayModal isOpen={!!activeModal} onClose={closeModal}>
        {activeModal && (
          <div className="zokuProfilePopup">
            <div className="zokuProfilePopupHeader">
                <img className="mask100" src={ZokuMasks[activeModal]} alt={valueProfiles[activeModal].title} />
                <h2>{valueProfiles[activeModal].title} </h2>            
                <h2>{valueProfiles[activeModal].kanji} </h2>
            </div>
            <p>{valueProfiles[activeModal].subtitle}</p>
            <p>{valueProfiles[activeModal].text.join(" ")} </p>
            <h3>{valueProfiles[activeModal].listHeader}</h3>
            <ul>
              {valueProfiles[activeModal].list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3>{valueProfiles[activeModal].consumerHeader}</h3>
            <p>{valueProfiles[activeModal].consumerText}</p>

              {/* If logged in - show link to compare yourself, if not - link to test */}
            <div>
                <NavLink to="/test" className="nav-link">
                    <button>Vad är din Zoku?</button>
                </NavLink>
            </div>
          </div>
        )}
      </OverlayModal>

        </div>
    );
}
