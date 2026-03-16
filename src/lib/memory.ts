import {
  BaseMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

const store: Record<string, BaseMessage[]> = {};

export function getMessageHistory(sessionId: string): BaseMessage[] {
  if (!store[sessionId]) {
    store[sessionId] = [];
  }
  return store[sessionId];
}

export function addUserMessage(sessionId: string, content: string): void {
  getMessageHistory(sessionId).push(new HumanMessage(content));
}

export function addAssistantMessage(sessionId: string, content: string): void {
  getMessageHistory(sessionId).push(new AIMessage(content));
}

export function clearSession(sessionId: string): void {
  delete store[sessionId];
}
