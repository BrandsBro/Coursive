"use client";

import { useState, useRef } from "react";
import { Download, X, Award, Loader } from "lucide-react";

export default function CertificateGenerator({ course, userName, completedDate, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef();

  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })
    : new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Coursiv-Certificate-${course?.title?.replace(/\s+/g,"-")}.pdf`);
    } catch (e) {
      alert("Download failed: " + e.message);
    }
    setDownloading(false);
  };

  const grad1 = course?.gradientFrom || "#7c3aed";
  const grad2 = course?.gradientTo || "#4f46e5";

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}>
      <div style={{ width:"100%", maxWidth:860, display:"flex", flexDirection:"column", gap:16 }}>

        {/* Actions */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:0 }}>Preview your certificate</p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleDownload} disabled={downloading} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)" }}>
              {downloading ? <><Loader size={15} className="bspin"/> Generating...</> : <><Download size={15}/> Download PDF</>}
            </button>
            <button onClick={onClose} style={{ width:40, height:40, borderRadius:12, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.08)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={18} color="#fff"/>
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div ref={certRef} style={{
          width:"100%", aspectRatio:"297/210", background:"#fff",
          borderRadius:16, overflow:"hidden", position:"relative",
          fontFamily:"Georgia, serif",
        }}>
          {/* Background design */}
          <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, ${grad1}08, ${grad2}12)` }}/>

          {/* Corner decorations */}
          <div style={{ position:"absolute", top:0, left:0, width:120, height:120, background:`linear-gradient(135deg,${grad1},${grad2})`, borderRadius:"0 0 100% 0", opacity:0.12 }}/>
          <div style={{ position:"absolute", bottom:0, right:0, width:120, height:120, background:`linear-gradient(135deg,${grad2},${grad1})`, borderRadius:"100% 0 0 0", opacity:0.12 }}/>
          <div style={{ position:"absolute", top:0, right:0, width:60, height:60, background:`linear-gradient(225deg,${grad1},${grad2})`, borderRadius:"0 0 0 100%", opacity:0.08 }}/>
          <div style={{ position:"absolute", bottom:0, left:0, width:60, height:60, background:`linear-gradient(45deg,${grad1},${grad2})`, borderRadius:"0 100% 0 0", opacity:0.08 }}/>

          {/* Outer border */}
          <div style={{ position:"absolute", inset:16, border:`2px solid ${grad1}25`, borderRadius:12 }}/>
          <div style={{ position:"absolute", inset:20, border:`1px solid ${grad1}15`, borderRadius:10 }}/>

          {/* Dot pattern */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(${grad1}12 1px, transparent 1px)`, backgroundSize:"28px 28px" }}/>

          {/* Content */}
          <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 60px", textAlign:"center" }}>

            {/* Top badge */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <div style={{ width:1, height:24, background:`linear-gradient(to bottom,transparent,${grad1},transparent)` }}/>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${grad1},${grad2})`, borderRadius:999, padding:"5px 16px" }}>
                <Award size={14} color="#fff"/>
                <span style={{ color:"#fff", fontSize:11, fontWeight:700, letterSpacing:2 }}>CERTIFICATE OF COMPLETION</span>
              </div>
              <div style={{ width:1, height:24, background:`linear-gradient(to bottom,transparent,${grad1},transparent)` }}/>
            </div>

            {/* Coursiv branding */}
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 4px", letterSpacing:3, fontFamily:"system-ui", fontWeight:700 }}>COURSIV</p>

            {/* Main text */}
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 12px", fontStyle:"italic", fontFamily:"Georgia,serif" }}>This certifies that</p>

            {/* Name */}
            <div style={{ position:"relative", marginBottom:12 }}>
              <h1 style={{ fontSize:48, fontWeight:400, color:"#0f172a", margin:0, lineHeight:1.1, fontFamily:"Georgia,serif", letterSpacing:-0.5 }}>{userName || "Student Name"}</h1>
              <div style={{ height:2, background:`linear-gradient(to right,transparent,${grad1},${grad2},transparent)`, marginTop:6, borderRadius:999 }}/>
            </div>

            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 16px", fontStyle:"italic" }}>has successfully completed the course</p>

            {/* Course name */}
            <div style={{ background:`linear-gradient(135deg,${grad1}12,${grad2}18)`, border:`1.5px solid ${grad1}30`, borderRadius:14, padding:"14px 32px", marginBottom:20 }}>
              <h2 style={{ fontSize:28, fontWeight:700, margin:0, background:`linear-gradient(135deg,${grad1},${grad2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontFamily:"system-ui" }}>
                {course?.emoji} {course?.title}
              </h2>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"4px 0 0", fontFamily:"system-ui" }}>
                {course?.hours || 0}h · {course?.level || "Beginner"} · {course?.category || "AI"}
              </p>
            </div>

            {/* Date + signature row */}
            <div style={{ display:"flex", alignItems:"center", gap:48, marginTop:4 }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:"0 0 4px", fontFamily:"system-ui" }}>{formattedDate}</p>
                <div style={{ height:1, background:"#E2E8F0", marginBottom:4 }}/>
                <p style={{ fontSize:10, color:"#94A3B8", margin:0, letterSpacing:1, fontFamily:"system-ui" }}>DATE COMPLETED</p>
              </div>

              {/* Seal */}
              <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${grad1},${grad2})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 20px ${grad1}50`, fontSize:32 }}>
                {course?.emoji || "🎓"}
              </div>

              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:"0 0 4px", fontStyle:"italic", fontFamily:"Georgia,serif" }}>Coursiv Platform</p>
                <div style={{ height:1, background:"#E2E8F0", marginBottom:4 }}/>
                <p style={{ fontSize:10, color:"#94A3B8", margin:0, letterSpacing:1, fontFamily:"system-ui" }}>AUTHORIZED BY</p>
              </div>
            </div>

            {/* Bottom */}
            <p style={{ fontSize:10, color:"#CBD5E1", marginTop:16, letterSpacing:1, fontFamily:"system-ui" }}>
              COURSIV.APP · AI LEARNING PLATFORM · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.8s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
