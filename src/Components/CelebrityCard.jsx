import React, { useMemo, useState } from "react"; 
import CelebrityComparisonDial from "./CelebrityComparisonDial";
import SecondaryPersonalityCard from "./SecondaryPersonalityCard";
import TopCelebrityBrand from "./TopCelebrityBrand";
import { valueProfiles } from "../assets/uiData/zoku_profiles_se";
import "../assets/css/CelebrityCard.css";
import CelebrityLikeOverlay from "./CelebrityLikeOverlay";

function getProfileSafe(type)
{
  if (!type) return null;
  return valueProfiles?.[type] || null;
}

export default function CelebrityCard({ celeb, user, celebBrands = [], onAfterUnlike, onAfterLike })
{
  const [expanded, setExpanded] = useState(false);
  const [showDial, setShowDial] = useState(false);

  if (!celeb || typeof celeb !== "object") return null;

  const imgSrc = celeb.imageUrl || celeb.imgUrl || null;

  const matchPct = useMemo(() =>
  {
    const v =
      typeof celeb.matchWithUser === "number"
        ? celeb.matchWithUser
        : celeb.matchPercentage;
    return Math.round(Number.isFinite(v) ? v : 0);
  }, [celeb.matchWithUser, celeb.matchPercentage]);

  const primary = celeb?.personalityProfile?.primary ?? null;
  const secondary = celeb?.personalityProfile?.secondary ?? null;
  const third = celeb?.personalityProfile?.third ?? null;
  const pProf = useMemo(() => getProfileSafe(primary?.type), [primary?.type]);
  const sProf = useMemo(() => getProfileSafe(secondary?.type), [secondary?.type]);
  const tProf = useMemo(() => getProfileSafe(third?.type), [third?.type]);

  const hasAnyBlock = Boolean(pProf || sProf || tProf);

  const celebCoords = useMemo(() =>
  {
    const c = celeb.coordinates || {};
    const x =
      typeof c.compassionVsAmbition === "number"
        ? c.compassionVsAmbition
        : celeb.compassionVsAmbition;
    const y =
      typeof c.changeVsTradition === "number"
        ? c.changeVsTradition
        : celeb.changeVsTradition;
    return {
      compassionVsAmbition: typeof x === "number" ? x : undefined,
      changeVsTradition: typeof y === "number" ? y : undefined,
    };
  }, [celeb.coordinates, celeb.compassionVsAmbition, celeb.changeVsTradition]);

  const userHasCoords =
    user &&
    typeof user.compassionVsAmbition === "number" &&
    typeof user.changeVsTradition === "number";

  const celebHasCoords =
    typeof celebCoords.compassionVsAmbition === "number" &&
    typeof celebCoords.changeVsTradition === "number";

  const canShowDial = userHasCoords && celebHasCoords;
  const dialUser = user;
  const dialCeleb =
  {
    name: celeb.name,
    coordinates: {
      compassionVsAmbition: celebCoords.compassionVsAmbition,
      changeVsTradition: celebCoords.changeVsTradition,
    },
    personalityProfile: celeb.personalityProfile,
  };

  const compareDisabledTitle = !userHasCoords
    ? "Din profil saknar koordinater (compassionVsAmbition / changeVsTradition)."
    : !celebHasCoords
    ? "Kändisen saknar koordinater för jämförelse."
    : "";

  return (
    <div className="celebCard">
      {/* Header */}
      <div className="celebHeader" style={{ position: "relative" }}>
        {/* Like overlay (top-right) */}
        <CelebrityLikeOverlay
          celeb={celeb}
          onAfterLike={onAfterLike}
          onAfterUnlike={onAfterUnlike}
        />

        {imgSrc && (
          <img
            className="celebCover"
            src={imgSrc}
            alt={celeb?.name || "Kändis"}
            loading="lazy"
          />
        )}
        <div className="celebMeta">
          <div className="celebTitleRow">
            <h3 className="celebName">{celeb?.name || "Okänd kändis"}</h3>
            <span className="celebMatch">{matchPct}% match</span>
          </div>
          {pProf && <div className="celebPrimary">{pProf.title}</div>}
          {celeb?.description && (
            <p className="celebDesc">{celeb.description}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="celebActions">
        {hasAnyBlock && (
          <button
            className="btn btnSlim"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Visa mindre" : "Visa mer"}
          </button>
        )}

        {/* Compare button */}
        <button
          className="btn btnSlim"
          onClick={() => setShowDial((v) => !v)}
          disabled={!canShowDial}
          title={canShowDial ? "" : compareDisabledTitle}
          aria-disabled={!canShowDial}
        >
          {showDial ? "Dölj jämförelse" : "Jämför"}
        </button>
      </div>

      {/* Comparison dial  */}
      {showDial && canShowDial && (
        <div className="celebDial">
          <CelebrityComparisonDial user={dialUser} celeb={dialCeleb} />
        </div>
      )}

      {/* Personalities */}
      {expanded && (
        <div className="celebExpanded">
          {/* Primary */}
          {pProf && primary && (
            <div className="primaryBlock">
              <img
                className="primaryMask"
                src={pProf.imgSrc}
                alt={pProf.title}
                loading="lazy"
              />
              <div className="primaryBody">
                <div className="primaryTitleRow">
                  <div className="primaryKanji">{pProf.kanji}</div>
                  <div className="primaryPct">
                    {Math.round(primary?.matchPercentage ?? 0)}%
                  </div>
                </div>
                <div className="primaryTitle">{pProf.title}</div>
                {pProf.subtitle && (
                  <div className="primarySubtitle">{pProf.subtitle}</div>
                )}
                {Array.isArray(pProf.text) &&
                  pProf.text.slice(0, 2).map((t, i) => (
                    <p key={i} className="primaryText">
                      {t}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Secondary */}
          <div className="secondary-container">
            {sProf && secondary && (
              <SecondaryPersonalityCard
                personality={{
                  name: secondary.type,
                  matchPercentage: Math.round(secondary.matchPercentage ?? 0),
                }}
                profile={sProf}
              />
            )}

            {tProf && third && (
              <SecondaryPersonalityCard
                personality={{
                  name: third.type,
                  matchPercentage: Math.round(third.matchPercentage ?? 0),
                }}
                profile={tProf}
              />
            )}
          </div>
        </div>
      )}

      {/* Top brand per category */}
      {!!celebBrands?.length && (
        <div className="celebBrands">
          <TopCelebrityBrand brandList={celebBrands} />
        </div>
      )}
    </div>
  );
}
