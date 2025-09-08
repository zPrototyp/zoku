import React, { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";
import { FaUserPlus, FaUserMinus } from "react-icons/fa6";
import { API_followUser, API_unfollowUser } from "../Services/API.jsx";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";
import CelebrityComparisonDial from "./CelebrityComparisonDial";
import "../assets/css/CelebrityCard.css";
import { calculateMatchPercentage } from "../Services/type-calculation.js";
import { guestTokenAtom } from "../Atoms/GuestTokenAtom.jsx";

const AZURE_API = import.meta.env.VITE_AZURE_API;

function userProfileUrl(targetUserId) {
  return  `${AZURE_API}/user/discovery/profile/${targetUserId}`;
}

function UserCard({ user, viewer = null, onAfterFollow, onAfterUnfollow }) {
  const token = useAtomValue(authTokenAtom);
  const sessionToken = useAtomValue(guestTokenAtom);
  const myProfileFromAtom = useAtomValue(valueProfileAtom);
  const [following, setFollowing] = useState(Boolean(user?.isFollowing));

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileErr, setProfileErr] = useState("");

  const [expanded, setExpanded] = useState(false);
  const [showDial, setShowDial] = useState(false);

  const targetUserId = user?.id || user?.userId;

  useEffect(() => {
    let mounted = true;
    if (!targetUserId){
      setProfile(null);
      return
    }
    setProfile(user);
    
    if (!token ) {
    }

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileErr("");
      try {
        const res = await fetch(userProfileUrl(targetUserId), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        const payload = text ? JSON.parse(text) : null;

        if (!res.ok) {
          const msg =
            payload?.message ||
            (Array.isArray(payload?.errors) ? payload.errors.join(", ") : null) ||
            `HTTP ${res.status}`;
          throw new Error(msg);
        }

        const data = payload?.data || payload;
        if (mounted) setProfile(data || null);
      } catch (e) {
        console.error("User profile fetch failed:", e);
        if (mounted) setProfileErr(e.message || "Kunde inte hämta användarprofil.");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    token && fetchProfile();
    
    
    return () => {
      mounted = false;
    };
  }, [token, sessionToken, targetUserId]);

  useEffect(() => {
    setFollowing(Boolean(user?.isFollowing));
  }, [user?.isFollowing]);

  const toggleFollow = async () => {
    if (!token) {
      alert("Logga in för att följa användare.");
      return;
    }
    try {
      if (following) {
        await API_unfollowUser(targetUserId, token);
        setFollowing(false);
        onAfterUnfollow?.(user);
      } else {
        await API_followUser(targetUserId, token);
        setFollowing(true);
        onAfterFollow?.(user);
      }
    } catch (e) {
      console.error("Follow toggle failed:", e);
    }
  };

  const displayName = user?.displayName || user?.name || user?.fullName || "Användare";

  const primaryType = profile?.primaryType || null;
  const secondaryType = profile?.secondaryType || null;
  const thirdType = profile?.thirdType || null;

  const pProf = useMemo(() => (primaryType ? valueProfiles?.[primaryType] : null), [primaryType]);
  const sProf = useMemo(() => (secondaryType ? valueProfiles?.[secondaryType] : null), [secondaryType]);
  const tProf = useMemo(() => (thirdType ? valueProfiles?.[thirdType] : null), [thirdType]);

  const matchPct = useMemo(() => {
    return calculateMatchPercentage(viewer, profile);
  }, [viewer, profile]);

  const hasAnyBlock = Boolean(pProf || sProf || tProf);

  const coverImg = user?.avatarUrl || user?.photoUrl || null;

  // Comparison Dial
  const viewerProfile = viewer || myProfileFromAtom || null;

  const viewerHasCoords =
    viewerProfile &&
    typeof viewerProfile.compassionVsAmbition === "number" &&
    typeof viewerProfile.changeVsTradition === "number";

  const targetHasCoords =
    profile &&
    typeof profile.compassionVsAmbition === "number" &&
    typeof profile.changeVsTradition === "number";

  const canShowDial = viewerHasCoords && targetHasCoords;

  const dialUser = viewerProfile || undefined;
  const dialOther = profile
    ? {
        name: displayName,
        coordinates: {
          compassionVsAmbition: profile.compassionVsAmbition,
          changeVsTradition: profile.changeVsTradition,
        },
        personalityProfile: {
          primary: primaryType ? { type: primaryType, matchPercentage: profile.primaryMatchPercentage } : undefined,
          secondary: secondaryType ? { type: secondaryType, matchPercentage: profile.secondaryMatchPercentage } : undefined,
          third: thirdType ? { type: thirdType, matchPercentage: profile.thirdMatchPercentage } : undefined,
        },
      }
    : undefined;

  const compareDisabledTitle = !viewerHasCoords
    ? "Din profil saknar koordinater (compassionVsAmbition / changeVsTradition)."
    : !targetHasCoords
    ? "Användaren saknar koordinater för jämförelse."
    : "";

  return (
    <div className="celebCard" style={{ position: "relative" }}>
      {/* Follow overlay  */}
      {token && <div
        style={{ position: "absolute", top: 8, right: 8, cursor: "pointer", zIndex: 2 }}
        onClick={toggleFollow}
        title={following ? "Sluta följa" : "Följ"}
      >
        {following ? <FaUserMinus /> : <FaUserPlus />}
      </div>}

      {/* Header */}
      <div className="celebHeader" style={{ position: "relative" }}>
        {coverImg && (
          <img className="celebCover" src={coverImg} alt={displayName} loading="lazy" />
        )}
        <div className="celebMeta">
          <div className="celebTitleRow" style={{ alignItems: "center", gap: ".6rem" }}>
            {primaryType && (
              <img
                src={ZokuMasks[primaryType]}
                alt={pProf?.title || primaryType}
                style={{ width: 56, height: 56, objectFit: "contain" }}
              />
            )}
            <h3 className="celebName" style={{ margin: 0 }}>{displayName}</h3>
            {Number.isFinite(matchPct) && <span className="celebMatch">{matchPct}% match</span>}
          </div>

          {/* Title */}
          {pProf && <div className="celebPrimary">{pProf.title}</div>}

          {/* Loading / error status */}
          {loadingProfile && <p className="celebDesc" style={{ opacity: 0.7 }}>Laddar profil…</p>}
          {profileErr && <p className="celebDesc" style={{ color: "red" }}>{profileErr}</p>}
        </div>
      </div>

      {/* Expand */}
      {(hasAnyBlock || true) && (
        <div className="celebActions">
          {hasAnyBlock && (
            <button className="btn btnSlim" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Visa mindre" : "Visa mer"}
            </button>
          )}

          {/* Compare */}
          <button
            className="btn btnSlim"
            onClick={() => setShowDial((v) => !v)}
            disabled={!canShowDial}
            title={canShowDial ? "" : compareDisabledTitle}
            aria-disabled={!canShowDial}
          >
            {showDial ? "Dölj jämförelse" : "Jämför"}
          </button>
        </div>
      )}

      {/* Comparison dial */}
      {showDial && canShowDial && (
        <div className="celebDial">
          <CelebrityComparisonDial user={dialUser} celeb={dialOther} />
        </div>
      )}

      {/* Personalities */}
      {expanded && (
        <div className="celebExpanded">
          {/* Primary */}
          {pProf && primaryType && (
            <div className="primaryBlock">
              <img
                className="primaryMask"
                src={ZokuMasks[primaryType]}
                alt={pProf.title}
                loading="lazy"
              />
              <div className="primaryBody">
                <div className="primaryTitleRow">
                  <div className="primaryKanji">{pProf.kanji}</div>
                  <div className="primaryPct">
                    {Math.round(profile?.primaryMatchPercentage ?? 0)}%
                  </div>
                </div>
                <div className="primaryTitle">{pProf.title}</div>
                {pProf.subtitle && <div className="primarySubtitle">{pProf.subtitle}</div>}
                {Array.isArray(pProf.text) &&
                  pProf.text.slice(0, 2).map((t, i) => (
                    <p key={i} className="primaryText">
                      {t}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Secondary */}
          <div className="secondary-container">
            {sProf && secondaryType && (
              <SecondaryPersonalityCard
                personality={{
                  name: secondaryType,
                  matchPercentage: Math.round(profile?.secondaryMatchPercentage ?? 0),
                }}
                profile={sProf}
              />
            )}

            {tProf && thirdType && (
              <SecondaryPersonalityCard
                personality={{
                  name: thirdType,
                  matchPercentage: Math.round(profile?.thirdMatchPercentage ?? 0),
                }}
                profile={tProf}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCard;
