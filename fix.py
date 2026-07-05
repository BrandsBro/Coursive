content = open('components/profile/ProfilePage.jsx', encoding='utf-8').read()

content = content.replace(
    '''      {showRenew && (
        <PaymentModal
          plan={sub?.plan || "4-Week Plan"}
          paymentType="one_time"
          email={email}
          name={displayName}
          onClose={() => setShowRenew(false)}
          onSuccess={() => { setShowRenew(false); window.location.reload(); }}
        />
      )}''',
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
      )}'''
)

open('components/profile/ProfilePage.jsx', 'w', encoding='utf-8').write(content)
print("Done!" if "isRenewal={true}" in open('components/profile/ProfilePage.jsx', encoding='utf-8').read() else "FAILED - PaymentModal not found")