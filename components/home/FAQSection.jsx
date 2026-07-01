"use client";
import { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";

const FAQS = [
  { q:"What is 1Course?", a:"1Course is an AI learning platform that teaches you practical AI tools through short, engaging lessons — like Duolingo but for AI skills." },
  { q:"How to download and use 1Course?", a:"1Course works on web and mobile. Just sign up at 1course.io and start learning instantly — no download required." },
  { q:"How to log in to 1Course?", a:"Visit 1course.io and click Log In. You can sign in with your email or Google account." },
  { q:"How to cancel 1Course subscription?", a:"You can cancel anytime from your account settings. No questions asked." },
  { q:"Which payment methods are accepted?", a:"We accept all major credit cards, PayPal, and Apple Pay." },
  { q:"Can I use my account on multiple devices?", a:"Yes! Your progress syncs across all devices automatically." },
  { q:"What should I do if the app is crashing?", a:"Try refreshing the page or clearing your cache. If the issue persists, contact our support team." },
  { q:"When do I get after completing a course?", a:"You receive a verified AI certificate that you can share on LinkedIn and your resume." },
];

export default function FAQSection() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(null);
  const half = Math.ceil(FAQS.length / 2);
  const cols = isMobile ? [FAQS] : [FAQS.slice(0, half), FAQS.slice(half)];

  return (
    <section id="faq" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>FAQ</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 26 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>Frequently asked questions</h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 40px" }}>Find answers to common questions about 1Course</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {col.map((faq, i) => {
                const idx = isMobile ? i : ci * half + i;
                const isOpen = open === idx;
                return (
                  <div key={i} onClick={() => setOpen(isOpen ? null : idx)}
                    style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${isOpen?"rgba(91,78,255,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:14, overflow:"hidden", cursor:"pointer" }}>
                    <div style={{ padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:isOpen?"#a78bfa":"rgba(255,255,255,0.75)" }}>{faq.q}</span>
                      <span style={{ fontSize:18, color:"rgba(255,255,255,0.3)", flexShrink:0 }}>{isOpen?"−":"+"}</span>
                    </div>
                    {isOpen && (
                      <div style={{ padding:"0 18px 16px" }}>
                        <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:0, lineHeight:1.7 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
