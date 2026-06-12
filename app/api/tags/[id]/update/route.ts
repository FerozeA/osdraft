import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function normalizeUrl(url: string): string | null {
  let candidate = url.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    destination_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim() || null;
  const phone = body.phone?.trim() || null;
  const rawUrl = body.destination_url?.trim();

  if (!name || !rawUrl || (!email && !phone)) {
    return NextResponse.json(
      { error: "Name, a contact method, and a destination URL are required." },
      { status: 400 }
    );
  }

  const destinationUrl = normalizeUrl(rawUrl);
  if (!destinationUrl) {
    return NextResponse.json(
      { error: "That destination URL doesn't look valid." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { data: tag, error: fetchError } = await supabase
    .from("tags")
    .select("id, name, email, phone, claimed")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!tag) {
    return NextResponse.json(
      { error: "This tag is not registered." },
      { status: 404 }
    );
  }

  if (!tag.claimed) {
    return NextResponse.json(
      { error: "This tag has not been set up yet." },
      { status: 400 }
    );
  }

  const nameMatches =
    tag.name?.trim().toLowerCase() === name.toLowerCase();

  const emailMatches =
    email !== null &&
    tag.email !== null &&
    tag.email.toLowerCase() === email.toLowerCase();

  const phoneMatches =
    phone !== null &&
    tag.phone !== null &&
    normalizePhone(tag.phone) === normalizePhone(phone);

  if (!nameMatches || (!emailMatches && !phoneMatches)) {
    return NextResponse.json(
      { error: "Those details don't match our records for this tag." },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase
    .from("tags")
    .update({ destination_url: destinationUrl })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, destination_url: destinationUrl });
}
