import { exchange } from "./exchange.js";

const LLM_API_URL = "http://localhost:11434/api/generate";
const FEATURE_MODEL = "Xenova/paraphrase-MiniLM-L3-v2";

const SYSTEM_MESSAGE = `You run in a process of Question, Thought, Action, Observation.

Think step by step. Always specify the full steps: Thought, Action, Observation, and Answer.

Use Thought to describe your thoughts about the question you have been asked.
For Action, choose exactly one the following:

- If the question is about currency, use exchange: from to
- lookup: terms

Observation will be the result of running those actions.
Finally at the end, state the Answer in the same language as the original Question.

Here are some sample sessions.

Question: What is capital of france?
Thought: This is about geography, I can recall the answer from my memory.
Action: lookup: capital of France.
Observation: Paris is the capital of France.
Answer: The capital of France is Paris.

Question: Who painted Mona Lisa?
Thought: This is about general knowledge, I can recall the answer from my memory.
Action: lookup: painter of Mona Lisa.
Observation: Mona Lisa was painted by Leonardo da Vinci.
Answer: Leonardo da Vinci painted Mona Lisa.

Question: What is the exchange rate from USD to EUR?
Thought: This is about currency exchange rates, I need to check the current rate.
Action: exchange: USD EUR
Observation: 0.8276 EUR for 1 USD.
Answer: The current exchange rate is 0.8276 EUR for 1 USD.

{{CONTEXT}}

Now it's your turn to answer the following!

Question: {{QUESTION}}`;

const LOOKUP_PROMPT = `You are an expert in retrieving information.
You are given a {{KIND}}, and then you respond to a question.
Avoid stating your personal opinion. Avoid making other commentary.
Think step by step.

Here is the {{KIND}}:

{{PASSAGES}}

(End of {{KIND}})

Now it is time to use the above {{KIND}} exclusively to answer this.

Question: {{QUESTION}}
Thought: Let us the above reference document to find the answer.
Answer:`;

export async function answer(kind, passages, question) {
	console.log("ANSWER:");
	console.log(" question:", question);
	console.log("------- passages -------");
	console.log(passages);
	console.log("-------");
	const input = LOOKUP_PROMPT.replaceAll("{{KIND}}", kind)
		.replace("{{PASSAGES}}", passages)
		.replace("{{QUESTION}}", question);
	const output = await generate(input);
	const response = parse(input + output);
	console.log(" answer:", response.answer);
	return response.answer;
}

export async function think(inquiry) {
	const prompt = `${SYSTEM_MESSAGE}\n\n${inquiry}`;
	const response = await generate(prompt);
	console.log("Response:", response);
	return answer(response);
}

export async function act(document, question, action, observation) {
	const sep = action.indexOf(":");
	const fnName = action.substring(0, sep);
	const fnArgs = action
		.substring(sep + 1)
		.trim()
		.split(" ");
	console.log({ fnName, fnArgs });

	if (fnName === "lookup") {
		return await lookup(document, question, observation);
	}
	if (fnName === "exchange") {
		const rate = await exchange(fnArgs[0], fnArgs[1]);
		const result = await answer("exchange rate", rate, question);
		const reference = `Exchange API: ${rate}`;
		return { result, source: rate, reference };
	}
	console.log("Not recognized action:", { action, name: fnName, args: fnArgs });
	return await act(document, question, `lookup: ${question}`, observation);
}

export function finalPrompt(inquiry, observation) {
	return `${inquiry}
Observation: ${observation}
Thought: Now I have the answer.
Answer:`;
}

export function parse(text) {
	const parts = {};
	const MARKERS = ["Answer", "Observation", "Action", "Thought"];
	const ANCHOR = MARKERS.slice().pop();
	const start = text.lastIndexOf(`${ANCHOR}:`);
	if (start >= 0) {
		let str = text.substr(start);
		for (let i = 0; i < MARKERS.length; i++) {
			const marker = MARKERS[i];
			const pos = str.lastIndexOf(`${marker}:`);
			if (pos >= 0) {
				const substr = str.substr(pos + marker.length + 1).trim();
				const value = substr.split("\n").shift();
				str = str.slice(0, pos);
				const key = marker.toLowerCase();
				console.log(key);
				parts[key] = value;
			}
		}
	}
	return parts;
}

