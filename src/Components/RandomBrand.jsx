import { useEffect, useState } from "react"
import { API_getBrands, API_guestGetBrandMatches } from "../Services/API";
import BrandCards from "./BrandCards";
import { IoReload } from "react-icons/io5";
import { MdClose } from "react-icons/md";

export const RandomBrand = ({bearer, testValues, category, currentBrandList})=> {
const [brands, setBrands] = useState([]);
const [filtered, setFiltered] = useState([])
const [showRandom, setShowRandom] = useState(false);
const [randomBrand, setRandomBrand]=  useState(null);
const [reload, setReload] = useState(0);
const variations = 100;


function FindRandomBrand(array) {
    if (!array || array.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return Array.of(array[randomIndex]);
    }
    
 useEffect(() => {
    // fetch from backend
    API_guestGetBrandMatches(bearer, testValues, setBrands, category, variations)
    // API_getBrands(category, 10, setBrands);
  }, [category]);

  useEffect(() => {
    if (brands && brands.length > 0 && currentBrandList) {

      // get all ids in the currentFeed for quick lookup
      const feedIds = new Set(currentBrandList.map((item) => item.id));

      // filter out brands that already exist in user's list
      const reduced  = brands.filter((brand) => !feedIds.has(brand.id))

      setRandomBrand(FindRandomBrand(reduced));

    }
  }, [brands, currentBrandList, reload]);

  return (
    <>
    {randomBrand && (
        <div className="random-brand">
            <div className="random-brand-header">
            <h3>Slumpmässigt varumärke?
            </h3>
                {showRandom && (<>
                    <IoReload 
                        className="clickable-icon" size={20}
                        onClick={() => setReload(prev => prev+1)}
                     />
                    <MdClose 
                        className="clickable-icon" size={20}
                        onClick={()=> setShowRandom(prev => !prev)}
                        />
                    </>
                )}
            
            </div>
        {!showRandom && <button 
            className="btn-small"
            onClick={()=> {
            setShowRandom(prev => !prev);
        }}>Överraska mig</button>}


        {showRandom && <BrandCards brandList={randomBrand} filter={false}/>}
        </div>
        )}
    </>
  );
}

export default RandomBrand;