"use client";
import { useStreak } from "@/hooks/useStreak";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, CheckCircle2, XCircle, RotateCcw, X, Play } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import CertificateModal from "@/components/courses/CertificateModal";

function renderText(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function FakeImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div style={{ width:"100%",height:220,borderRadius:16,background:"linear-gradient(135deg,#EEF0FF,#C7D2FE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,marginTop:20 }}>🎨</div>;
  return <div style={{ width:"100%",borderRadius:16,overflow:"hidden",marginTop:20,background:"#f3f4f6" }}><img src={src} alt={alt} style={{ width:"100%",objectFit:"cover" }} onError={() => setFailed(true)} /></div>;
}

function ImageCell({ src, alt, h }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div style={{ height:h,borderRadius:16,background:"linear-gradient(135deg,#EEF0FF,#C7D2FE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>🖼️</div>;
  return <div style={{ height:h,borderRadius:16,overflow:"hidden",background:"#f3f4f6" }}><img src={src} alt={alt} style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={() => setFailed(true)} /></div>;
}

function FakeImageGrid({ images }) {
  return (
    <div style={{ marginTop:20,display:"flex",flexDirection:"column",gap:12 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        {images.slice(0,2).map((img,i) => <ImageCell key={i} src={img.src} alt={img.alt} h={140} />)}
      </div>
      {images[2] && <ImageCell src={images[2].src} alt={images[2].alt} h={180} />}
    </div>
  );
}

const CELLS = [
  { bg:"linear-gradient(135deg,#1e3a5f,#0f172a)", emoji:"🧗‍♂️" },
  { bg:"linear-gradient(135deg,#374151,#111827)", emoji:"⛰️" },
  { bg:"linear-gradient(135deg,#1e293b,#0f172a)", emoji:"🏔️" },
  { bg:"linear-gradient(135deg,#312e81,#1e1b4b)", emoji:"🌄" },
];

function ResultImageGrid({ resultImages }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:16 }}>
      {CELLS.map((cell,i) => (
        <div key={i} style={{ height:140,borderRadius:16,background:cell.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,position:"relative",overflow:"hidden" }}>
          <span style={{ position:"relative",zIndex:1 }}>{cell.emoji}</span>
          {resultImages?.[i] && <img src={resultImages[i]} alt="" style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:2 }} onError={(e) => { e.target.style.display="none"; }} />}
        </div>
      ))}
    </div>
  );
}

function FullScreenInteractive({ section, course, onComplete }) {
  const router = useRouter();
  const slotKeys = Object.keys(section.slots);
  const [slots, setSlots] = useState({});
  const [activeSlot, setActiveSlot] = useState(slotKeys[0]);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const allFilled = slotKeys.every((k) => slots[k]);
  const allOptions = [...new Set(Object.values(section.slots).flatMap((s) => s.options))];
  const usedChips = Object.values(slots);

  const handleChip = (chip) => {
    if (!activeSlot || usedChips.includes(chip)) return;
    const next = { ...slots, [activeSlot]: chip };
    setSlots(next);
    const nextEmpty = slotKeys.find((k) => !next[k]);
    setActiveSlot(nextEmpty || slotKeys[slotKeys.length - 1]);
  };
  const handleSlotClick = (slot) => {
    if (result) return;
    if (slots[slot]) { const n={...slots}; delete n[slot]; setSlots(n); setActiveSlot(slot); } else setActiveSlot(slot);
  };
  const handleBackspace = () => {
    const last = [...slotKeys].reverse().find((k) => slots[k]);
    if (last) { const n={...slots}; delete n[last]; setSlots(n); setActiveSlot(last); }
  };
  const handleCheck = () => {
    const ok = slotKeys.every((k) => slots[k] === section.slots[k].correct);
    setResult(ok ? "correct" : "incorrect");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 200);
  };
  const handleSeeAnswer = () => {
    const correct = {}; slotKeys.forEach((k) => (correct[k] = section.slots[k].correct));
    setSlots(correct); setResult("show_answer");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 200);
  };
  const handleTryAgain = () => { setSlots({}); setActiveSlot(slotKeys[0]); setResult(null); };
  const promptText = section.template.map((w) => (w.startsWith("[") ? (slots[w]||w) : w)).join(" ");

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="shrink-0 flex items-center px-5 border-b border-gray-100" style={{ height:56 }}>
        <button onClick={() => router.push(`/courses/${course.id}`)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X size={20} className="text-gray-600" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 20px" }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
          <p className="text-gray-500 text-sm mb-6">{section.instruction}</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-6 border border-gray-100">
            <span className="text-lg">{section.toolEmoji}</span>
            <span className="text-sm font-semibold text-gray-700">{section.toolLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-base">
            {section.template.map((word, i) => {
              if (word.startsWith("[") && word.endsWith("]")) {
                const val = slots[word]; const isActive = activeSlot === word;
                return <button key={i} onClick={() => handleSlotClick(word)} className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${val?"border-primary bg-primary-light text-primary":isActive?"border-primary border-dashed bg-primary-light/40 text-primary":"border-dashed border-gray-300 text-gray-400"}`}>{val||word}</button>;
              }
              return <span key={i} className="text-gray-800">{word}</span>;
            })}
          </div>
          <div ref={resultRef}>
            {result === "correct" && (
              <div style={{ marginTop:32 }}>
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3 flex items-center gap-2">
                  <span style={{ width:24,height:24,borderRadius:"50%",background:"#fbbf24",display:"inline-block",flexShrink:0 }} />
                  <span className="text-sm text-gray-700">{promptText}</span>
                </div>
                <ResultImageGrid resultImages={section.resultImages} />
              </div>
            )}
            {result === "show_answer" && (
              <div style={{ marginTop:24 }}>
                <div style={{ background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:16,padding:20,marginBottom:4 }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#3b82f6",textTransform:"uppercase",letterSpacing:1,marginBottom:12 }}>Correct answer</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {section.template.map((w,i) => w.startsWith("[") ? <span key={i} className="px-3 py-1 bg-primary-light text-primary rounded-lg text-sm font-semibold border border-primary/20">{slots[w]}</span> : <span key={i} className="text-gray-800">{w}</span>)}
                  </div>
                </div>
                <ResultImageGrid resultImages={section.resultImages} />
              </div>
            )}
          </div>
        </div>
      </div>
      {result === "correct" && (
        <div className="shrink-0 bg-white border-t-4 border-green-400">
          <div style={{ maxWidth:560, margin:"0 auto", padding:"16px 20px" }}>
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={18} className="text-green-500" /><span className="font-bold text-gray-900">Amazing!</span></div>
            <p className="text-sm text-gray-500 mb-3">You are right on track with your approach</p>
            <button onClick={onComplete} className="w-full py-3 rounded-xl text-green-600 font-semibold border border-green-200 hover:bg-green-50 transition-all">Continue</button>
          </div>
        </div>
      )}
      {result === "incorrect" && (
        <div className="shrink-0 bg-white border-t-4 border-red-400">
          <div style={{ maxWidth:560, margin:"0 auto", padding:"16px 20px" }}>
            <div className="flex items-center gap-2 mb-1"><XCircle size={18} className="text-red-500" /><span className="font-bold text-gray-900">Incorrect</span></div>
            <p className="text-sm text-gray-500 mb-3">Almost there! Review the steps and try again</p>
            <div className="flex gap-3">
              <button onClick={handleSeeAnswer} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">See answer</button>
              <button onClick={handleTryAgain} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark"><RotateCcw size={14} /> Try again</button>
            </div>
          </div>
        </div>
      )}
      {result === "show_answer" && (
        <div className="shrink-0 bg-white border-t border-gray-100">
          <div style={{ maxWidth:560, margin:"0 auto", padding:"16px 20px" }}>
            <button onClick={onComplete} className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all">Continue</button>
          </div>
        </div>
      )}
      {result === null && (
        <div className="shrink-0 bg-gray-50 border-t border-gray-100">
          <div style={{ maxWidth:560, margin:"0 auto", padding:"16px" }}>
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {allOptions.map((opt) => {
                const isUsed = usedChips.includes(opt);
                return <button key={opt} onClick={() => !isUsed && handleChip(opt)} disabled={isUsed} className={`px-5 py-2.5 rounded-xl text-sm font-medium bg-white border shadow-sm transition-all ${isUsed?"opacity-30 cursor-not-allowed border-gray-100 text-gray-400":"border-gray-200 text-gray-700 hover:border-primary hover:text-primary"}`}>{opt}</button>;
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCheck} disabled={!allFilled} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${allFilled?"bg-primary text-white hover:bg-primary-dark":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>Check</button>
              <button onClick={handleBackspace} className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all"><span className="text-gray-500 text-base">&#9003;</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay, firstJoin }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(1);
  const [interactiveDone, setInteractiveDone] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [retakeSection, setRetakeSection] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const bottomRef = useRef(null);
  const { updateStreak } = useStreak();
  const { markLessonComplete, markCertificateEarned, getCompletedLessons, markChallengeDay } = useProgress();

  const isChallenge = !!challengeId && !!challengeDay;
  const total = content.length;
  const currentSection = content[revealed - 1];
  const isInteractiveActive = currentSection?.type === "interactive" && !interactiveDone;
  const isLastSection = revealed === total;
  const allLessons = course.units.flatMap(u => u.lessons);

  const handleBack = () => {
    if (isChallenge) router.push(`/challenges/${challengeId}?joined=true`);
    else router.push(`/courses/${course.id}`);
  };

  const handleContinue = () => {
    if (revealed < total) {
      setRevealed((p) => p + 1);
      setInteractiveDone(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
    }
  };

  const handleFinish = () => {
    updateStreak(); markLessonComplete(course.id, lesson.id);

    if (isChallenge) {
      markChallengeDay(challengeId, challengeDay);

      if (firstJoin) {
        // First ever join → show "You rock!"
        router.push(`/challenges/${challengeId}?showWelcome=true`);
      } else if (challengeDay % 3 === 0 || challengeDay === course.units.flatMap(u => u.lessons).length) {
        // Every 3rd day → show day complete + rating
        router.push(`/challenges/${challengeId}?joined=true&dayComplete=${challengeDay}`);
      } else {
        // Regular day → back to tracker
        router.push(`/challenges/${challengeId}?joined=true`);
      }
      return;
    }

    // Normal course finish
    const prevCompleted = getCompletedLessons(course.id);
    const newCompleted = new Set([...prevCompleted, lesson.id]);
    const allComplete = allLessons.every(l => newCompleted.has(l.id));
    if (allComplete) {
      markCertificateEarned(course.id);
      setShowCertificate(true);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  const handleRetake = (section) => { setRetakeSection(section); setRetaking(true); };

  if (retaking && retakeSection) return <FullScreenInteractive section={retakeSection} course={course} onComplete={() => { setRetaking(false); setRetakeSection(null); }} />;
  if (isInteractiveActive) return <FullScreenInteractive section={currentSection} course={course} onComplete={() => setInteractiveDone(true)} />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div style={{ maxWidth:672, margin:"0 auto", display:"flex", alignItems:"center", padding:"0 20px", height:56, gap:16 }}>
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          {isChallenge && (
            <div className="shrink-0 bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full">
              Day {challengeDay}
            </div>
          )}
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
            {content.map((_,i) => <div key={i} style={{ borderRadius:999, transition:"all 0.3s", width:i<revealed?24:8, height:8, background:i<revealed?"#5B4EFF":"#e5e7eb" }} />)}
          </div>
          <div style={{ width:40 }} />
        </div>
      </div>

      <div className="flex-1" style={{ maxWidth:672, margin:"0 auto", width:"100%", padding:"24px 20px 120px" }}>
        {content.slice(0, revealed).map((section, idx) => (
          <div key={idx} style={{ marginTop:idx>0?40:0, paddingTop:idx>0?32:0, borderTop:idx>0?"1px solid #f3f4f6":"none", animation:idx===revealed-1?"fadeIn 0.4s ease-out":"none" }}>
            {section.type === "interactive" ? (
              <div style={{ background:"#f9fafb", borderRadius:16, padding:20 }}>
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3"><CheckCircle2 size={12} /> Task completed</span>
                <h3 className="font-bold text-gray-900 text-base mb-1">{section.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{section.instruction}</p>
                <button onClick={() => handleRetake(section)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, background:"#EEF0FF", color:"#5B4EFF", border:"none", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  <Play size={14} /> Repeat task
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                {section.paragraphs?.map((p,pi) => <p key={pi} className="text-base text-gray-700 leading-relaxed mb-4">{renderText(p)}</p>)}
                {section.image && <FakeImage {...section.image} />}
                {section.images && <FakeImageGrid images={section.images} />}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <button className="fixed bottom-24 right-5 w-12 h-12 bg-white border border-gray-200 rounded-2xl shadow-md flex items-center justify-center hover:bg-gray-50 z-30">
        <Flag size={18} className="text-gray-500" />
      </button>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30" style={{ padding:"16px 20px" }}>
        <div style={{ maxWidth:672, margin:"0 auto" }}>
          {isLastSection ? (
            <button onClick={handleFinish} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all">
              {isChallenge ? `Complete Day ${challengeDay}` : "Finish lesson"}
            </button>
          ) : (
            <button onClick={handleContinue} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all">
              Continue
            </button>
          )}
        </div>
      </div>

      {showCertificate && (
        <CertificateModal course={course} onClose={() => { setShowCertificate(false); router.push(`/courses/${course.id}`); }} />
      )}
    </div>
  );
}
