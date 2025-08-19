import { useLocation } from "react-router";
import { useAtom, useAtomValue } from 'jotai';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { TbHeartX } from 'react-icons/tb';
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import { feedListAtom } from '../Atoms/FeedListAtom.jsx';
import '../assets/css/BrandCarousel.css';
import { CiCircleRemove } from "react-icons/ci";
import { API_brandInteraction } from "../Services/API.jsx";

export function BrandLikeOverlay({ brand }) {
  const token = useAtomValue(authTokenAtom);
  const [brandList, setBrandList] = useAtom(feedListAtom);
  const location =  useLocation();
  const isProfilePage = location.pathname === '/profile';

  const handleLike = (action) => {
    try {
      API_brandInteraction(action, brand.id, token);
      
      setBrandList(prevList =>
          prevList.map(b => 
              b.id === brand.id ? { ...b, isLiked: !b.isLiked } : b
          )
      );
      if (action ==='unlike' && isProfilePage){
          setBrandList((prev) => prev.filter((b) => b.id !== brand.id));}
      } catch (error) {
        console.error("Error handling like action:", error);
      }
  }
  const handleHide = (action) => {
    try {
      API_brandInteraction(action, brand.id, token);
      
      setBrandList(prevList =>
        prevList.map(b => 
          b.id === brand.id ? { ...b, isHidden: !b.isHidden } : b
        )
      );
      if (action ==='hide' )
        setBrandList((prev) => prev.filter((b) => b.id !== brand.id));
      if (action ==='unhide' && isProfilePage)
        console.log('remove from hidden list');
    } catch (error) {
      console.error("Error handling hide action:", error);
  }
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