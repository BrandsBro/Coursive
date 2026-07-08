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
        {branding.logoMain ? <img src={branding.logoMain} alt="1Course" className="logo-main" style={{ objectFit:"contain", padding:4 }}/> : <a href="/" className="legal-logo">✦ 1Course</a>}
      </div>
      
      <div className="legal-container">
        <h1 className="legal-h1">Terms and Conditions</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "-20px 0 32px" }}>
          Last Updated: July 8, 2026
        </p>

        <div className="legal-content">
          <p>Welcome to 1Course. We have written these Terms and Conditions to be as clear and readable as possible. Please take a few minutes to read them, because they form the agreement between you, as a user of 1Course, and us, as the provider of the 1Course service.</p>
          <p>Please read these terms and conditions of use (the "Terms") carefully — and pay particular attention to Section 6 ("Subscription Plans") — before you start a trial or complete a purchase for our auto-renewing subscription service.</p>
          <p>To avoid being charged, you must actively cancel your subscription at least 24 hours before the end of the trial or the then-current subscription period. When you buy a subscription that renews automatically, you agree to that automatic renewal and to the terms shown near the point of purchase, and you understand that you must cancel it yourself to stop future charges.</p>
          
          <p><strong>PLEASE NOTE: THESE TERMS CONTAIN A BINDING ARBITRATION PROVISION IN SECTION 17 THAT AFFECTS YOUR LEGAL RIGHTS. THAT PROVISION REQUIRES DISPUTES TO BE RESOLVED IN ARBITRATION ON AN INDIVIDUAL BASIS. EXCEPT AS SET OUT IN SECTION 17, AND UNLESS YOU OPT OUT WITHIN 30 DAYS OF YOUR FIRST USE OF THE SERVICE AS DESCRIBED IN SECTION 17, ARBITRATION IS THE EXCLUSIVE AND MANDATORY VENUE FOR ANY AND ALL DISPUTES.</strong></p>
          <p><strong>THESE TERMS ALSO CONTAIN DISCLAIMERS OF WARRANTIES AND LIABILITIES (SECTION 14) AND A LIMITATION OF LIABILITY (SECTION 15).</strong></p>

          <h2>1. Who We Are</h2>
          <p>We are 1Course, operated by Cartix LLC, a limited liability company organized under the laws of the State of Wyoming, United States, with its principal address at 5830 East 2nd Street, Casper, Wyoming 82609, and a mailing address at 2331, 701 Tillery Street Unit 12, Austin, TX 78702 (together with our affiliates and our authorized representatives and resellers, "we", "us", "our", "1Course", or the "Company").</p>
          <p>Our goal is to give you valuable learning materials and related services through our website, https://1course.io (the "Website"), which is our main service platform, along with any other platforms we designate.</p>

          <h2>2. Agreement Overview</h2>
          <p>By using our product, 1Course (the "Service"), you agree to follow these Terms and Conditions (the "Terms" or the "Agreement"). Our Privacy Policy and Subscription Terms are incorporated into these Terms by reference, which means they are part of the Terms.</p>
          <p>If we make any translation of these Terms available, it is provided only for your convenience. The English version always prevails, and you can find it on the Website. If there is any conflict between a translation and the English version, the English version controls.</p>

          <h2>3. Eligibility</h2>
          <p>If you do not agree with any part of these Terms or any related documents, or if you are not eligible to use the Service, please do not access any part of the Service. To use 1Course you must be at least 16 years old and have the legal capacity to enter into this Agreement. If you are under 18, you need permission from a parent or guardian. If you do not agree with these Terms, or you are not eligible, please do not use the Service.</p>

          <h2>4. What We Offer</h2>
          <p>1Course provides a range of educational materials, including articles, reading materials, and test questions. We also offer an AI Chat feature for educational purposes. All of these materials and services are together called the "Digital Content." Please read the disclaimers and warranties below carefully, as they apply to this Digital Content.</p>
          <p>You will be able to access the Digital Content and the Service only after you register for it, which means you will need to register and pay for the introductory offer (trial) or a subscription plan (for example, 4 weeks, 12 weeks, or another period), depending on what you select at the time of purchase. After your purchase, and while you use the Service, we may offer you additional paid features. Please read any such offer carefully before accepting it.</p>

          <h2>5. AI Chat</h2>
          <p>While using the Service you will also have access to a mentor chat powered by artificial intelligence (we call it "AI Chat"). AI Chat exists for educational purposes only and is not intended to provide financial, investment, legal, or other professional advice.</p>
          <p><strong>How your content is handled in AI Chat.</strong> When you use AI Chat you may provide information (your "Input"), and we generate responses based on it (the "Output"). You own your Input, and we assign to you all rights that the law permits in the Output (together, Input and Output are your "Content"). We may use this Content to improve our services, but you can opt out of that by contacting us.</p>
          <p><strong>A note on how AI works.</strong> Because of the nature of machine learning, Output may not be unique to you, and the Service may generate the same or similar output for you or for a third party. For example, if you ask "How many days are in January?" you may receive "There are 31 days in January," and another user asking the same question may receive the same answer. Responses requested by and generated for other users are not your Content.</p>

          <h2>6. Subscription Plans</h2>
          <p><strong>What we may offer.</strong> Depending on the option you select at the time of purchase, we may offer you:</p>
          <ul>
            <li><strong>Introductory offer</strong> — a short-term offer that gives you limited access to the basic features and content of the Service. It is usually designed to let new users try the platform before it automatically converts into a subscription. You can cancel the introductory offer up to 24 hours before it ends. If you do not cancel, it automatically converts into a subscription and you will be charged the full subscription price without further notice.</li>
            <li><strong>Subscription plan</strong> — an arrangement that gives you ongoing access to the Service for a set period (for example, 4 weeks, 12 weeks, or another period, depending on what you select at the time of purchase) after you pay for it. Subscription plans renew automatically at the end of each period. You can cancel at any time, at least 24 hours before the end of the current billing period, in your account settings.</li>
            <li><strong>Additional paid features</strong> — optional functions or services that we may offer in addition to the introductory offer or subscription plan, on either a subscription or a one-time basis.</li>
          </ul>
          <p><strong>Important.</strong> Some offers may renew at the full price rather than a discounted price. Please read the terms of the introductory offer or subscription plan you choose carefully before you buy.</p>
          <p><strong>Important — price changes.</strong> The prices and the amount of Digital Content available through your introductory offer or subscription may change from time to time and by territory, and we are not obligated to notify you individually unless the law requires it. We will give you reasonable notice of any such change by posting the new prices on or through the Website, by sending you a notification, or in another prominent way. If you do not agree with a new price and do not want to pay it, please cancel your subscription before the change takes effect.</p>

          <h2>7. Billing and Cancellation</h2>
          <p>We bill for our services through payment providers such as PayPal, Visa, Mastercard, and others. Your payment method will be charged according to your subscription plan. It is your responsibility to cancel your subscription in time.</p>
          <p><strong>Payment methods.</strong> Fees for the Service are billed through our third-party payment providers. We charge the applicable fees to the payment method you submit at the time of purchase, after you confirm the purchase (by single-touch identification, facial recognition, entering your payment details on the web, or otherwise accepting the subscription terms shown on the payment screen). You authorize us to store your payment method(s) and to automatically charge the applicable subscription fees to the payment method you submit as your primary method for each renewal term. If a charge to your primary payment method fails (for example, because it has expired), you agree that we may retry billing that method or use any other payment method stored with your account. If a payment is not successfully authorized due to expiration, insufficient funds, or any other reason, we may suspend or terminate your subscription, and you remain responsible for any amounts you have not paid.</p>
          <p><strong>The automatic renewal period.</strong> Each auto-renewal period will be the same length as your initial subscription period unless we tell you otherwise through the Service. The renewal rate will be no higher than the rate for the immediately prior period, excluding any promotional or discount pricing, unless we notify you of a rate change before your renewal. Your payment date may change in some cases — for example, if a payment fails to settle or you change your plan. To see your next payment date, open the "Subscription" link on the "Account" page of the Website.</p>
          <p><strong>Cancellation and refunds.</strong> You must cancel your subscription following the cancellation steps disclosed to you at purchase and described in the Subscription Terms. Please see the Subscription Terms and our Money-Back Policy to find out whether you may be eligible for a refund. We may also cancel your subscription and provide refunds at our own discretion, subject to the Subscription Terms.</p>

          <h2>8. Data Protection</h2>
          <p>We collect, store, and process your data in accordance with our Privacy Policy. By using the Service, you agree to the collection, storage, and processing of your data in the way and for the purposes described in the Privacy Policy.</p>

          <h2>9. Use of Information and Intellectual Property</h2>
          <p>All information, text, images, graphics, marks, logos, compilations (the collection, arrangement, or assembly of information), data, other content, software, and materials available through or on the Website are the property of the Company or of third parties. You are granted a non-exclusive license to use the Service for your personal, non-commercial purposes only. No other rights to the Service are granted to you unless these Terms expressly say so in writing. Please do not infringe our intellectual property rights.</p>
          <p>Information you provide when you sign up for 1Course — your "User Content" — belongs to you, and we do not gain any ownership over it. However, you agree that we may keep copies of all registration information and User Content and use it as reasonably required for, or incidental to, operating the Service and as described in these Terms.</p>
          <p>If you believe your intellectual property rights have been violated, contact us through the Support Center. We may ask for additional information, and we may remove or disable content alleged to be infringing. We may also terminate the accounts of repeat infringers.</p>
          <p><strong>Trademarks.</strong> All brand assets, including the "1Course" name, logos, graphics, and service marks used on our platform, are the exclusive property of Cartix LLC or their respective owners, and some of them may be registered with the United States Patent and Trademark Office or other trademark authorities. Using the Service does not grant you any license or permission to reproduce or use the 1Course name or any other trademarks.</p>

          <h2>10. Third-Party Ads</h2>
          <p>The Service may contain links to third-party websites and advertisements for third-party products or services. We are not responsible for these third-party ads, and you use them at your own risk. When you follow a link to a third-party website, that website's own terms and conditions govern your relationship with its owner. Please be careful and do your own research on any such advertisement. You release us, along with our officers, employees, agents, and successors, from any claims, demands, losses, damages, and actions of any kind, directly or indirectly related to such third-party advertisements, products, and services.</p>

          <h2>11. Compliance</h2>
          <p>The Service is provided in accordance with the laws of the State of Wyoming and the United States. We make no representation or warranty that the Service or the Digital Content is appropriate or available for use in other locations. If you use the Service from a jurisdiction other than the United States, you do so at your own risk and are responsible for complying with all local laws that apply to your use of the Service.</p>

          <h2>12. Copyright Statement</h2>
          <p>1Course holds copyright in the product, including but not limited to all materials, logos, and similar assets. Any redistribution or reproduction of part or all of the Service and/or the Digital Content available through the subscription service, in any form, is prohibited. Any other proposed use of the Service and/or Digital Content requires our formal written permission.</p>

          <h2>13. User Representations and Restrictions</h2>
          <p><strong>Representations and warranties.</strong> By using the Service, you represent and warrant that:</p>
          <ul>
            <li>you have the legal capacity and agree to comply with these Terms;</li>
            <li>you are not under 16 years of age;</li>
            <li>you will not access the Service by automated or non-human means, including any spider, robot, scraper, cheat utility, or offline reader, and you will not use or launch any unauthorized script or software;</li>
            <li>you will not use the Service for any illegal or unauthorized purpose;</li>
            <li>you are not located in a country that is subject to a U.S. government embargo or that the U.S. government has designated as supporting terrorism;</li>
            <li>you are not listed on any U.S. government list of prohibited or restricted parties; and</li>
            <li>your use of the Service will not violate any applicable law or regulation.</li>
          </ul>
          <p>If you provide any information that is untrue, inaccurate, out of date, or incomplete, we may refuse any and all current or future use of the Service (or any part of it). You may not use the Service for any purpose other than the one for which we make it available. The Service may not be used for any revenue-generating activity, commercial enterprise, or other purpose it is not designed or intended for, except where we specifically authorize or approve it.</p>
          
          <p><strong>Restrictions.</strong> As a user of the Service, you agree not to:</p>
          <ul>
            <li>systematically retrieve data or other content from the Service to create or compile, directly or indirectly, a collection, compilation, database, or directory without our written permission;</li>
            <li>make any modification, adaptation, improvement, enhancement, translation, or derivative work from the Service;</li>
            <li>use the Service to create a product, service, or software that is, directly or indirectly, competitive with or a substitute for the Service;</li>
            <li>circumvent, disable, or otherwise interfere with security-related features of the Service;</li>
            <li>engage in unauthorized framing of, or linking to, the Service;</li>
            <li>decipher, decompile, disassemble, or reverse engineer any of the software that makes up any part of the Service;</li>
            <li>attempt to bypass any measures of the Service designed to prevent or restrict access to it;</li>
            <li>use the Service to send automated queries to any website or to send unsolicited commercial email;</li>
            <li>disparage, tarnish, or otherwise harm, in our opinion, us or the Service;</li>
            <li>use the Service in a way that is inconsistent with any applicable law or regulation; or</li>
            <li>otherwise infringe these Terms.</li>
          </ul>

          <h2>14. Disclaimers of Warranties and Liabilities</h2>
          <p><strong>About information on the Service.</strong> Any statement or information posted on the Service is for informational and educational purposes only and is not intended to replace or substitute for professional financial, legal, or other advice.</p>
          <p><strong>About advice.</strong> 1Course does not provide investment or financial advice and does not advocate for the purchase or sale of any security or investment through the Service.</p>
          <p><strong>About expectations.</strong> We do not guarantee that the Digital Content will meet your needs or requirements. The Service may not be suitable for everyone and is not a substitute for professional financial advice.</p>
          <p><strong>About results.</strong> We make no guarantees about the level of success you will have, and you accept that results vary from person to person. The Service may show examples of exceptional results that do not apply to the average person and are not meant to represent or guarantee that anyone will achieve the same or similar result. As with any learning program, your results will vary and will depend on many factors, including your individual capacity, life experience, financial status, starting point, expertise, and level of commitment. You agree that 1Course is not liable for any success or failure, or any financial risk, directly or indirectly related to your purchase and use of the Service.</p>
          <p><strong>About capital risk.</strong> 1Course is an education platform; you cannot invest with us. If you decide to invest on your own, you should understand that there is a risk of capital loss, that income is not guaranteed, and that outcomes depend on many factors. Any decision to invest is made at your own discretion and of your own free will.</p>
          <p><strong>About representations.</strong> To the fullest extent permitted by law, 1Course makes no representations or warranties and expressly disclaims all liability relating to your reliance on statements or other information offered through the Service. If you have specific concerns, or a situation arises where you need professional advice, you should consult an appropriately trained and qualified specialist.</p>
          <p><strong>About other products.</strong> Including any sites or other product information in the Service does not imply a recommendation; it merely presents possible options. It is your responsibility to investigate any such information before making a decision.</p>
          <p><strong>About accuracy of information.</strong> We specifically disclaim any representations or warranties, express or implied, including, without limitation, warranties relating to the accuracy, reliability, correctness, timeliness, or completeness of information made available on the Website or otherwise by us — including any advice, opinion, statement, or other material or database displayed, uploaded, or distributed through the Website — and warranties relating to performance, non-performance, or other acts or omissions by us or any third party. 1Course disclaims responsibility for any loss, damage, or injury arising out of or in connection with use of the Service's information. 1Course will not be liable to you for any indirect, consequential, special, incidental, punitive, or exemplary damages resulting from access to or use of the Website, the Service, or such Digital Content, tools, or prizes, or in connection with any failure of performance, error, transmission, computer virus, or line or system failure — including, without limitation, lost profits, lost savings, and lost revenue.</p>

          <h2>15. Limitation of Liability</h2>
          <p>IN NO EVENT SHALL WE (OR OUR AFFILIATES) BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFIT OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES ARISING FROM THESE TERMS OR FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICE (INCLUDING THE DIGITAL CONTENT) AND PRODUCTS, OR THIRD-PARTY ADS, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>ACCESS TO AND USE OF THE SERVICE (INCLUDING THE DIGITAL CONTENT AND USER CONTENT) AND THIRD-PARTY ADS ARE AT YOUR OWN DISCRETION AND RISK, AND YOU ARE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTING SYSTEM OR LOSS OF DATA THAT RESULTS.</p>
          <p>NOTWITHSTANDING ANYTHING TO THE CONTRARY IN THESE TERMS, YOU AGREE THAT THE TOTAL AGGREGATE LIABILITY OF 1COURSE TO YOU FOR ANY AND ALL CLAIMS ARISING FROM YOUR USE OF THE APP, CONTENT, SERVICE, OR PRODUCTS IS LIMITED TO THE AMOUNTS YOU HAVE PAID TO 1COURSE FOR ACCESS TO AND USE OF THE SERVICE.</p>
          <p>THE LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE AGREEMENT BETWEEN 1COURSE AND YOU. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU, AND YOU MAY HAVE OTHER LEGAL RIGHTS THAT VARY FROM JURISDICTION TO JURISDICTION.</p>
          
          <p><strong>15.1. If you are an Australian resident.</strong> This Service is provided with guarantees under the Australian Consumer Law that cannot be excluded. In the case of a major failure, you are entitled to (a) terminate the agreement for the provision of the Service; and (b) receive either a refund for the unused portion of the Service or compensation for its reduced value. If the failure is not major, we will remedy it within a reasonable time; if we do not, you may terminate the agreement and request a refund for the unused portion of the Service. You may also be entitled to compensation for any other reasonably foreseeable loss or damage arising from the Service's failure.</p>

          <h2>16. Indemnification</h2>
          <p>In no event will 1Course be liable for any loss, damage, or injury, including any indirect, consequential, special, incidental, or punitive damages, arising out of or in connection with use of the Service — including any decision made or action taken in reliance on information in the Service, or any errors or omissions in the Service.</p>
          <p>By using the Service, you agree to indemnify, defend, and hold harmless 1Course from and against any and all claims, complaints, lawsuits, or other liabilities, including reasonable attorneys' fees, that may arise from your use of the Service or your decision to follow any advice, recommendation, or instruction provided in it.</p>
          <p>You agree to indemnify and hold harmless 1Course, along with its successors, subsidiaries, affiliates, related companies, suppliers, licensors, and partners, and the officers, directors, employees, agents, and representatives of each of them, including costs and attorneys' fees, from any claim or demand made by any third party arising out of (i) your use of the Service or Digital Content, (ii) your User Content, or (iii) your violation of these Terms.</p>

          <h2>17. Dispute Resolution and Binding Arbitration</h2>
          <p><strong>PLEASE READ THIS SECTION CAREFULLY. IT CONTROLS HOW DISPUTES BETWEEN YOU AND THE COMPANY ARE RESOLVED. BY AGREEING TO THIS SECTION, YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT AND YOUR RIGHT TO A JURY TRIAL. YOU ALSO AGREE TO RESOLVE ALL DISPUTES BETWEEN YOU AND THE COMPANY THROUGH BINDING ARBITRATION, UNLESS YOU EXERCISE YOUR RIGHT TO OPT OUT AS DESCRIBED BELOW.</strong></p>
          <p>You and 1Course (the "Company") agree to resolve all Disputes (including any related disputes involving the Company, its subsidiaries, or its affiliates) through binding arbitration, as described below, except for: (i) claims that fall within the jurisdiction of a small claims court, provided they are not class actions and meet that court's jurisdictional and monetary limits; and (ii) disputes about intellectual property rights. A "Dispute" means any claim, controversy, or legal action — whether based on past, present, or future events, and whether based on contract, tort, statute, or common law — between you and the Company regarding the Website, the Service, or this agreement (the "Arbitration Agreement"). "Dispute" also includes disputes about the interpretation, applicability, enforceability, or formation of this Arbitration Agreement, including whether any part of it is invalid or unenforceable.</p>
          
          <p><strong>Mandatory pre-filing notice.</strong> Good-faith, informal efforts often resolve disputes faster and more cheaply. So before you assert a claim for any Dispute against the Company, you must first send the Company a written notice (the "Notice"). Any Notice must include: (i) your name, address, and email address; (ii) a detailed description of your Dispute; (iii) the relevant facts about your use of the Website and Service (including your account ID, profile screenshots, and anything else that helps us identify your account); (iv) a detailed description of the relief you seek, including a calculation of any money damages; and (v) a statement personally signed by you (not your attorney) verifying that the information in the Notice is accurate.</p>
          <p>The Notice must be individualized and may concern only your own Dispute. If you are filing a Notice for another person, you must include all of the information above plus a statement describing your relationship to that person and why they cannot file for themselves. Send the Notice to the Company at: 5830 East 2nd Street, Casper, Wyoming 82609, Attention: Legal. If we need to send you a Notice, we will use the contact information we have for you, including any information associated with your account.</p>
          <p>After we receive a Notice, you and we agree to work in good faith to resolve the Dispute for a period of 60 days through informal negotiation. This period can be extended if both parties agree it is likely to lead to a resolution. As part of this process, you and we agree to attend at least one individualized video conference (the "Video Conference"), which can be held on Zoom, Microsoft Teams, or another platform we both agree on and can access. If you are represented by an attorney, your attorney may attend, but you must also attend and participate in good faith. The Company will send one or more of its representatives, and may also send its attorneys. If you cannot attend by video, you may attend by phone if you certify in writing that circumstances prevent you from appearing by video. Both parties will work cooperatively to schedule the Video Conference at the earliest mutually convenient time and will use best efforts to resolve the Dispute there.</p>
          <p>If the Dispute is not resolved within 60 days after the completed Notice is received (or a longer agreed period), either party may begin an arbitration or a small claims court proceeding. Compliance with these pre-filing procedures (including the Video Conference) is mandatory and is a condition precedent to starting any arbitration or small claims action. Failure to follow them is a breach of this Arbitration Agreement. Unless the law prohibits it, the arbitration provider will not accept or administer any demand for arbitration unless the party bringing it certifies in writing that these pre-filing procedures were fully met. If that certification is missing, the arbitration forum will administratively close the demand and no fees will be due from the responding party. A court of competent jurisdiction may enforce this provision and enjoin any arbitration or small claims action accordingly. All offers, promises, conduct, and statements made during the pre-filing process are confidential and not admissible for any purpose in any later proceeding (except as needed to certify that the pre-filing procedures were completed). Evidence that is otherwise admissible or discoverable does not become inadmissible because of this section.</p>
          
          <p><strong>Small claims court.</strong> Subject to the jurisdictional requirements and the pre-filing requirements above, you or the Company may pursue a Dispute in a local small claims court instead of arbitration, as long as the matter stays in small claims court and proceeds only on an individual basis. If a party has already submitted an arbitration demand, the other party may, at its sole discretion, tell the arbitral forum it chooses small claims court instead; the forum will then administratively close the arbitration and the Dispute will be heard in the appropriate small claims court, with no fees due from the arbitration respondent.</p>
          
          <p><strong>What arbitration is.</strong> Arbitration is a more informal way to resolve disagreements than a court lawsuit. It uses a neutral arbitrator instead of a judge or jury, involves more limited discovery, and is subject to very limited court review. Although more informal, arbitrators can award the same individualized damages and relief a court can. An arbitrator cannot, however, order a party to act or stop acting (known as "equitable relief"). Either you or we can go to court for equitable relief, including a motion to compel the other party to follow this Arbitration Agreement. You and we agree that the only courts where we will seek equitable relief are the state and federal courts located in the State of Wyoming. This exception does not waive this Arbitration Agreement. You and we agree that the U.S. Federal Arbitration Act and federal arbitration law govern the interpretation and enforcement of this provision. A court of competent jurisdiction has exclusive authority to resolve any dispute about the interpretation, applicability, or enforceability of this Arbitration Agreement. This provision survives termination of these Terms and of your account.</p>
          
          <p><strong>CLASS ACTION AND JURY TRIAL WAIVER.</strong> TO THE FULLEST EXTENT ALLOWED BY LAW, YOU AND THE COMPANY WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO LITIGATE DISPUTES IN COURT IN FAVOR OF ARBITRATION (EXCEPT FOR SMALL CLAIMS COURT DESCRIBED ABOVE). YOU AND THE COMPANY EACH WAIVE THE RIGHT TO FILE OR PARTICIPATE IN A CLASS ACTION AGAINST THE OTHER, INCLUDING ANY CURRENTLY PENDING ACTIONS. TO THE FULLEST EXTENT ALLOWED BY LAW, THERE SHALL BE NO RIGHT OR AUTHORITY FOR ANY CLAIMS TO BE LITIGATED ON A CLASS, COLLECTIVE, REPRESENTATIVE, OR CONSOLIDATED BASIS.</p>
          <p>EXCEPT FOR THE MASS-FILING PROCEDURES BELOW, YOU AND WE AGREE THAT: the arbitrator may award final relief only in favor of the individual party seeking relief and only to the extent necessary for that party's claim; the arbitrator may not award relief for, against, or on behalf of anyone who is not a party to the arbitration on a class, collective, or representative basis; and if a court finds any of these prohibitions unenforceable for a particular claim or request for relief, and that decision becomes final on appeal, then that particular claim or request will proceed in court but be stayed pending individual arbitration of the remaining claims. If this specific paragraph is found unenforceable, then the entirety of this arbitration provision (except the jury trial waiver and the informal dispute resolution procedure) will be null and void.</p>
          
          <p><strong>Arbitration procedure.</strong> The arbitration will be governed by the applicable rules of the American Arbitration Association ("AAA") — including the Consumer Arbitration Rules and any applicable mass-arbitration supplement ("AAA Rules") — as modified by this Arbitration Agreement, and will be administered by the AAA. The AAA Rules are available at www.adr.org or by requesting them in writing at the Notice address above. If the AAA is unavailable or unwilling to administer the arbitration, the parties will select another provider, and if they cannot agree, a court will appoint one under 9 U.S.C. § 5. The party starting arbitration must submit a written certification that they completed the mandatory pre-filing and informal dispute resolution requirements, along with the demand for arbitration. The demand and certification must be personally signed by the party starting arbitration (and their attorney, if represented).</p>
          <p>The arbitration will be in English. A single independent, impartial arbitrator will be appointed under the AAA Rules, as modified here. You and the Company agree to the following rules, intended to streamline the process and reduce costs: (i) the arbitration will be conducted online and/or based solely on written submissions, as chosen by the party starting it; (ii) no personal appearance by parties or witnesses is required unless the parties agree or the arbitrator decides a formal hearing is necessary; and (iii) any judgment on the award may be entered in any court of competent jurisdiction. If an in-person hearing is required and you reside in the United States, it will take place in the State of Wyoming, unless the arbitrator determines that this would create a hardship for you, in which case it may be held in your state and county of residence. If you reside outside the United States, the location of any in-person hearing will be determined by the AAA Rules.</p>
          <p>The arbitrator's award will be in writing and will state the reasons for the decision. The arbitrator will apply the laws of the State of Wyoming in conducting the arbitration. You acknowledge that these Terms and your use of the Service involve interstate commerce, and that the U.S. Federal Arbitration Act governs the interpretation, enforcement, and proceedings. The arbitrator is bound by this Arbitration Agreement; if the AAA Rules conflict with it, this Arbitration Agreement controls. If the arbitrator determines that strict application of any term here would result in a fundamentally unfair arbitration, the arbitrator may modify that term only as much as needed to ensure a fundamentally fair, efficient, and inexpensive resolution. Unless you and the Company agree otherwise, the arbitration will be conducted virtually by video or teleconference.</p>
          
          <p><strong>Decision of the arbitrator.</strong> Barring extraordinary circumstances, the arbitrator will issue a decision within 120 days from the date of appointment, and may extend this by up to 30 days in the interests of justice. All proceedings will be closed to the public and confidential, and all records will be permanently sealed except as needed to obtain court confirmation of the award. The award binds only you and the Company and has no preclusive effect in any other arbitration or proceeding involving a different party.</p>
          
          <p><strong>Fees.</strong> Payment of arbitration fees (filing, arbitrator, and hearing fees imposed by the administrator) is governed by the applicable AAA Rules, unless you qualify for a fee waiver under applicable law. If, after any available fee waivers, the arbitrator finds the fees would be prohibitive for you compared to litigation, we will pay as much of your filing, arbitrator, and hearing fees as the arbitrator deems necessary to keep the arbitration from being cost-prohibitive, regardless of outcome, unless the arbitrator determines your claims were frivolous, brought for an improper purpose, or asserted in bad faith. Both parties agree arbitration should be cost-effective, and any party may work with the AAA to reduce or defer fees.</p>
          
          <p><strong>Confidentiality.</strong> At either party's request, the arbitrator will issue an order requiring that confidential information disclosed during the arbitration may not be used or disclosed except in connection with the arbitration or a proceeding to enforce the award, and that any permitted court filing of confidential information be made under seal.</p>
          
          <p><strong>Offers of judgment.</strong> At least ten calendar days before the arbitration hearing, you or the Company may serve a written offer of judgment on the other party. If accepted, the offer and proof of acceptance are submitted to the provider, who enters judgment accordingly. If not accepted before the hearing or within thirty calendar days (whichever comes first), it is deemed withdrawn and cannot be used as evidence. If a party rejects an offer and then fails to obtain a more favorable award, that party may not recover its post-offer costs and must pay the offering party's post-offer costs (which, for offers of judgment only, may include reasonable attorneys' fees recoverable by statute, up to the amount of damages awarded).</p>
          
          <p><strong>Additional procedures for mass filings.</strong> If ten or more similar claims are asserted against the Company by the same or coordinated attorneys, or are otherwise coordinated (consistent with the AAA Rules' definition of mass filings), you and we agree that these additional procedures apply and that resolution may be delayed. Our attorneys will meet and confer about modifications suited to the particular mass filing, and both parties will act in good faith to maximize the integrity and efficiency of the process.</p>
          
          <p><strong>Bellwether arbitrations.</strong> The parties will select ten individual claims (five per side) as "Initial Test Cases" to proceed to arbitration; only these will be filed with the arbitrator, and all others will be held in abeyance. Filing fees are paid only for the Initial Test Cases; for all other demands, fees (and any arbitrator consideration of them) are held in abeyance, and neither party will be required to pay them. Neither party is deemed in breach for failing to pay such held fees, and neither is entitled to any remedies, damages, or sanctions for that non-payment. If a party files non-bellwether arbitrations, the provider will hold them in abeyance and not refer them to the arbitrator pending resolution of the Initial Test Cases. Unless resolved earlier or extended, the arbitrators will render final awards for the Initial Test Cases within 120 days of the initial pre-hearing conference.</p>
          
          <p><strong>Global mediation.</strong> After the Initial Test Cases are resolved, the parties will engage in a global mediation of all remaining claims in the mass filing, deferring filing costs for the non-test cases until the Initial Test Cases and global mediation conclude. After the final awards are provided to the mediator, the mediator and parties will have 90 days to agree on a methodology and make an offer to resolve the outstanding cases. If they cannot resolve them, either party may opt out of arbitration and proceed in court with the remaining claims by giving written notice within 60 days of the close of the global mediation. Absent an opt-out, the remaining arbitrations may then be filed and administered. Any applicable statute of limitations is tolled while the global mediation is pending.</p>
          
          <p><strong>Severability.</strong> If any part of this mass-arbitration provision is found invalid or unenforceable, that part is severable and does not affect the validity of the remaining provisions.</p>
          
          <p><strong>Opting out of this Arbitration Agreement.</strong> You may opt out of this Arbitration Agreement by sending written notice of your decision to support@1course.io within 30 days after the later of (1) the date this Arbitration Agreement became effective (the "Last Updated" date of these Terms) or (2) your first use of the Service. Your notice must include: your name; your username (if any); the email address you used to set up your account; and an unequivocal statement that you want to opt out of this Arbitration Agreement. If you opt out, all other parts of these Terms and any other agreements between you and the Company still apply. Opting out has no effect on any other arbitration agreement you have or may enter into with us in the future.</p>
          
          <p><strong>Survival and severability.</strong> This Arbitration Agreement survives the termination of your relationship with the Company. If any portion of it is found void, invalid, or unenforceable, that portion is severable and, if possible, replaced by a valid, enforceable provision that matches its intent as closely as possible; the remainder continues to be enforceable.</p>
          
          <p><strong>Governing law.</strong> The laws of the State of Wyoming, excluding its conflict-of-law rules, govern this Agreement and your use of the Service. Your use may also be subject to other local, state, national, or international laws. To the extent any action relating to a Dispute is brought in a court of law, it will be subject to the exclusive jurisdiction of the state and federal courts located in the State of Wyoming, and you irrevocably submit to personal jurisdiction there and waive any defense of inconvenient forum.</p>
          
          <p><strong>If you are a consumer based in the EEA, the UK, or Switzerland.</strong> Nothing in these Terms deprives you of the protection given to consumers by the mandatory laws of the country where you live. If you have a complaint, please contact us at support@1course.io. You may bring any dispute arising under these Terms to the competent court of your country of habitual residence if it is in the EEA, and those courts alone are competent to settle such a dispute; the Company will likewise bring any such dispute to the competent court of your country of habitual residence.</p>

          <h2>18. Miscellaneous</h2>
          <p>We may update the Service from time to time and may change information without notice. Certain circumstances beyond our control may cause delays in providing the Service. We may at any time modify or discontinue the Service (or any part of it), temporarily or permanently, at our sole discretion, with or without notice. To the maximum extent permitted by law, we will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>

          <h2>19. Changes</h2>
          <p>We may update these Terms from time to time — for example, to reflect changes in the law or in our business. We will give you 30 days' advance notice of any material adverse change to the Service or these Terms. Except where mandatory law requires otherwise, other changes take effect when posted with an updated "Date of Last Revision," and no additional notice will be given. If you keep using the Service after any change, that means you accept it. If you receive notice of a material change, you have 30 days from the date of that notice to object or opt out of the Service by sending us written notice; if you do not object or opt out within that period, you are deemed to have accepted the change.</p>
          <p>If you have any questions or concerns, please reach out to our Support Center.</p>

          <hr style={{ margin: "40px 0", borderColor: "#e2e8f0" }} />

          <div className="lcontact">
            <strong>Cartix LLC (1Course)</strong><br/>
            Principal address: 5830 East 2nd Street, Casper, Wyoming 82609<br/>
            Mailing address: 2331, 701 Tillery Street Unit 12, Austin, TX 78702<br/>
            Email: <a href="mailto:support@1course.io">support@1course.io</a><br/>
            Last Updated: July 8, 2026<br/>
            Date of Last Revision: July 8, 2026<br/>
            © CARTIX LLC 2026. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}