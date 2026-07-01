"use client";
import { useState } from "react";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";

export default function HomeNav() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior:"smooth" });
    }
  };

  const links = [
    { label:"Home",           id:"hero" },
    { label:"About",          id:"about" },
    { label:"Support Center", id:"support" },
    { label:"Reviews",        id:"reviews" },
    { label:"FAQ",            id:"faq" },
  ];

  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(10,8,30,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ textDecoration:"none" }}>
          <span style={{ fontSize:20, fontWeight:900, color:"#fff", fontStyle:"italic" }}>✦ 1Course</span>
        </Link>

        {isMobile ? (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer", padding:4 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            {links.map(item => (
              <span key={item.label} onClick={() => scrollTo(item.id)}
                style={{ color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500, cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
                {item.label}
              </span>
            ))}
          </div>
        )}

        {!isMobile && (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Link href="/login" style={{ padding:"8px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, textDecoration:"none" }}>Log in</Link>
            <Link href="/quiz" style={{ padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none" }}>Start now</Link>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ position:"fixed", top:60, left:0, right:0, zIndex:99, background:"rgba(10,8,30,0.98)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"16px 20px", display:"flex", flexDirection:"column", gap:4 }}>
          {links.map(item => (
            <span key={item.label} onClick={() => scrollTo(item.id)}
              style={{ color:"rgba(255,255,255,0.7)", fontSize:15, fontWeight:600, cursor:"pointer", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              {item.label}
            </span>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:12 }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"#fff", fontSize:13, fontWeight:600, textDecoration:"none", textAlign:"center" }}>Log in</Link>
            <Link href="/quiz" onClick={() => setMenuOpen(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, textDecoration:"none", textAlign:"center" }}>Start now</Link>
          </div>
        </div>
      )}
    </>
  );
}
