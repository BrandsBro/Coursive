content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

old = '''    case "text": return (<div style={col()}><div><p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· paste formatted text, bold, line breaks all work</span></p><div contentEditable suppressContentEditableWarning onInput={(e)=>onChange("html",e.currentTarget.innerHTML)} onPaste={(e)=>{e.preventDefault();const html=e.clipboardData.getData("text/html");const text=e.clipboardData.getData("text/plain");if(html)document.execCommand("insertHTML",false,html);else document.execCommand("insertHTML",false,text.replace(/\\n/g,"<br/>"));}} dangerouslySetInnerHTML={{__html:b.html||b.text?.replace(/\\n/g,"<br/>")||""}} style={{...inp(),minHeight:140,resize:"vertical",cursor:"text",lineHeight:1.7,whiteSpace:"pre-wrap"}}/><div style={{display:"flex",gap:4,marginTop:6}}>{[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,label])=>(<button key={cmd} onMouseDown={(e)=>{e.preventDefault();document.execCommand(cmd,false,null);}} style={{padding:"3px 10px",borderRadius:6,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,cursor:"pointer",fontWeight:cmd==="bold"?900:400,fontStyle:cmd==="italic"?"italic":"normal",textDecoration:cmd==="underline"?"underline":"none"}}>{label}</button>))}</div></div><CF label="Color" value={b.color||"rgba(255,255,255,0.7)"} onChange={(v)=>onChange("color",v)}/><SF label="Font Size" value={b.size||15} onChange={(v)=>onChange("size",v)}/><AF label="Align" value={b.align||"left"} onChange={(v)=>onChange("align",v)}/><div><p style={lbl()}>Line Height: {b.lineHeight||1.8}</p><input type="range" min={1} max={2.5} step={0.1} value={b.lineHeight||1.8} onChange={(e)=>onChange("lineHeight",parseFloat(e.target.value))} style={{width:"100%"}}/></div></div>);'''

new = '''    case "text": return <TextBlockEditor b={b} onChange={onChange}/>;'''

content = content.replace(old, new)

# Add TextBlockEditor component before BlockControls
old2 = '''function BlockControls({ block: b, onChange, uploadImg, uploading }) {'''

new2 = '''function TextBlockEditor({ b, onChange }) {
  const editorRef = React.useRef(null);
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = b.html || b.text?.replace(/\\n/g,"<br/>") || "";
      isInitialized.current = true;
    }
  }, []);

  const execCmd = (cmd) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    onChange("html", editorRef.current.innerHTML);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <p style={lbl()}>Text <span style={{color:"#94A3B8",fontWeight:400}}>· paste formatted text, bold, line breaks work</span></p>
        <div style={{display:"flex",gap:4,marginBottom:6}}>
          {[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,label])=>(
            <button key={cmd} onMouseDown={(e)=>{e.preventDefault();execCmd(cmd);}} style={{padding:"3px 10px",borderRadius:6,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,cursor:"pointer",fontWeight:cmd==="bold"?900:400,fontStyle:cmd==="italic"?"italic":"normal",textDecoration:cmd==="underline"?"underline":"none"}}>{label}</button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange("html", e.currentTarget.innerHTML)}
          onPaste={(e) => {
            e.preventDefault();
            const html = e.clipboardData.getData("text/html");
            const text = e.clipboardData.getData("text/plain");
            if (html) document.execCommand("insertHTML", false, html);
            else document.execCommand("insertHTML", false, text.replace(/\\n/g,"<br/>"));
            onChange("html", e.currentTarget.innerHTML);
          }}
          style={{...inp(),minHeight:140,cursor:"text",lineHeight:1.7,whiteSpace:"pre-wrap",outline:"2px solid #5B4EFF"}}
        />
      </div>
      <CF label="Color" value={b.color||"rgba(255,255,255,0.7)"} onChange={(v)=>onChange("color",v)}/>
      <SF label="Font Size" value={b.size||15} onChange={(v)=>onChange("size",v)}/>
      <AF label="Align" value={b.align||"left"} onChange={(v)=>onChange("align",v)}/>
      <div>
        <p style={lbl()}>Line Height: {b.lineHeight||1.8}</p>
        <input type="range" min={1} max={2.5} step={0.1} value={b.lineHeight||1.8} onChange={(e)=>onChange("lineHeight",parseFloat(e.target.value))} style={{width:"100%"}}/>
      </div>
    </div>
  );
}

function BlockControls({ block: b, onChange, uploadImg, uploading }) {'''

content = content.replace(old2, new2)

# Add React import
content = content.replace(
    'import { useEffect, useState } from "react";',
    'import React, { useEffect, useRef, useState } from "react";'
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")