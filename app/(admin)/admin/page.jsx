import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export const metadata = { title: "Admin - Coursiv" };

export default async function AdminPage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);
  return <AdminDashboard courses={courses} challenges={challenges} />;
}
