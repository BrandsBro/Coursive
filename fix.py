# fix.py
content = open('app/api/stripe/create-account/route.js').read()

# Fix the escaped dollar signs - they should be ${} not ${}
content = content.replace('$\\${(amount/100).toFixed(2)}', '${(amount/100).toFixed(2)}')
content = content.replace('\\${name}', '${name}')
content = content.replace('\\${email}', '${email}')
content = content.replace('\\${plan}', '${plan}')
content = content.replace('\\${paymentType}', '${paymentType}')

open('app/api/stripe/create-account/route.js', 'w').write(content)
print("Done!")