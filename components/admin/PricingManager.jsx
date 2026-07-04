"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_PRICING = {
  // Design
  bgColor: "#0a081e",
  bgGradientFrom: "#0a081e",
  bgGradientTo: "#1e1b4b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.12)",
  cardSelectedBg: "rgba(91,78,255,0.2)",
  cardSelectedBorder: "#5B4EFF",
  popularBadgeBg: "#5B4EFF",
  popularBadgeColor: "#ffffff",
  buttonBg: "linear-gradient(135deg,#5B4EFF,#8B5CF6)",
  buttonColor: "#ffffff",
  buttonText: "Get My Plan →",
  headingColor: "#ffffff",
  priceColor: "#ffffff",
  descColor: "rgba(255,255,255,0.5)",
  discountBadgeBg: "#22c55e",
  discountBadgeColor: "#ffffff",
  legalTextColor: "rgba(255,255,255,0.4)",
  toggleBg: "rgba(255,255,255,0.08)",
  toggleActiveBg: "#fff",
  toggleActiveColor: "#0f172a",
  plans: [
    {
      id: "weekly",
      name: "1-Week Plan",
      duration: 7,
      introPrice: "6.99",
      regularPrice: "9.99",
      hasIntro: false,
      active: true,
      popular: false,
      description: "Perfect for a quick start",
    },
    {
      id: "monthly",
      name: "4-Week Plan",
      duration: 28,
      introPrice: "19.99",
      regularPrice: "39.99",
      hasIntro: true,
      active: true,
      popular: true,
      description: "Most popular choice",
    },
    {
      id: "quarterly",
      name: "12-Week Plan",
      duration: 84,
      introPrice: "39.99",
      regularPrice: "69.99",
      hasIntro: false,
      active: true,
      popular: false,
      description: "Best value for serious learners",
    },
  ],
  autoRenewDiscount: 15,
  currency: "USD",
  currencySymbol: "$",
  trialEnabled: true,
  trialDays: 7,
  trialPrice: "0.99",
  legalText: "By clicking Get My Plan, I agree to pay {introPrice} for my plan and that if I do not cancel before the end of the {duration} introductory plan, it will convert to a {duration} subscription and 1Course will automatically charge my payment method the regular price {regularPrice} every {duration} weeks thereafter until I cancel. I can cancel online by visiting the subscription page in my profile on the website or in the app to avoid being charged for the next billing cycle.",
};

