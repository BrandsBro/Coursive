content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

old = '''      case "text": return `<div style="padding:4px 40px"><div style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.8};text-align:${b.align||"left"};margin:0 0 8px">${b.html ? replace(b.html) : (b.text||"").replace(/\\n/g,"<br/>")}</div></div>`;'''

new = '''      case "text": {
        const rawHtml = b.html || (b.text||"").replace(/\\n/g,"<br/>");
        const replacedHtml = replace(rawHtml);
        return `<div style="padding:4px 40px"><div style="color:${b.color||"rgba(255,255,255,0.7)"};font-size:${b.size||15}px;line-height:${b.lineHeight||1.8};text-align:${b.align||"left"};margin:0 0 8px">${replacedHtml}</div></div>`;
      }'''

content = content.replace(old, new)

# Also make replace handle spaces in variable names
old2 = '''  const replace = (text) => (text || "")
    .replace(/\\{name\\}/g, name).replace(/&#123;name&#125;/g, name)
    .replace(/\\{email\\}/g, email).replace(/&#123;email&#125;/g, email)
    .replace(/\\{Renewal Date\\}/g, "August 2, 2026").replace(/&#123;Renewal Date&#125;/g, "August 2, 2026")
    .replace(/\\{Plan Name\\}/g, "4-Week Plan").replace(/&#123;Plan Name&#125;/g, "4-Week Plan")
    .replace(/\\{Amount\\}/g, "$19.99").replace(/&#123;Amount&#125;/g, "$19.99")
    .replace(/\\{Plan\\}/g, "4-Week Plan").replace(/&#123;Plan&#125;/g, "4-Week Plan");'''

new2 = '''  const replace = (text) => {
    if (!text) return "";
    // Decode HTML entities first
    let t = text.replace(/&#123;/g,"{").replace(/&#125;/g,"}");
    t = t.replace(/\{name\}/g, name);
    t = t.replace(/\{email\}/g, email);
    t = t.replace(/\{Renewal Date\}/g, "August 2, 2026");
    t = t.replace(/\{Plan Name\}/g, "4-Week Plan");
    t = t.replace(/\{Amount\}/g, "$19.99");
    t = t.replace(/\{Plan\}/g, "4-Week Plan");
    return t;
  };'''

content = content.replace(old2, new2)
open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")