import React, { useEffect, useState } from "react";
import { API_userSafeFetchJson } from "../Services/API";
import CelebrityCard from "../Components/CelebrityCard";
import UserCard from "../Components/UserCard";
import SuggestedUsers from "./TribeSuggestedUsers";

function TribeCommunity({ token, user, title = "Tribes" }) {
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uiState, setUiState] = useState({ showSuggestedUsers: false });

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");

    try {
      await API_userSafeFetchJson(token, "user/celebrities/liked", (data) => {
        const updated = (Array.isArray(data) ? data : []).map((celeb) => ({
          ...celeb,
          isLiked: true,
        }));
        setLikedCelebs(updated);
      });
    } catch (err) {
      console.error("Fel vid hämtning av gillade kändisar:", err);
      setError((prev) => prev || "Kunde inte hämta gillade kändisar");
    }

    try {
      await API_userSafeFetchJson(token, "user/relationships/following", (data) => {
        setFollowingUsers(Array.isArray(data) ? data : []);
      });
    } catch (err) {
      console.error("Fel vid hämtning av följda användare:", err);
      setError((prev) => prev || "Kunde inte hämta följda användare");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const TribeGrid = ({ children }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "1rem",
      }}
    >
      {children}
    </div>
  );

  // Like/unlike
  const handleAfterUnlikeCeleb = (celeb) => {
    const id = celeb?.id || celeb?.celebrityId;
    setLikedCelebs((prev) => prev.filter((c) => (c.id || c.celebrityId) !== id));
  };
  const handleAfterLikeCeleb = (celeb) => {
    const id = celeb?.id;
    setLikedCelebs((prev) => {
      if (prev.some((c) => (c.id || c.celebrityId) === id)) return prev;
      return [{ ...celeb, isLiked: true }, ...prev];
    });
  };
  const handleAfterUnfollowUser = (unfollowed) => {
    const id = unfollowed?.id || unfollowed?.userId;
    setFollowingUsers((prev) => prev.filter((u) => (u.id || u.userId) !== id));
  };
  const handleAfterFollowUser = (newUser) => {
    const id = newUser?.id || newUser?.userId;
    setFollowingUsers((prev) => {
      if (prev.some((u) => (u.id || u.userId) === id)) return prev;
      return [
        {
          id,
          displayName: newUser.displayName || newUser.name,
          username: newUser.username,
          avatarUrl: newUser.avatarUrl || newUser.photoUrl,
          bio: newUser.bio || newUser.tagline,
          isFollowing: true,
        },
        ...prev,
      ];
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
    </div>

    {error && <p style={{ color: "red", marginTop: ".5rem" }}>{error}</p>}
    {isLoading && <p style={{ opacity: 0.75, marginTop: ".5rem" }}>Laddar Tribes...</p>}

      {/* Liked Celebrities */}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Kändisar du gillar</h3>
        {likedCelebs.length > 0 ? (
          <TribeGrid>
            {likedCelebs.map((c) => (
              <CelebrityCard
                key={c.id || c.name}
                celeb={c}
                user={user}
                celebBrands={[]}
                onAfterUnlike={handleAfterUnlikeCeleb}
                onAfterLike={handleAfterLikeCeleb}
              />
            ))}
          </TribeGrid>
        ) : (
          !isLoading && <p style={{ opacity: 0.75 }}>Du har inte gillat några kändisar ännu.</p>
        )}
      </div>

      {/* Following Users */}
      <div style={{ marginTop: "1rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Användare du följer</h3>
        {followingUsers.length > 0 ? (
          <TribeGrid>
            {followingUsers.map((u) => {
              const normalized = {
                id: u.id || u.userId,
                displayName: u.displayName || u.fullName,
                username: u.username,
                avatarUrl: u.avatarUrl || u.photoUrl,
                bio: u.bio || u.tagline,
                isFollowing: true,
              };
              return (
                <UserCard
                  key={normalized.id || normalized.username}
                  user={normalized}
                  viewer={user}
                  onAfterUnfollow={handleAfterUnfollowUser}
                  onAfterFollow={handleAfterFollowUser}
                />
              );
            })}
          </TribeGrid>
        ) : (
          !isLoading && (
            <>
              <p style={{ opacity: 0.75 }}>Du följer inga användare ännu.</p>
              <button
                className="btn-small"
                onClick={() =>
                  setUiState((p) => ({ ...p, showSuggestedUsers: !p.showSuggestedUsers }))
                }
              >
                {uiState.showSuggestedUsers ? "Dölj förslag" : "Föreslå andra användare"}
              </button>
              {uiState.showSuggestedUsers && (
                <SuggestedUsers token={token} user={user} setUiState={setUiState} />
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default TribeCommunity;