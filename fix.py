content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

old = '''  const replace = (text) => (text || "")
    .replace(/\\{name\\}/g, name)
    .replace(/\\{email\\}/g, email)
    .replace(/\\{Renewal Date\\}/g, "August 2, 2026")
    .replace(/\\{Plan Name\\}/g, "4-Week Plan")
    .replace(/\\{Amount\\}/g, "$19.99")
    .replace(/\\{Plan\\}/g, "4-Week Plan");'''

new = '''  const replace = (text) => (text || "")
    .replace(/\\{name\\}/g, name).replace(/&#123;name&#125;/g, name)
    .replace(/\\{email\\}/g, email).replace(/&#123;email&#125;/g, email)
    .replace(/\\{Renewal Date\\}/g, "August 2, 2026").replace(/&#123;Renewal Date&#125;/g, "August 2, 2026")
    .replace(/\\{Plan Name\\}/g, "4-Week Plan").replace(/&#123;Plan Name&#125;/g, "4-Week Plan")
    .replace(/\\{Amount\\}/g, "$19.99").replace(/&#123;Amount&#125;/g, "$19.99")
    .replace(/\\{Plan\\}/g, "4-Week Plan").replace(/&#123;Plan&#125;/g, "4-Week Plan");'''

content = content.replace(old, new)
open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")