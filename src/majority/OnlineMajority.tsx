import {useEffect,useState} from 'react';
import {majorityQuestions} from '../shared/majority';
import type {RoomAction,RoomView} from '../shared/rooms';
import {MajorityBallot,MajorityResult} from './MajorityParts';
export default function OnlineMajority({room,disabled,action}:{room:RoomView;disabled:boolean;action:(a:RoomAction)=>Promise<RoomView|null>}){
 const [seen,setSeen]=useState(()=>Math.max(0,(room.majority?.reveals.length??0)-1));useEffect(()=>setSeen(Math.max(0,(room.majority?.reveals.length??0)-1)),[room.round]);
 const questions=majorityQuestions(room.seed,room.settings.count);const state=room.majority??{index:0,reveals:[]};const reveal=state.reveals[seen];const me=room.players.find(p=>p.id===room.you);
 if(reveal)return <><MajorityResult prompt={questions[reveal.index]} reveal={reveal} choice={room.answers[reveal.index]?.choice}/><button className="button" onClick={()=>setSeen(seen+1)}>{room.phase==='finished'&&seen===state.reveals.length-1?'See final standings →':'Continue →'}</button></>;
 if(room.phase==='finished')return <div className="clash-panel"><h2>Round complete.</h2><p>Find your final score below. Get ready in the lobby for a fresh rematch.</p></div>;
 if(room.answers.length>state.index||state.index>=room.settings.count)return <div className="clash-panel clash-centered"><h2>Choices locked in.</h2><p>Waiting for everyone to vote. No preferences or predictions are revealed early.</p><p>{room.players.filter(p=>p.active&&p.answered>state.index).length} of {room.players.filter(p=>p.active).length} players have submitted.</p></div>;
 return <><div className="clash-stats"><span><small>PLAYER</small><strong>{me?.nickname}</strong></span><span><small>QUESTION</small><strong>{state.index+1}/{room.settings.count}</strong></span><span><small>SCORE</small><strong>{me?.score} pts</strong></span></div><MajorityBallot prompt={questions[state.index]} identity={`${room.round}-${state.index}`} disabled={disabled} onSubmit={choice=>void action({type:'answer',round:room.round,index:state.index,choice})}/></>;
}
