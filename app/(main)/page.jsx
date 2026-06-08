import CertificateBanner from "@/components/home/CertificateBanner";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import PromptsLibraryBanner from "@/components/home/PromptsLibraryBanner";
import ExploreAITools from "@/components/home/ExploreAITools";
import ChallengesSection from "@/components/home/ChallengesSection";

export default function HomePage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <CertificateBanner />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
        <CurrentCourseWidget />
        <WeeklyStreaks />
      </div>
      <PromptsLibraryBanner />
      <ExploreAITools />
      <ChallengesSection />
    </div>
  );
}
