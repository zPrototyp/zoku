
import React, { useEffect, useState } from "react";
import OverlayModal from "./OverlayModal";
import { useAtomValue } from "jotai";
import { authTokenAtom } from "../Atoms/AuthAtom";
import { BrandLikeOverlay } from "./BrandLikeOverlay";
import { brandCategories } from "../assets/uiData/brand_categories_se";
import { PrintBrandCard } from "./PrintBrandCard";
import { ShareOverlay } from "./ShareOverlay";
import "../assets/css/BrandCarousel.css";
import { valueProfileAtom } from "../Atoms/ValueProfileAtom";

export default function BrandCards({ brandList, categorize, filter }) {

  const token = useAtomValue(authTokenAtom);
  const user = useAtomValue(valueProfileAtom);
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Grouped list to use in the Carousel
  const grouped = brandList?.reduce((acc, brand) => {
        acc[brand.category] = acc[brand.category] || [];
        acc[brand.category].push(brand);
        return acc;
      }, {});
  
  // hook to update the active modal
  useEffect(() => {
    if (!activeModal || !brandList) return;
    
    const updatedBrand = brandList.find((b) => b.id === activeModal.id);
    if (updatedBrand && updatedBrand !== activeModal) {
      setActiveModal(updatedBrand);
    }
    if (!updatedBrand) {
      setActiveModal(null); // or show a message
    }
  }, [brandList, activeModal]);
  
  // Carousel component to print brands per category
const BrandCarousel = ({ brands, category }) => {
  const [index, setIndex] = useState(0);
  const total = brands.length;

  const next = () => setIndex((prev) => (prev + 1) % total);
  const prev = () => setIndex((prev) => (prev - 1 + total) % total);

  const brand = brands[index];

  return (
    <div>
      <h3>{brandCategories[category]} - {index + 1} / {total}</h3>

      <div className="brand-carousel">
          <button className={`brandcarousel prev${total > 1 ? '' : ' inactive'}`} onClick={prev}>  &lt; </button>
          <PrintBrandCard brand={brand} setActiveModal={setActiveModal} />     
          <button className={`brandcarousel next${total > 1 ? '' : ' inactive'}`} onClick={next}> &gt;  </button>
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
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {Object.entries(brandCategories).map(([value, label]) => (
                  <option key={value} value={value}>
                      {label}
                  </option>
              ))}
          </select>
          </div>

        {selectedCategory != "all"
        ? grouped[selectedCategory] && (
          <BrandCarousel
            key={selectedCategory}
            brands={grouped[selectedCategory]}
            category={selectedCategory}
          />
        )
      :  Object.keys(brandCategories)
          .filter(cat => grouped[cat]?.length > 0)
          .map(cat => (
            <BrandCarousel
              key={cat}
              brands={grouped[cat]}
              category={cat}
            />
          ))
        }
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