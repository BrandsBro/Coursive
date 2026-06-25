"use client";
import { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";

export default function SupportSection() {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !message) return;
    setSent(true);
  };

  return (
    <section id="support" style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>SUPPORT CENTER</p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 26 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>How can we <span style={{ color:"#5B4EFF" }}>help you?</span></h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 48px" }}>Our support team is here to help you 24/7.</p>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:32 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { icon:"📧", title:"Email Support", desc:"Get a response within 24 hours", action:"support@coursiv.io" },
              { icon:"💬", title:"Live Chat", desc:"Chat with us in real time", action:"Available 9am - 6pm EST" },
              { icon:"📖", title:"Help Center", desc:"Browse our knowledge base", action:"Browse articles →" },
              { icon:"🎥", title:"Video Tutorials", desc:"Watch step-by-step guides", action:"Watch now →" },
            ].map((item,i) => (
              <div key={i} style={{ display:"flex", gap:14, alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"16px 18px" }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"rgba(91,78,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 2px" }}>{item.title}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>{item.desc}</p>
                  <p style={{ fontSize:12, color:"#a78bfa", margin:0, fontWeight:600 }}>{item.action}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:24 }}>
            <h3 style={{ fontSize:20, fontWeight:800, color:"#fff", margin:"0 0 20px" }}>Send us a message</h3>
            {sent ? (
              <div style={{ textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <h4 style={{ fontSize:18, fontWeight:800, color:"#fff", margin:"0 0 8px" }}>Message sent!</h4>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", margin:0 }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { label:"YOUR NAME", value:name, set:setName, placeholder:"John Smith", type:"text" },
                  { label:"EMAIL ADDRESS", value:email, set:setEmail, placeholder:"john@gmail.com", type:"email" },
                ].map((f,i) => (
                  <div key={i}>
                    <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>{f.label}</label>
                    <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} type={f.type}
                      style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:14, outline:"none", boxSizing:"border-box" }}
                      onFocus={e=>e.target.style.borderColor="rgba(91,78,255,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6 }}>MESSAGE</label>
                  <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="How can we help you?"
                    style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:14, outline:"none", boxSizing:"border-box", minHeight:120, resize:"vertical" }}
                    onFocus={e=>e.target.style.borderColor="rgba(91,78,255,0.6)"}
                    onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
                </div>
                <button onClick={handleSubmit} style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  Send Message →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
