import React, { useEffect, useState, useMemo } from "react";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { FaUserPlus, FaUserMinus } from "react-icons/fa6";
import { API_followUser, API_unfollowUser } from "../Services/API.jsx";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";

export default function UserCard({ user, onAfterFollow, onAfterUnfollow }) {
  if (!user) return null;

  const token = useAtomValue(authTokenAtom);
  const [following, setFollowing] = useState(Boolean(user?.isFollowing));

  useEffect(() => { setFollowing(Boolean(user?.isFollowing)); }, [user?.isFollowing]);

  const toggleFollow = async () => {
    if (!token) { alert("Logga in för att följa användare."); return; }
    try {
      if (following) {
        await API_unfollowUser(user.id || user.userId, token);
        setFollowing(false);
        onAfterUnfollow?.(user);
      } else {
        await API_followUser(user.id || user.userId, token);
        setFollowing(true);
        onAfterFollow?.(user);
      }
    } catch (e) {
      console.error("Follow toggle failed:", e);
    }
  };

  // Personality title & match %
  const personalityTitle = useMemo(() => {
    const type = user?.personalityType;
    if (!type) return null;
    return valueProfiles?.[type]?.title || String(type);
  }, [user?.personalityType]);

  const matchText = useMemo(() => {
    const pct = user?.primaryMatchPercentage;
    if (typeof pct === "number" && !Number.isNaN(pct)) return `${pct}%`;
    return null;
  }, [user?.primaryMatchPercentage]);

  return (
    <div className="card hoverable" style={{ padding: "0.75rem", borderRadius: 12, position: "relative" }}>
      {/* Follow overlay */}
      <div
        style={{ position: "absolute", top: 8, right: 8, cursor: "pointer" }}
        onClick={toggleFollow}
        title={following ? "Sluta följa" : "Följ"}
      >
        {following ? <FaUserMinus /> : <FaUserPlus />}
      </div>

      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.username || "Användare"}
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: 48, height: 48, borderRadius: "50%",
              display: "grid", placeItems: "center", background: "#eee", fontWeight: 700
            }}
          >
            {(user?.displayName || user?.username || "?").slice(0,1).toUpperCase()}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
            {user?.displayName || user?.username || "Användare"}
          </div>
          {user?.username && (
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              @{user.username}
            </div>
          )}

          {/* Personality line */}
          {(personalityTitle || matchText) && (
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {personalityTitle}
              {personalityTitle && matchText ? " • " : ""}
              {matchText}
            </div>
          )}

          {user?.bio && (
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.bio}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
