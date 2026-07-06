content = open('components/profile/ProfilePage.jsx', encoding='utf-8').read()

# Add cancel state
content = content.replace(
    '  const [renewPlan, setRenewPlan] = useState(null);',
    '  const [renewPlan, setRenewPlan] = useState(null);\n  const [cancelling, setCancelling] = useState(false);\n  const [cancelled, setCancelled] = useState(false);'
)

# Add cancel function
content = content.replace(
    '  const signOut = async () => {',
    '''  const cancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel? You will keep access until your plan expires.")) return;
    setCancelling(true);
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", sub.id);
    setCancelled(true);
    setSub(prev => ({ ...prev, status: "cancelled" }));
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Your 1Course subscription has been cancelled",
        html: "<div style='font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;padding:32px'><h2 style='color:#5B4EFF'>Subscription Cancelled</h2><p style='color:rgba(255,255,255,0.7)'>Hi " + displayName + ",</p><p style='color:rgba(255,255,255,0.7)'>Your subscription has been cancelled. You will keep access until " + new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) + ".</p><p style='color:rgba(255,255,255,0.7)'>We hope to see you again. You can always renew at 1course.io/profile.</p><p style='color:rgba(255,255,255,0.5)'>The 1Course Team</p></div>"
      })
    });
    setCancelling(false);
  };

  const signOut = async () => {'''
)

# Add cancel button
content = content.replace(
    '                {/* Upgrade options */}\n                {daysLeft > 0 && sub?.plan === "1-Week Plan"',
    '''                {/* Cancel button */}
                {daysLeft > 0 && sub?.status !== "cancelled" && (
                  <button onClick={cancelSubscription} disabled={cancelling}
                    style={{ width:"100%", padding:"10px", borderRadius:12, border:"1.5px solid #FECACA", background:"#FEF2F2", color:"#dc2626", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
                {sub?.status === "cancelled" && daysLeft > 0 && (
                  <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12, padding:"10px 16px", marginTop:4 }}>
                    <p style={{ fontSize:13, color:"#dc2626", fontWeight:600, margin:0 }}>❌ Cancelled — Access until {new Date(sub.expires_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
                  </div>
                )}
                {/* Upgrade options */}
                {daysLeft > 0 && sub?.plan === "1-Week Plan"'''
)

open('components/profile/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print("Done!")
