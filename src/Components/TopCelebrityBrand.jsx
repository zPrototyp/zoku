import React, { useMemo, useState } from "react";
import { brandCategories } from "../assets/uiData/brand_categories_se";
import { PrintBrandCard } from "./PrintBrandCard";
import "../assets/css/BrandCarousel.css";

function TopCelebrityBrand ({ brandList = [] })
{
  const topPerCat = useMemo(() =>
  {
    const buckets = new Map();
    for (const b of brandList)
    {
      if (!b?.category) continue;
      const curr = buckets.get(b.category);
      if (!curr || (b.matchPercentage ?? 0) > (curr.matchPercentage ?? 0))
      {
        buckets.set(b.category, b);
      }
    }
    return Array.from(buckets.entries()).map(([category, brand]) =>
    ({
      category,
      brand,
    }));
  }, [brandList]);

  const [i, setI] = useState(0);
  const total = topPerCat.length || 1;
  const next = () => setI((p) => (p + 1) % total);
  const prev = () => setI((p) => (p - 1 + total) % total);

  if (!topPerCat.length) return null;

  const { category, brand } = topPerCat[i];

  return (
    <div>
      <h3>
        Toppmatch per kategori: {brandCategories[category] ?? category} — {i + 1}/{total}
      </h3>
      <div className="brand-carousel">
        <button
          className={`brandcarousel prev${total > 1 ? "" : " inactive"}`}
          onClick={prev}
          disabled={total <= 1}
        >
          &lt;
        </button>

        <PrintBrandCard brand={brand} setActiveModal={() => {}} />

        <button
          className={`brandcarousel next${total > 1 ? "" : " inactive"}`}
          onClick={next}
          disabled={total <= 1}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default TopCelebrityBrand;