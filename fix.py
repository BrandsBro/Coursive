content = open('components/quiz/PaymentModal.jsx', encoding='utf-8').read()

content = content.replace(
    '''        price: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.introPrice}`,
        recurringPrice: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${(parseFloat(p.introPrice)*(1-(pricingSettings.autoRenewDiscount||15)/100)).toFixed(2)}`,''',
    '''        price: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,
        recurringPrice: isRenewal ? `${pricingSettings.currencySymbol||"$"}${p.regularPrice||p.originalPrice||p.introPrice}` : `${pricingSettings.currencySymbol||"$"}${p.salePrice||p.introPrice}`,'''
)

open('components/quiz/PaymentModal.jsx', 'w', encoding='utf-8').write(content)
print("Done!")