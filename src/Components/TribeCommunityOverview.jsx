import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_userSafeFetchJson } from "../Services/API";
import "../assets/css/CelebrityCard.css";
import "../assets/css/TribeCommunityOverview.css";
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

  // Scroll one full card at a time
  const scrollBy = (ref, dir = 1) => {
    const node = ref?.current;
    if (!node) return;
    const step = node.clientWidth;
    node.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
  <div className="tribe-overview">
    <div className="tribe-header">
      <h2>{title}</h2>
      <button className="btn btnSlim" onClick={() => navigate("/community")}>
        Gå till Community
      </button>
    </div>

    {error && <p className="tribe-error">{error}</p>}
    {isLoading && <p className="tribe-loading">Laddar...</p>}

    {/* Liked celebrities */}
    <div className="tribe-section">
      <h3>Kändisar du gillar</h3>

      {likedCelebs.length > 0 ? (
        <div className="tribe-carousel-grid">
          <button
            type="button"
            aria-label="Scrolla vänster"
            onClick={() => scrollBy(celebsRef, -1)}
            className="tribe-scroll-btn prev"
          >
            ‹
          </button>

          <div ref={celebsRef} className="tribe-track">
            {likedCelebs.map((c) => (
              <div key={c.id || c.name} className="tribe-slide">
                <ProfileOverviewCard entity={c} kind="celeb" size={112} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scrolla höger"
            onClick={() => scrollBy(celebsRef, 1)}
            className="tribe-scroll-btn next"
          >
            ›
          </button>
        </div>
      ) : (
        !isLoading && <p className="tribe-loading">Inga kändisar ännu.</p>
      )}
    </div>

    {/* Followed users */}
    <div className="tribe-section">
      <h3>Användare du följer</h3>

      {followingUsers.length > 0 ? (
        <div className="tribe-carousel-grid">
          <button
            type="button"
            aria-label="Scrolla vänster"
            onClick={() => scrollBy(usersRef, -1)}
            className="tribe-scroll-btn prev"
          >
            ‹
          </button>

          <div ref={usersRef} className="tribe-track">
            {followingUsers.map((u) => (
              <div key={u.id || u.fullName} className="tribe-slide">
                <ProfileOverviewCard entity={u} kind="user" size={112} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Scrolla höger"
            onClick={() => scrollBy(usersRef, 1)}
            className="tribe-scroll-btn next"
          >
            ›
          </button>
        </div>
      ) : (
        !isLoading && (
          <div className="tribe-empty">
            <p>Du följer inga användare ännu.</p>
            <button
              className="btn-small"
              onClick={() =>
                setUiStatus((p) => ({ ...p, showSuggestedUsers: !p.showSuggestedUsers }))
              }
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
);}

export default TribeCommunityOverview;