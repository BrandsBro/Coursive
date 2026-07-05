content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

content = content.replace(
    '<CF label="Card BG" value={template.cardBg||"#0a081e"} onChange={v=>u("cardBg",v)}/>',
    '<CF label="Card BG" value={template.cardBg||"#0a081e"} onChange={v=>u("cardBg",v)}/>\n                <CF label="Card Border Color" value={template.cardBorder||"transparent"} onChange={v=>u("cardBorder",v)}/>\n                <SF label="Border Width" value={template.cardBorderWidth||0} onChange={v=>u("cardBorderWidth",v)}/>\n                <SF label="Border Radius" value={template.cardRadius||20} onChange={v=>u("cardRadius",v)}/>'
)

content = content.replace(
    'border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)"',
    'border-radius:${template?.cardRadius||20}px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);border:${template?.cardBorderWidth||0}px solid ${template?.cardBorder||"transparent"}"'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")