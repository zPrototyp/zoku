import { useAtom } from "jotai"
import { BrandLikeOverlay } from "./BrandLikeOverlay"
import { MdKeyboardDoubleArrowDown } from "react-icons/md"
import { authTokenAtom } from "../Atoms/AuthAtom"
import { ShareOverlay } from "./ShareOverlay"
import { valueProfileAtom } from "../Atoms/ValueProfileAtom"
// Print the brand cards, given one brand
  export const PrintBrandCard = ({brand, setActiveModal}) => {
    const [token,] = useAtom(authTokenAtom);
    const [user,] = useAtom(valueProfileAtom);
    return (
        <div className='feedpage-brand' key={brand.id}>
          {token && <BrandLikeOverlay brand={brand} />}
          <img src={brand.imgUrl ? brand.imgUrl : `dummy-brand_${brand.category}.jpg`} alt={brand.name}/>
          <p>{brand.name} / {brand.matchPercentage}% match</p>
          <div className="expand-feed-brand">
              <button><MdKeyboardDoubleArrowDown onClick={() =>setActiveModal(brand)}/></button>
          </div>
          <ShareOverlay personality={user} profile={brand} brand={true}/>
        </div>  
        )
  }