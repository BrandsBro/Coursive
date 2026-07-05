content = open('app/(auth)/expired/page.jsx', encoding='utf-8').read()

content = content.replace(
    '''          plan={sub?.plan || "4-Week Plan"}''',
    '''          plan={sub?.plan === "1-Week Plan" ? "4-Week Plan" : (sub?.plan || "4-Week Plan")}'''
)

open('app/(auth)/expired/page.jsx', 'w', encoding='utf-8').write(content)
print("Done!")