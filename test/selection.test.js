import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseNextSeason, eligibleShows, randomPick } from '../src/selection.js';
const show={id:10,seasons:[{season_number:1,episodes:[{episode_number:1,air_date:'2020-01-01'},{episode_number:2,air_date:'2020-01-02'}]},{season_number:2,episodes:[{episode_number:1,air_date:'2999-01-01'}]}]};
test('returns first season not complete and never skips it',()=>{const watched=new Set(['10:1:1']);assert.deepEqual(chooseNextSeason(show,watched,new Date('2025-01-01')),{season:1,remaining:1});});
test('excludes a show whose next season is not fully aired',()=>assert.equal(chooseNextSeason(show,new Set(['10:1:1','10:1:2']),new Date('2025-01-01')),null));
test('excludes fully watched shows',()=>assert.equal(chooseNextSeason({...show,seasons:show.seasons.slice(0,1)},new Set(['10:1:1','10:1:2']),new Date('2025-01-01')),null));
test('deduplicates eligible selection by show logic',()=>{const x=eligibleShows([{ids:{tmdb:10},title:'Test'}],new Map([[10,{...show,seasons:[show.seasons[0]]}]]),new Map([[10,new Set()]]),new Date('2025-01-01'));assert.equal(x.length,1);});
test('random pick is deterministic when injected',()=>assert.equal(randomPick([{id:1},{id:2}],()=>.99).id,2));
