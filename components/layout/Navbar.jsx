"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Trophy, Flame, ChevronDown, LogOut, User, Settings, Shield, Search, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import SearchModal from "@/components/layout/SearchModal";
import NotificationBell from "@/components/layout/NotificationBell";
import { useStreak } from "@/hooks/useStreak";

const NAV_LINKS = [
  { label:"Home",       href:"/home",           icon:Home     },
  { label:"Courses",    href:"/courses",     icon:BookOpen },
  { label:"Challenges", href:"/challenges",  icon:Trophy   },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); setShowSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // Close mobile nav on route change
  useEffect(() => { setShowMobileNav(false); setShowMenu(false); }, [pathname]);

  return (
    <>
      <nav style={{ position:"sticky", top:0, zIndex:50, width:"100%", background:"#fff", borderBottom:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1152, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>

          {/* Logo */}
          <Link href="/home" style={{ textDecoration:"none", flexShrink:0 }}>
            <img src="https://i.postimg.cc/7Pd7vVJs/1course-Logo-Black-Version.png" alt="1Course" style={{ height:26, objectFit:"contain" }}/>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }} className="hidden-mobile">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:12, fontSize:13, fontWeight:600, background:isActive?"#EEF2FF":"transparent", color:isActive?"#6366f1":"#64748B", transition:"all 0.15s" }}>
                  <Icon size={15}/>{label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>

            {/* Search - desktop only */}
            <button onClick={() => setShowSearch(true)} className="hidden-mobile" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, cursor:"pointer" }}>
              <Search size={14}/> <span>Search</span>
              <kbd style={{ padding:"1px 5px", borderRadius:5, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:10, fontWeight:700 }}>⌘K</kbd>
            </button>

            {/* Admin badge - desktop only */}
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration:"none" }} className="hidden-mobile">
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 2px 8px rgba(99,102,241,0.35)", cursor:"pointer" }}>
                  <Shield size={12} color="#fff"/>
                  <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>Admin</span>
                </div>
              </Link>
            )}

            {/* Streak */}
            <div style={{ display:"flex", alignItems:"center", gap:5, background:"#FFF7ED", borderRadius:10, padding:"6px 10px", flexShrink:0 }}>
              <Flame size={14} fill="#f97316" color="#f97316"/>
              <span style={{ fontSize:13, fontWeight:700, color:"#f97316" }}>{streak}</span>
            </div>

            {/* Notifications */}
            <NotificationBell/>

            {/* User avatar button */}
            <div ref={menuRef} style={{ position:"relative" }}>
              <button onClick={() => setShowMenu(!showMenu)} style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", border:"2px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,0.12)", cursor:"pointer", flexShrink:0 }}>
                {initials}
              </button>

              {showMenu && (
                <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:200, background:"#fff", borderRadius:16, border:"1px solid #E5E7EB", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", overflow:"hidden", zIndex:100 }}>
                  <div style={{ padding:"12px 14px", borderBottom:"1px solid #F3F4F6" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#111827", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
                    <p style={{ fontSize:11, color:"#9CA3AF", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                  </div>
                  <div style={{ padding:"6px" }}>
                    <DropItem icon={<User size={14}/>} label="Profile" onClick={() => router.push("/profile")}/>
                    {isAdmin && <DropItem icon={<Shield size={14}/>} label="Admin Panel" onClick={() => router.push("/admin")} accent/>}
                    <DropItem icon={<Search size={14}/>} label="Search" onClick={() => setShowSearch(true)}/>
                    <div style={{ height:1, background:"#F3F4F6", margin:"4px 0" }}/>
                    <DropItem icon={<LogOut size={14}/>} label="Sign out" onClick={handleSignOut} danger/>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setShowMobileNav(!showMobileNav)} className="show-mobile" style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {showMobileNav ? <X size={18} color="#374151"/> : <Menu size={18} color="#374151"/>}
            </button>
          </div>
        </div>

        {/* Mobile nav menu */}
        {showMobileNav && (
          <div style={{ background:"#fff", borderTop:"1px solid #F1F5F9", padding:"12px 16px 16px" }}>
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:4, background:pathname===href?"#EEF2FF":"transparent", color:pathname===href?"#6366f1":"#374151", fontSize:14, fontWeight:600 }}>
                <Icon size={17}/> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:4, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", fontSize:14, fontWeight:700 }}>
                <Shield size={17}/> Admin Panel
              </Link>
            )}
            <button onClick={() => { setShowMobileNav(false); setShowSearch(true); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:14, fontWeight:600, cursor:"pointer", marginTop:4 }}>
              <Search size={17}/> Search
            </button>
          </div>
        )}
      </nav>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)}/>}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function DropItem({ icon, label, onClick, danger, accent }) {
  const [hovered, setHovered] = useState(false);
  const color = danger?"#EF4444":accent?"#6366f1":"#374151";
  const hoverBg = danger?"#FEF2F2":accent?"#EEF2FF":"#F9FAFB";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:9, border:"none", background:hovered?hoverBg:"transparent", cursor:"pointer", color, fontSize:13, fontWeight:500, transition:"all 0.1s" }}>
      <span style={{ color:danger?"#EF4444":accent?"#6366f1":"#9CA3AF" }}>{icon}</span>
      {label}
    </button>
  );
}
