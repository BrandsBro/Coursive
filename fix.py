content = open('components/quiz/PaymentModal.jsx', encoding='utf-8').read()

# Update CheckoutForm to accept displayPrice prop
content = content.replace(
    'function CheckoutForm({ plan, paymentType, email, name, onSuccess, onClose }) {',
    'function CheckoutForm({ plan, paymentType, email, name, onSuccess, onClose, displayPrice: propDisplayPrice }) {'
)

# Use prop if provided, fallback to hardcoded
content = content.replace(
    '  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];\n  const displayPrice = paymentType === "recurring" ? planInfo.recurringPrice : planInfo.price;',
    '  const planInfo = PLANS[plan] || PLANS["4-Week Plan"];\n  const displayPrice = propDisplayPrice || planInfo.price;'
)

# Pass displayPrice from PaymentModal to CheckoutForm
content = content.replace(
    '<CheckoutForm plan={plan} paymentType={paymentType} email={email} name={name} onSuccess={onSuccess} onClose={onClose}/>',
    '<CheckoutForm plan={plan} paymentType={paymentType} email={email} name={name} onSuccess={onSuccess} onClose={onClose} displayPrice={activeDisplayPrice}/>'
)

open('components/quiz/PaymentModal.jsx', 'w', encoding='utf-8').write(content)
print("Done!")