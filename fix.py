content = open('components/quiz/QuizFlow.jsx', encoding='utf-8').read()
content = content.replace(
    '"🔄 Auto-renew — Cancel anytime"',
    '"One-time payment"'
)
open('components/quiz/QuizFlow.jsx', 'w', encoding='utf-8').write(content)
print("Done!")