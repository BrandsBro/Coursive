import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/emails/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/";

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error && data?.user) {
      const name = data.user.user_metadata?.full_name || "there";
      const email = data.user.email;
      const { subject, html } = welcomeEmail(name);
      await resend.emails.send({
        from: "Coursiv <noreply@kingbrandsbro.pro>",
        to: email,
        subject,
        html,
      });
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}
