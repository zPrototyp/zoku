import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/App.css";
import "../assets/css/PersonalityCard.css";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
import { ShareOverlay } from "./ShareOverlay";
import { GiReturnArrow } from "react-icons/gi";

function PersonalityCard({ personality, profile, highlight, testValues })
{
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  if (!personality || !profile) return null;
    
  const profileImg = ZokuMasks[personality.name];
  return (
    <div className={`card ${highlight ? "primary-card" : "secondary-card"}`}>
      <div className="card-header">
        <img
          src={profileImg}
          alt={profile.title}
          className={`mask ${highlight ? "large-mask" : "faint-mask"}`}
        />
        <div className="card-title">
          <h2>
              {personality.matchPercentage}%
              {profile.title} 
            </h2>
        </div>
              <h2>{profile.kanji}      </h2>
                        <GiReturnArrow 
                  className="clickable-icon" 
                  title="Gör om testet" 
                  size="30px"
                  onClick={() => navigate("/newtest")}/>


      </div>
      <ShareOverlay 
        personality={personality} 
        profile={profile} 
        testValues={testValues}
      />

      <div className="card-body preview">
        <p className="subtitle">{profile.subtitle}</p>
        {profile.text?.slice(0, 2).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="card-toggle">
        <span className="arrow" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {expanded && (
        <div className="card-body full-info">
          <h4>{profile.listHeader}</h4>
          <ul>
            {profile.list?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <h4>{profile.consumerHeader}</h4>
          <p>{profile.consumerText}</p>
        </div>
      )}
    </div>
  );
}

export default PersonalityCard;