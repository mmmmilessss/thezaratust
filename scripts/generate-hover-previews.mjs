import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const root=process.cwd(), works=join(root,"content/works"), cache=join(root,".cache/zaratust-video"), output=join(root,"public/generated/hover-previews");
const downloader=existsSync(join(root,".cache/yt-dlp-env/bin/yt-dlp"))?join(root,".cache/yt-dlp-env/bin/yt-dlp"):"yt-dlp";
mkdirSync(cache,{recursive:true});mkdirSync(output,{recursive:true});
for(const folder of readdirSync(works,{withFileTypes:true}).filter((entry)=>entry.isDirectory())){
  const data=readFileSync(join(works,folder.name,"data.yaml"),"utf8"),type=data.match(/^type:\s*(.+)$/m)?.[1]?.trim();
  const slug=folder.name.trim().toLowerCase().replace(/\s+/g,"-"),previewDir=join(output,slug);
  if(type==="photography"){
    const files=readdirSync(join(works,folder.name)).filter((name)=>/\.(jpe?g|png|webp|avif)$/i.test(name)).sort((a,b)=>a.toLowerCase()==="cover.jpg"?-1:b.toLowerCase()==="cover.jpg"?1:a.localeCompare(b));
    const count=Math.min(20,files.length),selected=Array.from({length:count},(_,index)=>files[Math.round(index*(files.length-1)/Math.max(1,count-1))]);
    mkdirSync(previewDir,{recursive:true});
    for(let index=0;index<selected.length;index++){const target=join(previewDir,`photo-${String(index).padStart(2,"0")}.jpg`);if(!existsSync(target))await sharp(join(works,folder.name,selected[index])).resize({width:1200,height:1200,fit:"inside",withoutEnlargement:true}).jpeg({quality:86,mozjpeg:true}).toFile(target);}
    console.log(`GENERATED ${slug}: ${count} photography previews`);continue;
  }
  if(type!=="film"&&type!=="video")continue;
  const youtube=data.match(/^\s{2}youtube:\s*(.+)$/m)?.[1]?.trim();if(!youtube)continue;
  const dedupeConsecutive=slug==="film-thuglife";
  const versionMarker=join(previewDir,dedupeConsecutive?".selection-v3":".selection-v2");
  if(existsSync(versionMarker)&&Array.from({length:20},(_,index)=>join(previewDir,`frame-${String(index).padStart(2,"0")}.jpg`)).every(existsSync)){console.log(`CACHED ${slug}`);continue;}
  const video=join(cache,`${slug}.mp4`);
  if(!existsSync(video)){const download=spawnSync(downloader,["--no-playlist","--no-update","-f","bv*[ext=mp4][vcodec^=avc1][height<=720]","-o",video,youtube],{stdio:"inherit"});if(download.status!==0){console.warn(`UNRESOLVED ${slug}: video download failed`);continue;}}
  const candidates=join(cache,`${slug}-candidates`);rmSync(candidates,{recursive:true,force:true});mkdirSync(candidates,{recursive:true});
  const extraction=spawnSync("swift",[join(root,"scripts/extract-hover-frames.swift"),video,candidates,"60"],{stdio:"inherit"});
  if(extraction.status!==0){console.warn(`UNRESOLVED ${slug}: frame extraction failed`);continue;}
  const measured=[];let previousSignature;
  for(const file of readdirSync(candidates).filter((name)=>name.endsWith(".jpg")).sort()){
    const source=join(candidates,file),stats=await sharp(source).stats();
    const brightness=stats.channels.slice(0,3).reduce((sum,channel)=>sum+channel.mean,0)/3;
    if(brightness<=10)continue;
    if(dedupeConsecutive){
      const signature=await sharp(source).resize(16,16,{fit:"fill"}).greyscale().raw().toBuffer();
      const difference=previousSignature?signature.reduce((sum,value,index)=>sum+Math.abs(value-previousSignature[index]),0)/signature.length:Infinity;
      if(difference<3)continue;
      previousSignature=signature;
    }
    measured.push(file);
  }
  const pool=measured.length>=20?measured:readdirSync(candidates).filter((name)=>name.endsWith(".jpg")).sort();mkdirSync(previewDir,{recursive:true});
  for(let index=0;index<20;index++){const source=pool[Math.round(index*(pool.length-1)/19)];copyFileSync(join(candidates,source),join(previewDir,`frame-${String(index).padStart(2,"0")}.jpg`));}
  writeFileSync(versionMarker,dedupeConsecutive?"60 candidates; near-black and consecutive near-duplicate frames excluded\n":"60 candidates; near-black frames excluded\n");console.log(`GENERATED ${slug}: 20 frames from ${pool.length} usable candidates`);
}
