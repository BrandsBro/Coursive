import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const CHIPS = ["✍️ Cold email", "🎨 UI design", "💻 Debug code", "📊 Data analysis", "🚀 Product launch", "📧 Newsletter"];

export default function PromptsLibraryBanner() {
  return (
    <Link href="/courses" style={{ textDecoration:"none" }}>
      <div style={{
        background:"linear-gradient(135deg,#09090b 0%,#18103a 50%,#0f1f3d 100%)",
        borderRadius:24,padding:"22px 28px",position:"relative",overflow:"hidden",cursor:"pointer",
      }}>
        <div style={{ position:"absolute",top:-50,right:60,width:180,height:180,borderRadius:"50%",background:"rgba(99,102,241,0.1)" }} />
        <div style={{ position:"absolute",bottom:-40,right:-10,width:130,height:130,borderRadius:"50%",background:"rgba(139,92,246,0.08)" }} />
        <div style={{ position:"absolute",top:16,left:"40%",width:4,height:4,borderRadius:"50%",background:"#818cf8",opacity:0.7 }} />
        <div style={{ position:"absolute",top:28,left:"55%",width:3,height:3,borderRadius:"50%",background:"#a78bfa",opacity:0.5 }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between",gap:24 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(99,102,241,0.25)",borderRadius:8,padding:"3px 10px",marginBottom:10 }}>
              <Sparkles size={11} color="#a78bfa" />
              <span style={{ color:"#a78bfa",fontSize:10,fontWeight:700,letterSpacing:0.8 }}>PROMPTS LIBRARY · NEW</span>
            </div>
            <h3 style={{ color:"#fff",fontSize:19,fontWeight:800,margin:"0 0 4px" }}>The Complete AI Bundle</h3>
            <p style={{ color:"rgba(255,255,255,0.45)",fontSize:13,margin:"0 0 14px" }}>500+ proven prompts for every use case — now in the app</p>

            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {CHIPS.map((c, i) => (
                <span key={i} style={{
                  background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:999,padding:"4px 11px",color:"rgba(255,255,255,0.55)",fontSize:11,fontWeight:500,
                }}>
                  {c}
                </span>
              ))}
              <span style={{
                background:"rgba(99,102,241,0.3)",border:"1px solid rgba(99,102,241,0.5)",
                borderRadius:999,padding:"4px 11px",color:"#a5b4fc",fontSize:11,fontWeight:600,
              }}>
                +494 more
              </span>
            </div>
          </div>

          <div style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
            <div style={{
              width:54,height:54,borderRadius:"50%",
              background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 8px 28px rgba(124,58,237,0.55)",
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:4,color:"#a78bfa",fontSize:12,fontWeight:700 }}>
              Explore <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
