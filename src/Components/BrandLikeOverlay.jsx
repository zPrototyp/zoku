import { useLocation } from "react-router";
import { useAtom } from 'jotai';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { TbHeartX } from 'react-icons/tb';
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import { feedListAtom } from '../Atoms/FeedListAtom.jsx';
import '../assets/css/BrandCarousel.css';
import { CiCircleRemove } from "react-icons/ci";

export function BrandLikeOverlay({ brand }) {
  const [token] = useAtom(authTokenAtom);
  const [brandList, setBrandList] = useAtom(feedListAtom);
  const location =  useLocation();
  const isProfilePage = location.pathname === '/profile';

  const sendInteraction = (userAction) => {
    // console.log("Brand before update:", brandList.find(b => b.id === brand.id));
    token && fetch("/api/user/brands/interactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            brandId: brand.id,  
            action: userAction
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to record interaction: ${userAction}`, res.data);
        }
        return res.json();
    })
    .then(data => {return data.data})
    .catch(error => {
        console.error("Error updating interaction:", error);
    });
  }

  const handleLike = (action) => {
    sendInteraction(action);
    setBrandList(prevList =>
        prevList.map(b => 
            b.id === brand.id ? { ...b, isLiked: !b.isLiked } : b
        )
    );
    if (action ==='unlike' && isProfilePage){
        setBrandList((prev) => prev.filter((b) => b.id !== brand.id));}
  }
  const handleHide = (action) => {
    sendInteraction(action);    
    setBrandList(prevList =>
        prevList.map(b => 
            b.id === brand.id ? { ...b, isHidden: !b.isHidden } : b
        )
    );
    if (action ==='hide' )
        setBrandList((prev) => prev.filter((b) => b.id !== brand.id));
  }
  
  
return (
  <div className="like-overlay">
    {brand.isHidden ? (
      <CiCircleRemove
        title="Rensa från listan med gömda varumärken" 
        onClick={() => handleHide("unhide")} />
    ) : (
      <>
        {brand.isLiked ? (
          <MdFavorite
            title="Ta bort från min varumärkesgarderob"
           onClick={() => handleLike("unlike")} />
        ) : (
          <MdFavoriteBorder
            title="Lägg till i min varumärkesgarderob" 
            onClick={() => handleLike("like")} />
        )}
        <TbHeartX
            title="Göm detta förslaget från mig"
            onClick={() => handleHide("hide")} />
      </>
    )}
  </div>
);
}