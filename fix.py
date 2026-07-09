# fix2.py
content = open('app/api/stripe/create-account/route.js').read()

admin_notify = """
    // Send admin notifications
    try {
      const { data: notifSettings } = await supabase
        .from("settings").select("value").eq("key","admin_notifications").single();
      const adminEmails = notifSettings?.value?.emails || [];
      if (adminEmails.length > 0) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "1Course <noreply@1course.io>",
          to: adminEmails,
          subject: `New Purchase: ${plan} - ${name}`,
          html: `<div style="font-family:sans-serif;padding:24px;max-width:500px;background:#fff">
            <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:20px;border-radius:12px;margin-bottom:20px">
              <h2 style="color:#fff;margin:0;font-size:20px">🎉 New Purchase!</h2>
            </div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#64748B;font-size:13px">Name</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${name}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#64748B;font-size:13px">Email</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${email}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#64748B;font-size:13px">Plan</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${plan}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#64748B;font-size:13px">Amount</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;color:#22c55e;font-size:13px">$${(amount/100).toFixed(2)}</td></tr>
              <tr><td style="padding:10px;color:#64748B;font-size:13px">Type</td><td style="padding:10px;font-weight:700;font-size:13px">${paymentType}</td></tr>
            </table>
            <p style="color:#94A3B8;font-size:11px;margin-top:20px;text-align:center">1Course Admin Notification</p>
          </div>`,
        });
      }
    } catch(e) { console.error("Admin notify error:", e); }
"""

content = content.replace(
    '    const isExistingUser = !!existingProfile;',
    admin_notify + '\n    const isExistingUser = !!existingProfile;'
)

open('app/api/stripe/create-account/route.js', 'w').write(content)
print("Done!")