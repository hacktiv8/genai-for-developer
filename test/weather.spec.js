import { expect, test, vi } from "vitest";
import { get_current_weather, get_weather } from "../weather.js";
import data from "./fixtures/weather-data.json" assert { type: "json" };

global.fetch = vi.fn();

function createResponse(data) {
	return {
		json: function () {
			return new Promise(function (resolve) {
				resolve(data);
			});
		},
	};
}

test.skip("Calling get_current_weather() function should return weather data", async function () {
	fetch.mockResolvedValue(createResponse(data));

	const result = await get_current_weather();

	expect(fetch).toHaveBeenCalledWith(
		"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/jakarta?unitGroup=us&key=undefined&contentType=json",
		{
			method: "GET",
			headers: "application/json",
		},
	);
	expect(result).toEqual("Partially cloudy");
});

test.skip("Calling get_current_weather() with specific city should return weather data", async function () {
	fetch.mockResolvedValue(createResponse(data));

	const result = await get_current_weather("Denpasar");

	expect(fetch).toHaveBeenCalledWith(
		"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/denpasar?unitGroup=us&key=undefined&contentType=json",
		{
			method: "GET",
			headers: "application/json",
		},
	);
	expect(result).toEqual("Partially cloudy");
});

test.todo(
	"weather() function calling returns weather emoji and comment",
	async function () {
		const result = await get_weather();
		expect(result).toMatch(/🌤️/);
	},
	{ testTimeout: 10000 },
);