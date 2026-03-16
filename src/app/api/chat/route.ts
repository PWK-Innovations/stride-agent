import { NextRequest, NextResponse } from "next/server";
import { agent } from "@/lib/agent";
import {
  getMessageHistory,
  addUserMessage,
  addAssistantMessage,
} from "@/lib/memory";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 }
      );
    }

    logger.info({ sessionId, message }, "[Chat API] Request received");

    addUserMessage(sessionId, message);

    const history = getMessageHistory(sessionId);

    // Stream token-by-token using streamEvents
    const encoder = new TextEncoder();
    let toolUsed: string | null = null;
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = agent.streamEvents(
            { messages: history },
            { version: "v2", recursionLimit: 10 }
          );

          for await (const event of stream) {
            // Track tool usage from tool_end events
            if (event.event === "on_tool_end") {
              toolUsed = event.name ?? null;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "tool", name: toolUsed })}\n\n`)
              );
            }

            // Stream text tokens from the LLM
            if (event.event === "on_chat_model_stream") {
              const chunk = event.data?.chunk;
              if (!chunk) continue;

              // Only emit actual text content, skip tool_call_chunks
              const content = chunk.content;
              if (typeof content === "string" && content.length > 0) {
                fullResponse += content;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`)
                );
              } else if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === "text" && block.text) {
                    fullResponse += block.text;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: "text", content: block.text })}\n\n`)
                    );
                  }
                }
              }
            }
          }

          // Save full response to memory
          addAssistantMessage(sessionId, fullResponse);

          logger.info(
            { sessionId, toolUsed, responseLength: fullResponse.length },
            "[Chat API] Response sent"
          );

          // Send done event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", toolUsed })}\n\n`)
          );
          controller.close();
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Stream error";
          logger.error({ error: errorMessage }, "[Chat API] Stream error");
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", content: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    logger.error({ error: errorMessage }, "[Chat API] Error");
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
