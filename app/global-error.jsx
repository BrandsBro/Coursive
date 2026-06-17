"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC", padding:20, fontFamily:"system-ui" }}>
          <div style={{ textAlign:"center", maxWidth:420 }}>
            <div style={{ fontSize:72, marginBottom:8 }}>🛠️</div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Application error</h1>
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 24px" }}>Please try again.</p>
            <button onClick={() => reset()} style={{ padding:"12px 24px", borderRadius:14, border:"none", background:"#4f46e5", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
