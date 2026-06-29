import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isKnownProduct } from "@/lib/products";

export async function POST(req: Request) {
  let body: { id?: string; product?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = body.id?.trim();
  const product = body.product?.trim();

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

  if (!product || !isKnownProduct(product)) {
    return NextResponse.json(
      { error: "Please choose a valid product for this tag." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("tags")
    .insert({ id, product, claimed: false });

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
