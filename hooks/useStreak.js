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
    loadStreak(userId);
  }, [userId]);

  const loadStreak = async (uid) => {
    try {
      // Use maybeSingle() instead of single() — returns null if no row exists
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        console.error("Streak load error:", error);
        setLoaded(true);
        return;
      }

      if (!data) {
        // No streak record yet — first time user
        setStreak(0);
        setLongestStreak(0);
        setWeeklyActivity([false,false,false,false,false,false,false]);
        setLoaded(true);
        return;
      }

      // Check if streak should reset
      const today = new Date().toISOString().split("T")[0];
      const lastActivity = data.last_activity_date;

      if (lastActivity) {
        const last = new Date(lastActivity);
        const now = new Date(today);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          // Missed a day — reset streak
          await supabase
            .from("user_streaks")
            .update({ current_streak: 0 })
            .eq("user_id", uid);
          setStreak(0);
        } else {
          setStreak(data.current_streak || 0);
        }
      } else {
        setStreak(data.current_streak || 0);
      }

      setLongestStreak(data.longest_streak || 0);
      const activity = Array.isArray(data.weekly_activity) ? data.weekly_activity : [];
      setWeeklyActivity(buildWeeklyActivity(activity));

    } catch (e) {
      console.error("Streak error:", e);
    } finally {
      setLoaded(true);
    }
  };

  const updateStreak = useCallback(async () => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const { data: existing } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      let newStreak = 1;
      let longest = 1;
      let activity = [];

      if (existing) {
        const lastDate = existing.last_activity_date;
        longest = existing.longest_streak || 0;
        activity = Array.isArray(existing.weekly_activity) ? existing.weekly_activity : [];

        // Already active today
        if (lastDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDate === yesterdayStr) {
          newStreak = (existing.current_streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      // Add today to activity
      if (!activity.includes(today)) activity.push(today);
      activity = activity.slice(-7);
      longest = Math.max(longest, newStreak);

      await supabase.from("user_streaks").upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longest,
        last_activity_date: today,
        weekly_activity: activity,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      setStreak(newStreak);
      setLongestStreak(longest);
      setWeeklyActivity(buildWeeklyActivity(activity));

    } catch (e) {
      console.error("updateStreak error:", e);
    }
  }, [userId]);

  return { streak, longestStreak, weeklyActivity, loaded, updateStreak };
}

function buildWeeklyActivity(dates) {
  // Map to Mon(0)...Sun(6) of the CURRENT week
  const days = [false, false, false, false, false, false, false];
  if (!Array.isArray(dates)) return days;

  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // How many days back to get to Monday
  const toMonday = dow === 0 ? -6 : 1 - dow;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + toMonday + i);
    const str = d.toISOString().split("T")[0];
    days[i] = dates.includes(str);
  }
  return days;
}
