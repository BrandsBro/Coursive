content = open('components/quiz/QuizFlow.jsx', encoding='utf-8').read()

# Load pricing from supabase in EndBlock
old = '''  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("one_time");
  const [timeLeft, setTimeLeft] = useState(10 * 60);'''

new = '''  const [selectedPlan, setSelectedPlan] = useState("4-Week Plan");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("one_time");
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    if (step === "sales") {
      supabase.from("settings").select("value").eq("key","pricing").single().then(({ data }) => {
        if (data?.value) setPricingData(data.value);
      });
    }
  }, [step]);'''

content = content.replace(old, new)

# Add legal text below GET MY PLAN button
old2 = '''          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
        </div>
        {showPayment && ('''

new2 = '''          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:12 }}>
            <span style={{ fontSize:12, color:"#64748B" }}>⏱ {mins}:{secs} left</span>
            <span style={{ fontSize:12, color:"#64748B" }}>🔒 Secure checkout</span>
          </div>
          {/* Legal text for selected plan */}
          {pricingData && (() => {
            const planData = pricingData.plans?.find(p => p.name === selectedPlan);
            if (!planData?.legalText) return null;
            const legalHtml = planData.legalText
              .replace(/{salePrice}/g, "$" + planData.salePrice)
              .replace(/{regularPrice}/g, "$" + (planData.regularPrice||""))
              .replace(/{4weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
              .replace(/{12weekRegularPrice}/g, "$" + (pricingData.plans?.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
              .replace(/{name}/g, planData.name)
              .replace(/{duration}/g, String(planData.duration))
              .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700;text-decoration:underline'>my profile</a>");
            return (
              <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"16px 0 0", textAlign:"center" }}
                dangerouslySetInnerHTML={{ __html: legalHtml }}
              />
            );
          })()}
        </div>
        {showPayment && ('''

content = content.replace(old2, new2)
open('components/quiz/QuizFlow.jsx', 'w', encoding='utf-8').write(content)
print("Done!")