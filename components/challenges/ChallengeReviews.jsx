"use client";

import { useState, useEffect } from "react";
import { Loader, Check, Star } from "lucide-react";
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

export default function ChallengeReviews({ challengeId, challengeName, topOnly=false }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [myReview, setMyReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [challengeId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("challenge_user_reviews")
      .select("id, challenge_id, user_id, rating, review, approved, created_at")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: false });

    const all = data || [];
    const userIds = [...new Set(all.map(r => r.user_id))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      (profiles||[]).forEach(p => { profileMap[p.id] = p; });
    }

    const merged = all.map(r => ({ ...r, profile: profileMap[r.user_id] || null }));
    setReviews(merged);

    if (user) {
      const mine = merged.find(r => r.user_id === user.id);
      if (mine) { setMyReview(mine); setRating(mine.rating); setText(mine.review||""); }
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("challenge_user_reviews").upsert(
      { challenge_id:challengeId, user_id:user.id, rating, review:text.trim()||null, approved:false },
      { onConflict:"challenge_id,user_id" }
    );
    if (error) { alert(error.message); setSubmitting(false); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    await load();
    setSubmitting(false);
  };

  const approved = reviews.filter(r => r.approved === true);
  const others = approved.filter(r => r.user_id !== user?.id);
  const displayReviews = topOnly ? others.slice(0,3) : others;

  if (loading) return <div style={{padding:24,textAlign:"center"}}><Loader size={20} color="#94A3B8" className="bspin"/></div>;

  // TopOnly mode - just show 3 best reviews
  if (topOnly) {
    if (displayReviews.length === 0) return null;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {displayReviews.map(r => (
          <div key={r.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:r.review?10:0 }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                {r.profile?.avatar_url ? <img src={r.profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : inits(r.profile?.full_name||"U")}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profile?.full_name||"Student"}</p>
                <Stars value={r.rating} size={13} readonly/>
              </div>
              <span style={{ fontSize:11,color:"#94A3B8" }}>{ago(r.created_at)}</span>
            </div>
            {r.review && <p style={{ fontSize:13,color:"#374151",margin:0,lineHeight:1.6,fontStyle:"italic" }}>"{r.review}"</p>}
          </div>
        ))}
        <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Full review form + list (for day page)
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* My submitted review */}
      {user && myReview && (
        <div style={{ background:"#FFFBEB", borderRadius:18, border:"1.5px solid #FDE68A", padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:myReview.review?10:0 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0 }}>
              {inits(user?.user_metadata?.full_name||user?.email)}
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:"#92400E",margin:"0 0 4px" }}>Your review</p>
              <Stars value={myReview.rating} size={15} readonly/>
            </div>
          </div>
          {myReview.review && <p style={{ fontSize:14,color:"#374151",margin:0,lineHeight:1.65,paddingTop:10,borderTop:"1px solid #FDE68A" }}>"{myReview.review}"</p>}
        </div>
      )}

      {/* Review form */}
      {user && !myReview && (
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#0f172a)", padding:"16px 22px" }}>
            <p style={{ color:"#fff",fontSize:15,fontWeight:800,margin:0 }}>Rate this challenge</p>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:12,margin:"2px 0 0" }}>Help others decide if this challenge is right for them</p>
          </div>
          <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px" }}>YOUR RATING</p>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <Stars value={rating} onChange={setRating} size={32}/>
                {rating > 0 && <span style={{ fontSize:14,fontWeight:700,color:LABEL_COLORS[rating] }}>{LABELS[rating]}</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px" }}>
                WRITTEN REVIEW <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span>
              </p>
              <textarea value={text} onChange={e=>setText(e.target.value)}
                placeholder={"What did you think of " + challengeName + "?"}
                style={{ width:"100%",minHeight:90,padding:"11px 14px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6,color:"#374151" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"}
                onBlur={e=>e.target.style.borderColor="#E2E8F0"}
              />
            </div>
            <button onClick={submit} disabled={!rating||submitting}
              style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:!rating?"#F1F5F9":"linear-gradient(135deg,#f59e0b,#d97706)",
                color:!rating?"#94A3B8":"#fff",fontSize:14,fontWeight:700,
                cursor:!rating?"not-allowed":"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",gap:8,
                boxShadow:rating?"0 4px 14px rgba(245,158,11,0.3)":"none" }}>
              {submitting?<><Loader size={14} className="bspin"/> Submitting...</>
               :saved?<><Check size={14}/> Submitted!</>
               :"⭐ Submit Review"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ textAlign:"center",padding:"16px",background:"#F8FAFC",borderRadius:14,border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14,color:"#64748B",margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b",fontWeight:700,textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Others reviews */}
      {others.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <h3 style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:0 }}>Reviews ({others.length})</h3>
          {others.map(r => (
            <div key={r.id} style={{ background:"#fff",borderRadius:16,border:"1.5px solid #F1F5F9",padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:r.review?10:0 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                  {r.profile?.avatar_url?<img src={r.profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:inits(r.profile?.full_name||"U")}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profile?.full_name||"Student"}</p>
                  <Stars value={r.rating} size={14} readonly/>
                </div>
                <span style={{ fontSize:11,color:"#94A3B8" }}>{ago(r.created_at)}</span>
              </div>
              {r.review && <p style={{ fontSize:13,color:"#374151",margin:0,lineHeight:1.65,fontStyle:"italic" }}>"{r.review}"</p>}
            </div>
          ))}
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
