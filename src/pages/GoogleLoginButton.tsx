import { useEffect } from "react";
import { loginWithGoogleCredential } from "../api/auth";

declare global {
    interface Window {
        google?: any;
    }
}

export function GoogleLoginButton() {
    useEffect(() => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (resp: { credential: string }) => {
                await loginWithGoogleCredential(resp.credential);
                window.location.reload(); // simplest way to re-fetch with token
            },
        });

        window.google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large" }
        );
    }, []);

    return <div id="googleBtn" />;
}
