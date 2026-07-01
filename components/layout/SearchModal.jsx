"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Trophy, Loader, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SearchModal({ onClose }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ courses:[], lessons:[], challenges:[] });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
    const saved = JSON.parse(localStorage.getItem("1course_search_recent") || "[]");
    setRecent(saved);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults({ courses:[], lessons:[], challenges:[] }); return; }
    const t = setTimeout(() => doSearch(q.trim()), 280);
    return () => clearTimeout(t);
  }, [q]);

  const doSearch = async (query) => {
    setLoading(true);
    const [{ data: courses }, { data: lessons }, { data: challenges }] = await Promise.all([
      supabase.from("courses").select("id,title,emoji,gradient_from,gradient_to,category,level").ilike("title", `%${query}%`).limit(4),
      supabase.from("lessons").select("id,title,type,duration,course_id").ilike("title", `%${query}%`).limit(5),
      supabase.from("challenges").select("id,title,subtitle,emoji,gradient_bg,days").ilike("title", `%${query}%`).limit(3),
    ]);
    setResults({ courses: courses||[], lessons: lessons||[], challenges: challenges||[] });
    setLoading(false);
  };

  const saveRecent = (item) => {
    const saved = JSON.parse(localStorage.getItem("1course_search_recent") || "[]");
    const next = [item, ...saved.filter(r => r.url !== item.url)].slice(0, 5);
    localStorage.setItem("1course_search_recent", JSON.stringify(next));
  };

  const navigate = (url, label) => {
    saveRecent({ label, url });
    router.push(url);
    onClose();
  };

  const total = results.courses.length + results.lessons.length + results.challenges.length;
  const hasResults = total > 0;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.7)", zIndex:300, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:80, padding:"80px 20px 20px", backdropFilter:"blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:620, background:"#fff", borderRadius:24, overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>

        {/* Search input */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:"1px solid #F1F5F9" }}>
          {loading ? <Loader size={18} color="#7c3aed" className="bspin"/> : <Search size={18} color="#94A3B8"/>}
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search courses, lessons, challenges..."
            style={{ flex:1, fontSize:16, border:"none", outline:"none", color:"#0f172a", background:"transparent" }}
            onKeyDown={e => e.key === "Escape" && onClose()}
          />
          {q && <button onClick={() => setQ("")} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}><X size={16} color="#94A3B8"/></button>}
          <kbd style={{ padding:"3px 8px", borderRadius:6, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:11, fontWeight:600 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight:480, overflow:"auto" }}>

          {/* No query — show recent */}
          {!q && recent.length > 0 && (
            <div style={{ padding:"14px 20px 8px" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, margin:"0 0 8px" }}>RECENT</p>
              {recent.map((r, i) => (
                <button key={i} onClick={() => navigate(r.url, r.label)} style={rowSt()}>
                  <Clock size={14} color="#94A3B8"/>
                  <span style={{ fontSize:14, color:"#374151" }}>{r.label}</span>
                  <ArrowRight size={13} color="#CBD5E1" style={{ marginLeft:"auto" }}/>
                </button>
              ))}
            </div>
          )}

          {/* No query empty */}
          {!q && recent.length === 0 && (
            <div style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>Search 1Course</p>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Find courses, lessons and challenges</p>
            </div>
          )}

          {/* Query but no results */}
          {q && !loading && !hasResults && (
            <div style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>😕</div>
              <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>No results for "{q}"</p>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Try a different search term</p>
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <Section label="COURSES">
              {results.courses.map(c => (
                <button key={c.id} onClick={() => navigate(`/courses/${c.id}`, c.title)} style={rowSt()}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${c.gradient_from},${c.gradient_to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.emoji}</div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{highlight(c.title, q)}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{c.category} · {c.level}</p>
                  </div>
                  <ArrowRight size={13} color="#CBD5E1" style={{ marginLeft:"auto", flexShrink:0 }}/>
                </button>
              ))}
            </Section>
          )}

          {/* Lessons */}
          {results.lessons.length > 0 && (
            <Section label="LESSONS">
              {results.lessons.map(l => (
                <button key={l.id} onClick={() => navigate(`/courses/${l.course_id}/lessons/${l.id}?mode=read`, l.title)} style={rowSt()}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <BookOpen size={16} color="#6366f1"/>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{highlight(l.title, q)}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{l.type} · {l.duration} min</p>
                  </div>
                  <ArrowRight size={13} color="#CBD5E1" style={{ marginLeft:"auto", flexShrink:0 }}/>
                </button>
              ))}
            </Section>
          )}

          {/* Challenges */}
          {results.challenges.length > 0 && (
            <Section label="CHALLENGES">
              {results.challenges.map(c => (
                <button key={c.id} onClick={() => navigate(`/challenges/${c.id}`, c.title)} style={rowSt()}>
                  <div style={{ width:36, height:36, borderRadius:10, background:c.gradient_bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.emoji}</div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{highlight(c.title, q)}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{c.days} days · {c.subtitle}</p>
                  </div>
                  <ArrowRight size={13} color="#CBD5E1" style={{ marginLeft:"auto", flexShrink:0 }}/>
                </button>
              ))}
            </Section>
          )}

          {hasResults && (
            <div style={{ padding:"10px 20px 14px", textAlign:"center" }}>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{total} result{total!==1?"s":""} for "{q}"</p>
            </div>
          )}
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding:"14px 20px 6px" }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, margin:"0 0 8px" }}>{label}</p>
      {children}
    </div>
  );
}

function highlight(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background:"#FEF08A", color:"#0f172a", borderRadius:3, padding:"0 1px" }}>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const rowSt = () => ({ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"9px 10px", borderRadius:12, border:"none", background:"none", cursor:"pointer", textAlign:"left", transition:"background 0.1s", marginBottom:2 });
