import LessonPage from "@/components/courses/LessonPage";
import { getCourseById } from "@/lib/db";
import { getLessonContent } from "@/data/lessonContent";
import { getLessonContentFromDB } from "@/lib/getlessonContent";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function LessonDetailPage({ params, searchParams }) {
  const { courseId, lessonId } = await params;
  const sp = await searchParams;

  const course = await getCourseById(courseId);
  if (!course) return notFound();

  const allLessons = course.units.flatMap(u => u.lessons);
  const lesson = allLessons.find(l => l.id === lessonId)
    || allLessons.find(l => l.id.endsWith(`_${lessonId}`));

  if (!lesson) return notFound();

  // Use DB content only - no static fallback
  const dbContent = await getLessonContentFromDB(lesson.id);
  const content = dbContent || [];

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
