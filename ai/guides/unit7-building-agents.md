# Unit 7: Building AI Agents

## The ReAct Pattern

**Think → Act → Observe → Repeat**

1. **Think:** LLM receives user message + tool definitions
2. **Act:** Model decides which tool to invoke
3. **Observe:** Tool executes and returns results
4. **Repeat:** Model evaluates — more tools needed or final answer?

## Tool Calling Flow

1. You send message + tool schemas to the LLM
2. Model responds with structured tool call (not text)
3. Your code executes the tool and returns results
4. Model sees results and decides next action or answers

### Agent Loop Pseudocode

```javascript
function runAgent(userMessage, tools):
    messages = [userMessage]
    while true:
        response = llm.call(messages, tools)
        if response.hasToolCalls:
            for each toolCall in response.toolCalls:
                result = execute(toolCall)
                messages.append(result)
        else:
            return response.text
```

## LangChain Setup

### Installation

```bash
npm install langchain @langchain/openai @langchain/langgraph @langchain/core zod
npm install @langchain/tavily        # Web search
npm install @langchain/classic       # For RAG (Unit 8)
```

### Environment Variables

```bash
export OPENAI_API_KEY="your-key-here"
export TAVILY_API_KEY="your-key-here"
```

## Tool Architecture

Three components per tool:
1. **Function** — executes the logic
2. **Metadata** — name + description (critical for LLM decision-making)
3. **Schema** — Zod validation for input parameters

### Tool Definition Pattern

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const exampleTool = tool(
  ({ paramName }) => {
    return "result as string";
  },
  {
    name: "tool_name",
    description: "Clear explanation of WHEN and WHY to use this tool",
    schema: z.object({
      paramName: z.string().describe("Parameter explanation"),
    }),
  }
);
```

### Calculator Tool

```typescript
const calculator = tool(
  ({ expression }) => {
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      if (!isFinite(result)) return "Error: Result is infinity or NaN";
      return String(result);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluate mathematical expressions. Use for arithmetic, " +
      "percentages, or calculations where precision matters. " +
      "Input should be valid JS math like '2 + 2' or 'Math.sqrt(16)'.",
    schema: z.object({
      expression: z.string().describe("A JavaScript math expression to evaluate"),
    }),
  }
);
```

### Web Search Tool (Tavily)

```typescript
import { TavilySearch } from "@langchain/tavily";

const webSearch = tool(
  async ({ query }) => {
    const tavily = new TavilySearch({ maxResults: 3 });
    const results = await tavily.invoke({ query });
    if (Array.isArray(results)) {
      return results
        .map((r) => `**${r.title}**\n${r.content}\nURL: ${r.url}`)
        .join("\n\n---\n\n");
    }
    return String(results);
  },
  {
    name: "web_search",
    description:
      "Search the web for current information. Use for up-to-date " +
      "data not in training: news, events, prices, recent releases.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);
```

## Agent Creation

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const tools = [calculator, webSearch];

const agent = createAgent({
  model: model,
  tools: tools,
});
```

### Invocation

```typescript
// Simple
const result = await agent.invoke({
  messages: [{ role: "user", content: "What is 42 * 58?" }],
});
console.log(result.messages[result.messages.length - 1].content);

// Streaming
const stream = await agent.stream({
  messages: [{ role: "user", content: "What is 42 * 58?" }],
});
for await (const chunk of stream) {
  console.log("Step:", JSON.stringify(chunk, null, 2));
}
```

## Critical Guidelines

### Tool Descriptions

**Bad:** "Searches the web"
**Good:** "Search the web for current information not available in training data, such as recent events, current prices, or real-time data"

### Error Handling — Never Throw from Tools

```typescript
// ✗ Bad — crashes agent loop
const badTool = tool(({ expression }) => {
  return eval(expression);
}, { ... });

// ✓ Good — returns error message
const goodTool = tool(({ expression }) => {
  try {
    const result = Function('"use strict"; return (' + expression + ')')();
    return String(result);
  } catch (error) {
    return `Error: ${error.message}. Try a simpler expression.`;
  }
}, { ... });
```

### Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Vague descriptions | Wrong tool selection | Be explicit about usage context |
| Unhandled errors | Agent crash | Always try/catch, return error strings |
| Too many tools (>5) | Confusion/slowness | Start with 3-5 max |
| No iteration limits | Infinite loops | Set recursion limits |
| Forgetting `async` | Hangs on external calls | Web/RAG tools require async |

### Recursion Limits

```typescript
const result = await agent.invoke(
  { messages },
  { recursionLimit: 10 }
);
```

## Cost Estimates

- OpenAI: $5 credit (new accounts)
- Tavily: 1,000 searches/month free tier
- Estimated project cost: $2-5 total (using gpt-4o-mini)
