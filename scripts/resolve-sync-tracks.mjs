import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root='.cache/zaratust-audio'; mkdirSync(root,{recursive:true});
const downloader='.cache/yt-dlp-env/bin/yt-dlp';
for (const folder of readdirSync('content/works',{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name)) {
 const yaml=readFileSync(`content/works/${folder}/data.yaml`,'utf8');
 if(!yaml.startsWith('type: music')) continue;
 const slug=folder.toLowerCase().replaceAll(' ','-');
 const album=yaml.match(/spotify: https:\/\/open.spotify.com\/album\/([\w]+)/)?.[1];
 if(!album) continue;
 const html=await fetch(`https://open.spotify.com/embed/album/${album}`).then(r=>r.text());
 const entity=JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)[1]).props.pageProps.state.data.entity;
 const tracks=entity.trackList.map(t=>({id:t.uri,title:t.title,duration:t.duration,preview:t.audioPreview?.url}));
 writeFileSync(`${root}/${slug}.tracks.json`,JSON.stringify(tracks,null,2));
 for(const t of tracks){
  const key=`${slug}-${t.id.split(':').at(-1)}-preview`;
  const file=`${key}.analysis.mp3`;
  if(t.preview && !existsSync(`${root}/${file}`)) writeFileSync(`${root}/${file}`,Buffer.from(await fetch(t.preview).then(r=>r.arrayBuffer())));
  if(t.preview)writeFileSync(`${root}/${key}.json`,JSON.stringify({sourceUrl:t.preview,trackIds:[t.id],mode:'preview',title:t.title}));
 }
 const playlist=yaml.match(/youtube: (\S+)/)?.[1];
 if(playlist){
  const result=spawnSync(downloader,['--flat-playlist','--dump-single-json',playlist],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr);
  const entries=JSON.parse(result.stdout).entries;
  for(const t of tracks){
   const match=entries.find(e=>e.title.toLowerCase()===t.title.toLowerCase());
   if(!match){console.log(`NO MATCH ${t.title}`);continue;}
   const key=`${slug}-${t.id.split(':').at(-1)}-full`;
   const file=`${key}.analysis.m4a`;
   const url=`https://www.youtube.com/watch?v=${match.id}`;
   if(!existsSync(`${root}/${file}`)){
    const d=spawnSync(downloader,['--no-playlist','-f','bestaudio[ext=m4a]','-o',`${root}/${file}`,url],{encoding:'utf8'});
    if(d.status!==0){console.log(`DOWNLOAD FAILED ${t.title}: ${d.stderr.slice(-700)}`);continue;}
   }
   writeFileSync(`${root}/${key}.json`,JSON.stringify({sourceUrl:url,trackIds:[t.id],mode:'full',title:t.title}));
  }
 }else if(tracks.length===1){
  const file=`${root}/${slug}.json`;const meta=JSON.parse(readFileSync(file)); meta.trackIds=[meta.sourceUrl,tracks[0].id];meta.mode='full';writeFileSync(file,JSON.stringify(meta,null,2));
 }
 console.log(`RESOLVED ${slug}: ${tracks.map(t=>t.title).join(', ')}`);
}
