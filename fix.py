content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

# Remove AdminLayout import and wrapper
content = content.replace(
    'import AdminLayout from "@/components/admin/AdminLayout";\n',
    ''
)
content = content.replace(
    '    <AdminLayout>\n      <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 64px)", overflow:"hidden" }}>',
    '    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>'
)
content = content.replace(
    '      </div>\n    </AdminLayout>',
    '    </div>'
)

# Fix loading and not found states too
content = content.replace(
    'if (loading) return <AdminLayout><div style={{ padding:80, textAlign:"center" }}><Loader size={32} color="#94A3B8"/></div></AdminLayout>;',
    'if (loading) return <div style={{ padding:80, textAlign:"center" }}><Loader size={32} color="#94A3B8"/></div>;'
)
content = content.replace(
    'if (!template) return <AdminLayout><div style={{ padding:80, textAlign:"center", color:"#94A3B8" }}>Template not found</div></AdminLayout>;',
    'if (!template) return <div style={{ padding:80, textAlign:"center", color:"#94A3B8" }}>Template not found</div>;'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")