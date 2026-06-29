import { redirect } from "next/navigation";
import { getSupabase, Tag } from "@/lib/supabase";
import ClaimForm from "./ClaimForm";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tag: Tag | null = null;
  let fetchError = false;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      fetchError = true;
    } else {
      tag = data;
    }
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <main className="page">
        <div className="card">
          <h1>Something went wrong</h1>
          <p className="subtext" style={{ marginBottom: 0 }}>
            Please try again in a moment
          </p>
        </div>
      </main>
    );
  }

  if (!tag) {
    return (
      <main className="page">
        <div className="card">
          <h1>Tag not found</h1>
          <p className="subtext" style={{ marginBottom: 0 }}>
            This tag is not registered
          </p>
        </div>
      </main>
    );
  }

  if (tag.claimed && tag.destination_url) {
    redirect(tag.destination_url);
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Set up your tag</h1>
        <p className="subtext">Choose where this tag points</p>
        <ClaimForm tagId={id} product={tag.product} />
      </div>
    </main>
  );
}
