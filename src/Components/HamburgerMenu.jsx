import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/css/HamburgerMenu.css'; 
import { useAtom } from 'jotai';
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import { feedListAtom } from '../Atoms/FeedListAtom.jsx';
import { valueProfileAtom } from '../Atoms/ValueProfileAtom.jsx';
import { API_logout } from '../Services/API.jsx';


const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useAtom(authTokenAtom);
  const [, setFeedList] = useAtom(feedListAtom);
  const [, setValueProfile] = useAtom(valueProfileAtom);

  const toggleMenu = () => setIsOpen(!isOpen);

// Needs to be sent to backend to log out user as well
  const handleLogout = () => {
    const loggedOut = API_logout(token);
    if (loggedOut) {
      console.log("User logged out successfully");
    }
    setToken(null);
    setFeedList(null);
    setValueProfile(null);

    setIsOpen(false)
    window.location.href = "/zoku/"; // Redirect to home page
  };

 return (
    <div className="hamburger-container">
      <div className={`menu-button ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar top"></div>
        <div className="bar middle"></div>
        <div className="bar bottom"></div>
      </div>

      <div className={`menu-panel ${isOpen ? 'slide-in' : ''}`}>
        <ul className="nav-links">
        <li><NavLink to="/aboutZoku" onClick={() => setIsOpen(false)}>Vad är Zoku</NavLink></li>
        <li><NavLink to="/tribes" onClick={() => setIsOpen(false)}>Zoku-tribes</NavLink></li>
        <li><NavLink to="/aboutUs" onClick={() => setIsOpen(false)}>Om oss</NavLink></li>
        {!token && <li><NavLink to="/login" onClick={() => setIsOpen(false)}>Logga in</NavLink></li>}
        {token && <>
          <p>-</p>
            <li><NavLink to="/profile" onClick={() => setIsOpen(false)}>Min zoku</NavLink></li>
            <li><NavLink onClick={() => handleLogout()}>Log out</NavLink></li>
          </>}
        </ul>
      </div>
    </div>
  );
 
};

export default HamburgerMenu;
