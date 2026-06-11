import { getChallengeById } from "@/lib/db";
import ChallengePage from "@/components/challenges/ChallengePage";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ChallengeDetailPage({ params }) {
  const { challengeId } = await params;
  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();
  return <ChallengePage challenge={challenge} />;
}
