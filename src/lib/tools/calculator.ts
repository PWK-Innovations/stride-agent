import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { evaluate } from "mathjs";
import { logToolEntry, logToolCall, logToolError } from "../utils/logger";

export const calculator = tool(
  async ({ expression }): Promise<string> => {
    logToolEntry("Calculator", { expression });
    try {
      const result = evaluate(expression);
      logToolCall("Calculator", { expression }, String(result));
      return String(result);
    } catch (error) {
      logToolError("Calculator", { expression }, error instanceof Error ? error : "Unknown error");
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
