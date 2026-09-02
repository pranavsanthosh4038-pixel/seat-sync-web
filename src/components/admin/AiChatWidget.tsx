import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { askSeatSyncAi } from "@/lib/aichat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the SeatSync assistant. Ask me about seat availability, waitlist management, or how the system works.",
};

export function AiChatWidget() {
  const ask = useServerFn(askSeatSyncAi);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-10);
      const res = await ask({ data: { messages: history } });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.ok ? res.reply : res.error,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]"
          style={{
            width: "min(360px, calc(100vw - 32px))",
            height: "min(480px, calc(100vh - 140px))",
            animation: "toast-up 0.18s ease-out",
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <div className="text-sm font-bold text-foreground">SeatSync AI</div>
              <div className="text-[11px] text-muted-foreground">Ask me anything</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-primary-foreground"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-secondary px-3.5 py-2 text-[13px] leading-relaxed text-foreground"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-secondary px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      style={{ animation: `pulse-amber 1s ease-in-out ${d * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 border-t p-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask about seats, waitlist, SMS…"
              className="max-h-24 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
            />
            <button
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close SeatSync AI" : "Open SeatSync AI"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-8px_rgba(226,55,68,0.7)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
