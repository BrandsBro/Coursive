"use client";
import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Mail, Loader, UserX, TrendingUp, Calendar, Clock, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showBD, setShowBD] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(l => l.converted).length;
    const unconverted = total - converted;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    const today = leads.filter(l => new Date(l.created_at) >= todayStart).length;
    const thisWeek = leads.filter(l => new Date(l.created_at) >= weekStart).length;
    const thisMonth = leads.filter(l => new Date(l.created_at) >= monthStart).length;
    const emailsSent = leads.filter(l => l.email1_sent).length;
    const emailRate = total > 0 ? Math.round((emailsSent / total) * 100) : 0;

    // Yesterday comparison
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterday = leads.filter(l => {
      const d = new Date(l.created_at);
      return d >= yesterdayStart && d < todayStart;
    }).length;
    const todayGrowth = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : today > 0 ? 100 : 0;

    return { total, converted, unconverted, conversionRate, today, thisWeek, thisMonth, emailsSent, emailRate, todayGrowth, yesterday };
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.email?.toLowerCase().includes(search.toLowerCase()) || l.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filter === "all" || (filter === "unconverted" && !l.converted) || (filter === "converted" && l.converted) || (filter === "emailed" && l.email1_sent);
      const d = new Date(l.created_at);
      const matchDate = dateFilter === "all" || (dateFilter === "today" && d >= todayStart) || (dateFilter === "week" && d >= weekStart) || (dateFilter === "month" && d >= monthStart);
      return matchSearch && matchStatus && matchDate;
    });
  }, [leads, search, filter, dateFilter]);

  const formatDate = (iso) => new Date(iso).toLocaleString("en-US", {
    timeZone: showBD ? "Asia/Dhaka" : "America/New_York",
    month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit"
  });

  const inp = { padding:"9px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#fff" };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Leads</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Quiz signups and conversion tracking</p>
          </div>
          <select value={showBD ? "bd" : "us"} onChange={e => setShowBD(e.target.value === "bd")}
            style={{ ...inp, fontWeight:700, cursor:"pointer" }}>
            <option value="us">🇺🇸 US Time (EST)</option>
            <option value="bd">🇧🇩 BD Time (BST)</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Today", value:stats.today, sub: stats.todayGrowth >= 0 ? `+${stats.todayGrowth}% vs yesterday` : `${stats.todayGrowth}% vs yesterday`, color:"#6366f1", bg:"#EEF2FF", icon:"📅" },
            { label:"This Week", value:stats.thisWeek, sub:`${stats.thisMonth} this month`, color:"#f59e0b", bg:"#FFFBEB", icon:"📆" },
            { label:"Total Leads", value:stats.total, sub:`${stats.unconverted} not purchased`, color:"#0ea5e9", bg:"#F0F9FF", icon:"👥" },
            { label:"Converted", value:stats.converted, sub:`${stats.conversionRate}% conversion rate`, color:"#22c55e", bg:"#F0FDF4", icon:"✅" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:16, padding:"18px 20px", border:"1.5px solid #F1F5F9", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <span style={{ fontSize:10, fontWeight:700, color:s.color, background:s.bg, padding:"2px 8px", borderRadius:999, textTransform:"uppercase" }}>{s.label}</span>
              </div>
              <p style={{ fontSize:32, fontWeight:900, color:s.color, margin:"0 0 4px" }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Email Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { label:"Email 1 Sent", value:leads.filter(l=>l.email1_sent).length, total:stats.total, color:"#8b5cf6" },
            { label:"Email 2 Sent", value:leads.filter(l=>l.email2_sent).length, total:stats.total, color:"#ec4899" },
            { label:"Email 3 Sent", value:leads.filter(l=>l.email3_sent).length, total:stats.total, color:"#f97316" },
          ].map((s,i) => {
            const pct = s.total > 0 ? Math.round((s.value/s.total)*100) : 0;
            return (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:"14px 18px", border:"1.5px solid #F1F5F9" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#64748B", margin:0 }}>{s.label}</p>
                  <p style={{ fontSize:13, fontWeight:900, color:s.color, margin:0 }}>{s.value} <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>({pct}%)</span></p>
                </div>
                <div style={{ height:6, borderRadius:999, background:"#F1F5F9" }}>
                  <div style={{ height:"100%", borderRadius:999, background:s.color, width:`${pct}%`, transition:"width 0.5s ease" }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ background:"#fff", borderRadius:16, padding:"14px 18px", border:"1.5px solid #F1F5F9", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:200, background:"#F8FAFC", borderRadius:10, padding:"0 12px", border:"1.5px solid #E2E8F0" }}>
            <Search size={14} color="#94A3B8"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
              style={{ border:"none", background:"transparent", fontSize:13, outline:"none", padding:"9px 0", width:"100%" }}/>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
            <option value="all">All Status</option>
            <option value="unconverted">Not Purchased</option>
            <option value="converted">Converted</option>
            <option value="emailed">Email Sent</option>
          </select>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <div style={{ fontSize:12, color:"#94A3B8", fontWeight:600 }}>
            {filtered.length} of {leads.length} leads
          </div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          {loading ? (
            <div style={{ padding:40, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="animate-spin"/></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <UserX size={40} color="#E2E8F0" style={{ margin:"0 auto 12px" }}/>
              <p style={{ color:"#94A3B8", fontSize:14 }}>No leads found</p>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F8FAFC" }}>
                  {["Name","Email","Emails","Status",showBD?"Date (BD)":"Date (US)"].map(h => (
                    <th key={h} style={{ padding:"11px 16px", fontSize:11, fontWeight:700, color:"#94A3B8", textAlign:"left", textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const emailCount = [lead.email1_sent, lead.email2_sent, lead.email3_sent].filter(Boolean).length;
                  const isNew = new Date(lead.created_at) >= todayStart;
                  return (
                    <tr key={lead.id} style={{ borderTop:"1px solid #F1F5F9", background: i%2===0?"#fff":"#FAFAFA" }}>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>
                            {(lead.name||"?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{lead.name||"—"}</p>
                            {isNew && <span style={{ fontSize:9, fontWeight:700, color:"#22c55e", background:"#F0FDF4", padding:"1px 6px", borderRadius:999 }}>NEW</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px" }}>
                        <a href={`mailto:${lead.email}`} style={{ fontSize:13, color:"#5B4EFF", textDecoration:"none", fontWeight:500 }}>{lead.email}</a>
                      </td>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", gap:4 }}>
                          {[lead.email1_sent, lead.email2_sent, lead.email3_sent].map((sent, j) => (
                            <div key={j} style={{ width:20, height:20, borderRadius:6, background:sent?"#22c55e":"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <span style={{ fontSize:9, color:sent?"#fff":"#94A3B8", fontWeight:700 }}>{j+1}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:"13px 16px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:lead.converted?"#F0FDF4":"#FFF7ED", color:lead.converted?"#16a34a":"#ea580c" }}>
                          {lead.converted ? "✅ Converted" : "⏳ Not purchased"}
                        </span>
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:12, color:"#64748B" }}>
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
