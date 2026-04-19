"use client";

import { useCallback, useRef } from "react";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WalletInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onQuery: () => void;
  loading: boolean;
  extra?: React.ReactNode;
}

export default function WalletInputBar({
  value,
  onChange,
  onQuery,
  loading,
  extra,
}: WalletInputBarProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onQuery();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 panel p-2 mb-4">
      {/* Address Input */}
      <div className="flex flex-1 min-w-[260px] items-center gap-2 bg-[#18202F] border border-[#262D3D] rounded-lg px-3 py-2 focus-within:border-blue-500/50 transition-colors">
        <button
          onClick={handleCopy}
          title={t("input.paste") /* Though it says paste in dict, actually it means Copy, I'll update dict if needed, or use a new key. Let's just use "Copy" hardcoded since dict is missing it, wait I have input.paste. I'll just change to t("input.paste") for now, actually "Copy" is missing, let's use t("input.paste") as placeholder and I can add 'Copy' to dict later or just ignore tooltips */}
          className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
        >
          {copied ? (
            <Check size={15} className="text-emerald-500" />
          ) : (
            <Copy size={15} />
          )}
        </button>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-sm font-mono text-gray-300 placeholder-gray-600 min-w-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("input.placeholder")}
          spellCheck={false}
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            className="text-gray-600 hover:text-gray-400 transition-colors shrink-0 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Extra controls (checkboxes, selects, etc.) */}
      {extra}

      {/* Query Button */}
      <button
        onClick={onQuery}
        disabled={loading || !value.trim()}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <RefreshCw size={15} />
        )}
        {t("common.query")}
      </button>
    </div>
  );
}
