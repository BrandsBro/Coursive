"use client";

import { Check } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyStreaks() {
  const { weeklyActivity, loaded } = useStreak();

  return (
    <>
      <div className="ws-card">
        {/* Label */}
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6366f1",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 6px",
        }}>
          Weekly Streaks
        </p>

        {/* Heading */}
        <h3 style={{
          fontSize: 17,
          fontWeight: 800,
          color: "#111827",
          margin: "0 0 20px",
          lineHeight: 1.3,
        }}>
          Help you build learning habit
        </h3>

        {/* Day dots */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          {DAYS.map((day, i) => (
            <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div className="ws-dot" style={{
                borderRadius: "50%",
                background: weeklyActivity[i] ? "#22c55e" : "transparent",
                border: weeklyActivity[i] ? "none" : "1.5px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {weeklyActivity[i] && <Check className="ws-check" color="#fff" strokeWidth={3} />}
              </div>
              <span className="ws-label">{day}</span>
            </div>
          ))}
        </div>

        {/* Bottom status */}
        <p style={{ fontSize: 13, color: "#374151", margin: 0, fontWeight: 500 }}>
          {weeklyActivity[6]
            ? "✅ Today's task is complete"
            : "🎯 Complete a lesson to continue your streak"}
        </p>
      </div>

      <style>{`
        .ws-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .ws-dot {
          width: 36px;
          height: 36px;
        }
        .ws-check {
          width: 15px;
          height: 15px;
        }
        .ws-label {
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .ws-card {
            border-radius: 16px;
            padding: 20px;
          }
          .ws-dot {
            width: 30px;
            height: 30px;
          }
          .ws-check {
            width: 12px;
            height: 12px;
          }
          .ws-label {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
