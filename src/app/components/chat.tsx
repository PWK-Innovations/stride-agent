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

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          toolUsed: data.toolUsed,
        },
      ]);
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
