import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useLocation } from "react-router";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { API_likeCelebrity, API_unlikeCelebrity } from "../Services/API.jsx";
import "../assets/css/BrandCarousel.css";

function CelebrityLikeOverlay({ celeb, onAfterLike, onAfterUnlike, onHide }) {
  const token = useAtomValue(authTokenAtom);
  const location = useLocation();
  const [liked, setLiked] = useState(Boolean(celeb?.isLiked));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(Boolean(celeb?.isLiked));
  }, [celeb?.id]);

  const handleLikeToggle = async () => {
    if (!token) { alert("Logga in för att gilla kändisar."); return; }
    if (!celeb?.id || busy) return;

    setBusy(true);
    const next = !liked;
    setLiked(next);

    try {
      if (next) {
        await API_likeCelebrity(celeb.id, token);
        onAfterLike?.({ ...celeb, isLiked: true });
      } else {
        await API_unlikeCelebrity(celeb.id, token);
        onAfterUnlike?.({ ...celeb, isLiked: false });
      }
    } catch (e) {
      console.error("Error handling celebrity like:", e);
      setLiked(!next);
    } finally {
      setBusy(false);
    }
  };

  const commonIconStyle = {
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.6 : 1,
    transition: "transform .12s ease",
  };

  return (
    <div className="like-overlay">
      {/* Heart */}
      {liked ? (
        <MdFavorite
          title="Ta bort från favoriter"
          onClick={handleLikeToggle}
          style={commonIconStyle}
        />
      ) : (
        <MdFavoriteBorder
          title="Gilla kändis"
          onClick={handleLikeToggle}
          style={commonIconStyle}
        />
      )}
    </div>
  );
}
export default CelebrityLikeOverlay;