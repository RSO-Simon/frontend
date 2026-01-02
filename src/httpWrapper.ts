export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

//TEMPORARY
const OWNER_USER_ID_KEY = "ownerUserId";

export function setOwnerUserId(id: string) {
    localStorage.setItem(OWNER_USER_ID_KEY, id);
}

export function getOwnerUserId(): string | null {
    return localStorage.getItem(OWNER_USER_ID_KEY);
}

function withOwnerUserId(path: string): string {
    const ownerUserId = getOwnerUserId();
    if (!ownerUserId) return path;

    // only apply to your API calls
    if (!path.startsWith("/api/")) return path;

    const url = new URL(path, window.location.origin);

    // don't override if already provided explicitly
    if (!url.searchParams.has("ownerUserId")) {
        url.searchParams.set("ownerUserId", ownerUserId);
    }

    return url.pathname + url.search;
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

export async function requestText(path: string, opts: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}
): Promise<string> {
    const res = await fetch(withOwnerUserId(path), {
        method: opts.method ?? "GET",
        headers: {
            Accept: "*/*",
            ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(opts.headers ?? {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();

    if (!res.ok) {
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

    return JSON.parse(text) as T;
}
