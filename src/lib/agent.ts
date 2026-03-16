import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { calculator } from "./tools/calculator";
import { webSearch } from "./tools/web-search";
import { knowledgeBase } from "./tools/rag";
import { calendarTool } from "./tools/calendar";

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

export const agent = createReactAgent({ llm: model, tools: [calculator, webSearch, knowledgeBase, calendarTool] });
