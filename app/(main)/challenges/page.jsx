export const dynamic = "force-dynamic";
import ChallengesList from "@/components/challenges/ChallengesList";
import { getAllChallenges } from "@/lib/db";

export const metadata = { title: "Challenges - 1Course" };

export default async function ChallengesPage() {
  const challenges = await getAllChallenges();
  return <ChallengesList challenges={challenges} />;
}
