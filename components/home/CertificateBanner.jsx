"use client";
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
        .cert-section {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .cert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .cert-header-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .cert-view-all {
          background: #eff1fe;
          color: #5B4EFF;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .cert-view-all:hover {
          background: #e2e6fc;
        }
        .cert-banner {
          background: #d4d8f4;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .cert-top {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }
        .cert-image {
          width: 140px;
          height: 80px;
          object-fit: cover;
          flex-shrink: 0;
          border-radius: 8px;
        }
        .cert-heading {
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
          font-size: clamp(16px, 2vw, 20px);
        }
        .cert-progress {
          display: none;
          color: #5B4EFF;
          font-weight: 700;
          font-size: 14px;
        }
        .cert-divider {
          width: 1px;
          height: 50px;
          background-color: #e2e4f0;
          margin: 0 10px;
        }
        .cert-right {
          background: #ffffff;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .cert-tools {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cert-tool-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e4f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cert-tool-icon.highlight {
          border-color: #5B4EFF;
          box-shadow: 0 0 0 1px #5B4EFF;
        }
        
        /* Mobile Layout Modifications */
        @media (max-width: 768px) {
          .cert-header-title
          {
            font-size: 18px;}
            .cert-view-all
            {
              font-size: 13px;
              width:100px;
              text-align:center;
            }
          .cert-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 16px;
          }
          .cert-top {
            gap: 12px;
          }
          .cert-image {
            width: 80px;
            height: 50px;
          }
          .cert-heading {
            font-size: 15px;
            line-height: 1.3;
            flex: 1;
          }
          .cert-progress {
            display: block;
          }
          .cert-divider {
            display: none;
          }
          .cert-right {
            width: 100%;
            padding: 12px 16px;
            box-sizing: border-box;
          }
          .cert-tools {
            width: 100%;
            justify-content: space-between;
          }
          .cert-tool-icon {
            width: 25px;
            height: 25px;
          }
        }
      `}</style>

      <div className="cert-section">
        <div className="cert-header">
          <h2 className="cert-header-title">Certificate Programs</h2>
          <Link href="/courses" className="cert-view-all">
            View All
          </Link>
        </div>

        <div className="cert-banner">
          <div className="cert-top">
            <img src={CERT_IMAGE} alt="Certificate" className="cert-image" />
            <h3 className="cert-heading">AI Mastery Certificate Program</h3>
            <div className="cert-progress">3/5</div>
          </div>
          
          <div className="cert-divider"></div>

          <div className="cert-right">
            <div className="cert-tools">
              {AI_TOOLS.map((tool, index) => (
                <div 
                  key={tool.name} 
                  className={`cert-tool-icon ${index === 0 ? 'highlight' : ''}`} 
                  style={{ background: tool.bg }} 
                  title={tool.name}
                >
                  <img src={tool.image} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}