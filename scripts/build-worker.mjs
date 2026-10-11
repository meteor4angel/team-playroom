import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.resolve('vite'));
const {rollup}=require('rollup');
const build=await rollup({input:'worker/index.ts',plugins:[{
 name:'local-typescript',
 resolveId(source,importer){if(source.startsWith('.'))return path.resolve(path.dirname(importer),source)+'.ts';},
 async load(id){if(id.endsWith('.ts'))return ts.transpileModule(await fs.readFile(id,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;},
}]});
await fs.mkdir('worker-dist',{recursive:true});
await build.write({file:'worker-dist/index.mjs',format:'es'});
await build.close();console.log('Room Worker bundled.');
