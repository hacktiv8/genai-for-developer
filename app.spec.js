import { expect, test } from "vitest";
import app from "./app.js";

test("GET /health", async function () {
	const res = await app.request("/health");
	expect(res.status).toBe(200);
	expect(await res.text()).toBe("OK");
});

test("GET /", async function () {
	const res = await app.request("/");
	expect(res.status).toBe(200);
	expect(await res.text()).toMatch(/Pico Jarvis/);
});

test("GET /chat?q=What is the biggest planet in the solar system?", async function () {
	const res = await app.request(
		"/chat?q=What is the biggest planet in the solar system?",
	);
	expect(res.status).toBe(200);
	expect(await res.text()).toMatch("Jupiter");
});

test("GET /unknown", async function () {
	const res = await app.request("/unknown");
	expect(res.status).toBe(404);
	expect(await res.text()).toMatch("Not Found");
});
