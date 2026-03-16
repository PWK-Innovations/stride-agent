import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { evaluate } from "mathjs";

export const calculator = tool(
  async ({ expression }): Promise<string> => {
    try {
      const result = evaluate(expression);
      return String(result);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluate mathematical expressions. Use for arithmetic, percentages, or calculations where precision matters. Input should be a valid math expression like '2 + 2', 'sqrt(16)', or '0.15 * 230'.",
    schema: z.object({
      expression: z
        .string()
        .describe(
          "A mathematical expression to evaluate (mathjs syntax)"
        ),
    }),
  }
);
