"use client";
import { useProgress } from "@/hooks/useProgress";
import { Award, ChevronRight } from "lucide-react";
import Link from "next/link";

const COLORS = [
  { color: "#10A37F", glow: "rgba(16,163,127,0.4)" },
  { color: "#8B5CF6", glow: "rgba(139,92,246,0.4)" },
  { color: "#E11D48", glow: "rgba(225,29,72,0.4)" },
  { color: "#1D4ED8", glow: "rgba(29,78,216,0.4)" },
  { color: "#F97316", glow: "rgba(249,115,22,0.4)" },
  { color: "#0891b2", glow: "rgba(8,145,178,0.4)" },
  { color: "#059669", glow: "rgba(5,150,105,0.4)" },
  { color: "#7c3aed", glow: "rgba(124,58,237,0.4)" },
];

export default function CertificateBanner({ courses = [] }) {
  const { getCoursePercent } = useProgress();

  const CERT = courses.map((course, i) => ({
    id: course.id,
    emoji: course.emoji || "📚",
    ...COLORS[i % COLORS.length],
  }));

  const overallPct =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((s, course) => {
            const total = course.units?.flatMap((u) => u.lessons).length || 0;
            return s + getCoursePercent(course.id, total);
          }, 0) / courses.length,
        );

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#1a0533 0%,#2d1b69 45%,#1e3a5f 100%)",
        borderRadius: 24,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          position: "absolute",
          top: -60,
          right: 80,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: 160,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.07)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 280,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#a78bfa",
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 240,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#818cf8",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(167,139,250,0.2)",
            border: "1px solid rgba(167,139,250,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Award size={24} color="#a78bfa" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                background: "rgba(167,139,250,0.2)",
                color: "#c4b5fd",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                letterSpacing: 0.8,
              }}
            >
              AI MASTERY PROGRAM
            </span>
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: 800,
              margin: "0 0 2px",
            }}
          >
            AI Mastery Certificate
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
              margin: "0 0 10px",
            }}
          >
            Complete all courses · Earn your professional certificate
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 5,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#a78bfa,#6366f1)",
                  width: `${overallPct}%`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span
              style={{
                color: "#a78bfa",
                fontSize: 11,
                fontWeight: 700,
                minWidth: 28,
              }}
            >
              {overallPct}%
            </span>
          </div>
        </div>

        {/* Course badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {CERT.map((c) => {
            const course = courses.find((x) => x.id === c.id);
            const total = course
              ? course.units?.flatMap((u) => u.lessons).length || 0
              : 0;
            const pct = getCoursePercent(c.id, total);
            const done = pct === 100;
            return (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                style={{ textDecoration: "none" }}
              >
                <div title={course?.title}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: done ? c.color : "rgba(255,255,255,0.06)",
                      border: done
                        ? "none"
                        : "1.5px solid rgba(255,255,255,0.12)",
                      boxShadow: done ? `0 4px 16px ${c.glow}` : "none",
                      transition: "all 0.3s",
                    }}
                  >
                    {c.emoji}
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 9,
                      color: done ? "#a78bfa" : "rgba(255,255,255,0.3)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {pct > 0 ? `${pct}%` : "—"}
                  </p>
                </div>
              </Link>
            );
          })}
          <Link href="/courses" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                border: "1.5px dashed rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
