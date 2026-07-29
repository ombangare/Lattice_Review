// Loads the pre-bundled Express app produced by esbuild during `npm run build`.
// We use the already-bundled CJS output instead of importing raw server.ts —
// server.ts's dependency graph is too large for Vercel's own function bundler
// to trace reliably, which is what caused the ERR_MODULE_NOT_FOUND crash.
import serverModule from "../server-build/server.cjs";

const app = (serverModule as any).default ?? (serverModule as any).app ?? serverModule;
export default app;