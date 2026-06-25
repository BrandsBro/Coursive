"use client";

import { Check } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function WeeklyStreaks() {
  const { streak, weeklyActivity, loaded } = useStreak();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        Weekly Streaks
      </p>
      <h3 className="font-bold text-gray-900 text-base mb-4">
        {streak > 0 ? `${streak} day streak! 🔥` : "Build your streak!"}
      </h3>

      <div className="flex justify-between mb-4">
        {DAYS.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              weeklyActivity[i] ? "bg-success" : "bg-gray-100 border border-gray-200"
            }`}>
              {weeklyActivity[i] && <Check size={14} className="text-white" />}
            </div>
            <span className="text-xs text-gray-400">{day}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-2.5">
        <p className="text-sm text-gray-600 font-medium">
          {weeklyActivity[6]
            ? "✅ Today's task is complete"
            : "🎯 Complete a lesson to continue your streak"}
        </p>
      </div>
    </div>
  );
}
