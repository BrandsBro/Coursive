# fix.py
content = open('app/api/stripe/create-account/route.js').read()

# Fix amount display in admin email - amount is already in dollars, don't divide by 100
content = content.replace(
    '<p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#15803D">${(amount/100).toFixed(2)}</p>',
    '<p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#15803D">$${parseFloat(amount).toFixed(2)}</p>'
)

# Also fix Meta CAPI - amount is in dollars not cents
content = content.replace(
    'body: JSON.stringify({ eventName: "Purchase", email, value: amount / 100, currency: "USD" }),',
    'body: JSON.stringify({ eventName: "Purchase", email, value: parseFloat(amount), currency: "USD" }),'
)

open('app/api/stripe/create-account/route.js', 'w').write(content)
print("Done!")