import CoursePage from "@/components/courses/CoursePage";
import { getCourseById, getAllCourses } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function CourseDetailPage({ params }) {
  const { courseId } = await params;
  const [course, allCourses] = await Promise.all([
    getCourseById(courseId),
    getAllCourses(),
  ]);
  if (!course) return notFound();
  return <CoursePage course={course} allCourses={allCourses} />;
}
