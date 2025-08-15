import React, { useState, useEffect, useRef } from "react";

function ValueInfoTooltip({ children })
{
  const [open, setOpen] = useState(false);
  const iconRef = useRef(null);

  useEffect(() =>
  {
    const handleClickOutside = (e) =>
    {
      if (
        open &&
        iconRef.current &&
        !iconRef.current.contains(e.target))
      {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Info icon */}
      <div
        ref={iconRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
          lineHeight: "20px",
          fontSize: "14px",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        i
      </div>

      {/* Full overlay tooltip */}
      {open && (
        <div
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            }}
            onClick={() => setOpen(false)}
        >
            <div
            onClick={(e) => e.stopPropagation()}
            style={{
                backgroundColor: "#FDFBF2",
                padding: "1.5rem",
                borderRadius: "10px",
                maxWidth: "400px",
                color: "#333",
                fontSize: "14px",
                lineHeight: "1.5",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(8px)",
            }}
        >
        {children}
        </div></div>)}
        </>
    );
}

export default ValueInfoTooltip;
