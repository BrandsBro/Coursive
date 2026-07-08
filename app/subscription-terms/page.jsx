"use client";
import "../legal.css";
import { useBranding } from "@/lib/useBranding";

export default function Page() {
  const branding = useBranding();
  return (
    <div className="legal-page">
      <style>{`
        .legal-content h2 {
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .legal-content h3 {
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          color: #334155;
        }
        .legal-content p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: #475569;
        }
        .legal-content ul, 
        .legal-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
          line-height: 1.7;
          color: #475569;
        }
        .legal-content li {
          margin-bottom: 0.5rem;
        }
        .legal-content strong {
          color: #0f172a;
        }
      `}</style>

      <div className="legal-header" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        {branding.logoMain ? <a href="/"><img src={branding.logoMain} alt="1Course" className="logo-main" style={{ objectFit:"contain", padding:4 }}/></a> : <a href="/" className="legal-logo">✦ 1Course</a>}
      </div>
      
      <div className="legal-container">
        <h1 className="legal-h1">Subscription Terms</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "-20px 0 32px" }}>
          Last Updated: July 8, 2026
        </p>

        <div className="legal-content">
          <p>Please read these Subscription Terms thoroughly and carefully. Their purpose is to set out the terms and conditions under which you get access to the learning materials. If you have any questions, please contact us through the Support Center.</p>
          <p>These Subscription Terms are incorporated by reference into the Terms and Conditions of 1Course ("1Course" or "us") and are part of the agreement between you, the user of the website https://1course.io (the "Website") or the 1Course app on the App Store or Google Play (the "App"), and 1Course, operated by Cartix LLC.</p>
          
          <h2>1. Trial</h2>
          <p>We may offer a paid trial subscription for services provided through the Website and/or the App. Unless you cancel at least 24 hours before the end of the trial, you will automatically be charged the price shown on the payment screen for your chosen subscription period, and the trial will convert into a subscription.</p>
          
          <h2>2. Subscription</h2>
          <p>The subscription renews automatically at the end of each period (4 weeks, 12 weeks, or another period, depending on the option you selected at purchase) until you cancel.</p>
          
          <h2>3. Payment Method</h2>
          <p>Payment will be charged to the primary payment method you submitted at the time of purchase, at confirmation of purchase. You authorize us to store your payment data to the extent necessary to provide our services and to automatically charge the applicable fees to your primary payment method.</p>
          <p>If a charge to your primary payment method fails (for example, because it has expired), you agree that we may retry billing that method or use any other payment method stored with your account. If a payment is not successfully authorized due to expiration, insufficient funds, or any other reason, we may suspend or terminate your subscription, and you remain responsible for any amounts you fail to pay. You also agree that we may charge the payment method on file if you decide to restart your subscription.</p>
          
          <h2>4. Cancellation</h2>
          <p>Canceling your trial or subscription means automatic renewal will be turned off, but you will still have access to all your subscription features for the remaining time in the then-current period. Deleting the app does not cancel your subscription.</p>
          
          <p><strong>If you purchased a subscription or enabled a trial on the App Store:</strong> You can cancel a trial or subscription anytime by turning off auto-renewal in your Apple ID account settings. To avoid being charged, cancel at least 24 hours before the end of the free trial or then-current period. Only you can manage your subscriptions. Learn more about managing and canceling subscriptions on the Apple support page.</p>
          
          <p><strong>If you purchased a subscription or enabled a trial on Google Play:</strong> You can cancel a trial or subscription anytime by turning off auto-renewal in your Google Play account settings. To avoid being charged, cancel at least 24 hours before the end of the trial or then-current period. Only you can manage your subscriptions. Learn more on Google's support page.</p>
          
          <p><strong>If you purchased a subscription or enabled a trial on our Website:</strong> To avoid being charged, cancel your subscription before the end of the then-current period. You can cancel a web subscription in your profile. Below are several options (which may change from time to time) for canceling a web subscription:</p>
          <ul>
            <li>If you have an iOS device: open the 1Course app, go to your profile, and select Subscription. From there you will be taken to your subscription settings, where you can turn it off.</li>
            <li>If you have an Android device: open the 1Course app, go to your profile, and select My Subscription. From there you will be taken to your subscription settings, where you can turn it off.</li>
            <li>If you don't have the app: open your web profile page and go to subscription settings. From there you will be taken to your subscription settings, where you can turn it off.</li>
          </ul>
          <p>Canceling your subscription means automatic renewal will be turned off, but you will still have access to all your subscription features for the remaining time in the then-current period.</p>

          <h2>5. Changes</h2>
          <p>To the maximum extent permitted by law, we may change subscription fees at any time. We will give you reasonable notice of any pricing change by posting the new prices on the app and/or Website, by sending you an email notification, or in another prominent way. If you do not want to pay the new fees, you can cancel the applicable subscription before the change takes effect.</p>

          <h2>6. Refunds</h2>
          <p>In addition to any refund rights available under applicable law, if you purchased directly on our Website, please refer to our Money-Back Policy.</p>
          <p>If you purchased a subscription or enabled a trial on the App Store: If you are eligible for a refund under Apple's refund policy, please request it directly from Apple — Apple manages all such refunds. Follow the instructions on the Apple support page.</p>
          
          <p>We know legal texts can be long and complex, but we have tried to present these Subscription Terms clearly. If you have any questions after reading them, please contact us through the Support Center. You may want to take a screenshot of this information for your reference; it can help you manage your subscriptions.</p>
        </div>

        <hr style={{ margin: "40px 0", borderColor: "#e2e8f0" }} />

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