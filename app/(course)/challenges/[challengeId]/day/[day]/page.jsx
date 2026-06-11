import LessonPage from "@/components/courses/LessonPage";
import { getChallengeById } from "@/lib/db";
import { getLessonContentFromDB } from "@/lib/getlessonContent";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ChallengeDayPage({ params, searchParams }) {
  const { challengeId, day } = await params;
  const sp = await searchParams;

  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();

  const dayNum = parseInt(day);
  const challengeDay = challenge.challengeDays?.find(d => d.day === dayNum);
  if (!challengeDay) return notFound();

  // Use challenge-specific content ID
  const contentId = `challenge_${challengeId}_day_${dayNum}`;
  const content = await getLessonContentFromDB(contentId) || [];

  // Build a fake lesson object for LessonPage
  const lesson = {
    id: contentId,
    title: challengeDay.topic || `Day ${dayNum}`,
    type: "read",
    duration: 10,
  };

  // Build a fake course object for LessonPage
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
    <LessonPage
      course={course}
      lesson={lesson}
      content={content}
      mode={sp?.mode || "read"}
      challengeId={challengeId}
      challengeDay={dayNum}
    />
  );
}
