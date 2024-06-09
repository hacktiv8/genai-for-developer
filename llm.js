const LLM_API_URL = "http://localhost:11434/api/generate";

export function createPrompt(question) {
	return `This is a conversation between User and Assistant, a friendly chatbot. Assistant is helpful, kind, honest, and never fails to answer any requests immediately, with precision, and concisely in 10 words or less.
   User: ${question}
   Assistant:`;
}

export async function generate(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  const method = "POST";
  const headers = {
    "Content-Type": "application/json"
  };
  const body = JSON.stringify({
    model: "orca-mini",
    prompt,
    options: {
      num_predict: 200,
      temperature: 0,
      top_k: 20
    },
    stream: false
  });
  const request = { method, headers, body };
  const res = await fetch(LLM_API_URL, request);
  const { response } = await res.json();

  return response.trim();
}
