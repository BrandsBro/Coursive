"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Trophy, Lock, Play, Check, Download, Award, RotateCcw } from "lucide-react";
import LessonPopup from "@/components/courses/LessonPopup";
import { useProgress } from "@/hooks/useProgress";

const NODE_SIZE = 80;
const ROW_HEIGHT = 190;
const SVG_W = 480;
const LEFT_CX = 160;
const RIGHT_CX = 400;
const R = 25;
const TOP_PAD = 40;

function makePath(isFromLeft, i) {
  const sx = isFromLeft ? LEFT_CX + NODE_SIZE / 2 : RIGHT_CX - NODE_SIZE / 2;
  const ex = isFromLeft ? RIGHT_CX : LEFT_CX;
  const sy = i * ROW_HEIGHT + TOP_PAD + NODE_SIZE / 2;
  const ey = (i + 1) * ROW_HEIGHT + TOP_PAD;
  if (isFromLeft) return `M${sx} ${sy} L${ex - R} ${sy} Q${ex} ${sy} ${ex} ${sy + R} L${ex} ${ey}`;
  return `M${sx} ${sy} L${ex + R} ${sy} Q${ex} ${sy} ${ex} ${sy + R} L${ex} ${ey}`;
}

function ConfirmReset({ onConfirm, onCancel }) {
  return (
    <div style={{ background:"#FEF2F2", borderRadius:12, padding:12, marginTop:8 }}>
      <p style={{ fontSize:12, color:"#991B1B", margin:"0 0 6px", fontWeight:600 }}>Reset all progress?</p>
      <p style={{ fontSize:11, color:"#B91C1C", margin:"0 0 10px" }}>This will clear all completed lessons. Cannot be undone.</p>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel} style={{ flex:1, padding:"7px", borderRadius:8, border:"1px solid #D1D5DB", background:"#fff", fontSize:12, cursor:"pointer" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, padding:"7px", borderRadius:8, border:"none", background:"#EF4444", color:"#fff", fontSize:12, cursor:"pointer", fontWeight:700 }}>Reset</button>
      </div>
    </div>
  );
}

