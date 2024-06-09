import { generate } from "./llm.js";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", function (ctx) {
	return ctx.text("OK");
});
app.get("/", async function (ctx) {
	const response = await generate("What is the biggest city in Indonesia?");
	return ctx.text(response);
});

export default app;