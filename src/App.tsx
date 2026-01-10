import { Link, Route, Routes } from "react-router-dom";
import ComponentsPage from "./pages/ComponentsPage";
import ShipsPage from "./pages/ShipsPage";
import {AuthStatus} from "./Helpers/AuthSatus.tsx";

function Home() {
    return (
        <div>
            <h2>Home</h2>
            <p>Select a page.</p>
        </div>
    );
}
import { isLoggedIn } from "./Helpers/authState";

const loggedIn = isLoggedIn();


export default function App() {
    return (
        <div>
        <AuthStatus />
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
            {/* HEADER: full width, left aligned */}
            <header style={{ padding: "16px 24px" }}>
                <h1 style={{ margin: 0 }}>Ship Creator Tool</h1>

                <nav style={{display: "flex", gap: 12, marginTop: 8}}>
                    <Link to="/">Home</Link>

                    <Link
                        to={loggedIn ? "/ships" : "/"}
                        onClick={(e) => {
                            if (!loggedIn) e.preventDefault();
                        }}
                        style={{pointerEvents: loggedIn ? "auto" : "none", opacity: loggedIn ? 1 : 0.5}}
                    >
                        Ships
                    </Link>

                    <Link
                        to={loggedIn ? "/components" : "/"}
                        onClick={(e) => {
                            if (!loggedIn) e.preventDefault();
                        }}
                        style={{pointerEvents: loggedIn ? "auto" : "none", opacity: loggedIn ? 1 : 0.5}}
                    >
                        Components
                    </Link>
                </nav>
            </header>

            {/* MAIN CONTENT: centered */}
            <main style={{margin: "0 auto", padding: "0px 0px"}}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ships" element={loggedIn ? <ShipsPage /> : <Home />} />
                    <Route path="/components" element={loggedIn ? <ComponentsPage /> : <Home />} />
                </Routes>
            </main>
        </div>
        </div>
    );
}
