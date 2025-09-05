import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_userSafeFetchJson } from "../Services/API";
import "../assets/css/CelebrityCard.css";
import SuggestedUsers from "./TribeSuggestedUsers";
import ProfileOverviewCard from "./ProfileOverviewCard";

function TribeCommunityOverview({ token, title = "Tribes", limit = 6, user, uiStatus, setUiStatus }) {
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const celebsRef = useRef(null);
  const usersRef   = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      if (!token) { setIsLoading(false); return; }
      setIsLoading(true);
      setError("");

      // Celebrities you like
      try {
        await API_userSafeFetchJson(token, "user/celebrities/liked", (data) => {
          if (!mounted) return;
          const items = Array.isArray(data) ? data : [];
          const updated = items.map((celeb) => ({ ...celeb, isLiked: true }));
          setLikedCelebs(updated.slice(0, limit));
        });
      } catch (err) {
        if (mounted) {
          console.error("Fel vid hämtning av gillade kändisar:", err);
          setError((prev) => prev || "Kunde inte hämta gillade kändisar");
        }
      }

      // Users you follow
      try {
        await API_userSafeFetchJson(token, "user/relationships/following", (data) => {
          if (!mounted) return;
          const list = Array.isArray(data) ? data : [];
          const minimalUsers = list.map((u) => ({
            id: u.id || u.userId,
            fullName: u.fullName || u.displayName || u.name || "Användare",
            // ProfileOverviewCard can auto-pick mask via profile fetch later if needed,
            // we keep minimal data here for the overview
            username: u.username || "",
            profileImageUrl: u.avatarUrl || u.photoUrl || "",
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

  // Scroll one full card at a time (the visible width of the scroller)
  const scrollBy = (ref, dir = 1) => {
    const node = ref?.current;
    if (!node) return;
    const step = node.clientWidth; // one viewport “page”
    node.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div style={{ marginTop: "1.25rem", position: "relative" , maxWidth:"500px"}}>
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
                overflowX: "auto",
                padding: "0.5rem 2.25rem",
                scrollSnapType: "x mandatory",
                gap: 0,                 // single-card viewport; no gaps between slides
              }}
            >
              {likedCelebs.map((c) => (
                <div
                  key={c.id || c.name}
                  style={{
                    flex: "0 0 100%",    // show one card at a time
                    minWidth: "100%",
                    maxWidth: "100%",
                    scrollSnapAlign: "start",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ProfileOverviewCard entity={c} kind="celeb" size={112} />
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
                overflowX: "auto",
                padding: "0.5rem 2.25rem",
                scrollSnapType: "x mandatory",
                gap: 0,
              }}
            >
              {followingUsers.map((u) => (
                <div
                  key={u.id || u.fullName}
                  style={{
                    flex: "0 0 100%",
                    minWidth: "100%",
                    maxWidth: "100%",
                    scrollSnapAlign: "start",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ProfileOverviewCard entity={u} kind="user" size={112} />
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

              <button
                className="btn-small"
                onClick={() => setUiStatus((p) => ({ ...p, showSuggestedUsers: !p.showSuggestedUsers }))}
              >
                {uiStatus.showSuggestedUsers ? "Dölj förslag" : "Föreslå andra användare"}
              </button>

              {uiStatus.showSuggestedUsers && (
                <SuggestedUsers token={token} user={user} setUiState={setUiStatus} />
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default TribeCommunityOverview;