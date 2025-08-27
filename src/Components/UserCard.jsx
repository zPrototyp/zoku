import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { FaUserPlus, FaUserMinus } from "react-icons/fa6";
import { API_followUser, API_unfollowUser } from "../Services/API.jsx";

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

  return (
    <div className="card hoverable" style={{ padding: "0.75rem", borderRadius: 12, position: "relative" }}>
      {/* Follow overlay */}
      <div style={{ position: "absolute", top: 8, right: 8, cursor: "pointer" }} onClick={toggleFollow}
           title={following ? "Sluta följa" : "Följ"}>
        {following ? <FaUserMinus /> : <FaUserPlus />}
      </div>

      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.displayName || user.username}
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "50%" }}
          />
        )}
        <div>
          <div style={{ fontWeight: 600 }}>
            {user?.displayName || user?.username || "Användare"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.bio || user?.tagline || ""}</div>
        </div>
      </div>
    </div>
  );
}
