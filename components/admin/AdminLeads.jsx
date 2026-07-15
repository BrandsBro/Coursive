"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Mail, Loader, UserX } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("unconverted");
  const [showBD, setShowBD] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.email?.toLowerCase().includes(search.toLowerCase()) || l.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "unconverted" && !l.converted) || (filter === "converted" && l.converted);
    return matchSearch && matchFilter;
  });

  const unconverted = leads.filter(l => !l.converted).length;
  const converted = leads.filter(l => l.converted).length;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Leads</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Users who filled the quiz but didn't purchase</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { label:"Total Leads", value:leads.length, color:"#6366f1", bg:"#EEF2FF" },
            { label:"Not Purchased", value:unconverted, color:"#ef4444", bg:"#FEF2F2" },
            { label:"Converted", value:converted, color:"#22c55e", bg:"#F0FDF4" },
          ].map((s,i) => (
            <div key={i} style={{ background:s.bg, borderRadius:16, padding:"16px 20px", border:`1.5px solid ${s.color}20` }}>
              <p style={{ fontSize:24, fontWeight:900, color:s.color, margin:0 }}>{s.value}</p>
              <p style={{ fontSize:12, color:"#64748B", margin:"4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={14} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <select value={showBD ? "bd" : "us"} onChange={e => setShowBD(e.target.value === "bd")}
            style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", outline:"none", color:"#374151" }}>
            <option value="us">🇺🇸 US Time (EST)</option>
            <option value="bd">🇧🇩 BD Time (BST)</option>
          </select>
          <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:10, padding:3 }}>
            {[["unconverted","Not Purchased"],["converted","Converted"],["all","All"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                style={{ padding:"7px 12px", borderRadius:7, border:"none", background:filter===v?"#fff":"transparent", color:filter===v?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:filter===v?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={24} color="#94A3B8"/></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:60, textAlign:"center", color:"#94A3B8" }}>
            <UserX size={32} style={{ margin:"0 auto 12px", display:"block" }}/>
            <p style={{ fontSize:14, margin:0 }}>No leads found</p>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F8FAFC" }}>
                  {["Name","Email","Status", showBD ? "Date (BD)" : "Date (US)"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", fontSize:11, fontWeight:700, color:"#94A3B8", textAlign:"left", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} style={{ borderTop:"1px solid #F1F5F9" }}
                    onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background="#fff"}>
                    <td style={{ padding:"12px 16px", fontSize:14, fontWeight:600, color:"#0f172a" }}>{lead.name || "—"}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <a href={`mailto:${lead.email}`} style={{ fontSize:13, color:"#5B4EFF", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
                        <Mail size={13}/> {lead.email}
                      </a>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:lead.converted?"#F0FDF4":"#FEF2F2", color:lead.converted?"#166534":"#dc2626" }}>
                        {lead.converted ? "✓ Purchased" : "Not purchased"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:12, color:"#94A3B8" }}>
                      {showBD
                        ? new Date(lead.created_at).toLocaleString("en-US", { timeZone:"Asia/Dhaka", month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })
                        : new Date(lead.created_at).toLocaleString("en-US", { timeZone:"America/New_York", month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
