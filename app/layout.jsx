import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { BrandingProvider } from "@/lib/BrandingContext";
import { createClient } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"] });

async function getBranding() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "branding")
      .single();
    return data?.value || {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const branding = await getBranding();
  return {
    title: `${branding.siteName || "1Course"} - AI Learning Platform`,
    description: "Master AI tools and skills with 1Course",
    icons: branding.favicon
      ? {
          icon: branding.favicon,
          shortcut: branding.favicon,
          apple: branding.favicon,
        }
      : { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }) {
  const branding = await getBranding();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1707573550631351&ev=PageView&noscript=1"
          />
        </noscript>

        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xk8n5lcjx6");
            `,
          }}
        />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GV51TZL23X" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GV51TZL23X');
            `,
          }}
        />

        <style>{`
          .logo-main { height: 45px !important; }
          .logo-app { height: 45px !important; }
          @media (max-width: 768px) {
            .logo-main { height: 44px !important; }
            .logo-app { height: 44px !important; }
          }
        `}</style>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <BrandingProvider initialBranding={branding}>
            {children}
          </BrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}