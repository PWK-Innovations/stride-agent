"use client";

import { useState } from "react";
import clsx from "clsx/lite";

interface InputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function Input({ onSend, disabled }: InputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        disabled={disabled}
        className={clsx(
          "rounded-full border border-olive-300 bg-white text-olive-950 px-4 py-2 flex-1",
          "focus:border-olive-500 focus:outline-none",
          "dark:border-olive-600 dark:bg-olive-900 dark:text-white"
        )}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={clsx(
          "rounded-full bg-olive-950 text-white px-4 py-2 text-sm font-medium",
          "hover:bg-olive-800 disabled:opacity-50",
          "dark:bg-olive-300 dark:text-olive-950 dark:hover:bg-olive-200"
        )}
      >
        Send
      </button>
    </div>
  );
}
