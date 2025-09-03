import React, { useEffect, useMemo, useRef, useState } from "react";
import BrandCards from "../Components/BrandCards.jsx";
import CelebrityCard from "../Components/CelebrityCard.jsx";
import UserCard from "../Components/UserCard.jsx";

const AZURE_API = import.meta.env.VITE_AZURE_API;

// Hide admin
const HIDDEN_USER_IDS = [
  "be61eff7-28d6-4bcd-a66f-2d8d429cf364",
];
const HIDDEN_FULLNAMES = ["admin", "Admin", "System Aministratör"];

const toBase = () => (AZURE_API || "").replace(/\/+$/, "");
const apiRoot = () => (/\/api\/v1\b/.test(toBase()) ? toBase() : `${toBase()}/api/v1`);

const lc = (v) => (v == null ? "" : String(v).trim().toLowerCase());

function shouldExcludeUser(u, meId) {
  const id = lc(u?.id ?? u?.userId ?? "");
  const fullName = lc(u?.fullName ?? u?.displayName ?? u?.name ?? "");

  if (meId && id === lc(meId)) return true;
  if (HIDDEN_USER_IDS.map(lc).includes(id)) return true;
  if (fullName && HIDDEN_FULLNAMES.map(lc).includes(fullName)) return true;
  if (u?.isSelf === true) return true;

  return false;
}

// Fetch all brands
async function searchAllBrands(term) {
  const base = toBase();
  const q = encodeURIComponent(term);
  const tries = [
    `/brands?name=${q}&page=1&pageSize=50`,
    `/brands?Name=${q}&Page=1&PageSize=50`,
    `/brands?query=${q}&page=1&pageSize=50`,
    `/brands?name=${q}`,
  ];

  for (const path of tries) {
    try {
      const res = await fetch(`${base}${path}`, { headers: { "Content-Type": "application/json" } });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) continue;

      let items = [];
      if (Array.isArray(data)) items = data;
      else if (Array.isArray(data?.data)) items = data.data;
      else if (Array.isArray(data?.data?.brands)) items = data.data.brands;
      else if (Array.isArray(data?.results)) items = data.results;

      if (items?.length) return items;
    } catch (e) {
      if (import.meta?.env?.DEV) console.warn(`[searchAllBrands] attempt failed for ${path}:`, e?.message ?? e);
      continue;
    }
  }

  try {
    const res = await fetch(`${base}/brands?Limit=500`, { headers: { "Content-Type": "application/json" } });
    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : await res.text();
    let all = [];
    if (Array.isArray(payload)) all = payload;
    else if (Array.isArray(payload?.data)) all = payload.data;
    else if (Array.isArray(payload?.data?.brands)) all = payload.data.brands;

    const tl = term.toLowerCase();
    return (all || []).filter(
      (b) =>
        (b?.name || "").toLowerCase().includes(tl) ||
        (b?.category || "").toLowerCase().includes(tl) ||
        (b?.shortDescription || "").toLowerCase().includes(tl)
    );
  } catch {
    return [];
  }
}

function Search({
  token,
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

  const currentUserId = userProfile?.userId ?? userProfile?.id ?? "";
  const currentUserKey = useMemo(() => String(currentUserId), [currentUserId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isActive = debouncedTerm.length >= minChars;

  useEffect(() => {
    onActiveChange(isActive);
  }, [isActive, onActiveChange]);

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
      try {
        const brands = await searchAllBrands(term);
        setFoundBrands(Array.isArray(brands) ? brands : []);
      } catch {
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
          const base = (AZURE_API || "").replace(/\/+$/, "");
          const hasApiV1 = /\/api\/v1\b/.test(base);
          const root = hasApiV1 ? base : `${base}/api/v1`;

          const params = new URLSearchParams({
            searchTerm: term,
            name: term,
            username: term,
            page: "1",
            pageSize: "12",
          });

          const url = `${root}/user/discovery/search?${params.toString()}`;

          const res = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const payload = await res.json();

            if (Array.isArray(payload?.data?.items)) {
              users = payload.data.items;
            } else if (Array.isArray(payload)) {
              users = payload;
            } else if (Array.isArray(payload?.data)) {
              users = payload.data;
            } else if (Array.isArray(payload?.items)) {
              users = payload.items;
            } else if (Array.isArray(payload?.results)) {
              users = payload.results;
            } else {
              users = [];
            }

            users = (users || []);
          } else {
            console.warn("User search failed with status:", res.status);
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
  }, [debouncedTerm, token, currentUserKey]);

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

  const normalizedUsers = useMemo(() => {
    // console.log(foundUsers)
    if (!Array.isArray(foundUsers)) return [];
    return foundUsers.map((u) => ({
      id: u.id ?? u.userId ?? "",
      displayName: u.fullName ?? u.displayName ?? u.name ?? "",
      username: "",
      avatarUrl: u.profileImageUrl ?? u.avatarUrl ?? u.photoUrl ?? "",
      bio: u.bio ?? "",
      isFollowing: !!u.isFollowing,
    }));
  }, [foundUsers]);

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
                  <UserCard key={u.id || u.displayName} user={u} viewer={userProfile} />
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

          {/* Brands */}
          <div style={{ marginTop: "1.25rem" }}>
            <h3 style={{ marginBottom: ".5rem" }}>Varumärken ({foundBrands.length})</h3>
            {foundBrands.length > 0 ? (
              <div className="feed">
                <BrandCards brandList={foundBrands} categorize={true} />
              </div>
            ) : (
              <p style={{ opacity: 0.75 }}>Inga varumärken hittades.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;