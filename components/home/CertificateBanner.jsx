
"use client";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

const CERT_IMAGE =
  "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783430088646-8c6ed8b4-813c-4514-a24c-a9561c8bed1d.webp";

const AI_TOOLS = [
  { name: "ChatGPT", image: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783507018650-3656efef-4575-80f8-9aa6-c311c6bee5b7.png", color: "#10A37F", bg: "#e6f7f3" },
  { name: "Claude", image: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783507034858-claude_logo.webp", color: "#8B5CF6", bg: "#f3f0ff" },
  { name: "Jasper", image: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783507055518-2e86efef-4575-8054-ae4a-e2d79ca50a36.png", color: "#E11D48", bg: "#fff0f3" },
  { name: "Midjourney", image: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783509021730-38f6efef-4575-80dd-9e3f-dc7f184ce1c0.png", color: "#1D4ED8", bg: "#eff3ff" },
  { name: "Lovable", image: "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/1783507093280-lovable_logo.webp", color: "#F97316", bg: "#fff7ed" },
];

export default function CertificateBanner({ courses = [] }) {
  return (
    <>
      <style>{`
        .cert-banner {
          background: #eef0fb;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cert-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }
        .cert-image {
          width: 200px;
          height: 100px;
          object-fit: cover;
          flex-shrink: 0;
          border-radius: 10px;
        }
        .cert-heading {
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 10px;
          font-size: clamp(15px, 2.2vw, 22px);
          line-height: 1.2;
        }
        .cert-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cert-tool-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid #e2e4f0;
          flex-shrink: 0;
        }
        .cert-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 12px;
          background: linear-gradient(135deg, #5B4EFF, #8B5CF6);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          margin-top: 12px;
          white-space: nowrap;
        }
        @media (max-width: 600px) {
          .cert-banner {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .cert-left {
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          .cert-image {
            width: 100%;
            height: 120px;
          }
          .cert-tools {
            justify-content: center;
          }
        }
      `}</style>

      <div className="cert-banner">
        <div className="cert-left">
          <img src={CERT_IMAGE} alt="Certificate" className="cert-image"/>
          <div>
            <h2 className="cert-heading">AI Mastery Certificate Program</h2>
            <div className="cert-tools">
              {AI_TOOLS.map((tool) => (
                <div key={tool.name} className="cert-tool-icon" style={{ background: tool.bg }} title={tool.name}>
                  <img src={tool.image} alt={tool.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
              ))}
            </div>
            <Link href="/courses" className="cert-view-btn">
              View All Courses <ChevronRight size={15}/>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
