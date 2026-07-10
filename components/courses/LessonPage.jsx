"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Trophy, Music } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useNotifications } from "@/hooks/useNotifications";
import CertificateGenerator from "@/components/courses/CertificateGenerator";
import { useAuth } from "@/lib/AuthContext";

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay }) {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const { markLessonComplete, getCompletedLessons, markChallengeDay } = useProgress();
  const { updateStreak } = useStreak();
  const { send: sendNotification } = useNotifications();
  const safeContent = Array.isArray(content) && content.length > 0 ? content : [];
  const hasContent = safeContent.length > 0;
  const firstStop = safeContent.findIndex(b => b.type === "continueblock");
  const [visibleUntil, setVisibleUntil] = useState(firstStop === -1 ? Infinity : firstStop);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [fillInputs, setFillInputs] = useState({});
  const [fillChecked, setFillChecked] = useState({});
  const [fillShowAnswer, setFillShowAnswer] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [tasksDone, setTasksDone] = useState({});
  const [activeTaskIdx, setActiveTaskIdx] = useState(null);
  const audioRef = useRef(null);
  const autoStartedRef = useRef(false);
  const allLessons = (course?.units || []).flatMap(u => u.lessons || []);
  const currentIdx = allLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];
  const isComplete = (getCompletedLessons(course?.id) || []).includes(lesson?.id);

  const extractText = (allBlocks) => {
    if (!Array.isArray(allBlocks) || allBlocks.length === 0) return "";
    const visibleBlocks = allBlocks.filter((b, i) => i < visibleUntil && b.type !== "continueblock");
    const ttsBlocks = visibleBlocks.filter(b => b.content?.ttsEnabled === true);
    const blocksToRead = ttsBlocks.length > 0
      ? ttsBlocks
      : visibleBlocks.filter(b => b.type === "text" || b.type === "heading");
    return blocksToRead.map(b => {
      const c = b.content || b;
      switch (b.type) {
        case "heading":      return c.text || "";
        case "text":         return c.html ? c.html.replace(/<[^>]+>/g,"") : (c.text || "");
        case "quiz":         return (c.question || "") + ". Options: " + (c.options||[]).join(", ");
        case "fillblank":    return (c.prompt || "").replace("___", "blank");
        case "keypoints":    return (c.title || "Key points") + ": " + (c.points||[]).filter(Boolean).join(". ");
        case "callout":      return c.text || "";
        case "blankoptions": return (c.sentence||"").replace(/\(\s*[^)]*\s*\)/g, "blank");
        default: return "";
      }
    }).filter(Boolean).join(". ");
  };

  const doListen = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractText(safeContent) }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsReading(false);
      audio.onerror = () => setIsReading(false);
      await audio.play();
      setIsReading(true);
    } catch (e) {
      console.error("TTS error:", e);
      alert("Could not load audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleListen = async () => {
    if (isReading) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      setIsReading(false);
      return;
    }
    await doListen();
  };

  useEffect(() => {
    if (mode === "listen" && hasContent && !autoStartedRef.current) {
      autoStartedRef.current = true;
      doListen();
    }
  }, [mode, hasContent]);

  const handleComplete = async () => {
    await updateStreak();
    await markLessonComplete(course?.id, lesson?.id);
    if (challengeId && challengeDay) await markChallengeDay(challengeId, challengeDay);
    await sendNotification("lesson", "Lesson complete! 📚", 'You finished "' + (lesson?.title || "") + '"', "📚", "/courses/" + course?.id);
    const isLast = !allLessons[currentIdx + 1];
    if (isLast && !challengeId) {
      await sendNotification("certificate", "Certificate earned! 🏆", 'You completed "' + (course?.title || "") + '"', "🏆", "/profile");
      setTimeout(() => setShowCert(true), 2200);
    }
    setCompleted(true);
    setShowComplete(true);
  };

  const handleNext = () => {
    if (challengeId) {
      const parts = lesson?.id?.split("_day_");
      const currentDay = parts ? parseInt(parts[parts.length - 1]) : 1;
      const nextDay = currentDay + 1;
      const totalDays = course?.units?.[0]?.lessons?.length || 0;
      if (nextDay <= totalDays) router.push("/challenges/" + challengeId + "?dayComplete=" + currentDay);
      else router.push("/challenges/" + challengeId + "?dayComplete=" + currentDay + "&allDone=true");
    } else if (nextLesson) {
      router.push("/courses/" + course.id + "/lessons/" + nextLesson.id + "?mode=" + mode);
    } else {
      router.push("/courses/" + course.id);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <style>{`
        .lesson-content ul { list-style-type: disc !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .lesson-content ol { list-style-type: decimal !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .lesson-content li { display: list-item !important; margin: 4px 0 !important; }
        .lesson-content h2 { font-size: 22px !important; font-weight: 800 !important; margin: 8px 0 !important; color: #0f172a; }
        .lesson-content h3 { font-size: 18px !important; font-weight: 700 !important; margin: 6px 0 !important; color: #0f172a; }
      `}</style>
      <style>{`
        .lesson-nav { padding: 0 12px; }
        .lesson-back-text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @media (max-width: 640px) {
          .lesson-listen-btn { padding: 6px 10px !important; font-size: 11px !important; }
          .lesson-back-text { max-width: 80px; }
        }
      `}</style>

      {/* Top nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", height:58, position:"sticky", top:0, zIndex:50 }}>
        <div className="lesson-nav" style={{ maxWidth:720, margin:"0 auto", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, overflow:"hidden" }}>
          <Link href={challengeId ? "/challenges/"+challengeId : "/courses/"+(course?.id||"")} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600 }}>
            <ChevronLeft size={16}/><span className="lesson-back-text">{challengeId ? "Back" : course?.title}</span>
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span className="hidden sm:inline" style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min read</span>
            <button onClick={handleListen} disabled={!hasContent || isLoading}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:isReading?"#0891b2":isLoading?"#e0f2fe":"#fff", color:isReading?"#fff":"#0891b2", fontSize:12, fontWeight:700, cursor:hasContent&&!isLoading?"pointer":"not-allowed", opacity:hasContent?1:0.5 }}>
              {isLoading ? "⏳ Loading..." : isReading ? "⏹ Stop" : "🎧 Listen"}
            </button>
            {isComplete && (
              <span style={{ display:"flex", alignItems:"center", gap:4, background:"#F0FDF4", color:"#16A34A", fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:999 }}>
                <Check size={12}/> Complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {!hasContent && (
            <div style={{ textAlign:"center", padding:"60px 20px", background:"#fff", borderRadius:24, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>Content coming soon</h3>
              <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>This lesson is being built. Check back soon!</p>
            </div>
          )}
          {safeContent.map((block, idx) => {
            if (idx > visibleUntil) return null;
            if (block.type === "continueblock") {
              if (idx !== visibleUntil) return null;
              return (
                <button key={block.id||idx}
                  onClick={() => {
                    const nextStop = safeContent.findIndex((b, i) => i > idx && b.type === "continueblock");
                    setVisibleUntil(nextStop === -1 ? Infinity : nextStop);
                    setTimeout(() => {
                      const el = document.getElementById("after-continue-"+idx);
                      if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
                    }, 100);
                  }}
                  style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(91,78,255,0.3)" }}>
                  {(block.content||{}).label||"Continue"} →
                </button>
              );
            }
            if (block.type === "blankoptions") {
              const c = block.content || {};
              const isDone = tasksDone[idx];
              if (isDone) {
                return (
                  <div key={block.id||idx} style={{ borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
                    <div style={{ padding:"12px 20px", background:"#F0FDF4", display:"flex", alignItems:"center", gap:8 }}>
                      <Check size={16} color="#22c55e"/>
                      <span style={{ fontSize:14, fontWeight:700, color:"#166534" }}>Task completed</span>
                    </div>
                    <div style={{ padding:"18px 20px" }}>
                      {c.taskTitle && <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>{c.taskTitle}</h3>}
                      {c.taskDesc && <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>{c.taskDesc}</p>}
                      <button onClick={() => setTasksDone(p=>({...p,[idx]:false}))} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:"#EEF2FF", color:"#5B4EFF", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                        🔁 Repeat task
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={block.id||idx}>
                  {activeTaskIdx !== idx ? (
                    <button onClick={() => setActiveTaskIdx(idx)}
                      style={{ width:"100%", padding:"18px 20px", borderRadius:16, border:"2px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:14 }}>
                   
                      <div>
                        <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 2px" }}>{c.taskTitle||"Fill in the blanks"}</p>
                        <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>{c.taskDesc||"Tap to start the task"}</p>
                      </div>
                      <div style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:10, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700 }}>Start</div>
                    </button>
                  ) : (
                    <BlankOptionsBlock c={c} idx={idx}
                      checked={checked} setChecked={setChecked}
                      fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
                      onDone={() => { setTasksDone(p=>({...p,[idx]:true})); setActiveTaskIdx(null); }}
                      onClose={() => setActiveTaskIdx(null)}
                    />
                  )}
                </div>
              );
            }
            const prevBlock = safeContent[idx-1];
            return (
              <div key={block.id||idx}>
                {prevBlock?.type === "continueblock" && <div id={"after-continue-"+(idx-1)} style={{ scrollMarginTop:70 }}/>}
                <ContentBlock block={block} idx={idx}
                  answers={answers} setAnswers={setAnswers}
                  checked={checked} setChecked={setChecked}
                  fillInputs={fillInputs} setFillInputs={setFillInputs}
                  fillChecked={fillChecked} setFillChecked={setFillChecked}
                  fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom navigation */}
        {visibleUntil === Infinity && (
          <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
            {prevLesson ? (
              <Link href={challengeId ? "/challenges/"+challengeId+"/day/"+(parseInt(lesson?.id?.split("_day_").pop())-1) : "/courses/"+course.id+"/lessons/"+prevLesson.id+"?mode="+mode}
                style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600 }}>
                <ChevronLeft size={15}/> Previous
              </Link>
            ) : <div/>}
            {!isComplete && !completed ? (
              <button onClick={handleComplete} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)" }}>
                {hasContent ? "✓ Mark Complete" : nextLesson ? "✓ Next Lesson" : "🏆 Finish Course"}
              </button>
            ) : (
              <button onClick={handleNext} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                {nextLesson ? <><span>Next Lesson</span><ChevronRight size={15}/></> : <><Trophy size={15}/><span>Finish Course</span></>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Portaled modals */}
      {showComplete && typeof document !== "undefined" && createPortal(
        <div
          onClick={() => setShowComplete(false)}
          style={{
            position:"fixed",
            top:0, left:0, right:0, bottom:0,
            zIndex:9999,
            background:"rgba(15,23,42,0.65)",
            backdropFilter:"blur(4px)",
          }}>
          <style>{`
            .complete-sheet {
              position: absolute;
              bottom: 0; left: 0; right: 0;
              background: #fff;
              border-radius: 24px 24px 0 0;
              box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
              padding: 12px 16px calc(40px + env(safe-area-inset-bottom, 0px));
              box-sizing: border-box;
            }
            @media (min-width: 768px) {
              .complete-sheet {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                bottom: auto; right: auto;
                width: 100%;
                max-width: 420px;
                border-radius: 24px;
                padding: 28px;
              }
            }
          `}</style>
          <div className="complete-sheet" onClick={e => e.stopPropagation()}>
            <div className="drag-handle-mobile" style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <style>{`.drag-handle-mobile { display: flex; } @media (min-width: 768px) { .drag-handle-mobile { display: none !important; } }`}</style>
              <div style={{ width:36, height:4, borderRadius:999, background:"#E2E8F0" }}/>
            </div>
            <div style={{
              background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
              borderRadius:18,
              padding:"20px 16px",
              textAlign:"center",
              marginBottom:16,
            }}>
              <div style={{ fontSize:36, lineHeight:1, marginBottom:8 }}>🎉</div>
              <h2 style={{ fontSize:18, fontWeight:900, color:"#fff", margin:"0 0 4px", lineHeight:1.2 }}>
                {nextLesson ? "Lesson Complete!" : "Course Complete! 🏆"}
              </h2>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)", margin:0 }}>
                {nextLesson ? "Great work — keep going!" : "You finished the entire course!"}
              </p>
            </div>
            {nextLesson && (
              <div style={{
                background:"#F8FAFC",
                borderRadius:14,
                padding:"12px 14px",
                marginBottom:12,
                display:"flex",
                alignItems:"center",
                gap:10,
              }}>
                <div style={{
                  width:32, height:32, flexShrink:0,
                  borderRadius:9,
                  background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <ChevronRight size={15} color="#fff"/>
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <p style={{ fontSize:10, color:"#94A3B8", margin:"0 0 1px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px" }}>Up next</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {nextLesson.title}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => { setShowComplete(false); handleNext(); }}
              style={{
                display:"block", width:"100%", boxSizing:"border-box",
                padding:"15px", marginBottom:8,
                borderRadius:14, border:"none",
                background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                color:"#fff", fontSize:15, fontWeight:700,
                cursor:"pointer",
                boxShadow:"0 4px 14px rgba(124,58,237,0.35)"
              }}>
              {nextLesson ? "Next Lesson →" : "Finish Course 🏆"}
            </button>
            <button
              onClick={() => setShowComplete(false)}
              style={{
                display:"block", width:"100%", boxSizing:"border-box",
                padding:"13px",
                borderRadius:14, border:"1.5px solid #E2E8F0",
                background:"#fff", fontSize:14, fontWeight:600,
                color:"#64748B", cursor:"pointer"
              }}>
              Stay here
            </button>
          </div>
        </div>,
        document.body
      )}

      {showCert && typeof document !== "undefined" && createPortal(
        <CertificateGenerator course={course} userName={userName} completedDate={new Date().toISOString()} onClose={() => setShowCert(false)}/>,
        document.body
      )}
    </div>
  );
}

function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_")) return <em key={i}>{part.slice(1,-1)}</em>;
    return <span key={i}>{part}</span>;
  });
}

