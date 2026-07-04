export const dynamic = "force-dynamic";
import LessonPage from "@/components/courses/LessonPage";
import ChallengeReviews from "@/components/challenges/ChallengeReviews";
import { getChallengeById } from "@/lib/db";
import { getLessonContentFromDB } from "@/lib/getlessonContent";
import { notFound } from "next/navigation";


export default async function ChallengeDayPage({ params, searchParams }) {
  const { challengeId, day } = await params;
  const sp = await searchParams;

  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();

  const dayNum = parseInt(day);
  const challengeDay = challenge.challengeDays?.find(d => d.day === dayNum);
  if (!challengeDay) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:40 }}>
        <div style={{ fontSize:48 }}>📅</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:0 }}>Day {dayNum} not set up yet</h2>
        <p style={{ fontSize:15, color:"#64748B", margin:0 }}>This challenge day has not been configured yet.</p>
        <a href={"/challenges/"+challengeId} style={{ padding:"12px 24px", borderRadius:12, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontWeight:700, fontSize:14, textDecoration:"none" }}>Back to Challenge</a>
      </div>
    );
  }

  const contentId = `challenge_${challengeId}_day_${dayNum}`;
  const content = await getLessonContentFromDB(contentId) || [];

  const lesson = {
    id: contentId,
    title: challengeDay.topic || `Day ${dayNum}`,
    type: "read",
    duration: 10,
  };

  const course = {
    id: challengeId,
    title: challenge.title,
    emoji: challenge.emoji,
    gradientFrom: "#667eea",
    gradientTo: "#764ba2",
    hours: 1,
    level: challenge.level,
    units: [{
      id: "days",
      title: "Challenge Days",
      lessons: (challenge.challengeDays || []).map(d => ({
        id: `challenge_${challengeId}_day_${d.day}`,
        title: d.topic || `Day ${d.day}`,
        type: "read",
        duration: 10,
      }))
    }]
  };

  return (
    <div>
      <LessonPage
        course={course}
        lesson={lesson}
        content={content}
        mode={sp?.mode || "read"}
        challengeId={challengeId}
        challengeDay={dayNum}
      />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px 80px" }}>
        <h2 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:"0 0 20px" }}>
          Rate this Challenge
        </h2>
        <ChallengeReviews
          challengeId={challengeId}
          challengeName={challenge.title}
          topOnly={false}
        />
      </div>
    </div>
  );
}
