import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";

const tavily = new TavilySearch({ maxResults: 3 });

export const webSearch = tool(
  async ({ query }): Promise<string> => {
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
        return `Search error: ${(results as { error: string }).error}`;
      }

      const list =
        results &&
        typeof results === "object" &&
        "results" in results &&
        Array.isArray((results as { results: unknown[] }).results)
          ? (results as { results: { title: string; content: string; url: string }[] }).results
          : null;

      if (!list || list.length === 0) {
        return "No results found.";
      }

      return list
        .map((r) => `**${r.title}**\n${r.content}\nURL: ${r.url}`)
        .join("\n\n---\n\n");
    } catch (error) {
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
