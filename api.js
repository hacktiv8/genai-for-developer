import { Hono } from "hono";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";

const api = new Hono();
const model = new ChatOllama({
  model: "mistral-openorca",
  temperature: 0,
  top_k: 12,
  format: "json",
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are great and creative at finding food recipes."],
  [
    "human",
    "Please provide one or more recipe and it's variants for {query} in valid JSON format.",
  ],
]);

const outputParser = new StringOutputParser();

// prompt |> model |> parse |> invoke
const chains = prompt.pipe(model).pipe(outputParser);

// Recipe Service
api.get("/api/recipe", async function (ctx) {
  const query = ctx.req.query("q");
  const response = await chains.invoke({ query: query });
  console.log(response);
  return ctx.json({
    status: "OK",
    response: JSON.parse(response),
    query,
  });
});

export default api;
