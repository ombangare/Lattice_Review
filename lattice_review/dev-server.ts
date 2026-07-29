import { createServer as createViteServer } from "vite";
import { app } from "./server";

const PORT = 3000;

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server running on port ${PORT}`);
  });
}

startDevServer();