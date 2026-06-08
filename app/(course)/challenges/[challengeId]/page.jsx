import { getChallengeById } from "@/data/challenges";
import ChallengePage from "@/components/challenges/ChallengePage";
import { notFound } from "next/navigation";

export default async function ChallengeDetailPage({ params }) {
  const { challengeId } = await params;
  const challenge = getChallengeById(challengeId);
  if (!challenge) return notFound();
  return <ChallengePage challenge={challenge} />;
}
