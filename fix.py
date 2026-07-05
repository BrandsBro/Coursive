content = open('app/api/stripe/create-account/route.js', encoding='utf-8').read()

content = content.replace(
    '    // For renewals, extend from current expiry if not expired yet\n    let startFrom = now;',
    '    // For renewals, extend from current expiry if not expired yet\n    let startFrom = now;\n    console.log("isRenewal:", !!existingProfile, "weeks:", weeks, "plan:", plan);'
)

open('app/api/stripe/create-account/route.js', 'w', encoding='utf-8').write(content)
print("Done!")