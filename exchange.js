export async function exchange(from, to) {
	const url = `https://open.er-api.com/v6/latest/${from}`;
	console.log("Fetching", url);
	const response = await fetch(url);
	const data = await response.json();
	const rate = data.rates[to];
	const result = `As per ${data.time_last_update_utc}, 1 ${from} equal to ${Math.ceil(rate)} ${to}.`;
	return result;
}
