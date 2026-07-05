content = open('app/(auth)/expired/page.jsx', encoding='utf-8').read()

content = content.replace(
    '''            <button onClick={handleSignOut} style={{ padding:"12px", borderRadius:14, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Sign Out
            </button>''',
    ''
)

open('app/(auth)/expired/page.jsx', 'w', encoding='utf-8').write(content)
print("Done!")