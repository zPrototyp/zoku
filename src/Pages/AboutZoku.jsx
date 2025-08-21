import { NavLink } from "react-router";
import zokuTitle from '../assets/images/ZokuTitle.svg';
export default function AboutZoku() {
    return (
        <div className="page-content">
            {/* Logo here */}
            <NavLink to="/" className="nav-link">
                <h1>
                <img src={zokuTitle} alt="Logo" className="logo" />
                <span className="sr-only">Zoku</span>
                </h1>
            </NavLink>
            <h2>Vad är Zoku?</h2>
            <p>
                Vi tror att konsumtion handlar om mer än bara produkter. 
            </p>
            <p>
                Det handlar om vilka vi är, vem vi vill vara och vilka vi vill dela våra liv med.
            </p>
            <p> 
                Genom att svara på några enkla frågor upptäcker du din värderingspersonlighet 
                och matchar med människor och varumärken som delar dina värderingar.
            </p>

           
            <p>Zoku är en digital plattform där du kan identifiera din personlighetstyp.
            </p>
            <button className="active">
                <NavLink to="/test" className="nav-link">Vad är din zoku?</NavLink>
            </button>
        </div>
    );
    }