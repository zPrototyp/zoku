import React from "react";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";
import { valueProfiles } from '../assets/uiData/zoku_profiles_se';

export default function AdminUserCard({ user }) {
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
          {/* <div className="admin-user-profile__types">
            <h4 className="admin-user-profile__types-title">Personalities</h4>
            <ul className="admin-user-profile__types-list">
              <li className="admin-user-profile__type">
                <strong>Primary:</strong> {personalityProfile?.primaryType} ({personalityProfile?.primaryMatchPercentage}%)
              </li>
              <li className="admin-user-profile__type">
                <strong>Secondary:</strong> {personalityProfile?.secondaryType} ({personalityProfile?.secondaryMatchPercentage}%)
              </li>
              <li className="admin-user-profile__type">
                <strong>Third:</strong> {personalityProfile?.thirdType} ({personalityProfile?.thirdMatchPercentage}%)
              </li>
            </ul>
          </div> */}
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
