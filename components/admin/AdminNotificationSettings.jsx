
"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader, Plus, Trash2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminNotificationSettings() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("value").eq("key","admin_notifications").single();
    if (data?.value?.emails) setEmails(data.value.emails);
    setLoading(false);
  };

  const save = async (updatedEmails) => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"admin_notifications", value:{ emails: updatedEmails } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes("@")) return;
    if (emails.includes(newEmail)) return;
    const updated = [...emails, newEmail];
    setEmails(updated);
    setNewEmail("");
    save(updated);
  };

  const removeEmail = (email) => {
    const updated = emails.filter(e => e !== email);
    setEmails(updated);
    save(updated);
  };

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Admin Notifications</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Emails that receive alerts when a new purchase is made</p>
          </div>
          {saved && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, background:"#F0FDF4", border:"1px solid #BBF7D0" }}>
              <Check size={14} color="#22c55e"/>
              <span style={{ fontSize:13, fontWeight:700, color:"#166534" }}>Saved!</span>
            </div>
          )}
        </div>

        {/* Add email */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24, marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Add Notification Email</h3>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ position:"relative", flex:1 }}>
              <Mail size={14} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
              <input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                placeholder="admin@example.com"
                type="email"
                style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:11, paddingBottom:11, borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}
              />
            </div>
            <button onClick={addEmail} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"11px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              <Plus size={14}/> Add
            </button>
          </div>
        </div>

        {/* Email list */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>
            Notification Recipients ({emails.length})
          </h3>
          {emails.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px 20px", color:"#94A3B8" }}>
              <Mail size={32} style={{ margin:"0 auto 10px", display:"block" }}/>
              <p style={{ fontSize:14, margin:0 }}>No emails added yet</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {emails.map((email, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"#F8FAFC", borderRadius:12, border:"1.5px solid #E2E8F0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Mail size={14} color="#fff"/>
                    </div>
                    <span style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>{email}</span>
                  </div>
                  <button onClick={() => removeEmail(email)}
                    style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div style={{ background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:16, padding:20, marginTop:20 }}>
          <h3 style={{ fontSize:14, fontWeight:800, color:"#4338CA", margin:"0 0 8px" }}>📬 What gets sent?</h3>
          <p style={{ fontSize:13, color:"#4338CA", margin:0, lineHeight:1.6 }}>
            When a new user purchases any plan, all recipients above will receive an email with the buyer name, email, plan, and amount paid.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
