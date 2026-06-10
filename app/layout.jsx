import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coursiv - AI Learning Platform",
  description: "Master AI tools and skills with Coursiv",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <OnboardingWrapper>
            {children}
          </OnboardingWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
