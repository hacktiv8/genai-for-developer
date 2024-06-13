import { expect, test, vi } from "vitest";
import { exchange } from "../exchange.js";
import data from "./fixtures/exchange-data.json" assert { type: "json" };

global.fetch = vi.fn();
function createResponse(data) {
	return {
		json: function () {
			return new Promise(function (resolve, reject) {
				resolve(data);
			});
		},
	};
}

test("Exchange function return the right value", async function () {
	fetch.mockResolvedValue(createResponse(data));

	const result = await exchange("USD", "IDR");

	expect(fetch).toHaveBeenCalledWith("https://open.er-api.com/v6/latest/USD");
	expect(result).toBe(
		"As per Thu, 13 Jun 2024 00:02:31 +0000, 1 USD equal to 16281 IDR.",
	);
});