export default function CourseRoadmap({ course, completedLessons = [], onViewCertificate }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { resetCourse } = useProgress();

  const completedSet = new Set(completedLessons);
  const allLessons = course.units.flatMap(u => u.lessons);
  const totalLessons = allLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const isComplete = progress === 100;

  const isUnlocked = (gi) => {
    if (gi === 0) return true;
    return completedSet.has(allLessons[gi - 1].id);
  };

  // ← KEY: completed lessons are ALWAYS accessible (can revisit)
  const isAccessible = (lesson, gi) => completedSet.has(lesson.id) || isUnlocked(gi);

  const currentGlobalIdx = allLessons.findIndex((l, i) => isUnlocked(i) && !completedSet.has(l.id));

  const starts = course.units.map((_, i) =>
    course.units.slice(0, i).reduce((a, u) => a + u.lessons.length, 0)
  );

  const toggle = (lesson, gi) => {
    if (!isAccessible(lesson, gi)) return; // only locked future lessons are blocked
    setActiveLesson(prev => prev?.id === lesson.id ? null : lesson);
  };

  const handleReset = () => { resetCourse(course.id); setConfirmReset(false); };

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Certificate Sidebar */}
      <div className="lg:w-96 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {isComplete ? (
            <>
              <div className="m-5 rounded-xl p-8 flex flex-col items-center text-center"
                style={{ background:"linear-gradient(135deg,#f5f3ff,#EEF0FF)" }}>
                <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:"0 8px 24px rgba(91,78,255,0.35)" }}>
                  <Trophy size={36} color="#fff" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Certificate Earned! 🏆</h3>
                <p className="text-sm text-gray-500 mb-1">You completed all {totalLessons} lessons</p>
                <p className="text-xs text-primary font-semibold">{course.title}</p>
              </div>
              <div className="px-6 pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width:"100%",background:"linear-gradient(90deg,#5B4EFF,#8B5CF6)" }} />
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">100%</span>
                </div>
                <p className="text-xs text-gray-400 text-center mb-4">{completedLessons.length}/{totalLessons} lessons completed</p>
              </div>
              <div className="px-5 pb-5 flex flex-col gap-3">
                <button onClick={onViewCertificate} style={{ width:"100%",padding:"14px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <Award size={18} /> View Certificate
                </button>
                <button onClick={onViewCertificate} style={{ width:"100%",padding:"12px",borderRadius:14,border:"1.5px solid #E5E7EB",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <Download size={16} /> Download PDF
                </button>
                {!confirmReset
                  ? <button onClick={() => setConfirmReset(true)} style={{ width:"100%",padding:"10px",borderRadius:12,border:"1px dashed #D1D5DB",background:"none",color:"#9CA3AF",fontWeight:500,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                      <RotateCcw size={13} /> Retake course
                    </button>
                  : <ConfirmReset onConfirm={handleReset} onCancel={() => setConfirmReset(false)} />
                }
              </div>
            </>
          ) : (
            <>
              <div className="m-5 bg-gray-50 rounded-xl p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center mb-4">
                  <Lock size={22} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-5">Earn your certificate</h3>
                <div className="w-full h-3 bg-gray-200 rounded-full mb-3" />
                <div className="w-3/4 h-3 bg-gray-200 rounded-full" />
              </div>
              <div className="px-6 pb-5">
                <p className="font-bold text-gray-900 text-sm mb-1.5">You&apos;re on the right track!</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">Keep going and unlock your personalized certificate of completion</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width:`${progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 font-semibold">{progress}%</span>
                </div>
                <p className="text-xs text-gray-400 text-center mb-4">{completedLessons.length}/{totalLessons} lessons completed</p>
                {completedLessons.length > 0 && (
                  !confirmReset
                    ? <button onClick={() => setConfirmReset(true)} style={{ width:"100%",padding:"10px",borderRadius:12,border:"1px dashed #D1D5DB",background:"none",color:"#9CA3AF",fontWeight:500,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                        <RotateCcw size={13} /> Retake from beginning
                      </button>
                    : <ConfirmReset onConfirm={handleReset} onCancel={() => setConfirmReset(false)} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Roadmap */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        {course.units.map((unit, ui) => {
          const svgH = unit.lessons.length * ROW_HEIGHT + TOP_PAD + 80;
          return (
            <div key={unit.id}>
              {ui > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-white rounded-full border border-gray-200 shrink-0">{unit.title}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}
              <div className="relative w-full" style={{ height:svgH }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${SVG_W} ${svgH}`} preserveAspectRatio="none">
                  {unit.lessons.map((lesson, i) => {
                    if (i >= unit.lessons.length - 1) return null;
                    const gi = starts[ui] + i;
                    const done = completedSet.has(lesson.id);
                    const isCur = gi === currentGlobalIdx;
                    const d = makePath(gi % 2 === 0, i);
                    return (
                      <g key={i}>
                        <path d={d} fill="none" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                        {done && <path d={d} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />}
                        {isCur && !done && <path d={d} pathLength="1" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1" style={{ animation:"lineSweepForward 2s linear infinite" }} />}
                      </g>
                    );
                  })}
                </svg>

                {unit.lessons.map((lesson, i) => {
                  const gi = starts[ui] + i;
                  const isLeft = gi % 2 === 0;
                  const done = completedSet.has(lesson.id);
                  const isCur = gi === currentGlobalIdx;
                  const accessible = isAccessible(lesson, gi); // completed OR unlocked
                  const locked = !accessible;
                  const isActive = activeLesson?.id === lesson.id;
                  const cx = isLeft ? LEFT_CX : RIGHT_CX;

                  return (
                    <div key={lesson.id} className="absolute flex flex-col items-center"
                      style={{ left:`calc(${(cx/SVG_W)*100}% - ${NODE_SIZE/2}px)`, top:i*ROW_HEIGHT+TOP_PAD, width:NODE_SIZE }}>

                      {isCur && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-xs font-bold text-gray-800 px-3 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap z-10">
                          {gi === 0 ? "Start" : "Continue"}
                        </div>
                      )}

                      {/* Redo badge for completed lessons */}
                      {done && !isCur && isActive && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-10">
                          Redo
                        </div>
                      )}

                      <div className="relative">
                        {isActive && (
                          <div className={`absolute top-0 z-30 w-64 ${isLeft?"left-[88px]":"right-[88px]"}`}>
                            <LessonPopup lesson={lesson} courseId={course.id} onClose={() => setActiveLesson(null)} />
                          </div>
                        )}

                        <button
                          onClick={() => toggle(lesson, gi)}
                          disabled={locked}
                          className="focus:outline-none"
                          title={done ? "Click to redo this lesson" : locked ? "Complete previous lessons first" : ""}
                        >
                          <div className="flex items-center justify-center transition-all duration-200"
                            style={{
                              width:NODE_SIZE, height:NODE_SIZE, borderRadius:16,
                              background: done ? "#22C55E"
                                : isCur ? "linear-gradient(135deg,#7C3AED,#5B4EFF)"
                                : accessible && lesson.type==="quiz" ? "#FEF3C7"
                                : accessible ? "#EEF0FF"
                                : "#F3F4F6",
                              border: done ? "none"
                                : isCur ? "none"
                                : accessible && lesson.type==="quiz" ? "2px solid #FCD34D"
                                : accessible ? "2px solid rgba(91,78,255,0.2)"
                                : "2px solid #E5E7EB",
                              boxShadow: isCur ? "0 8px 24px rgba(91,78,255,0.35)"
                                : done ? "0 4px 12px rgba(34,197,94,0.3)" : "none",
                              cursor: locked ? "not-allowed" : "pointer",
                              opacity: locked ? 0.4 : 1,
                              animation: isCur ? "nodeRipple 1.5s ease-out infinite" : "none",
                            }}>
                            {done ? <Check size={24} color="#fff" strokeWidth={3} />
                              : isCur ? <Play size={24} color="#fff" fill="#fff" style={{ marginLeft:3 }} />
                              : locked ? <Lock size={20} color="#D1D5DB" />
                              : lesson.type==="quiz" ? <Trophy size={20} color="#F59E0B" />
                              : <BookOpen size={20} color="#5B4EFF" />}
                          </div>
                        </button>
                      </div>

                      <span style={{ fontSize:12,fontWeight:500,textAlign:"center",lineHeight:1.3,marginTop:8,display:"block",width:96,color:locked?"#9CA3AF":done?"#22C55E":"#374151" }}>
                        {lesson.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Up Next</p>
          <p className="text-xs font-bold text-primary mb-2">AI MASTERY • Communicating With AI</p>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Communicating With AI</h3>
          <p className="text-sm text-gray-500 mb-4">Turn AI into a useful thinking partner</p>
          <Link href="/courses" className="block bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            Jump ahead to the next course
          </Link>
        </div>
      </div>
    </div>
  );
}
