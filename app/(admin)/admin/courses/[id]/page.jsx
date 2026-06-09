import AdminCourseDetail from "@/components/admin/AdminCourseDetail";
import { getCourseById } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function AdminCourseDetailPage({ params }) {
  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) return notFound();
  return <AdminCourseDetail course={course} />;
}
