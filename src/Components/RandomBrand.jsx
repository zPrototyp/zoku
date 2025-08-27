import { useEffect, useState } from "react"
import { API_getBrands } from "../Services/API";

export const RandomBrand = ({category, currentFeed})=> {
const [brands, setBrands] = useState(null);
 useEffect(() => {
    // fetch from backend
    API_getBrands(category, 10, setBrands);
  }, [category]);

  useEffect(() => {
    if (brands && brands.length > 0 && currentFeed) {
      // get all ids in the currentFeed for quick lookup
      const feedIds = new Set(currentFeed.map((item) => item.id));

      // filter out brands that already exist in feed
      const filtered = brands.filter((brand) => !feedIds.has(brand.id));

      setBrands(filtered);
    }
  }, [brands, currentFeed]);

  return (
    <div>
      {brands.map((b) => (
        <div key={b.id}>{b.name}</div>
      ))}
    </div>
  );
}

export default RandomBrand;