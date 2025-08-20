import BrandCards from "./BrandCards";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import HiddenBrands from "../Components/HiddenBrands";


export default function BrandWardrobe({ brands, showHidden, hiddenBrands, setHiddenBrands, handleShowHidden })
{
  return (
    <div className="wardrobe-section">
      <h2>Din garderob</h2>
       <MdOutlinePlaylistRemove 
          className="clickable-icon hidden-brands-toggle"
          title="Visa gömda varumärken"
          onClick={() => handleShowHidden()}
          />
      
      {showHidden 
      ? <HiddenBrands brandList={hiddenBrands} setHiddenBrands={setHiddenBrands} />
      : <BrandCards brandList={brands}  />
      }
    </div>
  );
}
