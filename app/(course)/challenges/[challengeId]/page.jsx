export const dynamic = "force-dynamic";
import { getChallengeById } from "@/lib/db";
import ChallengePage from "@/components/challenges/ChallengePage";
import { notFound } from "next/navigation";


export default async function ChallengeDetailPage({ params }) {
  const { challengeId } = await params;
  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();
  return <ChallengePage challenge={challenge} />;
}
