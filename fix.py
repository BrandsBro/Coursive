content = open('components/profile/ProfilePage.jsx', encoding='utf-8').read()

content = content.replace(
    '🚀 {daysLeft > 0 ? "Renew Subscription" : "Renew Access"}',
    '🚀 {daysLeft > 0 ? "Extend Subscription" : "Renew Access"}'
)

open('components/profile/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print("Done!")