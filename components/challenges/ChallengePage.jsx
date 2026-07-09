"use client";
import ChallengeReviews from "@/components/challenges/ChallengeReviews";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, Star, X, Check } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

function BadgeSeal({ size=80, color="#22C55E" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 4 L46 14 L57 10 L58 22 L70 22 L66 33 L77 40 L66 47 L70 58 L58 58 L57 70 L46 66 L40 76 L34 66 L23 70 L22 58 L10 58 L14 47 L3 40 L14 33 L10 22 L22 22 L23 10 L34 14 Z" fill={color}/>
      <path d="M26 40 L35 50 L54 30" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ChallengePage({ challenge }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinChallenge, hasJoinedChallenge, getChallengeCompletedDays, resetChallenge } = useProgress();

  const showWelcome      = searchParams.get("showWelcome") === "true";
  const isJoinedParam    = searchParams.get("joined") === "true";
  const dayCompleteParam = searchParams.get("dayComplete");

  const [phase, setPhase] = useState("loading");
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const completedDaysList = getChallengeCompletedDays(challenge.id);
  const completedDays = new Set(completedDaysList);
  const totalDays = challenge.challengeDays?.length || 0;
  const currentDay = Math.min(completedDaysList.length + 1, totalDays);
  const progress = totalDays > 0 ? Math.round((completedDaysList.length / totalDays) * 100) : 0;

  useEffect(() => {
    if (showWelcome)           { setPhase("joined"); return; }
    if (dayCompleteParam)      { setPhase("dayComplete"); return; }
    if (isJoinedParam || hasJoinedChallenge(challenge.id)) { setPhase("tracker"); return; }
    setPhase("detail");
  }, [showWelcome, dayCompleteParam, isJoinedParam, hasJoinedChallenge(challenge.id)]);

  const handleJoin = () => {
    joinChallenge(challenge.id);
    router.push(`/challenges/${challenge.id}/day/1`);
  };

  const handleGoToDay = (day) => router.push(`/challenges/${challenge.id}/day/${day}`);

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  // ── You Rock (just joined) ──
  if (phase === "joined") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100}/>
          <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3">You rock!</h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Welcome to the {challenge.title}!<br/>Can't wait to see you at the top!
          </p>
        </div>
        <div className="px-5 pb-8">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
            Let's Go
          </button>
        </div>
      </div>
    );
  }

  // ── Day Complete ──
  if (phase === "dayComplete") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100}/>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Day {dayCompleteParam} complete!</h2>
          <p className="text-gray-500 text-base mb-8">Keep up the practice!</p>
        </div>
        <div className="px-5 pb-8">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Detail (not joined) ──
  if (phase === "detail") {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero image with overlaid text */}
        <div style={{
          position: "relative",
          width: "100%",
          height: 280,
          background: challenge.gradientBg,
          overflow: "hidden",
        }}>
          {/* Back button */}
          <button
            onClick={() => router.push('/challenges')}
            style={{
              position: "absolute", top: 14, left: 14, zIndex: 10,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
            <ChevronLeft size={20} color="#fff"/>
          </button>

          {/* Emoji — top right area */}
          <div style={{
            position: "absolute", top: "50%", right: 32,
            transform: "translateY(-60%)",
            fontSize: 90,
            filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.18))",
            lineHeight: 1,
            userSelect: "none",
          }}>
            {challenge.emoji}
          </div>

          {/* Gradient overlay at bottom for text readability */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          }}/>

          {/* Title + subtitle over image */}
          <div style={{
            position: "absolute", bottom: 22, left: 20, right: 20, zIndex: 2,
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px", lineHeight: 1.25,
              textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}>
              {challenge.title}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
              {challenge.subtitle}
            </p>
          </div>
        </div>

        {/* Body content */}
        <div className="max-w-2xl mx-auto px-5 pb-32 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Challenge details</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Duration</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary"/>
                <span className="font-bold text-gray-900">{challenge.days} days</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Level</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"/>
                <span className="font-bold text-gray-900">{challenge.level}</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">How does it work?</h3>
          <p className="text-gray-600 leading-relaxed text-base mb-8">{challenge.description}</p>

          <ChallengeReviews challengeId={challenge.id} challengeName={challenge.title} topOnly={true}/>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30">
          <div className="max-w-2xl mx-auto">
            <button onClick={handleJoin}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
              Join now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tracker (joined) ──
  if (phase === "tracker") {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center px-5 h-14">
            <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-gray-100 rounded-xl mr-4">
              <ChevronLeft size={20} className="text-gray-700"/>
            </button>
            <h1 className="flex-1 text-center font-bold text-gray-900 text-base pr-10 truncate">{challenge.title}</h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{completedDaysList.length}/{totalDays} days done</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width:progress+"%" }}/>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-5 pb-3">
          <div style={{ display:"flex", gap:6, background:"#F1F5F9", borderRadius:14, padding:4 }}>
            {[["overview","📚 Days"]].map(([val,label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                style={{ flex:1, padding:"10px", borderRadius:11, border:"none",
                  background:activeTab===val?"#fff":"transparent",
                  color:activeTab===val?"#0f172a":"#64748B",
                  fontSize:13, fontWeight:700, cursor:"pointer",
                  boxShadow:activeTab===val?"0 2px 8px rgba(0,0,0,0.08)":"none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Days list */}
        {activeTab === "overview" && (
          <div className="max-w-2xl mx-auto px-5 pb-32">
            <div className="flex flex-col gap-2">
              {challenge.challengeDays.map((d) => {
                const isDone = completedDays.has(d.day);
                const isCur = d.day === currentDay;
                const isLocked = d.day > currentDay;
                const clickable = isDone || isCur;
                return (
                  <button key={d.day}
                    onClick={() => clickable ? handleGoToDay(d.day) : null}
                    disabled={isLocked}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                      borderRadius:16, width:"100%", textAlign:"left",
                      border: isCur?"1.5px solid #5B4EFF":isDone?"1px solid #E5E7EB":"1px solid #F3F4F6",
                      background: isCur?"#F9F8FF":"#fff",
                      opacity: isLocked?0.4:1,
                      cursor: clickable?"pointer":"not-allowed" }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#EEF0FF,#E0E7FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
                      {d.emoji}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",margin:0 }}>Day {d.day}:</p>
                      <p style={{ fontSize:13,color:"#6B7280",margin:0 }}>{d.topic}</p>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                      {isDone && <span style={{ fontSize:10,color:"#22C55E",fontWeight:600,background:"#F0FDF4",padding:"2px 8px",borderRadius:20 }}>Done</span>}
                      <div style={{ width:22,height:22,borderRadius:"50%",
                        border:isDone?"none":isCur?"2px solid #5B4EFF":"2px solid #D1D5DB",
                        background:isDone?"#22C55E":isCur?"#5B4EFF":"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center" }}>
                        {isDone && <Check size={10} color="#fff" strokeWidth={3}/>}
                        {isCur && !isDone && <div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }}/>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="max-w-2xl mx-auto px-5 pb-32">
            <ChallengeLeaderboard challenge={challenge}/>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => handleGoToDay(currentDay)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
              {completedDaysList.length === 0 ? "Start Day 1" : `Continue Day ${currentDay}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}