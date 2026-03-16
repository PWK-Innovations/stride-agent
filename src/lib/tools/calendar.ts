import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { google } from "googleapis";
import { logToolEntry, logToolCall, logToolError } from "../utils/logger";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendarApi = google.calendar({ version: "v3", auth: oauth2Client });

export const calendarTool = tool(
  async ({ action, query }): Promise<string> => {
    logToolEntry("Calendar", { action, query });
    try {
      if (action === "list") {
        const now = new Date();
        const timeMin = now.toISOString();

        // Default to 7 days ahead
        const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const res = await calendarApi.events.list({
          calendarId: "primary",
          timeMin,
          timeMax,
          maxResults: 10,
          singleEvents: true,
          orderBy: "startTime",
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
          const result = "No upcoming events found in the next 7 days.";
          logToolCall("Calendar", { action, query }, result);
          return result;
        }

        const formatted = events
          .map((event) => {
            const start = event.start?.dateTime || event.start?.date || "Unknown";
            const end = event.end?.dateTime || event.end?.date || "";
            return `- **${event.summary || "Untitled"}** — ${start}${end ? ` to ${end}` : ""}`;
          })
          .join("\n");

        const result = `Upcoming events:\n${formatted}`;
        logToolCall("Calendar", { action, query }, result);
        return result;
      }

      if (action === "create") {
        // Parse natural language event details from the query
        // The LLM should provide: title, date, time in the query
        const eventDetails = parseEventQuery(query || "");

        const event = await calendarApi.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: eventDetails.title,
            start: {
              dateTime: eventDetails.startTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: eventDetails.endTime,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        });

        const result = `Event created: "${event.data.summary}" on ${event.data.start?.dateTime || event.data.start?.date}. Link: ${event.data.htmlLink}`;
        logToolCall("Calendar", { action, query }, result);
        return result;
      }

      return "Unknown action. Use 'list' to view events or 'create' to add an event.";
    } catch (error) {
      logToolError("Calendar", { action, query }, error instanceof Error ? error : "Unknown error");
      return `Calendar error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "google_calendar",
    description:
      "Interact with Google Calendar. Use for scheduling, viewing upcoming events, or creating new events. Actions: 'list' to see upcoming events, 'create' to add a new event. Do NOT use for math, web search, or productivity knowledge questions.",
    schema: z.object({
      action: z.enum(["list", "create"]).describe("Whether to list upcoming events or create a new one"),
      query: z
        .string()
        .optional()
        .describe(
          "For create: event details like 'Team meeting tomorrow at 3pm for 1 hour'. For list: optional filter like 'tomorrow' or 'this week'."
        ),
    }),
  }
);

function parseEventQuery(query: string): {
  title: string;
  startTime: string;
  endTime: string;
} {
  // Extract a title — everything before time-related words
  const timeWords = /\b(at|on|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next|this)\b/i;
  const match = query.match(timeWords);
  const title = match ? query.slice(0, match.index).trim() || query : query;

  // Try to parse a date/time from the query
  const now = new Date();
  let startTime = new Date(now);

  // Handle "tomorrow"
  if (/tomorrow/i.test(query)) {
    startTime.setDate(startTime.getDate() + 1);
  }

  // Handle day names
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < days.length; i++) {
    if (new RegExp(days[i], "i").test(query)) {
      const currentDay = now.getDay();
      const daysUntil = (i - currentDay + 7) % 7 || 7;
      startTime.setDate(now.getDate() + daysUntil);
    }
  }

  // Handle time like "at 3pm", "at 10am", "at 14:00"
  const timeMatch = query.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    startTime.setHours(hours, minutes, 0, 0);
  }

  // Default duration: 1 hour
  const durationMatch = query.match(/for\s+(\d+)\s*(hour|hr|minute|min)/i);
  let durationMs = 60 * 60 * 1000; // default 1 hour
  if (durationMatch) {
    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    durationMs = unit.startsWith("min") ? amount * 60 * 1000 : amount * 60 * 60 * 1000;
  }

  const endTime = new Date(startTime.getTime() + durationMs);

  return {
    title: title || "New Event",
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  };
}
