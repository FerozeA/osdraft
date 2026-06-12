import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = body.id?.trim();

  if (!id) {
    return NextResponse.json(
      { error: "A tag ID is required." },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json(
      { error: "Tag IDs can only contain letters, numbers, hyphens, and underscores." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("tags")
    .insert({ id, claimed: false });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A tag with this ID already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id });
}
