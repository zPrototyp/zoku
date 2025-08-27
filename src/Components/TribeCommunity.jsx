import React, { useEffect, useState } from "react";
import { API_userSafeFetchJson } from "../Services/API";
import CelebrityCard from "../Components/CelebrityCard";
import UserCard from "../Components/UserCard";

function TribeCommunity({ token, user, title = "Tribes" }) {
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");

    try {
      await API_userSafeFetchJson(token, "user/celebrities/liked", setLikedCelebs);
    } catch (err) {
      console.error("Fel vid hämtning av gillade kändisar:", err);
      setError((prev) => prev || "Kunde inte hämta gillade kändisar");
    }

    try {
      await API_userSafeFetchJson(token, "user/relationships/following", setFollowingUsers);
    } catch (err) {
      console.error("Fel vid hämtning av följda användare:", err);
      setError((prev) => prev || "Kunde inte hämta följda användare");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const TribeGrid = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
      {children}
    </div>
  );

  const handleAfterUnlikeCeleb = (celeb) => {
    const id = celeb?.id;
    setLikedCelebs((prev) => prev.filter((c) => (c.id || c.celebrityId) !== id));
  };
  const handleAfterLikeCeleb = (celeb) => {
    const id = celeb?.id;
    setLikedCelebs((prev) => {
      const exists = prev.some((c) => (c.id || c.celebrityId) === id);
      if (exists) return prev;
      return [
        {
          id,
          name: celeb?.name,
          imageUrl: celeb?.imageUrl,
          isLiked: true,
        },
        ...prev,
      ];
    });
  };

  const handleAfterUnfollowUser = (user) => {
    const id = user?.id || user?.userId;
    setFollowingUsers((prev) => prev.filter((u) => (u.id || u.userId) !== id));
  };
  const handleAfterFollowUser = (user) => {
    const id = user?.id || user?.userId;
    setFollowingUsers((prev) => {
      const exists = prev.some((u) => (u.id || u.userId) === id);
      if (exists) return prev;
      return [
        {
          id,
          displayName: user?.displayName || user?.name,
          username: user?.username,
          avatarUrl: user?.avatarUrl || user?.photoUrl,
          bio: user?.bio || user?.tagline,
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
        {!!token && (
          <button className="btn btnSlim" onClick={fetchData} aria-label="Uppdatera Tribes">
            Uppdatera
          </button>
        )}
      </div>

      {error && <p style={{ color: "red", marginTop: ".5rem" }}>{error}</p>}
      {isLoading && <p style={{ opacity: 0.75, marginTop: ".5rem" }}>Laddar Tribes...</p>}

      {/* Liked Celebrities */}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Kändisar du gillar</h3>
        {likedCelebs && likedCelebs.length > 0 ? (
          <TribeGrid>
            {likedCelebs.map((c) => {
              const normalized = {
                id: c.id || c.celebrityId,
                name: c.name || c.celebrityName,
                imageUrl: c.imageUrl || c.photoUrl,
                description: c.description,
                isLiked: true,
                coordinates: c.coordinates,
                personalityProfile: c.personalityProfile,
                matchPercentage: c.matchWithUser ?? c.matchPercentage,
              };
              return (
                <CelebrityCard
                  key={normalized.id || normalized.name}
                  celeb={normalized}
                  user={user}
                  celebBrands={[]}
                  onAfterUnlike={handleAfterUnlikeCeleb}
                  onAfterLike={handleAfterLikeCeleb}
                />
              );
            })}
          </TribeGrid>
        ) : (
          <p style={{ opacity: 0.75 }}>Du har inte gillat några kändisar ännu.</p>
        )}
      </div>

      {/* Following Users */}
      <div style={{ marginTop: "1rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Användare du följer</h3>
        {followingUsers && followingUsers.length > 0 ? (
          <TribeGrid>
            {followingUsers.map((u) => {
              const normalized = {
                id: u.id || u.userId,
                displayName: u.displayName || u.name,
                username: u.username,
                avatarUrl: u.avatarUrl || u.photoUrl,
                bio: u.bio || u.tagline,
                isFollowing: true,
              };
              return (
                <UserCard
                  key={normalized.id || normalized.username}
                  user={normalized}
                  onAfterUnfollow={handleAfterUnfollowUser}
                  onAfterFollow={handleAfterFollowUser}
                />
              );
            })}
          </TribeGrid>
        ) : (
          <p style={{ opacity: 0.75 }}>Du följer inga användare ännu.</p>
        )}
      </div>
    </div>
  );
}

export default TribeCommunity;