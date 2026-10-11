import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
const mf=new Miniflare({host:'127.0.0.1',modules:true,scriptPath:'worker-dist/index.mjs',compatibilityDate:'2026-07-30',durableObjects:{ROOMS:{className:'RoomDurableObject',useSQLite:true}},bindings:{ALLOWED_ORIGINS:'http://localhost:5173'}});
async function call(path,data,token,expected=200) {
 const response=await mf.dispatchFetch('https://rooms.test'+path,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)});
 const body=await response.json();assert.equal(response.status,expected,JSON.stringify(body));return body;
}
function receive(ws) {return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('WebSocket update timed out')),5000);const listener=event=>{clearTimeout(timer);ws.removeEventListener('message',listener);resolve(JSON.parse(event.data));};ws.addEventListener('message',listener);});}
try {
 const host=await call('/api/rooms',{nickname:'Host',game:'color-clash',settings:{count:8,scoring:'teams',cue:true}},undefined,201);
 const code=host.credentials.code;const friend=await call(`/api/rooms/${code}/join`,{nickname:'Friend'});
 const path=`/api/rooms/${code}`;
 await call(path+'/state',undefined,'wrong',400);
 await call(path+'/action',{type:'start'},friend.credentials.token,400);
 const upgrade=await mf.dispatchFetch('https://rooms.test'+path+'/ws',{headers:{Upgrade:'websocket'}});
 assert.equal(upgrade.status,101);const ws=upgrade.webSocket;ws.accept();let next=receive(ws);ws.send(JSON.stringify({type:'auth',token:host.credentials.token}));
 const first=await next;assert.equal(first.type,'snapshot');assert.equal(first.room.players.length,2);assert.equal(JSON.stringify(first).includes(host.credentials.token),false);
 const action=(credentials,body)=>call(path+'/action',body,credentials.token);
 await action(host.credentials,{type:'ready',ready:true,team:'A'});await action(friend.credentials,{type:'ready',ready:true,team:'B'});
 next=receive(ws);const started=await action(host.credentials,{type:'start'});const update=await next;assert.equal(update.room.seed,started.room.seed);assert.ok(started.room.seed>0);
 const other=(await call(path+'/state',undefined,friend.credentials.token)).room;assert.equal(other.seed,started.room.seed);assert.equal(other.startsAt,started.room.startsAt);
 await call(path+'/action',{type:'answer',round:1,index:0,choice:'Red'},host.credentials.token,400);
 await new Promise(resolve=>setTimeout(resolve,Math.max(0,started.room.startsAt-Date.now())+30));
 const answers=['Red','Blue','Green','Purple'];
 for(const credential of [host.credentials,friend.credentials])for(let index=0;index<8;index++)await action(credential,{type:'answer',round:1,index,choice:answers[index%4]});
 const finished=(await call(path+'/state',undefined,host.credentials.token)).room;assert.equal(finished.phase,'finished');assert.equal(finished.players[0].score,finished.players[1].score);
 await action(host.credentials,{type:'ready',ready:true,team:'A'});await action(friend.credentials,{type:'ready',ready:true,team:'B'});const rematch=(await action(host.credentials,{type:'start'})).room;
 assert.notEqual(rematch.seed,started.room.seed);assert.equal(rematch.round,2);assert.equal(rematch.answers.length,0);
 await call(path+'/action',{type:'answer',round:1,index:0,choice:'Red'},host.credentials.token,400);
 await action(host.credentials,{type:'leave'});const transferred=(await call(path+'/state',undefined,friend.credentials.token)).room;assert.equal(transferred.hostId,friend.credentials.playerId);
 ws.close();await action(friend.credentials,{type:'leave'});await new Promise(resolve=>setTimeout(resolve,250));
 await call(path+'/state',undefined,friend.credentials.token,404);
 console.log('Worker integration passed: create/join, authorization, WebSocket updates, synchronized seed/start, server scoring, rematch, host transfer, room deletion.');
} finally {await mf.dispose();}


