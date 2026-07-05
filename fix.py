content = open('components/quiz/QuizFlow.jsx', encoding='utf-8').read()

old = '''  if (step === "sales") {
    const plans = [
      { name:"1-Week Plan",  price:"6.93",  recurringPrice:"5.99",  weeks:1 },
      { name:"4-Week Plan",  price:"19.99", recurringPrice:"16.99", weeks:4,  popular:true },
      { name:"12-Week Plan", price:"39.99", recurringPrice:"32.99", weeks:12 },
    ];
    return (
      <>
        <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 24px" }}>Become the Master of A.I.</p>

          {/* One-time vs Auto-renew toggle */}
          <div style={{ display:"flex", background:"#F1F5F9", borderRadius:14, padding:4, marginBottom:24, maxWidth:340, margin:"0 auto 24px" }}>
            <button onClick={() => setPaymentType("one_time")}
              style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:paymentType==="one_time"?"#fff":"transparent", fontWeight:700, fontSize:13, color:paymentType==="one_time"?"#0f172a":"#94A3B8", cursor:"pointer", boxShadow:paymentType==="one_time"?"0 2px 8px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>
              One-time
            </button>
            <button onClick={() => setPaymentType("recurring")}
              style={{ flex:1, padding:"10px", borderRadius:10, border:"none", background:paymentType==="recurring"?"#fff":"transparent", fontWeight:700, fontSize:13, color:paymentType==="recurring"?"#0f172a":"#94A3B8", cursor:"pointer", boxShadow:paymentType==="recurring"?"0 2px 8px rgba(0,0,0,0.08)":"none", transition:"all 0.15s", position:"relative" }}>
              Auto-renew
              <span style={{ marginLeft:6, background:"#22c55e", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:999 }}>SAVE 15%</span>
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {plans.map((plan) => {
              const price = paymentType==="recurring" ? plan.recurringPrice : plan.price;
              return (
                <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                  style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                  {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ textAlign:"left" }}>
                      <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                      {paymentType==="recurring" && <p style={{ fontSize:11, color:"#22c55e", fontWeight:700, margin:"2px 0 0" }}>🔄 Auto-renews every {plan.weeks} week{plan.weeks>1?"s":""}</p>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${price}</span>
                      {paymentType==="recurring" && <p style={{ fontSize:10, color:"#94A3B8", margin:"2px 0 0" }}>was ${plan.price}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {paymentType==="recurring" && (
            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"10px 16px", marginBottom:16, fontSize:12, color:"#166534", fontWeight:600 }}>
              ✅ Cancel anytime from your profile settings
            </div>
          )}

          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          <button onClick={handleGetPlan} style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
            GET MY PLAN →
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>'''

new = '''  if (step === "sales") {
    const plans = [
      { name:"1-Week Plan",  price:"6.93",  originalPrice:"13.86", weeks:1 },
      { name:"4-Week Plan",  price:"19.99", originalPrice:"39.99", weeks:4, popular:true },
      { name:"12-Week Plan", price:"39.99", originalPrice:"79.99", weeks:12 },
    ];
    return (
      <>
        <div style={{ width:"100%", textAlign:"center", paddingBottom:40 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Your Personalized A.I. Certificate Program is Ready!</h1>
          <p style={{ fontSize:14, color:"#5B4EFF", fontWeight:700, margin:"0 0 24px" }}>Become the Master of A.I.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {plans.map((plan) => (
              <div key={plan.name} onClick={() => setSelectedPlan(plan.name)}
                style={{ padding:"20px 24px", borderRadius:16, border:`2px solid ${selectedPlan===plan.name?"#5B4EFF":"#E2E8F0"}`, background:selectedPlan===plan.name?"#EEF2FF":"#fff", cursor:"pointer", position:"relative", transition:"all 0.15s" }}>
                {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#5B4EFF", color:"#fff", fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:999, whiteSpace:"nowrap" }}>👍 MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>{plan.name}</span>
                      <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>50% OFF</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                      <span style={{ fontSize:14, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>
                      <span style={{ fontSize:24, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          <button onClick={handleGetPlan} style={{ width:"100%", padding:"18px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)", marginBottom:12 }}>
            GET MY PLAN →
          </button>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>'''

content = content.replace(old, new)
open('components/quiz/QuizFlow.jsx', 'w', encoding='utf-8').write(content)
print("Done!")