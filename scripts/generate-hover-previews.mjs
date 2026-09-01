import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
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
  if(Array.from({length:20},(_,index)=>join(previewDir,`frame-${String(index).padStart(2,"0")}.jpg`)).every(existsSync)){console.log(`CACHED ${slug}`);continue;}
  const video=join(cache,`${slug}.mp4`);
  if(!existsSync(video)){const download=spawnSync(downloader,["--no-playlist","--no-update","-f","bv*[ext=mp4][vcodec^=avc1][height<=720]","-o",video,youtube],{stdio:"inherit"});if(download.status!==0){console.warn(`UNRESOLVED ${slug}: video download failed`);continue;}}
  const extraction=spawnSync("swift",[join(root,"scripts/extract-hover-frames.swift"),video,previewDir],{stdio:"inherit"});
  if(extraction.status!==0)console.warn(`UNRESOLVED ${slug}: frame extraction failed`);else console.log(`GENERATED ${slug}: 20 frames`);
}
