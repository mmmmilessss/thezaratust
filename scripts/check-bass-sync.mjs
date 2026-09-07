import assert from "node:assert/strict";
import { sampleKick } from "../lib/bass-sync.ts";

const envelope = { intervalMs: 10, durationMs: 100, trackIds: ["track"], values: [0, 1, 0, 0, .8, 0, 0, 0, 0, 0] };
const state = { platform: "soundcloud", trackId: "track", isPlaying: true, isBuffering: false, positionMs: 10, durationMs: 100, playbackRate: 1, updatedAt: 1000 };
assert.equal(sampleKick(envelope, state, 1000), 1);
assert.equal(sampleKick(envelope, { ...state, isPlaying: false }, 1000), 0);
assert.equal(sampleKick(envelope, { ...state, isBuffering: true }, 1000), 0);
assert.equal(sampleKick(envelope, { ...state, positionMs: 40 }, 1000), .8);
assert.equal(sampleKick(envelope, { ...state, positionMs: 0 }, 1000), 0);
assert.equal(sampleKick(envelope, { ...state, trackId: "another-track" }, 1000), 0);
assert.equal(sampleKick(envelope, { ...state, durationMs: 30000 }, 1000), 0);
assert.equal(sampleKick(envelope, state, 3000), 0);
assert.equal(sampleKick(envelope, { ...state, positionMs: 100 }, 1000), 0);
assert.equal(sampleKick(null, state, 1000), 0);
console.log("PASS: kick lookup, immediate pause/buffer, forward/backward seek, track/preview mismatch, stale clock, end, missing analysis");

const { readFileSync, readdirSync } = await import('node:fs');
let timelinesChecked=0;
for(const name of readdirSync('public/bass-envelopes')){
 const timelines=JSON.parse(readFileSync(`public/bass-envelopes/${name}`));
 for(const track of timelines.tracks??[timelines]){
  assert.equal(track.version,3);
  assert.ok(track.trackIds.length);
  const i=track.values.findIndex(v=>v>.5);assert.ok(i>=0);
  for(const trackId of track.trackIds){
   const actual={...state,trackId,durationMs:track.durationMs,positionMs:i*track.intervalMs};
   assert.equal(sampleKick(timelines,actual,1000),track.values[i]);
   assert.equal(sampleKick(timelines,{...actual,isPlaying:false},1000),0);
  }
  timelinesChecked++;
 }
}
console.log(`PASS: ${timelinesChecked} real full/preview timelines, track selection, peak lookup and pause`);
