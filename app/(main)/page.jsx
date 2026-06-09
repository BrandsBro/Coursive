import CertificateBanner from "@/components/home/CertificateBanner";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import PromptsLibraryBanner from "@/components/home/PromptsLibraryBanner";
import ExploreAITools from "@/components/home/ExploreAITools";
import ChallengesSection from "@/components/home/ChallengesSection";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <CertificateBanner courses={courses} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
        <CurrentCourseWidget courses={courses} />
        <WeeklyStreaks />
      </div>
      <PromptsLibraryBanner />
      <ExploreAITools courses={courses} />
      <ChallengesSection challenges={challenges} />
    </div>
  );
}
