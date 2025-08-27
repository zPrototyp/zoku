import { NavLink } from "react-router";
import zokuTitle from '../assets/images/ZokuTitle.svg';
export default function AboutZoku() {
    return (
        <div className="page-content">
        {/* Logo here */}
        <NavLink to="/" className="nav-link">
            <h1>
            <img src={zokuTitle} alt="Logo" className="logo-new" />
            <span className="sr-only">Zoku</span>
            </h1>
        </NavLink>
        <h2>Vad är Zoku?</h2>
                
        <p>Välkommen till ZOKU – appen där du äntligen kan hitta varumärken  som stämmer överens med dina värderingar. </p>

        <p>Vi tror att konsumtion handlar om mer än bara produkter. 
        Det handlar om vilka vi är, vem vi vill vara och vilka vi vill 
        dela våra liv tillsammans med.
        </p>
        <p>
        Zoku har betydelsen grupp med en gemensam identitet på japanska. 
        Vi vill att du ska kunna välja din grupp, eller stam, där du kan 
        känna dig hemma.
        </p>

        <h3>Vad innebär Zoku för dig?</h3>

        <ul className="no-dots">
        <li>🤝 Tillhörighet, på riktigt</li>
        <li>⭐ Inspiration från förebilder  </li>
        <li>🔒 Autentiska varumärken</li>
        <li>⚖️ Rättvis konsumtion </li>
        <li>🎲 Upptäck det oväntade </li>
        </ul>
        
        <button className="active">
            <NavLink to="/test" className="nav-link">Vad är din zoku?</NavLink>
        </button>
    </div>
);
    }