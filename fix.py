content = open('app/(auth)/expired/page.jsx', encoding='utf-8').read()

# Remove the support email line
content = content.replace(
    '''          <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:20 }}>
            Need help? Contact us at support@kingbrandsbro.pro
          </p>''',
    ''
)

# Replace Link to /renew with button that opens PaymentModal
content = content.replace(
    '"use client";\nimport { useEffect, useState } from "react";\nimport { useRouter } from "next/navigation";\nimport { supabase } from "@/lib/supabase";\nimport Link from "next/link";',
    '"use client";\nimport { useEffect, useState } from "react";\nimport { useRouter } from "next/navigation";\nimport { supabase } from "@/lib/supabase";\nimport PaymentModal from "@/components/quiz/PaymentModal";'
)

# Add showRenew state
content = content.replace(
    '  const [loading, setLoading] = useState(true);',
    '  const [loading, setLoading] = useState(true);\n  const [showRenew, setShowRenew] = useState(false);\n  const [userEmail, setUserEmail] = useState("");\n  const [userName, setUserName] = useState("");'
)

# Get user email and name
content = content.replace(
    '      const { data: { user } } = await supabase.auth.getUser();\n      if (!user) { router.push("/login"); return; }',
    '      const { data: { user } } = await supabase.auth.getUser();\n      if (!user) { router.push("/login"); return; }\n      setUserEmail(user.email || "");\n      setUserName(user.user_metadata?.full_name || "");'
)

# Replace Link with button
content = content.replace(
    '''            <Link href="/renew" style={{ display:"block", padding:"16px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, textDecoration:"none", boxShadow:"0 8px 24px rgba(91,78,255,0.4)" }}>
              🚀 Renew My Access
            </Link>''',
    '''            <button onClick={() => setShowRenew(true)} style={{ display:"block", width:"100%", padding:"16px", borderRadius:14, background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:16, fontWeight:800, border:"none", cursor:"pointer", boxShadow:"0 8px 24px rgba(91,78,255,0.4)" }}>
              🚀 Renew My Access
            </button>'''
)

# Add PaymentModal before closing div
content = content.replace(
    '    </div>\n  );\n}',
    '''      {showRenew && (
        <PaymentModal
          plan={sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={userEmail}
          name={userName}
          isRenewal={true}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); router.push("/home"); }}
        />
      )}
    </div>
  );
}'''
)

open('app/(auth)/expired/page.jsx', 'w', encoding='utf-8').write(content)
print("Done!")