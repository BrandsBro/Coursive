import LessonPage from "@/components/courses/LessonPage";
import { getCourseById } from "@/lib/db";
import { getLessonContent } from "@/data/lessonContent";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function LessonDetailPage({ params, searchParams }) {
  const { courseId, lessonId } = await params;
  const sp = await searchParams;

  const course = await getCourseById(courseId);
  if (!course) return notFound();

  // Find lesson — works with both old (l1) and new (canva-ai_unit-1_l1) IDs
  const allLessons = course.units.flatMap(u => u.lessons);
  const lesson = allLessons.find(l => l.id === lessonId)
    || allLessons.find(l => l.id.endsWith(`_${lessonId}`));

  if (!lesson) return notFound();

  // Try to get content with full ID, then fall back to short ID
  const shortId = lessonId.includes("_") ? lessonId.split("_").pop() : lessonId;
  const content = getLessonContent(courseId, lessonId)
    || getLessonContent(courseId, shortId)
    || [];

  return (
    <LessonPage
      course={course}
      lesson={lesson}
      content={content}
      mode={sp?.mode || "read"}
      challengeId={sp?.challengeId || null}
      challengeDay={sp?.day ? parseInt(sp.day) : null}
      firstJoin={sp?.firstJoin === "true"}
    />
  );
}
