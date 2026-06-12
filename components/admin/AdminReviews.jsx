"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Check, X, Trash2, Star, Loader, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const approve = async (id) => {
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };

  const reject = async (id) => {
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: false, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: false } : r));
  };

  const del = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r =>
    filter === "all" ? true :
    filter === "pending" ? !r.approved :
    r.approved
  );

  const pending = reviews.filter(r => !r.approved).length;
  const approved = reviews.filter(r => r.approved).length;

  const inits = (n) => n ? n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) : "?";

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Reviews</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>
              {pending > 0 && <span style={{ color:"#f97316", fontWeight:700 }}>{pending} pending approval · </span>}
              {approved} approved · {reviews.length} total
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12, padding:3, width:"fit-content" }}>
          {[["pending","⏳ Pending"], ["approved","✅ Approved"], ["all","All"]].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:"8px 16px", borderRadius:9, border:"none", background:filter===val?"#fff":"transparent", color:filter===val?"#0f172a":"#64748B", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:filter===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
            <MessageSquare size={32} color="#E2E8F0" style={{ margin:"0 auto 12px" }}/>
            <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>No reviews</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>
              {filter === "pending" ? "All reviews have been reviewed" : "No reviews found"}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${r.approved?"#E2E8F0":"#FED7AA"}`, padding:"18px 22px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

                {/* Status badge */}
                {!r.approved && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:999, padding:"3px 10px", marginBottom:12 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#f97316" }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:"#c2410c" }}>Pending Approval</span>
                  </div>
                )}

                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  {/* Avatar */}
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:800, flexShrink:0, overflow:"hidden" }}>
                    {r.profile?.avatar_url
                      ? <img src={r.profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                      : inits(r.profile?.full_name || r.profile?.email)}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Name + course + stars */}
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>
                          {r.profile?.full_name || r.profile?.email || "Unknown user"}
                        </p>
                        <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 6px" }}>
                          {r.course?.emoji} {r.course?.title || r.course_id}
                        </p>
                        {/* Stars */}
                        <div style={{ display:"flex", gap:2 }}>
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} width={14} height={14} viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={s<=r.rating?"#f59e0b":"#E2E8F0"} stroke={s<=r.rating?"#f59e0b":"#E2E8F0"} strokeWidth="1"/>
                            </svg>
                          ))}
                          <span style={{ fontSize:12, color:"#64748B", marginLeft:4 }}>{r.rating}/5</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        {!r.approved ? (
                          <button onClick={() => approve(r.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, border:"none", background:"#22c55e", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(34,197,94,0.3)" }}>
                            <Check size={13}/> Approve
                          </button>
                        ) : (
                          <button onClick={() => reject(r.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                            <X size={13}/> Unapprove
                          </button>
                        )}
                        <button onClick={() => del(r.id)} style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Trash2 size={13} color="#EF4444"/>
                        </button>
                      </div>
                    </div>

                    {/* Review text */}
                    {r.review && (
                      <p style={{ fontSize:14, color:"#374151", margin:"12px 0 0", lineHeight:1.65, padding:"12px 14px", background:"#F8FAFC", borderRadius:10 }}>
                        "{r.review}"
                      </p>
                    )}

                    <p style={{ fontSize:11, color:"#94A3B8", margin:"8px 0 0" }}>
                      {new Date(r.created_at).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
