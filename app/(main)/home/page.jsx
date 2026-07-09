export const dynamic = "force-dynamic";
import CertificateBanner from "@/components/home/CertificateBanner";
import SubscriptionGuard from "@/components/home/SubscriptionGuard";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import ChallengesSection from "@/components/home/ChallengesSection";
import BrowseCourses from "@/components/home/BrowseCourses";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export default async function DashboardPage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);
  return (
    <SubscriptionGuard>
    <div style={{ minHeight:"100vh" }}>
      <style>{`
        .top-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .course-desc { display: none !important; }
          .top-grid { grid-template-columns: 1fr; }
          .cert-badges { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; width: 100% !important; }
          .cert-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .cert-desc { display: none !important; }
        }
      `}</style>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
        <CertificateBanner courses={courses}/>
        <div className="top-grid" style={{ marginTop:24 }}>
          <CurrentCourseWidget courses={courses}/>
          <WeeklyStreaks/>
        </div>
        <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:24 }}>
          <BrowseCourses courses={courses}/>
          <ChallengesSection challenges={challenges}/>
        </div>
      </div>
    </div>
    </SubscriptionGuard>
  );
}
