content = open('components/admin/AdminQuizBuilder.jsx', encoding='utf-8').read()

# Update sales editor
old = '''  if (type === "sales") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Your Personalized A.I. Certificate Program is Ready!" style={inp()}/></Field>
        <Field label="Plans (name|price, one per line)">
          <textarea value={(content.plans||[]).join("\\n")} onChange={e=>u("plans",e.target.value.split("\\n"))} placeholder={"1-Week Plan|6.93\\n4-Week Plan|19.99\\n12-Week Plan|39.99"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
      </div>
    );
  }'''

new = '''  if (type === "sales") {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Field label="Heading"><input value={content.heading||""} onChange={e=>u("heading",e.target.value)} placeholder="Your Personalized A.I. Certificate Program is Ready!" style={inp()}/></Field>
        <Field label="Plans (name|price|originalPrice, one per line)" hint="originalPrice shown crossed out">
          <textarea value={(content.plans||[]).join("\\n")} onChange={e=>u("plans",e.target.value.split("\\n"))} placeholder={"1-Week Plan|6.93|13.86\\n4-Week Plan|19.99|39.99\\n12-Week Plan|39.99|79.99"} style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
        </Field>
        <Field label="Legal Text" hint="shown below button — use {price}, {plan}">
          <textarea value={content.legalText||""} onChange={e=>u("legalText",e.target.value)} placeholder="By clicking Get My Plan, I agree to pay {price} for my {plan}..." style={{ ...inp(), minHeight:100, resize:"vertical" }}/>
        </Field>
      </div>
    );
  }'''

content = content.replace(old, new)

# Update sales preview
old2 = '''      case "sales": {
        const plans = (c.plans||[]).filter(Boolean).map(p => { const parts = p.split("|"); return { name:parts[0], price:parts[1] }; });
        return (
          <div>
            <h3 style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>{c.heading||"Sales Page"}</h3>
            {plans.map((plan,i) => (
              <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${i===1?"#5B4EFF":"#E2E8F0"}`, background:i===1?"#EEF2FF":"#F8FAFC", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{plan.name}</span>
                <span style={{ fontSize:13, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
              </div>
            ))}
            <div style={{ padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", textAlign:"center", marginTop:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>GET MY PLAN →</span>
            </div>
          </div>
        );
      }'''

new2 = '''      case "sales": {
        const plans = (c.plans||[]).filter(Boolean).map(p => { const parts = p.split("|"); return { name:parts[0], price:parts[1], originalPrice:parts[2] }; });
        return (
          <div>
            <h3 style={{ fontSize:13, fontWeight:800, color:"#0f172a", margin:"0 0 10px" }}>{c.heading||"Sales Page"}</h3>
            {plans.map((plan,i) => (
              <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${i===1?"#5B4EFF":"#E2E8F0"}`, background:i===1?"#EEF2FF":"#F8FAFC", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{plan.name}</span>
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:999 }}>50% OFF</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {plan.originalPrice && <span style={{ fontSize:11, color:"#94A3B8", textDecoration:"line-through" }}>${plan.originalPrice}</span>}
                  <span style={{ fontSize:13, fontWeight:900, color:"#5B4EFF" }}>${plan.price}</span>
                </div>
              </div>
            ))}
            <div style={{ padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", textAlign:"center", marginTop:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>GET MY PLAN →</span>
            </div>
          </div>
        );
      }'''

content = content.replace(old2, new2)

# Update default
content = content.replace(
    'case "sales":           return { heading:"Your Personalized A.I. Certificate Program is Ready!", plans:["1-Week Plan|6.93","4-Week Plan|19.99","12-Week Plan|39.99"] };',
    'case "sales":           return { heading:"Your Personalized A.I. Certificate Program is Ready!", plans:["1-Week Plan|6.93|13.86","4-Week Plan|19.99|39.99","12-Week Plan|39.99|79.99"], legalText:"By clicking Get My Plan, I agree to pay {price} for my {plan}. This plan will automatically renew every 4 weeks at the regular price until cancelled. Cancel anytime at 1course.io/profile." };'
)

open('components/admin/AdminQuizBuilder.jsx', 'w', encoding='utf-8').write(content)
print("Done!")