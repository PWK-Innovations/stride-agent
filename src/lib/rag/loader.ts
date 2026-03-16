import fs from "fs";
import path from "path";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const DOCS_DIR = path.join(process.cwd(), "docs");

export async function loadAndSplitDocuments() {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"));

  const docs = files.map((file) => {
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    return new Document({
      pageContent: content,
      metadata: { source: `docs/${file}` },
    });
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return splitter.splitDocuments(docs);
}
