import ChallengesList from "@/components/challenges/ChallengesList";
import { getAllChallenges } from "@/lib/db";

export const metadata = { title: "Challenges - Coursiv" };
export const revalidate = 60;

export default async function ChallengesPage() {
  const challenges = await getAllChallenges();
  return <ChallengesList challenges={challenges} />;
}
