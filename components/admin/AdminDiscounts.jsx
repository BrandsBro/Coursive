"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Trash2, Copy, Check, Tag, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMPTY = { code:"", type:"percentage", value:"", max_uses:"", expires_at:"", active:true };

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
    setDiscounts(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.code.trim() || !form.value) return;
    setSaving(true);
    if (editingId) {
      await supabase.from("discounts").update({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }).eq("id", editingId);
    } else {
      await supabase.from("discounts").insert({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: parseFloat(form.value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        active: true,
      });
    }
    setForm(EMPTY);
    setShowForm(false);
    setEditingId(null);
    await load();
    setSaving(false);
  };

  const openEdit = (d) => {
    setForm({ code:d.code, type:d.type, value:String(d.value), max_uses:d.max_uses||"", expires_at:d.expires_at?d.expires_at.split("T")[0]:"", active:d.active });
    setEditingId(d.id);
    setShowForm(true);
  };

  const toggleActive = async (id, active) => {
    await supabase.from("discounts").update({ active: !active }).eq("id", id);
    setDiscounts(d => d.map(x => x.id === id ? { ...x, active: !active } : x));
  };

  const deleteDiscount = async (id) => {
    if (!confirm("Delete this discount?")) return;
    await supabase.from("discounts").delete().eq("id", id);
    setDiscounts(d => d.filter(x => x.id !== id));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Discount Codes</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Create coupon codes for percentage or fixed discounts</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            <Plus size={16}/> New Code
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { label:"Total Codes", value:discounts.length, color:"#6366f1" },
            { label:"Active", value:discounts.filter(d=>d.active).length, color:"#22c55e" },
            { label:"Total Uses", value:discounts.reduce((s,d)=>s+d.uses,0), color:"#f59e0b" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, padding:"20px", border:"1.5px solid #F1F5F9" }}>
              <p style={{ fontSize:28, fontWeight:900, color:s.color, margin:0 }}>{s.value}</p>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"4px 0 0", fontWeight:600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Discounts list */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>Loading...</div>
          ) : discounts.length === 0 ? (
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🏷️</div>
              <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No discount codes yet</h3>
              <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Create your first discount code</p>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F8FAFC" }}>
                  {["Code","Type","Value","Uses","Expires","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", fontSize:11, fontWeight:700, color:"#94A3B8", textAlign:"left", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id} style={{ borderTop:"1px solid #F1F5F9" }}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:14, fontWeight:800, color:"#0f172a", fontFamily:"monospace", background:"#F8FAFC", padding:"4px 10px", borderRadius:8 }}>{d.code}</span>
                        <button onClick={() => copyCode(d.code)} style={{ width:28, height:28, borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {copied === d.code ? <Check size={12} color="#22c55e"/> : <Copy size={12} color="#94A3B8"/>}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:999, background:d.type==="percentage"?"#EEF2FF":"#FFF7ED", color:d.type==="percentage"?"#5B4EFF":"#f97316" }}>
                        {d.type === "percentage" ? "%" : "$"} {d.type}
                      </span>
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:14, fontWeight:700, color:"#0f172a" }}>
                      {d.type === "percentage" ? `${d.value}%` : `$${d.value}`}
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:13, color:"#64748B" }}>
                      {d.uses}{d.max_uses ? `/${d.max_uses}` : ""}
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:12, color:"#94A3B8" }}>
                      {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <button onClick={() => toggleActive(d.id, d.active)}
                        style={{ width:44, height:24, borderRadius:999, border:"none", background:d.active?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative" }}>
                        <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:d.active?22:3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                      </button>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <button onClick={() => openEdit(d)}
                        style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1", marginRight:4 }}>
                        <Edit2 size={14}/>
                      </button>
                    <button onClick={() => deleteDiscount(d.id)}
                        style={{ width:32, height:32, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444" }}>
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create form modal */}
        {showForm && (
          <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <div style={{ background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", padding:"24px 28px", borderRadius:"24px 24px 0 0", display:"flex", alignItems:"center", gap:12 }}>
                <Tag size={20} color="#fff"/>
                <h2 style={{ color:"#fff", fontSize:18, fontWeight:900, margin:0 }}>{editingId ? "Edit Discount Code" : "New Discount Code"}</h2>
              </div>
              <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Code</p>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20" style={{ ...inp, fontFamily:"monospace", fontWeight:700, fontSize:15, letterSpacing:1 }}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Type</p>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Value</p>
                    <input type="number" min="1" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 5"} style={inp}/>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Max Uses <span style={{ fontWeight:400, textTransform:"none" }}>(optional)</span></p>
                    <input type="number" min="1" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                      placeholder="Unlimited" style={inp}/>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 6px", textTransform:"uppercase" }}>Expires <span style={{ fontWeight:400, textTransform:"none" }}>(optional)</span></p>
                    <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} style={inp}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:8 }}>
                  <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY); }}
                    style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                    Cancel
                  </button>
                  <button onClick={save} disabled={saving || !form.code || !form.value}
                    style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", opacity:saving||!form.code||!form.value?0.6:1 }}>
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Create Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
