"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const TYPE_STYLES = {
  streak:      { emoji:"🔥", color:"#f97316", bg:"#FFF7ED", border:"#FED7AA" },
  lesson:      { emoji:"📚", color:"#6366f1", bg:"#EEF2FF", border:"#C7D2FE" },
  certificate: { emoji:"🏆", color:"#d97706", bg:"#FFFBEB", border:"#FDE68A" },
  challenge:   { emoji:"⚡", color:"#0891b2", bg:"#ECFEFF", border:"#A5F3FC" },
  welcome:     { emoji:"👋", color:"#10b981", bg:"#ECFDF5", border:"#A7F3D0" },
  system:      { emoji:"✦",  color:"#7c3aed", bg:"#F5F3FF", border:"#DDD6FE" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) await markRead(n.id);
    if (n.action_url) { router.push(n.action_url); setOpen(false); }
  };

  const style = (type) => TYPE_STYLES[type] || TYPE_STYLES.system;

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{ position:"relative", width:38, height:38, borderRadius:11, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.background="#F5F3FF"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.background="#fff"; }}
      >
        <Bell size={17} color={open?"#7c3aed":"#64748B"}/>
        {unread > 0 && (
          <div style={{ position:"absolute", top:-4, right:-4, minWidth:18, height:18, borderRadius:999, background:"linear-gradient(135deg,#f97316,#ef4444)", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff", padding:"0 4px" }}>
            <span style={{ color:"#fff", fontSize:10, fontWeight:800 }}>{unread > 9 ? "9+" : unread}</span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:360, background:"#fff", borderRadius:20, border:"1px solid #E2E8F0", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", zIndex:200, overflow:"hidden" }}>

          {/* Header */}
          <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>Notifications</h3>
              {unread > 0 && <p style={{ fontSize:11, color:"#7c3aed", fontWeight:600, margin:"2px 0 0" }}>{unread} unread</p>}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all read" style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, fontWeight:600, color:"#64748B", cursor:"pointer" }}>
                  <CheckCheck size={13}/> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ width:28, height:28, borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={14} color="#94A3B8"/>
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight:420, overflow:"auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding:"48px 20px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
                <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>All caught up!</p>
                <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Notifications will appear here</p>
              </div>
            ) : (
              notifications.map(n => {
                const s = style(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{ padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start", cursor:n.action_url?"pointer":"default", background:n.read?"#fff":"#FAFBFF", borderBottom:"1px solid #F8FAFC", transition:"background 0.1s" }}
                    onMouseEnter={e => { if (n.action_url) e.currentTarget.style.background="#F8FAFC"; }}
                    onMouseLeave={e => { e.currentTarget.style.background=n.read?"#fff":"#FAFBFF"; }}
                  >
                    {/* Icon */}
                    <div style={{ width:40, height:40, borderRadius:12, background:s.bg, border:`1.5px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                      {n.emoji || s.emoji}
                    </div>

                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                        <p style={{ fontSize:13, fontWeight:n.read?600:700, color:"#0f172a", margin:0, lineHeight:1.4 }}>{n.title}</p>
                        <span style={{ fontSize:10, color:"#94A3B8", whiteSpace:"nowrap", flexShrink:0, marginTop:2 }}>{timeAgo(n.created_at)}</span>
                      </div>
                      <p style={{ fontSize:12, color:"#64748B", margin:"3px 0 0", lineHeight:1.4 }}>{n.message}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{ width:8, height:8, borderRadius:"50%", background:`linear-gradient(135deg,${s.color},${s.color}CC)`, flexShrink:0, marginTop:4 }}/>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding:"10px 18px", borderTop:"1px solid #F1F5F9", textAlign:"center" }}>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>Last 30 notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
