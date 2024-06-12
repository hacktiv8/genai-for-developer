import { think } from "./llm.js";

export async function get_current_weather(location = "Jakarta") {
	const response = await fetch(
		`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location.toLowerCase()}?unitGroup=us&key=${process.env.WEATHER_API_KEY}&contentType=json`,
		{
			method: "GET",
			headers: "application/json",
		},
	);
	const data = await response.json();
	return data;
}

export async function get_weather(location = "Jakarta") {
	const response = await think(`What is the weather in ${location}?`);
	console.log(response);
	return `🌦️ It's a rainy day in ${location}!`;
}
