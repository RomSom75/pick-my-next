export function normalizeListItems(payload) {
  const buckets = [payload?.items, payload?.shows, payload?.data].filter(Array.isArray);
  return (buckets[0] || []).filter(x => (x.type || x.mediatype || x.media_type) === 'show' || x.show || x.ids?.tmdb || x.tmdb);
}

export function watchedEpisodeSet(payload) {
  const episodes = payload?.episodes || payload?.items || [];
  return new Set(episodes.map(e => `${Number(e.show ?? e.show_id ?? e.ids?.show?.tmdb ?? e.parent_tmdb)}:${Number(e.season ?? e.season_num)}:${Number(e.episode ?? e.number ?? e.episode_num)}`));
}

export function chooseNextSeason(show, watched, now = new Date()) {
  const seasons = (show.seasons || []).filter(s => Number(s.season_number ?? s.number) > 0).sort((a,b) => (a.season_number ?? a.number) - (b.season_number ?? b.number));
  for (const season of seasons) {
    const n = Number(season.season_number ?? season.number);
    const episodes = (season.episodes || []).filter(e => Number(e.episode_number ?? e.episode ?? e.number) > 0);
    if (!episodes.length) continue;
    const aired = episodes.every(e => e.air_date && new Date(e.air_date) <= now);
    if (!aired) return null;
    const complete = episodes.every(e => watched.has(`${show.id}:${n}:${Number(e.episode_number ?? e.episode ?? e.number)}`));
    if (!complete) return { season: n, remaining: episodes.filter(e => !watched.has(`${show.id}:${n}:${Number(e.episode_number ?? e.episode ?? e.number)}`)).length };
  }
  return null;
}

export function eligibleShows(listItems, details, watchedByShow, now = new Date()) {
  const result = [];
  for (const item of listItems) {
    const id = Number(item.ids?.tmdb ?? item.tmdb ?? item.show?.ids?.tmdb);
    const show = details.get(id);
    if (!id || !show) continue;
    const next = chooseNextSeason({ ...show, id }, watchedByShow.get(id) || new Set(), now);
    if (next) result.push({ id, title: item.title || show.name, poster: item.poster || show.poster_path, year: item.year || show.first_air_date?.slice(0,4), ...next });
  }
  return result;
}

export function randomPick(items, random = Math.random) { return items.length ? items[Math.floor(random() * items.length)] : null; }
