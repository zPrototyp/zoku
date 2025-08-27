import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { authTokenAtom } from "../Atoms/AuthAtom.jsx";
import { API_likeCelebrity, API_unlikeCelebrity } from "../Services/API.jsx";
import "../assets/css/BrandCarousel.css";

export default function CelebrityLikeOverlay({ celeb, onAfterLike, onAfterUnlike }) {
  const token = useAtomValue(authTokenAtom);
  const [liked, setLiked] = useState(Boolean(celeb?.isLiked));

  useEffect(() => { setLiked(Boolean(celeb?.isLiked)); }, [celeb?.isLiked]);

  const toggle = async () => {
    if (!token) { alert("Logga in för att gilla kändisar."); return; }
    try {
      if (liked) {
        await API_unlikeCelebrity(celeb.id, token);
        setLiked(false);
        onAfterUnlike?.(celeb);
      } else {
        await API_likeCelebrity(celeb.id, token);
        setLiked(true);
        onAfterLike?.(celeb);
      }
    } catch (e) {
      console.error("Celebrity like toggle failed:", e);
    }
  };

  return (
    <div className="like-overlay" style={{ position: "absolute", top: 8, right: 8 }}>
      {liked ? (
        <MdFavorite title="Ta bort från favoriter" onClick={toggle} />
      ) : (
        <MdFavoriteBorder title="Gilla kändis" onClick={toggle} />
      )}
    </div>
  );
}
