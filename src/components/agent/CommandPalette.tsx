import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  description: string;
  onSelect: () => void | Promise<void>;
  icon?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (command: string) => Promise<void> | void;
  loading?: boolean;
  suggestions?: string[];
  quickActions?: QuickAction[];
}

export function CommandPalette({
  open,
  onClose,
  onSubmit,
  loading = false,
  suggestions = [],
  quickActions = [],
}: CommandPaletteProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!open) {
      setInput("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    await onSubmit(trimmed);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-16" onClick={onClose}>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Command palette</p>
              <h2 className="text-lg font-semibold text-slate-900">Ask BizOptimize to shape this build</h2>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">esc</span>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="e.g. “Quote a 30x24 heated garage with EV charging”"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus-visible:border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10"
            />
          </form>
        </div>

        <div className="grid gap-6 px-6 py-5">
          {quickActions.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Quick actions</p>
              <div className="grid gap-3 md:grid-cols-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={async () => {
                      await action.onSelect();
                      onClose();
                    }}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-slate-900 hover:bg-slate-50"
                  >
                    <span className="text-xl">{action.icon ?? "✨"}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Try asking</p>
              <div className="grid gap-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={async () => {
                      await onSubmit(suggestion);
                      onClose();
                    }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={cn("rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500", loading && "text-slate-400")}>
            {loading ? "Assistant thinking..." : "Press Enter to send the command via BizOptimize Agent. Fields will auto-update when possible."}
          </div>
        </div>
      </div>
    </div>
  );
}
