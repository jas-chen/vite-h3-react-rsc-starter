import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
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

  const router = createRouter();
  const publicDir = resolve(process.cwd(), "dist", "public");

  const handler = async (request: Request) => {
    const { pathname } = new URL(request.url);

    try {
      if (pathname.endsWith("/")) {
        throw { code: "ENOENT" };
      }
      const filePath = join(publicDir, pathname);

      if (!filePath.startsWith(publicDir)) {
        return new Response("Forbidden", { status: 403 });
      }

      const nodeStream = createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream);

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
    } catch (error: unknown) {
      if (error && (error as { code: string }).code === "ENOENT") {
        const { default: handler } =
          // @ts-expect-error
          await import("../../dist/rsc/index.js");
        return handler(request);
      }

      throw error;
    }
  };

  router.get("/**", fromWebHandler(handler));
  router.post("/**", fromWebHandler(handler));

  app.use(router);
}
