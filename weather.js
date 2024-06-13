import { think } from "./llm.js";

export async function get_current_weather(location = "Jakarta") {
	const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location.toLowerCase()}?unitGroup=us&key=${process.env.WEATHER_API_KEY}&contentType=json`;
	console.log({ url });
	const response = await fetch(url, {
		method: "GET",
		headers: "application/json",
	});
	const data = await response.json();
	return data.currentConditions?.conditions;
}

