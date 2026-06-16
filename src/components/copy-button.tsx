"use client";

import { useState } from "react";

interface CopyButtonProps {
  content: string;
}

export default function CopyButton({ content }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard permission failures leave the button ready to retry.
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="px-3 py-1 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded border border-zinc-700 transition duration-150 cursor-pointer select-none"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}


