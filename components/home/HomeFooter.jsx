"use client";
import useIsMobile from "@/hooks/useIsMobile";
import { useBranding } from "@/lib/useBranding";

export default function HomeFooter() {
  const isMobile = useIsMobile();
  const branding = useBranding();

  const scrollTo = (e, id) => {
    if (!id) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      // Fallback if they are not on the homepage
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: isMobile ? "40px 20px 24px" : "48px 32px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Adjusted grid template to account for 3 total columns instead of 4 */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr", gap: isMobile ? 24 : 40, marginBottom: 40 }}>
          
          {/* Logo & Description Column */}
          <div style={{ gridColumn: isMobile ? "1/-1" : "auto" }}>
            {branding.logoMain ? (
              <img src={branding.logoMain} alt="1Course" className="logo-main" style={{ objectFit: "contain", padding: 4, maxHeight: 40 }} />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>✦ 1Course</span>
            )}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 10, lineHeight: 1.7, maxWidth: 240 }}>
              The fastest way to master AI tools and earn your certificate.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {["𝕏", "in", "📘", "📸"].map((s, i) => (
                <a key={i} href="#" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, textDecoration: "none", color: "#fff" }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            {
              title: "Menu",
              links: [
                { label: "Home", id: "hero" },
                { label: "About", id: "about" },
                { label: "Support Center", id: "support" },
                { label: "Reviews", id: "reviews" },
                { label: "FAQ", id: "faq" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Policy", url: "/privacy" },
                { label: "Subscription Terms", url: "/subscription-terms" },
                { label: "Terms & Conditions", url: "/terms" },
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 14, letterSpacing: 0.5 }}>{col.title}</p>
              {col.links.map((l, j) => (
                <a
                  key={j}
                  href={l.url || `#${l.id}`}
                  onClick={(e) => {
                    if (l.id) scrollTo(e, l.id);
                  }}
                  style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none", marginBottom: 10, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.target.style.color = "#fff")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.3)")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: 8, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>© 2026 1Course. All rights reserved.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>Made with ❤️ for AI learners worldwide</p>
        </div>
      </div>
    </footer>
  );
}