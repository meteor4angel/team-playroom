import type {Credentials,RoomAction,RoomSettings,RoomView} from '../shared/rooms';
export const apiUrl=(import.meta.env.VITE_ROOM_API_URL as string|undefined)?.trim().replace(/\/$/,'')??'';
export const onlineConfigured=!!apiUrl;
export function saveSession(credentials: Credentials) {sessionStorage.setItem(`playroom:${credentials.code}`,JSON.stringify(credentials));}
export function loadSession(code: string): Credentials|null {
  try {return JSON.parse(sessionStorage.getItem(`playroom:${code}`)??'null') as Credentials|null;}catch{return null;}
}
export function clearSession(code: string) {sessionStorage.removeItem(`playroom:${code}`);}
export async function request<T>(path: string, data?: unknown, token?: string): Promise<T> {
  if(!onlineConfigured) throw new Error('Online rooms are not connected yet.');
  const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),12000);
  try {
    const response=await fetch(`${apiUrl}${path}`,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:data===undefined?undefined:JSON.stringify(data),signal:controller.signal});
    const result=await response.json();if(!response.ok) throw new Error(result.error??'Room request failed.');return result as T;
  } catch(error) {if(error instanceof TypeError || error instanceof DOMException) throw new Error('Could not reach the room. Check your connection and retry.');throw error;}
  finally {window.clearTimeout(timeout);}
}
export type Joined={credentials:Credentials;room:RoomView};
export function createOnlineRoom(nickname:string,settings:RoomSettings) {return request<Joined>('/api/rooms',{nickname,settings,game:'color-clash'});}
export function joinOnlineRoom(code:string,nickname:string) {return request<Joined>(`/api/rooms/${code}/join`,{nickname});}
export function roomAction(credentials:Credentials,action:RoomAction) {return request<{room:RoomView}>(`/api/rooms/${credentials.code}/action`,action,credentials.token);}
