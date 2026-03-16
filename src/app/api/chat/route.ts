import { NextRequest, NextResponse } from "next/server";
import { agent } from "@/lib/agent";
import {
  getMessageHistory,
  addUserMessage,
  addAssistantMessage,
} from "@/lib/memory";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 }
      );
    }

    addUserMessage(sessionId, message);

    const history = getMessageHistory(sessionId);

    const result = await agent.invoke(
      { messages: history },
      { recursionLimit: 10 }
    );

    // Extract the final response text
    const lastMessage = result.messages[result.messages.length - 1];
    const content = lastMessage.content;
    let responseText: string;

    if (Array.isArray(content)) {
      responseText = content
        .filter((block) => typeof block === "object" && "type" in block && block.type === "text")
        .map((block) => (block as { text: string }).text)
        .join("");
    } else {
      responseText = typeof content === "string" ? content : String(content);
    }

    // Extract the last tool used, if any
    let toolUsed: string | null = null;
    for (const msg of result.messages) {
      if (
        (msg.constructor?.name === "ToolMessage") ||
        (typeof msg._getType === "function" && msg._getType() === "tool") ||
        ("name" in msg && "tool_call_id" in msg)
      ) {
        toolUsed = msg.name ?? null;
      }
    }

    addAssistantMessage(sessionId, responseText);

    return NextResponse.json({ response: responseText, toolUsed });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
