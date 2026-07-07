"use client";
import { useState, useRef, useEffect } from "react";
import { Download, Share2, X, Loader } from "lucide-react";
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
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) { return null; }
}

export default function CertificateModal({ course, userName: userNameProp, onClose }) {
  const [design, setDesign] = useState(null);
  const [userName, setUserName] = useState(userNameProp || "");
  const [downloading, setDownloading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const certRef = useRef(null);

  const handleDoubleTap = () => {
    setTapCount(c => {
      if (c + 1 >= 2) { onClose(); return 0; }
      setTimeout(() => setTapCount(0), 400);
      return c + 1;
    });
  };

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Load design + resolve user name if not passed as prop
  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .eq("key", "certificate_design")
      .single()
      .then(({ data }) => {
        setDesign(data?.value ? { ...DEFAULT_DESIGN, ...data.value } : DEFAULT_DESIGN);
      });

    if (!userNameProp) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        // Try profiles table first, then fall back to auth metadata
        supabase.from("profiles").select("full_name").eq("id", user.id).single()
          .then(({ data: profile }) => {
            const name =
              profile?.full_name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Learner";
            setUserName(name);
          });
      });
    }
  }, [userNameProp]);

  const handleDownload = async () => {
    if (!design || !certRef.current) return;
    setDownloading(true);
    try {
      const { default: jsPDF }       = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Convert all images to base64 to avoid CORS blank-outs
      const imgEls = certRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(imgEls).map(async (img) => {
          const original = img.src;
          if (!original || original.startsWith("data:")) return;
          const b64 = await toBase64(original);
          if (b64) { img.src = b64; img.setAttribute("data-original", original); }
        })
      );
      await new Promise((r) => setTimeout(r, 400));

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 20000,
      });

      // Restore original srcs
      Array.from(imgEls).forEach((img) => {
        const orig = img.getAttribute("data-original");
        if (orig) { img.src = orig; img.removeAttribute("data-original"); }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`1Course-Certificate-${course?.title?.replace(/\s+/g, "-") || "Course"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Download failed. Please try again.");
    }
    setDownloading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I completed ${course?.title} on 1Course!`,
          text: `I just earned my certificate for completing ${course?.title} on 1Course — the AI learning platform!`,
          url: window.location.origin,
        });
      } catch (_) {}
    } else {
      navigator.clipboard?.writeText(
        `I just earned my certificate for completing ${course?.title} on 1Course! 🎉`
      );
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div onClick={handleDoubleTap} style={{
      position:"fixed", inset:0,
      background:"rgba(15,23,42,0.85)",
      zIndex:300,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20,
      backdropFilter:"blur(8px)",
      overflowY:"auto",
    }}>
      <div style={{ width:"100%", maxWidth:860, display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, margin:0, fontWeight:600 }}>🏆 Your Certificate</p>
          <div className="cert-modal-top-btns" style={{ display:"flex", gap:10 }}>
            <button onClick={handleShare}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              <Share2 size={14}/> Share
            </button>
            <button onClick={handleDownload} disabled={downloading || !design}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:12, border:"none", background:(!design||downloading)?"rgba(124,58,237,0.5)":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:(!design||downloading)?"not-allowed":"pointer" }}>
              {downloading
                ? <><Loader size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Generating...</>
                : !design
                  ? <><Loader size={15} style={{ animation:"spin 0.7s linear infinite" }}/> Loading...</>
                  : <><Download size={15}/> Download PDF</>}
            </button>
            <button onClick={onClose}
              style={{ width:38, height:38, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.12)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={18}/>
            </button>
          </div>
        </div>

        {/* Certificate — captured for PDF */}
        <div ref={certRef}>
          {design
            ? <CertificatePreview design={design} name={userName} course={course?.title} date={date}/>
            : (
              <div style={{ aspectRatio:"1.414/1", background:"#fff", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
                <Loader size={28} color="#7c3aed" style={{ animation:"spin 0.7s linear infinite" }}/>
                <p style={{ color:"#94A3B8", fontSize:14, margin:0 }}>Loading certificate…</p>
              </div>
            )
          }
        </div>

        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"center" }}>
          Continue learning →
        </button>

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .cert-modal-top-btns { display: none !important; } }
        @media (max-width: 768px) { .cert-modal-bottom-btns { display: flex !important; } }
      `}</style>
    </div>
  );
}
