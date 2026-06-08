"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "coursiv_progress";

export function useProgress() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const persist = (data) => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  };

  const markLessonComplete = useCallback((courseId, lessonId) => {
    setProgress(prev => {
      const course = prev[courseId] || { completedLessons: [] };
      if (course.completedLessons.includes(lessonId)) return prev;
      const next = { ...prev, [courseId]: { ...course, completedLessons: [...course.completedLessons, lessonId] } };
      persist(next); return next;
    });
  }, []);

  const markCertificateEarned = useCallback((courseId) => {
    setProgress(prev => {
      const next = { ...prev, [courseId]: { ...prev[courseId], certificateEarned: true, earnedAt: new Date().toISOString() } };
      persist(next); return next;
    });
  }, []);

  const getCompletedLessons = useCallback((courseId) => {
    return progress[courseId]?.completedLessons || [];
  }, [progress]);

  const getCoursePercent = useCallback((courseId, total) => {
    if (!total) return 0;
    return Math.round(((progress[courseId]?.completedLessons?.length || 0) / total) * 100);
  }, [progress]);

  const isCourseComplete = useCallback((courseId, total) => {
    return (progress[courseId]?.completedLessons?.length || 0) >= total;
  }, [progress]);

  const hasCertificate = useCallback((courseId) => {
    return progress[courseId]?.certificateEarned || false;
  }, [progress]);

  /* ── Reset course ── */
  const resetCourse = useCallback((courseId) => {
    setProgress(prev => {
      const next = { ...prev, [courseId]: { completedLessons: [], certificateEarned: false } };
      persist(next); return next;
    });
  }, []);

  /* ── Challenge progress ── */
  const markChallengeDay = useCallback((challengeId, day) => {
    setProgress(prev => {
      const key = `challenge_${challengeId}`;
      const existing = prev[key] || { completedDays: [], joined: true };
      if (existing.completedDays.includes(day)) return prev;
      const next = { ...prev, [key]: { ...existing, completedDays: [...existing.completedDays, day] } };
      persist(next); return next;
    });
  }, []);

  const joinChallenge = useCallback((challengeId) => {
    setProgress(prev => {
      const key = `challenge_${challengeId}`;
      const next = { ...prev, [key]: { ...(prev[key] || { completedDays: [] }), joined: true } };
      persist(next); return next;
    });
  }, []);

  const hasJoinedChallenge = useCallback((challengeId) => {
    return progress[`challenge_${challengeId}`]?.joined || false;
  }, [progress]);

  const getChallengeCompletedDays = useCallback((challengeId) => {
    return progress[`challenge_${challengeId}`]?.completedDays || [];
  }, [progress]);

  const getChallengeDayPercent = useCallback((challengeId, totalDays) => {
    if (!totalDays) return 0;
    const done = progress[`challenge_${challengeId}`]?.completedDays?.length || 0;
    return Math.round((done / totalDays) * 100);
  }, [progress]);

  /* ── Reset challenge ── */
  const resetChallenge = useCallback((challengeId) => {
    setProgress(prev => {
      const key = `challenge_${challengeId}`;
      // Keep joined:true so they stay in tracker, just clear days
      const next = { ...prev, [key]: { completedDays: [], joined: true } };
      persist(next); return next;
    });
  }, []);

  return {
    markLessonComplete, markCertificateEarned, getCompletedLessons,
    getCoursePercent, isCourseComplete, hasCertificate, resetCourse,
    markChallengeDay, joinChallenge, hasJoinedChallenge,
    getChallengeCompletedDays, getChallengeDayPercent, resetChallenge,
  };
}
