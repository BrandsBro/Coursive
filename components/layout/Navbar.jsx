"use client";
import SearchModal from "@/components/layout/SearchModal";
import NotificationBell from "@/components/layout/NotificationBell";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Trophy, Flame, ChevronDown, LogOut, User, Settings, Shield, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { label:"Home",       href:"/",           icon:Home     },
  { label:"Courses",    href:"/courses",     icon:BookOpen },
  { label:"Challenges", href:"/challenges",  icon:Trophy   },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { streak } = useStreak();
  const menuRef = useRef(null);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : user?.email?.slice(0,2).toUpperCase() || "?";

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split("@")[0]
    || "Learner";

  // Search shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Check admin status
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-2xl font-black text-primary italic">✦ Coursiv</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "bg-primary-light text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              )}>
                <Icon size={15}/>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Admin badge */}
          {isAdmin && (
            <Link href="/admin" style={{ textDecoration:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 2px 8px rgba(99,102,241,0.35)", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 14px rgba(99,102,241,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow="0 2px 8px rgba(99,102,241,0.35)"}>
                <Shield size={13} color="#fff"/>
                <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>Admin</span>
              </div>
            </Link>
          )}

          {/* Search */}
          <button onClick={() => setShowSearch(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:11, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:13, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.color="#7c3aed"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.color="#94A3B8"; }}>
            <Search size={14}/>
            <span style={{ fontSize:12 }}>Search</span>
            <kbd style={{ padding:"1px 5px", borderRadius:5, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:10, fontWeight:700 }}>⌘K</kbd>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-semibold">
            <Flame size={15} fill="#f97316"/>
            <span>{streak}</span>
          </div>

          {/* User dropdown */}
          <div ref={menuRef} style={{ position:"relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px 6px 6px", borderRadius:14, border:"1.5px solid #E5E7EB", background:"#fff", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#5B4EFF"}
              onMouseLeave={e => { if (!showMenu) e.currentTarget.style.borderColor="#E5E7EB"; }}
            >
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>
                {initials}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:"#374151", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {displayName}
              </span>
              <ChevronDown size={13} color="#9CA3AF" style={{ transition:"transform 0.2s", transform:showMenu?"rotate(180deg)":"rotate(0)" }}/>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:210, background:"#fff", borderRadius:18, border:"1px solid #E5E7EB", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", overflow:"hidden", zIndex:100 }}>

                {/* User info */}
                <div style={{ padding:"14px 16px", borderBottom:"1px solid #F3F4F6" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#111827", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
                      <p style={{ fontSize:11, color:"#9CA3AF", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding:"6px" }}>
                  <DropItem icon={<User size={14}/>} label="Profile" onClick={() => { router.push("/profile"); setShowMenu(false); }}/>
                  {isAdmin && (
                    <DropItem icon={<Shield size={14}/>} label="Admin Panel" onClick={() => { router.push("/admin"); setShowMenu(false); }} accent />
                  )}
                  <DropItem icon={<Settings size={14}/>} label="Settings" onClick={() => setShowMenu(false)}/>
                  <div style={{ height:1, background:"#F3F4F6", margin:"4px 0" }}/>
                  <DropItem icon={<LogOut size={14}/>} label="Sign out" onClick={handleSignOut} danger/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DropItem({ icon, label, onClick, danger, accent }) {
  const [hovered, setHovered] = useState(false);
  const color = danger ? "#EF4444" : accent ? "#6366f1" : "#374151";
  const hoverBg = danger ? "#FEF2F2" : accent ? "#EEF2FF" : "#F9FAFB";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, border:"none", background:hovered?hoverBg:"transparent", cursor:"pointer", color, fontSize:13, fontWeight:500, transition:"all 0.1s" }}>
      <span style={{ color: danger?"#EF4444" : accent?"#6366f1" : "#9CA3AF" }}>{icon}</span>
      {label}
    </button>
  );
}
