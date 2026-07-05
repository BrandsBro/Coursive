content = open('components/admin/EmailTemplateEditor.jsx', encoding='utf-8').read()

# Fix - add after the Global Card BG (line 726 area)
content = content.replace(
    '''                <CF label="Card BG" value={template.cardBg||"#0a081e"} onChange={v=>u("cardBg",v)}/>
              </div>
            </div>
          </div>''',
    '''                <CF label="Card BG" value={template.cardBg||"#0a081e"} onChange={v=>u("cardBg",v)}/>
                <CF label="Card Border Color" value={template.cardBorder||"transparent"} onChange={v=>u("cardBorder",v)}/>
                <SF label="Border Width" value={template.cardBorderWidth||0} onChange={v=>u("cardBorderWidth",v)}/>
                <SF label="Border Radius" value={template.cardRadius||20} onChange={v=>u("cardRadius",v)}/>
              </div>
            </div>
          </div>'''
)

open('components/admin/EmailTemplateEditor.jsx', 'w', encoding='utf-8').write(content)
print("Done!")