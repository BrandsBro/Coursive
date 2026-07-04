export const dynamic = "force-dynamic";
import AdminChallenges from "@/components/admin/AdminChallenges";
import { getAllChallenges } from "@/lib/db";

export default async function AdminChallengesPage() {
  const challenges = await getAllChallenges();
  return <AdminChallenges challenges={challenges} />;
}
