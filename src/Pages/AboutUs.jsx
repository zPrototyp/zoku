import { NavLink } from "react-router";
import zokuTitle from '../assets/images/ZokuTitle.svg';

export default function AboutUs() {
    return (
        <div className="page-content">
            {/* Logo here */}
            <NavLink to="/" className="nav-link">
                <h1>
                <img src={zokuTitle} alt="Logo" className="logo" />
                <span className="sr-only">Zoku</span>
                </h1>
            </NavLink>
            <h2>Om Oss</h2>
            <p>Zoku ™</p>
            <p>är ett koncept av </p>
            <p><a href="https://www.magnussonkennberg.se/">Magnusson & Kennberg</a></p>
            <p>i samarbete med</p>
            <p><a href="https://www.webbess.se/">WebbEss</a></p>
    
            <div className="aboutprofileBox">
                <div className="aboutProfile-Traditionalist">
                    <h2>Matz Magnusson</h2>
                    <p>92% Bevararen</p>
                    <p>85% Strategen</p>
                    <p>68% Beskyddaren</p>
                </div>
                <div className="aboutProfile-Advocate">
                    <h2>David Jansson</h2>
                    <p>92% Förkämpen</p>
                    <p>85% Segraren</p>
                    <p>68% Idealisten</p>
                </div>
            </div>
        </div>

    );
}