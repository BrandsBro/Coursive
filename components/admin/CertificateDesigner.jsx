"use client";
import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Download, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FONTS = ["Georgia", "Times New Roman", "Playfair Display", "Arial", "Helvetica", "Montserrat"];

const DEFAULT_DESIGN = {
  // Background
  bgColor: "#ffffff",
  bgImage: "",
  borderColor: "#7c3aed",
  borderWidth: 12,
  borderStyle: "double", // solid, double, none

  // Header
  showLogo: true,
  logoUrl: "https://i.postimg.cc/7Pd7vVJs/1course-Logo-Black-Version.png",
  logoSize: 80,

  // Top label
  topLabel: "Certificate of Completion",
  topLabelFont: "Georgia",
  topLabelSize: 14,
  topLabelColor: "#7c3aed",
  topLabelSpacing: 4,

  // This certifies
  certifiesText: "This certifies that",
  certifiesFont: "Georgia",
  certifiesSize: 16,
  certifiesColor: "#64748B",

  // Student name
  nameFont: "Georgia",
  nameSize: 42,
  nameColor: "#0f172a",
  nameBold: true,

  // Has completed
  completedText: "has successfully completed the course",
  completedFont: "Georgia",
  completedSize: 16,
  completedColor: "#64748B",

  // Course name
  courseFont: "Georgia",
  courseSize: 28,
  courseColor: "#7c3aed",
  courseBold: true,

  // Date
  showDate: true,
  dateLabel: "Completed on",
  dateFont: "Georgia",
  dateSize: 13,
  dateColor: "#94A3B8",

  // Signature
  showSignature: true,
  signatureImage: "",
  signatureName: "1Course Team",
  signatureTitle: "Certificate Authority",
  signatureFont: "Georgia",
  signatureSize: 13,
  signatureColor: "#374151",

  // Dividers
  showDividers: true,
  dividerColor: "#7c3aed",

  // Decoration
  showSeal: true,
  sealEmoji: "🏆",
};

