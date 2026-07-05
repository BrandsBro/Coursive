content = open('components/profile/ProfilePage.jsx', encoding='utf-8').read()

# Add PaymentModal import
content = content.replace(
    'import CertificateGenerator from "@/components/courses/CertificateGenerator";',
    'import CertificateGenerator from "@/components/courses/CertificateGenerator";\nimport PaymentModal from "@/components/quiz/PaymentModal";'
)

# Add showRenew state
content = content.replace(
    '  const [certCourse, setCertCourse] = useState(null);',
    '  const [certCourse, setCertCourse] = useState(null);\n  const [showRenew, setShowRenew] = useState(false);'
)

# Replace the quiz link button with renew button
content = content.replace(
    '''                <Link href="/quiz" style={{ textDecoration:"none" }}>
                  <button style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    🚀 {daysLeft > 0 ? "Upgrade / Renew Plan" : "Renew Access"}
                  </button>
                </Link>''',
    '''                <button onClick={() => setShowRenew(true)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🚀 {daysLeft > 0 ? "Renew Subscription" : "Renew Access"}
                </button>'''
)

# Add PaymentModal at the bottom before closing
content = content.replace(
    '      {certCourse && (',
    '''      {showRenew && (
        <PaymentModal
          plan={sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); window.location.reload(); }}
        />
      )}
      {certCourse && ('''
)

open('components/profile/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print("Done!")