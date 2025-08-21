import React, { useRef, useState, useEffect } from "react";
import Mask from '../assets/images/Mask.svg';
import Aventyraren from '../assets/images/Aventyraren.svg';
import Segraren from '../assets/images/Segraren.svg';
import Idealisten from '../assets/images/Idealisten.svg';
import Forkampen from '../assets/images/Forkampen.svg';
import Vardgivaren from '../assets/images/Vardgivaren.svg';
import Beskyddaren from '../assets/images/Beskyddaren.svg';
import Strategen from '../assets/images/Strategen.svg';
import Bevararen from '../assets/images/Bevararen.svg';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const personalities = [
  { name: "Zoku", y: 50, x: 50, image: Mask },
  { name: "Äventyraren", y: 20, x: 80, image: Aventyraren },
  { name: "Segraren", y: 30, x: 85, image: Segraren },
  { name: "Idealisten", y: 25, x: 25, image: Idealisten },
  { name: "Förkämpen", y: 35, x: 15, image: Forkampen },
  { name: "Vårdgivaren", y: 75, x: 20, image: Vardgivaren },
  { name: "Beskyddaren", y: 85, x: 25, image: Beskyddaren },
  { name: "Strategen", y: 70, x: 75, image: Strategen },
  { name: "Traditionalisten", y: 80, x: 60, image: Bevararen },
];

function SplitPersonalityDial({ value, onChange, uiState, setUiState })
{
  const [approaching, setApproaching] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
  if (uiState.resultMap) {
    setAnimate(true);
  } else {
    setAnimate(false); // reset when leaving resultMap
  }
  }, [uiState.resultMap]);



  const svgRef = useRef(null);
  const size = 300;
  const radius = size / 2;
  const limit = radius - 20;
  const [isDragging, setIsDragging] = useState(false);
  const scaleValue = 50;

  const toPixel = (v) => ((v - 50) / scaleValue) * limit + radius;
  const toValue = (p) => ((p - radius) / limit) * scaleValue + 50;

  const moveToPointer = (e) =>
  {
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches)
    {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    else
    {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clamp(clientX - rect.left, 0, size);
    const y = clamp(clientY - rect.top, 0, size);

    let valX = clamp(toValue(x), 0, 100);
    let valY = clamp(toValue(y), 0, 100);

    const dx = valX - 50;
    const dy = valY - 50;
    const magnitude = Math.sqrt(dx ** 2 + dy ** 2);
    if (magnitude > 50)
    {
      const factor = 50 / magnitude;
      valX = 50 + dx * factor;
      valY = 50 + dy * factor;
    }

    onChange({ x: valX, y: valY });
  };

  const handlePointerMove = (e) =>
  {
    if (!isDragging) return;
    e.preventDefault();
    moveToPointer(e);
  };

  const handleMouseDown = (e) =>
  {
    setIsDragging(true);
    moveToPointer(e);
  };

  const handleMouseUp = () =>
  {
    setIsDragging(false);
  };

  useEffect(() =>
  {
    if (isDragging)
    {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handlePointerMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);

      return () =>
      {
        window.removeEventListener("mousemove", handlePointerMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handlePointerMove);
        window.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging]);

  const getClosestPersonality = () =>
  {
    let closest = personalities[0];
    let minDist = Infinity;

    for (const p of personalities)
    {
      const dx = p.x - value.x;
      const dy = p.y - value.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist)
      {
        minDist = dist;
        closest = p;
      }
    }

    return closest;
  };

  const handleNext = () =>
  {
   if (uiState.firstInput)
   {
      setUiState({ ...uiState, firstInput: false, secondImput: true, nextButtonState: false, nextButtonTxt: "Visa resultat"  });
    }
    else if (uiState.secondImput)
    { 
      const closest = getClosestPersonality();
      setUiState({ ...uiState, secondImput: false, resultMap: true, showResultButton: true});
           
    } 
  }
  const handleBack = () =>
  {
    if (uiState.secondImput)
    {
      setUiState({ ...uiState, firstInput: true, secondImput: false, nextButtonTxt:"Nästa steg"});
    }
    else if (uiState.resultMap)
    {
      setUiState({ ...uiState, secondImput: true, resultMap: false, showResultButton: false });
    }
  };

  const closestImage = getClosestPersonality().image;

  const handleYUpdate = (e) =>
  {
    onChange({ ...value, y: parseFloat(e.target.value) });
    uiState.nextButtonState=true;
    const closestPersonality = getClosestPersonality();
    setApproaching(closestPersonality.name);
  }
  const handleXUpdate = (e) =>
  {
    onChange({ ...value, x: parseFloat(e.target.value) });
    uiState.nextButtonState=true;
    const closestPersonality = getClosestPersonality();
    setApproaching(closestPersonality.name);
  }

  const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
      if (uiState.resultMap) {
        // retrigger animation every time resultMap toggles
        setAnimKey(prev => prev + 1);
      }
    }, [uiState.resultMap]);

  // compute final coords
