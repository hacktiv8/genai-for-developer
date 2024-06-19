import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOllama({
	model: "mistral-openorca",
	temperature: 0,
	top_k: 20,
});

const prompt = ChatPromptTemplate.fromMessages([
	["system", "You are an expert at picking startup company names"],
	[
		"human",
		"What are three good names for a company that distrupts the {industry} industry?",
	],
]);

const outputParser = new StringOutputParser();

// prompt |> model |> parse |> invoke
const chains = prompt.pipe(model).pipe(outputParser);
const response = await chains.invoke({ industry: "transportation" });
console.log(response);
