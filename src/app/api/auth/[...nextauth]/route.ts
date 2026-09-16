import { handlers } from "@/lib/auth";

// Auth.js wires up /api/auth/signin, /callback, /signout, /session, etc.
// from this one file.
export const { GET, POST } = handlers;
