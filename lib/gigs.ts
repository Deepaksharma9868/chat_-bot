export type Gig = { id: string; title: string; description: string; price: number; tags: string[] };

// Reads public gigs via Supabase REST; RLS policy gigs_public_read limits this to hidden_at IS NULL.
async function fetchGigs(): Promise<Gig[]> {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = process.env;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/gigs?select=id,title,description,base_price,tags&order=created_at.desc&limit=50`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) throw new Error(String(res.status));
    const rows = await res.json();
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: (r.description ?? "").slice(0, 200),
      price: Number(r.base_price),
      tags: r.tags ?? [],
    }));
  } catch (e) {
    console.error("gigs fetch failed:", e);
    return [];
  }
}

export async function searchGigs(query: string): Promise<Gig[]> {
  const all = await fetchGigs();
  if (/\b(gigs?|jobs?|projects?|available|list)\b/i.test(query)) return all;
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  return all.filter((g) => {
    const text = `${g.title} ${g.description} ${g.tags.join(" ")}`.toLowerCase();
    return words.some((w) => text.includes(w));
  });
}
