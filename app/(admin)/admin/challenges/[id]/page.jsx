import AdminChallengeDetail from "@/components/admin/AdminChallengeDetail";
import { getChallengeById, getAllCourses } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function AdminChallengeDetailPage({ params }) {
  const { id } = await params;
  const [challenge, courses] = await Promise.all([
    getChallengeById(id),
    getAllCourses(),
  ]);
  if (!challenge) return notFound();
  return <AdminChallengeDetail challenge={challenge} courses={courses} />;
}
