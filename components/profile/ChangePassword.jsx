"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Check, Loader } from "lucide-react";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!current || !newPw || !confirm) { setError("Please fill in all fields"); return; }
    if (newPw.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPw !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      // Verify current password by signing in
      const { data: { user } } = await supabase.auth.getUser();
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (signInErr) { setError("Current password is incorrect"); setLoading(false); return; }

      // Update password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) { setError(updateErr.message); setLoading(false); return; }

      // Send confirmation email
      const { data: { session } } = await supabase.auth.getSession();
      await fetch("/api/auth/password-changed", {
        method: "POST",
        headers: { "Authorization": "Bearer " + session?.access_token }
      });

      setSuccess(true);
      setCurrent(""); setNewPw(""); setConfirm("");
      setTimeout(() => setSuccess(false), 4000);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const strength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 4 : 3;
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];
  const strengthColor = ["","#ef4444","#f59e0b","#22c55e","#5B4EFF"][strength];

  return (
    <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
      <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>🔐 Change Password</h3>

      {success && (
        <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <Check size={16} color="#22c55e"/>
          <p style={{ fontSize:13, color:"#166534", fontWeight:600, margin:0 }}>Password changed successfully! A confirmation email has been sent.</p>
        </div>
      )}

      {error && (
        <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
          <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>{error}</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={lbl()}>Current Password</label>
          <div style={{ position:"relative" }}>
            <input type={showCurrent?"text":"password"} value={current} onChange={e=>setCurrent(e.target.value)} placeholder="Enter current password" style={{ ...inp(), paddingRight:44 }}/>
            <button onClick={() => setShowCurrent(!showCurrent)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color:"#94A3B8" }}>
              {showCurrent ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        <div>
          <label style={lbl()}>New Password</label>
          <div style={{ position:"relative" }}>
            <input type={showNew?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min 8 characters" style={{ ...inp(), paddingRight:44 }}/>
            <button onClick={() => setShowNew(!showNew)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", border:"none", background:"none", cursor:"pointer", color:"#94A3B8" }}>
              {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {newPw.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex:1, height:4, borderRadius:999, background:i<=strength?strengthColor:"#F1F5F9", transition:"background 0.2s" }}/>
                ))}
              </div>
              <p style={{ fontSize:11, color:strengthColor, fontWeight:600, margin:0 }}>{strengthLabel}</p>
            </div>
          )}
        </div>

        <div>
          <label style={lbl()}>Confirm New Password</label>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter new password"
            style={{ ...inp(), borderColor: confirm && newPw && confirm !== newPw ? "#ef4444" : "#E2E8F0" }}/>
          {confirm && newPw && confirm !== newPw && <p style={{ fontSize:11, color:"#ef4444", margin:"4px 0 0" }}>Passwords do not match</p>}
        </div>

        <button onClick={handle} disabled={loading}
          style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading ? <><Loader size={16} className="bspin"/> Changing...</> : "Change Password"}
        </button>
      </div>
    </div>
  );
}

const lbl = () => ({ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"12px 16px", borderRadius:12, border:"2px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" });
