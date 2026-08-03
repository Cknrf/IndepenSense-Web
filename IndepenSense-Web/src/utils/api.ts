const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "VITE_API_URL is not set. Add it to .env.local (dev) or the Railway service env (prod).",
  );
}

export const API_BASE = `${rawApiUrl.replace(/\/$/, "")}/web`;
