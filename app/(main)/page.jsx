import CertificateBanner from "@/components/home/CertificateBanner";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import ChallengesSection from "@/components/home/ChallengesSection";
import BrowseCourses from "@/components/home/BrowseCourses";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);

  return (
    <>
      <style>{`
        .home-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }
        .home-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .home-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .home-stack {
            gap: 16px;
          }
        }
      `}</style>

      <div className="home-stack">
        <CertificateBanner courses={courses} />
        <div className="home-grid">
          <CurrentCourseWidget courses={courses} />
          <WeeklyStreaks />
        </div>
                        <BrowseCourses courses={courses} />
        <ChallengesSection challenges={challenges} />
      </div>
    </>
  );
}
