import UpdateForm from "./UpdateForm";

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="page">
      <div className="card">
        <h1>Update your tag</h1>
        <p className="subtext">
          Verify your details to change the destination
        </p>
        <UpdateForm tagId={id} />
      </div>
    </main>
  );
}
