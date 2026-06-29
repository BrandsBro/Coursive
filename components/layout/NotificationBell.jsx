"use client";
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .or(`target.eq.all,target_user_ids.cs.{${user.id}}`)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

      // Also get active/expired based subscriptions
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, plan")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const filtered = (data || []).filter(n => {
        if (n.target === "all") return true;
        if (n.target === "specific") return n.target_user_ids?.includes(user.id);
        if (n.target === "active") return sub?.status === "active";
        if (n.target === "expired") return sub?.status === "expired";
        if (n.target === "plan") return sub?.plan === n.target_plan;
        return false;
      });

      setNotifications(filtered);
    };
    load();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const unread = notifications.filter(n => !n.is_read_by?.includes(userId)).length;

  const markRead = async (n) => {
    if (n.is_read_by?.includes(userId)) return;
    const newReadBy = [...(n.is_read_by || []), userId];
    await supabase.from("notifications").update({ is_read_by: newReadBy }).eq("id", n.id);
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read_by: newReadBy } : x));
  };

  const markAllRead = async () => {
    for (const n of notifications) await markRead(n);
  };

  const TYPE_STYLES = {
    info:         { color:"#6366f1", bg:"#EEF2FF" },
    success:      { color:"#22c55e", bg:"#F0FDF4" },
    warning:      { color:"#f59e0b", bg:"#FFFBEB" },
    error:        { color:"#ef4444", bg:"#FEF2F2" },
    announcement: { color:"#8b5cf6", bg:"#F5F3FF" },
    promotion:    { color:"#ec4899", bg:"#FDF2F8" },
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ position:"relative", width:40, height:40, borderRadius:"50%", border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Bell size={18} color="#374151"/>
        {unread > 0 && (
          <div style={{ position:"absolute", top:-2, right:-2, width:18, height:18, borderRadius:"50%", background:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontWeight:800, color:"#fff" }}>{unread > 9 ? "9+" : unread}</span>
          </div>
        )}
      </button>

      {open && (
        <div style={{ position:"absolute", top:48, right:0, width:380, background:"#fff", borderRadius:20, boxShadow:"0 16px 48px rgba(0,0,0,0.15)", border:"1.5px solid #F1F5F9", zIndex:100, overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Notifications</h3>
              {unread > 0 && <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{unread} unread</p>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize:12, fontWeight:600, color:"#6366f1", border:"none", background:"none", cursor:"pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:420, overflow:"auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding:"32px 20px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🔔</div>
                <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => {
              const ts = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              const isRead = n.is_read_by?.includes(userId);
              return (
                <div key={n.id} onClick={() => markRead(n)}
                  style={{ padding:"14px 18px", borderBottom:"1px solid #F8FAFC", cursor:"pointer", background:isRead?"#fff":"#FAFBFF", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background=isRead?"#fff":"#FAFBFF"}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:ts.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {n.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                        <p style={{ fontSize:13, fontWeight:isRead?600:800, color:"#0f172a", margin:0 }}>{n.title}</p>
                        {!isRead && <div style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", flexShrink:0 }}/>}
                      </div>
                      <p style={{ fontSize:12, color:"#64748B", margin:"0 0 6px", lineHeight:1.5 }}>{n.message}</p>
                      {n.link && (
                        <a href={n.link} onClick={e=>e.stopPropagation()}
                          style={{ fontSize:12, fontWeight:700, color:ts.color, textDecoration:"none" }}>
                          {n.link_text || "Learn more"} →
                        </a>
                      )}
                      <p style={{ fontSize:10, color:"#CBD5E1", margin:"6px 0 0" }}>
                        {new Date(n.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
