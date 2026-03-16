"use client";

import clsx from "clsx/lite";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  toolUsed?: string | null;
}

function cleanContent(text: string): string {
  return text
    .replace(/\\\(|\\\)/g, "")
    .replace(/\\\[|\\\]/g, "")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
}

export default function Message({ role, content, toolUsed }: MessageProps) {
  const isUser = role === "user";
  const displayContent = cleanContent(content);

  return (
    <div
      className={clsx(
        "max-w-[70%] rounded-2xl px-4 py-3",
        isUser && "ml-auto bg-olive-950 text-white dark:bg-olive-300 dark:text-olive-950",
        !isUser &&
          "bg-olive-100 text-olive-950 dark:bg-olive-800 dark:text-white"
      )}
    >
      <p className="whitespace-pre-wrap">{displayContent}</p>

      {!isUser && toolUsed && (
        <span className="mt-2 inline-block rounded-full bg-olive-300 px-2 py-0.5 text-xs text-olive-700 dark:bg-olive-700 dark:text-olive-300">
          Used: {toolUsed}
        </span>
      )}
    </div>
  );
}
