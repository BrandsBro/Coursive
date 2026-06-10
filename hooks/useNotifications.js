"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useNotifications() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

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
    if (!userId) return;
    load();

    // Real-time updates
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnread(prev => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const load = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications(data || []);
    setUnread((data || []).filter(n => !n.read).length);
  };

  const markRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const send = useCallback(async (type, title, message, emoji, actionUrl) => {
    if (!userId) return;
    await supabase.from("notifications").insert({
      user_id: userId, type, title, message, emoji: emoji || "🔔", action_url: actionUrl || null,
    });
  }, [userId]);

  return { notifications, unread, markRead, markAllRead, send };
}
