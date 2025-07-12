import { createServer } from "node:http";
import { toNodeListener } from "h3";
import { app } from "./app.mjs";

createServer(toNodeListener(app)).listen(process.env.PORT || 3002);