export default function CertificateDesigner() {
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certType, setCertType] = useState("course"); // course or challenge
  const [tab, setTab] = useState("background");
  const certRef = useRef();

  useEffect(() => { load(); }, [certType]);

  const load = async () => {
    setLoading(true);
    const key = certType === "course" ? "certificate_design" : "certificate_design_challenge";
    const { data } = await supabase.from("settings").select("*").eq("key", key).single();
    if (data?.value) setDesign({ ...DEFAULT_DESIGN, ...data.value });
    else setDesign(DEFAULT_DESIGN);
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    const key = certType === "course" ? "certificate_design" : "certificate_design_challenge";
    await supabase.from("settings").upsert({ key, value: design });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const u = (key, val) => setDesign(prev => ({ ...prev, [key]: val }));

  const handleDownloadPreview = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, { scale:3, useCORS:true, backgroundColor:"#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save("1Course-Certificate-Preview.pdf");
    } catch(e) { alert("Download failed: " + e.message); }
  };

  const SAMPLE = { name:"John Smith", course:"Communicating With AI", date:new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:0, height:"calc(100vh - 64px)" }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:"1px solid #E2E8F0", background:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <h1 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:0 }}>Certificate Designer</h1>
            <div style={{ display:"flex", background:"#F1F5F9", borderRadius:10, padding:3, gap:2 }}>
              <button onClick={() => setCertType("course")}
                style={{ padding:"6px 16px", borderRadius:8, border:"none", background:certType==="course"?"#fff":"transparent", fontWeight:700, fontSize:12, color:certType==="course"?"#0f172a":"#94A3B8", cursor:"pointer" }}>
                📚 Course
              </button>
              <button onClick={() => setCertType("challenge")}
                style={{ padding:"6px 16px", borderRadius:8, border:"none", background:certType==="challenge"?"#fff":"transparent", fontWeight:700, fontSize:12, color:certType==="challenge"?"#0f172a":"#94A3B8", cursor:"pointer" }}>
                🏆 Challenge
              </button>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleDownloadPreview} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              <Download size={14}/> Download Preview
            </button>
            <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {saving?<><Loader size={14} className="bspin"/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Design</>}
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"320px 1fr", overflow:"hidden" }}>
          {/* Left controls */}
          <div style={{ overflow:"auto", borderRight:"1px solid #E2E8F0", background:"#FAFBFC" }}>
            {/* Tabs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderBottom:"1px solid #E2E8F0" }}>
              {[["background","BG"],["text","Text"],["name","Name"],["signature","Sign"]].map(([v,l]) => (
                <button key={v} onClick={() => setTab(v)} style={{ padding:"10px 4px", border:"none", borderBottom:`2px solid ${tab===v?"#5B4EFF":"transparent"}`, background:"#fff", fontSize:11, fontWeight:700, color:tab===v?"#5B4EFF":"#94A3B8", cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
              {tab === "background" && (
                <>
                  <Section label="Background">
                    <Row label="BG Color"><ColorInput value={design.bgColor} onChange={v=>u("bgColor",v)}/></Row>
                    <Row label="BG Image URL">
                      <input value={design.bgImage||""} onChange={e=>u("bgImage",e.target.value)} placeholder="https://..." style={inp()}/>
                    </Row>
                  </Section>
                  <Section label="Border">
                    <Row label="Color"><ColorInput value={design.borderColor} onChange={v=>u("borderColor",v)}/></Row>
                    <Row label="Width">
                      <input type="range" min={0} max={30} value={design.borderWidth} onChange={e=>u("borderWidth",parseInt(e.target.value))} style={{ width:"100%" }}/>
                      <span style={{ fontSize:11, color:"#94A3B8" }}>{design.borderWidth}px</span>
                    </Row>
                    <Row label="Style">
                      <select value={design.borderStyle} onChange={e=>u("borderStyle",e.target.value)} style={inp()}>
                        {["solid","double","dashed","none"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </Row>
                  </Section>
                  <Section label="Logo">
                    <Row label="Show Logo">
                      <Toggle value={design.showLogo} onChange={v=>u("showLogo",v)}/>
                    </Row>
                    {design.showLogo && <>
                      <Row label="Logo URL">
                        <input value={design.logoUrl||""} onChange={e=>u("logoUrl",e.target.value)} style={inp()}/>
                      </Row>
                      <Row label="Logo Size">
                        <input type="range" min={40} max={160} value={design.logoSize} onChange={e=>u("logoSize",parseInt(e.target.value))} style={{ width:"100%" }}/>
                        <span style={{ fontSize:11, color:"#94A3B8" }}>{design.logoSize}px</span>
                      </Row>
                    </>}
                  </Section>
                  <Section label="Decoration">
                    <Row label="Show Seal"><Toggle value={design.showSeal} onChange={v=>u("showSeal",v)}/></Row>
                    {design.showSeal && <Row label="Seal Emoji"><input value={design.sealEmoji} onChange={e=>u("sealEmoji",e.target.value)} style={{ ...inp(), fontSize:24, textAlign:"center", width:60 }}/></Row>}
                    <Row label="Show Dividers"><Toggle value={design.showDividers} onChange={v=>u("showDividers",v)}/></Row>
                    {design.showDividers && <Row label="Divider Color"><ColorInput value={design.dividerColor} onChange={v=>u("dividerColor",v)}/></Row>}
                  </Section>
                </>
              )}

              {tab === "text" && (
                <>
                  <Section label="Top Label">
                    <Row label="Text"><input value={design.topLabel} onChange={e=>u("topLabel",e.target.value)} style={inp()}/></Row>
                    <Row label="Font"><FontSelect value={design.topLabelFont} onChange={v=>u("topLabelFont",v)}/></Row>
                    <Row label="Size"><SizeInput value={design.topLabelSize} onChange={v=>u("topLabelSize",v)}/></Row>
                    <Row label="Color"><ColorInput value={design.topLabelColor} onChange={v=>u("topLabelColor",v)}/></Row>
                    <Row label="Spacing"><input type="range" min={0} max={20} value={design.topLabelSpacing} onChange={e=>u("topLabelSpacing",parseInt(e.target.value))} style={{ width:"100%" }}/><span style={{ fontSize:11, color:"#94A3B8" }}>{design.topLabelSpacing}px</span></Row>
                  </Section>
                  <Section label="Certifies Text">
                    <Row label="Text"><input value={design.certifiesText} onChange={e=>u("certifiesText",e.target.value)} style={inp()}/></Row>
                    <Row label="Font"><FontSelect value={design.certifiesFont} onChange={v=>u("certifiesFont",v)}/></Row>
                    <Row label="Size"><SizeInput value={design.certifiesSize} onChange={v=>u("certifiesSize",v)}/></Row>
                    <Row label="Color"><ColorInput value={design.certifiesColor} onChange={v=>u("certifiesColor",v)}/></Row>
                  </Section>
                  <Section label="Completed Text">
                    <Row label="Text"><input value={design.completedText} onChange={e=>u("completedText",e.target.value)} style={inp()}/></Row>
                    <Row label="Font"><FontSelect value={design.completedFont} onChange={v=>u("completedFont",v)}/></Row>
                    <Row label="Size"><SizeInput value={design.completedSize} onChange={v=>u("completedSize",v)}/></Row>
                    <Row label="Color"><ColorInput value={design.completedColor} onChange={v=>u("completedColor",v)}/></Row>
                  </Section>
                  <Section label="Date">
                    <Row label="Show Date"><Toggle value={design.showDate} onChange={v=>u("showDate",v)}/></Row>
                    {design.showDate && <>
                      <Row label="Label"><input value={design.dateLabel} onChange={e=>u("dateLabel",e.target.value)} style={inp()}/></Row>
                      <Row label="Font"><FontSelect value={design.dateFont} onChange={v=>u("dateFont",v)}/></Row>
                      <Row label="Size"><SizeInput value={design.dateSize} onChange={v=>u("dateSize",v)}/></Row>
                      <Row label="Color"><ColorInput value={design.dateColor} onChange={v=>u("dateColor",v)}/></Row>
                    </>}
                  </Section>
                </>
              )}

              {tab === "name" && (
                <>
                  <Section label="Student Name">
                    <Row label="Font"><FontSelect value={design.nameFont} onChange={v=>u("nameFont",v)}/></Row>
                    <Row label="Size"><SizeInput value={design.nameSize} onChange={v=>u("nameSize",v)}/></Row>
                    <Row label="Color"><ColorInput value={design.nameColor} onChange={v=>u("nameColor",v)}/></Row>
                    <Row label="Bold"><Toggle value={design.nameBold} onChange={v=>u("nameBold",v)}/></Row>
                  </Section>
                  <Section label="Course Name">
                    <Row label="Font"><FontSelect value={design.courseFont} onChange={v=>u("courseFont",v)}/></Row>
                    <Row label="Size"><SizeInput value={design.courseSize} onChange={v=>u("courseSize",v)}/></Row>
                    <Row label="Color"><ColorInput value={design.courseColor} onChange={v=>u("courseColor",v)}/></Row>
                    <Row label="Bold"><Toggle value={design.courseBold} onChange={v=>u("courseBold",v)}/></Row>
                  </Section>
                </>
              )}

              {tab === "signature" && (
                <>
                  <Section label="Signature">
                    <Row label="Show"><Toggle value={design.showSignature} onChange={v=>u("showSignature",v)}/></Row>
                    {design.showSignature && <>
                      <Row label="Image URL">
                        <input value={design.signatureImage||""} onChange={e=>u("signatureImage",e.target.value)} placeholder="https://..." style={inp()}/>
                      </Row>
                      <Row label="Name"><input value={design.signatureName} onChange={e=>u("signatureName",e.target.value)} style={inp()}/></Row>
                      <Row label="Title"><input value={design.signatureTitle} onChange={e=>u("signatureTitle",e.target.value)} style={inp()}/></Row>
                      <Row label="Font"><FontSelect value={design.signatureFont} onChange={v=>u("signatureFont",v)}/></Row>
                      <Row label="Size"><SizeInput value={design.signatureSize} onChange={v=>u("signatureSize",v)}/></Row>
                      <Row label="Color"><ColorInput value={design.signatureColor} onChange={v=>u("signatureColor",v)}/></Row>
                    </>}
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* Right preview */}
          <div style={{ overflow:"auto", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
            <div style={{ width:"100%", maxWidth:800 }}>
              <p style={{ fontSize:12, color:"#64748B", textAlign:"center", marginBottom:12, fontWeight:600 }}>PREVIEW — {certType === "course" ? "Course" : "Challenge"} Certificate</p>
              <div ref={certRef}>
                <CertificatePreview design={design} name={SAMPLE.name} course={SAMPLE.course} date={SAMPLE.date}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

export function CertificatePreview({ design: d, name, course, date }) {
  return (
    <div style={{
      width:"100%",
      aspectRatio:"1.414/1",
      background:d.bgImage ? `url(${d.bgImage}) center/cover` : d.bgColor,
      border:`${d.borderWidth}px ${d.borderStyle} ${d.borderColor}`,
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      padding:"40px 60px",
      boxSizing:"border-box",
      position:"relative",
      fontFamily:d.nameFont,
      boxShadow:"0 8px 40px rgba(0,0,0,0.15)",
    }}>
      {/* Corner decorations */}
      {d.showDividers && <>
        <div style={{ position:"absolute", top:20, left:20, width:40, height:40, borderTop:`3px solid ${d.dividerColor}`, borderLeft:`3px solid ${d.dividerColor}` }}/>
        <div style={{ position:"absolute", top:20, right:20, width:40, height:40, borderTop:`3px solid ${d.dividerColor}`, borderRight:`3px solid ${d.dividerColor}` }}/>
        <div style={{ position:"absolute", bottom:20, left:20, width:40, height:40, borderBottom:`3px solid ${d.dividerColor}`, borderLeft:`3px solid ${d.dividerColor}` }}/>
        <div style={{ position:"absolute", bottom:20, right:20, width:40, height:40, borderBottom:`3px solid ${d.dividerColor}`, borderRight:`3px solid ${d.dividerColor}` }}/>
      </>}

      {/* Seal */}
      {d.showSeal && (
        <div style={{ position:"absolute", top:24, right:60, fontSize:48, opacity:0.15 }}>{d.sealEmoji}</div>
      )}

      {/* Logo */}
      {d.showLogo && d.logoUrl && (
        <img src={d.logoUrl} alt="Logo" style={{ height:d.logoSize, objectFit:"contain", marginBottom:16 }} crossOrigin="anonymous"/>
      )}

      {/* Top label */}
      <p style={{ fontFamily:d.topLabelFont, fontSize:d.topLabelSize, color:d.topLabelColor, letterSpacing:d.topLabelSpacing, textTransform:"uppercase", fontWeight:700, margin:"0 0 16px", textAlign:"center" }}>
        {d.topLabel}
      </p>

      {/* Divider */}
      {d.showDividers && <div style={{ width:120, height:2, background:`linear-gradient(to right, transparent, ${d.dividerColor}, transparent)`, marginBottom:20 }}/>}

      {/* Certifies */}
      <p style={{ fontFamily:d.certifiesFont, fontSize:d.certifiesSize, color:d.certifiesColor, margin:"0 0 10px", fontStyle:"italic", textAlign:"center" }}>
        {d.certifiesText}
      </p>

      {/* Student name */}
      <p style={{ fontFamily:d.nameFont, fontSize:d.nameSize, color:d.nameColor, fontWeight:d.nameBold?"700":"400", margin:"0 0 14px", textAlign:"center", lineHeight:1.2 }}>
        {name || "Student Name"}
      </p>

      {/* Divider */}
      {d.showDividers && <div style={{ width:200, height:1, background:`linear-gradient(to right, transparent, ${d.dividerColor}80, transparent)`, marginBottom:14 }}/>}

      {/* Completed text */}
      <p style={{ fontFamily:d.completedFont, fontSize:d.completedSize, color:d.completedColor, margin:"0 0 10px", fontStyle:"italic", textAlign:"center" }}>
        {d.completedText}
      </p>

      {/* Course name */}
      <p style={{ fontFamily:d.courseFont, fontSize:d.courseSize, color:d.courseColor, fontWeight:d.courseBold?"700":"400", margin:"0 0 20px", textAlign:"center", lineHeight:1.3 }}>
        {course || "Course Name"}
      </p>

      {/* Date */}
      {d.showDate && (
        <p style={{ fontFamily:d.dateFont, fontSize:d.dateSize, color:d.dateColor, margin:"0 0 24px", textAlign:"center" }}>
          {d.dateLabel} {date}
        </p>
      )}

      {/* Seal large */}
      {d.showSeal && (
        <div style={{ fontSize:40, marginBottom:16 }}>{d.sealEmoji}</div>
      )}

      {/* Signature */}
      {d.showSignature && (
        <div style={{ textAlign:"center" }}>
          {d.showDividers && <div style={{ width:120, height:1, background:`${d.dividerColor}40`, margin:"0 auto 8px" }}/>}
          {d.signatureImage && <img src={d.signatureImage} alt="Signature" style={{ height:40, objectFit:"contain", display:"block", margin:"0 auto 4px" }} crossOrigin="anonymous"/>}
          <p style={{ fontFamily:d.signatureFont, fontSize:d.signatureSize, color:d.signatureColor, margin:0, fontWeight:700 }}>{d.signatureName}</p>
          <p style={{ fontFamily:d.signatureFont, fontSize:d.signatureSize-1, color:d.dateColor, margin:0 }}>{d.signatureTitle}</p>
        </div>
      )}
    </div>
  );
}

// ── Small helpers ──
function Section({ label, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1.5px solid #E2E8F0", padding:14 }}>
      <p style={{ fontSize:10, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 12px" }}>{label}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>{children}</div>
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
      <span style={{ fontSize:12, color:"#374151", flexShrink:0, minWidth:70 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, justifyContent:"flex-end" }}>{children}</div>
    </div>
  );
}
function ColorInput({ value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <input type="color" value={value?.startsWith("#")?value:"#000000"} onChange={e=>onChange(e.target.value)} style={{ width:32, height:32, borderRadius:6, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2 }}/>
      <input value={value||""} onChange={e=>onChange(e.target.value)} style={{ ...inp(), width:90, fontSize:11 }}/>
    </div>
  );
}
function FontSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...inp(), width:160 }}>
      {["Georgia","Times New Roman","Arial","Helvetica","Palatino","Garamond","Didact Gothic"].map(f=><option key={f}>{f}</option>)}
    </select>
  );
}
function SizeInput({ value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      <button onClick={()=>onChange(Math.max(8,value-1))} style={fcb()}>−</button>
      <span style={{ fontSize:12, fontWeight:700, color:"#374151", minWidth:28, textAlign:"center" }}>{value}</span>
      <button onClick={()=>onChange(Math.min(80,value+1))} style={fcb()}>+</button>
    </div>
  );
}
function Toggle({ value, onChange }) {
  return (
    <button onClick={()=>onChange(!value)} style={{ width:40, height:22, borderRadius:999, border:"none", background:value?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
      <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?21:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}
const inp = () => ({ padding:"6px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", width:"100%", boxSizing:"border-box" });
const fcb = () => ({ width:24, height:24, borderRadius:6, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:0 });
