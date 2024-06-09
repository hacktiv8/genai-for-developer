import { Hono } from "hono";

import { generate } from "./llm.js";
import fs from "node:fs";

const app = new Hono();

app.get("/health", function (ctx) {
	return ctx.text("OK");
});
app.get("/chat", async function (ctx) {
	const inquiry = ctx.req.query("q");
	const response = await generate(inquiry);
	return ctx.text(response);
});
app.get("/", async function (ctx) {
	return ctx.html(fs.readFileSync("index.html"));
});

export default app;