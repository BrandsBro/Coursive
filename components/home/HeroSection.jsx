"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const AI_ICONS = [
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371228272-Ai-icon-01.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371229798-Ai-icon-02.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371230802-Ai-icon-03.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371232005-Ai-icon-04.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371233722-Ai-icon-05.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371234998-Ai-icon-06.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371236190-Ai-icon-07.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371237247-Ai-icon-08.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371238278-Ai-icon-09.png",
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371244043-Ai-icon-14.png",
];

const CARDS = [
  {
    img: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784380559473-Screenshot_2026-07-18_at_7.15.56_PM.png",
    title: "Get your AI certificate",
    desc: "Explore your personal learning plan and become a master of AI",
    href: "https://1course.io/quiz",
  },
  {
    img: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784371010920-A_clean__modern_habit_tracker_calendar_icon_on_a_soft_purple_gradient_background._A_5_6_grid_of_30_rounded_square_tiles_with_subtle_shadows._Each_tile_is_white_with_a_slight_glossy_effect_and_contains_a_blue_checkmark._The_last_three_tiles.jpg",
    title: "Join the 28-Day Challenge",
    desc: "Gain confidence in AI tools tailored to your needs.",
    href: "https://1course.io/quiz",
  },
];

function useBreakpoint() {
  const [bp, setBp] = useState(null);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

function IconCard({ src, size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        padding: size * 0.12,
        boxSizing: "border-box",
      }}
    >
      <img
        src={src}
        alt="AI tool"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

function ScrollRow({ icons, direction = "left", duration = 18, size = 80 }) {
  const doubled = [...icons, ...icons];
  const animName = direction === "left" ? "heroScrollRowLeft" : "heroScrollRowRight";
  return (
    <div style={{ overflow: "hidden", width: "100%", display: "flex" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((src, i) => (
          <IconCard key={i} src={src} size={size} />
        ))}
      </div>
    </div>
  );
}

function ScrollColumn({ icons, direction = "up", duration = 18, size = 110 }) {
  const doubled = [...icons, ...icons];
  const animName = direction === "up" ? "heroScrollColUp" : "heroScrollColDown";
  return (
    <div
      style={{
        overflow: "hidden",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((src, i) => (
          <IconCard key={i} src={src} size={size} />
        ))}
      </div>
    </div>
  );
}

function HeroCard({ card }) {
  const tag = "a";
  const El = tag;
  return (
    <El
      href={card.href}
      className="hero-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 16,
        padding: "16px 18px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      <img
        src={card.img}
        alt={card.title}
        style={{
          width: 96,
          height: 96,
          borderRadius: 14,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.3 }}>
          {card.title}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
          {card.desc}
        </p>
      </div>
      <span
        className="hero-card-arrow"
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, flexShrink: 0 }}
      >
        &#8594;
      </span>
    </El>
  );
}

export default function HeroSection() {
  const bp = useBreakpoint();

  const isMobile  = bp === "mobile";
  const isTablet  = bp === "tablet";
  const isDesktop = bp === "desktop" || bp === null;

  const col1 = [AI_ICONS[0], AI_ICONS[1], AI_ICONS[2], AI_ICONS[3], AI_ICONS[4], AI_ICONS[5]];
  const col2 = [AI_ICONS[3], AI_ICONS[4], AI_ICONS[5], AI_ICONS[6], AI_ICONS[7], AI_ICONS[0]];
  const col3 = [AI_ICONS[6], AI_ICONS[7], AI_ICONS[8], AI_ICONS[9], AI_ICONS[1], AI_ICONS[2]];
  const col4 = [AI_ICONS[8], AI_ICONS[9], AI_ICONS[0], AI_ICONS[3], AI_ICONS[5], AI_ICONS[7]];
  const row1 = AI_ICONS;
  const row2 = [...AI_ICONS].reverse();
  const iconSize = isDesktop ? 110 : isTablet ? 90 : 70;

  return (
    <section
      id="hero"
      style={{
        padding: isMobile ? "80px 20px 40px" : isTablet ? "80px 24px 60px" : "80px 32px 60px",
        position: "relative",
        overflow: "hidden",
        minHeight: isMobile ? "auto" : 560,
      }}
    >
      <style>{`
        @keyframes heroScrollColUp    { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
        @keyframes heroScrollColDown  { from { transform: translateY(-50%); } to { transform: translateY(0);    } }
        @keyframes heroScrollRowLeft  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes heroScrollRowRight { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
        .hero-card { transition: background 0.2s, transform 0.2s; }
        .hero-card:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-2px); }
        .hero-card-arrow { transition: transform 0.2s; }
        .hero-card:hover .hero-card-arrow { transform: translateX(4px); }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(91,78,255,0.2) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>

        {/* HERO GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "50% 1fr",
            gap: isMobile ? 40 : 48,
            alignItems: "center",
            marginBottom: isMobile ? 32 : 40,
          }}
        >
          {/* LEFT */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <h1
              style={{
                fontSize: isMobile ? 36 : isTablet ? 44 : 56,
                fontWeight: 900,
                color: "#fff",
                margin: "0 0 16px",
                lineHeight: 1.1,
              }}
            >
              Upgrade your life
              <br />
              with practical{" "}
              <span style={{ color: "#f59e0b" }}>AI skills</span>
            </h1>
            <p
              style={{
                fontSize: isMobile ? 15 : 16,
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 32px",
                lineHeight: 1.7,
              }}
            >
              Learn the tools. Build the skills.
              <br />
              Get the certificate &#8212; in 28 days.
            </p>
            <Link
              href="/quiz"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 14,
                background: "linear-gradient(135deg,#5B4EFF,#8B5CF6)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(91,78,255,0.45)",
              }}
            >
              Start now &#8594;
            </Link>
          </div>

          {/* RIGHT desktop */}
          {isDesktop && (
            <div
              style={{
                position: "relative",
                height: 460,
                display: "flex",
                gap: 14,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to top,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <ScrollColumn icons={col1} direction="up"   duration={14} size={iconSize} />
              <ScrollColumn icons={col2} direction="down" duration={20} size={iconSize} />
              <ScrollColumn icons={col3} direction="up"   duration={17} size={iconSize} />
              <ScrollColumn icons={col4} direction="down" duration={15} size={iconSize} />
            </div>
          )}

          {/* RIGHT tablet */}
          {isTablet && (
            <div
              style={{
                position: "relative",
                height: 420,
                display: "flex",
                gap: 14,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to bottom,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(to top,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <ScrollColumn icons={col1} direction="up"   duration={14} size={iconSize} />
              <ScrollColumn icons={col2} direction="down" duration={20} size={iconSize} />
              <ScrollColumn icons={col3} direction="up"   duration={17} size={iconSize} />
            </div>
          )}

          {/* RIGHT mobile */}
          {isMobile && (
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 60, background: "linear-gradient(to right,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 60, background: "linear-gradient(to left,#0d0b1e,transparent)", zIndex: 2, pointerEvents: "none" }} />
              <ScrollRow icons={row1} direction="left"  duration={18} size={iconSize} />
              <ScrollRow icons={row2} direction="right" duration={22} size={iconSize} />
            </div>
          )}
        </div>

        {/* CARDS below grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 12,
          }}
        >
          {CARDS.map((card, i) => (
            <HeroCard key={i} card={card} />
          ))}
        </div>

      </div>
    </section>
  );
}
