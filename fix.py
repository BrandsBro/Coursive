content = open('app/api/stripe/create-account/route.js', encoding='utf-8').read()

old = '''    // Send email - welcome for new users, renewal confirmation for existing
    const isExistingUser = !!existingProfile;
    const emailSubject = isExistingUser ? "🎉 Your 1Course access has been renewed!" : "🎉 Welcome to 1Course! Your login details inside";
    const { error: emailError } = await resend.emails.send({
      from: "noreply@1course.io",
      to: email,
      subject: emailSubject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1>
            <p style="margin:8px 0 0;opacity:0.8">Welcome aboard!</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Congratulations, ${name}! 🎉</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px">Your payment was successful! Use the details below to log in:</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Plan</p>
              <p style="margin:0 0 16px;font-weight:700;font-size:15px;color:#a78bfa">${plan} · ${paymentType === "recurring" ? "Auto-renew" : "One-time"}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Email</p>
              <p style="margin:0 0 16px;font-weight:700;font-size:16px">${email}</p>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px">Temporary Password</p>
              <p style="margin:0;font-weight:900;font-size:22px;color:#fff;letter-spacing:2px;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">${tempPassword}</p>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px">Access expires: ${expiresAt.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login?email=${encodeURIComponent(email)}" style="display:block;text-align:center;padding:16px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px">
              Log In to 1Course →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. All rights reserved.</p>
          </div>
        </div>
      `,
    });'''

new = '''    // Load email template from admin settings
    const isExistingUser = !!existingProfile;
    const triggerKey = isExistingUser ? "auto_renewal" : "after_payment";
    let emailSubject = isExistingUser ? "🎉 Your 1Course access has been renewed!" : "🎉 Welcome to 1Course! Your login details inside";
    let emailHtml = "";

    try {
      const { data: settingsData } = await supabase.from("settings").select("value").eq("key","email_templates").single();
      const templates = settingsData?.value || [];
      const tmpl = templates.find(t => t.trigger === triggerKey && t.active !== false);
      if (tmpl) {
        emailSubject = tmpl.subject || emailSubject;
        // Generate HTML from blocks
        if (tmpl.blocks && tmpl.blocks.length > 0) {
          const cardBg = tmpl.cardBg || "#0a081e";
          const emailBg = tmpl.emailBg || "#050411";
          const replace = (text) => (text||"").replace(/\\{name\\}/g, name).replace(/\\{email\\}/g, email);
          const blockHtml = tmpl.blocks.map(b => {
            switch(b.type) {
              case "header": return \`<div style="background:linear-gradient(135deg,\${b.bg1||"#5B4EFF"},\${b.bg2||"#8B5CF6"});padding:\${b.padding||48}px 40px;text-align:center"></div>\`;
              case "logo": return b.logoUrl ? \`<div style="padding:20px 40px;text-align:\${b.align||"center"}"><img src="\${b.logoUrl}" alt="Logo" style="height:\${b.logoHeight||44}px;object-fit:contain;display:inline-block"/></div>\` : "";
              case "heading": return \`<div style="padding:4px 40px"><p style="font-size:\${b.size||22}px;margin:0 0 8px;color:\${b.color||"#fff"};text-align:\${b.align||"left"};font-weight:\${b.bold?"900":"700"};line-height:1.3">\${replace(b.text)}</p></div>\`;
              case "text": return \`<div style="padding:4px 40px"><div style="color:\${b.color||"rgba(255,255,255,0.7)"};font-size:\${b.size||15}px;line-height:\${b.lineHeight||1.8};text-align:\${b.align||"left"};margin:0 0 8px">\${b.html ? replace(b.html) : (b.text||"").replace(/\\n/g,"<br/>")}</div></div>\`;
              case "button": return \`<div style="padding:12px 40px;text-align:\${b.align||"center"}"><a href="\${b.url||"#"}" style="display:inline-block;padding:\${b.paddingV||16}px \${b.paddingH||32}px;background:linear-gradient(135deg,\${b.bgFrom||"#5B4EFF"},\${b.bgTo||"#8B5CF6"});color:\${b.color||"#fff"};text-decoration:none;border-radius:\${b.radius||14}px;font-weight:700;font-size:\${b.size||16}px">\${b.text||"Click here"}</a></div>\`;
              case "divider": return \`<div style="margin:\${b.margin||24}px 40px;border-top:1px solid \${b.color||"rgba(255,255,255,0.08)"}"></div>\`;
              case "spacer": return \`<div style="height:\${b.height||24}px"></div>\`;
              case "credentials": return \`<div style="background:\${b.cardBg||"#1a1830"};border-radius:14px;padding:24px 28px;margin:8px 40px 16px;border:1px solid \${b.cardBorder||"rgba(255,255,255,0.1)"}"><p style="margin:0 0 4px;color:\${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 20px;font-weight:700;color:\${b.emailColor||"#a78bfa"};font-size:15px">\${email}</p><p style="margin:0 0 4px;color:\${b.labelColor||"rgba(255,255,255,0.5)"};font-size:11px;text-transform:uppercase">Temporary Password</p><p style="margin:0;font-weight:900;font-size:22px;color:\${b.pwColor||"#fff"};background:\${b.pwBg||"rgba(91,78,255,0.2)"};padding:14px;border-radius:10px;text-align:center;font-family:monospace;letter-spacing:2px">\${tempPassword}</p></div>\`;
              case "footer": return \`<div style="padding:\${b.padding||24}px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:\${b.align||"center"};background:\${b.bg||"transparent"}"><p style="color:\${b.color||"rgba(255,255,255,0.3)"};font-size:\${b.size||12}px;margin:0;line-height:1.6">\${replace(b.text)}</p></div>\`;
              default: return "";
            }
          }).join("");
          emailHtml = \`<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:\${emailBg};padding:32px 0"><div style="max-width:600px;margin:0 auto;background:\${cardBg};border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">\${blockHtml}</div></div>\`;
        }
      }
    } catch(e) { console.error("Template load error:", e); }

    // Fallback to default HTML if no template
    if (!emailHtml) {
      emailHtml = \`<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center"><h1 style="margin:0;font-size:28px;font-weight:900">✦ 1Course</h1></div><div style="padding:32px"><h2 style="font-size:22px;margin:0 0 12px;color:#5B4EFF">Welcome, \${name}! 🎉</h2><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:24px;margin:0 0 20px;border:1px solid rgba(255,255,255,0.1)"><p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Email</p><p style="margin:0 0 16px;font-weight:700">\${email}</p><p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase">Password</p><p style="margin:0;font-weight:900;font-size:22px;background:rgba(91,78,255,0.2);padding:12px;border-radius:8px;text-align:center;font-family:monospace">\${tempPassword}</p></div><a href="\${process.env.NEXT_PUBLIC_SITE_URL}/login?email=\${encodeURIComponent(email)}" style="display:block;text-align:center;padding:16px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700">Log In to 1Course →</a></div></div>\`;
    }

    const { error: emailError } = await resend.emails.send({
      from: "noreply@1course.io",
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });'''

content = content.replace(old, new)
open('app/api/stripe/create-account/route.js', 'w', encoding='utf-8').write(content)
print("Done!")