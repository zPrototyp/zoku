import React, { useEffect, useMemo, useState } from "react";
import {
  PersonalityImages,
  PersonalityImageNameMap,
  ZokuMasks,
} from "../assets/uiData/PersonalityImages";
import "../assets/css/CelebrityDial.css";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function getCoords(src) {
  if (!src || typeof src !== "object") return null;

  const c = src.coordinates ?? src;
  const x = c.compassionVsAmbition ?? c.x;
  const y = c.changeVsTradition ?? c.y;

  return (typeof x === "number" && typeof y === "number") 
    ? { x, y } 
    : null;
}


function resolveMaskImage(entity) {
  if (!entity) return PersonalityImages.Mask;

  // 1. Primary personality name → ZokuMasks
  const name = entity?.primaryPersonality?.name;
  if (name && ZokuMasks[name]) return ZokuMasks[name];

  // 2. Primary profile type → ZokuMasks
  const type = entity?.personalityProfile?.primary?.type;
  if (type && ZokuMasks[type]) return ZokuMasks[type];

  // 3. Try various keys → PersonalityImages
  const key = entity.personalityType ?? entity.primaryType ?? entity.type ?? entity.name;
  const mapped = key ? PersonalityImageNameMap[key] || key : null;
  if (mapped && PersonalityImages[mapped]) return PersonalityImages[mapped];

  // 4. Direct image fields

  if (entity?.imgUrl) return entity.imgUrl;
  if (entity?.imageUrl) return entity.imageUrl;

  return PersonalityImages.Mask;
}

export default function CelebrityComparisonDial({
  a,
  b,
  user,
  celeb,
  aLabel = "Du",
  bLabel = "Vän",
  size = 300,
}) {
  const left = a ?? user ?? null;
  const right = b ?? celeb ?? null;

  const leftCoords = useMemo(() => getCoords(left), [left]);
  const rightCoords = useMemo(() => getCoords(right), [right]);

  const hasLeft =
    !!(leftCoords && typeof leftCoords.x === "number" && typeof leftCoords.y === "number");
  const hasRight =
    !!(rightCoords && typeof rightCoords.x === "number" && typeof rightCoords.y === "number");

  const radius = size / 2;
  const limit = radius - 20;
  const toPixel = (v) => ((v - 50) / 50) * limit + radius;

  // ✅ Hooks always run
  const [leftPx, setLeftPx] = useState({ x: radius, y: radius });
  const [rightPx, setRightPx] = useState({ x: radius, y: radius });

  const clampToCircle = (p) => {
    const dx = p.x - 50;
    const dy = p.y - 50;
    const mag = Math.sqrt(dx * dx + dy * dy);
    const f = mag > 50 ? 50 / mag : 1;
    const vx = 50 + dx * f;
    const vy = 50 + dy * f;
    return { x: toPixel(vx), y: toPixel(vy) };
  };

  useEffect(() => {
    if (!hasLeft || !hasRight) return; // ✅ do nothing if missing coords
    const id = requestAnimationFrame(() => {
      setLeftPx(clampToCircle({ x: leftCoords.x, y: leftCoords.y }));
      setRightPx(clampToCircle({ x: rightCoords.x, y: rightCoords.y }));
    });
    return () => cancelAnimationFrame(id);
  }, [hasLeft, hasRight, leftCoords?.x, leftCoords?.y, rightCoords?.x, rightCoords?.y]);

  const leftImg = useMemo(() => resolveMaskImage(left), [left]);
  const rightImg = useMemo(() => resolveMaskImage(right), [right]);

  const labelStyle = { fontSize: 12, fill: "#333" };

  // ✅ Conditional return AFTER hooks
  if (!hasLeft || !hasRight) {
    return <p style={{ color: "red" }}>Saknar koordinater för jämförelse.</p>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
      <svg width={size} height={size} style={{ touchAction: "none" }}>
        {/* background + axes */}
        <circle cx={radius} cy={radius} r={radius - 1} fill="#ECDCCD" stroke="#ccc" />
        <line x1={radius} y1={0} x2={radius} y2={size} stroke="#aaa" />
        <line x1={0} y1={radius} x2={size} y2={radius} stroke="#aaa" />

        {/* axis labels */}
        <text x={radius} y={20} textAnchor="middle" style={labelStyle}>Förändring</text>
        <text x={radius} y={size - 8} textAnchor="middle" style={labelStyle}>Tradition</text>
        <text x={20} y={radius} textAnchor="start" dominantBaseline="middle" style={labelStyle}>Gemenskap</text>
        <text x={size - 20} y={radius} textAnchor="end" dominantBaseline="middle" style={labelStyle}>Ambition</text>

        {/* Left marker */}
        <g
          transform={`translate(${clamp(leftPx.x, 0, size)}, ${clamp(leftPx.y, 0, size)})`}
          style={{ transition: "transform 420ms ease" }}
        >
          <image href={leftImg} x={-25} y={-25} height={50} preserveAspectRatio="xMidYMid slice" />
          <title>{left?.name || aLabel}</title>
        </g>

        {/* Right marker */}
        <g
          transform={`translate(${clamp(rightPx.x, 0, size)}, ${clamp(rightPx.y, 0, size)})`}
          style={{ transition: "transform 420ms ease 60ms" }}
        >
          <image href={rightImg} x={-25} y={-25} height={50} preserveAspectRatio="xMidYMid slice" />
          <title>{right?.name || bLabel}</title>
        </g>
      </svg>
    </div>
  );
}
