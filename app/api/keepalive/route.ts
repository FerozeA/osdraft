import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Hit periodically (Vercel Cron or an external uptime monitor) to keep the
// Supabase free-tier project from pausing after 7 days of inactivity.
// Runs a tiny query so the database registers activity.
export async function GET(req: Request) {
  // If CRON_SECRET is set, require it. Vercel automatically sends this header
  // on scheduled cron invocations when the env var exists. Leaving CRON_SECRET
  // unset makes the endpoint open (fine for a harmless read).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("tags").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
