"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, { betas: ["link_default_integration_beta_1"] });

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      fontFamily: "sans-serif",
      "::placeholder": { color: "#94A3B8" },
    },
  },
};

function CheckoutForm({ plan, email, name, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      // Create payment intent
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, name }),
      });
      const { clientSecret, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name, email },
        },
      });

      if (stripeError) throw new Error(stripeError.message);
      if (paymentIntent.status === "succeeded") onSuccess();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const PLANS = {
    "1-Week Plan":  { price: "$6.93",  label: "1-Week AI Program" },
    "4-Week Plan":  { price: "$19.99", label: "4-Week AI Program" },
    "12-Week Plan": { price: "$39.99", label: "12-Week AI Program" },
  };
  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];

  return (
    <div>
      {/* Order summary */}
      <div style={{ background:"#F8FAFC", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:14, color:"#374151" }}>{planInfo.label}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{planInfo.price}</span>
        </div>
        <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:8, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>Total</span>
          <span style={{ fontSize:15, fontWeight:800, color:"#5B4EFF" }}>{planInfo.price}</span>
        </div>
      </div>

      {/* Card fields */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Card Number</label>
          <div style={{ padding:"13px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff" }}>
            <CardNumberElement options={CARD_STYLE}/>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Expiry</label>
            <div style={{ padding:"13px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff" }}>
              <CardExpiryElement options={CARD_STYLE}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>CVV</label>
            <div style={{ padding:"13px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff" }}>
              <CardCvcElement options={CARD_STYLE}/>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background:"#FEF2F2", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", marginBottom:16, color:"#991B1B", fontSize:13 }}>
          {error}
        </div>
      )}

      <button onClick={handlePay} disabled={loading || !stripe}
        style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, marginBottom:12 }}>
        {loading ? "Processing..." : `🔒 Confirm Payment ${planInfo.price}`}
      </button>

      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 8px" }}>✅ Pay safe & secure</p>
        <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          {["💳 Visa","💳 Mastercard","💳 Amex"].map((c,i) => (
            <span key={i} style={{ fontSize:11, color:"#64748B", background:"#F1F5F9", padding:"3px 8px", borderRadius:6 }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentModal({ plan, email, name, onClose, onSuccess }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"28px 24px", width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", position:"relative", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, width:32, height:32, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Complete your order</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:0 }}>Join 2,000,000+ AI learners on Coursiv</p>
        </div>
        <Elements stripe={stripePromise} options={{ appearance: { theme: "stripe" }, link: { enabled: false } }}>
          <CheckoutForm plan={plan} email={email} name={name} onSuccess={onSuccess} onClose={onClose}/>
        </Elements>
      </div>
    </div>
  );
}
