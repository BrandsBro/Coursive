"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useProgress() {
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load all progress once user is known
  useEffect(() => {
    if (!authChecked) return;
    if (!userId) { setProgress({}); setLoaded(true); return; }
    loadAll();
  }, [userId, authChecked]);

  const loadAll = async () => {
    const [{ data: lessons }, { data: certs }, { data: chalDays }, { data: chalJoins }] = await Promise.all([
      supabase.from("lesson_progress").select("course_id,lesson_id").eq("user_id", userId),
      supabase.from("certificates").select("course_id").eq("user_id", userId),
      supabase.from("challenge_progress").select("challenge_id,day_number").eq("user_id", userId),
      supabase.from("challenge_joins").select("challenge_id").eq("user_id", userId),
    ]);

    const p = {};

    // Build course progress
    (lessons || []).forEach(({ course_id, lesson_id }) => {
      if (!p[course_id]) p[course_id] = { completedLessons: [], certificateEarned: false };
      p[course_id].completedLessons.push(lesson_id);
    });
    (certs || []).forEach(({ course_id }) => {
      if (!p[course_id]) p[course_id] = { completedLessons: [], certificateEarned: false };
      p[course_id].certificateEarned = true;
    });

    // Build challenge progress
    (chalJoins || []).forEach(({ challenge_id }) => {
      const key = `challenge_${challenge_id}`;
      if (!p[key]) p[key] = { completedDays: [], joined: false };
      p[key].joined = true;
    });
    (chalDays || []).forEach(({ challenge_id, day_number }) => {
      const key = `challenge_${challenge_id}`;
      if (!p[key]) p[key] = { completedDays: [], joined: true };
      if (!p[key].completedDays.includes(day_number)) p[key].completedDays.push(day_number);
    });

    setProgress(p);
    setLoaded(true);
  };

  /* ── Course ── */
  const markLessonComplete = useCallback(async (courseId, lessonId) => {
    if (!userId) return;
    await supabase.from("lesson_progress").upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId }, { onConflict: "user_id,course_id,lesson_id" });
    setProgress(prev => {
      const course = prev[courseId] || { completedLessons: [], certificateEarned: false };
      if (course.completedLessons.includes(lessonId)) return prev;
      return { ...prev, [courseId]: { ...course, completedLessons: [...course.completedLessons, lessonId] } };
    });
  }, [userId]);

  const markCertificateEarned = useCallback(async (courseId) => {
    if (!userId) return;
    await supabase.from("certificates").upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id" });
    setProgress(prev => ({ ...prev, [courseId]: { ...prev[courseId], certificateEarned: true, earnedAt: new Date().toISOString() } }));
  }, [userId]);

  const getCompletedLessons = useCallback((courseId) => progress[courseId]?.completedLessons || [], [progress]);
  const getCoursePercent = useCallback((courseId, total) => {
    if (!total) return 0;
    return Math.round(((progress[courseId]?.completedLessons?.length || 0) / total) * 100);
  }, [progress]);
  const isCourseComplete = useCallback((courseId, total) => (progress[courseId]?.completedLessons?.length || 0) >= total, [progress]);
  const hasCertificate = useCallback((courseId) => progress[courseId]?.certificateEarned || false, [progress]);

  const resetCourse = useCallback(async (courseId) => {
    if (!userId) return;
    await Promise.all([
      supabase.from("lesson_progress").delete().eq("user_id", userId).eq("course_id", courseId),
      supabase.from("certificates").delete().eq("user_id", userId).eq("course_id", courseId),
    ]);
    setProgress(prev => ({ ...prev, [courseId]: { completedLessons: [], certificateEarned: false } }));
  }, [userId]);

  /* ── Challenges ── */
  const joinChallenge = useCallback(async (challengeId) => {
    if (!userId) return;
    await supabase.from("challenge_joins").upsert({ user_id: userId, challenge_id: challengeId }, { onConflict: "user_id,challenge_id" });
    const key = `challenge_${challengeId}`;
    setProgress(prev => ({ ...prev, [key]: { ...(prev[key] || { completedDays: [] }), joined: true } }));
  }, [userId]);

  const markChallengeDay = useCallback(async (challengeId, day) => {
    if (!userId) return;
    await supabase.from("challenge_progress").upsert({ user_id: userId, challenge_id: challengeId, day_number: day }, { onConflict: "user_id,challenge_id,day_number" });
    await updateStreak();
    const key = `challenge_${challengeId}`;
    setProgress(prev => {
      const existing = prev[key] || { completedDays: [], joined: true };
      if (existing.completedDays.includes(day)) return prev;
      return { ...prev, [key]: { ...existing, completedDays: [...existing.completedDays, day] } };
    });
  }, [userId]);

  const hasJoinedChallenge = useCallback((challengeId) => progress[`challenge_${challengeId}`]?.joined || false, [progress]);
  const getChallengeCompletedDays = useCallback((challengeId) => progress[`challenge_${challengeId}`]?.completedDays || [], [progress]);
  const getChallengeDayPercent = useCallback((challengeId, totalDays) => {
    if (!totalDays) return 0;
    return Math.round(((progress[`challenge_${challengeId}`]?.completedDays?.length || 0) / totalDays) * 100);
  }, [progress]);

  const resetChallenge = useCallback(async (challengeId) => {
    if (!userId) return;
    await supabase.from("challenge_progress").delete().eq("user_id", userId).eq("challenge_id", challengeId);
    const key = `challenge_${challengeId}`;
    setProgress(prev => ({ ...prev, [key]: { completedDays: [], joined: true } }));
  }, [userId]);

  return {
    loaded, userId,
    markLessonComplete, markCertificateEarned, getCompletedLessons,
    getCoursePercent, isCourseComplete, hasCertificate, resetCourse,
    joinChallenge, markChallengeDay, hasJoinedChallenge,
    getChallengeCompletedDays, getChallengeDayPercent, resetChallenge,
  };
}
