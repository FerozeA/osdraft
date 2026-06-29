// Single source of truth for products. Add a product here when you create its
// documentation page at app/osdocs/<slug>/page.tsx. Both the /osdocs table of
// contents and the /admin/create-tag dropdown read from this list.

export type Product = { slug: string; title: string };

export const PRODUCTS: Product[] = [
  { slug: "dogtagv1", title: "NFC Dog Tag — v1" },
];

export function isKnownProduct(slug: string): boolean {
  return PRODUCTS.some((p) => p.slug === slug);
}
