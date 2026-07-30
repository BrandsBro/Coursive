import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    // Use the access token to create a session then update password
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (sessionError) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch(e) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
