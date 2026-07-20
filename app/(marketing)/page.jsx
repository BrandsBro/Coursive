import HomeNav from "@/components/home/HomeNav";
import HeroSection from "@/components/home/HeroSection";
import TrustedSection from "@/components/home/TrustedSection";
import StatsSection from "@/components/home/StatsSection";
import Why1Course from "@/components/home/Why1Course";
import HowItWorks from "@/components/home/HowItWorks";
import InAction from "@/components/home/InAction";
import AITools from "@/components/home/AITools";
import AIIsATool from "@/components/home/AIIsATool";
import Testimonials from "@/components/home/Testimonials";


import CTASection from "@/components/home/CTASection";
import FAQSection from "@/components/home/FAQSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <div style={{ background:"#0a081e", minHeight:"100vh", color:"#fff" }}>
      <HomeNav/>
      <HeroSection/>
      <TrustedSection/>
      <StatsSection/>
      <Why1Course/>
      <HowItWorks/>
      <InAction/>
      <AITools/>
      <AIIsATool/>
      <Testimonials/>
   
   
      <CTASection/>
      <FAQSection/>
      <HomeFooter/>
    </div>
  );
}
