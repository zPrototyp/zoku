import React, { useEffect, useRef } from 'react';
import '../assets/css/OverlayModal.css';

export default function OverlayModal({ isOpen, onClose, children }) {
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-modal" ref={modalRef}>
        {children}
      </div>
    </div>
  );
}
