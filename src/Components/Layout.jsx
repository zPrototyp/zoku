import {NavLink, Outlet, useLocation } from "react-router";
import HamburgerMenu from "./HamburgerMenu";
import { useAtom } from 'jotai';
import { authTokenAtom } from '../Atoms/AuthAtom.jsx';
import '../assets/css/App.css';
import '../assets/css/FooterNav.css';


function FooterNav() {
  const [authToken, setAuthToken] = useAtom(authTokenAtom);
  // If no token, don't show the footer
  if (!authToken) return null;
  return (
    <footer className="footer-nav">
      <NavLink to="/feed" className="footer-circle">Feed</NavLink>
      <NavLink to="/profile" className="footer-circle">Min Zoku</NavLink>
    </footer>
  );
}

function Layout() {
  const location =  useLocation();
  const isFrontPage = location.pathname === '/';
  return (
    <div className="layout">
    <header>
      <nav className="main-nav">
        <NavLink to="/" className="nav-link">
          <img className="small-logo" src="/zoku/small-title.svg" alt="Zoku Logo" />
        </NavLink>
      </nav>
        <HamburgerMenu />
    </header>
    <main>
      <Outlet />
    </main>
     
     {/* Don't print this if we're on the front page ..  */}
     {!isFrontPage && <FooterNav />}

    </div>
  );
}

export default Layout;