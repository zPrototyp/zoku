import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_userSafeFetchJson } from "../Services/API";
import CelebrityCard from "./CelebrityCard";
import UserCard from "./UserCard";
import "../assets/css/CelebrityCard.css";

function TribeCommunityOverview({ token, title = "Tribes", limit = 6, user }) {
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const celebsRef = useRef(null);
  const usersRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      if (!token) { setIsLoading(false); return; }
      setIsLoading(true);
      setError("");

      // Celebrities
      try {
        await API_userSafeFetchJson(token, "user/celebrities/liked", (data) => {
          if (!mounted) return;
          const items = Array.isArray(data) ? data : [];
          const normalized = items.map((c) => ({
            id: c.id ?? c.celebrityId,
            name: c.name ?? c.celebrityName,
            imageUrl: c.imageUrl ?? c.photoUrl,
            description: c.description,
            coordinates: c.coordinates,
            personalityProfile: c.personalityProfile,
            matchPercentage: c.matchWithUser ?? c.matchPercentage,
            isLiked: true,
          }));
          setLikedCelebs(normalized.slice(0, limit));
        });
      } catch (err) {
        if (mounted) {
          console.error("Fel vid hämtning av gillade kändisar:", err);
          setError((prev) => prev || "Kunde inte hämta gillade kändisar");
        }
      }

      // Users
      try {
        await API_userSafeFetchJson(token, "user/relationships/following", (data) => {
          if (!mounted) return;
          const list = Array.isArray(data) ? data : [];
          const minimalUsers = list.map((u) => ({
            id: u.id || u.userId,
            displayName: u.displayName || u.name || u.fullName || "Användare",
            username: u.username || "",
            avatarUrl: u.avatarUrl || u.photoUrl || "",
            bio: u.bio || u.tagline || "",
            isFollowing: true,
          }));
          setFollowingUsers(minimalUsers.slice(0, limit));
        });
      } catch (err) {
        if (mounted) {
          console.error("Fel vid hämtning av följda användare:", err);
          setError((prev) => prev || "Kunde inte hämta följda användare");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, [token, limit]);

  const scrollBy = (ref, dir = 1) => {
    const node = ref?.current;
    if (node) node.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div style={{ marginTop: "1.25rem", position: "relative" }}>
      <style>{`
        .tribe-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .tribe-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: ".75rem", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <button className="btn btnSlim" onClick={() => navigate("/community")}>
          Gå till Community
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: ".5rem" }}>{error}</p>}
      {isLoading && <p style={{ opacity: 0.75, marginTop: ".5rem" }}>Laddar...</p>}

      {/* Liked celebrities */}
      <div style={{ marginTop: ".75rem", marginBottom: ".75rem", position: "relative" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Kändisar du gillar</h3>

        {likedCelebs.length > 0 ? (
          <div style={{ position: "relative", padding: "0 .25rem" }}>
            <button
              type="button"
              aria-label="Scrolla vänster"
              onClick={() => scrollBy(celebsRef, -1)}
              className="btn btnSlim"
              style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.9 }}
            >
              ‹
            </button>

            <div
              ref={celebsRef}
              className="tribe-scroll"
              style={{
                display: "flex",
                gap: "0.75rem",
                overflowX: "auto",
                padding: "0.5rem 2.25rem",
                scrollSnapType: "x mandatory",
              }}
            >
              {likedCelebs.map((c) => (
                <div
                  key={c.id || c.name}
                  style={{
                    minWidth: 300,
                    maxWidth: 340,
                    flex: "0 0 auto",
                    scrollSnapAlign: "start",
                  }}
                >
                  <CelebrityCard
                    celeb={c}
                    user={user}
                    celebBrands={[]}
                    onAfterUnlike={(celeb) =>
                      setLikedCelebs((prev) =>
                        prev.filter((x) => (x.id || x.celebrityId) !== (celeb?.id || celeb?.celebrityId))
                      )
                    }
                    onAfterLike={(celeb) =>
                      setLikedCelebs((prev) => {
                        const id = celeb?.id;
                        const exists = prev.some((x) => (x.id || x.celebrityId) === id);
                        if (exists) return prev;
                        return [{ id, name: celeb?.name, imageUrl: celeb?.imageUrl, isLiked: true }, ...prev].slice(0, limit);
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Scrolla höger"
              onClick={() => scrollBy(celebsRef, 1)}
              className="btn btnSlim"
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.9 }}
            >
              ›
            </button>
          </div>
        ) : (
          !isLoading && <p style={{ opacity: 0.75 }}>Inga kändisar ännu.</p>
        )}
      </div>

      {/* Followed users */}
      <div style={{ marginTop: ".75rem", position: "relative" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Användare du följer</h3>

        {followingUsers.length > 0 ? (
          <div style={{ position: "relative", padding: "0 .25rem" }}>
            <button
              type="button"
              aria-label="Scrolla vänster"
              onClick={() => scrollBy(usersRef, -1)}
              className="btn btnSlim"
              style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.9 }}
            >
              ‹
            </button>

            <div
              ref={usersRef}
              className="tribe-scroll"
              style={{
                display: "flex",
                gap: "0.75rem",
                overflowX: "auto",
                padding: "0.5rem 2.25rem",
                scrollSnapType: "x mandatory",
              }}
            >
              {followingUsers.map((u) => (
                <div
                  key={u.id || u.username}
                  style={{
                    minWidth: 300,
                    maxWidth: 340,
                    flex: "0 0 auto",
                    scrollSnapAlign: "start",
                  }}
                >
                  <UserCard
                    user={u}
                    viewer={user}
                    onAfterUnfollow={(unfollowed) =>
                      setFollowingUsers((prev) =>
                        prev.filter((x) => (x.id || x.userId) !== (unfollowed?.id || unfollowed?.userId))
                      )
                    }
                    onAfterFollow={(followed) => {
                      setFollowingUsers((prev) => {
                        const id = followed?.id || followed?.userId;
                        if (!id || prev.some((x) => (x.id || x.userId) === id)) return prev;
                        return [{ ...followed, isFollowing: true }, ...prev].slice(0, limit);
                      });
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Scrolla höger"
              onClick={() => scrollBy(usersRef, 1)}
              className="btn btnSlim"
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.9 }}
            >
              ›
            </button>
          </div>
        ) : (
          !isLoading && (
            <div style={{ marginTop: ".75rem" }}>
              <p style={{ opacity: 0.75, marginBottom: ".5rem" }}>Du följer inga användare ännu.</p>
              <button className="btn btnSlim" onClick={() => navigate("/feed")}>
                Hitta personer att följa
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default TribeCommunityOverview;