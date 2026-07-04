import ChallengesList from "@/components/challenges/ChallengesList";
import { getAllChallenges } from "@/lib/db";

export const metadata = { title: "Challenges - 1Course" };
export const revalidate = 0;

export default async function ChallengesPage() {
  const challenges = await getAllChallenges();
  return <ChallengesList challenges={challenges} />;
}
