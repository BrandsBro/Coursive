import { courses } from "@/data/courses";
import CoursePage from "@/components/courses/CoursePage";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({ params }) {
  const { courseId } = await params;
  const course = courses.find((c) => c.id === courseId);
  if (!course) return notFound();
  return <CoursePage course={course} allCourses={courses} />;
}
