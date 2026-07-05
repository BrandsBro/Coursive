content = open('components/profile/ProfilePage.jsx', encoding='utf-8').read()

old = '''                <button onClick={() => setShowRenew(true)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🚀 {daysLeft > 0 ? "Extend Subscription" : "Renew Access"}
                </button>'''

new = '''                <button onClick={() => setShowRenew(true)} style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#5B4EFF,#8B5CF6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  🚀 {daysLeft > 0 ? "Extend Subscription" : "Renew Access"}
                </button>
                {/* Upgrade options */}
                {daysLeft > 0 && sub?.plan === "1-Week Plan" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>⬆ Upgrade your plan:</p>
                    {["4-Week Plan","12-Week Plan"].map(upgradePlan => (
                      <button key={upgradePlan} onClick={() => { setRenewPlan(upgradePlan); setShowRenew(true); }}
                        style={{ width:"100%", padding:"12px", borderRadius:12, border:"1.5px solid #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        ⬆ Upgrade to {upgradePlan}
                      </button>
                    ))}
                  </div>
                )}
                {daysLeft > 0 && sub?.plan === "4-Week Plan" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                    <p style={{ fontSize:12, color:"#94A3B8", margin:0, fontWeight:600 }}>⬆ Upgrade your plan:</p>
                    <button onClick={() => { setRenewPlan("12-Week Plan"); setShowRenew(true); }}
                      style={{ width:"100%", padding:"12px", borderRadius:12, border:"1.5px solid #C7D2FE", background:"#EEF2FF", color:"#5B4EFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      ⬆ Upgrade to 12-Week Plan
                    </button>
                  </div>
                )}'''

content = content.replace(old, new)

# Add renewPlan state
content = content.replace(
    '  const [showRenew, setShowRenew] = useState(false);',
    '  const [showRenew, setShowRenew] = useState(false);\n  const [renewPlan, setRenewPlan] = useState(null);'
)

# Update PaymentModal to use renewPlan
content = content.replace(
    '''      {showRenew && (
        <PaymentModal
          plan={sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          isRenewal={true}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); window.location.reload(); }}
        />
      )}''',
    '''      {showRenew && (
        <PaymentModal
          plan={renewPlan || sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          isRenewal={!renewPlan}
          onClose={() => { setShowRenew(false); setRenewPlan(null); }}
          onSuccess={() => { setShowRenew(false); setRenewPlan(null); window.location.reload(); }}
        />
      )}'''
)

open('components/profile/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print("Done!")