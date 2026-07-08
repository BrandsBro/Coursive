"use client";
import "../legal.css";
import { useBranding } from "@/lib/useBranding";

export default function Page() {
  const branding = useBranding();
  return (
    <div className="legal-page">
      {/* Added internal styles to fix the spacing and typography gaps */}
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
        {branding.logoMain ? <img src={branding.logoMain} alt="1Course" className="logo-main" style={{ objectFit:"contain", padding:4 }}/> : <a href="/" className="legal-logo">✦ 1Course</a>}
      </div>
      
      <div className="legal-container">
        <h1 className="legal-h1">Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "-20px 0 32px" }}>
          Last Updated: July 8, 2026
        </p>

        <div className="legal-content">
          <h2>IMPORTANT PRIVACY INFORMATION</h2>
          <p>To provide the Service on the Website, we may ask you to enter information about your age, gender, email address, name, current financial situation, and other onboarding questions. We also automatically collect from your device: language settings, IP address, time zone, device type and model, device settings, and operating system. We need this data to provide our services, to analyze how customers use the Service, and to measure ads.</p>
          
          <p>To improve our Service and serve ads, we use third-party solutions. As a result, we may process data using solutions from providers such as Amazon Web Services, Meta, Google, TikTok, Hotjar, Amplitude, Apple, PayPal, FreshDesk, Solidgate, OpenAI, and ActiveCampaign. Some of your data is therefore stored and processed on the servers of these third parties. This lets us: (1) analyze interactions (how often users subscribe, the most popular financial goals, average time spent on the Service); and (2) serve ads (including to a particular group of users, for example subscribers). This helps us understand which features and content you find most valuable so we can focus on them and improve our products.</p>
          
          <p>Please read this Privacy Policy to learn more about what we do with data (Section 3), what privacy rights are available to you (Section 5), and who the data controller is (Section 1). Depending on the region you access the Service from and the product you choose, we aim to provide you with various privacy controls and rights, for example:</p>
          
          <ul>
            <li>influence online tracking through the e-Privacy settings on our Website;</li>
            <li>opt out of the sale/sharing of data (as defined by certain US laws);</li>
            <li>request deletion of your data and account;</li>
            <li>exercise other privacy rights.</li>
          </ul>
          
          <p>Where these features are available to you, they will be shown prominently in footers, menus, or profile sections of our products. We aim to provide most of these rights as self-service features; if you cannot find them or they are not available, please submit a request to us.</p>
          
          <p>If you have any questions, please contact us at support@1course.io.</p>
          
          <p>This Privacy Policy explains what personal data is collected when you use the 1Course Website at https://1course.io (the "Website") and the services and digital products provided through it (the "Service"), and how that personal data is processed.</p>
          
          <p><strong>BY USING THE SERVICE, YOU CONFIRM THAT (I) YOU HAVE READ, UNDERSTAND, AND AGREE TO THIS PRIVACY POLICY, AND (II) YOU ARE OVER 16 YEARS OF AGE (OR HAVE HAD YOUR PARENT OR GUARDIAN READ AND AGREE TO THIS PRIVACY POLICY FOR YOU).</strong> If you do not agree, or cannot make this confirmation, you must not use the Service. In that case you must (a) contact us and request deletion of your data; (b) cancel any subscriptions using the instructions on the Website; and (c) leave the Website and not access or use it.</p>
          
          <p>"GDPR" means the General Data Protection Regulation (EU) 2016/679.</p>
          <p>"EEA" includes all current member states of the European Union and the European Economic Area. For this policy, EEA also includes the United Kingdom.</p>
          <p>"Process," in respect of personal data, includes to collect, store, and disclose to others.</p>

          <h2>1. Personal Data Controller</h2>
          <p>Cartix LLC, a limited liability company organized under the laws of the State of Wyoming, United States, with its principal address at 5830 East 2nd Street, Casper, Wyoming 82609, is the controller of your personal data.</p>

          <h2>2. Categories of Personal Data We Collect</h2>
          <p>We process data (i) you give us (for example, when you enter your gender, financial status, or email), and (ii) collected automatically when you use the Service (for example, your IP address via cookies or SDK technologies).</p>
          
          <h3>Data you give us:</h3>
          <ol>
            <li><strong>Identifiers and onboarding data.</strong> You provide information about yourself when you register for and/or use the Service — for example, age, gender, name, information about your financial status (including your questions about financial mindset), and email address.</li>
            <li><strong>Commercial information.</strong> When you make payments through the Service, you provide financial account data, such as your card number, to our third-party payment processors. We do not collect, store, or have access to your full card number, though we may receive limited information — including a secure token reflecting your payment method, details of the products or services purchased, the date, time, and amount of the purchase, the type of payment method used, and limited digits of your card number.</li>
            <li><strong>Comments you provide with your requests.</strong> You may provide personal information through our "Contact us" forms or by emailing us (including through our data processors referenced as communication services providers in Section 4). This may include any comments you include in your inquiry.</li>
          </ol>

          <h3>Data we collect automatically:</h3>
          <ul>
            <li><strong>2.1. Data about how you found us.</strong> We collect data about your referring URL (where on the web you were when you tapped our ad).</li>
            <li><strong>2.2. Device and location data.</strong> We collect data from your device — for example, language settings, IP address, time zone, device type and model, device settings, and operating system and version.</li>
            <li><strong>2.3. Usage data.</strong> We record how you interact with the Service — for example, your taps and clicks on parts of the interface, the features and content you interact with, how often and how long you use the Service, and your subscription orders. We also record the ads on our Website that you interact with and the links they lead to.</li>
            <li><strong>2.4. Transaction data.</strong> When you make payments through the Service, you provide financial account data, such as your card number, to our third-party processors. We do not collect or store your full card number, though we may receive card-related data and transaction data, including the date, time, and amount of the transaction and the type of payment method used.</li>
            <li><strong>2.5. Cookies and similar tracking technologies.</strong> Our products use technologies (cookies, SDKs, etc.) to process your data, enhance your experience, optimize ads, and analyze traffic. These technologies activate when you interact with our services, visit our Website, use our apps, or enable certain features like chats. Disabling them may affect some features, though our products will remain usable.</li>
          </ul>
          
          <p>A cookie is a small text file stored on your device for record-keeping. Cookies can be session cookies (which expire when you close your browser) or persistent cookies (which stay on your device for a longer period). We also use tracking pixels that set cookies to help deliver online advertising. Cookies are classified by origin: first-party cookies are set by our own websites and sub-domains; third-party cookies are set by other organizations within our Services, including services that help protect our site and provide extra features (customer support portal, web chat, etc.). Cookies are used, in particular, to recognize you the next time you visit, so information you entered earlier may appear automatically. Cookie data is stored on your device, usually for a limited time.</p>
          <p>We respect your right to privacy and give you the option not to allow data processing that is not required to provide the services you request.</p>

          <h2>3. Purposes for Processing Your Personal Data and Legal Bases</h2>
          <p>We process your personal data for the following purposes:</p>
          <ul>
            <li><strong>To provide the Service and exercise contractual rights and responsibilities.</strong> This includes letting you use the Service smoothly and preventing or addressing errors and technical issues. To host personal data and operate the Website, we use Amazon Web Services. Categories: identification and contact data, commercial information (for paid services), and data on use of the services. Legal basis: performance of our contract with you, and our legitimate interest — including securing our rights after the service ends. After we stop providing services, we may continue to process your information for a limited time to fulfill our contract and protect our legal rights.</li>
            <li><strong>To communicate with you about your use of the Service.</strong> We communicate with you — for example, by email, using the details you provide, including your name — about the Service, critical changes, and special offers. To opt out of these emails, click the unsubscribe link in the footer of our email. The services we use for this may collect data about when a message was viewed and whether you interacted with it (for example, by clicking links). We also use your data to communicate with you about events or contests you take part in. Categories: identification and contact data. Legal basis: our legitimate interest (customer engagement) or your explicit consent.</li>
            <li><strong>To personalize our ads.</strong> We and our partners, including Meta and Google, use your personal data to tailor ads and show them to you at relevant times. Categories: onboarding information, device and geolocation data, advertising IDs, cookies and similar technologies. Legal basis: consent or legitimate interest (unless consent is required, for example under certain e-Privacy regulations).</li>
            <li><strong>To manage your account and provide customer support.</strong> We process your data to respond to your requests for technical support and service information and to any other communication you start, including accessing your account to address support requests. For this purpose we may send you notifications or emails about the Service's performance, security, payment transactions, and notices about our Terms or this Privacy Policy. FreshDesk provides us with messaging and customer-service tools. When you chat with us in-Service, some of your information is automatically transferred to FreshDesk so we can identify you (if you shared name-related data) and communicate with you. Categories: identification data, contact data, data on use of the services, and other data. Legal basis: performance of our contract with you and our legitimate interest in effective support.</li>
            <li><strong>To research and analyze your use of the Service.</strong> This helps us understand our business and maintain, improve, innovate, plan, design, and develop the Service and new products, and to run statistical analysis and test our offers. For example, if we find users engage more with a specific topic, we may add chapters to that category. To analyze use and measure ad effectiveness, we use Google Analytics, which places cookies on your device and gives us aggregated information about the data you enter and your interactions. Google lets you influence this collection by installing a browser plug-in. We also use Amplitude (Amplitude Inc.) to understand how customers use the Service; it collects technical information such as time zone, device type, and unique identifiers, and lets us track interactions so we can decide which features to focus on. Categories: identification and contact data, device data, website usage data, data on use of the services. Legal basis: legitimate interest (unless consent is required).</li>
            <li><strong>To send you marketing communications.</strong> We process your data for marketing campaigns and may add your email address to our marketing list where we have consent or another legal basis. You will receive information about our products, such as special offers. To unsubscribe, follow the instructions in the footer of our marketing emails. We use ActiveCampaign as our message-sending service and integrate analytics to build audiences and track opens and conversions. Categories: identification and contact data. Legal basis: our legitimate interest (customer engagement) or your explicit consent.</li>
            <li><strong>To process your payments.</strong> We provide paid features and use third-party payment processors. As a result of this processing you can pay for the Service, and we are notified that payment was made. We do not store or collect your payment card details ourselves; they go directly to our third-party processors. We use SolidGate to process payments on the Website. Categories: identification data, commercial information, device and geolocation data. Legal basis: performance of our contract with you.</li>
            <li><strong>To enforce our Terms and Conditions and prevent fraud.</strong> We use personal data to enforce our agreements and to detect, prevent, and combat fraud. As a result, we may share your information with others, including law enforcement (for example, if a dispute arises under our Terms). Categories: all categories. Legal basis: performance of our contract with you and our legitimate interest.</li>
            <li><strong>To comply with legal obligations.</strong> We may process, use, or share your data when the law requires it — for example, if a law enforcement agency lawfully requests it. Categories: all categories. Legal basis: compliance with legal obligations.</li>
          </ul>

          <h2>4. With Whom We Share Your Personal Data</h2>
          <p>We share information with third parties that help us operate, provide, improve, integrate, customize, support, and market the Service, for the purposes described in Section 3. The types of third parties include, in particular:</p>
          
          <h3>Service providers:</h3>
          <ul>
            <li>cloud storage providers (Amazon Web Services);</li>
            <li>data analytics providers (Meta, Google, Amplitude);</li>
            <li>marketing partners (social media networks, marketing agencies, email delivery services, Meta, Google, ActiveCampaign);</li>
            <li>payment processing providers (Solidgate, PayPal, ApplePay, GooglePay);</li>
            <li>communication services providers (FreshDesk, OpenAI).</li>
          </ul>
          
          <p><strong>Law enforcement agencies and other public authorities.</strong> We may use and disclose personal data to enforce our Terms, to protect our rights, privacy, safety, or property (and that of our affiliates, you, or others), and to respond to requests from courts, law enforcement, regulators, and other authorities, or in other cases provided by law.</p>
          <p><strong>Third parties as part of a merger or acquisition.</strong> As we develop our business, we may buy or sell assets or business offerings, and customer information is generally one of the transferred assets. We may share information with an affiliated entity (such as a parent company or subsidiary) and may transfer it in a corporate transaction such as a sale, divestiture, merger, consolidation, or asset sale, or in the unlikely event of bankruptcy.</p>

          <h2>5. How You Can Exercise Your Privacy Rights</h2>
          <p>To stay in control of your personal data, you have the following rights:</p>
          <ul>
            <li><strong>Access, review, update, and correct.</strong> You may request a copy of your personal data and ask us to update or correct it, at support@1course.io.</li>
            <li><strong>Delete.</strong> You can request erasure of your personal data by emailing support@1course.io. We will use reasonable efforts to honor your request. In some cases we may be legally required to keep some data for a period; if so, we will complete your request after meeting those obligations.</li>
            <li><strong>Object to or restrict use.</strong> You can ask us to stop using your personal data or limit our use. For example:
              <ul>
                <li>Email marketing: unsubscribe using the link in every email or by contacting support.</li>
                <li>E-privacy settings: we bring EU-style privacy features to customers worldwide and let you influence tracking decisions on a per-purpose basis through the e-Privacy settings, usually located in the footer, menu, or profile sections of our products.</li>
              </ul>
            </li>
          </ul>
          
          <p>If you are based in the EEA, the UK, or Switzerland, you have the right to lodge a complaint with your local data protection supervisory authority — in particular, in the country where you live or work, or where the alleged infringement took place. We would appreciate the chance to address your concerns directly first, so please consider contacting us at support@1course.io.</p>
          
          <h3>How to opt out of or influence personalized advertising:</h3>
          <ul>
            <li><strong>iOS:</strong> Settings &gt; Privacy &gt; Advertising, then select "Personalized Ads"; you can also reset your advertising identifier there.</li>
            <li><strong>Android:</strong> open the Google Settings app, tap "Ads," and enable "Opt out of interest-based ads"; you can also reset your advertising identifier there.</li>
            <li><strong>macOS:</strong> System Preferences &gt; Security &amp; Privacy &gt; Privacy &gt; Apple Advertising, then deselect Personalized Ads.</li>
            <li><strong>Windows:</strong> Start &gt; Settings &gt; Privacy, then turn off "Let apps use advertising ID." For other Windows versions, follow Microsoft's instructions.</li>
          </ul>
          
          <p>You may also get information and opt out of some interest-based advertising at:</p>
          <ul>
            <li>Network Advertising Initiative — http://optout.networkadvertising.org/</li>
            <li>Digital Advertising Alliance — http://optout.aboutads.info/</li>
            <li>Digital Advertising Alliance (Canada) — http://youradchoices.ca/choices</li>
            <li>Digital Advertising Alliance (EU) — http://www.youronlinechoices.com/</li>
          </ul>
          
          <p>We use the Meta pixel on the Service to track conversions from Meta ads, build targeted audiences, and remarket to people who have taken certain actions. Through Meta Custom Audiences we can create a list of users to show ads to on Meta and its products (such as Instagram). You can learn how to opt out of Meta Custom Audiences and control the ads you see on Meta in Meta's settings. We use Google Ads to deliver and tailor ads (for example, to users who have purchased a subscription); Google lets you opt out of personalized ads and prevent your data from being used by Google Analytics. We use the TikTok pixel and TikTok Ads to measure the impact of campaigns and deliver ads tailored to categories of users; see TikTok's Privacy Policy for details.</p>
          
          <p><strong>Automated decision-making.</strong> You will not be subject to any decision with a significant effect on you based solely on automated decision-making.</p>
          <p><strong>Data portability.</strong> If you wish to receive your personal data in a machine-readable format, send a request to support@1course.io.</p>
          <p>To exercise any of these rights, please contact support@1course.io.</p>

          <h2>6. Age Limitation</h2>
          <p>We do not knowingly process personal data from anyone under 16 years of age. If you learn that someone younger than 16 has provided us with personal data, please contact us at support@1course.io.</p>

          <h2>7. International Data Transfers</h2>
          <p>We may transfer personal data to countries other than the one where it was originally collected in order to provide the Service and for the purposes described in this Privacy Policy. If those countries do not have the same data protection laws, we apply appropriate safeguards. In particular, if we transfer personal data originating from the EEA to countries without an adequate level of protection, we rely on one of the following: (i) Standard Contractual Clauses approved by the European Commission, or (ii) a European Commission adequacy decision about the relevant country.</p>

          <h2>8. Changes to This Privacy Policy</h2>
          <p>We may modify this Privacy Policy from time to time. If we make material changes, you will be notified through the Service or by other available means and will have an opportunity to review the revised policy. By continuing to access or use the Service after those changes take effect, you agree to be bound by the revised Privacy Policy.</p>

          <h2>9. California Privacy Rights</h2>
          <p>This section provides additional details about how we process the personal data of California consumers and the rights available to them under the California Consumer Privacy Act ("CCPA") and California's Shine the Light law. It applies only to residents of California.</p>
          <p>Under the Shine the Light law, California residents may ask, once a year, what personal information we share with third parties for those third parties' direct marketing purposes. To request this, email support@1course.io with "Request for California Shine the Light Privacy Information" in the subject line and your state of residence and email address in the body. Not all information sharing is covered by Shine the Light, and only covered sharing will be included in our response.</p>
          <p>The CCPA also gives you the right to opt out of the sale or sharing of, and to limit the use of, your personal information. We may share certain information with partners for targeted advertising or data analytics, which in some circumstances could be considered "selling," "sharing," or "targeted advertising" under California law. You have the right to opt out of such sale/sharing. Depending on the product, we aim to provide a prominent "Your Privacy Choices" link — usually in the footer, menu, or profile — that lets you exercise this right, and we will work to recognize and process opt-out preference signals as soon as possible.</p>

          <h2>10. Data Retention</h2>
          <p>We store your personal data for as long as reasonably necessary to achieve the purposes in this Privacy Policy (including providing the Service to you), which includes the period during which you have an account. We also retain and use your personal data as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. For example, certain accounting and tax laws require us to store commercial information for long periods. So even if you submit a deletion request, a small portion of data related to our compliance obligations may be stored after the request is satisfied.</p>

          <h2>11. How "Do Not Track" Requests Are Handled</h2>
          <p>Except as otherwise stated in this Privacy Policy, the Service does not support "Do Not Track" requests. To find out whether the third-party services we use honor "Do Not Track," please read their privacy policies.</p>

          <hr style={{ margin: "40px 0", borderColor: "#e2e8f0" }} />

          <div className="lcontact">
            <strong>Cartix LLC (1Course)</strong><br/>
            Principal address: 5830 East 2nd Street, Casper, Wyoming 82609<br/>
            Mailing address: 2331, 701 Tillery Street Unit 12, Austin, TX 78702<br/>
            Email: <a href="mailto:support@1course.io">support@1course.io</a><br/>
            Date of Last Revision: July 8, 2026<br/>
            © CARTIX LLC 2026. All rights reserved.
          </div>

          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: "24px" }}>
            * "Personal data" means any information relating to an identified or identifiable natural person (a "data subject"); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or one or more factors specific to that person's physical, physiological, genetic, mental, economic, cultural, or social identity (Article 4(1) of the GDPR).
          </p>
        </div>
      </div>
    </div>
  );
}