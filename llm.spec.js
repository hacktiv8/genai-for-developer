import { expect, test, vi } from "vitest";

import { generate } from "./llm.js";

global.fetch = vi.fn();

function createResponse(data) {
  return {
    json: function () {
      return new Promise(function (resolve, reject) {
        resolve(data);
      });
    }
  }
}

test("Calling llm() function with argument 'Hello, world!' should return some answer", async function () {
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model: "orca-mini", prompt: "Can you speak Bahasa Indonesia?", options: { num_predict: 200, temperature: 0, top_k: 20 }, stream: false })
  });

  expect(response.length).toBeGreaterThan(0);
  
});

test("Calling llm() function without argument should throw an error", async function () {
  await expect(async () => await generate()).rejects.toThrowError("Prompt is required");
});
