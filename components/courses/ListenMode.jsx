"use client";

import { useState, useEffect } from "react";
import {
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, Settings, ChevronDown, X, Mic
} from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

function extractText(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks.map(b => {
    const c = b.content || b;
    switch (b.type) {
      case "heading":   return c.text || "";
      case "text":      return c.text || "";
      case "quiz":      return `Quiz question: ${c.question || ""}. Options: ${(c.options||[]).join(", ")}.`;
      case "fillblank": return `Fill in the blank: ${(c.prompt||"").replace("___","blank")}.`;
      case "keypoints": return `Key points: ${(c.points||[]).filter(Boolean).join(". ")}.`;
      case "callout":   return c.text || "";
      default: return "";
    }
  }).filter(Boolean).join(" ");
}

export default function ListenMode({ lesson, content, onClose }) {
  const {
    speaking, paused, progress,
    voices, selectedVoice, rate, pitch,
    setSelectedVoice, setRate, setPitch,
    speak, pause, resume, stop,
  } = useTextToSpeech();

  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);

  const text = extractText(content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estMins = Math.ceil(wordCount / (rate * 150));

  const handlePlay = () => {
    if (!started) { setStarted(true); speak(text); return; }
    if (paused) { resume(); return; }
    speak(text);
  };

  const handleRestart = () => { setStarted(true); speak(text); };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.92)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(12px)" }}>
      <div style={{ width:"100%", maxWidth:520, display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mic size={18} color="#fff"/>
            </div>
            <div>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:1, margin:0 }}>LISTEN MODE</p>
              <p style={{ color:"#fff", fontSize:14, fontWeight:700, margin:0 }}>{lesson?.title}</p>
            </div>
          </div>
          <button onClick={() => { stop(); onClose(); }} style={{ width:34, height:34, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={16} color="rgba(255,255,255,0.7)"/>
          </button>
        </div>

        {/* Main card */}
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:24, border:"1px solid rgba(255,255,255,0.1)", padding:"28px 28px 24px", backdropFilter:"blur(20px)" }}>

          {/* Animated waveform */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, height:60, marginBottom:24 }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{
                width:3, borderRadius:999,
                background: speaking && !paused
                  ? `linear-gradient(to top,#0891b2,#06b6d4)`
                  : "rgba(255,255,255,0.15)",
                height: speaking && !paused
                  ? `${20 + Math.sin(i * 0.8 + Date.now() / 200) * 20}%`
                  : "20%",
                transition:"height 0.1s ease",
                animation: speaking && !paused ? `wave ${0.6 + i * 0.05}s ease-in-out infinite alternate` : "none",
              }}/>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>
                {speaking ? `${progress}% complete` : started ? "Paused" : "Ready to play"}
              </span>
              <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>~{estMins} min</span>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,0.1)", borderRadius:999, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#0891b2,#06b6d4)", width:`${progress}%`, transition:"width 0.3s ease" }}/>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
            <button onClick={handleRestart} style={ctrlBtn(false)}>
              <SkipBack size={18}/>
            </button>

            {speaking && !paused ? (
              <button onClick={pause} style={ctrlBtn(true)}>
                <Pause size={24} fill="#fff"/>
              </button>
            ) : (
              <button onClick={handlePlay} disabled={!text} style={ctrlBtn(true, !text)}>
                <Play size={24} fill="#fff" style={{ marginLeft:2 }}/>
              </button>
            )}

            <button onClick={stop} style={ctrlBtn(false)}>
              <Square size={18}/>
            </button>
          </div>
        </div>

        {/* Speed + Voice settings */}
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:18, border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden" }}>
          <button onClick={() => setShowSettings(!showSettings)} style={{ width:"100%", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Settings size={15} color="rgba(255,255,255,0.6)"/>
              <span style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600 }}>Voice Settings</span>
            </div>
            <ChevronDown size={15} color="rgba(255,255,255,0.4)" style={{ transform:showSettings?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s" }}/>
          </button>

          {showSettings && (
            <div style={{ padding:"4px 20px 20px", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", gap:16 }}>

              {/* Speed */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <label style={{ color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600 }}>Speed</label>
                  <span style={{ color:"#06b6d4", fontSize:12, fontWeight:700 }}>{rate}x</span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {[0.75, 1, 1.25, 1.5, 2].map(r => (
                    <button key={r} onClick={() => setRate(r)} style={{ flex:1, padding:"7px 4px", borderRadius:9, border:`1.5px solid ${rate===r?"#0891b2":"rgba(255,255,255,0.1)"}`, background:rate===r?"rgba(8,145,178,0.2)":"rgba(255,255,255,0.05)", color:rate===r?"#06b6d4":"rgba(255,255,255,0.5)", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      {r}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice selector */}
              {voices.length > 0 && (
                <div>
                  <label style={{ color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>Voice</label>
                  <select
                    value={selectedVoice?.name || ""}
                    onChange={e => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.8)", fontSize:13, outline:"none" }}
                  >
                    {voices.filter(v => v.lang.startsWith("en")).map(v => (
                      <option key={v.name} value={v.name} style={{ background:"#1e293b" }}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!text && (
                <p style={{ color:"#f97316", fontSize:12, margin:0 }}>⚠️ No readable content found in this lesson yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Word count info */}
        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:12, margin:0 }}>
          {wordCount} words · Web Speech API · No internet required
        </p>
      </div>

      <style>{`
        @keyframes wave {
          from { transform: scaleY(1); }
          to   { transform: scaleY(2.5); }
        }
      `}</style>
    </div>
  );
}

const ctrlBtn = (primary, disabled) => ({
  width: primary ? 64 : 48,
  height: primary ? 64 : 48,
  borderRadius: "50%",
  border: "none",
  background: primary
    ? disabled ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#0891b2,#06b6d4)"
    : "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: primary && !disabled ? "0 8px 24px rgba(8,145,178,0.4)" : "none",
  opacity: disabled ? 0.5 : 1,
});
