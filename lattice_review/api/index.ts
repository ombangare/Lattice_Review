import app from "../server";

// Vercel's Node.js runtime can invoke an Express app directly since it already
// has the (req, res) signature Vercel expects — no adapter library needed here,
// unlike Netlify which requires serverless-http.
export default app;
