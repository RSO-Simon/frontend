import { isLoggedIn, logout } from "./authState";
import { GoogleLoginButton } from "../pages/GoogleLoginButton";

export function AuthStatus() {
    if (!isLoggedIn()) {
        return <GoogleLoginButton />;
    }

    const email = localStorage.getItem("user_email");

    return (
        <div>
            Logged in as <strong>{email}</strong>{" "}
            <button className="header__Button" onClick={logout}>Logout</button>
        </div>
    );
}
