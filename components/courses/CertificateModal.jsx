"use client";

import { useState, useRef } from "react";
import { Award, Download, Share2, X, Star, Loader2 } from "lucide-react";

export default function CertificateModal({ course, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      // Capture the certificate card
      const canvas = await html2canvas(certRef.current, {
        scale: 3, // high resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions: 210 x 297 mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 20;
      const contentWidth = pdfWidth - margin * 2;

      // Calculate image dimensions to fit A4
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos = (pdfHeight - imgHeight) / 2; // vertically centered

      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // Add decorative border
      pdf.setDrawColor(91, 78, 255);
      pdf.setLineWidth(0.8);
      pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.setLineWidth(0.3);
      pdf.rect(13, 13, pdfWidth - 26, pdfHeight - 26);

      // Add header text
      pdf.setFontSize(11);
      pdf.setTextColor(91, 78, 255);
      pdf.setFont("helvetica", "bold");
      pdf.text("✦ COURSIV", pdfWidth / 2, 28, { align: "center" });

      // Add the certificate image
      pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);

      // Add footer
      pdf.setFontSize(9);
      pdf.setTextColor(156, 163, 175);
      pdf.setFont("helvetica", "normal");
      pdf.text("This certificate was issued by Coursiv — AI Learning Platform", pdfWidth / 2, pdfHeight - 18, { align: "center" });
      pdf.text(`coursiv.io • ${date}`, pdfWidth / 2, pdfHeight - 13, { align: "center" });

      pdf.save(`${course.title.replace(/\s+/g, "_")}_Certificate.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I completed ${course.title} on Coursiv!`,
          text: `I just earned my certificate for completing ${course.title} on Coursiv — the AI learning platform!`,
          url: window.location.origin,
        });
      } catch (err) {}
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(
        `I just earned my certificate for completing ${course.title} on Coursiv! 🎉 Check it out at coursiv.io`
      );
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        maxWidth: 460,
        width: "100%",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        maxHeight: "95vh",
        overflowY: "auto",
      }}>

        {/* Close button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <X size={16} color="#fff" />
          </button>

          {/* Top gradient banner */}
          <div style={{
            background: "linear-gradient(135deg,#5B4EFF,#8B5CF6)",
            padding: "32px 24px 28px",
            textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Award size={36} color="#fff" />
            </div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>
              Course Complete! 🎉
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "6px 0 0" }}>
              You&apos;ve earned your certificate
            </p>
          </div>
        </div>

        <div style={{ padding: "24px 24px 20px" }}>

          {/* Certificate card — this gets captured for PDF */}
          <div
            ref={certRef}
            style={{
              border: "3px solid #EEF0FF",
              borderRadius: 16,
              padding: "32px 28px",
              textAlign: "center",
              background: "linear-gradient(135deg,#f9f8ff,#EEF0FF)",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative corner stars */}
            {[
              { top: 12, left: 14 }, { top: 12, right: 14 },
              { bottom: 12, left: 22 }, { bottom: 12, right: 22 },
            ].map((pos, i) => (
              <div key={i} style={{ position: "absolute", opacity: i < 2 ? 0.35 : 0.2, ...pos }}>
                <Star size={i < 2 ? 16 : 10} fill="#5B4EFF" color="#5B4EFF" />
              </div>
            ))}

            {/* Course emoji */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `linear-gradient(135deg, ${course.gradient?.includes("pink") ? "#f472b6,#e11d48" : "#7c3aed,#5B4EFF"})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, margin: "0 auto 16px",
            }}>
              {course.emoji}
            </div>

            <p style={{ fontSize: 10, fontWeight: 700, color: "#5B4EFF", textTransform: "uppercase", letterSpacing: 3, margin: "0 0 8px" }}>
              Certificate of Completion
            </p>
            <div style={{ width: 48, height: 2, background: "#5B4EFF", opacity: 0.3, margin: "0 auto 16px" }} />

            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 6px" }}>
              This certifies that you have successfully completed
            </p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A2E", margin: "0 0 6px" }}>
              {course.title}
            </h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 20px" }}>
              {course.lessons} lessons • {course.hours} hours • {course.level}
            </p>

            <div style={{ width: 48, height: 2, background: "#5B4EFF", opacity: 0.3, margin: "0 auto 20px" }} />

            {/* Signature line */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ width: 80, height: 1, background: "#D1D5DB", marginBottom: 4 }} />
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Learner</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#5B4EFF", margin: "0 0 2px" }}>✦ Coursiv</p>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>AI Learning Platform</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ width: 80, height: 1, background: "#D1D5DB", marginBottom: 4, marginLeft: "auto" }} />
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{date}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              onClick={handleShare}
              style={{
                flex: 1, padding: "13px",
                borderRadius: 12,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                color: "#374151",
                fontWeight: 600, fontSize: 14,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              <Share2 size={15} /> Share
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                flex: 1, padding: "13px",
                borderRadius: 12,
                border: "none",
                background: downloading ? "#9CA3AF" : "#5B4EFF",
                color: "#fff",
                fontWeight: 600, fontSize: 14,
                cursor: downloading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 0.2s",
              }}>
              {downloading
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Generating...</>
                : <><Download size={15} /> Download PDF</>
              }
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "12px",
              borderRadius: 12, border: "none",
              background: "none", color: "#9CA3AF",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>
            Continue learning →
          </button>
        </div>
      </div>
    </div>
  );
}
