  import { BrandLikeOverlay } from "./BrandLikeOverlay";

  export default function HiddenBrands({brandList, setHiddenBrands}) {
    return(  
    <div className="wardrobe-section">
      <h2>Gömda varumärken</h2>
        {brandList.length === 0 && <p>Inga gömda varumärken</p>}
        {brandList.length > 0 && brandList.map(brand => (
          <div className="hidden-brand-admin" key={brand.id}>
            <BrandLikeOverlay brand={brand} setHiddenBrands={setHiddenBrands} />
            <h4>{brand.name} </h4>
            <p>{brand.description}</p>
            <p><strong>Gömdes:</strong> {new Date(brand.hideDetails.hiddenAt).toLocaleString()}</p>
            
          </div>
        ))}
      </div>
      )
  }
  