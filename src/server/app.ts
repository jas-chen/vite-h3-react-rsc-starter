import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import {
  createApp,
  createRouter,
  fromWebHandler,
  defineEventHandler,
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
  const router = createRouter();

  // TODO: compress static files
  router.get(
    "/assets/**",
    defineEventHandler(async (event) => {
      const assetsDir = resolve(process.cwd(), "dist", "client", "assets");
      const assetPath = event.path.substring("/assets/".length);
      const filePath = join(assetsDir, assetPath);

      if (!filePath.startsWith(assetsDir)) {
        return new Response("Forbidden", { status: 403 });
      }

      try {
        await stat(filePath);
      } catch (error) {
        if ((error as { code: string }).code === "ENOENT") {
          return new Response("Not Found", { status: 404 });
        }
        throw error;
      }

      const nodeStream = createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream);

      const mimeTypes: Record<string, string> = {
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
      };

      const contentType =
        mimeTypes[extname(filePath)] || "application/octet-stream";

      return new Response(
        // @ts-expect-error
        webStream,
        {
          headers: {
            "Content-Type": contentType,
          },
        }
      );
    })
  );

  const handler = async (request: Request) => {
    const { default: handler } =
      // @ts-expect-error
      await import("../rsc/index.js");
    return handler(request);
  };

  router.get("/**", fromWebHandler(handler));
  router.post("/**", fromWebHandler(handler));

  app.use(router);
}
