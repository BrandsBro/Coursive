"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Trophy, Music } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useNotifications } from "@/hooks/useNotifications";
import CertificateGenerator from "@/components/courses/CertificateGenerator";

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay, firstJoin }) {
  const router = useRouter();
  const { markLessonComplete, getCompletedLessons, markChallengeDay } = useProgress();
  const { updateStreak } = useStreak();
  const { send: sendNotification } = useNotifications();

  const safeContent = Array.isArray(content) && content.length > 0 ? content : [];
  const hasContent = safeContent.length > 0;

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
  const audioRef = useRef(null);
  const autoStartedRef = useRef(false);

  const allLessons = (course?.units || []).flatMap(u => u.lessons || []);
  const currentIdx = allLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];
  const isComplete = (getCompletedLessons(course?.id) || []).includes(lesson?.id);

  const extractText = (blocks) => {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";
    return blocks.map(b => {
      const c = b.content || b;
      switch (b.type) {
        case "heading":   return c.text || "";
        case "text":      return c.text || "";
        case "quiz":      return (c.question || "") + ". Options: " + (c.options||[]).join(", ");
        case "fillblank": return (c.prompt || "").replace("___", "blank");
        case "keypoints": return (c.title || "Key points") + ": " + (c.points || []).filter(Boolean).join(". ");
        case "callout":   return c.text || "";
        case "blankoptions": return c.sentence || "";
        default: return "";
      }
    }).filter(Boolean).join(". ");
  };

  const doListen = async () => {
    const text = extractText(safeContent);
    if (!text) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsReading(false);
      return;
    }
    await doListen();
  };

  // Auto-start if mode=listen
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
      if (nextDay <= totalDays) {
        router.push("/challenges/" + challengeId + "/day/" + nextDay);
      } else {
        router.push("/challenges/" + challengeId + "?joined=true");
      }
    } else if (nextLesson) {
      router.push("/courses/" + course.id + "/lessons/" + nextLesson.id + "?mode=" + mode);
    } else {
      router.push("/courses/" + course.id);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>

      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", height:58, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 20px", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link href={challengeId ? "/challenges/"+challengeId : "/courses/"+(course?.id||"")} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600 }}>
          <ChevronLeft size={16}/> {challengeId ? "Back to Challenge" : course?.title}
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min read</span>
          <button
            onClick={handleListen}
            disabled={!hasContent || isLoading}
            style={{
              display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              borderRadius:10, border:"1.5px solid #E2E8F0",
              background: isReading ? "#0891b2" : isLoading ? "#e0f2fe" : "#fff",
              color: isReading ? "#fff" : "#0891b2",
              fontSize:12, fontWeight:700,
              cursor: hasContent && !isLoading ? "pointer" : "not-allowed",
              opacity: hasContent ? 1 : 0.5,
              transition:"all 0.2s",
            }}
          >
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

      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, margin:"0 0 8px" }}>{(course?.title || "").toUpperCase()}</p>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{lesson?.title}</h1>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min</span>
            <span style={{ fontSize:12, color:"#94A3B8" }}>·</span>
            <span style={{ fontSize:12, color:"#94A3B8", textTransform:"capitalize" }}>{lesson?.type || "lesson"}</span>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {!hasContent && (
            <div style={{ textAlign:"center", padding:"60px 20px", background:"#fff", borderRadius:24, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>Content coming soon</h3>
              <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>This lesson is being built. Check back soon!</p>
            </div>
          )}
          {safeContent.map((block, idx) => (
            <ContentBlock key={block.id || idx} block={block} idx={idx}
              answers={answers} setAnswers={setAnswers}
              checked={checked} setChecked={setChecked}
              fillInputs={fillInputs} setFillInputs={setFillInputs}
              fillChecked={fillChecked} setFillChecked={setFillChecked}
              fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
            />
          ))}
        </div>

        <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
          {prevLesson ? (
            <Link href={challengeId ? "/challenges/" + challengeId + "/day/" + (parseInt(lesson?.id?.split("_day_").pop()) - 1) : "/courses/" + course.id + "/lessons/" + prevLesson.id + "?mode=" + mode} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600 }}>
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
        </div>
      </div>

      {showComplete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, padding:"40px 36px", textAlign:"center", maxWidth:380, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Lesson Complete!</h2>
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px" }}>
              {nextLesson ? 'Up next: "' + nextLesson.title + '"' : "You've finished this course!"}
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

      {showCert && (
        <CertificateGenerator course={course} userName="" completedDate={new Date().toISOString()} onClose={() => setShowCert(false)}/>
      )}

    </div>
  );
}

function ContentBlock({ block, idx, answers, setAnswers, checked, setChecked, fillInputs, setFillInputs, fillChecked, setFillChecked, fillShowAnswer, setFillShowAnswer }) {
  const c = block.content || block;

  switch (block.type) {
    case "heading": {
      const sz = c.level==="h1"?28:c.level==="h2"?22:18;
      return <div style={{ fontSize:sz, fontWeight:900, color:"#0f172a", lineHeight:1.25 }}>{c.text}</div>;
    }
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
              <iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+ytId} style={{ border:"none", display:"block" }} allowFullScreen/>
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
        <div style={{ borderRadius:16, padding:"16px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Music size={20} color="#374151"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:13, color:"#64748B", margin:0 }}>{c.caption}</p>}
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
        <div style={{ borderRadius:16, padding:"20px 0" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", margin:"0 0 12px", letterSpacing:0.5, textTransform:"uppercase" }}>🎯 Quiz</p>
          <p style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 16px", lineHeight:1.4 }}>{c.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {(c.options||[]).map((opt, i) => {
              let bg="#fff", border="#E2E8F0", color="#374151";
              if (isChecked) {
                if (i===c.correct) { bg="#F0FDF4"; border="#86efac"; color="#166534"; }
                else if (i===sel) { bg="#FEF2F2"; border="#fca5a5"; color="#991B1B"; }
              } else if (sel===i) { bg="#EEF2FF"; border="#6366f1"; color="#4338CA"; }
              return (
                <button key={i} onClick={() => !isChecked && setAnswers(p=>({...p,[idx]:i}))} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid "+border, background:bg, color, fontSize:14, cursor:isChecked?"default":"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:24, height:24, borderRadius:"50%", border:"2px solid "+border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700 }}>
                    {isChecked&&i===c.correct?"✓":isChecked&&i===sel&&!isCorrect?"✕":String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {!isChecked && sel!==undefined && (
            <button onClick={() => setChecked(p=>({...p,[idx]:true}))} style={{ padding:"11px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Check Answer
            </button>
          )}
          {isChecked && (
            <div style={{ padding:"12px 16px", borderRadius:12, background:isCorrect?"#F0FDF4":"#FEF2F2", border:"1.5px solid "+(isCorrect?"#86efac":"#fca5a5") }}>
              <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#991B1B", margin:"0 0 4px" }}>{isCorrect?"🎉 Correct!":"❌ Not quite"}</p>
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
      return (
        <div style={{ borderRadius:16, padding:"20px 0" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#6366f1", margin:"0 0 12px", letterSpacing:0.5, textTransform:"uppercase" }}>✏️ Fill in the blank</p>
          <p style={{ fontSize:16, color:"#0f172a", margin:"0 0 16px", lineHeight:1.6 }}>
            {(c.prompt||"").split("___").map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length-1 && (
                <input value={val} onChange={e => !isChecked && setFillInputs(p => ({...p,[idx]:e.target.value}))} onKeyDown={e => e.key==="Enter" && val && !isChecked && setFillChecked(p=>({...p,[idx]:true}))} placeholder="type answer..." disabled={isChecked} style={{ display:"inline-block", width:160, border:"none", borderBottom:"2px solid "+(isChecked?isCorrect?"#22c55e":"#ef4444":"#db2777"), outline:"none", fontSize:16, fontWeight:700, color:isChecked?isCorrect?"#166534":"#991B1B":"#db2777", textAlign:"center", background:"transparent", padding:"2px 4px" }}/>
              )}</span>
            ))}
          </p>
          {c.hint && !isChecked && <p style={{ fontSize:13, color:"#be185d", margin:"0 0 14px" }}>💡 Hint: {c.hint}</p>}
          {!isChecked && val && <button onClick={() => setFillChecked(p=>({...p,[idx]:true}))} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#db2777,#9d174d)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Check</button>}
          {isChecked && (
            <div>
              {isCorrect ? (
                <div>
                  <div style={{ padding:"12px 16px", borderRadius:12, background:"#F0FDF4", border:"1.5px solid #86efac", marginBottom:16 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#166534", margin:"0 0 2px" }}>🎉 Correct!</p>
                    <p style={{ fontSize:13, color:"#166534", margin:0 }}>Great job!</p>
                  </div>
                  {c.successImage && <div style={{ borderRadius:16, overflow:"hidden", marginBottom:12 }}><img src={c.successImage} alt="Success" style={{ width:"100%", display:"block", borderRadius:16 }}/></div>}
                  {c.successVideo && <div style={{ borderRadius:16, overflow:"hidden", marginBottom:12, aspectRatio:"16/9", background:"#000" }}>{c.successVideo.includes("youtube")||c.successVideo.includes("youtu.be")?<iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+(c.successVideo.split("v=")[1]?.split("&")[0]||c.successVideo.split("youtu.be/")[1]?.split("?")[0])} style={{ border:"none", display:"block" }} allowFullScreen/>:<video src={c.successVideo} controls autoPlay style={{ width:"100%", height:"100%" }}/>}</div>}
                </div>
              ) : (
                <div>
                  <div style={{ padding:"12px 16px", borderRadius:12, background:"#FEF2F2", border:"1.5px solid #fca5a5", marginBottom:14 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#991B1B", margin:"0 0 2px" }}>❌ Not quite!</p>
                    <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>Give it another shot or peek at the answer.</p>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => { setFillChecked(p=>({...p,[idx]:false})); setFillInputs(p=>({...p,[idx]:""})); }} style={{ flex:1, padding:"11px", borderRadius:11, border:"1.5px solid #FBCFE8", background:"#fff", fontSize:13, fontWeight:700, color:"#db2777", cursor:"pointer" }}>🔄 Try Again</button>
                    <button onClick={() => setFillShowAnswer(p=>({...p,[idx]:true}))} style={{ flex:1, padding:"11px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#374151,#1f2937)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>👁 See Answer</button>
                  </div>
                  {showAnswer && <div style={{ marginTop:12, padding:"12px 16px", borderRadius:12, background:"#F8FAFC", border:"1.5px solid #E2E8F0" }}><p style={{ fontSize:13, color:"#374151", margin:0 }}>✅ The answer is: <strong style={{ color:"#166534" }}>{c.answer}</strong></p></div>}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    case "blankoptions": {
      const sentence = c.sentence || "";
      const markedWords = c.markedWords || [];
      const blanks = c.blanks || [];
      const words = sentence.split(" ").filter(Boolean);
      const blankCount = markedWords.length;
      const selectedMap = answers["bo_"+idx] || {};
      const isChecked = checked["bo_"+idx];
      const showAns = fillShowAnswer?.["bo_"+idx];
      const allFilled = Object.keys(selectedMap).filter(k=>selectedMap[k]!==undefined && selectedMap[k]!==null && selectedMap[k]!=="").length === blankCount;
      const allCorrect = blanks.length > 0 && blanks.every((b,i) => selectedMap[i] === b.correct || selectedMap[String(i)] === b.correct);
      const getOptions = (i) => { const b = blanks[i]; if (!b) return []; return [b.correct, b.w1, b.w2, b.w3].filter(Boolean).sort(() => Math.sin(idx*100+i*37) - 0.5); };
      const sentenceParts = [];
      words.forEach((word, wi) => { if (markedWords.includes(wi)) { sentenceParts.push({ type:"blank", blankIdx:markedWords.indexOf(wi) }); } else { sentenceParts.push({ type:"word", text:word }); } });
      return (
        <div style={{ background:"#F0F9FF", borderRadius:20, padding:24, border:"1.5px solid #BAE6FD" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#0369a1", margin:"0 0 16px", letterSpacing:0.5 }}>✏️ FILL IN THE BLANK{blankCount>1?"S":""}</p>
          <p style={{ fontSize:18, color:"#0f172a", margin:"0 0 24px", lineHeight:2.2, fontWeight:500 }}>
            {sentenceParts.map((part, i) => (
              <span key={i}>{part.type==="word"?part.text+" ":<span style={{ display:"inline-block", minWidth:90, padding:"4px 14px", margin:"0 3px", borderRadius:10, border:isChecked?"2px solid "+((selectedMap[part.blankIdx]||selectedMap[String(part.blankIdx)])===blanks[part.blankIdx]?.correct?"#22c55e":"#ef4444"):selectedMap[part.blankIdx]?"2px solid #0891b2":"2px dashed #93c5fd", background:isChecked?(selectedMap[part.blankIdx]===blanks[part.blankIdx]?.correct?"#F0FDF4":"#FEF2F2"):selectedMap[part.blankIdx]?"#E0F2FE":"#fff", color:isChecked?(selectedMap[part.blankIdx]===blanks[part.blankIdx]?.correct?"#166534":"#991B1B"):selectedMap[part.blankIdx]?"#0369a1":"#94A3B8", fontWeight:700, fontSize:17, textAlign:"center", transition:"all 0.2s" }}>{selectedMap[part.blankIdx]||selectedMap[String(part.blankIdx)]||"______"}</span>}</span>
            ))}
          </p>
          {!isChecked && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
              {Array.from({ length: blankCount }, (_, i) => (
                <div key={i}>
                  {blankCount > 1 && <p style={{ fontSize:11, fontWeight:700, color:"#0369a1", margin:"0 0 8px" }}>BLANK {i+1}</p>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {getOptions(i).map((opt,j) => <button key={j} onClick={() => setAnswers(p=>({...p,["bo_"+idx]:{...selectedMap,[String(i)]:selectedMap[String(i)]===opt?undefined:opt}}))} style={{ padding:"11px 22px", borderRadius:12, border:(selectedMap[String(i)]===opt||selectedMap[i]===opt)?"2px solid #0891b2":"2px solid #BAE6FD", background:(selectedMap[String(i)]===opt||selectedMap[i]===opt)?"#E0F2FE":"#fff", color:(selectedMap[String(i)]===opt||selectedMap[i]===opt)?"#0369a1":"#374151", fontSize:15, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>{opt}</button>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isChecked && allFilled && <button onClick={() => setChecked(p=>({...p,["bo_"+idx]:true}))} style={{ padding:"12px 28px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#0891b2,#0369a1)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Check Answer ✓</button>}
          {isChecked && (
            <div>
              {allCorrect ? (
                <div>
                  <div style={{ padding:"14px 18px", borderRadius:14, background:"#F0FDF4", border:"2px solid #86efac", marginBottom:16 }}>
                    <p style={{ fontSize:16, fontWeight:800, color:"#166534", margin:"0 0 2px" }}>🎉 {blankCount>1?"All correct!":"Correct!"}</p>
                    {c.explanation && <p style={{ fontSize:13, color:"#166534", margin:0 }}>{c.explanation}</p>}
                  </div>
                  {c.successText && <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0F9FF", border:"1.5px solid #BAE6FD", marginBottom:12 }}><p style={{ fontSize:14, color:"#0369a1", margin:0, lineHeight:1.65 }}>{c.successText}</p></div>}
                  {(c.successImages||[]).filter(Boolean).map((url,i) => <img key={i} src={url} alt="" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:12 }}/>)}
                  {(c.successVideos||[]).filter(Boolean).map((url,i) => <div key={i} style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9", background:"#000", marginBottom:12 }}>{url.includes("youtube")||url.includes("youtu.be")?<iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+(url.split("v=")[1]?.split("&")[0]||url.split("youtu.be/")[1]?.split("?")[0])} style={{ border:"none" }} allowFullScreen/>:<video src={url} controls autoPlay style={{ width:"100%",height:"100%" }}/>}</div>)}
                </div>
              ) : (
                <div>
                  <div style={{ padding:"14px 18px", borderRadius:14, background:"#FEF2F2", border:"2px solid #fca5a5", marginBottom:14 }}>
                    <p style={{ fontSize:16, fontWeight:800, color:"#991B1B", margin:"0 0 2px" }}>❌ Not quite!</p>
                    <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>Try again!</p>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => { setChecked(p=>({...p,["bo_"+idx]:false})); setAnswers(p=>({...p,["bo_"+idx]:{}})); }} style={{ flex:1, padding:"12px", borderRadius:12, border:"2px solid #BAE6FD", background:"#fff", fontSize:14, fontWeight:700, color:"#0891b2", cursor:"pointer" }}>🔄 Try Again</button>
                    <button onClick={() => setFillShowAnswer(p=>({...p,["bo_"+idx]:true}))} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#1f2937", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>👁 See Answers</button>
                  </div>
                  {showAns && (
                    <div style={{ marginTop:12 }}>
                      <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0FDF4", border:"1.5px solid #86efac", marginBottom:12 }}>
                        {blanks.map((b,i) => <p key={i} style={{ fontSize:14, color:"#166534", margin:"0 0 4px", fontWeight:600 }}>Blank {i+1}: <strong>{b.correct}</strong></p>)}
                      </div>
                      {c.successText && <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0F9FF", border:"1.5px solid #BAE6FD", marginBottom:12 }}><p style={{ fontSize:14, color:"#0369a1", margin:0, lineHeight:1.65 }}>{c.successText}</p></div>}
                      {(c.successImages||[]).filter(Boolean).map((url,si) => <img key={si} src={url} alt="" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:12 }}/>)}
                      {(c.successVideos||[]).filter(Boolean).map((url,si) => <div key={si} style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9", background:"#000", marginBottom:12 }}>{url.includes("youtube")||url.includes("youtu.be")?<iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+(url.split("v=")[1]?.split("&")[0]||url.split("youtu.be/")[1]?.split("?")[0])} style={{ border:"none" }} allowFullScreen/>:<video src={url} controls style={{ width:"100%", height:"100%" }}/>}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    case "keypoints":
      return (
        <div style={{ borderRadius:16, padding:"20px 0" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>⭐ {c.title||"Key Takeaways"}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(c.points||[]).filter(Boolean).map((pt, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#6366f1", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "callout": {
      const map = { info:["💡","#0891b2","#ECFEFF","#a5f3fc"], warning:["⚠️","#d97706","#FFFBEB","#fde68a"], success:["✅","#059669","#ECFDF5","#a7f3d0"], error:["❌","#dc2626","#FEF2F2","#fecaca"] };
      const [emoji, color, bg, border] = map[c.style||"info"];
      return <div style={{ padding:"14px 18px", borderRadius:12, background:"#F8FAFC", borderLeft:"4px solid "+color, display:"flex", gap:12 }}><span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span><p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.65 }}>{c.text}</p></div>;
    }
    case "divider":
      return c.style==="dots"?<div style={{ textAlign:"center", color:"#CBD5E1", fontSize:18, letterSpacing:10, padding:"8px 0" }}>• • •</div>:c.style==="space"?<div style={{ height:24 }}/>:<hr style={{ border:"none", borderTop:"2px solid #F1F5F9", margin:0 }}/>;
    default:
      if (c.text) return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0 }}>{c.text}</p>;
      return null;
  }
}
