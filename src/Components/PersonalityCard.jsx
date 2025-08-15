import React, { useState } from "react";
import "../assets/css/App.css";
import "../assets/css/PersonalityCard.css";
import { ShareOverlay } from "./ShareOverlay";


function PersonalityCard({ personality, profile, highlight, testValues })
{
  const [expanded, setExpanded] = useState(false);

  if (!personality || !profile) return null;

  return (
    <div className={`card ${highlight ? "primary-card" : "secondary-card"}`}>
      <div className="card-header">
        <img
          src={profile.imgSrc}
          alt={profile.title}
          className={`mask ${highlight ? "large-mask" : "faint-mask"}`}
        />
        <div className="card-title">
          <h2>{personality.matchPercentage}% {profile.title} {profile.kanji}</h2>
          
        </div>


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