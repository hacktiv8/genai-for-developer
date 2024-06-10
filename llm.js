const LLM_API_URL = "http://localhost:11434/api/generate";

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

async function answer(text) {
	const MARKER = "Answer:";
	const pos = text.lastIndexOf(MARKER);
	if (pos < 0) return "?";
	const answer = text.substr(pos + MARKER.length).trim();
	return answer;
}

export async function think(inquiry) {
	const prompt = `${SYSTEM_MESSAGE}\n\n${inquiry}`;
	const response = await generate(prompt);
	console.log("Response:", response);
	return answer(response);
}

export async function generate(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  const method = "POST";
  const headers = {
    "Content-Type": "application/json"
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
