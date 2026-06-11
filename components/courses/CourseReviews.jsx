"use client";

import { useState, useEffect } from "react";
import { Loader, Edit2, Trash2, Check, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

function StarPicker({ value, onChange, size = 32, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display:"flex", gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ background:"none", border:"none", cursor:readonly?"default":"pointer", padding:2, lineHeight:1 }}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={s <= display ? "#f59e0b" : "#E2E8F0"}
              stroke={s <= display ? "#f59e0b" : "#E2E8F0"}
              strokeWidth="1"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];
const LABEL_COLORS = ["", "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981"];

function timeAgo(d) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return days + "d ago";
  if (days < 365) return Math.floor(days / 30) + "mo ago";
  return Math.floor(days / 365) + "y ago";
}

function initials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

export default function CourseReviews({ courseId, courseName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [myReview, setMyReview] = useState(null);

  useEffect(() => { load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("course_reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    const all = data || [];
    setReviews(all);
    if (user) {
      const mine = all.find(r => r.user_id === user.id);
      if (mine) { setMyReview(mine); setRating(mine.rating); setReviewText(mine.review || ""); }
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    await supabase.from("course_reviews").upsert({
      course_id: courseId, user_id: user.id,
      rating, review: reviewText.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "course_id,user_id" });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
    load();
    setSubmitting(false);
  };

  const deleteReview = async () => {
    if (!confirm("Delete your review?")) return;
    await supabase.from("course_reviews").delete().eq("course_id", courseId).eq("user_id", user.id);
    setMyReview(null); setRating(0); setReviewText("");
    load();
  };

  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: total ? Math.round((reviews.filter(r => r.rating === s).length / total) * 100) : 0,
  }));

  if (loading) return (
    <div style={{ padding:48, textAlign:"center" }}>
      <Loader size={24} color="#94A3B8" className="bspin"/>
    </div>
  );

  const showForm = user && (!myReview || editing);
  const othersReviews = reviews.filter(r => r.user_id !== user?.id);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* ── Aggregate stats ── */}
      {total > 0 && (
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius:24, padding:"28px 32px", display:"grid", gridTemplateColumns:"auto 1fr", gap:32, alignItems:"center" }}>
          {/* Big score */}
          <div style={{ textAlign:"center", paddingRight:32, borderRight:"1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize:64, fontWeight:900, color:"#fff", margin:0, lineHeight:1 }}>{avg.toFixed(1)}</p>
            <div style={{ marginTop:8, marginBottom:8 }}>
              <StarPicker value={Math.round(avg)} size={20} readonly/>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>
              {total} review{total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Bars */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {dist.map(({ star, count, pct }) => (
              <div key={star} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", minWidth:8 }}>{star}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"/>
                </svg>
                <div style={{ flex:1, height:8, background:"rgba(255,255,255,0.1)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f59e0b,#fbbf24)", width:pct+"%", transition:"width 0.6s ease" }}/>
                </div>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", minWidth:20, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── My review (display) ── */}
      {user && myReview && !editing && (
        <div style={{ background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)", borderRadius:20, border:"1.5px solid #FDE68A", padding:"20px 24px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:16, fontWeight:800, flexShrink:0, overflow:"hidden" }}>
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                  : initials(user?.user_metadata?.full_name || user?.email)}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:"#92400E", margin:"0 0 4px" }}>Your review</p>
                <StarPicker value={myReview.rating} size={18} readonly/>
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setEditing(true)} style={ctrlBtn()}>
                <Edit2 size={12}/> Edit
              </button>
              <button onClick={deleteReview} style={ctrlBtn("#FEF2F2","#EF4444","#FEE2E2")}>
                <Trash2 size={12}/>
              </button>
            </div>
          </div>
          {myReview.review && (
            <p style={{ fontSize:14, color:"#374151", margin:"14px 0 0", lineHeight:1.65, paddingTop:14, borderTop:"1px solid #FDE68A" }}>
              {myReview.review}
            </p>
          )}
        </div>
      )}

      {/* ── Write / Edit review form ── */}
      {showForm && (
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
          {/* Form header */}
          <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b)", padding:"18px 24px" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>
              {editing ? "Edit your review" : "Rate this course"}
            </h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>
              {editing ? "Update your rating and review" : "Share your experience with other learners"}
            </p>
          </div>

          <div style={{ padding:"24px" }}>
            {/* Stars */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#374151", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:0.5 }}>Your Rating</p>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <StarPicker value={rating} onChange={setRating} size={36}/>
                {rating > 0 && (
                  <span style={{ fontSize:15, fontWeight:700, color:LABEL_COLORS[rating] }}>
                    {LABELS[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Text */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:12, fontWeight:700, color:"#374151", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:0.5 }}>
                Written Review <span style={{ color:"#94A3B8", fontWeight:400, textTransform:"none" }}>· optional</span>
              </p>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder={"What did you think of " + courseName + "? What did you learn? Would you recommend it?"}
                style={{ width:"100%", minHeight:110, padding:"12px 16px", borderRadius:14, border:"1.5px solid #E2E8F0", fontSize:14, resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.65, color:"#374151" }}
                onFocus={e => e.target.style.borderColor="#f59e0b"}
                onBlur={e => e.target.style.borderColor="#E2E8F0"}
              />
              <p style={{ fontSize:11, color:"#94A3B8", margin:"6px 0 0", textAlign:"right" }}>{reviewText.length} characters</p>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10 }}>
              {editing && (
                <button onClick={() => { setEditing(false); setRating(myReview.rating); setReviewText(myReview.review||""); }}
                  style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
              )}
              <button onClick={submit} disabled={!rating || submitting}
                style={{ flex:2, padding:"13px", borderRadius:12, border:"none",
                  background: !rating ? "#F1F5F9" : "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: !rating ? "#94A3B8" : "#fff",
                  fontSize:14, fontWeight:700, cursor:!rating?"not-allowed":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow: rating ? "0 4px 14px rgba(245,158,11,0.35)" : "none",
                  transition:"all 0.15s" }}>
                {submitting ? <><Loader size={15} className="bspin"/> Submitting...</>
                  : saved ? <><Check size={15}/> Saved!</>
                  : <><Star size={15} fill="#fff"/> {editing ? "Save Changes" : "Submit Review"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ textAlign:"center", padding:"28px 20px", background:"#F8FAFC", borderRadius:16, border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14, color:"#64748B", margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b", fontWeight:700, textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* ── Reviews list ── */}
      {othersReviews.length > 0 && (
        <div>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>
            All Reviews ({othersReviews.length})
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {othersReviews.map(r => (
              <div key={r.id} style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"20px 22px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#FDE68A"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:r.review?12:0 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0, overflow:"hidden" }}>
                    {r.profiles?.avatar_url
                      ? <img src={r.profiles.avatar_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : initials(r.profiles?.full_name || "User")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:6 }}>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>
                          {r.profiles?.full_name || "Student"}
                        </p>
                        <StarPicker value={r.rating} size={16} readonly/>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <span style={{ fontSize:11, color:"#94A3B8" }}>{timeAgo(r.created_at)}</span>
                        <br/>
                        <span style={{ fontSize:12, fontWeight:700, color:LABEL_COLORS[r.rating] }}>{LABELS[r.rating]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {r.review && (
                  <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.7, paddingTop:12, borderTop:"1px solid #F8FAFC" }}>
                    "{r.review}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>⭐</div>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>No reviews yet</h3>
          <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>Be the first to review this course</p>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const ctrlBtn = (bg="#fff", color="#374151", border="1.5px solid #E2E8F0") => ({
  display:"flex", alignItems:"center", gap:5, padding:"7px 12px",
  borderRadius:9, border, background:bg, color, fontSize:12, fontWeight:600, cursor:"pointer"
});
