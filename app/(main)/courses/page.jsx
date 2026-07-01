import CoursesList from "@/components/courses/CoursesList";
import { getAllCourses } from "@/lib/db";

export const metadata = { title: "Courses - 1Course" };
export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await getAllCourses();
  return <CoursesList courses={courses} />;
}
