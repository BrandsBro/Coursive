"use client";

import { useState, useEffect } from "react";
import { Loader, Edit2, Trash2, Check, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import StarRating from "@/components/courses/StarRating";

export default function CourseReviews({ courseId, courseName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

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
      if (mine) {
        setMyReview(mine);
        setRating(mine.rating);
        setReviewText(mine.review || "");
      }
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    const row = {
      course_id: courseId,
      user_id: user.id,
      rating,
      review: reviewText.trim() || null,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("course_reviews").upsert(row, { onConflict:"course_id,user_id" });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "system",
      title: "Review submitted! ⭐",
      message: `Thanks for rating "${courseName}"`,
      emoji: "⭐",
    });

    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
    load();
    setSubmitting(false);
  };

  const deleteReview = async () => {
    if (!confirm("Delete your review?")) return;
    await supabase.from("course_reviews").delete().eq("course_id", courseId).eq("user_id", user.id);
    setMyReview(null);
    setRating(0);
    setReviewText("");
    load();
  };

  // Aggregate stats
  const total = reviews.length;
  const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: total ? Math.round((reviews.filter(r => r.rating === s).length / total) * 100) : 0,
  }));

  const initials = (name) => name ? name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "?";
  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days/30)}mo ago`;
    return `${Math.floor(days/365)}y ago`;
  };

  if (loading) return (
    <div style={{ textAlign:"center", padding:40 }}>
      <Loader size={24} className="bspin" style={{ color:"#94A3B8" }}/>
    </div>
  );

  const showForm = user && (!myReview || editing);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

      {/* ── Aggregate ── */}
      {total > 0 && (
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24, display:"grid", gridTemplateColumns:"auto 1fr", gap:28, alignItems:"center" }}>
          {/* Big score */}
          <div style={{ textAlign:"center", paddingRight:28, borderRight:"1px solid #F1F5F9" }}>
            <p style={{ fontSize:56, fontWeight:900, color:"#0f172a", margin:0, lineHeight:1 }}>{avg.toFixed(1)}</p>
            <StarRating value={Math.round(avg)} size={18} readonly/>
            <p style={{ fontSize:12, color:"#94A3B8", margin:"6px 0 0" }}>{total} review{total!==1?"s":""}</p>
          </div>
          {/* Distribution bars */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {dist.map(({ star, count, pct }) => (
              <div key={star} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#64748B", minWidth:8 }}>{star}</span>
                <svg width={14} height={14} viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"/>
                </svg>
                <div style={{ flex:1, height:8, background:"#F1F5F9", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f59e0b,#fbbf24)", width:`${pct}%`, transition:"width 0.6s ease" }}/>
                </div>
                <span style={{ fontSize:12, color:"#94A3B8", minWidth:24, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Write / Edit review ── */}
      {user && myReview && !editing ? (
        <div style={{ background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)", borderRadius:20, border:"1.5px solid #FDE68A", padding:20 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#92400E", margin:"0 0 6px" }}>Your review</p>
              <StarRating value={myReview.rating} size={20} readonly/>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setEditing(true)} style={ctrlBtn("#fff","#374151")}>
                <Edit2 size={13}/> Edit
              </button>
              <button onClick={deleteReview} style={ctrlBtn("#FEF2F2","#EF4444","#FEE2E2")}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
          {myReview.review && <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>{myReview.review}</p>}
        </div>
      ) : showForm ? (
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #E2E8F0", padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>
            {editing ? "Edit your review" : "Rate this course"}
          </h3>

          {/* Stars */}
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#374151", margin:"0 0 8px" }}>Your rating</p>
            <StarRating value={rating} onChange={setRating} size={32}/>
            {rating > 0 && (
              <p style={{ fontSize:12, color:"#f59e0b", fontWeight:600, margin:"6px 0 0" }}>
                {["","Poor","Fair","Good","Very Good","Excellent!"][rating]}
              </p>
            )}
          </div>

          {/* Review text */}
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#374151", margin:"0 0 8px" }}>
              Written review <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span>
            </p>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder={`What did you think of ${courseName}? Share your experience...`}
              style={{ width:"100%", minHeight:100, padding:"10px 14px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, resize:"vertical", outline:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 }}
              onFocus={e => e.target.style.borderColor="#f59e0b"}
              onBlur={e => e.target.style.borderColor="#E2E8F0"}
            />
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:10 }}>
            {editing && (
              <button onClick={() => { setEditing(false); setRating(myReview.rating); setReviewText(myReview.review||""); }} style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                Cancel
              </button>
            )}
            <button onClick={submit} disabled={!rating || submitting} style={{ flex:2, padding:"11px", borderRadius:12, border:"none", background:!rating?"#F1F5F9":"linear-gradient(135deg,#f59e0b,#d97706)", color:!rating?"#94A3B8":"#fff", fontSize:13, fontWeight:700, cursor:!rating?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {submitting ? <><Loader size={14} className="bspin"/> Submitting...</> : saved ? <><Check size={14}/> Saved!</> : "Submit Review"}
            </button>
          </div>
        </div>
      ) : !user ? (
        <div style={{ textAlign:"center", padding:"28px 20px", background:"#F8FAFC", borderRadius:16, border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14, color:"#64748B", margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b", fontWeight:700, textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      ) : null}

      {/* ── Reviews list ── */}
      {reviews.filter(r => r.user_id !== user?.id).length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0, display:"flex", alignItems:"center", gap:8 }}>
            <MessageSquare size={18} color="#94A3B8"/> Reviews
          </h3>
          {reviews.filter(r => r.user_id !== user?.id).map(r => (
            <div key={r.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:r.review?10:0 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {r.profiles?.avatar_url
                    ? <img src={r.profiles.avatar_url} alt="" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }}/>
                    : initials(r.profiles?.full_name || "User")
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{r.profiles?.full_name || "Student"}</p>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{timeAgo(r.created_at)}</span>
                  </div>
                  <StarRating value={r.rating} size={14} readonly/>
                </div>
              </div>
              {r.review && <p style={{ fontSize:13, color:"#374151", margin:0, lineHeight:1.65, paddingLeft:50 }}>{r.review}</p>}
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign:"center", padding:"36px 20px", background:"#F8FAFC", borderRadius:16, border:"1.5px dashed #E2E8F0" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>⭐</div>
          <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>No reviews yet</p>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Be the first to review this course</p>
        </div>
      )}
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const ctrlBtn = (bg, color, border="1.5px solid #E2E8F0") => ({ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:9, border, background:bg, color, fontSize:12, fontWeight:600, cursor:"pointer" });
