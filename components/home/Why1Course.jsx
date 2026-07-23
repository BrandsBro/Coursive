"use client";
import useIsMobile from "@/hooks/useIsMobile";

const BASE = "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/";

const AI_ICONS = [
  BASE + "1784371246239-Ai-icon-16.png",
  BASE + "1784371244043-Ai-icon-14.png",
  BASE + "1784371238278-Ai-icon-09.png",
  BASE + "1784371233722-Ai-icon-05.png",
  BASE + "1784371245315-Ai-icon-15.png",
  BASE + "1784371236190-Ai-icon-07.png",
];

const DAYS = ["Start here","Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];

function AppMockup() {
  return (
    <div id="features"style={{ width:210, background:"#12103a", borderRadius:16, padding:14, flexShrink:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>AI Mastery</span>
        <span style={{ fontSize:10, background:"#5B4EFF", color:"#fff", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>28 modules</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
        {DAYS.map((label, i) => (
          <div key={i} style={{
            background: i === 0 ? "#5B4EFF" : "rgba(255,255,255,0.07)",
            borderRadius:8,
            padding:"8px 2px",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            gap:4,
            position:"relative",
          }}>
            {i === 0 && (
              <div style={{
                position:"absolute",
                top:-8, left:"50%",
                transform:"translateX(-50%)",
                background:"#fff",
                color:"#5B4EFF",
                fontSize:8,
                fontWeight:700,
                borderRadius:4,
                padding:"1px 5px",
                whiteSpace:"nowrap",
              }}>You are here</div>
            )}
            <span style={{ fontSize:13 }}>{i === 0 ? "⭐" : "🔒"}</span>
            <span style={{ fontSize:7, color:"rgba(255,255,255,0.55)", textAlign:"center", lineHeight:1.2 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Why1Course() {
  const isMobile = useIsMobile();
  const cardBase = { borderRadius: 24, overflow: "hidden" };

  return (
    <section id="why" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>
          WHY USERS CHOOSE
        </p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 12px" }}>
          Why users choose <span style={{ color:"#5B4EFF" }}>1Course</span>
        </h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.45)", margin:"0 0 40px" }}>
          Thousands of users trust 1Course to learn AI.
        </p>

        {/* ROW 1 */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr",
          gap:16,
          marginBottom:16,
        }}>
          {/* 28-Day Challenge */}
          <div style={{
            ...cardBase,
            background:"linear-gradient(135deg, #4338ca, #6366f1 60%, #818cf8)",
            padding:"32px 28px",
            display:"flex",
            alignItems:"center",
            gap:24,
            minHeight:240,
          }}>
            <div style={{ flex:1 }}>
              <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, color:"#fff", margin:"0 0 14px", lineHeight:1.2 }}>
                The 28-Day AI Challenge
              </h3>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.82)", margin:"0 0 28px", lineHeight:1.65 }}>
                Take daily bite-sized steps at your own pace to transform your life and go from curious to pro
              </p>
              <a href="/quiz" style={{
                background:"#fff",
                color:"#4338ca",
                border:"none",
                borderRadius:12,
                padding:"11px 22px",
                fontSize:14,
                fontWeight:700,
                cursor:"pointer",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                textDecoration:"none",
              }}>
                Start my Challenge →
              </a>
            </div>
            {!isMobile && <AppMockup />}
          </div>

          {/* 4.8 Rating */}
          <div style={{
            ...cardBase,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            padding:"28px 24px",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            gap:16,
          }}>
            <div style={{ display:"flex", gap:4 }}>
              {[1,2,3,4].map(n => (
                <span key={n} style={{ fontSize:28, color:"#facc15", lineHeight:1 }}>★</span>
              ))}
              <span style={{ fontSize:28, color:"#facc15", lineHeight:1, opacity:0.5 }}>★</span>
            </div>
            <span style={{ fontSize:64, fontWeight:900, color:"#fff", lineHeight:1, letterSpacing:"-3px" }}>4.8</span>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", textAlign:"center", margin:0, lineHeight:1.65, maxWidth:200 }}>
              * Average rating based on reviews across AppStore, Play Market and Trustpilot
            </p>
          </div>
        </div>

        {/* ROW 2 */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap:16,
        }}>
          {/* 10+ AI Tools */}
          <div style={{
            ...cardBase,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            display:"flex",
            flexDirection:"column",
          }}>
            <div style={{ height:250, overflow:"hidden" }}>
              <img
                src={BASE + "1784542055232-Create_a_cat_as_a_doctor.jpg"}
                alt="AI generated cat as doctor"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
            </div>
            <div style={{ padding:"20px 20px 24px" }}>
              <p style={{ fontSize:18, fontWeight:800, color:"#fff", margin:"0 0 6px" }}>10+ leading AI tools</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.6 }}>
                Create text, images, video, and AI apps – all in one toolkit
              </p>
            </div>
          </div>

          {/* Learn on the go */}
          <div style={{
            ...cardBase,
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",
            display:"flex",
            flexDirection:"column",
          }}>
            <div style={{ height:250, overflow:"hidden", background:"#0d0a1e" }}>
              <img
                src={BASE + "1784542540905-Untitled_design__19_.png"}
                alt="Learn on the go"
                style={{ width:"100%", height:"100%", objectFit:"contain" }}
              />
            </div>
            <div style={{ padding:"20px 20px 24px" }}>
              <p style={{ fontSize:18, fontWeight:800, color:"#fff", margin:"0 0 6px" }}>Learn on the go</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.6 }}>
                Listen to lessons like a podcast and master AI hands-free.
              </p>
            </div>
          </div>

          {/* Prove skills */}
          <div style={{
            ...cardBase,
            background:"linear-gradient(135deg, #4338ca, #6366f1)",
            padding:"24px 24px 28px",
            display:"flex",
            flexDirection:"column",
          }}>
            {/* 3x2 icon grid */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(3, 100px)",
              gap:12,
              marginBottom:20,
              justifyContent:"start",
            }}>
              {AI_ICONS.map((src, i) => (
                <img key={i} src={src} alt="AI icon"
                  style={{
                    width:60,
                    height:60,
                    borderRadius:18,
                    objectFit:"cover",
                    boxShadow:"0 6px 20px rgba(0,0,0,0.4)",
                    transform:`rotate(${[-6,4,-3,5,-4,3][i]}deg)`,
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize:20, fontWeight:800, color:"#fff", margin:"0 0 8px" }}>Prove skills, get ahead</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)", margin:"0 0 20px", lineHeight:1.65, flex:1 }}>
              Earn a professional certificate that boosts your LinkedIn and shows employers you are future-ready
            </p>
            <a href="/quiz" style={{
              background:"rgba(255,255,255,0.12)",
              color:"#fff",
              border:"1px solid rgba(255,255,255,0.25)",
              borderRadius:12,
              padding:"12px 20px",
              fontSize:14,
              fontWeight:700,
              cursor:"pointer",
              textAlign:"center",
              textDecoration:"none",
              display:"block",
            }}>
              Get a certificate now →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}