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
  app.use(fromNodeMiddleware(serveStatic("dist/public")));
  app.use("/assets", fromNodeMiddleware(serveStatic("dist/client/assets")));

  const renderHandler = async (request: Request) => {
    const { pathname } = new URL(request.url);

    if (pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
      return new Response(null, { status: 404 });
    }

    const { default: rscHandler } =
      // @ts-expect-error
      await import("../../dist/rsc/index.js");
    return rscHandler(request);
  };

  const router = createRouter();

  router
    .get("/**", fromWebHandler(renderHandler))
    .post("/**", fromWebHandler(renderHandler));

  app.use(router);
}
