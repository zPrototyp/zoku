import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_userSafeFetchJson } from "../Services/API";

function TribeCommunityOverview({ token, title = "Tribes", limit = 6, user }) {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchFollowing = async () => {
      if (!token) { setIsLoading(false); return; }
      setIsLoading(true);
      setError("");

      try {
        await API_userSafeFetchJson(token, "user/relationships/following", (data) => {
          if (!mounted) return;
          const list = Array.isArray(data) ? data : [];
          const normalized = list.map((u) => ({
            id: u.id || u.userId,
            displayName: u.displayName || u.name || u.username || "Användare",
            username: u.username || "",
            avatarUrl: u.avatarUrl || u.photoUrl || null,
            bio: u.bio || u.tagline || "",
          }));
          setFollowingUsers(normalized.slice(0, limit));
        });
      } catch (err) {
        if (!mounted) return;
        console.error("Fel vid hämtning av följda användare:", err);
        setError("Kunde inte hämta följda användare");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchFollowing();
    return () => { mounted = false; };
  }, [token, limit]);

  const scrollBy = (dir = 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const getInitials = (name = "") => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase() || "U";
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

      {!isLoading && followingUsers.length > 0 && (
        <div style={{ position: "relative", marginTop: ".75rem", padding: "0 .25rem" }}>
          {/* Left arrow */}
          <button
            type="button"
            aria-label="Scrolla vänster"
            onClick={() => scrollBy(-1)}
            className="btn btnSlim"
            style={{
              position: "absolute", left: 0, top: "50%",
              transform: "translateY(-50%)", zIndex: 2, opacity: 0.9,
            }}
          >
            ‹
          </button>

          {/* Carousel scroller */}
          <div
            ref={scrollerRef}
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
                className="tribe-user-chip"
                style={{
                  minWidth: 120,
                  maxWidth: 140,
                  flex: "0 0 auto",
                  background: "var(--card-bg, #141414)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "0.75rem",
                  textAlign: "center",
                  scrollSnapAlign: "start",
                }}
              >
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt={u.displayName}
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      objectFit: "cover", margin: "0 auto 0.5rem", display: "block",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      width: 64, height: 64, borderRadius: "50%",
                      margin: "0 auto 0.5rem",
                      display: "grid", placeItems: "center",
                      background: "rgba(255,255,255,0.08)",
                      fontWeight: 700, fontSize: 18,
                    }}
                  >
                    {getInitials(u.displayName)}
                  </div>
                )}
                <div
                  title={u.displayName}
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.displayName}
                </div>
                {u.username && (
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    @{u.username}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            aria-label="Scrolla höger"
            onClick={() => scrollBy(1)}
            className="btn btnSlim"
            style={{
              position: "absolute", right: 0, top: "50%",
              transform: "translateY(-50%)", zIndex: 2, opacity: 0.9,
            }}
          >
            ›
          </button>
        </div>
      )}

      {!isLoading && followingUsers.length === 0 && (
        <div style={{ marginTop: ".75rem" }}>
          <p style={{ opacity: 0.75, marginBottom: ".5rem" }}>
            Du följer inga användare ännu.
          </p>
        </div>
      )}
    </div>
  );
}

export default TribeCommunityOverview;