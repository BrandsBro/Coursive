import AdminCourses from "@/components/admin/AdminCourses";
import { getAllCourses } from "@/lib/db";

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();
  return <AdminCourses courses={courses} />;
}
