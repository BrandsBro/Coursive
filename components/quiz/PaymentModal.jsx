"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CARD_STYLE = {
  style: {
    base: { fontSize:"16px", color:"#0f172a", fontFamily:"sans-serif", "::placeholder":{ color:"#94A3B8" } },
  },
};

const PLANS = {
  "1-Week Plan":  { price:"$6.93",  recurringPrice:"$5.99",  label:"1-Week AI Program",  certLabel:"1-Week AI Certificate Program",  weeks:1  },
  "4-Week Plan":  { price:"$19.99", recurringPrice:"$16.99", label:"4-Week AI Program",  certLabel:"28-Day AI Certificate Program",  weeks:4  },
  "12-Week Plan": { price:"$39.99", recurringPrice:"$32.99", label:"12-Week AI Program", certLabel:"12-Week AI Certificate Program", weeks:12 },
};

const DISCOUNT_RATE = 0.5;

function parsePrice(str) {
  if (typeof str !== "string") return null;
  const match = str.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function formatPrice(amount, currencySymbol = "$") {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

function CheckoutForm({ plan, paymentType, email, name, onSuccess, onClose, displayPrice: propDisplayPrice, discountCode, discountAmount=0, currencySymbol="$" }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];
  const displayPrice = propDisplayPrice || planInfo.price;

  const discountedNumeric = parsePrice(displayPrice);
  const originalNumeric = discountedNumeric != null ? discountedNumeric / (1 - DISCOUNT_RATE) : null;
  const discountNumeric = originalNumeric != null ? originalNumeric - discountedNumeric : null;

  const originalPriceLabel = originalNumeric != null ? formatPrice(originalNumeric, currencySymbol) : displayPrice;
  const discountLabel = discountNumeric != null ? `-${formatPrice(discountNumeric, currencySymbol)}` : null;

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    try {
      const purchaseEventId = (crypto.randomUUID?.() || Math.random().toString(36).slice(2));
      console.log("[Meta] Generated purchaseEventId:", purchaseEventId);
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, name, paymentType, discountCode, discountAmount, purchaseEventId }),
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
          body: JSON.stringify({ email, name, plan, paymentType, paymentIntentId: paymentIntent.id, purchaseEventId }),
        });
        const result = await res2.json();
        if (result.error) throw new Error(result.error);
        console.log("[Meta] Firing browser Purchase with eventId:", purchaseEventId);
        onSuccess(purchaseEventId);
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
          <span style={{ fontSize:14, color:"#374151" }}>{planInfo.certLabel}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{originalPriceLabel}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:14, color:"#374151" }}>AI Certificate</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>FREE</span>
        </div>
        {discountLabel && (
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:14, color:"#374151" }}>{Math.round(DISCOUNT_RATE*100)}% Introductory offer discount</span>
            <span style={{ fontSize:14, fontWeight:700, color:"#DC2626" }}>{discountLabel}</span>
          </div>
        )}
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

      {/* ✅ FIXED: Trust badge — 2 lines on mobile */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
        <div style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          gap:6,
          background:"#ECFDF5",
          border:"1px solid #A7F3D0",
          borderRadius:16,
          padding:"10px 16px",
          textAlign:"center",
        }}>
          <span style={{ fontSize:16, flexShrink:0 }}>✅</span>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
            <span style={{ fontSize:13, fontWeight:800, color:"#047857" }}>Unlock Full Access</span>
            <span style={{ fontSize:12, fontWeight:600, color:"#059669" }}>Money-Back Guarantee</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || !stripe}
        style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, marginBottom:12 }}
      >
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

export default function PaymentModal({ plan, paymentType, email, name, onClose, onSuccess, isRenewal=false, discountCode, discountAmount=0, displayPrice: propDisplayPrice=null }) {
  const [pricingSettings, setPricingSettings] = useState(null);

  useEffect(() => {
    supabase.from("settings").select("value").eq("key","pricing").single()
      .then(({ data }) => { if (data?.value) setPricingSettings(data.value); });
  }, []);

  const dynamicPlans = pricingSettings?.plans ? Object.fromEntries(
    pricingSettings.plans.filter(p=>p.active).map(p => [
      p.name,
      {
        price: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,
        recurringPrice: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,
        label: p.name,
        certLabel: p.certLabel || `${Math.round((p.duration||28)/7)}-Week AI Certificate Program`,
        weeks: Math.round(p.duration/7),
      }
    ])
  ) : null;

  const activePlans = dynamicPlans || PLANS;
  const design = pricingSettings || {};
  const activePlanInfo = (dynamicPlans && dynamicPlans[plan]) || PLANS[plan] || PLANS["4-Week Plan"];
  const activeDisplayPrice = propDisplayPrice || activePlanInfo.price;
  const currencySymbol = pricingSettings?.currencySymbol || "$";

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
          <CheckoutForm plan={plan} paymentType={paymentType} email={email} name={name} onSuccess={onSuccess} onClose={onClose} displayPrice={activeDisplayPrice} discountCode={discountCode} discountAmount={discountAmount} currencySymbol={currencySymbol}/>
        </Elements>
      </div>
    </div>
  );
}