import React, { useEffect, useMemo, useState } from "react";
import BrandCards from "../Components/BrandCards.jsx";
import CelebrityCard from "../Components/CelebrityCard.jsx";
import UserCard from "../Components/UserCard.jsx";

const AZURE_API = import.meta.env.VITE_AZURE_API;

function Search({
  token,
  brandsFeed = [],
  userProfile = null,
  minChars = 2,
  onActiveChange = () => {},
  placeholder = "Sök varumärken, kändisar och användare…",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundBrands, setFoundBrands] = useState([]);
  const [foundCelebs, setFoundCelebs] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isActive = debouncedTerm.length >= minChars;

  useEffect(() => {
    onActiveChange(isActive);
  }, [isActive]);

  // Do the actual search
  useEffect(() => {
    const term = debouncedTerm;
    if (!isActive) {
      setIsSearching(false);
      setFoundBrands([]);
      setFoundCelebs([]);
      setFoundUsers([]);
      return;
    }

    const doSearch = async () => {
      setIsSearching(true);

      // Brands
      if (Array.isArray(brandsFeed)) {
        const tl = term.toLowerCase();
        const local = brandsFeed.filter(
          (b) =>
            (b?.name || "").toLowerCase().includes(tl) ||
            (b?.category || "").toLowerCase().includes(tl)
        );
        setFoundBrands(local);
      } else {
        setFoundBrands([]);
      }

      // Celebrities
      try {
        const res = await fetch(
          `${AZURE_API}/celebrities?name=${encodeURIComponent(term)}&page=1&pageSize=12`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          const celebs = Array.isArray(data) ? data : data?.data || [];
          setFoundCelebs(celebs);
        } else {
          setFoundCelebs([]);
        }
      } catch (e) {
        console.error("Celeb search failed:", e);
        setFoundCelebs([]);
      }

      // Users
      if (token) {
        let users = [];
        try {
          let res = await fetch(
            `${AZURE_API}/user/discovery/search?query=${encodeURIComponent(term)}&limit=12`,
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) {
            res = await fetch(
              `${AZURE_API}/user/discovery/search?q=${encodeURIComponent(term)}&limit=12`,
              { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
            );
          }
          if (res.ok) {
            const data = await res.json();
            users = Array.isArray(data) ? data : data?.data || [];
          }
        } catch (e) {
          console.error("User search failed:", e);
        }
        setFoundUsers(users);
      } else {
        setFoundUsers([]);
      }

      setIsSearching(false);
    };

    doSearch();
  }, [debouncedTerm, token, brandsFeed]);

  const normalizedCelebs = useMemo(
    () =>
      (foundCelebs || []).map((c) => ({
        id: c.id ?? c.celebrityId,
        name: c.name ?? c.celebrityName,
        imageUrl: c.imageUrl ?? c.photoUrl,
        description: c.description,
        coordinates: c.coordinates,
        personalityProfile: c.personalityProfile,
        matchPercentage: c.matchWithUser ?? c.matchPercentage,
        isLiked: c.isLiked,
      })),
    [foundCelebs]
  );

  const normalizedUsers = useMemo(
    () =>
      (foundUsers || []).map((u) => ({
        id: u.id ?? u.userId,
        displayName: u.displayName ?? u.name,
        username: u.username,
        avatarUrl: u.avatarUrl ?? u.photoUrl,
        bio: u.bio ?? u.tagline,
        isFollowing: u.isFollowing,
      })),
    [foundUsers]
  );

  return (
    <div>
      {/* Input */}
      <div
        className="feed-search"
        style={{ display: "flex", gap: ".5rem", alignItems: "center", margin: "1rem 0" }}
      >
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          aria-label="Sök i flödet"
          style={{ flex: 1, padding: ".6rem .8rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
        {searchTerm && (
          <button className="btn btnSlim" onClick={() => setSearchTerm("")}>
            Rensa
          </button>
        )}
      </div>

      {/* Results */}
      {isActive && (
        <div className="search-results">
          {isSearching && <p style={{ opacity: 0.75 }}>Söker…</p>}

          {/* Users */}
          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ marginBottom: ".5rem" }}>
              Användare ({normalizedUsers.length})
              {!token && (
                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                  — logga in för att söka användare
                </span>
              )}
            </h3>
            {normalizedUsers.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {normalizedUsers.map((u) => (
                  <UserCard key={u.id || u.username} user={u} />
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.75 }}>Inga användare hittades.</p>
            )}
          </div>

          {/* Celebrities */}
          <div style={{ marginTop: "1.25rem" }}>
            <h3 style={{ marginBottom: ".5rem" }}>Kändisar ({normalizedCelebs.length})</h3>
            {normalizedCelebs.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {normalizedCelebs.map((c) => (
                  <CelebrityCard key={c.id || c.name} celeb={c} user={userProfile} />
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.75 }}>Inga kändisar hittades.</p>
            )}
          </div>

          {/* Brands (from current feed) */}
          <div style={{ marginTop: "1.25rem" }}>
            <h3 style={{ marginBottom: ".5rem" }}>Varumärken ({foundBrands.length})</h3>
            {foundBrands.length > 0 ? (
              <div className="feed">
                <BrandCards brandList={foundBrands} />
              </div>
            ) : (
              <p style={{ opacity: 0.75 }}>Inga varumärken hittades i ditt flöde.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;