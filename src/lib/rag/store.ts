import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { loadAndSplitDocuments } from "./loader";
import { logger } from "../utils/logger";

let vectorStore: MemoryVectorStore | null = null;

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
  const docs = await loadAndSplitDocuments();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  logger.info({ documentCount: docs.length }, "[RAG] Vector store initialized");

  return vectorStore;
}
