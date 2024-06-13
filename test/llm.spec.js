import.meta.env.WEATHER_API_KEY;
import { expect, test, vi } from "vitest";

import { act, answer, generate, finalPrompt, context } from "../llm.js";

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

test("Calling generate() function with argument 'Hello, world!' should return some answer", async function () {
	const llmResponse = {
		model: "orca-mini",
		response:
			" Yes, I can speak Bahasa Indonesia. Is there anything specific you would like to know or do in Indonesian?",
		done: true,
		done_reason: "stop",
	};

	fetch.mockResolvedValue(createResponse(llmResponse));

	const response = await generate("Can you speak Bahasa Indonesia?");

	expect(fetch).toHaveBeenCalledWith("http://localhost:11434/api/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "mistral-openorca",
			prompt: "Can you speak Bahasa Indonesia?",
			options: { num_predict: 200, temperature: 0, top_k: 20 },
			stream: false,
		}),
	});

	expect(response.length).toBeGreaterThan(0);
});

test("Calling generate() function without argument should throw an error", async function () {
	await expect(async () => await generate()).rejects.toThrowError(
		"Prompt is required",
	);
});

test("answer() function parse 'Answer:' if it exists", async function () {
	const text = "This is a test\nAnswer: This is the answer";
	const result = await answer(text);
	expect(result).toBe("This is the answer");
});

test("answer() function returns '?' if 'Answer:' is not found", async function () {
	const text = "This is a test";
	const result = await answer(text);
	expect(result).toBe("?");
});

test("finalPrompt() function return observation, thought and answer", function () {
	const prompt = finalPrompt(
		"Question: How the weather in Jakarta?",
		"It's sunny in Jakarta.",
	);
	expect(prompt).toBe(`Question: How the weather in Jakarta?
Observation: It's sunny in Jakarta.
Thought: Now I have the answer.
Answer:`);
});

test("Function act() return null when there is no action", async function () {
	const action = await act("This is a test");
	expect(action).toBeNull();
});

test("Function act() return null when the action is 'lookup'", async function () {
	const action = await act("Action: lookup");
	expect(action).toBeNull();
});

test.skip("Function act() return action when there is action is 'weather'", async function () {
	const action = await act("Action: weather: Jakarta");
	expect(action).toBe({
		action: "weather",
		name: "weather",
		args: ["Jakarta"],
		result: "Sunny",
	});
});

test.todo("reason() function return conclusion");

test("context function always return maximum 3 conversation history", function () {
	const history = [
		"Question: How are you?",
		"Answer: I'm fine.",
		"Question: What are you doing?",
		"Answer: I'm working.",
		"Question: What is your name?",
		"Answer: My name is LLM.",
		"Question: How old are you?",
		"Answer: I'm 12 year old.",
	];
	const result = context(history);
	console.log(result);
	expect(result).toBe(
		`Before formulating a thought, consider the following conversation history:\n\nQuestion: What are you doing?\nAnswer: I'm working.\nQuestion: What is your name?\nAnswer: My name is LLM.\nQuestion: How old are you?\nAnswer: I'm 12 year old.`,
	);
});

test("context function always return any number of conversation history if less than 3 conversation.", function () {
	const history = ["Question: How are you?", "Answer: I'm fine."];
	const result = context(history);
	expect(result).toBe(
		`Before formulating a thought, consider the following conversation history:\n\nQuestion: How are you?\nAnswer: I'm fine.`,
	);
});