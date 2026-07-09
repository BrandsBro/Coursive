"use client";
import "../legal.css";
import { useBranding } from "@/lib/useBranding";

export default function Page() {
  const branding = useBranding();
  return (
    <div className="legal-page">
      <style>{`
        .legal-content h2 { margin-top:2.5rem; margin-bottom:1rem; font-size:1.5rem; color:#1e293b; }
        .legal-content h3 { margin-top:2rem; margin-bottom:0.75rem; font-size:1.25rem; color:#334155; }
        .legal-content p { margin-bottom:1.25rem; line-height:1.7; color:#475569; }
        .legal-content ul, .legal-content ol { margin-bottom:1.5rem; padding-left:1.5rem; line-height:1.7; color:#475569; }
        .legal-content li { margin-bottom:0.5rem; }
        .legal-content strong { color:#0f172a; }
        .legal-content blockquote { background:#F8FAFC; border-left:4px solid #C7D2FE; border-radius:0 12px 12px 0; padding:16px 20px; margin:0 0 1.25rem; }
        .legal-content blockquote p { margin:0; color:#374151; }
      `}</style>

      <div className="legal-header" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        {branding.logoMain ? <a href="/"><img src={branding.logoMain} alt="1Course" className="logo-main" style={{ objectFit:"contain", padding:4 }}/></a> : <a href="/" className="legal-logo">✦ 1Course</a>}
      </div>

      <div className="legal-container">
        <h1 className="legal-h1">Refund Policy</h1>
        <p style={{ fontSize:13, color:"#94A3B8", margin:"-20px 0 32px" }}>Last Updated: July 8, 2026</p>

        <div className="legal-content">
          <p><strong>Our commitment.</strong> At 1Course, we strive to provide high-quality educational content. If you find that the Service does not meet your expectations, we offer a transparent refund process designed to be fair to both our users and our creators.</p>

          <p><strong>14-day non-usage refund.</strong> If you have purchased a subscription but have not yet interacted with the product (defined as zero progress in your chosen course and no activity beyond the initial onboarding), you are eligible for a full refund within 14 days of the purchase date. Refunds are typically processed for the initial payment only.</p>

          <p>To request a refund, simply send a brief email to <a href="mailto:support@1course.io" style={{ color:"#5B4EFF" }}>support@1course.io</a>. While we strive for 100% satisfaction, we reserve the right to decline refund requests unless a refund is required by law.</p>

          <h2>NOTE FOR EU RESIDENTS</h2>
          <p>If you are a consumer based in the EEA or Switzerland, you have an automatic legal right to withdraw from contracts for purchases of Services. However, when you purchase a single item of digital content (such as a video recording or a PDF file), you expressly agree that such content is made available to you immediately, and you therefore lose your right of withdrawal and will not be eligible for a refund.</p>
          <p>By signing up for our Service — which is not a single item of digital content and is provided on a continuous basis (such as subscriptions to the App) — you expressly request and consent to the immediate supply of that Service. Therefore, if you exercise your right of withdrawal, we will deduct from your refund an amount proportional to the Service provided before you told us you were withdrawing from the contract.</p>

          <p><strong>Exercise of the right of withdrawal.</strong> Where you have not lost your right of withdrawal, the withdrawal period expires 14 days after the day you enter into the contract. To exercise your right of withdrawal, you must inform us — Cartix LLC, 5830 East 2nd Street, Casper, Wyoming 82609, email: support@1course.io — of your decision to withdraw from a contract by an unequivocal statement (for example, a letter sent by post or email). You may use the model withdrawal form below, but it is not obligatory. To meet the withdrawal deadline, send your communication before the withdrawal period expires.</p>

          <h2>Model Withdrawal Form</h2>
          <blockquote>
            <p>To: Cartix LLC, 5830 East 2nd Street, Casper, Wyoming 82609, email: support@1course.io</p>
            <p>I hereby give notice that I withdraw from my contract for the following service:</p>
            <p>Received on:</p>
            <p>Name:</p>
            <p>Address:</p>
            <p>Signature: (required only if sent by post)</p>
            <p>Date:</p>
          </blockquote>
        </div>

        <hr style={{ margin:"40px 0", borderColor:"#e2e8f0" }}/>

        <div className="lcontact">
          <strong>Cartix LLC (1Course)</strong><br/>
          Principal address: 5830 East 2nd Street, Casper, Wyoming 82609<br/>
          Mailing address: 2331, 701 Tillery Street Unit 12, Austin, TX 78702<br/>
          Email: <a href="mailto:support@1course.io">support@1course.io</a><br/>
          Last Updated: July 8, 2026<br/>
          © CARTIX LLC 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}
