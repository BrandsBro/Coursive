content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

content = content.replace(
    'case "heading": return (<div style={col()}><div><p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· {"{name}"} = user name</span></p><textarea value={b.text||""} onChange={(e)=>onChange("text",e.target.value)} rows={3} style={{...inp(),resize:"vertical"}}/>',
    'case "heading": return (<div style={col()}><div><p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· {"{name}"} = user name</span></p><textarea value={b.text||""} onChange={(e)=>onChange("text",e.target.value)} rows={5} style={{...inp(),resize:"vertical",minHeight:100}}/>'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")