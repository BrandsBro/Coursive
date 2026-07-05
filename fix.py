content = open('components/admin/PricingManager.jsx', encoding='utf-8').read()

content = content.replace(
    '.replace(/1course\\.io\\/profile/g, "<a href=\\"https://1course.io/profile\\" style=\\"color:#5B4EFF;font-weight:700\\">1course.io/profile</a>")',
    '.replace(/1course\\.io\\/profile/g, "<a href=\\"https://1course.io/profile\\" style=\\"color:#5B4EFF;font-weight:700\\">my profile</a>")'
)

open('components/admin/PricingManager.jsx', 'w', encoding='utf-8').write(content)
print("Done!")