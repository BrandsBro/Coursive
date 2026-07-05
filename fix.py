content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

# Make left sidebar wider
content = content.replace(
    'gridTemplateColumns: "200px 1fr 300px"',
    'gridTemplateColumns: "260px 1fr 320px"'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")