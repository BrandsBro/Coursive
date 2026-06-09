"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Trophy, Flame, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const icons = { Home, Courses: BookOpen, Challenges: Trophy };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : user?.email?.slice(0,2).toUpperCase() || "?";

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split("@")[0]
    || "Learner";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
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
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-2xl font-bold text-primary italic">✦ Coursiv</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = icons[link.label];
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "bg-primary-light text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              )}>
                {Icon && <Icon size={15} />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-semibold">
            <Flame size={15} />
            <span>1</span>
          </div>

          {/* User avatar + dropdown */}
          <div ref={menuRef} style={{ position:"relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 10px 6px 6px",borderRadius:14,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",transition:"all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#5B4EFF"}
              onMouseLeave={e => { if (!showMenu) e.currentTarget.style.borderColor="#E5E7EB"; }}
            >
              {/* Avatar circle */}
              <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0 }}>
                {initials}
              </div>
              <span style={{ fontSize:13,fontWeight:600,color:"#374151",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {displayName}
              </span>
              <ChevronDown size={13} color="#9CA3AF" style={{ transition:"transform 0.2s",transform:showMenu?"rotate(180deg)":"rotate(0deg)" }} />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div style={{ position:"absolute",right:0,top:"calc(100% + 8px)",width:200,background:"#fff",borderRadius:16,border:"1px solid #E5E7EB",boxShadow:"0 8px 28px rgba(0,0,0,0.12)",overflow:"hidden",zIndex:100 }}>
                {/* User info header */}
                <div style={{ padding:"14px 16px 10px",borderBottom:"1px solid #F3F4F6" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:700,color:"#111827",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{displayName}</p>
                      <p style={{ fontSize:11,color:"#9CA3AF",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div style={{ padding:"6px" }}>
                  <DropdownItem icon={<User size={14} />} label="Profile" onClick={() => { router.push("/profile"); setShowMenu(false); }} />
                  <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={() => setShowMenu(false)} />
                  <div style={{ height:1,background:"#F3F4F6",margin:"4px 0" }} />
                  <DropdownItem icon={<LogOut size={14} />} label="Sign out" onClick={handleSignOut} danger />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:10,border:"none",background:hovered?(danger?"#FEF2F2":"#F9FAFB"):"transparent",cursor:"pointer",textAlign:"left",color:danger?"#EF4444":"#374151",fontSize:13,fontWeight:500,transition:"all 0.1s" }}
    >
      <span style={{ color:danger?"#EF4444":"#9CA3AF" }}>{icon}</span>
      {label}
    </button>
  );
}
