"use client";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";

const IMG = "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1784546953809-Ai-icon.png";

export default function CTASection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 28,
          padding: isMobile ? "36px 24px" : "48px 48px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
          gap: 40,
          alignItems: "center",
          textAlign: isMobile ? "center" : "left",
          overflow: "hidden",
        }}>
          {/* Left: text + button */}
          <div>
            <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
              Ready to lead the <span style={{ color: "#f59e0b" }}>AI revolution?</span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: "0 0 28px", lineHeight: 1.7 }}>
              Get unlimited access to all courses, practical toolkits, and weekly updates. Join 1Course and start building your AI-powered future now.
            </p>
            <Link href="/quiz" style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 12,
              background: "#5B4EFF",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              Get access now
            </Link>
          </div>

          {/* Right: image */}
          {!isMobile && (
           <div style={{
  width: 260,
  height: 220,
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  flexShrink: 0,
  background: "#fff",  // ← white bg
}}>
  <img
    src={IMG}
    alt="AI tools"
    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}  // ← contain
  />
</div>
          )}
        </div>
      </div>
    </section>
  );
}