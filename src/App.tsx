import { Link, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import ComponentsPage from "./pages/ComponentsPage";
import ShipsPage from "./pages/ShipsPage";

function Home() {
    return (
        <div>
            <h2>Home</h2>
            <p>Select a page.</p>
        </div>
    );
}


export default function App() {
    const [currentUserId, setCurrentUserId] = useState(
        localStorage.getItem("currentUserId") ?? "1"
    );

    useEffect(() => {
        localStorage.setItem("currentUserId", currentUserId);
    }, [currentUserId]);
    return (
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
            {/* HEADER: full width, left aligned */}
            <header style={{ padding: "16px 24px" }}>
                <h1 style={{ margin: 0 }}>Ship Creator Tool</h1>

                <nav style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <Link to="/">Home</Link>
                    <Link to="/ships">Ships</Link>
                    <Link to="/components">Components</Link>
                </nav>
            </header>

            {/* MAIN CONTENT: centered */}
            <main style={{margin: "0 auto", padding: "0px 0px" }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ships" element={<ShipsPage currentUserId={currentUserId}/>} />
                    <Route path="/components" element={<ComponentsPage currentUserId={currentUserId} />} />
                </Routes>
            </main>
        </div>
    );
}
