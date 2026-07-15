import { useEffect, useState, useCallback } from "react";
import { releaseSeat, type Seat } from "@/lib/seats";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function useTick(ms = 1000) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(i);
  }, [ms]);
}

function fmtCountdown(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SeatGrid({
  seats,
  selected,
  onToggle,
}: {
  seats: Seat[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  useTick(1000);

  // Auto-release when countdown hits 0
  const seatMap = new Map(seats.map((s) => [s.id, s]));
  const autoRelease = useCallback(async () => {
    const now = Date.now();
    for (const seat of seats) {
      if (
        seat.status === "locked" &&
        seat.expires_at &&
        new Date(seat.expires_at).getTime() <= now
      ) {
        try {
          await releaseSeat(seat.id);
        } catch {
          /* another client won */
        }
      }
    }
  }, [seats]);
  useEffect(() => {
    autoRelease();
  }, [autoRelease]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Screen */}
      <div className="w-full max-w-4xl mb-10">
        <div
          className="h-2 rounded-full mx-auto"
          style={{
            width: "70%",
            background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
            boxShadow: "0 0 24px #00f0ff, 0 0 60px rgba(0,240,255,0.5)",
          }}
        />
        <div className="text-center mt-3 font-mono text-[10px] tracking-[0.4em] text-neon-cyan/70 uppercase">
          — Screen This Way —
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-5xl">
        {ROWS.map((row, rowIdx) => {
          const scale = 1 + rowIdx * 0.012;
          const rowSeats = Array.from({ length: 16 }, (_, i) => seatMap.get(`${row}${i + 1}`));
          const block1 = rowSeats.slice(0, 5);
          const block2 = rowSeats.slice(5, 11);
          const block3 = rowSeats.slice(11, 16);
          return (
            <div
              key={row}
              className="flex items-center justify-center gap-6"
              style={{ transform: `scaleX(${scale})`, transformOrigin: "center" }}
            >
              <div className="w-6 text-right font-mono text-[11px] text-neon-cyan/70">{row}</div>
              <div className="flex gap-1.5">
                {block1.map((s, i) => (
                  <SeatCell
                    key={`${row}-${i}`}
                    seat={s}
                    selected={s ? selected.has(s.id) : false}
                    onToggle={onToggle}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                {block2.map((s, i) => (
                  <SeatCell
                    key={`${row}-${i + 5}`}
                    seat={s}
                    selected={s ? selected.has(s.id) : false}
                    onToggle={onToggle}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                {block3.map((s, i) => (
                  <SeatCell
                    key={`${row}-${i + 11}`}
                    seat={s}
                    selected={s ? selected.has(s.id) : false}
                    onToggle={onToggle}
                  />
                ))}
              </div>
              <div className="w-6 font-mono text-[11px] text-neon-cyan/70">{row}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap gap-6 justify-center font-mono text-[11px] uppercase tracking-widest">
        <LegendDot color="#00ff88" label="Available" />
        <LegendDot color="#ffcc00" label="Locked" pulse />
        <LegendDot color="#00f0ff" label="Selected" />
      </div>
    </div>
  );
}

function LegendDot({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span
        className="inline-block w-3 h-3 rounded-sm"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`,
          animation: pulse ? "pulse-amber 1.4s ease-in-out infinite" : undefined,
        }}
      />
      {label}
    </div>
  );
}

function SeatCell({
  seat,
  selected,
  onToggle,
}: {
  seat: Seat | undefined;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  if (!seat) return <div className="w-7 h-7" />;

  const locked = seat.status === "locked";
  const countdown = locked ? fmtCountdown(seat.expires_at) : "";

  let bg = "transparent";
  let border = "#00ff88";
  let shadow = "0 0 6px rgba(0,255,136,0.6), inset 0 0 4px rgba(0,255,136,0.2)";
  let cursor: "pointer" | "not-allowed" = "pointer";
  let animation: string | undefined;

  if (locked) {
    bg = "rgba(255,204,0,0.15)";
    border = "#ffcc00";
    shadow = "0 0 10px rgba(255,204,0,0.7)";
    cursor = "not-allowed";
    animation = "pulse-amber 1.4s ease-in-out infinite";
  } else if (selected) {
    bg = "rgba(0,240,255,0.25)";
    border = "#00f0ff";
    shadow = "0 0 12px #00f0ff, 0 0 24px rgba(0,240,255,0.5), inset 0 0 6px rgba(0,240,255,0.4)";
  }

  return (
    <div className="relative w-7 h-7 flex items-center justify-center">
      {locked && (
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] glow-amber whitespace-nowrap pointer-events-none"
          style={{ letterSpacing: "0.05em" }}
        >
          {countdown}
        </div>
      )}
      <button
        onClick={() => !locked && onToggle(seat.id)}
        disabled={locked}
        aria-label={`Seat ${seat.id}`}
        className="w-6 h-6 rounded-[3px] font-mono text-[8px] transition-all"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: shadow,
          cursor,
          color: selected ? "#00f0ff" : locked ? "#ffcc00" : "#00ff88",
          animation,
        }}
      >
        {seat.seat_number}
      </button>
    </div>
  );
}
