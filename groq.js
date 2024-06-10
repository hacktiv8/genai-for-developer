const LLM_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_MESSAGE = `You run in a process of Question, Thought, Action, Observation.

Use Thought to describe your thoughts about the question you have been asked.
Observation will be the result of running those actions.
Finally at the end, state the Answer.

Here are some sample sessions.

Question: What is capital of france?
Thought: This is about geography, I can recall the answer from my memory.
Action: lookup: capital of France.
Observation: Paris is the capital of France.
Answer: The capital of France is Paris.

Question: Who painted Mona Lisa?
Thought: This is about general knowledge, I can recall the answer from my memory.
Action: lookup: painter of Mona Lisa.
Observation: Mona Lisa was painted by Leonardo da Vinci .
Answer: Leonardo da Vinci painted Mona Lisa.

Let's go!`;

export async function answer(text) {
	const MARKER = "Answer:";
	const pos = text.lastIndexOf(MARKER);
	if (pos < 0) return "?";
	const answer = text.substr(pos + MARKER.length).trim();
	return answer;
}

export async function think(question) {
	const response = await generate(question);
	console.log("Response:", response);
	return answer(response);
}

export async function generate(prompt) {
	if (!prompt) throw new Error("Prompt is required");

	const method = "POST";
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${process.env.API_KEY}`,
	};
	const body = JSON.stringify({
		model: "llama3-8b-8192",
		temperature: 0,
		max_tokens: 1024,
		top_p: 1,
		stream: false,
		messages: [
			{ role: "system", content: SYSTEM_MESSAGE },
			{ role: "user", content: prompt },
		],
		stop: "",
	});
	const request = { method, headers, body };
	const res = await fetch(LLM_API_URL, request);
	const { choices } = await res.json();

	return choices[0].message?.content?.trim();
}
