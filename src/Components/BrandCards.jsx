
import React, { useEffect, useState, useMemo } from "react";
import OverlayModal from "./OverlayModal";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { BrandLikeOverlay } from "./BrandLikeOverlay";
import { brandCategories } from "../assets/uiData/brand_categories_se";
import { PrintBrandCard } from "./PrintBrandCard";
import { ShareOverlay } from "./ShareOverlay";
import "../assets/css/BrandCarousel.css";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";

export default function BrandCards({ brandList = [], categorize }) {

  const token = useAtomValue(authTokenAtom);
  const user = useAtomValue(valueProfileAtom);
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

   // Always default grouped to an object so it's never undefined
  const grouped = React.useMemo(() => {
    return brandList?.reduce((acc, brand) => {
      acc[brand.category] = acc[brand.category] || [];
      acc[brand.category].push(brand);
      return acc;
    }, {});
  }, [brandList]);

  // hook to update the active modal
    useEffect(() => {
    if (!activeModal || brandList.length === 0) return;

    const updatedBrand = brandList.find((b) => b.id === activeModal.id);
    if (updatedBrand && updatedBrand !== activeModal) {
      setActiveModal(updatedBrand);
    } else if (!updatedBrand) {
      setActiveModal(null);
    }
  }, [brandList, activeModal]);

  // Carousel component to print brands per category
  const BrandCarousel = ({ brands, category }) => {
  const total = brands.length;
  return (
    <div>
      <h3>{brandCategories?.[category] ?? category} - {total}</h3>
    
      <div className="brand-carousel">
        {brands.map((brand) => (
          <PrintBrandCard
            key={brand.id}
            brand={brand}
            setActiveModal={setActiveModal}
          />
        ))}
      </div>
    </div>
  );
};

  return (
    <>
    {categorize && (
      <>
        <div className='feed-sort-options'>
          <label htmlFor="sortSelect">Varumärken: </label>
          <select value={selectedCategory ||"all"} onChange={(e) => setSelectedCategory(e.target.value)}>
              {Object.entries(brandCategories).map(([value, label]) => (
                  <option key={value} value={value}>
                      {label}
                  </option>
              ))}
          </select>
          </div>

          {selectedCategory !== "all" ? (
            grouped[selectedCategory] && (
              <BrandCarousel
                key={selectedCategory}
                brands={grouped[selectedCategory]}
                category={selectedCategory}
              />
            )
          ) : (
            Object.keys(brandCategories)
              .filter((cat) => cat !== "all" && grouped[cat]?.length > 0)
              .map((cat) => (
                <BrandCarousel
                  key={cat}
                  brands={grouped[cat]}
                  category={cat}
                />
              ))
          )}
        </>)
    }

    {!categorize && brandList.map(brand => <PrintBrandCard brand={brand} key={brand.id} setActiveModal={setActiveModal}/>)}

    <OverlayModal isOpen={!!activeModal} onClose={closeModal}>
      {activeModal && (
          <div className="expanded-brand">
            {token &&  <BrandLikeOverlay brand={activeModal} />}
            <div className="expanded-brand-image-share">
              <img className="expanded-feed_img" 
              src={activeModal.imageUrl ? activeModal.imageUrl :`dummy-brand_${activeModal.category}.jpg`} 
              alt={activeModal.name}/>
            <ShareOverlay personality={user} profile={activeModal} brand={true}/>
            </div>
            <p><a href={activeModal.url}>{activeModal.name}</a>  / {activeModal.matchPercentage}% match</p>
            <p>{activeModal.description}</p>
          </div>
      )}
    </OverlayModal>
    </>
  );
}