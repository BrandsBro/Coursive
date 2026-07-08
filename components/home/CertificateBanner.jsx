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
    <>
      <style>{`
        .cert-banner {
          background: #eef0fb;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .cert-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 200px;
        }
        .cert-text {
          flex: 1;
        }
        .cert-heading {
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px;
          font-size: clamp(15px, 2.2vw, 29px);
          line-height: 1.2;
        }
        .cert-pct-label {
          font-size: clamp(11px, 1.2vw, 14px);
          color: #6366f1;
          font-weight: 700;
        }
        .cert-progress-track {
          width: 100%;
          height: 5px;
          background: #d1d5db;
          border-radius: 999px;
          overflow: hidden;
        }
        .cert-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cert-image {
          width: 200px;
          height: 100px;
          object-fit: cover;
          flex-shrink: 0;
          border-radius: 10px;
        }
        @media (max-width: 600px) {
          .cert-image {
          width: full;
      }
          .cert-banner {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .cert-left {
            flex-direction: column;
            align-items: center;
            min-width: unset;
            width: 100%;
          }
          .cert-text {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .cert-right {
            display: none;
          }
        
        }
      `}</style>

      <div className="cert-banner">
        <div className="cert-left">
          <img
            src={CERT_IMAGE}
            alt="Certificate"
            className="cert-image"
          />
          <div className="cert-text">
            <h2 className="cert-heading">
              AI Mastery Certificate Program
            </h2>
          
          </div>
        </div>

        <div className="cert-right">
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
                  title={course?.title}
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
              </Link>
            );
          })}

          <Link href="/courses" style={{ textDecoration: "none" }}>
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
          </Link>
        </div>
      </div>
    </>
  );
}