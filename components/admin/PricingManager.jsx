"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Save, Check, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DEFAULT_PRICING = {
  currency: "USD",
  currencySymbol: "$",
  buttonText: "Get My Plan →",
  headingColor: "#ffffff",
  priceColor: "#ffffff",
  descColor: "rgba(255,255,255,0.5)",
  legalTextColor: "rgba(255,255,255,0.4)",
  bgGradientFrom: "#0a081e",
  bgGradientTo: "#1e1b4b",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.12)",
  cardSelectedBg: "rgba(91,78,255,0.2)",
  cardSelectedBorder: "#5B4EFF",
  popularBadgeBg: "#5B4EFF",
  popularBadgeColor: "#ffffff",
  discountBadgeBg: "#ef4444",
  discountBadgeColor: "#ffffff",
  buttonBgFrom: "#5B4EFF",
  buttonBgTo: "#8B5CF6",
  buttonColor: "#ffffff",
  plans: [
    {
      id: "weekly",
      name: "1-Week Plan",
      duration: 7,
      salePrice: "6.93",
      originalPrice: "13.86",
      discountPct: "50",
      active: true,
      popular: false,
      description: "Perfect for a quick start",
      legalText: "By clicking Get My Plan, I agree to pay $6.93 for my 1-Week Plan. This plan will automatically renew as a 4-Week subscription. If I do not cancel before the end of the 1-week period, 1Course will charge my payment method $19.99 every 4 weeks until I cancel. I can cancel anytime at 1course.io/profile.",
    },
    {
      id: "monthly",
      name: "4-Week Plan",
      duration: 28,
      salePrice: "19.99",
      originalPrice: "39.99",
      discountPct: "50",
      active: true,
      popular: true,
      description: "Most popular choice",
      legalText: "By clicking Get My Plan, I agree to pay $19.99 for my 4-Week Plan. This plan will automatically renew every 4 weeks. If I do not cancel before the end of the 4-week period, 1Course will charge my payment method $19.99 every 4 weeks until I cancel. I can cancel anytime at 1course.io/profile.",
    },
    {
      id: "quarterly",
      name: "12-Week Plan",
      duration: 84,
      salePrice: "39.99",
      originalPrice: "79.99",
      discountPct: "50",
      active: true,
      popular: false,
      description: "Best value for serious learners",
      legalText: "By clicking Get My Plan, I agree to pay $39.99 for my 12-Week Plan. This plan will automatically renew every 12 weeks. If I do not cancel before the end of the 12-week period, 1Course will charge my payment method $39.99 every 12 weeks until I cancel. I can cancel anytime at 1course.io/profile.",
    },
  ],
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

  const updatePlan = (id, key, val) => setPricing(prev => ({ ...prev, plans: prev.plans.map(p => p.id === id ? { ...p, [key]: val } : p) }));
  const u = (key, val) => setPricing(prev => ({ ...prev, [key]: val }));

  if (loading) return <AdminLayout><div style={{ padding:60, textAlign:"center" }}><Loader size={28} color="#94A3B8"/></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:960, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Pricing & Payment Flow</h1>
            <p style={{ color:"#64748B", fontSize:14, margin:"4px 0 0" }}>Manage plans, prices, legal text and design</p>
          </div>
          <button onClick={save} disabled={saving} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
            {saving?<><Loader size={14}/> Saving...</>:saved?<><Check size={14}/> Saved!</>:<><Save size={14}/> Save Changes</>}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, gap:2 }}>
          {[["plans","💳 Plans & Prices"],["legal","📋 Legal Text"],["design","🎨 Design"],["preview","👁 Preview"]].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:activeTab===v?"#fff":"transparent", fontWeight:700, fontSize:13, color:activeTab===v?"#0f172a":"#94A3B8", cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#EEF2FF", borderRadius:14, border:"1.5px solid #C7D2FE", padding:"14px 18px" }}>
              <p style={{ fontSize:13, color:"#4338CA", margin:0, fontWeight:600 }}>💡 Sale price is what users pay. Original price is shown crossed out. Discount % badge is shown on the card.</p>
            </div>

            {/* Global */}
            <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Global Settings</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div><label style={lbl()}>Currency</label>
                  <select value={pricing.currency} onChange={e => u("currency", e.target.value)} style={inp()}>
                    {["USD","EUR","GBP","CAD","AUD"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={lbl()}>Currency Symbol</label><input value={pricing.currencySymbol} onChange={e => u("currencySymbol", e.target.value)} style={inp()}/></div>
                <div><label style={lbl()}>Button Text</label><input value={pricing.buttonText||"Get My Plan →"} onChange={e => u("buttonText", e.target.value)} style={inp()}/></div>
              </div>
            </div>

            {/* Each Plan */}
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

                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:16 }}>
                  <div><label style={lbl()}>Plan Name</label><input value={plan.name} onChange={e => updatePlan(plan.id, "name", e.target.value)} style={inp()}/></div>
                  <div><label style={lbl()}>Duration (days)</label><input type="number" value={plan.duration} onChange={e => updatePlan(plan.id, "duration", parseInt(e.target.value))} style={inp()}/></div>
                  <div><label style={lbl()}>Sale Price ({pricing.currencySymbol})</label><input value={plan.salePrice} onChange={e => updatePlan(plan.id, "salePrice", e.target.value)} style={{ ...inp(), fontWeight:700, color:"#5B4EFF" }}/></div>
                  <div><label style={lbl()}>Original Price ({pricing.currencySymbol})</label><input value={plan.originalPrice} onChange={e => updatePlan(plan.id, "originalPrice", e.target.value)} style={inp()}/></div>
                  <div><label style={lbl()}>Discount Badge %</label><input value={plan.discountPct} onChange={e => updatePlan(plan.id, "discountPct", e.target.value)} style={inp()}/></div>
                </div>

                <div><label style={lbl()}>Description</label><input value={plan.description} onChange={e => updatePlan(plan.id, "description", e.target.value)} style={inp()}/></div>

                {/* Price preview */}
                <div style={{ marginTop:16, padding:"12px 16px", borderRadius:12, background:"#F8FAFC", border:"1.5px solid #E2E8F0", display:"flex", gap:24, alignItems:"center" }}>
                  <div>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 2px" }}>Shown to user</p>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:"#94A3B8", textDecoration:"line-through" }}>{pricing.currencySymbol}{plan.originalPrice}</span>
                      <span style={{ fontSize:20, fontWeight:900, color:"#5B4EFF" }}>{pricing.currencySymbol}{plan.salePrice}</span>
                      <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>{plan.discountPct}% OFF</span>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:"#64748B" }}>Duration: <strong>{plan.duration} days</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legal Text Tab */}
        {activeTab === "legal" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#FFFBEB", borderRadius:14, border:"1.5px solid #FDE68A", padding:"14px 18px" }}>
              <p style={{ fontSize:13, color:"#92400e", margin:0, fontWeight:600 }}>⚠️ Each plan has its own legal text shown below the payment button. Be clear and accurate — this is a legal disclosure.</p>
            </div>
            {pricing.plans.map(plan => (
              <div key={plan.id} style={{ background:"#fff", borderRadius:20, border:`1.5px solid ${plan.popular?"#C7D2FE":"#F1F5F9"}`, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  {plan.popular && <span style={{ background:"#5B4EFF", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 10px", borderRadius:999 }}>POPULAR</span>}
                  <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0 }}>{plan.name} — Legal Text</h3>
                </div>
                <textarea
                  value={plan.legalText||""}
                  onChange={e => updatePlan(plan.id, "legalText", e.target.value)}
                  rows={4}
                  style={{ ...inp(), resize:"vertical", lineHeight:1.7 }}
                />
                <div style={{ marginTop:10, padding:"12px 14px", background:"#F8FAFC", borderRadius:10, border:"1px solid #E2E8F0" }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 4px", textTransform:"uppercase" }}>Preview</p>
                  <p style={{ fontSize:11, color:"#64748B", lineHeight:1.7, margin:0 }}
                    dangerouslySetInnerHTML={{ __html: (plan.legalText||"")
                      .replace(/{salePrice}/g, "<strong>" + pricing.currencySymbol + plan.salePrice + "</strong>")
                      .replace(/{regularPrice}/g, "<strong>" + pricing.currencySymbol + (plan.regularPrice||"") + "</strong>")
                      .replace(/{4weekRegularPrice}/g, "<strong>" + pricing.currencySymbol + (pricing.plans.find(p=>p.id==="monthly")?.regularPrice||"39.99") + "</strong>")
                      .replace(/{12weekRegularPrice}/g, "<strong>" + pricing.currencySymbol + (pricing.plans.find(p=>p.id==="quarterly")?.regularPrice||"69.99") + "</strong>")
                      .replace(/{name}/g, plan.name)
                      .replace(/{duration}/g, String(plan.duration))
                      .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700'>my profile</a>")
                    }}
                  />
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
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 16px" }}>Text & Button</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <ColorField label="Heading Color" value={pricing.headingColor} onChange={v=>u("headingColor",v)}/>
                <ColorField label="Price Color" value={pricing.priceColor} onChange={v=>u("priceColor",v)}/>
                <ColorField label="Description Color" value={pricing.descColor} onChange={v=>u("descColor",v)}/>
                <ColorField label="Legal Text Color" value={pricing.legalTextColor} onChange={v=>u("legalTextColor",v)}/>
                <ColorField label="Button BG From" value={pricing.buttonBgFrom||"#5B4EFF"} onChange={v=>u("buttonBgFrom",v)}/>
                <ColorField label="Button BG To" value={pricing.buttonBgTo||"#8B5CF6"} onChange={v=>u("buttonBgTo",v)}/>
                <ColorField label="Button Text Color" value={pricing.buttonColor} onChange={v=>u("buttonColor",v)}/>
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

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>Payment Page Preview</h3>
            <div style={{ maxWidth:480, margin:"0 auto", background:`linear-gradient(135deg,${pricing.bgGradientFrom},${pricing.bgGradientTo})`, borderRadius:20, padding:24 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:pricing.headingColor, textAlign:"center", margin:"0 0 20px" }}>Your A.I. Program is Ready!</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                {pricing.plans.filter(p=>p.active).map(plan => (
                  <div key={plan.id} style={{ padding:"16px 20px", borderRadius:14, border:`2px solid ${plan.popular?"#5B4EFF":pricing.cardBorder}`, background:plan.popular?pricing.cardSelectedBg:pricing.cardBg, position:"relative" }}>
                    {plan.popular && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:pricing.popularBadgeBg, color:pricing.popularBadgeColor, fontSize:10, fontWeight:800, padding:"2px 12px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                          <span style={{ fontSize:14, fontWeight:800, color:pricing.headingColor }}>{plan.name}</span>
                          <span style={{ background:pricing.discountBadgeBg, color:pricing.discountBadgeColor, fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:999 }}>{plan.discountPct}% OFF</span>
                        </div>
                        <span style={{ fontSize:11, color:pricing.descColor }}>{plan.description}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, color:pricing.descColor, textDecoration:"line-through" }}>{pricing.currencySymbol}{plan.originalPrice}</div>
                        <div style={{ fontSize:22, fontWeight:900, color:pricing.priceColor }}>{pricing.currencySymbol}{plan.salePrice}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${pricing.buttonBgFrom||"#5B4EFF"},${pricing.buttonBgTo||"#8B5CF6"})`, color:pricing.buttonColor, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                {pricing.buttonText||"Get My Plan →"}
              </button>
              <p style={{ fontSize:10, color:pricing.legalTextColor, textAlign:"center", marginTop:12, lineHeight:1.6 }}>
                {pricing.plans.find(p=>p.popular)?.legalText?.slice(0,180)}...
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
      <button onClick={() => onChange(!value)} style={{ width:40, height:22, borderRadius:999, border:"none", background:value?"#22c55e":"#E2E8F0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?21:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
      </button>
      {label && <span style={{ fontSize:12, color:value?"#22c55e":"#94A3B8", fontWeight:600 }}>{label}</span>}
    </div>
  );
}

const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const inp = () => ({ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