export async function reason(document, history, inquiry) {
	const capitalize = (str) => str[0].toUpperCase() + str.slice(1);
	const flatten = (parts) =>
		Object.keys(parts)
			.filter((k) => parts[k])
			.map((k) => `${capitalize(k)}: ${parts[k]}`)
			.join("\n");
	const HISTORY_MSG =
		"Before formulating a thought, consider the following conversation history.";
	const context = (history) =>
		history.length > 0
			? `${HISTORY_MSG}\n\n${history.map(flatten).join("\n")}`
			: "";

	const prompt = SYSTEM_MESSAGE.replace(
		"{{CONTEXT}}",
		context(history),
	).replace("{{QUESTION}}", inquiry);

	const response = await generate(prompt);
	const { answer, thought, action, observation } = parse(
		`${prompt}\n${response}`,
	);

	console.log("REASON:");
	console.log(" question:", inquiry);
	console.log(" thought:", thought);
	console.log(" action:", action);
	console.log(" observation:", observation);
	console.log(" intermediate answer:", answer);

	const { result, source, reference } = await act(
		document,
		inquiry,
		action ? action : `lookup: ${inquiry}`,
		observation,
	);
	return { thought, action, observation, answer: result, source, reference };
}

const HISTORY_MSG =
	"Before formulating a thought, consider the following conversation history.";

export function context(history) {
	if (history.length > 0) {
		const recents = history.slice(-3 * 2); // only last 3 Q&A
		return `${HISTORY_MSG}\n\n${recents.join("\n")}`;
	}
	return "";
}

export async function encode(sentence) {
	const { pipeline } = await import("@xenova/transformers");
	const extractor = await pipeline("feature-extraction", FEATURE_MODEL, {
		quantized: true,
	});

	const output = await extractor([sentence], {
		pooling: "mean",
		normalize: true,
	});
	return output[0].data;
}

export async function search(q, document, top_k = 3) {
	const { cos_sim } = await import("@xenova/transformers");

	const vector = await encode(q);
	const matches = document.map((entry) => {
		const score = cos_sim(vector, entry.vector);
		return { score, ...entry };
	});
	const relevants = matches.sort((a, b) => b.score - a.score).slice(0, top_k);
	// Debug
	// relevants.forEach((match) => {
	// 	const { index, offset, sentence, score } = match;
	// 	console.log(`  Line ${index + 1} @${offset}, match ${Math.round(100 * score)}%: ${sentence}`)
	// });

	return relevants;
}

export async function lookup(document, question, hint) {
	const ascending = (a, b) => a - b;
	const dedupe = (numbers) => [...new Set(numbers)];

	const MIN_SCORE = 0.4;

	if (document.length === 0) {
		throw new Error("Document is is not indexed.");
	}

	console.log("LOOKUP:");
	console.log(" question:", question);
	console.log(" hint:", hint);

	const candidates = await search(`${question} ${hint}`, document);
	const best = candidates.slice(0, 1).shift();
	console.log(" best score:", best.score);
	if (best.score < MIN_SCORE) {
		const FROM_MEMORY = "From my memory.";
		return { result: hint, source: FROM_MEMORY, reference: FROM_MEMORY };
	}

	const indexes = dedupe(
		candidates.map((match) => match.index).sort(ascending),
	);
	const relevants = document.filter(({ index }) => indexes.includes(index));
	const passages = relevants.map(({ sentence }) => sentence).join(" ");
	const result = await answer("reference document", passages, question);

	const refs = await search(result || hint, relevants);
	const top = refs.slice(0, 1).pop();
	const source = `Best source (page ${top.page + 1}, score: ${Math.round(top.score * 100)}%):\n${top.sentence}`;
	console.log(" source:", source);

	return { result, source, reference: passages };
}

export async function generate(prompt) {
	if (!prompt) throw new Error("Prompt is required");

	const method = "POST";
	const headers = {
		"Content-Type": "application/json",
	};
	const body = JSON.stringify({
		model: "mistral-openorca",
		prompt,
		options: {
			num_predict: 200,
			temperature: 0,
			top_k: 20,
		},
		stream: false,
	});
	const request = { method, headers, body };
	const res = await fetch(LLM_API_URL, request);
	const { response } = await res.json();

	return response?.trim();
}
