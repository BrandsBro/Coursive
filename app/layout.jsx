import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { createClient } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"] });

async function getBranding() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase.from("settings").select("value").eq("key","branding").single();
    return data?.value || {};
  } catch { return {}; }
}

export async function generateMetadata() {
  const branding = await getBranding();
  return {
    title: `${branding.siteName || "1Course"} - AI Learning Platform`,
    description: "Master AI tools and skills with 1Course",
    icons: branding.favicon ? {
      icon: branding.favicon,
      shortcut: branding.favicon,
      apple: branding.favicon,
    } : {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }) {
  const branding = await getBranding();
  const logoMainDesktop = branding.logoMainSizeDesktop || 117;
  const logoMainMobile = branding.logoMainSizeMobile || 60;
  const logoAppDesktop = branding.logoAppSizeDesktop || 117;
  const logoAppMobile = branding.logoAppSizeMobile || 60;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          .logo-main { height: ${logoMainDesktop}px !important; }
          .logo-app { height: ${logoAppDesktop}px !important; }
          @media (max-width: 768px) {
            .logo-main { height: ${logoMainMobile}px !important; }
            .logo-app { height: ${logoAppMobile}px !important; }
          }
        `}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
