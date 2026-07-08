"use client";
import "../legal.css";
export default function Page() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <a href="/" className="legal-logo">✦ 1Course</a>
      </div>
      <div className="legal-container">
        <h1 className="legal-h1">Subscription Terms</h1>
        <p style={{ fontSize:13, color:"#94A3B8", margin:"-20px 0 32px" }}>Last Updated: July 8, 2026</p>
        
        <div className="lcontact">
          <strong>Cartix LLC (1Course)</strong><br/>
          5830 East 2nd Street, Casper, Wyoming 82609<br/>
          Email: <a href="mailto:support@1course.io">support@1course.io</a><br/>
          © CARTIX LLC 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}
