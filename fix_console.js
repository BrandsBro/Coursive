const fs = require('fs');
let c = fs.readFileSync('components/auth/AuthPage.jsx', 'utf8');

c = c.replace(
  'async function handleSubmit() {',
  `async function handleSubmit() {
    console.log("=== SIGN IN CLICKED ===");
    console.log("Email:", email);
    console.log("Password length:", password.length);
    console.log("Mode:", isLogin ? "LOGIN" : "SIGNUP");`
);

c = c.replace(
  'const { data, error: err } = await supabase.auth.signInWithPassword({',
  `console.log("Calling Supabase signIn...");
      const { data, error: err } = await supabase.auth.signInWithPassword({`
);

c = c.replace(
  'setLoading(false);\n\n      if (err) {',
  `setLoading(false);
      console.log("Supabase response - data:", data);
      console.log("Supabase response - error:", err);

      if (err) {`
);

c = c.replace(
  "router.push(\"/\");\n      router.refresh();",
  `console.log("Login SUCCESS - redirecting to home");
      router.push("/");
      router.refresh();`
);

fs.writeFileSync('components/auth/AuthPage.jsx', c);
console.log('Console logs added');
