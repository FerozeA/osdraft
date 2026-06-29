import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Open Source Documentation",
};

export default function OsDocsIndex() {
  return (
    <main className="page" style={{ alignItems: "flex-start" }}>
      <div className="card" style={{ maxWidth: 640 }}>
        <h1>Open Source Documentation</h1>
        <p className="subtext">Hardware and how it works</p>

        <ul className="doc-list">
          {PRODUCTS.map((d) => (
            <li key={d.slug}>
              <Link href={`/osdocs/${d.slug}`}>{d.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
