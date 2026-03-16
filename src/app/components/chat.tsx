"use client";

import { useState, useEffect, useRef } from "react";
import Message from "./message";
import Input from "./input";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolUsed?: string | null;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Create sessionId once on mount to avoid SSR mismatch
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Auto-scroll to bottom when messages change or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (message: string) => {
    // Optimistically append user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!res.body) throw new Error("No response body");

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", toolUsed: null },
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let toolUsed: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text") {
              setMessages((prev) =>
                prev.map((msg, i) =>
                  i === prev.length - 1 && msg.role === "assistant"
                    ? { ...msg, content: msg.content + parsed.content }
                    : msg
                )
              );
            } else if (parsed.type === "tool") {
              toolUsed = parsed.name;
            } else if (parsed.type === "done") {
              toolUsed = parsed.toolUsed;
            } else if (parsed.type === "error") {
              setMessages((prev) =>
                prev.map((msg, i) =>
                  i === prev.length - 1 && msg.role === "assistant"
                    ? { ...msg, content: "Sorry, something went wrong. Please try again." }
                    : msg
                )
              );
            }
          } catch {
            // Ignore malformed JSON chunks
          }
        }
      }

      // Update tool badge on final message
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 && msg.role === "assistant"
            ? { ...msg, toolUsed }
            : msg
        )
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-olive-50 dark:bg-olive-950">
      {/* Header */}
      <header className="border-b border-olive-200 bg-white px-6 py-4 dark:border-olive-700 dark:bg-olive-900">
        <h1 className="font-display text-2xl text-olive-950 dark:text-white">
          Stride Agent
        </h1>
        <p className="text-sm text-olive-500 dark:text-olive-400">
          AI-powered productivity assistant
        </p>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-olive-400 dark:text-olive-500">
              Send a message to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <Message
                key={i}
                role={msg.role}
                content={msg.content}
                toolUsed={msg.toolUsed}
              />
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="max-w-[70%] rounded-2xl bg-olive-100 px-4 py-3 text-olive-500 dark:bg-olive-800 dark:text-olive-400">
                Thinking...
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-olive-200 bg-white p-4 dark:border-olive-700 dark:bg-olive-900">
        <Input onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
