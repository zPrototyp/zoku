import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_userSafeFetchJson } from "../Services/API";
import CelebrityCard from "./CelebrityCard";
import UserCard from "./UserCard";

function TribeCommunityOverview({ token, title = "Tribes", limit = 6 , user}) {
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!token) { setIsLoading(false); return; }
      setIsLoading(true);
      setError("");

      try {
        await API_userSafeFetchJson(token, "user/celebrities/liked", (data) => {
          if (!mounted) return;
          setLikedCelebs(Array.isArray(data) ? data.slice(0, limit) : []);
        });
      } catch (err) {
        if (!mounted) return;
        console.error("Fel vid hämtning av gillade kändisar:", err);
        setError((prev) => prev || "Kunde inte hämta gillade kändisar");
      }

      try {
        await API_userSafeFetchJson(token, "user/relationships/following", (data) => {
          if (!mounted) return;
          setFollowingUsers(Array.isArray(data) ? data.slice(0, limit) : []);
        });
      } catch (err) {
        if (!mounted) return;
        console.error("Fel vid hämtning av följda användare:", err);
        setError((prev) => prev || "Kunde inte hämta följda användare");
      }

      if (mounted) setIsLoading(false);
    };

    fetchData();
    return () => { mounted = false; };
  }, [token, limit]);

  const Grid = ({ children }) => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "0.75rem"
    }}>
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
      return [{ id, name: celeb?.name, imageUrl: celeb?.imageUrl, isLiked: true }, ...prev].slice(0, limit);
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
      const normalized = {
        id,
        displayName: user?.displayName || user?.name,
        username: user?.username,
        avatarUrl: user?.avatarUrl || user?.photoUrl,
        bio: user?.bio || user?.tagline,
        isFollowing: true,
      };
      return [normalized, ...prev].slice(0, limit);
    });
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button className="btn btnSlim" onClick={() => navigate("/community")}>
          Gå till Community
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: ".5rem" }}>{error}</p>}
      {isLoading && <p style={{ opacity: 0.75, marginTop: ".5rem" }}>Laddar...</p>}

      {/* Liked Celebrities (compact) */}
      <div style={{ marginTop: ".75rem", marginBottom: ".75rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Kändisar du gillar</h3>
        {likedCelebs && likedCelebs.length > 0 ? (
          <Grid>
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
          </Grid>
        ) : (
          <p style={{ opacity: 0.75 }}>Inga kändisar ännu.</p>
        )}
      </div>

      {/* Following Users (compact) */}
      <div style={{ marginTop: ".75rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Användare du följer</h3>
        {followingUsers && followingUsers.length > 0 ? (
          <Grid>
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
          </Grid>
        ) : (
          <p style={{ opacity: 0.75 }}>Du följer inga användare ännu.</p>
        )}
      </div>
    </div>
  );
}

export default TribeCommunityOverview;