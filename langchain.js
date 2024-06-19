import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatGroq } from "@langchain/groq";

const model = new ChatOllama({
	model: "mistral-openorca",
	temperature: 0,
	top_k: 20,
});

const response = await model.invoke([
	new SystemMessage("You're a helpful assistant"),
	new HumanMessage("Tell me a programming joke"),
]);

console.log(response.content);
console.log("-----------------");

const groqModel = new ChatGroq({
	apiKey: process.env.API_KEY,
	model: "llama3-8b-8192",
	temperature: 0,
	max_tokens: 1024,
	top_p: 1,
});

const groqResponse = await groqModel.invoke([
	new SystemMessage("You're a helpful assistant"),
	new HumanMessage("Tell me a programming joke"),
]);

console.log(groqResponse.content);