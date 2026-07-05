content = open('components/admin/PricingManager.jsx', encoding='utf-8').read()

old = '''                  <p style={{ fontSize:11, color:"#64748B", lineHeight:1.7, margin:0 }}>
                    {(plan.legalText||"")
                      .replace(/{salePrice}/g, pricing.currencySymbol + plan.salePrice)
                      .replace(/{regularPrice}/g, pricing.currencySymbol + (plan.regularPrice||""))
                      .replace(/{4weekRegularPrice}/g, pricing.currencySymbol + (pricing.plans.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
                      .replace(/{12weekRegularPrice}/g, pricing.currencySymbol + (pricing.plans.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
                      .replace(/{name}/g, plan.name)
                      .replace(/{duration}/g, String(plan.duration))
                    }
                  </p>'''

new = '''                  <p style={{ fontSize:11, color:"#64748B", lineHeight:1.7, margin:0 }}
                    dangerouslySetInnerHTML={{ __html: (plan.legalText||"")
                      .replace(/{salePrice}/g, "<strong>" + pricing.currencySymbol + plan.salePrice + "</strong>")
                      .replace(/{regularPrice}/g, "<strong>" + pricing.currencySymbol + (plan.regularPrice||"") + "</strong>")
                      .replace(/{4weekRegularPrice}/g, "<strong>" + pricing.currencySymbol + (pricing.plans.find(p=>p.id==="monthly")?.regularPrice||"39.99") + "</strong>")
                      .replace(/{12weekRegularPrice}/g, "<strong>" + pricing.currencySymbol + (pricing.plans.find(p=>p.id==="quarterly")?.regularPrice||"69.99") + "</strong>")
                      .replace(/{name}/g, plan.name)
                      .replace(/{duration}/g, String(plan.duration))
                      .replace(/1course\.io\/profile/g, "<a href='https://1course.io/profile' style='color:#5B4EFF;font-weight:700'>my profile</a>")
                    }}
                  />'''

if old in content:
    content = content.replace(old, new)
    print("Replaced!")
else:
    print("NOT FOUND - checking...")
    idx = content.find("plan.legalText||")
    print(repr(content[idx-50:idx+200]))

open('components/admin/PricingManager.jsx', 'w', encoding='utf-8').write(content)