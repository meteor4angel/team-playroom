import {Miniflare} from 'miniflare';
const mf=new Miniflare({port:8787,host:'127.0.0.1',modules:true,scriptPath:'worker-dist/index.mjs',compatibilityDate:'2026-07-30',durableObjects:{ROOMS:{className:'RoomDurableObject',useSQLite:true}},bindings:{ALLOWED_ORIGINS:'http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:4174,http://127.0.0.1:4173'},durableObjectsPersist:'.wrangler/local-rooms'});
console.log('Local rooms:',(await mf.ready).href);
process.on('SIGINT',async()=>{await mf.dispose();process.exit(0);});


