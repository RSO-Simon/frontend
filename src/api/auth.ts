export type AuthResponse = {
    token: string;
    ownerUserId: number;
    email: string;
    displayName: string;
};

// const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL ?? "");

export async function loginWithGoogleCredential(
    credential: string
): Promise<AuthResponse> {
    const res = await fetch(`/api/auth/google`, {
    // const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    const data = (await res.json()) as AuthResponse;

    // Store the token for database access.
    localStorage.setItem("app_jwt", data.token);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.displayName);


    return data;
}