export default function PricingManager() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plans");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("key","pricing").single();
    if (data?.value) setPricing({ ...DEFAULT_PRICING, ...data.value });
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("settings").upsert({ key:"pricing", value:pricing });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const updatePlan = (id, key, val) => {
    setPricing(prev => ({
      ...prev,
      plans: prev.plans.map(p => p.id === id ? { ...p, [key]: val } : p)
    }));
  };

  const u = (key, val) => setPricing(prev => ({ ...prev, [key]: val }));

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8" className="bspin"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:900, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Pricing & Payment Flow</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Control plans, intro pricing, trial periods and legal text</p>
          </div>
          <button onClick={save} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {saving?<><Loader size={14} className="bspin"/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Changes</>}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, gap:2 }}>
          {[["plans","💳 Plans"],["design","🎨 Design"],["trial","🎯 Trial"],["legal","📋 Legal Text"],["preview","👁 Preview"]].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:activeTab===v?"#fff":"transparent", fontWeight:700, fontSize:13, color:activeTab===v?"#0f172a":"#94A3B8", cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Global settings */}
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Global Settings</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={lbl()}>Currency</label>
                  <select value={pricing.currency} onChange={e => u("currency", e.target.value)} style={inp()}>
                    {["USD","EUR","GBP","CAD","AUD"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl()}>Currency Symbol</label>
                  <input value={pricing.currencySymbol} onChange={e => u("currencySymbol", e.target.value)} style={inp()}/>
                </div>
                <div>
                  <label style={lbl()}>Auto-Renew Discount %</label>
                  <input type="number" value={pricing.autoRenewDiscount} onChange={e => u("autoRenewDiscount", parseInt(e.target.value))} style={inp()}/>
                </div>
              </div>
            </div>

            {/* Plans */}
            {pricing.plans.map(plan => (
              <div key={plan.id} style={{ background:"#fff", borderRadius:20, border:`1.5px solid ${plan.popular?"#C7D2FE":"#F1F5F9"}`, padding:24, position:"relative" }}>
                {plan.popular && <div style={{ position:"absolute", top:-12, left:24, background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999 }}>MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <h3 style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>{plan.name}</h3>
                    <Toggle value={plan.active} onChange={v => updatePlan(plan.id, "active", v)} label={plan.active?"Active":"Inactive"}/>
                  </div>
                  <Toggle value={plan.popular} onChange={v => updatePlan(plan.id, "popular", v)} label="Popular"/>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:16 }}>
                  <div>
                    <label style={lbl()}>Plan Name</label>
                    <input value={plan.name} onChange={e => updatePlan(plan.id, "name", e.target.value)} style={inp()}/>
                  </div>
                  <div>
                    <label style={lbl()}>Duration (days)</label>
                    <input type="number" value={plan.duration} onChange={e => updatePlan(plan.id, "duration", parseInt(e.target.value))} style={inp()}/>
                  </div>
                  <div>
                    <label style={lbl()}>Intro Price ({pricing.currencySymbol})</label>
                    <input value={plan.introPrice} onChange={e => updatePlan(plan.id, "introPrice", e.target.value)} style={inp()}/>
                  </div>
                  <div>
                    <label style={lbl()}>Regular Price ({pricing.currencySymbol})</label>
                    <input value={plan.regularPrice} onChange={e => updatePlan(plan.id, "regularPrice", e.target.value)} style={inp()}/>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <label style={lbl()}>Description</label>
                    <input value={plan.description} onChange={e => updatePlan(plan.id, "description", e.target.value)} style={inp()}/>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:20 }}>
                    <Toggle value={plan.hasIntro} onChange={v => updatePlan(plan.id, "hasIntro", v)} label="Has intro price period"/>
                  </div>
                </div>

                {/* Price preview */}
                <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:"#F8FAFC", border:"1.5px solid #E2E8F0", display:"flex", gap:24 }}>
                  <div>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 2px" }}>One-time price</p>
                    <p style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:0 }}>{pricing.currencySymbol}{plan.introPrice}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 2px" }}>Auto-renew price</p>
                    <p style={{ fontSize:18, fontWeight:900, color:"#5B4EFF", margin:0 }}>{pricing.currencySymbol}{(parseFloat(plan.introPrice)*(1-pricing.autoRenewDiscount/100)).toFixed(2)}</p>
                  </div>
                  {plan.hasIntro && (
                    <div>
                      <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 2px" }}>After intro → regular</p>
                      <p style={{ fontSize:18, fontWeight:900, color:"#f59e0b", margin:0 }}>{pricing.currencySymbol}{plan.regularPrice}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Design Tab */}
        {activeTab === "design" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Background</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <ColorField label="Gradient From" value={pricing.bgGradientFrom} onChange={v=>u("bgGradientFrom",v)}/>
                <ColorField label="Gradient To" value={pricing.bgGradientTo} onChange={v=>u("bgGradientTo",v)}/>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Cards</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <ColorField label="Card Background" value={pricing.cardBg} onChange={v=>u("cardBg",v)}/>
                <ColorField label="Card Border" value={pricing.cardBorder} onChange={v=>u("cardBorder",v)}/>
                <ColorField label="Selected Card BG" value={pricing.cardSelectedBg} onChange={v=>u("cardSelectedBg",v)}/>
                <ColorField label="Selected Border" value={pricing.cardSelectedBorder} onChange={v=>u("cardSelectedBorder",v)}/>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Text Colors</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <ColorField label="Heading Color" value={pricing.headingColor} onChange={v=>u("headingColor",v)}/>
                <ColorField label="Price Color" value={pricing.priceColor} onChange={v=>u("priceColor",v)}/>
                <ColorField label="Description Color" value={pricing.descColor} onChange={v=>u("descColor",v)}/>
                <ColorField label="Legal Text Color" value={pricing.legalTextColor} onChange={v=>u("legalTextColor",v)}/>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Button</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={lbl()}>Button Text</label>
                  <input value={pricing.buttonText||"Get My Plan →"} onChange={e=>u("buttonText",e.target.value)} style={inp()}/>
                </div>
                <ColorField label="Button Text Color" value={pricing.buttonColor} onChange={v=>u("buttonColor",v)}/>
                <ColorField label="Button BG From" value={pricing.buttonBgFrom||"#5B4EFF"} onChange={v=>u("buttonBgFrom",v)}/>
                <ColorField label="Button BG To" value={pricing.buttonBgTo||"#8B5CF6"} onChange={v=>u("buttonBgTo",v)}/>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Badges</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <ColorField label="Popular Badge BG" value={pricing.popularBadgeBg} onChange={v=>u("popularBadgeBg",v)}/>
                <ColorField label="Popular Badge Text" value={pricing.popularBadgeColor} onChange={v=>u("popularBadgeColor",v)}/>
                <ColorField label="Discount Badge BG" value={pricing.discountBadgeBg} onChange={v=>u("discountBadgeBg",v)}/>
                <ColorField label="Discount Badge Text" value={pricing.discountBadgeColor} onChange={v=>u("discountBadgeColor",v)}/>
              </div>
            </div>
          </div>
        )}

        {/* Trial Tab */}
        {activeTab === "trial" && (
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>Trial Period Settings</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <Toggle value={pricing.trialEnabled} onChange={v => u("trialEnabled", v)} label="Enable trial period"/>
                <p style={{ fontSize:13, color:"#64748B", margin:0 }}>User pays intro price for first X days, then converts to regular subscription</p>
              </div>
              {pricing.trialEnabled && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, padding:"16px", background:"#F8FAFC", borderRadius:14 }}>
                  <div>
                    <label style={lbl()}>Trial Duration (days)</label>
                    <input type="number" value={pricing.trialDays} onChange={e => u("trialDays", parseInt(e.target.value))} style={inp()}/>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>How long the intro period lasts</p>
                  </div>
                  <div>
                    <label style={lbl()}>Trial Price ({pricing.currencySymbol})</label>
                    <input value={pricing.trialPrice} onChange={e => u("trialPrice", e.target.value)} style={inp()}/>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:"4px 0 0" }}>What user pays for the trial</p>
                  </div>
                </div>
              )}
              <div style={{ padding:"16px", background:"#EEF2FF", borderRadius:14, border:"1.5px solid #C7D2FE" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#4338CA", margin:"0 0 8px" }}>How it works:</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    `1. User signs up → pays ${pricing.currencySymbol}${pricing.trialPrice} for ${pricing.trialDays} days`,
                    `2. After ${pricing.trialDays} days → auto-converts to full subscription`,
                    "3. If user cancels before trial ends → no further charges",
                    "4. User can cancel from profile → Subscription tab",
                  ].map((s,i) => <p key={i} style={{ fontSize:13, color:"#4338CA", margin:0 }}>{s}</p>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Text Tab */}
        {activeTab === "legal" && (
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>Legal / Consent Text</h3>
            <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>Shown below the payment button. Use these variables: {"{introPrice}"}, {"{regularPrice}"}, {"{duration}"}, {"{siteName}"}</p>
            <textarea
              value={pricing.legalText}
              onChange={e => u("legalText", e.target.value)}
              style={{ ...inp(), minHeight:160, resize:"vertical", lineHeight:1.7 }}
            />
            <div style={{ marginTop:16, padding:"16px", background:"#F8FAFC", borderRadius:12, border:"1.5px solid #E2E8F0" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:"0 0 8px" }}>PREVIEW (4-Week Plan)</p>
              <p style={{ fontSize:12, color:"#64748B", lineHeight:1.7, margin:0 }}>
                {pricing.legalText
                  .replace("{introPrice}", `${pricing.currencySymbol}${pricing.plans.find(p=>p.id==="monthly")?.introPrice||"19.99"}`)
                  .replace("{regularPrice}", `${pricing.currencySymbol}${pricing.plans.find(p=>p.id==="monthly")?.regularPrice||"39.99"}`)
                  .replace(/{duration}/g, "4-week")
                  .replace("{siteName}", "1Course")
                }
              </p>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>Payment Page Preview</h3>
            <div style={{ maxWidth:480, margin:"0 auto" }}>
              {/* Type toggle */}
              <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, marginBottom:20 }}>
                <div style={{ flex:1, padding:"10px", borderRadius:9, background:"#fff", textAlign:"center", fontWeight:700, fontSize:13 }}>One-time</div>
                <div style={{ flex:1, padding:"10px", borderRadius:9, textAlign:"center", fontWeight:700, fontSize:13, color:"#94A3B8", position:"relative" }}>
                  Auto-renew
                  <span style={{ marginLeft:6, background:"#22c55e", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 6px", borderRadius:999 }}>SAVE {pricing.autoRenewDiscount}%</span>
                </div>
              </div>
              {/* Plans */}
              {pricing.plans.filter(p=>p.active).map(plan => (
                <div key={plan.id} style={{ padding:"18px 20px", borderRadius:16, border:`2px solid ${plan.popular?"#5B4EFF":"rgba(255,255,255,0.15)"}`, background:plan.popular?"rgba(91,78,255,0.1)":"rgba(255,255,255,0.05)", marginBottom:10, position:"relative" }}>
                  {plan.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 12px", borderRadius:999 }}>MOST POPULAR</div>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:15, fontWeight:800, color:"#fff", margin:"0 0 3px" }}>{plan.name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>{plan.description}</p>
                    </div>
                    <p style={{ fontSize:24, fontWeight:900, color:"#fff", margin:0 }}>{pricing.currencySymbol}{plan.introPrice}</p>
                  </div>
                </div>
              ))}
              {/* Legal */}
              <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, marginTop:16, textAlign:"center" }}>
                {pricing.legalText
                  .replace("{introPrice}", `${pricing.currencySymbol}${pricing.plans.find(p=>p.popular)?.introPrice||"19.99"}`)
                  .replace("{regularPrice}", `${pricing.currencySymbol}${pricing.plans.find(p=>p.popular)?.regularPrice||"39.99"}`)
                  .replace(/{duration}/g, "4-week")
                  .replace("{siteName}", "1Course")
                  .slice(0, 200)}...
              </p>
            </div>
          </div>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label style={lbl()}>{label}</label>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <input type="color" value={(value||"#000000").startsWith("#")?(value||"#000000"):"#000000"} onChange={e=>onChange(e.target.value)} style={{ width:36, height:36, borderRadius:8, border:"1.5px solid #E2E8F0", cursor:"pointer", padding:2 }}/>
        <input value={value||""} onChange={e=>onChange(e.target.value)} style={{ ...inp(), fontSize:12 }}/>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <button onClick={() => onChange(!value)}
        style={{ width:40, height:22, borderRadius:999, border:"none", background:value?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?21:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
      </button>
      {label && <span style={{ fontSize:12, color:value?"#22c55e":"#94A3B8", fontWeight:600 }}>{label}</span>}
    </div>
  );
}

const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