/* ─────────────────────────────────────────────
   BlankOptionsBlock — fully mobile-responsive
───────────────────────────────────────────── */
function BlankOptionsBlock({ c, idx, checked, setChecked, fillShowAnswer, setFillShowAnswer, onDone, onClose }) {
  const blanks = c.blanks || [];
  const sentence = c.sentence || "";
  const parts = sentence.split(/\(\s*[^)]*\s*\)/);
  const blankMatches = (sentence.match(/\(\s*[^)]+\s*\)/g) || []);
  const blankCount = parts.length - 1;
  const derivedBlanks = blankMatches.map((m, i) =>
    blanks[i]?.correct ? blanks[i] : { correct: m.replace(/^\(\s*|\s*\)$/g,"").trim() }
  );

  const options = useMemo(() => {
    return [...derivedBlanks.map(b => b.correct).filter(Boolean)].sort(() => Math.random() - 0.5);
  }, []);

  const [filled, setFilled] = useState(Array(blankCount).fill(null));
  const [activeBlank, setActiveBlank] = useState(0);

  const isChecked = checked["bo_"+idx];
  const allFilled = filled.every(f => f !== null);
  const allCorrect = isChecked && derivedBlanks.every((b,i) => filled[i] === b.correct);
  const showAns = fillShowAnswer?.["bo_"+idx];

  const pickOption = (opt) => {
    if (isChecked) return;
    const nf = filled.map((f, i) => f === opt && i !== activeBlank ? null : f);
    nf[activeBlank] = opt;
    setFilled(nf);
    const nextEmpty = nf.findIndex((f, i) => f === null);
    setActiveBlank(nextEmpty === -1 ? null : nextEmpty);
  };

  const clearBlank = (bi) => {
    if (isChecked) return;
    const nf = [...filled]; nf[bi] = null;
    setFilled(nf);
    setActiveBlank(bi);
  };

  const reset = () => {
    setFilled(Array(blankCount).fill(null));
    setActiveBlank(0);
    setChecked(p => ({...p, ["bo_"+idx]: false}));
    setFillShowAnswer(p => ({...p, ["bo_"+idx]: false}));
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#fff", zIndex:200, display:"flex", flexDirection:"column", overscrollBehavior:"contain" }}>
      <style>{`
        @keyframes blankBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .blank-slot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 72px;
          max-width: 140px;
          padding: 6px 10px;
          margin: 0 3px;
          border-radius: 10px;
          border-width: 2px;
          border-style: solid;
          font-weight: 700;
          font-size: 14px;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          transition: all 0.15s;
          box-sizing: border-box;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (min-width: 480px) {
          .blank-slot {
            min-width: 80px;
            max-width: 180px;
            font-size: 15px;
            padding: 7px 12px;
          }
        }
        .blank-slot-active {
          animation: blankBlink 1.2s ease-in-out infinite;
        }
        .bo-sentence {
          font-size: 15px;
          line-height: 2.6;
          color: #0f172a;
          font-weight: 500;
          word-break: break-word;
        }
        @media (min-width: 480px) {
          .bo-sentence { font-size: 16px; }
        }
        .bo-options-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .bo-option-btn {
          padding: 10px 18px;
          border-radius: 12px;
          border-width: 2px;
          border-style: solid;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        @media (min-width: 480px) {
          .bo-option-btn {
            padding: 12px 22px;
            font-size: 14px;
          }
        }
        .bo-check-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 0 #16a34a;
          transition: transform 0.1s;
        }
        .bo-check-btn:active { transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{
        padding:"14px 20px",
        borderBottom:"1px solid #F1F5F9",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        flexShrink:0,
      }}>
        <button
          onClick={() => onDone && onDone()}
          style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B" }}>
          ✕
        </button>
        {/* Progress dots */}
        <div style={{ display:"flex", gap:6 }}>
          {Array.from({ length: blankCount }, (_, i) => (
            <div
              key={i}
              onClick={() => !isChecked && setActiveBlank(i)}
              style={{
                width: filled[i] ? 28 : 22,
                height: 8,
                borderRadius: 999,
                background: filled[i]
                  ? "#5B4EFF"
                  : activeBlank === i
                  ? "#C7D2FE"
                  : "#E2E8F0",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <div style={{ width:32 }}/>
      </div>

      {/* Scrollable body */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
        <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 20px 16px" }}>
          {c.taskTitle && (
            <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:"0 0 6px", lineHeight:1.25 }}>
              {c.taskTitle}
            </h2>
          )}
          {c.taskDesc && (
            <p style={{ fontSize:14, color:"#374151", margin:"0 0 20px", lineHeight:1.65 }}>
              {c.taskDesc}
            </p>
          )}

          {/* Sentence with blanks */}
          <div className="bo-sentence" style={{ marginBottom:8 }}>
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < blankCount && (() => {
                  const val = filled[i];
                  const isActive = activeBlank === i && !isChecked;
                  const ok   = isChecked && val === derivedBlanks[i]?.correct;
                  const wrong = isChecked && val !== derivedBlanks[i]?.correct;

                  let borderColor = "#D1D5DB";
                  let bg = "#F9FAFB";
                  let color = "#94A3B8";
                  let shadow = "0 2px 0 #D1D5DB";

                  if (isActive && !val) {
                    borderColor = "#5B4EFF"; bg = "#EEF2FF"; color = "#5B4EFF";
                    shadow = "0 0 0 3px rgba(91,78,255,0.18)";
                  } else if (val && !isChecked) {
                    borderColor = "#374151"; bg = "#F9FAFB"; color = "#111827";
                    shadow = "0 2px 6px rgba(0,0,0,0.08)";
                  } else if (ok) {
                    borderColor = "#22c55e"; bg = "#F0FDF4"; color = "#166534"; shadow = "none";
                  } else if (wrong) {
                    borderColor = "#ef4444"; bg = "#FEF2F2"; color = "#991B1B"; shadow = "none";
                  } else if (isActive && val) {
                    borderColor = "#5B4EFF"; bg = "#EEF2FF"; color = "#4338CA";
                    shadow = "0 0 0 3px rgba(91,78,255,0.18)";
                  }

                  return (
                    <span
                      key={i}
                      className={`blank-slot${isActive && !val ? " blank-slot-active" : ""}`}
                      onClick={() => !isChecked && (val ? clearBlank(i) : setActiveBlank(i))}
                      style={{ borderColor, background:bg, color, boxShadow:shadow }}
                    >
                      {val ? (
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis", maxWidth:100 }}>{val}</span>
                          {!isChecked && (
                            <span
                              onClick={e => { e.stopPropagation(); clearBlank(i); }}
                              style={{ width:16, height:16, borderRadius:"50%", background:"rgba(0,0,0,0.15)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, cursor:"pointer", flexShrink:0 }}>
                              ✕
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ opacity: isActive ? 0.6 : 0.3, letterSpacing:2 }}>_ _</span>
                      )}
                    </span>
                  );
                })()}
              </span>
            ))}
          </div>

          {!isChecked && activeBlank !== null && (
            <p style={{ fontSize:12, color:"#94A3B8", margin:"4px 0 0" }}>
              Tap an option below to fill blank {activeBlank + 1}
            </p>
          )}

          {/* Success state */}
          {isChecked && allCorrect && (
            <div style={{ marginTop:16 }}>
              {(c.successImages||[]).filter(Boolean).map((url,i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  loading="eager"
                  style={{ width:"100%", borderRadius:16, marginBottom:12, objectFit:"contain", display:"block" }}
                />
              ))}
              {c.successText && (
                <p style={{ fontSize:14, color:"#374151", margin:"0 0 12px", lineHeight:1.65 }}>{c.successText}</p>
              )}
              <div style={{ padding:"14px 18px", borderRadius:14, background:"#F0FDF4", border:"1.5px solid #BBF7D0", marginBottom:16 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#166534", margin:0 }}>🎉 Correct!</p>
              </div>
              <button
                onClick={() => onDone && onDone()}
                style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                Continue →
              </button>
            </div>
          )}

          {/* Wrong state */}
          {isChecked && !allCorrect && (
            <div style={{ marginTop:16 }}>
              <div style={{ padding:"14px 18px", borderRadius:14, border:"2px solid #f59e0b", background:"#FFFBEB", marginBottom:12 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#92400e", margin:"0 0 2px" }}>⚠️ Almost right</p>
                <p style={{ fontSize:13, color:"#92400e", margin:0 }}>Review the highlighted blanks and try again</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={() => setFillShowAnswer(p => ({...p, ["bo_"+idx]: true}))}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:14, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  See answer
                </button>
                <button
                  onClick={reset}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#5B4EFF", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🔄 Try again
                </button>
              </div>
              {showAns && (
                <div style={{ marginTop:10, padding:"14px 16px", borderRadius:12, background:"#F9FAFB", border:"1.5px solid #E5E7EB" }}>
                  {derivedBlanks.map((b,i) => (
                    <p key={i} style={{ fontSize:14, margin:"0 0 4px", fontWeight:600 }}>
                      Blank {i+1}: <strong>{b.correct}</strong>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: options + check button */}
      {!isChecked && (
        <div style={{
          borderTop:"1px solid #F1F5F9",
          padding:"16px 20px",
          paddingBottom:"calc(16px + env(safe-area-inset-bottom, 0px))",
          background:"#fff",
          flexShrink:0,
        }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <div className="bo-options-grid" style={{ marginBottom:14 }}>
              {options.map((opt, i) => {
                const isUsed = filled.includes(opt);
                const isSelected = filled[activeBlank] === opt;
                return (
                  <button
                    key={i}
                    className="bo-option-btn"
                    onClick={() => !isUsed && pickOption(opt)}
                    style={{
                      borderColor: isSelected ? "#5B4EFF" : isUsed ? "#F1F5F9" : "#E5E7EB",
                      background: isSelected ? "#EEF2FF" : isUsed ? "#F9FAFB" : "#fff",
                      color: isSelected ? "#4338CA" : isUsed ? "#CBD5E1" : "#111827",
                      boxShadow: isSelected ? "0 4px 12px rgba(91,78,255,0.2)" : isUsed ? "none" : "0 2px 0 #D1D5DB",
                      opacity: isUsed ? 0.5 : 1,
                      cursor: isUsed ? "not-allowed" : "pointer",
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {allFilled ? (
              <button
                className="bo-check-btn"
                onClick={() => setChecked(p => ({...p, ["bo_"+idx]: true}))}
                style={{ background:"#22c55e", color:"#fff" }}>
                Check ✓
              </button>
            ) : (
              <button
                disabled
                className="bo-check-btn"
                style={{ background:"#E5E7EB", color:"#9CA3AF", boxShadow:"none", cursor:"not-allowed" }}>
                Check
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MatchingBlock (unchanged)
───────────────────────────────────────── */
function MatchingBlock({ c, idx, checked, setChecked }) {
  const pairs = c.pairs || [];
  const isChecked = checked["match_"+idx];

  const shuffled = (arr) => {
    const a = [...arr.map((p,i) => ({ ...p, origIdx:i }))];
    for (let i = a.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  };

  const [leftItems] = useState(() => shuffled(pairs));
  const [rightItems] = useState(() => shuffled(pairs));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState({});

  const handleLeft = (i) => {
    if (isChecked) return;
    setSelectedLeft(i);
    if (selectedRight !== null) {
      setMatches(m => ({ ...m, [i]: selectedRight }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRight = (i) => {
    if (isChecked) return;
    setSelectedRight(i);
    if (selectedLeft !== null) {
      setMatches(m => ({ ...m, [selectedLeft]: i }));
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const allMatched = Object.keys(matches).length === pairs.length;

  const isCorrect = (leftIdx, rightIdx) => {
    const leftOrig = leftItems[leftIdx]?.origIdx;
    const rightOrig = rightItems[rightIdx]?.origIdx;
    return leftOrig === rightOrig;
  };

  const score = Object.entries(matches).filter(([l,r]) => isCorrect(parseInt(l),r)).length;

  const reset = () => {
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setChecked(p => ({ ...p, ["match_"+idx]: false }));
  };

  const getMatchedRight = (leftIdx) => matches[leftIdx] !== undefined ? matches[leftIdx] : null;
  const isRightMatched = (rightIdx) => Object.values(matches).includes(rightIdx);
  const getLeftForRight = (rightIdx) => parseInt(Object.keys(matches).find(k => matches[k] === rightIdx));

  return (
    <div style={{ padding:"20px 0" }}>
      <style>{".match-item{transition:all 0.2s}"}</style>
      {c.heading && <p style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>{c.heading}</p>}
      {c.subheading && <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>{c.subheading}</p>}
      {!c.heading && !c.subheading && <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>Tap a left item then a right item to match them</p>}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {leftItems.map((item, i) => {
            const matchedRight = getMatchedRight(i);
            const isMatched = matchedRight !== null;
            const correct = isChecked && isMatched && isCorrect(i, matchedRight);
            const wrong = isChecked && isMatched && !isCorrect(i, matchedRight);
            const isSelected = selectedLeft === i;
            return (
              <button key={i} className="match-item" onClick={() => handleLeft(i)}
                style={{ padding:item.leftImage?"0":"10px 12px", borderRadius:12, border:`2px solid ${correct?"#22c55e":wrong?"#ef4444":isSelected?"#5B4EFF":isMatched?"#7c3aed":"#E2E8F0"}`, background:correct?"#F0FDF4":wrong?"#FEF2F2":isSelected?"#EEF2FF":isMatched?"#F5F3FF":"#fff", cursor:isChecked?"default":"pointer", textAlign:"left", overflow:"hidden", display:"flex", flexDirection:"column", width:"100%", position:"relative" }}>
                {item.leftImage && <img src={item.leftImage} alt="" style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", display:"block" }}/>}
                {item.left && <span style={{ display:"block", padding:"8px 12px", fontSize:13, fontWeight:700, color:correct?"#166534":wrong?"#991B1B":isSelected?"#4338CA":isMatched?"#6D28D9":"#374151" }}>{item.left}</span>}
                {!item.left && !item.leftImage && <span style={{ display:"block", padding:"10px 12px", fontSize:13, fontWeight:700, color:"#374151" }}>Item {i+1}</span>}
                {isMatched && <span style={{ position:"absolute", top:6, right:6, fontSize:10 }}>{correct?"✓":wrong?"✗":"🔗"}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {rightItems.map((item, i) => {
            const isMatched = isRightMatched(i);
            const leftIdx = isMatched ? getLeftForRight(i) : null;
            const correct = isChecked && isMatched && isCorrect(leftIdx, i);
            const wrong = isChecked && isMatched && !isCorrect(leftIdx, i);
            const isSelected = selectedRight === i;
            return (
              <button key={i} className="match-item" onClick={() => handleRight(i)}
                style={{ padding:item.rightImage?"0":"10px 12px", borderRadius:12, border:`2px solid ${correct?"#22c55e":wrong?"#ef4444":isSelected?"#5B4EFF":isMatched?"#7c3aed":"#E2E8F0"}`, background:correct?"#F0FDF4":wrong?"#FEF2F2":isSelected?"#EEF2FF":isMatched?"#F5F3FF":"#fff", cursor:isChecked?"default":"pointer", textAlign:"left", overflow:"hidden", display:"flex", flexDirection:"column", width:"100%", position:"relative" }}>
                {item.rightImage && <img src={item.rightImage} alt="" style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", display:"block" }}/>}
                {item.right && <span style={{ display:"block", padding:"8px 12px", fontSize:13, fontWeight:700, color:correct?"#166534":wrong?"#991B1B":isSelected?"#4338CA":isMatched?"#6D28D9":"#374151" }}>{item.right}</span>}
                {!item.right && !item.rightImage && <span style={{ display:"block", padding:"10px 12px", fontSize:13, fontWeight:700, color:"#374151" }}>Match {i+1}</span>}
                {isMatched && <span style={{ position:"absolute", top:6, right:6, fontSize:10 }}>{correct?"✓":wrong?"✗":"🔗"}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {!isChecked && allMatched && (
        <button onClick={() => setChecked(p => ({ ...p, ["match_"+idx]: true }))}
          style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>
          Check ✓
        </button>
      )}
      {!isChecked && !allMatched && (
        <p style={{ textAlign:"center", fontSize:12, color:"#94A3B8" }}>{Object.keys(matches).length}/{pairs.length} matched</p>
      )}
      {isChecked && (
        <div>
          <div style={{ padding:"14px 18px", borderRadius:14, background:score===pairs.length?"#F0FDF4":"#FEF2F2", border:`1.5px solid ${score===pairs.length?"#BBF7D0":"#FECACA"}`, marginBottom:12 }}>
            <p style={{ fontSize:15, fontWeight:800, color:score===pairs.length?"#166534":"#DC2626", margin:0 }}>
              {score===pairs.length?"🎉 Perfect! All matched correctly!":score+"/"+pairs.length+" correct"}
            </p>
          </div>
          <button onClick={reset} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:"#5B4EFF", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ReorderBlock (unchanged)
───────────────────────────────────────── */
function ReorderBlock({ c, idx, checked, setChecked }) {
  const correctOrder = (c.items||[]).filter(Boolean);
  const shuffled = useMemo(() => [...correctOrder].sort(() => Math.random() - 0.5), []);
  const [order, setOrder] = useState(shuffled);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [selected, setSelected] = useState(null);
  const isChecked = checked["ro_"+idx];
  const isCorrect = isChecked && order.every((item,i) => item === correctOrder[i]);

  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e,i) => { e.preventDefault(); setDragOverIdx(i); };
  const handleDrop = (i) => {
    if (dragIdx===null||dragIdx===i) { setDragIdx(null); setDragOverIdx(null); return; }
    const n=[...order]; const d=n.splice(dragIdx,1)[0]; n.splice(i,0,d);
    setOrder(n); setDragIdx(null); setDragOverIdx(null);
  };

  const handleTap = (i) => {
    if (isChecked) return;
    if (selected === null) {
      setSelected(i);
    } else if (selected === i) {
      setSelected(null);
    } else {
      const n=[...order];
      [n[selected], n[i]] = [n[i], n[selected]];
      setOrder(n);
      setSelected(null);
    }
  };

  const reset = () => { setOrder([...correctOrder].sort(()=>Math.random()-0.5)); setChecked(p=>({...p,["ro_"+idx]:false})); setSelected(null); };

  return (
    <div style={{ padding:"20px 0" }}>
      {c.question && <p style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 16px", lineHeight:1.5 }}>{c.question}</p>}
      {!isChecked && (
        <div>
          <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>
            {selected !== null ? "Now tap another item to swap positions" : "Tap to select, then tap another to swap · or drag to reorder"}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {order.map((item,i) => (
              <div key={item}
                draggable
                onDragStart={()=>handleDragStart(i)}
                onDragOver={e=>handleDragOver(e,i)}
                onDrop={()=>handleDrop(i)}
                onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
                onClick={()=>handleTap(i)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12, border:`2px solid ${selected===i?"#5B4EFF":dragOverIdx===i?"#8B5CF6":"#E2E8F0"}`, background:selected===i?"#EEF2FF":dragIdx===i?"#F5F3FF":"#fff", cursor:"pointer", boxShadow:selected===i?"0 0 0 3px rgba(91,78,255,0.2)":"0 2px 4px rgba(0,0,0,0.04)", transition:"all 0.15s" }}>
                <span style={{ fontSize:20, color:selected===i?"#5B4EFF":"#CBD5E1" }}>⠿</span>
                <span style={{ fontSize:15, color:selected===i?"#4338CA":"#374151", fontWeight:selected===i?700:500, flex:1 }}>{item}</span>
                <span style={{ fontSize:12, fontWeight:700, width:24, height:24, borderRadius:"50%", background:selected===i?"#5B4EFF":"#F1F5F9", color:selected===i?"#fff":"#94A3B8", display:"flex", alignItems:"center", justifyContent:"center" }}>{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {isChecked && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {order.map((item,i) => {
            const ok = item===correctOrder[i];
            return (
              <div key={item} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12, border:`2px solid ${ok?"#22c55e":"#ef4444"}`, background:ok?"#F0FDF4":"#FEF2F2" }}>
                <span style={{ fontSize:16 }}>{ok?"✓":"✕"}</span>
                <span style={{ fontSize:15, color:ok?"#166534":"#991B1B", fontWeight:500, flex:1 }}>{item}</span>
                {!ok && <span style={{ fontSize:12, color:"#991B1B" }}>→ {correctOrder[i]}</span>}
              </div>
            );
          })}
        </div>
      )}
      {!isChecked && (
        <button onClick={() => setChecked(p=>({...p,["ro_"+idx]:true}))} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>Check Order</button>
      )}
      {isChecked && isCorrect && (
        <div style={{ padding:"14px 18px", borderRadius:14, background:"#F0FDF4", border:"1.5px solid #BBF7D0" }}>
          <p style={{ fontSize:15, fontWeight:700, color:"#166534", margin:0 }}>🎉 Perfect order!</p>
        </div>
      )}
      {isChecked && !isCorrect && (
        <div>
          <div style={{ padding:"14px 18px", borderRadius:14, background:"#FEF2F2", border:"1.5px solid #FECACA", marginBottom:10 }}>
            <p style={{ fontSize:15, fontWeight:700, color:"#DC2626", margin:0 }}>❌ Not quite — try again!</p>
          </div>
          <button onClick={reset} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:"#5B4EFF", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>🔄 Try Again</button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ContentBlock
───────────────────────────────────────── */
function ContentBlock({ block, idx, answers, setAnswers, checked, setChecked, fillInputs, setFillInputs, fillChecked, setFillChecked, fillShowAnswer, setFillShowAnswer }) {
  const c = block.content || block;

  switch (block.type) {

    case "heading": {
      const ts = c.textStyle || {};
      const sz = c.level==="h1"?28:c.level==="h2"?22:18;
      return (
        <div style={{ fontSize:ts.fontSize||sz, fontWeight:ts.bold?"900":"800", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#0f172a", lineHeight:1.25 }}>
          {c.text}
        </div>
      );
    }

    case "text": {
      const ts = c.textStyle || {};
      if (c.html) {
        return (
          <div className="lesson-content" style={{ fontSize:ts.fontSize||15, textAlign:ts.align||"left", lineHeight:1.8, color:"#374151" }}
            dangerouslySetInnerHTML={{ __html: c.html }}/>
        );
      }
      return (
        <p style={{ fontSize:ts.fontSize||15, fontWeight:ts.bold?"700":"400", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", lineHeight:1.8, color:"#374151", margin:0 }}>
          {c.text?.split("\n").map((line, i, arr) => (
            <span key={i}>{renderInline(line)}{i < arr.length-1 && <br/>}</span>
          ))}
        </p>
      );
    }

    case "image":
      if (!c.src) return null;
      return (
        <figure style={{ margin:0, textAlign:c.align||"center" }}>
          <img
            src={c.src}
            alt={c.alt||""}
            loading="lazy"
            decoding="async"
            style={{ width:c.size==="small"?"50%":c.size==="medium"?"75%":"100%", borderRadius:20, display:"inline-block", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}
          />
          {c.caption && (
            <figcaption style={{ textAlign:(c.captionStyle||{}).align||"center", fontSize:(c.captionStyle||{}).fontSize||13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>
              {c.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video": {
      const src = c.src || "";
      let ytId = null;
      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const m = src.split("v=")[1] || src.split("youtu.be/")[1];
        ytId = m ? m.split("&")[0].split("?")[0] : null;
      }
      return (
        <div>
          <div style={{ borderRadius:20, overflow:"hidden", aspectRatio:"16/9", background:"#000" }}>
            {ytId ? (
              <iframe
                width="100%"
                height="100%"
                src={"https://www.youtube.com/embed/"+ytId}
                style={{ border:"none", display:"block" }}
                loading="lazy"
                allowFullScreen
              />
            ) : c.src ? (
              <video src={c.src} controls style={{ width:"100%", height:"100%" }} preload="metadata"/>
            ) : null}
          </div>
          {c.caption && <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</p>}
        </div>
      );
    }

    case "audio": {
      if (!c.src) return null;
      const ts = c.titleStyle || {};
      return (
        <div style={{ padding:"16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Music size={20} color="#374151"/>
            </div>
            <div>
              <p style={{ fontSize:ts.fontSize||15, fontWeight:"700", fontStyle:ts.italic?"italic":"normal", color:"#0f172a", margin:"0 0 2px" }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:13, color:"#64748B", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:42 }} preload="metadata"/>
        </div>
      );
    }

    case "quiz": {
      const sel = answers[idx];
      const isChecked = checked[idx];
      const isCorrect = sel === c.correct;
      const qs = c.questionStyle || {};
      const os = c.optionStyle || {};
      return (
        <div style={{ padding:"20px 0" }}>
          <p style={{ fontSize:qs.fontSize||16, fontWeight:"700", fontStyle:qs.italic?"italic":"normal", textAlign:qs.align||"left", color:"#0f172a", margin:"0 0 16px", lineHeight:1.4 }}>
            {c.question}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {(c.options||[]).map((opt, i) => {
              let bg = "#fff", border = "#E2E8F0", color = "#374151", shadow = "0 2px 0 #D1D5DB";
              if (isChecked) {
                if (i === c.correct) { bg="#F0FDF4"; border="#22c55e"; color="#166534"; shadow="none"; }
                else if (i === sel) { bg="#FEF2F2"; border="#ef4444"; color="#991B1B"; shadow="none"; }
              } else if (sel === i) { border="#111827"; shadow="0 2px 0 #111827"; }
              return (
                <button key={i} onClick={() => !isChecked && setAnswers(p => ({...p,[idx]:i}))}
                  style={{ padding:"12px 16px", borderRadius:12, border:"2px solid "+border, background:bg, color, fontSize:os.fontSize||14, textAlign:os.align||"left", cursor:isChecked?"default":"pointer", display:"flex", alignItems:"center", gap:10, fontWeight:600, boxShadow:shadow }}>
                  <span style={{ width:26, height:26, borderRadius:"50%", border:"2px solid "+border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700, background:isChecked&&i===c.correct?"#22c55e":isChecked&&i===sel&&!isCorrect?"#ef4444":"transparent", color:isChecked&&(i===c.correct||i===sel)?"#fff":color }}>
                    {isChecked&&i===c.correct?"✓":isChecked&&i===sel&&!isCorrect?"✕":String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {!isChecked && sel !== undefined && (
            <button onClick={() => setChecked(p => ({...p,[idx]:true}))}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>
              Check
            </button>
          )}
          {isChecked && (
            <div style={{ padding:"14px 16px", borderRadius:12, background:isCorrect?"#F0FDF4":"#FEF2F2", border:"1.5px solid "+(isCorrect?"#BBF7D0":"#FECACA") }}>
              <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#DC2626", margin:"0 0 4px" }}>{isCorrect?"🎉 Correct!":"❌ Not quite"}</p>
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
      const showAnswer = fillShowAnswer?.[idx];
      const ps = c.promptStyle || {};
      const hs = c.hintStyle || {};
      return (
        <div style={{ padding:"20px 0" }}>
          <p style={{ fontSize:ps.fontSize||16, fontWeight:ps.bold?"700":"400", fontStyle:ps.italic?"italic":"normal", textAlign:ps.align||"left", color:"#0f172a", margin:"0 0 16px", lineHeight:1.6 }}>
            {(c.prompt||"").split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span style={{ display:"inline-block", minWidth:80, borderBottom:"2.5px solid #6366f1", margin:"0 6px", verticalAlign:"bottom", paddingBottom:2, fontWeight:700, color:"#6366f1", minHeight:24 }}>
                    {val || " "}
                  </span>
                )}
              </span>
            ))}
          </p>
          <input
            value={val}
            onChange={e => !isChecked && setFillInputs(p => ({...p,[idx]:e.target.value}))}
            onKeyDown={e => e.key==="Enter" && val && !isChecked && setFillChecked(p => ({...p,[idx]:true}))}
            placeholder="Type your answer..."
            disabled={isChecked}
            style={{ width:"100%", padding:"14px 18px", borderRadius:14, border:"2px solid "+(isChecked?isCorrect?"#22c55e":"#ef4444":"#E2E8F0"), fontSize:15, fontWeight:500, outline:"none", boxSizing:"border-box", background:isChecked?isCorrect?"#F0FDF4":"#FEF2F2":"#F9FAFB", color:isChecked?isCorrect?"#166534":"#991B1B":"#0f172a", marginBottom:12 }}
          />
          {c.hint && !isChecked && (
            <p style={{ fontSize:hs.fontSize||13, fontStyle:"italic", color:"#64748B", margin:"0 0 12px" }}>💡 {c.hint}</p>
          )}
          {!isChecked && val && (
            <button onClick={() => setFillChecked(p => ({...p,[idx]:true}))}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>
              Check
            </button>
          )}
          {isChecked && isCorrect && (
            <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0FDF4", border:"1.5px solid #BBF7D0" }}>
              <p style={{ fontSize:15, fontWeight:700, color:"#166534", margin:0 }}>🎉 Correct!</p>
            </div>
          )}
          {isChecked && !isCorrect && (
            <div>
              <div style={{ padding:"14px 16px", borderRadius:12, background:"#FEF2F2", border:"1.5px solid #FECACA", marginBottom:10 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#DC2626", margin:0 }}>❌ Not quite!</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { setFillChecked(p => ({...p,[idx]:false})); setFillInputs(p => ({...p,[idx]:""})); }}
                  style={{ flex:1, padding:"11px", borderRadius:11, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Try Again
                </button>
                <button onClick={() => setFillShowAnswer(p => ({...p,[idx]:true}))}
                  style={{ flex:1, padding:"11px", borderRadius:11, border:"none", background:"#111827", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  See Answer
                </button>
              </div>
              {showAnswer && (
                <div style={{ marginTop:10, padding:"12px 16px", borderRadius:10, background:"#F9FAFB", border:"1.5px solid #E5E7EB" }}>
                  <p style={{ fontSize:13, color:"#374151", margin:0 }}>Answer: <strong style={{ color:"#111827" }}>{c.answer}</strong></p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case "blankoptions":
      return <BlankOptionsBlock c={c} idx={idx} checked={checked} setChecked={setChecked} fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}/>;

    case "matching":
      return <MatchingBlock c={c} idx={idx} checked={checked} setChecked={setChecked}/>;
    case "reorder":
      return <ReorderBlock c={c} idx={idx} checked={checked} setChecked={setChecked}/>;

    case "multiplechoice": {
      const selArr = answers[idx] || [];
      const isChecked = checked[idx];
      const correctArr = Array.isArray(c.correct) ? c.correct : c.correct!==undefined ? [c.correct] : [];
      const multiMode = correctArr.length > 1;
      const isCorrect = isChecked && correctArr.length === selArr.length && correctArr.every(i => selArr.includes(i));
      const qs = c.questionStyle||{};
      const os = c.optionStyle||{};
      const es = c.explanationStyle||{};

      const toggleSel = (i) => {
        if (isChecked) return;
        if (multiMode) {
          const ns = selArr.includes(i) ? selArr.filter(x=>x!==i) : [...selArr,i];
          setAnswers(p=>({...p,[idx]:ns}));
        } else {
          setAnswers(p=>({...p,[idx]:[i]}));
        }
      };

      return (
        <div style={{ padding:"20px 0" }}>
          {c.heading && (
            <p style={{ fontSize:(c.headingStyle||{}).fontSize||20, fontWeight:"800", color:"#0f172a", margin:"0 0 4px", textAlign:(c.headingStyle||{}).align||"left" }}>
              {c.heading}
            </p>
          )}
          {c.subheading && (
            <p style={{ fontSize:(c.subheadingStyle||{}).fontSize||14, color:"#64748B", margin:"0 0 14px", textAlign:(c.subheadingStyle||{}).align||"left" }}>
              {c.subheading}
            </p>
          )}
          {c.headerImage && (
            <img src={c.headerImage} alt="" loading="lazy" decoding="async" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:16, objectFit:"contain" }}/>
          )}
          {multiMode && !isChecked && (
            <div style={{ display:"inline-block", padding:"4px 12px", borderRadius:999, background:"#EEF2FF", color:"#6366f1", fontSize:12, fontWeight:700, marginBottom:12 }}>
              Select all that apply
            </div>
          )}
          <p style={{ fontSize:qs.fontSize||16, fontWeight:"700", fontStyle:qs.italic?"italic":"normal", textAlign:qs.align||"left", color:"#0f172a", margin:"0 0 16px", lineHeight:1.5 }}>
            {c.question}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {(c.options||[]).map((opt,i) => {
              const isSel = selArr.includes(i);
              const isRight = correctArr.includes(i);
              let border="#E2E8F0", bg="#fff", checkColor="#D1D5DB";
              if (isChecked) {
                if (isRight) { border="#22c55e"; bg="#F0FDF4"; checkColor="#22c55e"; }
                else if (isSel) { border="#ef4444"; bg="#FEF2F2"; checkColor="#ef4444"; }
              } else if (isSel) { border="#7c3aed"; bg="#F5F3FF"; checkColor="#7c3aed"; }
              return (
                <button key={i} onClick={() => toggleSel(i)}
                  style={{ display:"flex", flexDirection:c.optionImages?.[i]?"column":"row", alignItems:c.optionImages?.[i]?"flex-start":"center", gap:c.optionImages?.[i]?10:12, padding:"14px 16px", borderRadius:12, border:`1.5px solid ${border}`, background:bg, cursor:isChecked?"default":"pointer", textAlign:"left", transition:"all 0.15s", width:"100%" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, width:"100%" }}>
                    <div style={{ width:20, height:20, borderRadius:multiMode?4:"50%", border:`2px solid ${checkColor}`, background:isSel||isChecked&&isRight?checkColor:"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                      {(isSel || (isChecked && isRight)) && <Check size={12} color="#fff"/>}
                    </div>
                    <span style={{ fontSize:os.fontSize||14, color:"#374151", fontWeight:500, lineHeight:1.4, flex:1 }}>{opt}</span>
                  </div>
                  {c.optionImages?.[i] && isSel && (
                    <img src={c.optionImages[i]} alt="" loading="eager" style={{ width:"100%", borderRadius:10, marginTop:8, objectFit:"contain", display:"block" }}/>
                  )}
                </button>
              );
            })}
          </div>
          {!isChecked && selArr.length>0 && (
            <button onClick={() => setChecked(p=>({...p,[idx]:true}))}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>
              Check
            </button>
          )}
          {isChecked && (
            <div>
              {isCorrect && c.successImage && (
                <img src={c.successImage} alt="" loading="eager" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:12, objectFit:"contain" }}/>
              )}
              {isCorrect && c.successText && (
                <p style={{ fontSize:14, color:"#374151", margin:"0 0 12px", lineHeight:1.65 }}>{c.successText}</p>
              )}
              <div style={{ padding:"16px 18px", borderRadius:14, background:isCorrect?"#F0FDF4":"#FEF2F2", border:`1.5px solid ${isCorrect?"#BBF7D0":"#FECACA"}` }}>
                <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#DC2626", margin:"0 0 6px" }}>
                  {isCorrect?"🎉 Correct!":"❌ Not quite"}
                </p>
                {c.explanation && <p style={{ fontSize:es.fontSize||13, color:"#374151", margin:0, lineHeight:1.6 }}>{c.explanation}</p>}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "keypoints": {
      const ts = c.titleStyle || {};
      const ps = c.pointStyle || {};
      return (
        <div style={{ padding:"20px 0" }}>
          <p style={{ fontSize:ts.fontSize||16, fontWeight:ts.bold?"900":"800", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#0f172a", margin:"0 0 16px" }}>
            ⭐ {c.title||"Key Takeaways"}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(c.points||[]).filter(Boolean).map((pt, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                  {i+1}
                </div>
                <p style={{ fontSize:ps.fontSize||14, fontWeight:ps.bold?"700":"400", fontStyle:ps.italic?"italic":"normal", textAlign:ps.align||"left", color:"#374151", margin:0, lineHeight:1.6 }}>
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "callout": {
      const map = {
        info:    ["💡","#0891b2"],
        warning: ["⚠️","#d97706"],
        success: ["✅","#059669"],
        error:   ["❌","#dc2626"],
      };
      const [emoji, color] = map[c.style||"info"];
      const ts = c.textStyle || {};
      return (
        <div style={{ padding:"14px 18px", borderRadius:12, background:"#F8FAFC", borderLeft:"4px solid "+color, display:"flex", gap:12 }}>
          <span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span>
          <div>
            {c.heading && <p style={{ fontSize:15, fontWeight:800, color:"#374151", margin:c.text?"0 0 4px":0 }}>{c.heading}</p>}
            <p style={{ fontSize:ts.fontSize||14, fontWeight:ts.bold?"700":"400", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#374151", margin:0, lineHeight:1.65 }}>
              {c.text}
            </p>
          </div>
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
      if (c.text) return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0 }}>{c.text}</p>;
      return null;
  }
}
