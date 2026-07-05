content = open('components/quiz/PaymentModal.jsx', encoding='utf-8').read()

content = content.replace(
    '{activeDisplayPrice}',
    '{displayPrice}'
)

open('components/quiz/PaymentModal.jsx', 'w', encoding='utf-8').write(content)
print("Done!")