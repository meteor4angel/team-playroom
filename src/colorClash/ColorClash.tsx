import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, makeQuestions, newSeed, questionCounts, type QuestionCount, score, winner, type Answer, type ColorName, type Question } from './engine';
import './colorClash.css';
import OnlineRoom from '../rooms/OnlineRoom';

type Phase = 'setup' | 'ready' | 'playing' | 'feedback' | 'results';
export default function ColorClash() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<'solo' | 'teams' | 'online'>('solo');
  const [cue, setCue] = useState(false);
  const [count, setCount] = useState<QuestionCount>(12);
  const [seed, setSeed] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [team, setTeam] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [completed, setCompleted] = useState<Answer[][]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackButton = useRef<HTMLButtonElement>(null);
  const answering = useRef(false);
  const question = questions[answers.length];
  const previous = questions[answers.length - 1];
  const currentName = mode === 'solo' ? 'You' : `Team ${team === 0 ? 'A' : 'B'}`;

  function start() {
    const nextSeed = newSeed(seed); setSeed(nextSeed); setQuestions(makeQuestions(nextSeed, count)); setTeam(0); setAnswers([]); setCompleted([]); setPhase('ready');
  }
  function answer(choice: ColorName) {
    if (phase !== 'playing' || !question || answering.current) return;
    answering.current = true;
    setAnswers(old => [...old, { choice, correct: choice === question.ink }]);
    setPhase('feedback');
  }
  function next() {
    if (answers.length === count) {
      setCompleted(old => [...old, answers]);
      if (mode === 'teams' && team === 0) {
        setTeam(1); setAnswers([]); setPhase('ready');
      } else setPhase('results');
    } else setPhase('playing');
  }
  useEffect(() => {
    if (phase === 'playing') answering.current = false;
    if (phase === 'feedback') feedbackButton.current?.focus({ preventScroll: true });
    else heading.current?.focus({ preventScroll: true });
  }, [phase, team]);
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const color = colors.find(c => c.key === event.key);
      if (color) { event.preventDefault(); answer(color.name); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, question]);

  const scores = completed.map(score);
  if (mode === 'online') return <OnlineRoom onBack={() => setMode('solo')}/>;
  return <section className="clash-page">
    <Link className="text-link" to="/games">← Back to all games</Link>
    <div className="clash-heading"><div><span className="eyebrow">GAME 01 · QUICK THINKING</span><h1 ref={heading} tabIndex={-1}>Color Clash</h1></div><span className="clash-tag">Playable · On this device</span></div>
    <p className="clash-lead">Trust your eyes. Challenge your brain.</p>

    {phase === 'setup' && <div className="clash-layout">
      <div className="clash-panel"><span className="eyebrow">HOW TO PLAY</span><h2>Pick the ink.<br/>Ignore the word.</h2><div className="clash-example"><span style={{ color: colors[1].hex }}>RED</span><p>This word is printed in blue.<br/><strong>The correct answer is Blue.</strong></p></div><ol><li>Choose the color the word is printed in.</li><li>Answer {count} questions. Each correct answer earns 100 points.</li><li>Take your time, or challenge yourself to answer quickly.</li></ol><p className="clash-small">No timer or speed bonus. Color recognition is part of this game; enable the color cue for a text alternative.</p></div>
      <div className="clash-panel setup-panel"><h2>Make it your game.</h2><fieldset><legend>Who's playing?</legend><label className={mode==='solo'?'mode-card chosen':'mode-card'}><input type="radio" name="mode" value="solo" checked={mode==='solo'} onChange={()=>setMode('solo')}/><span><strong>Solo warm-up</strong><small>One player. A little brain exercise.</small></span></label><label className={mode==='teams'?'mode-card chosen':'mode-card'}><input type="radio" name="mode" value="teams" checked={mode==='teams'} onChange={()=>setMode('teams')}/><span><strong>Local Teams · Pass & play</strong><small>Team A plays, then hands the device to Team B.</small></span></label><label className="mode-card"><input type="radio" name="mode" value="online" checked={false} onChange={()=>setMode('online')}/><span><strong>Online Room</strong><small>Different devices. One shared round.</small></span></label></fieldset><label className="room-field">Questions<select value={count} onChange={e=>setCount(Number(e.target.value) as QuestionCount)}>{questionCounts.map(n=><option key={n} value={n}>{n} questions</option>)}</select></label><label className="cue-option"><input type="checkbox" checked={cue} onChange={e=>setCue(e.target.checked)}/><span><strong>Show a color cue</strong><small>Also show the ink color as text.</small></span></label><button className="button" onClick={start}>Let's play <span aria-hidden="true">→</span></button><p className="clash-small">Use the buttons or keys 1–4. Scores stay in this round and disappear when you leave or reload.</p></div>
    </div>}

    {phase === 'ready' && <div className="clash-panel clash-centered"><span className="ready-art" aria-hidden="true">◒</span><h2>{mode==='teams'?`Team ${team===0?'A':'B'}, you're up.`:'Ready to clash?'}</h2><p>{team===1?'Pass the device to Team B. You’ll play the same questions as Team A.':`${count} questions. Four colors. One rule: choose the ink color.`}</p><p className="clash-small">{mode==='teams'?'Keep the other team from watching for a fair turn. ':''}{cue?'Color cue is on.':'Color cue is off.'}</p><button className="button" onClick={()=>setPhase('playing')}>Start {mode==='teams'?'team turn':'round'} →</button><button className="clash-text-button" onClick={()=>setPhase('setup')}>Back to setup</button></div>}

    {(phase === 'playing' || phase === 'feedback') && <div className="clash-play">
      <div className="clash-stats"><span><small>PLAYING</small><strong>{currentName}</strong></span><span><small>QUESTION</small><strong>{phase==='feedback'?answers.length:answers.length+1} / {count}</strong></span><span><small>SCORE</small><strong>{score(answers)} pts</strong></span></div>
      <progress aria-label="Questions answered" max={count} value={answers.length}/>
      <div className="clash-panel question-panel"><p className="eyebrow">WHAT COLOR IS THE INK?</p><div className="clash-word" style={{color:colors.find(c=>c.name===(phase==='feedback'?previous:question)?.ink)?.hex}}>{(phase==='feedback'?previous:question)?.word.toUpperCase()}</div>{cue && <p className="color-cue">Ink color: {(phase==='feedback'?previous:question)?.ink}</p>}
        <div className="answer-grid">{colors.map(c=><button key={c.name} disabled={phase!=='playing'} onClick={()=>answer(c.name)} className="color-answer"><span className="color-dot" style={{background:c.hex}} aria-hidden="true"/><strong>{c.name}</strong><kbd>{c.key}</kbd></button>)}</div>
        {phase==='feedback' ? <div className={`answer-feedback ${answers.at(-1)?.correct?'correct':'incorrect'}`}><p role="status"><strong>{answers.at(-1)?.correct?'✓ Correct! +100 points':'Try the ink, not the word.'}</strong> The ink was {previous.ink}.</p><button ref={feedbackButton} className="button" onClick={next}>{answers.length===count?(mode==='teams'&&team===0?'Next team →':'See results →'):'Next question →'}</button></div> : <p className="clash-small answer-hint">Choose a labeled button or press 1, 2, 3, or 4.</p>}
      </div>
      <details className="end-round"><summary>Want to start over?</summary><p>This clears the current round's scores.</p><button className="clash-text-button" onClick={()=>{setAnswers([]);setCompleted([]);setPhase('setup');}}>End round and return to setup</button></details>
    </div>}

    {phase === 'results' && <div className="clash-panel clash-centered"><span className="ready-art" aria-hidden="true">✦</span><span className="eyebrow">ROUND COMPLETE</span><h2>{winner(scores)}</h2><p>{cue?'You played with the color cue on.':'A little focus goes a long way.'}</p><div className="round-results">{completed.map((turn,i)=><div key={i} className="result-tile"><h3>{mode==='solo'?'Your score':`Team ${i===0?'A':'B'}`}</h3><strong>{score(turn)}<small> / {(count * 100).toLocaleString()} pts</small></strong><p>{turn.filter(a=>a.correct).length} of {count} correct</p></div>)}</div><p className="clash-small">{mode==='teams'?'Shared-device results for this round only. ':''}New round, new questions?</p><div className="result-actions"><button className="button" onClick={start}>Play again ↻</button><button className="clash-text-button" onClick={()=>setPhase('setup')}>Change setup</button></div></div>}
  </section>;
}

