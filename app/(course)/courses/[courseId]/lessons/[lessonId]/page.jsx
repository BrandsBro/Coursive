import LessonPage from "@/components/courses/LessonPage";
import { getCourseById } from "@/lib/db";
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

  return (
    <LessonPage
      course={course}
      lesson={lesson}
      mode={sp?.mode || "read"}
      challengeId={sp?.challengeId || null}
      challengeDay={sp?.day ? parseInt(sp.day) : null}
      firstJoin={sp?.firstJoin === "true"}
    />
  );
}
