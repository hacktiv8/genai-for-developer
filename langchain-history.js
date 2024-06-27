import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";

const model = new ChatOllama({
	model: "mistral-openorca",
	temperature: 0,
	top_k: 20,
});

const prompt = ChatPromptTemplate.fromMessages([
	["system", "You're an assistant who's good at {ability}"],
	new MessagesPlaceholder("history"),
	["human", "{question}"],
]);

const chain = prompt.pipe(model);
const history = new ChatMessageHistory();

const chainWithHistory = new RunnableWithMessageHistory({
	runnable: chain,
	getMessageHistory: (_sessionId) => history,
	inputMessagesKey: "question",
	historyMessagesKey: "history",
});

let question = "What does cosine mean?";
const result = await chainWithHistory.invoke(
	{ ability: "math", question },
	{ configurable: { sessionId: "test" } },
);

console.log(`----------- Question: ${question} -------------`);
console.log(result.content);

question = "What's its inverse?";
const result2 = await chainWithHistory.invoke(
	{ ability: "math", question },
	{ configurable: { sessionId: "test" } },
);

console.log("\n");
console.log("----------- Follow Up Question: ${question} -------------");
console.log(result2.content);
