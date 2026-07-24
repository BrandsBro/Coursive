"use client";
import { useEffect, useRef } from "react";

export default function AITools() {
  const allCourses = [
    { icon: "🤖", name: "ChatGPT", desc: "Master prompting & automation" },
    { icon: "🎨", name: "Midjourney", desc: "Create stunning AI images" },
    { icon: "✨", name: "Canva AI", desc: "Design like a pro instantly" },
    { icon: "📊", name: "Jasper AI", desc: "Write content 10x faster" },
    { icon: "🎬", name: "RunwayML", desc: "AI video generation" },
    { icon: "🔍", name: "Perplexity", desc: "AI-powered research" },
    { icon: "🧠", name: "Claude", desc: "AI assistant by Anthropic" },
    { icon: "✍️", name: "AI Copywriting", desc: "Write copy that converts" },
    { icon: "💬", name: "Communicating With AI", desc: "Prompt like a pro" },
    { icon: "❤️", name: "Lovable", desc: "Build apps with AI" },
    { icon: "🌐", name: "Omni", desc: "All-in-one AI platform" },
    { icon: "💎", name: "Gemini", desc: "Google's AI powerhouse" },
    { icon: "🖼️", name: "Stable Diffusion", desc: "Open-source image AI" },
    { icon: "🤖", name: "ChatGPT: Deep Dive", desc: "Advanced GPT mastery" },
    { icon: "🔮", name: "DeepSeek", desc: "Next-gen AI research" },
    { icon: "🧠", name: "Claude: Deep Dive", desc: "Advanced Claude mastery" },
    { icon: "⚡", name: "Kling", desc: "AI video creation" },
    { icon: "💻", name: "Claude Code", desc: "Code with Claude AI" },
  ];

  const row1 = allCourses.slice(0, 9);
  const row2 = allCourses.slice(9);

  const Card = ({ t }) => (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        minWidth: 220,
        flexShrink: 0,
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(91,78,255,0.1)";
        e.currentTarget.style.borderColor = "rgba(91,78,255,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(91,78,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {t.icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 3px", whiteSpace: "nowrap" }}>
          {t.name}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, whiteSpace: "nowrap" }}>
          {t.desc}
        </p>
      </div>
    </div>
  );

  const MarqueeRow = ({ items, direction = "left" }) => {
    const doubled = [...items, ...items];
    return (
      <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
        {/* fade edges */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
          background: "linear-gradient(to right, #0d0d1a, transparent)",
          zIndex: 2, pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
          background: "linear-gradient(to left, #0d0d1a, transparent)",
          zIndex: 2, pointerEvents: "none"
        }} />
        <div
          style={{
            display: "flex",
            gap: 12,
            width: "max-content",
            animation: `marquee-${direction} ${items.length * 3}s linear infinite`,
          }}
        >
          {doubled.map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <section style={{ padding: "80px 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40, paddingLeft: 32, paddingRight: 32 }}>
          <p style={{
            textAlign: "center", fontSize: 13, fontWeight: 700,
            color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 8
          }}>MASTER THE WORLD'S</p>
          <h2 style={{
            textAlign: "center", fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 900, color: "#fff", margin: "0 0 8px"
          }}>
            Master the world's <span style={{ color: "#5B4EFF" }}>leading AI tools</span>
          </h2>
          <p style={{
            textAlign: "center", fontSize: 15,
            color: "rgba(255,255,255,0.4)", margin: 0
          }}>
            Practical, step-by-step guides to the software shaping the future of work.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MarqueeRow items={row1} direction="left" />
          <MarqueeRow items={row2} direction="right" />
        </div>
      </section>
    </>
  );
}