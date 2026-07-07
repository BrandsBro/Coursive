"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

const getStripePromise = async () => {
  try {
    const res = await fetch("/api/stripe/mode");
    const { mode } = await res.json();
    if (mode === "live" && process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY) {
      return loadStripe(process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY);
    }
  } catch(e) {}
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};
const stripePromise = getStripePromise();

const CARD_STYLE = {
  style: {
    base: { fontSize:"16px", color:"#0f172a", fontFamily:"sans-serif", "::placeholder":{ color:"#94A3B8" } },
  },
};

// Plans loaded dynamically from admin pricing settings
// Fallback hardcoded prices
const PLANS = {
  "1-Week Plan":  { price:"$6.93",  recurringPrice:"$5.99",  label:"1-Week AI Program",  weeks:1  },
  "4-Week Plan":  { price:"$19.99", recurringPrice:"$16.99", label:"4-Week AI Program",  weeks:4  },
  "12-Week Plan": { price:"$39.99", recurringPrice:"$32.99", label:"12-Week AI Program", weeks:12 },
};

function CheckoutForm({ plan, paymentType, email, name, onSuccess, onClose, displayPrice: propDisplayPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];
  const displayPrice = propDisplayPrice || planInfo.price;

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, name, paymentType }),
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

      if (paymentIntent.status === "succeeded") {
        const res2 = await fetch("/api/stripe/create-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, plan, paymentType, paymentIntentId: paymentIntent.id }),
        });
        const result = await res2.json();
        if (result.error) throw new Error(result.error);
        onSuccess();
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Order summary */}
      <div style={{ background:"#F8FAFC", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:14, color:"#374151" }}>{planInfo.label}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{displayPrice}</span>
        </div>
        {paymentType === "recurring" && (
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, color:"#22c55e", fontWeight:600 }}>🔄 Auto-renew discount</span>
            <span style={{ fontSize:12, color:"#22c55e", fontWeight:700 }}>-15%</span>
          </div>
        )}
        <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:8, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>Total</span>
          <span style={{ fontSize:15, fontWeight:800, color:"#5B4EFF" }}>{displayPrice}</span>
        </div>
        {paymentType === "recurring" && (
          <p style={{ fontSize:11, color:"#94A3B8", margin:"8px 0 0" }}>Billed every {planInfo.weeks} week{planInfo.weeks>1?"s":""} · Cancel anytime</p>
        )}
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
        {loading ? "Processing..." : `🔒 Confirm Payment ${displayPrice}`}
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

export default function PaymentModal({ plan, paymentType, email, name, onClose, onSuccess, isRenewal=false }) {
  const [pricingSettings, setPricingSettings] = useState(null);

  useEffect(() => {
    supabase.from("settings").select("value").eq("key","pricing").single()
      .then(({ data }) => { if (data?.value) setPricingSettings(data.value); });
  }, []);

  // Build dynamic PLANS from settings
  const dynamicPlans = pricingSettings?.plans ? Object.fromEntries(
    pricingSettings.plans.filter(p=>p.active).map(p => [
      p.name,
      {
        price: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,
        recurringPrice: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,
        label: p.name,
        weeks: Math.round(p.duration/7),
      }
    ])
  ) : null;

  const activePlans = dynamicPlans || PLANS;
  const design = pricingSettings || {};
  const activePlanInfo = (dynamicPlans && dynamicPlans[plan]) || PLANS[plan] || PLANS["4-Week Plan"];
  const activeDisplayPrice = activePlanInfo.price;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"28px 24px", width:"100%", maxWidth:440, boxShadow:"0 32px 80px rgba(0,0,0,0.3)", position:"relative", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, width:32, height:32, borderRadius:"50%", border:"none", background:"#F1F5F9", cursor:"pointer", fontSize:16 }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Complete your order</h2>
          <p style={{ fontSize:13, color:"#64748B", margin:0 }}>
            {paymentType==="recurring" ? "🔄 Auto-renew — Cancel anytime" : "One-time payment"}
          </p>
        </div>
        <Elements stripe={stripePromise} options={{ appearance:{ theme:"stripe" } }}>
          <CheckoutForm plan={plan} paymentType={paymentType} email={email} name={name} onSuccess={onSuccess} onClose={onClose} displayPrice={activeDisplayPrice}/>
        </Elements>
      </div>
    </div>
  );
}
