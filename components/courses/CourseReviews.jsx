"use client";

import { useState, useEffect } from "react";
import { Loader, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const LABELS = ["","Poor","Fair","Good","Very Good","Excellent!"];
const LABEL_COLORS = ["","#ef4444","#f97316","#f59e0b","#22c55e","#10b981"];

function Stars({ value, onChange, size=28, readonly=false }) {
  const [hov, setHov] = useState(0);
  const show = hov || value;
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHov(s)}
          onMouseLeave={() => !readonly && setHov(0)}
          style={{ background:"none", border:"none", cursor:readonly?"default":"pointer", padding:1, lineHeight:1, transition:"transform 0.1s", transform:(!readonly&&hov===s)?"scale(1.2)":"scale(1)" }}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={s<=show?"#f59e0b":"#E2E8F0"} stroke={s<=show?"#f59e0b":"#E2E8F0"} strokeWidth="1"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

const ago = d => {
  const days = Math.floor((Date.now()-new Date(d))/86400000);
  if(!days) return "Today";
  if(days===1) return "Yesterday";
  if(days<30) return days+"d ago";
  return Math.floor(days/30)+"mo ago";
};

const inits = n => n ? n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) : "?";

const isApproved = r => r.approved === true;

export default function CourseReviews({ courseId, courseName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [myReview, setMyReview] = useState(null);

  useEffect(() => { load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: reviewData, error } = await supabase
        .from("course_reviews")
        .select("id, course_id, user_id, rating, review, created_at, updated_at, approved")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }

      const all = reviewData || [];

      // Fetch profiles
      const userIds = [...new Set(all.map(r => r.user_id))];
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        (profileData || []).forEach(p => { profileMap[p.id] = p; });
      }

      const merged = all.map(r => ({ ...r, profiles: profileMap[r.user_id] || null }));
      setReviews(merged);

      if (user) {
        const mine = merged.find(r => r.user_id === user.id);
        if (mine) { setMyReview(mine); setRating(mine.rating); setText(mine.review || ""); }
        else { setMyReview(null); }
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("course_reviews").upsert(
      { course_id: courseId, user_id: user.id, rating, review: text.trim() || null, approved: false, updated_at: new Date().toISOString() },
      { onConflict: "course_id,user_id" }
    );
    if (error) { alert("Error: " + error.message); setSubmitting(false); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    await load();
    setSubmitting(false);
  };

  // Only approved reviews from others
  const others = reviews.filter(r => r.user_id !== user?.id && r.approved === true);
  const approvedOnly = reviews.filter(r => isApproved(r));
  const total = approvedOnly.length;
  const avg = total ? approvedOnly.reduce((s,r) => s+r.rating, 0) / total : 0;
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: approvedOnly.filter(r => r.rating===s).length,
    pct: total ? Math.round(approvedOnly.filter(r => r.rating===s).length/total*100) : 0,
  }));

  if (loading) return <div style={{padding:40,textAlign:"center"}}><Loader size={22} color="#94A3B8" className="bspin"/></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, paddingBottom:40 }}>

      {/* Aggregate */}
      {total > 0 && (
        <div style={{ background:"#0f172a", borderRadius:20, padding:"24px 28px", display:"flex", gap:28, alignItems:"center" }}>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <p style={{ fontSize:52, fontWeight:900, color:"#fff", margin:0, lineHeight:1 }}>{avg.toFixed(1)}</p>
            <div style={{ margin:"8px 0 6px" }}><Stars value={Math.round(avg)} size={16} readonly/></div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{total} review{total!==1?"s":""}</p>
          </div>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
            {dist.map(({star,count,pct}) => (
              <div key={star} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", width:8 }}>{star}</span>
                <svg width={12} height={12} viewBox="0 0 24 24" style={{flexShrink:0}}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                </svg>
                <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f59e0b,#fbbf24)", width:pct+"%", transition:"width 0.5s" }}/>
                </div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", width:16, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your submitted review */}
      {user && myReview && (
        <div style={{ background:"#FFFBEB", borderRadius:18, border:"1.5px solid #FDE68A", padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0 }}>
              {inits(user?.user_metadata?.full_name || user?.email)}
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:"#92400E",margin:"0 0 4px" }}>Your review</p>
              <Stars value={myReview.rating} size={15} readonly/>
            </div>
          </div>
          {myReview.review && (
            <p style={{ fontSize:14,color:"#374151",margin:0,lineHeight:1.65,paddingTop:10,borderTop:"1px solid #FDE68A" }}>
              "{myReview.review}"
            </p>
          )}
        </div>
      )}

      {/* Review form — only if no existing review */}
      {user && !myReview && (
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#0f172a)", padding:"16px 22px" }}>
            <p style={{ color:"#fff",fontSize:15,fontWeight:800,margin:0 }}>Rate this course</p>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:12,margin:"2px 0 0" }}>Your feedback helps other learners</p>
          </div>
          <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px",letterSpacing:0.5 }}>YOUR RATING</p>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <Stars value={rating} onChange={setRating} size={32}/>
                {rating > 0 && <span style={{ fontSize:14,fontWeight:700,color:LABEL_COLORS[rating] }}>{LABELS[rating]}</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px",letterSpacing:0.5 }}>
                WRITTEN REVIEW <span style={{ color:"#94A3B8",fontWeight:400,textTransform:"none",letterSpacing:0 }}>· optional</span>
              </p>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={"What did you think of " + courseName + "?"}
                style={{ width:"100%",minHeight:90,padding:"11px 14px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6,color:"#374151" }}
                onFocus={e => e.target.style.borderColor="#f59e0b"}
                onBlur={e => e.target.style.borderColor="#E2E8F0"}
              />
            </div>
            <button onClick={submit} disabled={!rating || submitting}
              style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:!rating?"#F1F5F9":"linear-gradient(135deg,#f59e0b,#d97706)",
                color:!rating?"#94A3B8":"#fff",
                fontSize:14,fontWeight:700,cursor:!rating?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                boxShadow:rating?"0 4px 14px rgba(245,158,11,0.3)":"none",transition:"all 0.15s" }}>
              {submitting ? <><Loader size={14} className="bspin"/> Submitting...</>
               : saved ? <><Check size={14}/> Submitted!</>
               : "⭐ Submit Review"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ textAlign:"center",padding:"20px",background:"#F8FAFC",borderRadius:14,border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14,color:"#64748B",margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b",fontWeight:700,textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Approved reviews from others */}
      {others.length > 0 && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <MessageCircle size={16} color="#94A3B8"/>
            <h3 style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:0 }}>All Reviews ({others.length})</h3>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {others.map(r => (
              <div key={r.id} style={{ background:"#fff",borderRadius:16,border:"1.5px solid #F1F5F9",padding:"16px 20px",transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#FDE68A"; e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                    {r.profiles?.avatar_url
                      ? <img src={r.profiles.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : inits(r.profiles?.full_name || "User")}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                      <div>
                        <p style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profiles?.full_name || "Student"}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Stars value={r.rating} size={14} readonly/>
                          <span style={{ fontSize:12,fontWeight:700,color:LABEL_COLORS[r.rating] }}>{LABELS[r.rating]}</span>
                        </div>
                      </div>
                      <span style={{ fontSize:11,color:"#94A3B8",flexShrink:0 }}>{ago(r.created_at)}</span>
                    </div>
                    {r.review && (
                      <p style={{ fontSize:13,color:"#374151",margin:"10px 0 0",lineHeight:1.65,paddingTop:10,borderTop:"1px solid #F8FAFC" }}>
                        "{r.review}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && !myReview && (
        <div style={{ textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:18,border:"2px dashed #E2E8F0" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>⭐</div>
          <p style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:"0 0 4px" }}>No reviews yet</p>
          <p style={{ fontSize:13,color:"#94A3B8",margin:0 }}>Be the first to review this course</p>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
