content = open('components/admin/PricingManager.jsx', encoding='utf-8').read()

# Find the preview section and fix it
old = '''                  <p style={{ fontSize:11, color:"#64748B", lineHeight:1.7, margin:0 }}>{plan.legalText}</p>'''

new = '''                  <p style={{ fontSize:11, color:"#64748B", lineHeight:1.7, margin:0 }}>
                    {(plan.legalText||"")
                      .replace(/{salePrice}/g, pricing.currencySymbol + plan.salePrice)
                      .replace(/{regularPrice}/g, pricing.currencySymbol + (plan.regularPrice||""))
                      .replace(/{4weekRegularPrice}/g, pricing.currencySymbol + (pricing.plans.find(p=>p.id==="monthly")?.regularPrice||"39.99"))
                      .replace(/{12weekRegularPrice}/g, pricing.currencySymbol + (pricing.plans.find(p=>p.id==="quarterly")?.regularPrice||"69.99"))
                      .replace(/{name}/g, plan.name)
                      .replace(/{duration}/g, String(plan.duration))
                    }
                  </p>'''

content = content.replace(old, new)
print("Replaced:", old in open('components/admin/PricingManager.jsx', encoding='utf-8').read())
open('components/admin/PricingManager.jsx', 'w', encoding='utf-8').write(content)
print("Done!")