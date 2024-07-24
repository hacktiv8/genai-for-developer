import { Hono } from "hono";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/community/llms/ollama";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { OutputFixingParser } from "langchain/output_parsers";
import { z } from "zod";

const api = new Hono();
const model = new Ollama({
  model: "mistral-openorca",
  temperature: 0,
  top_k: 12,
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are great and creative at finding food recipes."],
  [
    "human",
    "Please provide one or more recipe and it's variants for {query}. Format Instructions: {format_instructions}",
  ],
]);

const outputParser = StructuredOutputParser.fromZodSchema(
  z.array(
    z.object({
      name: z.string().describe("Name of the recipe"),
      ingredients: z.array(z.string().describe("Ingredients of the recipe")),
      instructions: z.array(z.string().describe("Instructions of the recipe")),
    }),
  ),
);

// prompt |> model |> parse |> invoke
const chains = prompt.pipe(model).pipe(outputParser);

// Recipe Service
api.get("/api/recipe", async function (ctx) {
  const query = ctx.req.query("q");
  const res = await chains.invoke({
    query: query,
    format_instructions: outputParser.getFormatInstructions(),
  });
  let response;
  if (typeof response === "string") {
    response = JSON.parse(res);
  } else {
    response = res;
  }

  return ctx.json({
    status: "OK",
    response,
    query,
  });
});

export default api;
