# Unit 8: RAG & Multi-Tool Agents

## Embeddings

Convert text into numerical vectors capturing semantic meaning.

```
"king"   → [0.21, -0.45, 0.89, 0.12, ...]
"queen"  → [0.19, -0.42, 0.91, 0.15, ...]  (similar)
"banana" → [0.82, 0.33, -0.11, 0.67, ...]  (different)
```

Similar meanings → similar vectors → search by meaning, not keywords.

### Implementation

```typescript
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",  // Fast and cheap
});

const vector = await embeddings.embedQuery("What is photosynthesis?");
// → [0.021, -0.045, 0.089, ...] (1536 numbers)
```

**Note:** Anthropic lacks an embeddings model — use OpenAI or Voyage AI.

## Vector Store Setup

### In-Memory

```typescript
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments([
  {
    pageContent: "Our API rate limit is 100 requests per minute...",
    metadata: { source: "api-docs.md", topic: "rate-limits" },
  },
  {
    pageContent: "Authentication uses JWT tokens with 24h expiry...",
    metadata: { source: "auth-docs.md", topic: "authentication" },
  },
]);
```

### Document Loading — Option 1: Static Array

Create a `documents.ts` file with content as an object array.

### Document Loading — Option 2: DirectoryLoader

```typescript
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new DirectoryLoader("./docs", {
  ".txt": (path) => new TextLoader(path),
});
const docs = await loader.load();
await vectorStore.addDocuments(docs);
```

### Vector Store Comparison

| Approach | Best For | Trade-offs |
|----------|----------|-----------|
| In-memory | Prototypes, <10K docs | Fast, no setup; lost on restart |
| Pinecone/Weaviate | Production, large datasets | Persistent, scalable; costs money |
| ChromaDB | Local development | Persistent, free; single machine |
| PostgreSQL + pgvector | Existing Postgres setups | Integrated; requires Postgres |

## RAG Tool

```typescript
const knowledgeBase = tool(
  async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 3);

    if (results.length === 0) {
      return "No relevant documents found.";
    }

    return results
      .map((doc, i) =>
        `[${i + 1}] (Source: ${doc.metadata.source})\n${doc.pageContent}`
      )
      .join("\n\n");
  },
  {
    name: "knowledge_base",
    description:
      "Search the documentation knowledge base using semantic search. " +
      "Use this to find information from our docs about APIs, " +
      "authentication, configuration, etc.",
    schema: z.object({
      query: z.string().describe("Natural language query about the documentation"),
    }),
  }
);
```

**Key:** Source attribution via `doc.metadata.source` in every response.

## Multi-Tool Chaining

The LLM reads tool descriptions and decides which tool(s) to call.

### Example: "How much does the starter plan cost per year?"

1. **RAG tool** → retrieves pricing info from docs
2. **Calculator tool** → multiplies monthly cost × 12
3. **Final answer** → provides both calculations

## Conversation Memory

```typescript
let messageHistory = [];

async function chat(userMessage) {
  messageHistory.push({ role: "user", content: userMessage });

  const result = await agent.invoke({ messages: messageHistory });
  const assistantMessage = result.messages[result.messages.length - 1];

  messageHistory.push({ role: "assistant", content: assistantMessage.content });
  return assistantMessage.content;
}

// Multi-turn works:
await chat("What does the starter plan cost?");
await chat("And what's that per year?");  // Remembers context!
```

**Warning:** Naive approach grows unbounded. Production needs truncation or summarization.

## Alternative Frameworks

| Framework | Language | Best For |
|-----------|----------|----------|
| LangChain | Python + JS/TS | Broadest ecosystem |
| Mastra | TypeScript only | TS-native DX |
| CrewAI | Python | Multi-agent teams |
| OpenAI Agents SDK | Python | Simple agents (vendor locked) |

All implement the same ReAct loop under the hood.

## Production Considerations

### Token Costs

| Scenario | Iterations | Cost |
|----------|-----------|------|
| Simple calculation | 1-2 | Low |
| Web search + answer | 2-3 | Medium |
| Multi-tool chain | 3-5 | Higher |
| Agent stuck in loop | 10+ | Expensive! |

### Security

- Never hardcode API keys
- Validate tool inputs (especially calculator)
- Sanitize user input for prompt injection
- Audit tool outputs

### Safe Math

```typescript
// ❌ Dangerous
const result = eval(userExpression);

// ✅ Safe
import { evaluate } from "mathjs";
const result = evaluate(expression);
```

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `API_KEY not set` | Missing env var | Export OPENAI_API_KEY |
| `Tool not found` | Name mismatch | Verify tool name |
| Agent returns text not tool call | Poor description | Make WHEN explicit |
| `RateLimitError` | Too many calls | Add delays, use mini model |
| RAG returns no results | Docs not loaded | Verify addDocuments() was awaited |
| TypeError: Cannot read properties | Missing async/await | Web/RAG tools MUST be async |

## Project Deliverables

### Required

- context.md, .gitignore, PRD, roadmap
- Calculator tool, web search tool, RAG tool (5+ docs, source attribution)
- Conversation memory (multi-turn)
- Web UI (not terminal)
- Structured logging (tool calls, args, results)
- 5+ meaningful git commits
- README.md
- 2-minute demo video

### Stretch

- Streaming in web UI
- 4th custom tool
- Persistent vector store
- Agent proposal connecting to existing project
