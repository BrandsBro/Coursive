"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useStreak() {
  const [userId, setUserId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState([false,false,false,false,false,false,false]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setLoaded(true); return; }
    loadStreak();
  }, [userId]);

  const loadStreak = async () => {
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      // Check if streak should be reset (missed a day)
      const today = new Date().toISOString().split("T")[0];
      const lastActivity = data.last_activity_date;

      if (lastActivity) {
        const last = new Date(lastActivity);
        const now = new Date(today);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          // Missed a day — reset streak
          await supabase.from("user_streaks").update({
            current_streak: 0,
            updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
          setStreak(0);
        } else {
          setStreak(data.current_streak || 0);
        }
      }

      setLongestStreak(data.longest_streak || 0);
      setWeeklyActivity(buildWeeklyActivity(data.weekly_activity || []));
    }
    setLoaded(true);
  };

  const updateStreak = useCallback(async () => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];

    // Get current streak data
    const { data: existing } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    let newStreak = 1;
    let longest = 0;
    let activity = [];

    if (existing) {
      const lastDate = existing.last_activity_date;
      longest = existing.longest_streak || 0;
      activity = existing.weekly_activity || [];

      if (lastDate === today) {
        // Already active today — no change
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastDate === yesterdayStr) {
        // Continued streak
        newStreak = (existing.current_streak || 0) + 1;
      } else {
        // Missed days — reset
        newStreak = 1;
      }
    }

    // Update weekly activity (last 7 days)
    activity = updateWeeklyActivity(activity, today);
    longest = Math.max(longest, newStreak);

    const row = {
      user_id: userId,
      current_streak: newStreak,
      longest_streak: longest,
      last_activity_date: today,
      weekly_activity: activity,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("user_streaks").upsert(row, { onConflict:"user_id" });

    setStreak(newStreak);
    setLongestStreak(longest);
    setWeeklyActivity(buildWeeklyActivity(activity));
  }, [userId]);

  return { streak, longestStreak, weeklyActivity, loaded, updateStreak };
}

function updateWeeklyActivity(existing, today) {
  const arr = Array.isArray(existing) ? [...existing] : [];

  // Add today if not already there
  if (!arr.includes(today)) {
    arr.push(today);
  }

  // Keep only last 7 unique dates
  return arr.slice(-7);
}

function buildWeeklyActivity(dates) {
  const days = [false, false, false, false, false, false, false];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const str = d.toISOString().split("T")[0];
    days[i] = dates.includes(str);
  }

  return days;
}
