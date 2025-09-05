import React from "react";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";
import { valueProfiles } from '../assets/uiData/zoku_profiles_se';

export default function AdminUserCard({ user, fetchUser }) {
      if (!user) return <p className="user-loading">Loading...</p>;

  const {
    fullName = "N/A",
    email = "N/A",
    emailConfirmed = false,
    lockoutEnabled = false,
    isLockedOut = false,
    personalityProfile = {},
  } = user;

  return (
    <div className="admin-user-profile">
      <h2 className="admin-user-profile__name">{fullName}</h2>

      <div className="admin-user-profile__basic-info">
        <div>
            <button
                onClick={() => fetchUser(user.id)}
            >Fetch all info</button>    
        </div>
        <p className="admin-user-profile__email">
          <strong>Email:</strong> {email} {emailConfirmed ? "(Confirmed)" : "(Not confirmed)"}
        </p>
        <p className="admin-user-profile__lockout-status">
          <strong>Account locked:</strong> {isLockedOut ? "Yes" : "No"}
        </p>
        <p className="admin-user-profile__lockout-enabled">
          <strong>Lockout enabled:</strong> {lockoutEnabled ? "Yes" : "No"}
        </p>
      </div>

      {personalityProfile && Object.keys(personalityProfile).length > 0 && (
        <div className="admin-user-profile__personality">
          <div className="admin-user-profile__values">   
            <h4 className="admin-user-profile__personality-title">Value Profile</h4>
            <p className="admin-user-profile__trait">
                <strong>Change vs Tradition:</strong> {personalityProfile?.changeVsTradition}
            </p>
            <p className="admin-user-profile__trait">
                <strong>Compassion vs Ambition:</strong> {personalityProfile?.compassionVsAmbition}
            </p>
          </div>

          <div className="admin-personality-circles">
            <SecondaryPersonalityCard 
                personality={{name: personalityProfile?.primaryType,
                            matchPercentage: personalityProfile?.primaryMatchPercentage
                            }} 
                profile={valueProfiles[personalityProfile?.primaryType]} />
            <SecondaryPersonalityCard 
                personality={{name: personalityProfile?.secondaryType,
                            matchPercentage: personalityProfile?.secondaryMatchPercentage
                            }} 
                profile={valueProfiles[personalityProfile?.secondaryType]} />
            <SecondaryPersonalityCard 
                personality={{name: personalityProfile?.thirdType,
                            matchPercentage: personalityProfile?.thirdMatchPercentage
                            }} 
                profile={valueProfiles[personalityProfile?.thirdType]} />
          </div>
        </div>
      )}
    </div>
  );
}


export function UserInteractionCard({ user , userShares}) {
    
  if (!user) return <p>Loading...</p>;

  const { userName, totalInteractions, brandInteractions, summary, shares } = user;
  // Show only top 5 brand interactions for compactness
  const topBrands = brandInteractions.slice(0, 5) || [];

  return (
    <div className="user-card">
      <div>
      <h3 className="user-card__name">{userName}</h3>
      <p className="user-card__total">Total Interactions: {totalInteractions}</p>
      <div className="user-card__summary">
        <p><strong>Liked:</strong> {summary?.isLiked ? "Yes" : "No"}</p>
        <p><strong>Unliked:</strong> {summary?.isUnliked ? "Yes" : "No"}</p>
        <div>
          <p><strong>Total Brand Shares:</strong> {summary?.totalShares || 0}</p>
          {shares.length>0 && (
            <ul>
            {shares.map(item => <li>{item.brandName} {item.platform}</li>)}
            </ul>
          )
          }
        </div>
        <p><strong>View Count:</strong> {summary?.viewCount || 0}</p>
      </div>
      </div>
      <div className="user-card__brands">
        <strong>Profile shared: </strong>
        <ul>
          {userShares.map(item => <li>{item.platform} x({item.shareCount}) {item.lastSharedAt} </li>)}
        </ul>
        <strong>Most recent Likes ({totalInteractions - 5} not shown):</strong>
        <ul className="user-card__brand-list">
          {topBrands.map((b) => (
            <li key={b.id} className="user-card__brand-item">
              {b.brandName} ({b.interactionType})
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
