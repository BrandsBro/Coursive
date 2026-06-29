"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, RefreshCw, Check, X, Plus, Edit2, Loader } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STATUS_COLORS = {
  active:    { bg:"#F0FDF4", color:"#166534", border:"#BBF7D0" },
  expired:   { bg:"#FEF2F2", color:"#991B1B", border:"#FECACA" },
  cancelled: { bg:"#F8FAFC", color:"#64748B", border:"#E2E8F0" },
};

export default function PaymentControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*, payment_history(*)")
      .order("created_at", { ascending: false });

    if (!subs) { setLoading(false); return; }

    // Get user emails from auth
    const userIds = [...new Set(subs.map(s => s.user_id))];
    const userData = [];
    for (const id of userIds) {
      const sub = subs.filter(s => s.user_id === id);
      userData.push({ id, subs: sub, latestSub: sub[0] });
    }

    // Get profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const merged = userData.map(u => ({
      ...u,
      profile: profiles?.find(p => p.id === u.id) || {},
    }));

    setUsers(merged);
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = users.filter(u => {
    const name = u.profile?.full_name || "";
    const email = u.profile?.email || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                       email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.latestSub?.status === filter;
    return matchSearch && matchFilter;
  });

  const daysLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Payment Control</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>{users.length} subscribers total</p>
          </div>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { label:"Active", value:users.filter(u=>u.latestSub?.status==="active").length, color:"#22c55e" },
            { label:"Expired", value:users.filter(u=>u.latestSub?.status==="expired").length, color:"#ef4444" },
            { label:"Auto-renew", value:users.filter(u=>u.latestSub?.type==="recurring").length, color:"#6366f1" },
            { label:"One-time", value:users.filter(u=>u.latestSub?.type==="one_time").length, color:"#f59e0b" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, padding:"20px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize:13, color:"#64748B", margin:"0 0 8px" }}>{s.label}</p>
              <p style={{ fontSize:32, fontWeight:900, color:s.color, margin:0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width:"100%", padding:"10px 12px 10px 36px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          {["all","active","expired","cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"9px 16px", borderRadius:10, border:`1.5px solid ${filter===f?"#5B4EFF":"#E2E8F0"}`, background:filter===f?"#EEF2FF":"#fff", color:filter===f?"#5B4EFF":"#64748B", fontSize:13, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
                {["User","Plan","Type","Status","Started","Expires","Days Left","Actions"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", fontSize:11, fontWeight:700, color:"#64748B", textAlign:"left", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No subscribers found</td></tr>
              ) : filtered.map(u => {
                const sub = u.latestSub;
                if (!sub) return null;
                const sc = STATUS_COLORS[sub.status] || STATUS_COLORS.cancelled;
                const days = daysLeft(sub.expires_at);
                return (
                  <tr key={u.id} style={{ borderBottom:"1px solid #F8FAFC" }} onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                          {(u.profile?.full_name||"?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{u.profile?.full_name||"Unknown"}</p>
                          <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{u.profile?.email||u.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{sub.plan}</span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:999, background:sub.type==="recurring"?"#EEF2FF":"#FFFBEB", color:sub.type==="recurring"?"#6366f1":"#d97706" }}>
                        {sub.type==="recurring"?"🔄 Auto":"1x One-time"}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:999, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:12, color:"#64748B" }}>
                      {new Date(sub.started_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:12, color:"#64748B" }}>
                      {new Date(sub.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:13, fontWeight:800, color:days<=3?"#ef4444":days<=7?"#f59e0b":"#22c55e" }}>
                        {days > 0 ? `${days}d` : "Expired"}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <button onClick={() => { setSelectedUser(u); setShowModal(true); }}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#374151" }}>
                        <Edit2 size={12}/> Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Modal */}
      {showModal && selectedUser && (
        <ManageModal user={selectedUser} onClose={() => { setShowModal(false); setSelectedUser(null); }} onSave={() => { load(); showToast("Changes saved!"); setShowModal(false); }}/>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"#0f172a", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", zIndex:999 }}>
          ✅ {toast}
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function ManageModal({ user, onClose, onSave }) {
  const sub = user.latestSub;
  const [status, setStatus] = useState(sub?.status || "active");
  const [plan, setPlan] = useState(sub?.plan || "4-Week Plan");
  const [type, setType] = useState(sub?.type || "one_time");
  const [extendDays, setExtendDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("details");

  const save = async () => {
    setSaving(true);
    const updates = { status, plan, type };
    if (extendDays > 0) {
      const current = new Date(sub.expires_at);
      const newExpiry = new Date(current.getTime() + extendDays * 24 * 60 * 60 * 1000);
      updates.expires_at = newExpiry.toISOString();
      if (status === "expired") updates.status = "active";
    }
    await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      .from("subscriptions").update(updates).eq("id", sub.id);
    setSaving(false);
    onSave();
  };

  const cancel = async () => {
    setSaving(true);
    await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      .from("subscriptions").update({ status:"cancelled", cancelled_at: new Date().toISOString() }).eq("id", sub.id);
    setSaving(false);
    onSave();
  };

  const activate = async () => {
    setSaving(true);
    const newExpiry = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
    await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      .from("subscriptions").update({ status:"active", expires_at: newExpiry.toISOString() }).eq("id", sub.id);
    setSaving(false);
    onSave();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:520, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16 }}>
              {(user.profile?.full_name||"?")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{user.profile?.full_name||"Unknown"}</p>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{user.profile?.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #F1F5F9" }}>
          {["details","extend","history"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"12px", border:"none", background:"transparent", fontWeight:700, fontSize:13, color:tab===t?"#5B4EFF":"#64748B", borderBottom:tab===t?"2px solid #5B4EFF":"2px solid transparent", cursor:"pointer", textTransform:"capitalize" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding:24 }}>
          {tab === "details" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Row label="Status">
                <select value={status} onChange={e=>setStatus(e.target.value)} style={inp()}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Row>
              <Row label="Plan">
                <select value={plan} onChange={e=>setPlan(e.target.value)} style={inp()}>
                  <option>1-Week Plan</option>
                  <option>4-Week Plan</option>
                  <option>12-Week Plan</option>
                </select>
              </Row>
              <Row label="Type">
                <select value={type} onChange={e=>setType(e.target.value)} style={inp()}>
                  <option value="one_time">One-time</option>
                  <option value="recurring">Auto-renew</option>
                </select>
              </Row>
              <Row label="Expires">
                <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>
                  {new Date(sub?.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
                </p>
              </Row>
              <Row label="Amount paid">
                <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>${sub?.amount_paid}</p>
              </Row>
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button onClick={save} disabled={saving} style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                  {saving?"Saving...":"Save Changes"}
                </button>
                {sub?.status !== "cancelled" && (
                  <button onClick={cancel} disabled={saving} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid #FEE2E2", background:"#fff", color:"#ef4444", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Cancel
                  </button>
                )}
                {sub?.status !== "active" && (
                  <button onClick={activate} disabled={saving} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid #BBF7D0", background:"#F0FDF4", color:"#16a34a", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Activate
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "extend" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <p style={{ fontSize:14, color:"#64748B", margin:0 }}>Add extra days to the user's subscription:</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[7,14,28,30,60,90].map(d => (
                  <button key={d} onClick={() => setExtendDays(d)}
                    style={{ padding:"12px", borderRadius:12, border:`1.5px solid ${extendDays===d?"#5B4EFF":"#E2E8F0"}`, background:extendDays===d?"#EEF2FF":"#F8FAFC", color:extendDays===d?"#5B4EFF":"#374151", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    +{d} days
                  </button>
                ))}
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>Custom days</label>
                <input type="number" value={extendDays} onChange={e=>setExtendDays(parseInt(e.target.value)||0)} style={inp()}/>
              </div>
              {extendDays > 0 && (
                <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"12px 16px" }}>
                  <p style={{ fontSize:13, color:"#166834", fontWeight:600, margin:0 }}>
                    New expiry: {new Date(new Date(sub?.expires_at).getTime() + extendDays*24*60*60*1000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
                  </p>
                </div>
              )}
              <button onClick={save} disabled={saving||extendDays===0} style={{ padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontWeight:700, fontSize:14, cursor:extendDays===0?"not-allowed":"pointer", opacity:extendDays===0?0.6:1 }}>
                {saving?"Saving...":"Extend Access"}
              </button>
            </div>
          )}

          {tab === "history" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {(user.subs||[]).map((s,i) => (
                <div key={i} style={{ padding:"14px 16px", borderRadius:12, border:"1.5px solid #F1F5F9", background:"#F8FAFC" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{s.plan}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#5B4EFF" }}>${s.amount_paid}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{new Date(s.started_at).toLocaleDateString()}</span>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999, background:STATUS_COLORS[s.status]?.bg, color:STATUS_COLORS[s.status]?.color }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
      <span style={{ fontSize:13, color:"#64748B", fontWeight:600, flexShrink:0, width:100 }}>{label}</span>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );
}



const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" });
