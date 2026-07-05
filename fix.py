content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

old = '  const replace = (text) => (text || "").replace(/\\{name\\}/g, name).replace(/\\{email\\}/g, email);'

new = '''  const replace = (text) => (text || "")
    .replace(/\\{name\\}/g, name)
    .replace(/\\{email\\}/g, email)
    .replace(/\\{Renewal Date\\}/g, "August 2, 2026")
    .replace(/\\{Plan Name\\}/g, "4-Week Plan")
    .replace(/\\{Amount\\}/g, "$19.99")
    .replace(/\\{Plan\\}/g, "4-Week Plan");'''

content = content.replace(old, new)
open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")