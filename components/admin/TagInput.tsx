"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (text: string) => {
    const clean = text.trim().toLowerCase().replace(/^#+/, "");
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      onChange(tags.slice(0, tags.length - 1));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-neutral-700">Tags & Keywords</label>
        <span className="text-[11px] text-neutral-400">
          Type word & press{" "}
          <kbd className="bg-stone-100 border border-stone-200 px-1 py-0.5 rounded text-[10px] font-mono text-neutral-600">
            Enter
          </kbd>
        </span>
      </div>

      <div
        onClick={() => document.getElementById("admin-tag-input")?.focus()}
        className="flex flex-wrap items-center gap-1.5 min-h-[44px] w-full rounded-xl border border-stone-200 bg-white p-2 text-xs focus-within:border-neutral-900 transition-colors cursor-text"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-800 pl-2.5 pr-1.5 py-1 text-xs font-medium border border-stone-200/60"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="size-4 rounded-full flex items-center justify-center hover:bg-stone-300 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <input
          id="admin-tag-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={
            tags.length === 0
              ? "Type tag (e.g. wedding) and press Enter..."
              : "Add another tag..."
          }
          className="flex-1 min-w-[130px] border-none bg-transparent px-1.5 py-1 text-xs text-neutral-900 placeholder:text-stone-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
