import React, { useState } from "react";
import "../assets/css/SecondaryPersonalityCard.css";
import { ZokuMasks } from "../assets/uiData/PersonalityImages.js";

function SecondaryPersonalityCard({ personality, profile })
{
  const [expanded, setExpanded] = useState(false);

  if (!profile) return null;
  const profileImg = ZokuMasks[personality.name];
  return (
    <div
      className={`secondary-card-circle ${expanded ? "expanded" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <img src={profileImg} alt={profile.title} className="mask-background" />
      <div className="circle-content">
        <div className="kanji">{profile.kanji}</div>
        <div className="match">{personality.matchPercentage}%</div>
        <div className="title">{profile.title}</div>

        {expanded && (
          <div className="expanded-info">
            <p className="subtitle">{profile.subtitle}</p>
            {profile.text.slice(0, 2).map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SecondaryPersonalityCard;