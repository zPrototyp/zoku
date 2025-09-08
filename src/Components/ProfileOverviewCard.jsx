import React, { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { ZokuMasks } from "../assets/uiData/PersonalityImages";
import "../assets/css/ProfileOverviewCard.css";

const AZURE_API = import.meta.env.VITE_AZURE_API;
const toBase = () => (AZURE_API || "").replace(/\/+$/, "");
const apiRoot = () => (/\/api\/v1\b/.test(toBase()) ? toBase() : `${toBase()}/api/v1`);

const normalizeType = (t) => {
  if (!t) return null;
  const s = String(t).trim().toLowerCase();
  const keys = Object.keys(ZokuMasks || {});
  return keys.find((k) => k.toLowerCase() === s) || null;
};

function pickUserPrimaryType(e) {
  if (!e) return null;
  const candidates = [
    e?.primaryType,
    e?.personalityProfile?.primary?.type,
    e?.personality?.primary?.type,
    e?.primaryPersonality?.name,
    e?.profile?.primaryType,
  ];
  for (const c of candidates) {
    const n = normalizeType(c);
    if (n) return n;
  }
  return null;
}

function ProfileOverviewCard({
  entity,
  kind = "auto",
  size = 96,
  className = "",
  onClick,
}) {
  const token = useAtomValue(authTokenAtom);

  // Decide celeb vs user
  const isCeleb = useMemo(() => {
    if (kind === "celeb") return true;
    if (kind === "user") return false;
    const e = entity || {};
    return (
      e.celebrityId != null ||
      e.isCelebrity === true ||
      (e.name && !e.fullName)
    );
  }, [kind, entity]);

  const displayName = useMemo(() => {
    if (!entity) return "Okänd";
    return isCeleb
      ? (entity.name || "Okänd kändis")
      : (entity.fullName || entity.displayName || entity.name || "Användare");
  }, [entity, isCeleb]);

  // User
  const initialUserType = useMemo(
    () => (!isCeleb ? pickUserPrimaryType(entity) : null),
    [entity, isCeleb]
  );
  const [resolvedType, setResolvedType] = useState(initialUserType);

  useEffect(() => {
    let mounted = true;

    async function fetchUserType(userId) {
      try {
        const url = `${apiRoot()}/user/discovery/profile/${userId}`;
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const text = await res.text();
        const payload = text ? JSON.parse(text) : null;
        if (!res.ok) return;

        const data = payload?.data || payload || {};
        const t =
          normalizeType(data?.primaryType) ||
          normalizeType(data?.personalityProfile?.primary?.type) ||
          normalizeType(data?.personality?.primary?.type) ||
          null;

        if (mounted && t) setResolvedType(t);
      } catch {
      }
    }

    if (!isCeleb && !initialUserType && entity) {
      const userId = entity?.id ?? entity?.userId ?? null;
      if (userId && token) fetchUserType(userId);
    }

    return () => { mounted = false; };
  }, [initialUserType, isCeleb, entity, token]);

  const userType = resolvedType || initialUserType || null;
  const userMaskUrl = !isCeleb && userType ? (ZokuMasks?.[userType] || null) : null;

  // Celebrity
  const celebPic = isCeleb
    ? (entity?.imageUrl ||
       entity?.imgUrl ||
       entity?.photoUrl ||
       entity?.profileImageUrl ||
       entity?.avatarUrl ||
       null)
    : null;

  const clickable = Boolean(onClick);
  const wrapperClass = [
    "profile-circle-card",
    clickable ? "is-clickable" : "",
    className
    ].filter(Boolean).join(" ");

  return (
    <div
      className={wrapperClass}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={displayName}
    >
      {/* Circle */}
      <div className="secondary-card-circle">
        {isCeleb ? (
          (entity?.imageUrl ||
           entity?.imgUrl ||
           entity?.photoUrl ||
           entity?.profileImageUrl ||
           entity?.avatarUrl) ? (
            <img
              src={
                entity.imageUrl ||
                entity.imgUrl ||
                entity.photoUrl ||
                entity.profileImageUrl ||
                entity.avatarUrl
              }
              alt={displayName}
              className="profile-image"
              loading="lazy"
            />
          ) : null
        ) : (
          userMaskUrl ? (
            <img
              src={userMaskUrl}
              alt={userType || "Mask"}
              className="profile-mask"
              loading="lazy"
            />
          ) : null
        )}
      </div>

      {/* Name */}
      <div className="profile-name">
        {displayName}
      </div>
    </div>
  );
}

export default ProfileOverviewCard;