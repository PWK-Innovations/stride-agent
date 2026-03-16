import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";
import { logToolEntry, logToolCall, logToolError } from "../utils/logger";

const tavily = new TavilySearch({ maxResults: 3 });

export const webSearch = tool(
  async ({ query }): Promise<string> => {
    logToolEntry("WebSearch", { query });
    try {
      const raw = await tavily.invoke({ query });
      let results: unknown;
      if (typeof raw === "string") {
        try {
          results = JSON.parse(raw);
        } catch {
          return raw;
        }
      } else {
        results = raw;
      }

      if (
        results &&
        typeof results === "object" &&
        "error" in results &&
        (results as { error: string }).error
      ) {
        const errMsg = (results as { error: string }).error;
        logToolError("WebSearch", { query }, errMsg);
        return `Search error: ${errMsg}`;
      }

      const list =
        results &&
        typeof results === "object" &&
        "results" in results &&
        Array.isArray((results as { results: unknown[] }).results)
          ? (results as { results: { title: string; content: string; url: string }[] }).results
          : null;

      if (!list || list.length === 0) {
        logToolError("WebSearch", { query }, "No results found");
        return "No results found.";
      }

      const formatted = list.map((r) => `**${r.title}**\n${r.content}\nURL: ${r.url}`).join("\n\n---\n\n");
      logToolCall("WebSearch", { query }, formatted);
      return formatted;
    } catch (error) {
      logToolError("WebSearch", { query }, error instanceof Error ? error : "Unknown error");
      return `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "web_search",
    description:
      "Search the web for current information. Use for up-to-date data not in training: news, events, prices, recent releases.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);
