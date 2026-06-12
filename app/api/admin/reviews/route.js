import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const [{ data: courseReviews }, { data: challengeReviews }] = await Promise.all([
    supabaseAdmin.from("course_reviews").select("id, course_id, user_id, rating, review, approved, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("challenge_user_reviews").select("id, challenge_id, user_id, rating, review, approved, created_at").order("created_at", { ascending: false }),
  ]);

  const all = [
    ...(courseReviews||[]).map(r => ({ ...r, reviewType:"course", entityId:r.course_id })),
    ...(challengeReviews||[]).map(r => ({ ...r, reviewType:"challenge", entityId:r.challenge_id })),
  ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  // Fetch profiles
  const userIds = [...new Set(all.map(r => r.user_id))];
  const courseIds = [...new Set(all.filter(r=>r.reviewType==="course").map(r=>r.entityId).filter(Boolean))];
  const challengeIds = [...new Set(all.filter(r=>r.reviewType==="challenge").map(r=>r.entityId).filter(Boolean))];

  const [{ data: profiles }, { data: courses }, { data: challenges }] = await Promise.all([
    userIds.length > 0 ? supabaseAdmin.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds) : { data: [] },
    courseIds.length > 0 ? supabaseAdmin.from("courses").select("id, title, emoji").in("id", courseIds) : { data: [] },
    challengeIds.length > 0 ? supabaseAdmin.from("challenges").select("id, title, emoji").in("id", challengeIds) : { data: [] },
  ]);

  const profileMap = {};
  (profiles||[]).forEach(p => profileMap[p.id] = p);
  const courseMap = {};
  (courses||[]).forEach(c => courseMap[c.id] = c);
  const challengeMap = {};
  (challenges||[]).forEach(c => challengeMap[c.id] = c);

  return NextResponse.json(all.map(r => ({
    ...r,
    profile: profileMap[r.user_id] || null,
    entity: r.reviewType==="challenge" ? (challengeMap[r.entityId]||null) : (courseMap[r.entityId]||null),
  })));
}

export async function PATCH(req) {
  const { id, approved, reviewType } = await req.json();
  const table = reviewType === "challenge" ? "challenge_user_reviews" : "course_reviews";
  const { error } = await supabaseAdmin.from(table).update({ approved }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const { id, reviewType } = await req.json();
  const table = reviewType === "challenge" ? "challenge_user_reviews" : "course_reviews";
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
