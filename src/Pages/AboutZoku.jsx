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
            <p>Vi söker varumärken som speglar vår identitet. Zoku är ett sätt att se hur dina värderingar överrensstämmer med olika varumärken.
            </p>
            <p>Zoku är en digital plattform där du kan identifiera din personlighetstyp med hjälp av Schwartz värderingsmodell. Genom att kartlägga dina värderingar matchas du med varumärken, kändisar – och vänner – som delar din livssyn.
            </p>
            <p> Zoku öppnar en värld av värderingsdrivna varumärken som gör det enklare – och roligare –att konsumera hållbart och medvetet.
            </p>
            <button className="active">
                <NavLink to="/test" className="nav-link">Vad är din zoku?</NavLink>
            </button>
        </div>
    );
    }