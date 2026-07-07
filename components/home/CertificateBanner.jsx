"use client";
import { useProgress } from "@/hooks/useProgress";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

const COLORS = [
  { color: "#10A37F", bg: "#e6f7f3" },
  { color: "#8B5CF6", bg: "#f3f0ff" },
  { color: "#E11D48", bg: "#fff0f3" },
  { color: "#1D4ED8", bg: "#eff3ff" },
  { color: "#F97316", bg: "#fff7ed" },
];

const CERT_IMAGE =
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783430088646-8c6ed8b4-813c-4514-a24c-a9561c8bed1d.webp";

export default function CertificateBanner({ courses = [] }) {
  const { getCoursePercent } = useProgress();

  const CERT = courses.slice(0, 5).map((course, i) => ({
    id: course.id,
    emoji: course.emoji || "📚",
    image: course.image || course.thumbnail || course.cover || null,
    ...COLORS[i % COLORS.length],
  }));

  const overallPct =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((s, course) => {
            const total = course.units?.flatMap((u) => u.lessons).length || 0;
            return s + getCoursePercent(course.id, total);
          }, 0) / courses.length
        );

  return (
    <div
      style={{
        background: "#eef0fb",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      {/* Left: illustration + title + progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flex: 1,
          minWidth: 200,
        }}
      >
        <img
          src={CERT_IMAGE}
          alt="Certificate"
          style={{ width: 76, height: 76, objectFit: "contain", flexShrink: 0 }}
        />
        <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 8px",
            }}
          >
            AI Mastery Certificate Program
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 110,
                height: 5,
                background: "#d1d5db",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${overallPct}%`,
                  background: "linear-gradient(90deg,#818cf8,#6366f1)",
                  borderRadius: 999,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>
              {overallPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Right: exactly 5 course badges + arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {CERT.map((c) => {
          const course = courses.find((x) => x.id === c.id);
          const total = course?.units?.flatMap((u) => u.lessons).length || 0;
          const pct = getCoursePercent(c.id, total);
          const done = pct === 100;

          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
                title={course?.title}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: done ? c.color : c.bg,
                    border: `1.5px solid ${done ? c.color : "#e2e4f0"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s",
                  }}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={course?.title || ""}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  ) : (
                    <span>{c.emoji}</span>
                  )}
                  {done && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white",
                      }}
                    >
                      <Check size={11} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: done ? "#22c55e" : pct > 0 ? "#6366f1" : "#9ca3af",
                  }}
                >
                  {done ? "Done" : `${pct}%`}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Arrow → all courses */}
        <Link href="/courses" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                border: "1.5px dashed #c7cadf",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(99,102,241,0.04)",
                transition: "background 0.2s",
              }}
            >
              <ChevronRight size={20} color="#9ca3af" />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af" }}>
              All
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}