const BASE = 'https://api.mdblist.com';
export class MDBListClient {
  constructor(apiKey, fetchImpl = fetch) { this.apiKey = apiKey; this.fetch = fetchImpl; }
  async get(path, params = {}) {
    const q = new URLSearchParams({ apikey: this.apiKey, ...params });
    const r = await this.fetch(`${BASE}${path}?${q}`);
    if (!r.ok) throw new Error(`MDBList ${r.status}: ${await r.text()}`);
    return r.json();
  }
  normalizeList(listId) { const raw=String(listId).trim().replace(/\/$/,''); const share=raw.match(/mdblist\.com\/lists\/share\/([^/?#]+)/i); if (share) return {share:decodeURIComponent(share[1])}; const m=raw.match(/mdblist\.com\/lists\/([^/]+)\/([^/?#]+)/i); return m ? {owner:m[1],name:decodeURIComponent(m[2])} : {id:raw}; }
  async listItems(listId) { const out=[]; let cursor; const ref=this.normalizeList(listId); const path=ref.id ? `/lists/${encodeURIComponent(ref.id)}/items` : ref.share ? `/lists/share/${encodeURIComponent(ref.share)}/items` : `/lists/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.name)}/items`;
    do { const p=await this.get(path, { limit:'1000', mediatype:'show', ...(cursor ? {cursor}: {}) }); out.push(...(p.items || p.shows || [])); cursor=p.next_cursor || p.pagination?.next_cursor; } while(cursor);
    return out;
  }
  async listInfo(listId) { const ref=this.normalizeList(listId); const path=ref.id ? `/lists/${encodeURIComponent(ref.id)}` : ref.share ? `/lists/share/${encodeURIComponent(ref.share)}` : `/lists/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.name)}`; const result=await this.get(path); return Array.isArray(result) ? (result[0] || {}) : result; }
  async watchedEpisodes() { const out=[]; let cursor;
    do { const p=await this.get('/sync/watched', { limit:'1000', mediatype:'episode', ...(cursor ? {cursor}: {}) }); out.push(...(p.episodes || p.items || [])); cursor=p.next_cursor || p.pagination?.next_cursor; } while(cursor);
    return out;
  }
}
