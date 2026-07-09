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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1707573550631351');
          fbq('track', 'PageView');
        `}}/>
        <noscript><img height="1" width="1" style={{display:"none"}} src="https://www.facebook.com/tr?id=1707573550631351&ev=PageView&noscript=1"/></noscript>
        <style>{`
          .logo-main { height: 60px !important; }
          .logo-app { height: 45px !important; }
          @media (max-width: 768px) {
            .logo-main { height: 44px !important; }
            .logo-app { height: 44px !important; }
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
