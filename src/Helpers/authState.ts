// authState.ts
export function isLoggedIn(): boolean {
    return !!localStorage.getItem("app_jwt");
}

export function logout() {
    localStorage.removeItem("app_jwt");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    window.location.reload();

    window.location.href = "/";
}

