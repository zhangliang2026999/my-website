import {readFile,readdir,mkdir,rm,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(import.meta.dirname,'..'), assets={};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
async function collect(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){const name=prefix+'/'+e.name;if(e.isDirectory())await collect(resolve(dir,e.name),name);else assets[name]={body:(await readFile(resolve(dir,e.name))).toString('base64'),type:types[extname(name)]||'application/octet-stream'}}}
await collect(resolve(root,'public'));
const worker=await readFile(resolve(root,'worker/index.js'),'utf8');
await rm(resolve(root,'dist'),{recursive:true,force:true});await mkdir(resolve(root,'dist/server'),{recursive:true});await mkdir(resolve(root,'dist/.openai'),{recursive:true});
await writeFile(resolve(root,'dist/server/index.js'),`const ASSETS=${JSON.stringify(assets)};\n${worker}`);
await writeFile(resolve(root,'dist/.openai/hosting.json'),await readFile(resolve(root,'.openai/hosting.json')).catch(()=>Buffer.from('{}')));
console.log('Built Worker with embedded static assets.');
