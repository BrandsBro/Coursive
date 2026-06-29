import CertificateBanner from "@/components/home/CertificateBanner";
import SubscriptionGuard from "@/components/home/SubscriptionGuard";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import ChallengesSection from "@/components/home/ChallengesSection";
import BrowseCourses from "@/components/home/BrowseCourses";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export const revalidate = 60;

export default async function DashboardPage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);
  return (
    <SubscriptionGuard>
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>
      <style>{`
        .top-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .top-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
        <CertificateBanner courses={courses}/>
        <div className="top-grid" style={{ marginTop:24 }}>
          <CurrentCourseWidget courses={courses}/>
          <WeeklyStreaks/>
        </div>
        <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:24 }}>
          <ChallengesSection challenges={challenges}/>
          <BrowseCourses courses={courses}/>
        </div>
      </div>
    </div>
    </div>
    </SubscriptionGuard>
  );
}
