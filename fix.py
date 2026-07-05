content = open('components/quiz/QuizFlow.jsx', encoding='utf-8').read()

old = '''          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
          <button onClick={handleGetPlan}'''

new = '''          <p style={{ fontSize:13, color:"#64748B", margin:"0 0 20px" }}>People using plan for 3 months achieve twice as many results as for 1 month</p>
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
              <p style={{ fontSize:11, color:"#94A3B8", lineHeight:1.7, margin:"0 0 16px", textAlign:"center" }}
                dangerouslySetInnerHTML={{ __html: legalHtml }}
              />
            );
          })()}
          <button onClick={handleGetPlan}'''

content = content.replace(old, new)

# Remove the old legal text that was after the button
content = content.replace(
    '''          {/* Legal text for selected plan */}
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
        {showPayment && (''',
    '''        </div>
        {showPayment && ('''
)

open('components/quiz/QuizFlow.jsx', 'w', encoding='utf-8').write(content)
print("Done!")