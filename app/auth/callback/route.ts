import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic links land here with a one-time `code` (PKCE flow). Exchanging it
// sets the session cookies, then we continue to the admin area.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=link_invalid`);
}