const finalX = toPixel(value.x) - 25;
const finalY = toPixel(value.y) - 25;

// center point (50,50)
const centerX = toPixel(50) - 25;
const centerY = toPixel(50) - 25;


  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      


      {/* Sliders */}
      <div style={{ marginBottom: "20px", width: size }}>
        {/* Y-axis Slider → Förändring / Tradition */}

        {uiState.firstInput && (
          <>
          <h2>Hur ser du på förändring?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6em" }}>
            <span>Jag tror på nya sätt</span>
            <span>Jag värdesätter det beprövade</span>
          </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={value.y}
              onChange={(e) => handleYUpdate(e)}
              style={{
                width: "100%",
                WebkitAppearance: "none",
                appearance: "none",
                height: "20px",
                borderRadius: "4px",
                background: "linear-gradient(to right, var(--highlightContrastLt), var(--highlight))", // higlightcontrastLt->highlight
                outline: "none",
              }}
            />
        </div>

      <p className="inputLeft">
        Förändring: Ny teknik, förändra samhället, innovation
      </p>
      <p className="inputRight">
        Tradition: Historia, familjvärden, kontinuitet
      </p>
    </>
)}


        {/* X-axis Slider → Gemenskap / Ambition */}
{uiState.secondImput && (
          <>
          <h2>Vad driver dig?</h2>


        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6em" }}>
            <span>Jag drivs av att hjälpa</span>
            <span>Jag drivs av att nå mål</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value.x}
            onChange={(e) => handleXUpdate(e)}
             style={{
                width: "100%",
                WebkitAppearance: "none",
                appearance: "none",
                height: "20px",
                borderRadius: "4px",
                background: "linear-gradient(to right, var(--highlightContrastLt), var(--highlight))", // higlightcontrastLt->highlight
                outline: "none",
              }}
          />
        </div>
        <p className="inputLeft">
          Omsorg: Miljö, rättvisa, ta hand om andra

        </p>
        <p className="inputRight">
          Ambition: Personlig utveckling, framgång, påverkan
      </p>
      <p>Du närmar dig {approaching}</p>
        </>
  )}

      </div>

        <div>
          {!uiState.firstInput &&<button className="btn-small active" id="prevButton" onClick={()=>handleBack()}>Föregående steg</button>}
          {!uiState.resultMap && 
            <button className={uiState.nextButtonState ? "active btn-small": "btn-small"} 
              id="nextButton" 
              style={!uiState.nextButtonState ?{
                cursor: "not-allowed",
                pointerEvents: "none"
              }:{}}
              onClick={()=>handleNext()}>{uiState.nextButtonTxt}</button>}
        </div>
      {/* Dial */}
      {uiState.secondInput || uiState.resultMap && (
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{ border: "1px solid #ccc", cursor: "crosshair", touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          e.preventDefault();
          setIsDragging(true);
          moveToPointer(e);
        }}
      >
        <circle cx={radius} cy={radius} r={radius - 1} fill="#ECDCCD" stroke="#ccc" />
        <line x1={radius} y1={0} x2={radius} y2={size} stroke="#aaa" />
        <line x1={0} y1={radius} x2={size} y2={radius} stroke="#aaa" />

        <text x={radius} y={20} textAnchor="middle" fontSize="12">Förändring</text>
        <text x={radius} y={size - 8} textAnchor="middle" fontSize="12">Tradition</text>
        <text x={20} y={radius} textAnchor="start" dominantBaseline="middle" fontSize="12">Gemenskap</text>
        <text x={size - 20} y={radius} textAnchor="end" dominantBaseline="middle" fontSize="12">Ambition</text>

      
       <image
          href={closestImage}
          key={animKey} // reset element to replay animation
          x={finalX}
          y={finalY}
          height={50}
          style={{
            transform: `translate(${centerX- finalX}px, ${centerY- finalY }px) scale(0.5)`,
            opacity: 0,
            animation: "popIn 0.9s ease-out forwards",
          }}
        />


      
      </svg>
        )}
    </div>
  );
}

export default SplitPersonalityDial;