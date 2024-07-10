import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

const model = new ChatOllama({
  model: "mistral-openorca",
  temperature: 0,
  top_k: 20,
});

const prompt =
  PromptTemplate.fromTemplate(`Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer

Thought: you should always think about what to do

Action: the action to take, should be one of [{tool_names}]

Action Input: the input to the action

Observation: the result of the action

... (this Thought/Action/Action Input/Observation can repeat N times)

Thought: I now know the final answer

Final Answer: the final answer to the original input question

Begin!

Question: {input}

Thought:{agent_scratchpad}`);

const outputParser = new StringOutputParser();

const timeTool = new DynamicTool({
  name: "current_time",
  description: "Get the current time",
  func: async () => new Date().toLocaleTimeString(),
});

const tools = [timeTool];

// prompt |> model |> parse
const agent = await createReactAgent({
  llm: model,
  tools,
  prompt,
});
const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const response = await agentExecutor.invoke(
  {
    input: "What is the time right now?",
  },
  // { callbacks: [new ConsoleCallbackHandler()] },
);
console.log(response);
