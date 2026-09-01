import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root=process.cwd(),worksRoot=join(root,"content/works"),cacheRoot=join(root,".cache/zaratust-audio");
const downloader=existsSync(join(root,".cache/yt-dlp-env/bin/yt-dlp"))?join(root,".cache/yt-dlp-env/bin/yt-dlp"):"yt-dlp";
mkdirSync(cacheRoot,{recursive:true});
const scalar=(text,key)=>text.match(new RegExp(`^${key}:\\s*(.+)$`,"m"))?.[1]?.trim().replace(/^['"]|['"]$/g,"");
const link=(text,key)=>text.match(new RegExp(`^\\s{2}${key}:\\s*(.+)$`,"m"))?.[1]?.trim();
const entries=readdirSync(worksRoot,{withFileTypes:true}).filter((entry)=>entry.isDirectory()).map((folder)=>{const data=readFileSync(join(worksRoot,folder.name,"data.yaml"),"utf8");return{folder:folder.name,data,type:scalar(data,"type"),project:scalar(data,"project"),youtube:link(data,"youtube"),soundcloud:link(data,"soundcloud")};});
const usable=(url,minimum=1)=>{try{return !!url&&new URL(url).pathname.split("/").filter(Boolean).length>=minimum;}catch{return false;}};

for(const entry of entries.filter((item)=>item.type==="music")){
  const slug=entry.folder.trim().toLowerCase().replace(/\s+/g,"-");
  const relatedVideo=entries.find((item)=>(item.type==="video"||item.type==="film")&&entry.project&&entry.project!=="none"&&item.project===entry.project&&usable(item.youtube));
  const sourcePlatform=usable(entry.soundcloud,2)?"soundcloud":usable(entry.youtube)?"youtube":relatedVideo?"youtube":null;
  const sourceUrl=sourcePlatform==="soundcloud"?entry.soundcloud:usable(entry.youtube)?entry.youtube:relatedVideo?.youtube;
  if(!sourcePlatform||!sourceUrl){console.log(`UNRESOLVED ${slug}: no full public source`);continue;}
  const metadataPath=join(cacheRoot,`${slug}.json`),cached=existsSync(metadataPath)?JSON.parse(readFileSync(metadataPath,"utf8")):null;
  const cachedName=cached?.downloadedFile??cached?.file,cachedFile=cachedName?join(cacheRoot,cachedName):null;
  if(cached?.sourceUrl===sourceUrl&&cachedFile&&existsSync(cachedFile)){console.log(`CACHED ${slug}: ${cachedName}`);continue;}
  const template=join(cacheRoot,`${slug}.analysis.%(ext)s`);
  const download=spawnSync(downloader,["--no-playlist","--no-update","-f","bestaudio[ext=m4a]/bestaudio","-o",template,"--print","after_move:filepath",sourceUrl],{encoding:"utf8",stdio:["ignore","pipe","inherit"]});
  if(download.status!==0){console.log(`UNRESOLVED ${slug}: ${sourcePlatform} download failed`);continue;}
  const outputFile=download.stdout.trim().split("\n").at(-1),durationResult=spawnSync(downloader,["--no-update","--skip-download","--print","%(duration)s",sourceUrl],{encoding:"utf8"});
  const duration=Number(durationResult.stdout.trim().split("\n").at(-1));
  const downloadedFile=outputFile.split("/").at(-1);
  writeFileSync(metadataPath,JSON.stringify({slug,sourcePlatform,sourceUrl,downloadedFile,duration,downloadedAt:new Date().toISOString()},null,2));
  console.log(`DOWNLOADED ${slug}: ${downloadedFile} (${duration.toFixed(3)}s)`);
}
