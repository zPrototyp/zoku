import React, { useEffect, useMemo, useState } from "react";
import { PersonalityImages, PersonalityImageNameMap, ZokuMasks } from "../assets/uiData/PersonalityImages";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import "../assets/css/CelebrityDial.css";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Using coordinates
function getCoords(src)
{
  if (!src || typeof src !== "object") return null;

  const c = src.coordinates || {};
  if (
    typeof c.compassionVsAmbition === "number" &&
    typeof c.changeVsTradition === "number"
  )
  {
    return {
      x: c.compassionVsAmbition,
      y: c.changeVsTradition,
    };
  }

  if (
    typeof src.compassionVsAmbition === "number" &&
    typeof src.changeVsTradition === "number"
  )
  {
    return {
      x: src.compassionVsAmbition,
      y: src.changeVsTradition,
    };
  }

  if (typeof src.x === "number" && typeof src.y === "number")
  {
    return { x: src.x, y: src.y };
  }

  return null;
}

function resolveMaskImage(entity)
{
  if (!entity) return PersonalityImages.Mask;

  const primaryName = entity?.primaryPersonality?.name;
  if (primaryName)
  {
    return ZokuMasks[primaryName];
  }

  const primaryType = entity?.personalityProfile?.primary?.type;
  if (primaryType)
  {
    return ZokuMasks[primaryType];
  }

  const keyCandidate =
    entity?.personalityType ||
    entity?.primaryType ||
    entity?.type ||
    entity?.name;
  const mappedKey = keyCandidate ? PersonalityImageNameMap[keyCandidate] || keyCandidate : null;
  if (mappedKey && PersonalityImages[mappedKey]) {
    return PersonalityImages[mappedKey];
  }

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

  const hasLeft = !!(leftCoords && typeof leftCoords.x === "number" && typeof leftCoords.y === "number");
  const hasRight = !!(rightCoords && typeof rightCoords.x === "number" && typeof rightCoords.y === "number");

  if (!hasLeft || !hasRight)
  {
    return <p style={{ color: "red" }}>Saknar koordinater för jämförelse.</p>;
  }

  const radius = size / 2;
  const limit = radius - 20;
  const toPixel = (v) => ((v - 50) / 50) * limit + radius;

  const [leftPx, setLeftPx] = useState({ x: radius, y: radius });
  const [rightPx, setRightPx] = useState({ x: radius, y: radius });

  const clampToCircle = (p) =>
  {
    const dx = p.x - 50;
    const dy = p.y - 50;
    const mag = Math.sqrt(dx * dx + dy * dy);
    const f = mag > 50 ? 50 / mag : 1;
    const vx = 50 + dx * f;
    const vy = 50 + dy * f;
    return { x: toPixel(vx), y: toPixel(vy) };
  };

  useEffect(() => {
    const id = requestAnimationFrame(() =>
    {
      setLeftPx(clampToCircle({ x: leftCoords.x, y: leftCoords.y }));
      setRightPx(clampToCircle({ x: rightCoords.x, y: rightCoords.y }));
    });
    return () => cancelAnimationFrame(id);
  }, [leftCoords?.x, leftCoords?.y, rightCoords?.x, rightCoords?.y]);

  const leftImg = useMemo(() => resolveMaskImage(left), [left]);
  const rightImg = useMemo(() => resolveMaskImage(right), [right]);

  const labelStyle = { fontSize: 12, fill: "#333" };

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
