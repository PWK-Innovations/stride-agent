import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getVectorStore } from "../rag/store";
import { logToolEntry, logToolCall, logToolError } from "../utils/logger";

export const knowledgeBase = tool(
  async ({ query }): Promise<string> => {
    logToolEntry("KnowledgeBase", { query });
    try {
      const store = await getVectorStore();
      const docs = await store.similaritySearch(query, 3);

      if (!docs || docs.length === 0) {
        logToolCall("KnowledgeBase", { query }, "No relevant documents found.");
        return "No relevant documents found.";
      }

      const formatted = docs
        .map(
          (doc, i) =>
            `[${i + 1}] (Source: ${doc.metadata.source})\n${doc.pageContent}`
        )
        .join("\n\n");

      logToolCall("KnowledgeBase", { query }, formatted);
      return formatted;
    } catch (error) {
      logToolError("KnowledgeBase", { query }, error instanceof Error ? error : "Unknown error");
      return `Knowledge base search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "knowledge_base",
    description:
      "Search the productivity and time management knowledge base. Use for questions about the Pomodoro Technique, time-blocking, the Eisenhower Matrix, daily planning, and deep work. Do NOT use for general web questions, current events, or math calculations.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The search query about productivity or time management"
        ),
    }),
  }
);
