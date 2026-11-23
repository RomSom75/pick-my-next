const BASE='https://api.themoviedb.org/3';
export class TMDBClient {
  constructor(token, language='fr-FR', fetchImpl=fetch) { this.token=token; this.language=language; this.fetch=fetchImpl; }
  async get(path) { const params=new URLSearchParams({language:this.language}); const headers={}; if(this.token.startsWith('eyJ')) headers.Authorization=`Bearer ${this.token}`; else params.set('api_key',this.token); const r=await this.fetch(`${BASE}${path}?${params}`, {headers}); if(!r.ok) throw new Error(`TMDb ${r.status}: ${await r.text()}`); return r.json(); }
  async show(id) { const s=await this.get(`/tv/${id}`); s.seasons=await Promise.all((s.seasons||[]).filter(x=>x.season_number>0).map(async x => ({...x, ...(await this.get(`/tv/${id}/season/${x.season_number}`))}))); return s; }
}
