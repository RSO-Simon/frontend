export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL ?? "");

function getToken(): string | null {
    return localStorage.getItem("app_jwt");
}


export class HttpError extends Error {
    status: number;
    statusText: string;
    bodyText: string;

    constructor(status: number, statusText: string, bodyText: string) {
        super(`${status} ${statusText}`);
        this.status = status;
        this.statusText = statusText;
        this.bodyText = bodyText;
    }
}


export async function requestText(
    path: string,
    opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<string> {
    const token = getToken();

    const res = await fetch(`${API_BASE}${path}`, {
        method: opts.method ?? "GET",
        headers: {
            Accept: "*/*",
            ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(opts.headers ?? {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();

    if (!res.ok) {
        console.error("HTTP ERROR BODY:", text);
        throw new HttpError(res.status, res.statusText, text);
    }

    return text;
}
export async function requestJson<T>(
    path: string,
    opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {

    const text = await requestText(path, {
        ...opts,
        headers: { Accept: "application/json", ...(opts.headers ?? {}) },
    });

    if (!text) {
        return undefined as unknown as T; // for 204 / empty body
    }

    return JSON.parse(text) as T;
}
