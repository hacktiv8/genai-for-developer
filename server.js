import { serve } from "@hono/node-server";
import api from "./api.js";

serve({ fetch: api.fetch, port: 3000 });
