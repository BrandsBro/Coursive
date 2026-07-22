"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      const params = new URLSearchParams(window.location.search);
      const value = parseFloat(params.get("value") || "19.99");
      const plan = params.get("plan") || "AI Course";
      const eventId = params.get("eid") || "";
      const orderId = params.get("pid") || params.get("eid") || "";

      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
        return match ? match[2] : undefined;
      };

      let fbc = getCookie("_fbc");
      if (!fbc) {
        const fbclid = params.get("fbclid");
        if (fbclid) fbc = `fb.1.${Math.floor(Date.now()/1000)}.${fbclid}`;
      }

      let externalId, email, name;
      try {
        externalId = localStorage.getItem("user_id") || undefined;
        email = localStorage.getItem("user_email") || undefined;
        name = localStorage.getItem("user_name") || undefined;
      } catch(e) {}

      if (eventId) {
        // Re-init pixel with user data for better matching
        if (email) {
          window.fbq("init", "1707573550631351", {
            em: email,
            external_id: externalId,
            fn: name ? name.split(" ")[0] : undefined,
            ln: name && name.split(" ")[1] ? name.split(" ")[1] : undefined,
            fbp: getCookie("_fbp"),
            fbc,
          });
        }
        window.fbq("track", "Purchase", {
          value,
          currency: "USD",
          content_name: plan,
          content_type: "product",
          order_id: orderId,
        }, { eventID: eventId });
      }
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(t);
          router.push("/home");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a081e,#1e1b4b)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:480, width:"100%" }}>
        <div style={{ fontSize:80, marginBottom:24 }}>🎉</div>
        <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:"40px 32px", marginBottom:24 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>✓</div>
          <h1 style={{ fontSize:32, fontWeight:900, color:"#fff", margin:"0 0 12px" }}>Payment Successful!</h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", margin:"0 0 24px", lineHeight:1.7 }}>
            Congratulations! 🎊 Your payment was successful. Check your email for confirmation.
          </p>
          <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:14, padding:"16px 20px", marginBottom:24 }}>
            <p style={{ fontSize:14, color:"#86efac", margin:0, fontWeight:600 }}>
              📧 Check your email for confirmation details
            </p>
          </div>
          <Link href="/home" style={{ display:"block", padding:"16px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:700, textDecoration:"none" }}>
            Go to Dashboard →
          </Link>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:16 }}>
            Redirecting in {count} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
