"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Trophy, Music } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useNotifications } from "@/hooks/useNotifications";
import CertificateGenerator from "@/components/courses/CertificateGenerator";

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay }) {
  const router = useRouter();
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
  const [activeTask, setActiveTask] = useState(null); // idx of active blankoptions block
  const [tasksDone, setTasksDone] = useState({});
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
    // If admin enabled TTS on specific blocks, only read those. Else read text+heading.
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
        case "blankoptions": return c.sentence || "";
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
    if (isLast) {
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
      if (nextDay <= totalDays) router.push("/challenges/" + challengeId + "/day/" + nextDay);
      else router.push("/challenges/" + challengeId + "?joined=true");
    } else if (nextLesson) {
      router.push("/courses/" + course.id + "/lessons/" + nextLesson.id + "?mode=" + mode);
    } else {
      router.push("/courses/" + course.id);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      {/* Top nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", height:58, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 20px", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href={challengeId ? "/challenges/"+challengeId : "/courses/"+(course?.id||"")} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600 }}>
            <ChevronLeft size={16}/>{challengeId ? "Back to Challenge" : course?.title}
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min read</span>
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


        {/* Check if any blankoptions block is currently active (visible and not done) */}
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
                  }}
                  style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(91,78,255,0.3)" }}>
                  {(block.content||{}).label||"Continue"} →
                </button>
              );
            }
            if (block.type === "blankoptions") {
              const c = block.content || {};
              return (
                <BlankOptionsBlock key={block.id||idx} c={c} idx={idx}
                  checked={checked} setChecked={setChecked}
                  fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
                />
              );
            }
            return (
              <ContentBlock key={block.id||idx} block={block} idx={idx}
                answers={answers} setAnswers={setAnswers}
                checked={checked} setChecked={setChecked}
                fillInputs={fillInputs} setFillInputs={setFillInputs}
                fillChecked={fillChecked} setFillChecked={setFillChecked}
                fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
              />
            );
          })}
        </div>

        {/* Bottom navigation - only show when all content revealed */}
        {visibleUntil === Infinity && <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
          {prevLesson ? (
            <Link href={challengeId ? "/challenges/"+challengeId+"/day/"+(parseInt(lesson?.id?.split("_day_").pop())-1) : "/courses/"+course.id+"/lessons/"+prevLesson.id+"?mode="+mode}
              style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600 }}>
              <ChevronLeft size={15}/> Previous
            </Link>
          ) : <div/>}
          {!isComplete && !completed ? (
            hasContent ? (
              <button onClick={handleComplete} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)" }}>
                ✓ Mark Complete
              </button>
            ) : (
              <button disabled style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"#E2E8F0", color:"#94A3B8", fontSize:14, fontWeight:700, cursor:"not-allowed" }}>
                Content not ready yet
              </button>
            )
          ) : (
            <button onClick={handleNext} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {nextLesson ? <><span>Next Lesson</span><ChevronRight size={15}/></> : <><Trophy size={15}/><span>Finish Course</span></>}
            </button>
          )}
        </div>}
      </div>

      {/* Complete modal */}
      {showComplete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, padding:"40px 36px", textAlign:"center", maxWidth:380, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Lesson Complete!</h2>
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px" }}>{nextLesson ? 'Up next: "'+nextLesson.title+'"' : "You've finished this course!"}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowComplete(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Stay here</button>
              <button onClick={() => { setShowComplete(false); handleNext(); }} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {nextLesson ? "Next lesson →" : "Back to course"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCert && <CertificateGenerator course={course} userName="" completedDate={new Date().toISOString()} onClose={() => setShowCert(false)}/>}
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


function BlankOptionsBlock({ c, idx, checked, setChecked, fillShowAnswer, setFillShowAnswer }) {
  const blanks = c.blanks || [];
  const markedWords = c.markedWords || [];
  const blankCount = markedWords.length;
  const sentence = c.sentence || "";
  const words = sentence.split(" ").filter(Boolean);

  const allOptions = useMemo(() => {
    const pool = blanks.flatMap(b => [b.correct, b.w1, b.w2, b.w3].filter(Boolean));
    return [...pool].sort(() => Math.sin(idx * 99 + pool.length * 31) - 0.5);
  }, [idx]);

  const [bank, setBank] = useState(allOptions);
  const [filled, setFilled] = useState(Array(blankCount).fill(null));
  const [taskDone, setTaskDone] = useState(false);

  const isChecked = checked["bo_"+idx];
  const allFilled = filled.every(f => f !== null);
  const allCorrect = isChecked && blanks.every((b, i) => filled[i] === b.correct);
  const showAns = fillShowAnswer?.["bo_"+idx];

  const pickWord = (word, wi) => {
    if (isChecked) return;
    const next = filled.findIndex(f => f === null);
    if (next === -1) return;
    const nf = [...filled]; nf[next] = word;
    setFilled(nf);
    setBank(prev => prev.filter((_, i) => i !== wi));
  };

  const unpick = (bi) => {
    if (isChecked || !filled[bi]) return;
    const word = filled[bi];
    const nf = [...filled]; nf[bi] = null;
    setFilled(nf);
    setBank(prev => [...prev, word]);
  };

  const reset = () => {
    setFilled(Array(blankCount).fill(null));
    setBank(allOptions);
    setChecked(p => ({...p, ["bo_"+idx]: false}));
    setFillShowAnswer(p => ({...p, ["bo_"+idx]: false}));
    setTaskDone(false);
  };

  // Task completed — inline card
  if (taskDone) {
    return (
      <div style={{ borderRadius:16, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
        <div style={{ padding:"12px 20px", background:"#F0FDF4", display:"flex", alignItems:"center", gap:8 }}>
          <Check size={16} color="#22c55e"/>
          <span style={{ fontSize:14, fontWeight:700, color:"#166534" }}>Task completed</span>
        </div>
        <div style={{ padding:"18px 20px" }}>
          {c.taskTitle && <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>{c.taskTitle}</h3>}
          {c.taskDesc && <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>{c.taskDesc}</p>}
          <button onClick={reset} style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:"#EEF2FF", color:"#5B4EFF", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            🔁 Repeat task
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen takeover
  return (
    <div style={{ position:"fixed", inset:0, background:"#fff", zIndex:200, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center" }}>
        <button onClick={() => setTaskDone(true)} style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>

      {/* Scrollable content area */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"28px 24px" }}>

          {/* Task title + description */}
          {c.taskTitle && <h2 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>{c.taskTitle}</h2>}
          {c.taskDesc && <p style={{ fontSize:15, color:"#374151", margin:"0 0 28px", lineHeight:1.65 }}>{c.taskDesc}</p>}

          {/* Sentence with blank slots */}
          {!allCorrect && (
            <p style={{ fontSize:18, fontWeight:500, color:"#0f172a", margin:"0 0 12px", lineHeight:3.2 }}>
              {words.map((word, wi) => {
                if (!markedWords.includes(wi)) return <span key={wi}>{word} </span>;
                const bi = markedWords.indexOf(wi);
                const val = filled[bi];
                const ok = isChecked && val === blanks[bi]?.correct;
                const wrong = isChecked && val !== blanks[bi]?.correct;
                return (
                  <span key={wi}>
                    <span onClick={() => unpick(bi)}
                      style={{ display:"inline-block", minWidth:110, padding:"4px 16px", margin:"0 3px", borderRadius:8, border:`2px solid ${ok?"#22c55e":wrong?"#ef4444":val?"#374151":"#D1D5DB"}`, background:ok?"#F0FDF4":wrong?"#FEF2F2":val?"#F9FAFB":"#F9FAFB", color:ok?"#166534":wrong?"#991B1B":val?"#111827":"#94A3B8", fontWeight:700, fontSize:17, textAlign:"center", verticalAlign:"middle", cursor:val&&!isChecked?"pointer":"default", transition:"all 0.15s" }}>
                      {val||" "}
                    </span>{" "}
                  </span>
                );
              })}
            </p>
          )}

          {/* Correct state — show full sentence then image */}
          {isChecked && allCorrect && (
            <div>
              {/* Full sentence revealed */}
              <div style={{ padding:"16px 20px", borderRadius:14, background:"#F8FAFC", border:"1.5px solid #E2E8F0", marginBottom:20 }}>
                <p style={{ fontSize:18, fontWeight:500, color:"#0f172a", margin:0, lineHeight:1.8 }}>{sentence}</p>
              </div>
              {/* Success images */}
              {(c.successImages||[]).filter(Boolean).map((url,i) => (
                <img key={i} src={url} alt="" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:16 }}/>
              ))}
              {/* Success text */}
              {c.successText && <p style={{ fontSize:14, color:"#374151", margin:"0 0 16px", lineHeight:1.65 }}>{c.successText}</p>}
              {/* Correct badge */}
              <div style={{ padding:"14px 18px", borderRadius:14, background:"#F0FDF4", border:"1.5px solid #BBF7D0", marginBottom:16 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#166534", margin:0 }}>🎉 Correct!</p>
              </div>
              <button onClick={() => setTaskDone(true)}
                style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                Continue →
              </button>
            </div>
          )}

          {/* Almost right */}
          {isChecked && !allCorrect && (
            <div style={{ marginTop:16 }}>
              <div style={{ padding:"14px 18px", borderRadius:14, border:"2px solid #f59e0b", background:"#FFFBEB", marginBottom:12 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#92400e", margin:"0 0 2px" }}>⚠️ Almost right</p>
                <p style={{ fontSize:13, color:"#92400e", margin:0 }}>Review the steps and try again</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setFillShowAnswer(p => ({...p, ["bo_"+idx]: true}))}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:14, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  See answer
                </button>
                <button onClick={reset}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#5B4EFF", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  🔄 Try again
                </button>
              </div>
              {showAns && (
                <div style={{ marginTop:10, padding:"14px 16px", borderRadius:12, background:"#F9FAFB", border:"1.5px solid #E5E7EB" }}>
                  {blanks.map((b,i) => (
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

      {/* Fixed bottom — word bank + check */}
      {!isChecked && (
        <div style={{ borderTop:"1px solid #F1F5F9", padding:"16px 24px 24px", background:"#fff" }}>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12, minHeight:48 }}>
              {bank.map((word, i) => (
                <button key={i} onClick={() => pickWord(word, i)}
                  style={{ padding:"10px 20px", borderRadius:12, border:"2px solid #E5E7EB", background:"#fff", color:"#111827", fontSize:15, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 0 #D1D5DB" }}>
                  {word}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {filled.some(f => f) && (
                <button onClick={() => { const last=[...filled].map((f,i)=>({f,i})).filter(x=>x.f).pop(); if(last) unpick(last.i); }}
                  style={{ padding:"13px 18px", borderRadius:12, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:18, cursor:"pointer" }}>⌫</button>
              )}
              <button onClick={() => allFilled && setChecked(p => ({...p, ["bo_"+idx]: true}))}
                style={{ flex:1, padding:"14px", borderRadius:14, border:"none", background:allFilled?"#22c55e":"#E5E7EB", color:allFilled?"#fff":"#9CA3AF", fontSize:15, fontWeight:700, cursor:allFilled?"pointer":"default", boxShadow:allFilled?"0 4px 0 #16a34a":"none", transition:"all 0.2s" }}>
                Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ContentBlock({ block, idx, answers, setAnswers, checked, setChecked, fillInputs, setFillInputs, fillChecked, setFillChecked, fillShowAnswer, setFillShowAnswer }) {
  const c = block.content || block;

  switch (block.type) {

    // ── HEADING ──
    case "heading": {
      const ts = c.textStyle || {};
      const sz = c.level==="h1"?28:c.level==="h2"?22:18;
      return (
        <div style={{ fontSize:ts.fontSize||sz, fontWeight:ts.bold?"900":"800", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#0f172a", lineHeight:1.25 }}>
          {c.text}
        </div>
      );
    }

    // ── TEXT ──
    case "text": {
      const ts = c.textStyle || {};
      if (c.html) {
        return (
          <div style={{ fontSize:ts.fontSize||15, textAlign:ts.align||"left", lineHeight:1.8, color:"#374151" }}
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

    // ── IMAGE ──
    case "image":
      if (!c.src) return null;
      return (
        <figure style={{ margin:0, textAlign:c.align||"center" }}>
          <img src={c.src} alt={c.alt||""} style={{ width:c.size==="small"?"50%":c.size==="medium"?"75%":"100%", borderRadius:20, display:"inline-block", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}/>
          {c.caption && (
            <figcaption style={{ textAlign:(c.captionStyle||{}).align||"center", fontSize:(c.captionStyle||{}).fontSize||13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>
              {c.caption}
            </figcaption>
          )}
        </figure>
      );

    // ── VIDEO ──
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
            {ytId ? <iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+ytId} style={{ border:"none", display:"block" }} allowFullScreen/>
              : c.src ? <video src={c.src} controls style={{ width:"100%", height:"100%" }}/> : null}
          </div>
          {c.caption && <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</p>}
        </div>
      );
    }

    // ── AUDIO ──
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
              <p style={{ fontSize:ts.fontSize||15, fontWeight:ts.bold?"700":"700", fontStyle:ts.italic?"italic":"normal", color:"#0f172a", margin:"0 0 2px" }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:13, color:"#64748B", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:42 }}/>
        </div>
      );
    }

    // ── QUIZ ──
    case "quiz": {
      const sel = answers[idx];
      const isChecked = checked[idx];
      const isCorrect = sel === c.correct;
      const qs = c.questionStyle || {};
      const os = c.optionStyle || {};
      return (
        <div style={{ padding:"20px 0" }}>
          <p style={{ fontSize:qs.fontSize||16, fontWeight:qs.bold?"700":"700", fontStyle:qs.italic?"italic":"normal", textAlign:qs.align||"left", color:"#0f172a", margin:"0 0 16px", lineHeight:1.4 }}>
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

    // ── FILL IN THE BLANK ──
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

    // ── BLANK + OPTIONS ──
    case "blankoptions":
      return <BlankOptionsBlock c={c} idx={idx} checked={checked} setChecked={setChecked} fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}/>;
    case "blankoptions_OLD": {
      const sentence = c.sentence || "";
      const markedWords = c.markedWords || [];
      const blanks = c.blanks || [];
      const words = sentence.split(" ").filter(Boolean);
      const blankCount = markedWords.length;
      const selectedMap = answers["bo_"+idx] || {};
      const isChecked = checked["bo_"+idx];
      const showAns = fillShowAnswer?.["bo_"+idx];
      const allFilled = Object.keys(selectedMap).filter(k => selectedMap[k]!==undefined && selectedMap[k]!==null && selectedMap[k]!=="").length === blankCount;
      const allCorrect = blanks.length > 0 && blanks.every((b,i) => selectedMap[i]===b.correct || selectedMap[String(i)]===b.correct);
      const getOptions = (i) => {
        const b = blanks[i];
        if (!b) return [];
        return [b.correct, b.w1, b.w2, b.w3].filter(Boolean).sort(() => Math.sin(idx*100+i*37) - 0.5);
      };
      const sentenceParts = [];
      words.forEach((word, wi) => {
        if (markedWords.includes(wi)) sentenceParts.push({ type:"blank", blankIdx:markedWords.indexOf(wi) });
        else sentenceParts.push({ type:"word", text:word });
      });
      const ss = c.sentenceStyle || {};

      return (
        <div style={{ padding:"20px 0" }}>
          {/* Sentence with blank slots */}
          <p style={{ fontSize:ss.fontSize||18, fontWeight:ss.bold?"700":"500", textAlign:ss.align||"left", color:"#0f172a", margin:"0 0 28px", lineHeight:2.6 }}>
            {sentenceParts.map((part, i) => {
              if (part.type === "word") return <span key={i}>{part.text} </span>;
              const bi = part.blankIdx;
              const sel = selectedMap[bi] || selectedMap[String(bi)];
              const correct = blanks[bi]?.correct;
              const ok = isChecked && sel === correct;
              const wrong = isChecked && sel !== correct;
              return (
                <span key={i} style={{ display:"inline-block", minWidth:80, padding:"4px 16px", margin:"0 4px", borderRadius:10, border:"2px solid "+(ok?"#22c55e":wrong?"#ef4444":sel?"#111827":"#D1D5DB"), background:"#fff", color:ok?"#166534":wrong?"#991B1B":sel?"#111827":"#9CA3AF", fontWeight:700, fontSize:16, textAlign:"center", verticalAlign:"middle", boxShadow:ok||wrong?"none":sel?"0 2px 0 #111827":"0 2px 0 #D1D5DB" }}>
                  {sel || "_____"}
                </span>
              );
            })}
          </p>

          {/* Options per blank */}
          {!isChecked && (
            <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:16 }}>
              {Array.from({ length: blankCount }, (_, i) => (
                <div key={i}>
                  {blankCount > 1 && (
                    <p style={{ fontSize:11, fontWeight:700, color:"#6B7280", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:0.5 }}>
                      Blank {i+1}
                    </p>
                  )}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {getOptions(i).map((opt, j) => {
                      const sel = selectedMap[String(i)] || selectedMap[i];
                      const isSel = sel === opt;
                      return (
                        <button key={j}
                          onClick={() => setAnswers(p => ({...p, ["bo_"+idx]: {...selectedMap, [String(i)]: sel===opt ? undefined : opt}}))}
                          style={{ padding:"10px 22px", borderRadius:12, border:"2px solid "+(isSel?"#111827":"#E5E7EB"), background:"#fff", color:"#111827", fontSize:15, fontWeight:600, cursor:"pointer", boxShadow:isSel?"0 2px 0 #111827":"0 2px 0 #D1D5DB" }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isChecked && allFilled && (
            <button onClick={() => setChecked(p => ({...p, ["bo_"+idx]: true}))}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"#22c55e", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 0 #16a34a" }}>
              Check
            </button>
          )}

          {isChecked && allCorrect && (
            <div style={{ padding:"16px 18px", borderRadius:14, background:"#F0FDF4", border:"1.5px solid #BBF7D0" }}>
              <p style={{ fontSize:15, fontWeight:700, color:"#166534", margin:0 }}>
                🎉 {blankCount > 1 ? "All correct!" : "Correct!"}
              </p>
              {c.explanation && <p style={{ fontSize:13, color:"#166534", margin:"4px 0 0" }}>{c.explanation}</p>}
            </div>
          )}

          {isChecked && !allCorrect && (
            <div>
              <div style={{ padding:"14px 18px", borderRadius:14, background:"#FEF2F2", border:"1.5px solid #FECACA", marginBottom:10 }}>
                <p style={{ fontSize:15, fontWeight:700, color:"#DC2626", margin:0 }}>❌ Not quite — try again!</p>
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                <button
                  onClick={() => {
                    setChecked(p => ({...p, ["bo_"+idx]: false}));
                    setAnswers(p => ({...p, ["bo_"+idx]: {}}));
                  }}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:14, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Try Again
                </button>
                <button onClick={() => setFillShowAnswer(p => ({...p, ["bo_"+idx]: true}))}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#111827", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                  See Answers
                </button>
              </div>
              {showAns && (
                <div style={{ padding:"14px 16px", borderRadius:12, background:"#F9FAFB", border:"1.5px solid #E5E7EB" }}>
                  {blanks.map((b, i) => (
                    <p key={i} style={{ fontSize:14, color:"#374151", margin:"0 0 4px", fontWeight:600 }}>
                      Blank {i+1}: <strong style={{ color:"#111827" }}>{b.correct}</strong>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // ── KEY POINTS ──
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

    // ── CALLOUT ──
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
          <p style={{ fontSize:ts.fontSize||14, fontWeight:ts.bold?"700":"400", fontStyle:ts.italic?"italic":"normal", textAlign:ts.align||"left", color:"#374151", margin:0, lineHeight:1.65 }}>
            {c.text}
          </p>
        </div>
      );
    }

    // ── DIVIDER ──
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
