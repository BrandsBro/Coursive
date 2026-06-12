"use client";
import ChallengeReviews from "@/components/challenges/ChallengeReviews";
import ChallengeLeaderboard from "@/components/challenges/ChallengeLeaderboard";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, CheckCircle2, Star, X, Check, RotateCcw } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

function BadgeSeal({ size = 80, color = "#22C55E" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 4 L46 14 L57 10 L58 22 L70 22 L66 33 L77 40 L66 47 L70 58 L58 58 L57 70 L46 66 L40 76 L34 66 L23 70 L22 58 L10 58 L14 47 L3 40 L14 33 L10 22 L22 22 L23 10 L34 14 Z" fill={color} />
      <path d="M26 40 L35 50 L54 30" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarRatingInput({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:8 }}>
      {[1,2,3,4,5].map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
          <Star size={32} color="#F59E0B" fill={n<=value?"#F59E0B":"none"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function ConfirmReset({ onConfirm, onCancel }) {
  return (
    <div style={{ background:"#FEF2F2",borderRadius:12,padding:14,margin:"12px 0" }}>
      <p style={{ fontSize:13,color:"#991B1B",fontWeight:700,margin:"0 0 4px" }}>Restart challenge?</p>
      <p style={{ fontSize:12,color:"#B91C1C",margin:"0 0 12px" }}>All day progress will be cleared. Cannot be undone.</p>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={onCancel} style={{ flex:1,padding:"8px",borderRadius:8,border:"1px solid #D1D5DB",background:"#fff",fontSize:13,cursor:"pointer" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1,padding:"8px",borderRadius:8,border:"none",background:"#EF4444",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700 }}>Restart</button>
      </div>
    </div>
  );
}

export default function ChallengePage({ challenge }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const showWelcome      = searchParams.get("showWelcome")  === "true";
  const isJoinedParam    = searchParams.get("joined")       === "true";
  const dayCompleteParam = searchParams.get("dayComplete");

  const { joinChallenge, hasJoinedChallenge, getChallengeCompletedDays, resetChallenge } = useProgress();

  const [activeTab, setActiveTab] = useState("overview");
  const [phase, setPhase] = useState("detail");
  const [rating, setRating] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);

  const completedDaysList = getChallengeCompletedDays(challenge.id);
  const completedDays     = new Set(completedDaysList);
  const totalDays         = challenge.challengeDays.length;
  const currentDay        = Math.min(completedDaysList.length + 1, totalDays);
  const progress          = Math.round((completedDaysList.length / totalDays) * 100);

  useEffect(() => {
    if (showWelcome)            setPhase("joined");
    else if (dayCompleteParam)  setPhase("dayComplete");
    else if (isJoinedParam || hasJoinedChallenge(challenge.id)) setPhase("tracker");
  }, [showWelcome, dayCompleteParam, isJoinedParam]);

  const handleJoin = () => {
    joinChallenge(challenge.id);
    const day1 = challenge.challengeDays[0];
    router.push(`/challenges/${challenge.id}/day/1`);
  };

  const handleLetsGo = () => router.push(`/challenges/${challenge.id}?joined=true`);
  const handleRatingContinue = () => { setRating(0); router.push(`/challenges/${challenge.id}?joined=true`); };

  // ← Any accessible day (done OR current) can be started
  const handleGoToDay = (day) => {
    const d = challenge.challengeDays[day - 1];
    router.push(`/challenges/${challenge.id}/day/${day}`);
  };

  const handleReset = () => { resetChallenge(challenge.id); setConfirmReset(false); };

  /* ── YOU ROCK ── */
  if (phase === "joined") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100} />
          <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3">You rock!</h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Welcome to the {challenge.title}!<br />Can&apos;t wait to see you at the top!
          </p>
        </div>
        <div className="px-5 pb-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={handleLetsGo} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all">
              Let&apos;s Go
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DAY COMPLETE + RATING ── */
  if (phase === "dayComplete") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={handleRatingContinue} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100} />
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Day {dayCompleteParam} complete!</h2>
          <p className="text-gray-500 text-base mb-8">Keep up the practice to maintain your progress!</p>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background:"#F9FAFB" }}>
            <div className="flex justify-center mb-3"><StarRatingInput value={rating} onChange={setRating} /></div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Not my thing</span>
              <span className="text-xs text-gray-400">Loved it!</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-8">
          <div className="max-w-2xl mx-auto">
            <button onClick={handleRatingContinue} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all">Continue</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DETAIL ── */
  if (phase === "detail") {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center px-5 h-14">
            <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-4"><ChevronLeft size={20} className="text-gray-700" /></button>
            <h1 className="flex-1 text-center font-bold text-gray-900 text-base pr-10 truncate">{challenge.title}</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-12">
          <div className="w-full rounded-2xl flex items-center justify-center mt-6 mb-6" style={{ height:220,background:challenge.gradientBg,fontSize:80 }}>
            <span style={{ filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>{challenge.emoji}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{challenge.title}</h2>
          <p className="text-gray-500 text-base mb-5">{challenge.subtitle}</p>
          <button onClick={handleJoin} className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all mb-8">Join now</button>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Challenge details</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Duration</p>
              <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /><span className="font-bold text-gray-900">{challenge.days} days</span></div>
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Level</p>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="font-bold text-gray-900">{challenge.level}</span></div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">How does it work?</h3>
          <p className="text-gray-600 leading-relaxed text-base mb-8">{challenge.description}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-4">What students say</h3>
          <ChallengeReviews challengeId={challenge.id} challengeName={challenge.title} topOnly={true}/>
      </div>

      <div className="max-w-2xl mx-auto w-full px-5 pb-24">
        <div className="flex flex-col gap-2">
          {challenge.challengeDays.map((d) => {
            const isDone   = completedDays.has(d.day);
            const isCur    = d.day === currentDay;
            const isLocked = d.day > currentDay;
            // ← KEY: completed AND current days are clickable
            const clickable = isDone || isCur;

            return (
              <button
                key={d.day}
                onClick={() => clickable ? handleGoToDay(d.day) : null}
                disabled={isLocked}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"14px 16px", borderRadius:16, width:"100%", textAlign:"left",
                  border: isCur ? "1.5px solid #5B4EFF" : isDone ? "1px solid #E5E7EB" : "1px solid #F3F4F6",
                  background: isCur ? "#F9F8FF" : "#fff",
                  opacity: isLocked ? 0.4 : 1,
                  cursor: clickable ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
                className={clickable ? "hover:shadow-sm" : ""}
              >
                <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#EEF0FF,#E0E7FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
                  {d.emoji}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",margin:0 }}>Day {d.day}:</p>
                  <p style={{ fontSize:13,color:"#6B7280",margin:0 }}>{d.topic}</p>
                </div>

                {/* Status indicator */}
                <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                  {isDone && (
                    <span style={{ fontSize:10,color:"#22C55E",fontWeight:600,background:"#F0FDF4",padding:"2px 8px",borderRadius:20 }}>
                      Redo
                    </span>
                  )}
                  <div style={{ width:22,height:22,borderRadius:"50%",border:isDone?"none":isCur?"2px solid #5B4EFF":"2px solid #D1D5DB",background:isDone?"#22C55E":isCur?"#5B4EFF":"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {isDone && <Check size={10} color="#fff" strokeWidth={3} />}
                    {isCur && !isDone && <div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => handleGoToDay(currentDay)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-all">
            {completedDays.size === 0 ? "Start now" : `Start Day ${currentDay}`}
          </button>
        </div>
      </div>
          {/* Tabs */}
      <div style={{ display:"flex", gap:6, background:"#F1F5F9", borderRadius:14, padding:4, marginTop:24 }}>
        {[["overview","📚 Overview"],["leaderboard","🏆 Leaderboard"]].map(([val,label]) => (
          <button key={val} onClick={() => setActiveTab(val)} style={{ flex:1, padding:"10px", borderRadius:11, border:"none", background:activeTab===val?"#fff":"transparent", color:activeTab===val?"#0f172a":"#64748B", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:activeTab===val?"0 2px 8px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "leaderboard" && (
        <div style={{ marginTop:20 }}>
          <ChallengeLeaderboard challenge={challenge}/>
        </div>
      )}
    </div>
  );
}