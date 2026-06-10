"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Check, X, Lightbulb,
  BookOpen, Headphones, Trophy, Music, Volume2
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay, firstJoin }) {
  const router = useRouter();
  const { markLessonComplete, isLessonComplete, markChallengeDay } = useProgress();
  const { updateStreak } = useStreak();

  const safeContent = Array.isArray(content) && content.length > 0
    ? content
    : [{ type:"text", text:`Welcome to "${lesson?.title}"! Content coming soon.` }];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [fillInputs, setFillInputs] = useState({});
  const [fillChecked, setFillChecked] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const allLessons = (course?.units || []).flatMap(u => u.lessons || []);
  const currentIdx = allLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];

  const isComplete = isLessonComplete(course?.id, lesson?.id);

  const handleComplete = async () => {
    await updateStreak();
    await markLessonComplete(course?.id, lesson?.id);
    if (challengeId && challengeDay) {
      await markChallengeDay(challengeId, challengeDay);
    }
    setCompleted(true);
    setShowComplete(true);
  };

  const handleNext = () => {
    if (nextLesson) {
      router.push(`/courses/${course.id}/lessons/${nextLesson.id}?mode=${mode}`);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>

      {/* ── Top bar ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href={`/courses/${course?.id}`} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600 }}>
          <ChevronLeft size={16}/> {course?.title}
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min read</span>
          {isComplete && (
            <span style={{ display:"flex", alignItems:"center", gap:4, background:"#F0FDF4", color:"#16A34A", fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:999 }}>
              <Check size={12}/> Complete
            </span>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px" }}>

        {/* Lesson title */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1 }}>
              {course?.title?.toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{lesson?.title}</h1>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min</span>
            <span style={{ fontSize:12, color:"#94A3B8" }}>·</span>
            <span style={{ fontSize:12, color:"#94A3B8", textTransform:"capitalize" }}>{lesson?.type || "lesson"}</span>
          </div>
        </div>

        {/* ── Content blocks ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {safeContent.map((block, idx) => (
            <ContentBlock
              key={block.id || idx}
              block={block}
              idx={idx}
              answers={answers}
              setAnswers={setAnswers}
              checked={checked}
              setChecked={setChecked}
              fillInputs={fillInputs}
              setFillInputs={setFillInputs}
              fillChecked={fillChecked}
              setFillChecked={setFillChecked}
            />
          ))}
        </div>

        {/* ── Bottom nav ── */}
        <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
          {prevLesson ? (
            <Link href={`/courses/${course.id}/lessons/${prevLesson.id}?mode=${mode}`} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600 }}>
              <ChevronLeft size={15}/> Previous
            </Link>
          ) : <div/>}

          {!isComplete && !completed ? (
            <button onClick={handleComplete} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)" }}>
              ✓ Mark Complete
            </button>
          ) : (
            <button onClick={handleNext} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(34,197,94,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {nextLesson ? (<>Next Lesson <ChevronRight size={15}/></>) : (<><Trophy size={15}/> Finish Course</>)}
            </button>
          )}
        </div>
      </div>

      {/* ── Completion overlay ── */}
      {showComplete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, padding:"40px 36px", textAlign:"center", maxWidth:380, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>
              🎉
            </div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Lesson Complete!</h2>
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px" }}>
              {nextLesson ? `Up next: "${nextLesson.title}"` : "You've finished this course!"}
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowComplete(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                Stay here
              </button>
              <button onClick={() => { setShowComplete(false); handleNext(); }} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {nextLesson ? "Next lesson →" : "Back to course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Individual block renderer ──
function ContentBlock({ block, idx, answers, setAnswers, checked, setChecked, fillInputs, setFillInputs, fillChecked, setFillChecked }) {
  const c = block.content || block;

  switch (block.type) {

    case "heading":
      const sz = c.level==="h1" ? 28 : c.level==="h2" ? 22 : 18;
      return <div style={{ fontSize:sz, fontWeight:900, color:"#0f172a", lineHeight:1.25, paddingTop: idx>0?8:0 }}>{c.text}</div>;

    case "text":
      return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0, whiteSpace:"pre-wrap" }}>{c.text}</p>;

    case "image":
      return c.src ? (
        <figure style={{ margin:0 }}>
          <img src={c.src} alt={c.alt||""} style={{ width:"100%", borderRadius:20, display:"block", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}/>
          {c.caption && <figcaption style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</figcaption>}
        </figure>
      ) : null;

    case "video": {
      const ytMatch = c.src?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      const ytId = ytMatch?.[1];
      const vmMatch = c.src?.match(/vimeo\.com\/(\d+)/);
      const vmId = vmMatch?.[1];
      return (
        <div>
          <div style={{ borderRadius:20, overflow:"hidden", aspectRatio:"16/9", background:"#000", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
            {ytId ? (
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} style={{ border:"none", display:"block" }} allowFullScreen/>
            ) : vmId ? (
              <iframe width="100%" height="100%" src={`https://player.vimeo.com/video/${vmId}`} style={{ border:"none", display:"block" }} allowFullScreen/>
            ) : c.src ? (
              <video src={c.src} controls style={{ width:"100%", height:"100%" }}/>
            ) : null}
          </div>
          {c.caption && <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</p>}
        </div>
      );
    }

    case "audio":
      return c.src ? (
        <div style={{ background:"linear-gradient(135deg,#ecfeff,#cffafe)", borderRadius:20, padding:"20px 22px", border:"1.5px solid #a5f3fc" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(8,145,178,0.3)" }}>
              <Music size={22} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0e7490", margin:"0 0 2px" }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:13, color:"#0891b2", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:42 }}/>
        </div>
      ) : null;

    case "quiz": {
      const sel = answers[idx];
      const isChecked = checked[idx];
      const isCorrect = sel === c.correct;
      return (
        <div style={{ background:"#FFFBEB", borderRadius:20, padding:24, border:"1.5px solid #FDE68A" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#92400E", margin:"0 0 12px", letterSpacing:0.5 }}>🎯 QUIZ</p>
          <p style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 16px", lineHeight:1.4 }}>{c.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {(c.options||[]).map((opt, i) => {
              let bg = "#fff", border = "#E2E8F0", color = "#374151";
              if (isChecked) {
                if (i === c.correct) { bg="#F0FDF4"; border="#86efac"; color="#166534"; }
                else if (i === sel) { bg="#FEF2F2"; border="#fca5a5"; color="#991B1B"; }
              } else if (sel === i) { bg="#EEF2FF"; border="#6366f1"; color="#4338CA"; }
              return (
                <button key={i} onClick={() => !isChecked && setAnswers(p=>({...p,[idx]:i}))} style={{ padding:"12px 16px", borderRadius:12, border:`1.5px solid ${border}`, background:bg, color, fontSize:14, fontWeight:500, cursor:isChecked?"default":"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, transition:"all 0.15s" }}>
                  <span style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700 }}>
                    {isChecked && i===c.correct ? "✓" : isChecked && i===sel && !isCorrect ? "✕" : String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {!isChecked && sel !== undefined && (
            <button onClick={() => setChecked(p=>({...p,[idx]:true}))} style={{ padding:"11px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Check Answer
            </button>
          )}
          {isChecked && (
            <div style={{ padding:"12px 16px", borderRadius:12, background:isCorrect?"#F0FDF4":"#FEF2F2", border:`1.5px solid ${isCorrect?"#86efac":"#fca5a5"}` }}>
              <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#991B1B", margin:"0 0 4px" }}>
                {isCorrect ? "🎉 Correct!" : "❌ Not quite"}
              </p>
              {c.explanation && <p style={{ fontSize:13, color:"#374151", margin:0 }}>{c.explanation}</p>}
            </div>
          )}
        </div>
      );
    }

    case "fillblank": {
      const val = fillInputs[idx] || "";
      const isChecked = fillChecked[idx];
      const isCorrect = val.trim().toLowerCase() === (c.answer||"").trim().toLowerCase();
      return (
        <div style={{ background:"#FDF2F8", borderRadius:20, padding:24, border:"1.5px solid #FBCFE8" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#9d174d", margin:"0 0 12px", letterSpacing:0.5 }}>✏️ FILL IN THE BLANK</p>
          <p style={{ fontSize:16, color:"#0f172a", margin:"0 0 16px", lineHeight:1.6 }}>
            {(c.prompt||"").split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length-1 && (
                  <input
                    value={val}
                    onChange={e => !isChecked && setFillInputs(p=>({...p,[idx]:e.target.value}))}
                    placeholder="type answer..."
                    style={{ display:"inline-block", width:140, borderBottom:`2px solid ${isChecked?isCorrect?"#22c55e":"#ef4444":"#db2777"}`, border:"none", borderBottom:`2px solid ${isChecked?isCorrect?"#22c55e":"#ef4444":"#db2777"}`, outline:"none", fontSize:16, fontWeight:700, color:"#db2777", textAlign:"center", background:"transparent", padding:"2px 4px" }}
                  />
                )}
              </span>
            ))}
          </p>
          {c.hint && !isChecked && <p style={{ fontSize:13, color:"#be185d", margin:"0 0 14px" }}>💡 Hint: {c.hint}</p>}
          {!isChecked && val && (
            <button onClick={() => setFillChecked(p=>({...p,[idx]:true}))} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#db2777,#9d174d)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Check
            </button>
          )}
          {isChecked && (
            <div style={{ padding:"12px 16px", borderRadius:12, background:isCorrect?"#F0FDF4":"#FEF2F2", border:`1.5px solid ${isCorrect?"#86efac":"#fca5a5"}` }}>
              <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#991B1B", margin:0 }}>
                {isCorrect ? "🎉 Correct!" : `❌ Answer: ${c.answer}`}
              </p>
            </div>
          )}
        </div>
      );
    }

    case "keypoints":
      return (
        <div style={{ background:"#F0FDFA", borderRadius:20, padding:24, border:"1.5px solid #99f6e4" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f766e", margin:"0 0 16px" }}>⭐ {c.title||"Key Takeaways"}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(c.points||[]).filter(Boolean).map((pt, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, marginTop:1 }}>{i+1}</div>
                <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "callout": {
      const map = {
        info:    ["💡","#0891b2","#ECFEFF","#a5f3fc"],
        warning: ["⚠️","#d97706","#FFFBEB","#fde68a"],
        success: ["✅","#059669","#ECFDF5","#a7f3d0"],
        error:   ["❌","#dc2626","#FEF2F2","#fecaca"],
      };
      const [emoji, color, bg, border] = map[c.style||"info"];
      return (
        <div style={{ padding:"16px 20px", borderRadius:16, background:bg, border:`1.5px solid ${border}`, display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{emoji}</span>
          <p style={{ fontSize:14, color, margin:0, lineHeight:1.65, fontWeight:500 }}>{c.text}</p>
        </div>
      );
    }

    case "divider":
      return c.style==="dots"
        ? <div style={{ textAlign:"center", color:"#CBD5E1", fontSize:18, letterSpacing:10, padding:"8px 0" }}>• • •</div>
        : c.style==="space"
        ? <div style={{ height:24 }}/>
        : <hr style={{ border:"none", borderTop:"2px solid #F1F5F9", margin:0 }}/>;

    default:
      // Legacy content format fallback
      if (c.text) return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0 }}>{c.text}</p>;
      return null;
  }
}
