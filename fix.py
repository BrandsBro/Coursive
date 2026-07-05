content = open('components/quiz/PaymentModal.jsx', encoding='utf-8').read()

# Update function signature
content = content.replace(
    'export default function PaymentModal({ plan, paymentType, email, name, onClose, onSuccess }) {',
    'export default function PaymentModal({ plan, paymentType, email, name, onClose, onSuccess, isRenewal=false }) {'
)

# Update price logic
content = content.replace(
    'price: `${pricingSettings.currencySymbol||"$"}${p.introPrice}`,\n        recurringPrice: `${pricingSettings.currencySymbol||"$"}${(parseFloat(p.introPrice)*(1-(pricingSettings.autoRenewDiscount||15)/100)).toFixed(2)}`,',
    'price: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,\n        recurringPrice: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,'
)

open('components/quiz/PaymentModal.jsx', 'w', encoding='utf-8').write(content)
print("Done!")