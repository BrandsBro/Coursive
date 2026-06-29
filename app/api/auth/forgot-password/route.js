import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple in-memory rate limit: max 3 requests per email per hour
const attempts = new Map();

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error:"Email required" }, { status:400 });

    // Rate limiting
    const key = email.toLowerCase();
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(t => now - t < 60 * 60 * 1000); // last hour

    if (recentAttempts.length >= 3) {
      return NextResponse.json({ error:"Too many reset attempts. Please try again in 1 hour." }, { status:429 });
    }

    attempts.set(key, [...recentAttempts, now]);

    // Check user exists first (don't reveal if email exists for security)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    // Always return success even if email not found (prevents email enumeration)
    if (!profile) return NextResponse.json({ success: true });

    // Send Supabase reset link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error("Reset error:", error);
      return NextResponse.json({ error: error.message }, { status:500 });
    }

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: e.message }, { status:500 });
  }
}
