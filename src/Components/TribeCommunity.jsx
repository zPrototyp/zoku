import React, { useEffect, useState } from "react";
import { API_userSafeFetchJson } from "../Services/API";

function TribeCommunity({ token, title = "Tribes" })
{
  const [likedCelebs, setLikedCelebs] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    // Liked celebrities
    try { API_userSafeFetchJson(token, "user/celebrities/liked", setLikedCelebs); }
    catch (err) {
      console.error("Fel vid hämtning av gillade kändisar:", err);
      setError("Kunde inte hämta gillade kändisar");
    }

    // Following users
    try { API_userSafeFetchJson(token, "user/relationships/following", setFollowingUsers); }
    catch (err) {
      console.error("Fel vid hämtning av följda användare:", err);
      setError((prev) => prev || "Kunde inte hämta följda användare");
    }
  }, [token]);

  const TribeGrid = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
      {children}
    </div>
  );

  const CelebCard = ({ celeb }) => (
    <div className="card hoverable" style={{ padding: "0.75rem", borderRadius: 12 }}>
      <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
        {celeb?.imageUrl && (
          <img
            src={celeb.imageUrl}
            alt={celeb.name}
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
          />
        )}
        <div>
          <div style={{ fontWeight: 600 }}>{celeb?.name || "Okänd kändis"}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {celeb?.personality || celeb?.primaryType || ""}
          </div>
        </div>
      </div>
    </div>
  );

  const UserCard = ({ user }) => (
    <div className="card hoverable" style={{ padding: "0.75rem", borderRadius: 12 }}>
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

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>{title}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Liked Celebrities */}
      <div style={{ marginTop: ".75rem", marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: ".5rem" }}>Kändisar du gillar</h3>
        {likedCelebs && likedCelebs.length > 0 ? (
          <TribeGrid>
            {likedCelebs.map((c) => (
              <CelebCard
                key={c.id || c.celebrityId || c.name}
                celeb={{
                  id: c.id || c.celebrityId,
                  name: c.name || c.celebrityName,
                  imageUrl: c.imageUrl || c.photoUrl,
                  personality: c.personality || c.primaryType,
                }}
              />
            ))}
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
            {followingUsers.map((u) => (
              <UserCard
                key={u.id || u.userId || u.username}
                user={{
                  id: u.id || u.userId,
                  displayName: u.displayName || u.name,
                  username: u.username,
                  avatarUrl: u.avatarUrl || u.photoUrl,
                  bio: u.bio || u.tagline,
                }}
              />
            ))}
          </TribeGrid>
        ) : (
          <p style={{ opacity: 0.75 }}>Du följer inga användare ännu.</p>
        )}
      </div>
    </div>
  );
}

export default TribeCommunity;