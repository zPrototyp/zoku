import React, { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { FaUserPlus, FaUserMinus } from "react-icons/fa6";
import { API_followUser, API_unfollowUser } from "../Services/API.jsx";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";
import "../assets/css/CelebrityCard.css";

const AZURE_API = import.meta.env.VITE_AZURE_API;

function userProfileUrl(targetUserId) {
  const base = (AZURE_API || "").replace(/\/+$/, "");
  const hasApiV1 = /\/api\/v1\b/.test(base);
  return hasApiV1
    ? `${base}/user/discovery/profile/${targetUserId}`
    : `${base}/api/v1/user/discovery/profile/${targetUserId}`;
}

function UserCard({ user, onAfterFollow, onAfterUnfollow }) {
  const token = useAtomValue(authTokenAtom);
  const [following, setFollowing] = useState(Boolean(user?.isFollowing));
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileErr, setProfileErr] = useState("");
  const targetUserId = user?.id || user?.userId;

  useEffect(() => {
    let mounted = true;
    if (!token || !targetUserId) {
      setProfile(null);
      return;
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

    fetchProfile();
    return () => { mounted = false; };
  }, [token, targetUserId]);

  useEffect(() => { setFollowing(Boolean(user?.isFollowing)); }, [user?.isFollowing]);

  const toggleFollow = async () => {
    if (!token) { alert("Logga in för att följa användare."); return; }
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

  const displayName = user?.displayName || user?.name || user?.username || "Användare";
  const primaryType = profile?.primaryType || null;
  const secondaryType = profile?.secondaryType || null;
  const thirdType = profile?.thirdType || null;

  const pProf = useMemo(() => (primaryType ? valueProfiles?.[primaryType] : null), [primaryType]);
  const sProf = useMemo(() => (secondaryType ? valueProfiles?.[secondaryType] : null), [secondaryType]);
  const tProf = useMemo(() => (thirdType ? valueProfiles?.[thirdType] : null), [thirdType]);

  const matchPct = useMemo(() => {
    const v = profile?.primaryMatchPercentage;
    return Math.round(Number.isFinite(v) ? v : 0);
  }, [profile?.primaryMatchPercentage]);

  const hasAnyBlock = Boolean(pProf || sProf || tProf);

  const coverImg = user?.avatarUrl || user?.photoUrl || null;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="celebCard">
      {/* Follow overlay top-right */}
      <div
        style={{ position: "absolute", top: 8, right: 8, cursor: "pointer", zIndex: 2 }}
        onClick={toggleFollow}
        title={following ? "Sluta följa" : "Följ"}
      >
        {following ? <FaUserMinus /> : <FaUserPlus />}
      </div>

      {/* Header */}
      <div className="celebHeader" style={{ position: "relative" }}>
        {coverImg && (
          <img
            className="celebCover"
            src={coverImg}
            alt={displayName}
            loading="lazy"
          />
        )}
        <div className="celebMeta">
          <div className="celebTitleRow" style={{ alignItems: "center", gap: ".5rem" }}>
            {/* Primary mask next to the name */}
            {primaryType && (
              <img
                src={ZokuMasks[primaryType]}
                alt={pProf?.title || primaryType}
                style={{ width: 36, height: 36, objectFit: "contain" }}
              />
            )}
            <h3 className="celebName" style={{ margin: 0 }}>{displayName}</h3>
            {Number.isFinite(matchPct) && <span className="celebMatch">{matchPct}% match</span>}
          </div>

          {/* Primary title under name */}
          {pProf && <div className="celebPrimary">{pProf.title}</div>}

          {/* Loading / error status */}
          {loadingProfile && <p className="celebDesc" style={{ opacity: 0.7 }}>Laddar profil…</p>}
          {profileErr && <p className="celebDesc" style={{ color: "red" }}>{profileErr}</p>}
        </div>
      </div>

      {/* Actions (expand if there are secondary/third) */}
      {hasAnyBlock && (
        <div className="celebActions">
          <button className="btn btnSlim" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Visa mindre" : "Visa mer"}
          </button>
        </div>
      )}

      {/* Expanded view with secondary/third personalities like CelebrityCard */}
      {expanded && (
        <div className="celebExpanded">
          {/* Primary block */}
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
                {pProf.subtitle && (
                  <div className="primarySubtitle">{pProf.subtitle}</div>
                )}
                {Array.isArray(pProf.text) &&
                  pProf.text.slice(0, 2).map((t, i) => (
                    <p key={i} className="primaryText">
                      {t}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Secondary / Third circles */}
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