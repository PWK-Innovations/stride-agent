import fs from "fs";
import path from "path";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { loadAndSplitDocuments } from "./loader";
import { logger } from "../utils/logger";

let vectorStore: MemoryVectorStore | null = null;

const CACHE_PATH = path.join(process.cwd(), "data", "vectorstore.json");
const DOCS_DIR = path.join(process.cwd(), "docs");

function getLatestDocsMtime(): number {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"));

  let latest = 0;
  for (const file of files) {
    const mtime = fs.statSync(path.join(DOCS_DIR, file)).mtimeMs;
    if (mtime > latest) latest = mtime;
  }
  return latest;
}

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

  // Check if a disk cache exists and is still fresh
  if (fs.existsSync(CACHE_PATH)) {
    const cacheMtime = fs.statSync(CACHE_PATH).mtimeMs;
    const docsMtime = getLatestDocsMtime();

    if (cacheMtime > docsMtime) {
      logger.info("[RAG] Loading vector store from cache");
      const raw = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
      const store = new MemoryVectorStore(embeddings);
      store.memoryVectors = raw;
      vectorStore = store;
      return vectorStore;
    }
  }

  // Rebuild from documents
  logger.info("[RAG] Building vector store from documents");
  const docs = await loadAndSplitDocuments();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  logger.info({ documentCount: docs.length }, "[RAG] Vector store initialized");

  // Persist to disk
  const cacheDir = path.dirname(CACHE_PATH);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(vectorStore.memoryVectors));

  return vectorStore;
}
