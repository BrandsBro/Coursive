content = open('components/quiz/PaymentModal.jsx', encoding='utf-8').read()

# Fix planInfo and displayPrice to use dynamicPlans
content = content.replace(
    '  const activePlanInfo = (dynamicPlans && dynamicPlans[plan]) || PLANS[plan] || PLANS["4-Week Plan"];\n  const planInfo = activePlanInfo;\n  const displayPrice = isRenewal ? (dynamicPlans?.[plan]?.price || planInfo.price) : planInfo.price;',
    '  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];\n  const displayPrice = planInfo.price;'
)

# Fix the display to use dynamicPlans when available
content = content.replace(
    '  const activePlans = dynamicPlans || PLANS;\n  const design = pricingSettings || {};',
    '''  const activePlans = dynamicPlans || PLANS;
  const design = pricingSettings || {};
  const activePlanInfo = (dynamicPlans && dynamicPlans[plan]) || PLANS[plan] || PLANS["4-Week Plan"];
  const activeDisplayPrice = activePlanInfo.price;'''
)

# Replace all displayPrice with activeDisplayPrice in JSX
content = content.replace('>{displayPrice}</span>', '>{activeDisplayPrice}</span>')
content = content.replace('`🔒 Confirm Payment ${displayPrice}`', '`🔒 Confirm Payment ${activeDisplayPrice}`')

open('components/quiz/PaymentModal.jsx', 'w', encoding='utf-8').write(content)
print("Done!")