content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

content = content.replace(
    'value={template.subject || ""} onChange={(e) => u("subject", e.target.value)} placeholder="Subject line..." style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, width: 240, outline: "none", flexShrink: 0 }}',
    'value={template.subject || ""} onChange={(e) => u("subject", e.target.value)} placeholder="Subject line..." style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, width: 380, outline: "none", flexShrink: 0 }}'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")