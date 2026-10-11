import {useCallback,useEffect,useRef,useState} from 'react';
import type {Credentials,RoomAction,RoomView} from '../shared/rooms';
import {apiUrl,request,roomAction} from './client';
export function useRoom(credentials:Credentials|null) {
 const [room,setRoom]=useState<RoomView|null>(null);
 const [status,setStatus]=useState('Connecting…');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [offset,setOffset]=useState(0);
 const alive=useRef(true);
 const inFlight=useRef(false);
 const accept=useCallback((next:RoomView)=>{
  if(!alive.current) return;
  setRoom(old=>!old||next.revision>=old.revision?next:old);setOffset(next.serverNow-Date.now());
 },[]);
 useEffect(()=>{
  alive.current=true;setRoom(null);setError('');if(!credentials) return;
  let stopped=false,ws:WebSocket,retry:ReturnType<typeof setTimeout>|undefined,attempt=0;
  const connect=()=>{
   if(stopped)return;setStatus(attempt?'Reconnecting…':'Connecting…');
   ws=new WebSocket(`${apiUrl.replace(/^http/,'ws')}/api/rooms/${credentials.code}/ws`);
   ws.onopen=()=>{attempt=0;ws.send(JSON.stringify({type:'auth',token:credentials.token}));};
   ws.onmessage=event=>{
    try {const data=JSON.parse(event.data);if(data.type==='snapshot'){accept(data.room);setStatus('Connected');setError('');}else if(data.type==='error')setError(data.error);}catch{setError('Room sent an unreadable update.');}
   };
   ws.onclose=event=>{
    if(stopped)return;
    if(event.code===4001 || event.code===4004 || event.code===1008){setStatus('Disconnected');setError(event.reason);return;}
    setStatus('Reconnecting…');retry=setTimeout(connect,Math.min(1000*2**attempt++,15000));
   };
   ws.onerror=()=>setStatus('Connection interrupted');
  };
  connect();
  // Refresh after visibility/network changes; no database polling loop.
  const sync=()=>{if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'sync'}));};
  const visibility=()=>{if(document.visibilityState==='visible')sync();};
  window.addEventListener('online',sync);document.addEventListener('visibilitychange',visibility);
  request<{room:RoomView}>(`/api/rooms/${credentials.code}/state`,undefined,credentials.token).then(result=>{if(!stopped)accept(result.room);}).catch(e=>{if(!stopped)setError(e.message);});
  return()=>{stopped=true;alive.current=false;if(retry)clearTimeout(retry);ws?.close();window.removeEventListener('online',sync);document.removeEventListener('visibilitychange',visibility);};
 },[credentials?.code,credentials?.token,accept]);
 const action=async(command:RoomAction)=>{
  if(!credentials||inFlight.current)return null;
  inFlight.current=true;setBusy(true);setError('');
  try {const result=await roomAction(credentials,command);accept(result.room);return result.room;}
  catch(e){setError(e instanceof Error?e.message:'Room action failed.');return null;}
  finally{inFlight.current=false;if(alive.current)setBusy(false);}
 };
 return {room,status,error,busy,offset,action};
}
