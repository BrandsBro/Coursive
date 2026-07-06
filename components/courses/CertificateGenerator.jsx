"use client";
import { useState, useRef, useEffect } from "react";
import { Download, X, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CertificatePreview } from "@/components/admin/CertificateDesigner";

const DEFAULT_DESIGN = {
  bgColor:"#ffffff", bgImage:"", borderColor:"#7c3aed", borderWidth:12, borderStyle:"double",
  showLogo:true, logoUrl:"https://i.postimg.cc/7Pd7vVJs/1course-Logo-Black-Version.png", logoSize:80,
  topLabel:"Certificate of Completion", topLabelFont:"Georgia", topLabelSize:14, topLabelColor:"#7c3aed", topLabelSpacing:4,
  certifiesText:"This certifies that", certifiesFont:"Georgia", certifiesSize:16, certifiesColor:"#64748B",
  nameFont:"Georgia", nameSize:42, nameColor:"#0f172a", nameBold:true,
  completedText:"has successfully completed the course", completedFont:"Georgia", completedSize:16, completedColor:"#64748B",
  courseFont:"Georgia", courseSize:28, courseColor:"#7c3aed", courseBold:true,
  showDate:true, dateLabel:"Completed on", dateFont:"Georgia", dateSize:13, dateColor:"#94A3B8",
  showSignature:true, signatureImage:"", signatureName:"1Course Team", signatureTitle:"Certificate Authority",
  signatureFont:"Georgia", signatureSize:13, signatureColor:"#374151",
  showDividers:true, dividerColor:"#7c3aed", showSeal:true, sealEmoji:"🏆",
};

async function toBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch(e) {
    return null;
  }
}

export default function CertificateGenerator({ course, userName, completedDate, onClose, type="course" }) {
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef();

  useEffect(() => {
    const key = type === "challenge" ? "certificate_design_challenge" : "certificate_design";
    supabase.from("settings").select("*").eq("key", key).single()
      .then(({ data }) => { if (data?.value) setDesign({ ...DEFAULT_DESIGN, ...data.value }); });
  }, [type]);

  const date = completedDate
    ? new Date(completedDate).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
    : new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      // Convert logo to base64 to avoid CORS
    if (design.logoUrl && certRef.current) {
      const b64 = await toBase64(design.logoUrl);
      if (b64) {
        const imgs = certRef.current.querySelectorAll("img");
        imgs.forEach(img => { if (img.src === design.logoUrl) img.src = b64; });
        await new Promise(r => setTimeout(r, 500));
      }
    }
    const canvas = await html2canvas(certRef.current, { scale:3, useCORS:true, allowTaint:true, backgroundColor:"#ffffff", logging:false, imageTimeout:15000 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`1Course-Certificate-${course?.title?.replace(/\s+/g,"-")}.pdf`);
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}>
      <div style={{ width:"100%", maxWidth:860, display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, margin:0, fontWeight:600 }}>🏆 Your Certificate</p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleDownload} disabled={downloading}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {downloading ? <><Loader size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Generating...</> : <><Download size={15}/> Download PDF</>}
            </button>
            <button onClick={onClose}
              style={{ width:38, height:38, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.1)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={18}/>
            </button>
          </div>
        </div>
        <div ref={certRef}>
          <CertificatePreview design={design} name={userName} course={course?.title} date={date}/>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
