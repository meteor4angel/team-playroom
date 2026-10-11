import ExtraGame from './collection/ExtraGame';
import {isExtra} from './shared/collection';
import GuessMajority from './majority/GuessMajority';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { games, type Game } from './games';
import './styles.css';
import ColorClash from './colorClash/ColorClash';
import OnlineRoom from './rooms/OnlineRoom';
import Privacy from './Privacy';

function PageMeta() {
 const location = useLocation();
 useEffect(() => {
  const metaPath=location.pathname.replace('/games/planning-poker','/games/sprint-spotlight').replace('/games/collaborative-story','/games/collaborative-word-chain'); const game = games.find(g => metaPath === `/games/${g.slug}`);
  const title = game ? `${game.name} — Play now` : location.pathname.startsWith('/room/') ? 'Online Room' : location.pathname === '/' ? 'A little play. A closer team.' : location.pathname === '/games' ? 'Explore the games' : location.pathname === '/about' ? 'About' : location.pathname === '/privacy' ? 'Privacy' : 'Page not found';
  document.title = `${title} | Team Playroom by Metriva`;
  const description = game ? `${game.description} Play on this device or invite friends to an online room.` : 'Ten playful ways to connect with your team. Play the Team Playroom collection.';
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  window.scrollTo(0, 0);
  document.getElementById('main-content')?.focus({ preventScroll: true });
 }, [location.pathname]);
 return null;
}
function Header() {
 const [open,setOpen] = useState(false);
 const location = useLocation();
 useEffect(() => setOpen(false), [location.pathname]);
 return <header className="header"><Link className="brand" to="/" aria-label="Team Playroom by Metriva home"><span className="brand-mark" aria-hidden="true">✦</span><span className="brand-identity">team playroom<small>by Metriva</small></span><span className="version">v1.0001</span></Link><button className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={()=>setOpen(!open)}>Menu <span aria-hidden="true">☰</span></button><nav id="main-nav" aria-label="Main navigation" className={open?'nav open':'nav'}><NavLink to="/" end>Home</NavLink><NavLink to="/games">The games</NavLink><NavLink to="/about">About</NavLink><Link className="button small" to="/games">Explore games <span aria-hidden="true">↗</span></Link></nav></header>;
}
function Badge({ playable = false }: { playable?: boolean }) { return <span className="badge"><span aria-hidden="true">●</span> {playable ? 'Play now' : 'Coming soon'}</span>; }
function GameCard({game}: {game:Game}) { return <Link className="game-card" to={`/games/${game.slug}`}><div className={`card-art ${game.color}`}><span className="art-symbol" aria-hidden="true">{game.symbol}</span><Badge playable={true}/></div><div className="card-copy"><span className="eyebrow">{game.category}</span><h3>{game.name}<span aria-hidden="true">↗</span></h3><p>{game.description}</p></div></Link>; }
function Catalog({featured=false}:{featured?:boolean}) {
 const [filter,setFilter] = useState('All games');
 const [search,setSearch] = useState('');
 const shown = games.filter(g=>(filter==='All games'||g.category===filter)&&g.name.toLowerCase().includes(search.toLowerCase().trim()));
 return <section className="catalog" aria-labelledby="catalog-title"><div className="section-heading"><div><span className="eyebrow">THE PLAYLIST</span><h2 id="catalog-title">Find your team's next favorite.</h2></div><p>Different personalities. Different ways to play.<br/>Something to bring everyone a little closer.</p></div><div className="catalog-tools"><div className="filters" role="group" aria-label="Filter games">{['All games','Icebreakers','Team challenges','Sprint rituals'].map(f=><button key={f} aria-pressed={filter===f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><label className="search"><span className="sr-only">Search games</span><input type="search" placeholder="Search games…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div><p className="result-count" aria-live="polite">{shown.length} {shown.length===1?'game':'games'} to explore</p><div className="game-grid">{shown.map(g=><GameCard key={g.slug} game={g}/>)}</div>{shown.length===0&&<div className="empty"><h3>No games found</h3><p>Try another name or category.</p><button className="button" onClick={()=>{setSearch('');setFilter('All games');}}>Reset filters</button></div>}{featured&&<p className="catalog-note">All ten games are ready. Find a challenge, conversation, or sprint celebration for your team.</p>}</section>;
}
function Home() { return <><section className="hero"><div className="hero-copy"><span className="pill">✦ A METRIVA PRODUCT · MADE FOR TEAM CONNECTION</span><h1>A little play.<br/>A <span>closer team.</span></h1><p>Step out of the workday and into something fun. A collection of playful moments for the people you work with.</p><div className="hero-actions"><Link className="button" to="/games">Meet the games <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/about">What's Team Playroom? <span aria-hidden="true">→</span></Link></div><div className="hero-note"><span className="tiny-avatars" aria-hidden="true"><i>☺</i><i>☺</i><i>☺</i></span><span>Built for teams. Made for a little joy.</span></div></div><div className="play-art" role="img" aria-label="A playful collage of colorful game tiles, a smiling face, and a bingo grid"><div className="art-label">LESS SCROLLING. MORE SMILING.</div><div className="tile tile-purple">✦</div><div className="tile tile-yellow">☺</div><div className="tile tile-coral"><span>THIS<br/>OR THAT?</span><b>↔</b></div><div className="tile tile-blue">{Array.from({length:9},(_,i)=><i key={i}>{[1,4,6].includes(i)?'✦':''}</i>)}</div><span className="floating-sticker">Good teams<br/><strong>play together.</strong></span><span className="art-spark" aria-hidden="true">✳</span></div></section><div className="promise-strip"><span>10 games to play</span><span>Made for shared moments</span><span>A little break from business as usual</span></div><Catalog featured/><section className="closing"><span className="eyebrow">WORK BETTER. PLAY A LITTLE.</span><h2>Great teamwork starts<br/>with a real connection.</h2><p>We're building a space for that. This is just the beginning.</p><Link className="button" to="/about">Get to know the playroom ↗</Link><span className="closing-star" aria-hidden="true">✳</span></section></>; }
function GamePage() {
 const {slug} = useParams(); const game = games.find(g=>g.slug===slug);
 if(!game) return <NotFound/>;
 if(game.slug === 'color-clash') return <ColorClash/>;
 if(game.slug === 'guess-the-majority') return <GuessMajority/>;
 if(isExtra(game.slug))return <ExtraGame key={game.slug} game={game.slug}/>;
 return <NotFound/>;
}
function About() {return <article className="prose"><span className="eyebrow">HELLO, TEAM</span><h1>A space for<br/>the human side of work.</h1><p className="lead">Team Playroom is an collection of games designed around a simple idea: shared fun can make it easier to connect.</p><h2>Ten ways to take a break together</h2><p>From playful choices and visual puzzles to sprint celebrations, our collection makes room for different personalities and ways of joining in. Explore the catalog to see each game's concept.</p><h2>A Metriva product</h2><p>Team Playroom is part of Metriva, a multidisciplinary company spanning technology, creative work, and commerce. Metriva’s guiding idea is simple: Ideas into Impact.</p><h2>What Version 1.0001 includes</h2><p>All ten games are playable on this device or in Online Rooms. Solo options include practice and preview. Planning Poker supports facilitator-written stories, and Collaborative Story brings teammates together one sentence at a time. Local play shares one device, and Online Rooms connect teammates on their own devices.</p><p>Online rooms support nicknames, a shared start, and per-round results. There are no permanent accounts, historical leaderboards, or waiting lists. Rooms are available once the room service is connected.</p><Link className="button" to="/games">Explore the collection ↗</Link></article>;}
function NotFound() {return <section className="detail"><span className="error-number">404</span><h1>This one's outside<br/>the playroom.</h1><p>The page you requested doesn't exist. Let's get you back to the games.</p><Link className="button" to="/games">Find a game ↗</Link></section>;}
function App() { return <BrowserRouter><a className="skip-link" href="#main-content">Skip to content</a><Header/><PageMeta/><main id="main-content" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/games" element={<><section className="catalog-intro"><span className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</span><h1>Let the good<br/><span>games begin.</span></h1><p>Ten games. Shared moments. Choose a game and gather your people.</p></section><Catalog/></>}/><Route path="/games/planning-poker" element={<ExtraGame game="sprint-spotlight"/>}/><Route path="/games/collaborative-story" element={<ExtraGame game="collaborative-word-chain"/>}/><Route path="/games/:slug" element={<GamePage/>}/><Route path="/room/:code" element={<OnlineRoom/>}/><Route path="/about" element={<About/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="*" element={<NotFound/>}/></Routes></main><footer><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">✦</span>team playroom</Link><p>Team Playroom by <strong>Metriva</strong>.<br/>Ideas into Impact.</p><nav aria-label="Footer navigation"><Link to="/games">Games</Link><Link to="/about">About</Link><Link to="/privacy">Privacy</Link></nav><small>Version 1.0001 · A work in play.</small></footer></BrowserRouter>; }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);





