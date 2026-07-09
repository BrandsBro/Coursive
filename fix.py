# fix.py
content = open('app/api/stripe/create-account/route.js').read()

old_html = """html: `<div style="font-family:sans-serif;padding:24px;max-width:500px;background:#fff">
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
          </div>`,"""

new_html = """html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;padding:0 16px">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#5B4EFF 0%,#8B5CF6 100%);border-radius:20px 20px 0 0;padding:32px 32px 28px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px">New Purchase!</h1>
      <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px">A new user just subscribed to 1Course</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:28px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0">
      
      <!-- Amount highlight -->
      <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1.5px solid #BBF7D0;border-radius:14px;padding:16px 20px;text-align:center;margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:#166534;font-weight:600">AMOUNT PAID</p>
        <p style="margin:4px 0 0;font-size:36px;font-weight:900;color:#15803D">$\${(amount/100).toFixed(2)}</p>
      </div>

      <!-- Details -->
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;width:40%">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Customer</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:14px;font-weight:700;color:#0f172a">\${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Email</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <a href="mailto:\${email}" style="font-size:14px;font-weight:600;color:#5B4EFF;text-decoration:none">\${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Plan</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #F1F5F9">
            <span style="display:inline-block;background:#EEF2FF;color:#5B4EFF;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px">\${plan}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0">
            <span style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.5px">Type</span>
          </td>
          <td style="padding:12px 0">
            <span style="font-size:14px;font-weight:600;color:#374151">\${paymentType}</span>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="margin-top:24px;text-align:center">
        <a href="https://1course.io/admin/users" style="display:inline-block;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">
          View in Admin Panel →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 20px 20px;padding:16px 32px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94A3B8">1Course Admin Notification • <a href="https://1course.io" style="color:#5B4EFF;text-decoration:none">1course.io</a></p>
    </div>

  </div>
</body>
</html>`,"""

if old_html in content:
    content = content.replace(old_html, new_html)
    open('app/api/stripe/create-account/route.js', 'w').write(content)
    print("Done!")
else:
    print("FAILED - template not found")