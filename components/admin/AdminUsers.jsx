"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Shield, ShieldOff, Trash2, Users, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_admin, created_at, avatar_url")
        .order("created_at", { ascending: false });
      if (error) console.error("Users error:", error);
      setUsers(data || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleAdmin = async (id, current) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_admin: !current })
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !current } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const timeAgo = (d) => {
    const days = Math.floor((Date.now()-new Date(d).getTime())/86400000);
    if (days===0) return "Today";
    if (days===1) return "Yesterday";
    if (days<30) return days+"d ago";
    return Math.floor(days/30)+"mo ago";
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name||"").toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="admin" && u.is_admin) || (filter==="user" && !u.is_admin);
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Users</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{users.length} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={15} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12, padding:3 }}>
            {[["all","All"],["admin","Admins"],["user","Users"]].map(([val,label]) => (
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:"7px 14px", borderRadius:9, border:"none", background:filter===val?"#fff":"transparent", color:filter===val?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:filter===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr auto auto auto", gap:16, padding:"12px 20px", background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
            {["Name","Email","Role","Joined","Actions"].map(h => (
              <p key={h} style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:48, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
          ) : filtered.map((u, i) => (
            <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr auto auto auto", gap:16, padding:"14px 20px", alignItems:"center", borderBottom:i<filtered.length-1?"1px solid #F8FAFC":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0, overflow:"hidden" }}>
                  {u.avatar_url ? <img src={u.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (u.full_name||"?")[0].toUpperCase()}
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.full_name||"No name"}</p>
              </div>
              <p style={{ fontSize:12, color:"#64748B", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:u.is_admin?"#EEF2FF":"#F8FAFC", color:u.is_admin?"#6366f1":"#94A3B8", whiteSpace:"nowrap" }}>
                {u.is_admin?"Admin":"User"}
              </span>
              <span style={{ fontSize:12, color:"#94A3B8", whiteSpace:"nowrap" }}>{timeAgo(u.created_at)}</span>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>toggleAdmin(u.id,u.is_admin)} title={u.is_admin?"Remove admin":"Make admin"} style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${u.is_admin?"#FEE2E2":"#E2E8F0"}`, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {u.is_admin ? <ShieldOff size={13} color="#EF4444"/> : <Shield size={13} color="#6366f1"/>}
                </button>
                {deleteTarget===u.id ? (
                  <>
                    <button onClick={()=>deleteUser(u.id)} style={{ padding:"4px 8px", borderRadius:7, border:"none", background:"#EF4444", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={()=>setDeleteTarget(null)} style={{ padding:"4px 8px", borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, cursor:"pointer" }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>setDeleteTarget(u.id)} style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trash2 size={13} color="#EF4444"/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && filtered.length===0 && (
            <div style={{ padding:48, textAlign:"center" }}>
              <Users size={32} color="#E2E8F0" style={{ margin:"0 auto 12px" }}/>
              <p style={{ color:"#94A3B8", fontSize:14 }}>No users found</p>
            </div>
          )}
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
