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
    <div className="home-wrapper">
      <CertificateBanner courses={courses} />
      <div className="home-grid">
        <CurrentCourseWidget courses={courses} />
        <WeeklyStreaks />
      </div>
      <PromptsLibraryBanner />
      <ExploreAITools courses={courses} />
      <ChallengesSection challenges={challenges} />

      <style>{`
        .home-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 0 4px;
        }
        .home-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
          .home-wrapper {
            gap: 16px;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
