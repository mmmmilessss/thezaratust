import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const sourceRoot='.cache/zaratust-audio', outDir='public/bass-envelopes';
mkdirSync(outDir,{recursive:true});
function pcmSamples(buffer){
 for(let at=12;at+8<=buffer.length;){const size=buffer.readUInt32LE(at+4);if(buffer.toString('ascii',at,at+4)==='data'){const samples=[];for(let i=at+8;i+1<Math.min(buffer.length,at+8+size);i+=2)samples.push(buffer.readInt16LE(i)/32768);return samples;}at+=8+size+(size%2);}
 throw Error('WAV data chunk missing');
}
function filter(samples,kind,frequency){
 const w=2*Math.PI*frequency/8000,c=Math.cos(w),alpha=Math.sin(w)/(2*Math.SQRT1_2),a0=1+alpha;
 const b0=(kind==='low'?(1-c)/2:(1+c)/2)/a0,b1=(kind==='low'?1-c:-(1+c))/a0,b2=b0,a1=-2*c/a0,a2=(1-alpha)/a0;
 const out=new Float32Array(samples.length);let x1=0,x2=0,y1=0,y2=0;
 for(let i=0;i<samples.length;i++){const x=samples[i],y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;out[i]=y;x2=x1;x1=x;y2=y1;y1=y;}return out;
}
const generated=[];
for(const file of readdirSync(sourceRoot).filter(n=>/\.analysis\.(mp3|m4a|wav|aac|flac|ogg)$/.test(n))){
 const key=file.replace(/\.analysis\.[^.]+$/,''),metaPath=join(sourceRoot,`${key}.json`);
 const meta=existsSync(metaPath)?JSON.parse(readFileSync(metaPath)):{};
 const trackIds=meta.trackIds??(meta.sourceUrl?.startsWith('https://soundcloud.com/')?[meta.sourceUrl]:[]);
 if(!trackIds.length)continue;
 const temporary=join('/tmp',`zaratust-kick-${process.pid}.wav`);
 const result=spawnSync('afconvert',['-f','WAVE','-d','LEI16@8000','-c','1',join(sourceRoot,file),temporary],{encoding:'utf8'});
 if(result.status!==0)throw Error(`${key}: ${result.stderr}`);
 const pcm=pcmSamples(readFileSync(temporary));unlinkSync(temporary);
 const band=filter(filter(pcm,'high',40),'low',120),rms=[];
 for(let i=0;i<band.length;i+=80){let sum=0,end=Math.min(band.length,i+80);for(let j=i;j<end;j++)sum+=band[j]**2;rms.push(Math.sqrt(sum/(end-i)));}
 const onset=rms.map((v,i)=>Math.max(0,v-rms[Math.max(0,i-3)]));
 const sorted=[...onset].sort((a,b)=>a-b),ceiling=sorted[Math.floor(sorted.length*.98)]||1;
 let pulse=0;const values=onset.map(v=>{pulse=Math.max(Math.min(1,v/ceiling),pulse*Math.exp(-10/45));return Math.round(pulse*255)/255;});
 const data={version:3,intervalMs:10,durationMs:pcm.length/8,trackIds,mode:meta.mode??'full',source:file,values};
 generated.push({key,data});
}
const releaseKeys=readdirSync(sourceRoot).filter(n=>n.endsWith('.tracks.json')).map(n=>n.replace('.tracks.json',''));
for(const release of releaseKeys){
 const tracks=generated.filter(x=>x.key===release||x.key.startsWith(`${release}-`)).map(x=>x.data);
 writeFileSync(join(outDir,`${release}.json`),JSON.stringify({version:3,tracks}));
 console.log(`${release}: ${tracks.length} track timelines`);
}
for(const {key,data} of generated){if(releaseKeys.some(r=>key===r||key.startsWith(`${r}-`)))continue;writeFileSync(join(outDir,`${key}.json`),JSON.stringify(data));console.log(`${key}: full track`);}
