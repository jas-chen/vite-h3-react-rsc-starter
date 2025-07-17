import serveStatic from "serve-static";
import {
  createApp,
  createRouter,
  fromWebHandler,
  fromNodeMiddleware,
} from "h3";

const isProduction = process.env.NODE_ENV === "production";
const base = process.env.BASE || "/";

export const app = createApp();

let vite: Awaited<ReturnType<typeof import("vite").createServer>>;

if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(fromNodeMiddleware(vite.middlewares));
} else {
  // Serve RSC assets
  app.use("/assets", fromNodeMiddleware(serveStatic("dist/client/assets")));

  // Serve static assets
  app.use(fromNodeMiddleware(serveStatic("dist/public")));

  const rscHandler = fromWebHandler(async (request: Request) => {
    // @ts-expect-error
    return (await import("../../dist/rsc/index.js")).default(request);
  });

  const router = createRouter();

  router.get("/**", rscHandler);

  // Handle React Server Functions
  router.post("/**", rscHandler);

  app.use(router);
}
