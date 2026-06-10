import LessonBuilder from "@/components/admin/builder/LessonBuilder";

export const metadata = { title: "Lesson Builder - Coursiv" };

export default async function BuilderPage({ params, searchParams }) {
  const { lessonId } = await params;
  const sp = await searchParams;
  return (
    <LessonBuilder
      lessonId={lessonId}
      lessonTitle={sp?.title || "Lesson"}
      backTo={sp?.backTo || "/admin/courses"}
    />
  );
}
