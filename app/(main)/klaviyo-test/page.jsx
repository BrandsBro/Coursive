"use client";
import { useState } from "react";

export default function KlaviyoTest() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const testLead = async () => {
    setLoading(true);
    const res = await fetch("/api/klaviyo-test/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    setStatus("Lead: " + JSON.stringify(data));
    setLoading(false);
  };

  const testCustomer = async () => {
    setLoading(true);
    const res = await fetch("/api/klaviyo-test/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, plan: "4-Week Plan", amount: 19.99 }),
    });
    const data = await res.json();
    setStatus("Customer: " + JSON.stringify(data));
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, width:400, boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:24 }}>Klaviyo Test</h1>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name"
          style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", marginBottom:12, boxSizing:"border-box" }}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"
          style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", marginBottom:16, boxSizing:"border-box" }}/>
        <button onClick={testLead} disabled={loading}
          style={{ width:"100%", padding:"12px", borderRadius:8, border:"none", background:"#5B4EFF", color:"#fff", fontWeight:700, marginBottom:10, cursor:"pointer" }}>
          Test Add to Leads List
        </button>
        <button onClick={testCustomer} disabled={loading}
          style={{ width:"100%", padding:"12px", borderRadius:8, border:"none", background:"#22c55e", color:"#fff", fontWeight:700, cursor:"pointer" }}>
          Test Add to Customers List
        </button>
        {status && <p style={{ marginTop:16, fontSize:13, color:"#374151", wordBreak:"break-all" }}>{status}</p>}
      </div>
    </div>
  );
}
