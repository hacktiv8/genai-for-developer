import { Hono } from "hono";

import { reason } from "./llm.js";
import { ingest } from "./docs.js";
import fs from "node:fs";

const app = new Hono();

const state = {
	history: [],
	source: "No source yet",
	reference: "No reference yet",
};

const document = await ingest("./document.pdf");

app.get("/health", function (ctx) {
	return ctx.text("OK");
});
app.get("/chat", async function (ctx) {
	const inquiry = ctx.req.query("q");
	console.log("Waiting for LLM...");
	const { thought, action, observation, answer, source, reference } =
		await reason(document, state.history, inquiry);
	state.source = source;
	state.reference = reference;
	state.history.push({ inquiry, thought, action, observation, answer });
	while (state.history.length > 3) {
		state.history.shift();
	}

	return ctx.text(answer);
});
app.get("/", async function (ctx) {
	return ctx.html(fs.readFileSync("index.html"));
});

export default app;