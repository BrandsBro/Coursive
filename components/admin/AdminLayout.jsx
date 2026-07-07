"use client";
import { useBranding } from "@/lib/useBranding";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Award, Palette, BookOpen, Trophy, Users, TrendingUp, HardDrive, Settings, ChevronRight, LogOut, MessageSquare, ClipboardList, Mail, CreditCard, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href:"/admin",            icon:LayoutDashboard, label:"Dashboard"   },
  { href:"/admin/courses",    icon:BookOpen,        label:"Courses"     },
  { href:"/admin/challenges", icon:Trophy,          label:"Challenges"  },
  { href:"/admin/quiz",       icon:ClipboardList,   label:"Quiz Flow"   },
  { href:"/admin/emails",     icon:Mail,            label:"Emails"      },
  { href:"/admin/payments",   icon:CreditCard,      label:"Payments"    },
  { href:"/admin/notifications", icon:Bell, label:"Notifications" },
  { href:"/admin/users",      icon:Users,           label:"Users"       },
  { href:"/admin/analytics",  icon:TrendingUp,      label:"Analytics"   },
  { href:"/admin/media",      icon:HardDrive,       label:"Media"       },
  { href:"/admin/certificates", icon:Award,           label:"Certificates" },
  { href:"/admin/branding",     icon:Palette,         label:"Branding"      },
  { href:"/admin/pricing",      icon:CreditCard,      label:"Pricing"       },
  { href:"/admin/reviews",    icon:MessageSquare,   label:"Reviews"     },
  { href:"/admin/settings",   icon:Settings,        label:"Settings"    },
];

export default function AdminLayout({ children }) {
  const branding = useBranding();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* Sidebar */}
      <div style={{ width:240, background:"#0f172a", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:50 }}>
        {/* Logo */}
        <div style={{ padding:"24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/home" style={{ textDecoration:"none" }}>
            <img src={branding.logoMain||"https://i.postimg.cc/HsMMTybQ/1course-Logo-White-Version.png"} alt="1Course" className="logo-main" style={{ objectFit:"contain" }}/>
          </Link>
          <div style={{ marginTop:4, background:"rgba(99,102,241,0.25)", borderRadius:6, padding:"2px 8px", display:"inline-block" }}>
            <span style={{ color:"#a5b4fc", fontSize:10, fontWeight:700, letterSpacing:1 }}>ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, marginBottom:2, background:active?"rgba(99,102,241,0.2)":"transparent", color:active?"#a5b4fc":"rgba(255,255,255,0.5)", transition:"all 0.15s" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background="transparent"; }}>
                  <Icon size={16} />
                  <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                  {active && <ChevronRight size={13} style={{ marginLeft:"auto" }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/home" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>
              <Settings size={15} />
              <span style={{ fontSize:13, fontWeight:600 }}>View Site</span>
            </div>
          </Link>
          <button onClick={handleSignOut} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color:"rgba(239,68,68,0.7)", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft:240, flex:1, padding:"32px 36px" }}>
        {children}
      </div>
    </div>
  );
}
