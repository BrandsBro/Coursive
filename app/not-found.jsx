import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:72, marginBottom:8 }}>🧭</div>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Page not found</h1>
        <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px", lineHeight:1.6 }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:14, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 4px 14px rgba(124,58,237,0.35)" }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
