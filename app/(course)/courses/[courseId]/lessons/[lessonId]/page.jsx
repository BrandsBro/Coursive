import { courses } from "@/data/courses";
import { getLessonContent } from "@/data/lessonContent";
import LessonPage from "@/components/courses/LessonPage";
import { notFound } from "next/navigation";

export default async function LessonDetailPage({ params, searchParams }) {
  const { courseId, lessonId } = await params;
  const sp = await searchParams;

  const course = courses.find((c) => c.id === courseId);
  if (!course) return notFound();

  const lesson = course.units.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
  if (!lesson) return notFound();

  const content = getLessonContent(courseId, lessonId);

  return (
    <LessonPage
      course={course}
      lesson={lesson}
      content={content}
      mode={sp.mode || "read"}
      challengeId={sp.challengeId || null}
      challengeDay={sp.day ? parseInt(sp.day) : null}
      firstJoin={sp.firstJoin === "true"}
    />
  );
}
