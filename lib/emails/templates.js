export const welcomeEmail = (name) => ({
  subject: "Welcome to 1Course! 🎉",
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#5B4EFF,#8B5CF6);padding:40px 32px;text-align:center">
        <h1 style="margin:0;font-size:28px;font-weight:900">1Course</h1>
        <p style="margin:8px 0 0;opacity:0.8">Your AI learning journey starts now</p>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:22px;margin:0 0 12px">Welcome, ${name}! 👋</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.7">You've just taken the first step toward mastering AI. Here's what you can do next:</p>
        <div style="margin:24px 0">
          ${["🎯 Complete your first lesson","📅 Join the 28-Day AI Challenge","🏆 Earn your AI Certificate"].map(item => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,0.05);border-radius:10px;margin-bottom:8px">
              <span>${item}</span>
            </div>
          `).join("")}
        </div>
        <a href="https://1course.io" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
          Start Learning →
        </a>
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">© 2026 1Course. All rights reserved.</p>
      </div>
    </div>
  `
});

export const lessonCompleteEmail = (name, lessonTitle, courseName) => ({
  subject: `Lesson Complete! 🎉 "${lessonTitle}"`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:40px 32px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🎉</div>
        <h1 style="margin:0;font-size:24px;font-weight:900">Lesson Complete!</h1>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:20px;margin:0 0 8px">Great work, ${name}!</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.7">You just completed <strong>"${lessonTitle}"</strong> in ${courseName}. Keep going!</p>
        <a href="https://1course.io" style="display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#5B4EFF,#8B5CF6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
          Continue Learning →
        </a>
      </div>
    </div>
  `
});

export const certificateEmail = (name, courseName) => ({
  subject: `🏆 You earned your AI Certificate!`,
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a081e;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px 32px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">🏆</div>
        <h1 style="margin:0;font-size:24px;font-weight:900">Certificate Earned!</h1>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:20px;margin:0 0 8px">Congratulations, ${name}!</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.7">You've successfully completed <strong>${courseName}</strong> and earned your AI Certificate. Share it on LinkedIn to stand out!</p>
        <a href="https://1course.io/profile" style="display:inline-block;margin-top:20px;padding:14px 28px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;border-radius:10px;font-weight:700">
          View Certificate →
        </a>
      </div>
    </div>
  `
});
