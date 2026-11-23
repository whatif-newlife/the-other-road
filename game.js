/* 그때 그 갈림길 — game logic. Story data: content*.js. Interface text: ui.js. */

/* ============ helpers ============ */
const $ = (s, el=document) => el.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const shuffle = arr => { const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
function lastHangul(w){ w=(w||"").trim().replace(/[\s'"’」)]+$/,""); return w.slice(-1).charCodeAt(0); }
function hasBatchim(w){ const c=lastHangul(w); if(c>=0xAC00&&c<=0xD7A3) return (c-0xAC00)%28!==0; return /[0136789]$/.test((w||"").trim()); }
const JOSA = [["을","를"],["이","가"],["은","는"],["과","와"],["으로","로"],["아","야"],["이다","다"],["이라면","라면"]];
function josa(w, j){
  if (LANG !== "ko") return w;
  const p = JOSA.find(x=>x.includes(j)); if(!p) return w+j;
  if(p[0]==="으로"){ const c=lastHangul(w); const rieul = c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28===8; return w+(hasBatchim(w)&&!rieul?"으로":"로"); }
  return w+(hasBatchim(w)?p[0]:p[1]);
}

/* ============ language ============ */
const LANGS = ["ko","en","ja","zh"];
const LANG_KEY = "crossroads-lang";
function detectLang(){
  try { const s = localStorage.getItem(LANG_KEY); if (LANGS.includes(s)) return s; } catch(e){}
  const n = (navigator.language || "en").toLowerCase();
  return n.startsWith("ko") ? "ko" : n.startsWith("ja") ? "ja" : n.startsWith("zh") ? "zh" : "ko";
}
let LANG = detectLang();
/* visitor stats: only active on the standalone site where the GoatCounter script is loaded */
function track(name){ try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({path:"event/"+name, title:name, event:true}); } catch(e){} }
function t(key, vars){
  let s = (UI[LANG] && UI[LANG][key]) ?? UI.ko[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m,k) => vars[k] != null ? vars[k] : m);
  return s;
}
const contentFile = l => l === "ko" ? "content.js" : `content.${l}.js`;
function loadContent(l){
  return new Promise((res, rej) => { const s = document.createElement("script"); s.src = contentFile(l); s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
async function setLang(l){
  try { await loadContent(l); LANG = l; } catch(e){ return; }
  try { localStorage.setItem(LANG_KEY, l); } catch(e){}
  document.documentElement.lang = l;
  rerender();
}

const STAT_KEYS = ["h","b","m","r","s"];
const statName = k => t("st_"+k);
const THIS_YEAR = new Date().getFullYear();
const SCENES_PER_STATION = 4, STATIONS = 7, QUICK_STATIONS = 3, QUICK_SPS = 3, QUICK_MULT = 2.2;

/* ============ save (this browser only, no sign-up) ============ */
const SAVE_KEY = "crossroads-save-v2";
const KO_TRAIT = {"끈기 있는":"grit","낙천적인":"optimist","사교적인":"social","신중한":"careful","모험적인":"adventurous","섬세한":"delicate","체력 좋은":"strong","예민한":"sensitive","계획적인":"planner","즉흥적인":"spontaneous"};
const KO_VALUE = {"돈과 안정":"money","인정과 성취":"achieve","가족과 사람":"people","건강한 삶":"health","자유와 즐거움":"freedom"};
let storageOK = true;
function blankSave(){ return {v:2, char:null, xp:0, lives:[], crossroads:[], endings:{}, achievements:[], current:null}; }
function migrate(o){
  const c = o.char;
  if (c) {
    c.traits = (c.traits||[]).map(x => KO_TRAIT[x] || x);
    c.value = KO_VALUE[c.value] || c.value || "achieve";
    if (!c.look) c.look = {skin:0, hair:0, hairColor:0, shirt:c.color || COLORS[0]};
  }
  return o;
}
function loadSave(){
  try {
    localStorage.setItem("__probe","1"); localStorage.removeItem("__probe");
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return migrate({...blankSave(), ...JSON.parse(raw)});
  } catch(e){ storageOK = false; }
  return blankSave();
}
function persist(){
  if (S) SAVE.current = {...S, flags:[...S.flags], used:[...S.used]};
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch(e){ storageOK = false; }
}
function exportCode(){ return "GG2." + btoa(unescape(encodeURIComponent(JSON.stringify({...SAVE, current:null})))); }
function importCode(code){
  const o = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^GG2\./,"")))));
  if (!o || o.v !== 2 || !o.char) throw new Error("bad");
  SAVE = migrate({...blankSave(), ...o, current:null}); S = null; persist();
}

/* ============ character look ============ */
const COLORS = ["#0B8A69","#2F6FD6","#C2453A","#8A55C9","#C27A0E","#1E8FA6","#B8457E","#4F7A2A","#2F3540"];
const SKINS = ["#F6D7BE","#E8B894","#C68B62","#8D5A3B"];
const HAIRC = ["#2B2321","#5A3A26","#A0672E","#D9B26A","#8E8E99"];
const HAIRS = [0,1,2,3,4];
const INK = "#2A2522";

function avatar(look, opt={}){
  const L = look || {skin:0,hair:0,hairColor:0,shirt:COLORS[0]};
  const skin = SKINS[L.skin] || SKINS[0], hc = HAIRC[L.hairColor] || HAIRC[0], shirt = L.shirt || COLORS[0];
  const o = opt.outfit || "", mood = opt.mood || "happy", size = opt.size || 64;
  const mouth = mood==="happy" ? "M44 54 Q50 60.5 56 54" : mood==="ok" ? "M45 55.5 Q50 58.5 55 55.5" : "M45 57.5 Q50 54 55 57.5";
  const hatCovers = o==="culinary" || o==="abroad" || o==="arts";
  let back = "", top = "", body = "", extra = "";
  if (L.hair===1) back = `<path d="M27 44 C27 19 73 19 73 44 L76 75 C66 80 34 80 24 75Z" fill="${hc}"/>`;
  if (L.hair===3) top = [[31,37,8],[38,27,9],[50,23,10],[62,27,9],[69,37,8]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}"/>`).join("");
  else if (L.hair===4) top = /* 가르마펌: only a narrow slit of forehead shows at the parting; the rest of the fringe falls to the brows and flows softly outward */
    `<path d="M25.5 50 C22 32 31 12.5 50 12 C69 12.5 78 32 74.5 50 C73.8 47.5 73 46.5 72 45 C69.5 40.5 65 39.5 60 37.5 C55.5 35 53 31 51.5 26 C49.5 31 47.5 35 43 37.5 C38 39.5 33 40 30 44 C28.4 46 27 48 25.5 50Z" fill="${hc}"/>` +
    `<path d="M44 16 C38 20 34 27 33.5 35 M58 15.5 C64 19 68 26 68.5 34 M48.5 14 C45.5 19 45 25 46 31 M55 14.5 C57.5 19.5 58 25 57 31" stroke="#000" stroke-opacity=".25" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  else top = `<path d="M27 44 C25 13 75 13 73 44 C66 32 58 29 50 30 C42 29 34 32 27 44Z" fill="${hc}"/>` + (L.hair===2 ? `<circle cx="50" cy="17" r="9" fill="${hc}"/>` : "");
  if (hatCovers && L.hair===4) top = `<path d="M26 50 C25.5 41 27.5 35 31.5 32.5 L49.5 32.5 C48.8 34.5 47 36.2 43 37.5 C38 39.5 33 40 30 44 C28.4 46 27 48 26 50Z" fill="${hc}"/><path d="M53.5 32.5 L68.5 32.5 C72.5 35 75 41 74.5 50 C73.8 47.5 73 46.5 72 45 C69.5 40.5 65 39.5 60 37.5 C56 36 54.2 34.5 53.5 32.5Z" fill="${hc}"/>`;
  else if (hatCovers) top = L.hair===3 ? `<circle cx="31" cy="38" r="7" fill="${hc}"/><circle cx="69" cy="38" r="7" fill="${hc}"/>` : `<path d="M27.5 43 C27 34 31 31 36 31 L64 31 C69 31 73 34 72.5 43 C66 36 58 34 50 34 C42 34 34 36 27.5 43Z" fill="${hc}"/>`;
  const shirtFill = o==="culinary" ? "#FAFAF7" : shirt;
  body = `<path d="M19 100 C19 78 33 69 50 69 C67 69 81 78 81 100Z" fill="${shirtFill}" stroke="${o==="culinary"?"#D5D9D0":"none"}" stroke-width="1.5"/>`;
  switch (o) {
    case "culinary":
      body += `<path d="M44 69 L56 69 L50 78Z" fill="${shirt}"/>` + [[44,84],[44,92],[56,84],[56,92]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.7" fill="#8A8F98"/>`).join("");
      extra = `<g stroke="#D5D9D0" stroke-width="1.2"><rect x="35" y="19" width="30" height="13" rx="2.5" fill="#FFFFFF"/><circle cx="38" cy="18" r="9" fill="#FFFFFF"/><circle cx="50" cy="12" r="10.5" fill="#FFFFFF"/><circle cx="62" cy="18" r="9" fill="#FFFFFF"/></g><rect x="35.8" y="20" width="28.4" height="6" fill="#FFFFFF"/>`;
      break;
    case "arts":
      extra = `<ellipse cx="45" cy="25" rx="23" ry="7.5" fill="#3A3F58"/><circle cx="45" cy="16.5" r="2.6" fill="#3A3F58"/>`;
      body += `<ellipse cx="73" cy="89" rx="11" ry="7.5" fill="#E9D9B8"/><circle cx="68" cy="87" r="2" fill="#C2453A"/><circle cx="73" cy="85" r="2" fill="#2F6FD6"/><circle cx="78" cy="88" r="2" fill="#E9A81D"/><circle cx="72" cy="92" r="1.6" fill="#FFFFFF"/>`;
      break;
    case "sports":
      extra = `<rect x="27.5" y="32" width="45" height="5.5" rx="2.5" fill="#F2C04E"/>`;
      body += `<text x="50" y="94" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">7</text>`;
      break;
    case "abroad":
      body += `<path d="M37 72 L35 100 M63 72 L65 100" stroke="#7A5230" stroke-width="4.5" stroke-linecap="round"/>`;
      extra = `<path d="M33 27 C33 12 67 12 67 27Z" fill="#D9B26A"/><ellipse cx="50" cy="27" rx="28" ry="5.5" fill="#C9A15A"/>`;
      break;
    case "business":
      body += `<path d="M41 69 L50 82 L59 69Z" fill="#FFFFFF"/><path d="M48 74 L52 74 L54.5 92 L50 97 L45.5 92Z" fill="#C2453A"/>`;
      break;
    case "work":
      body += `<path d="M42 70 L50 86 L58 70" stroke="#2F6FD6" stroke-width="2.6" fill="none"/><rect x="44.5" y="85" width="11" height="13" rx="1.8" fill="#FFFFFF" stroke="#2F6FD6" stroke-width="1.5"/><rect x="47" y="89" width="6" height="1.6" fill="#2F6FD6"/>`;
      break;
    case "academic":
      extra = `<g stroke="${INK}" stroke-width="1.8" fill="none"><circle cx="42" cy="46" r="6.2"/><circle cx="58" cy="46" r="6.2"/><path d="M48.2 46 L51.8 46"/></g>`;
      body += `<rect x="61" y="80" width="17" height="13" rx="1.5" fill="#2F6FD6"/><path d="M64 84 H75 M64 88 H72" stroke="#FFFFFF" stroke-width="1.4"/>`;
      break;
    case "love":
      extra = `<path d="M78 15 C78 10 85 10 85 15 C85 20 78 24 78 24 C78 24 71 20 71 15 C71 10 78 10 78 15Z" fill="#E2576B"/>`;
      break;
    case "generic":
      body += `<path d="M37 67 Q50 76 63 67 L63 73 Q50 82 37 73Z" fill="#E9A81D"/>`;
      break;
  }
  const sparkle = opt.sparkle ? `<path d="M14 24 L16 30 L22 32 L16 34 L14 40 L12 34 L6 32 L12 30Z" fill="#F2C04E"/><path d="M86 52 L87.4 56 L91.5 57.5 L87.4 59 L86 63 L84.6 59 L80.5 57.5 L84.6 56Z" fill="#F2C04E"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="ava" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${sparkle}${back}${body}<rect x="44" y="59" width="12" height="13" fill="${skin}"/><circle cx="28" cy="47" r="4.5" fill="${skin}"/><circle cx="72" cy="47" r="4.5" fill="${skin}"/><circle cx="50" cy="44" r="22" fill="${skin}"/>${top}<circle cx="42" cy="46" r="2.7" fill="${INK}"/><circle cx="58" cy="46" r="2.7" fill="${INK}"/><circle cx="36.5" cy="53" r="3.6" fill="#FF8A8A" opacity=".35"/><circle cx="63.5" cy="53" r="3.6" fill="#FF8A8A" opacity=".35"/><path d="${mouth}" stroke="${INK}" stroke-width="2.1" fill="none" stroke-linecap="round"/>${extra}</svg>`;
}
const moodOf = h => h>=60 ? "happy" : h>=35 ? "ok" : "tired";

/* ============ levels, perks, achievements ============ */
const charAge = () => SAVE.char && SAVE.char.age ? SAVE.char.age + (THIS_YEAR - SAVE.char.year) : null;
const birthYear = () => (S && S.by) || (SAVE.char.year - SAVE.char.age);
const myName = () => (SAVE.char && SAVE.char.name) || t("meName");
function autoChar(){ SAVE.char = {name:"", look:{skin:Math.floor(Math.random()*SKINS.length), hair:pick(HAIRS), hairColor:Math.floor(Math.random()*3), shirt:pick(COLORS)}, traits:[], value:"achieve", age:null, year:THIS_YEAR, createdAt:Date.now()}; persist(); }
const LEVELS = [0,150,400,750,1200,1800,2600,3600,4800,6200];
function levelOf(xp){ let l=1; LEVELS.forEach((x,i)=>{ if(xp>=x) l=i+1; }); return l; }
const PERKS = [2,3,4,5,6];
const hasPerk = lv => levelOf(SAVE.xp) >= lv;
const rewindMax = () => hasPerk(5) ? 2 : hasPerk(2) ? 1 : 0;
const maxTraits = () => hasPerk(4) ? 4 : 3;
const totalEndings = () => Object.values(ENDINGS).reduce((n,l)=>n+l.length,0);
const foundEndings = () => Object.values(SAVE.endings).reduce((n,l)=>n+l.length,0);
const ACH = [
  {id:"first", c:()=>SAVE.lives.length>=1}, {id:"three", c:()=>SAVE.lives.length>=3}, {id:"ten", c:()=>SAVE.lives.length>=10},
  {id:"coll5", c:()=>foundEndings()>=5}, {id:"fullset", c:()=>Object.keys(SAVE.endings).some(k=>ENDINGS[k] && SAVE.endings[k].length>=ENDINGS[k].length)},
  {id:"lucky", c:(S)=>S && S.maxWin>=3}, {id:"unlucky", c:(S)=>S && S.maxLose>=3}, {id:"happy", c:(S,r)=>r && r.sat>=85},
  {id:"balanced", c:(S)=>S && STAT_KEYS.every(k=>S.stats[k]>=60)}, {id:"bottom", c:(S)=>S && S.minM<=10},
  {id:"family", c:(S)=>S && S.flags.has("family")}, {id:"global", c:(S)=>S && S.flags.has("abroad")}, {id:"boss", c:(S)=>S && S.flags.has("own")},
  {id:"star", c:(S)=>S && S.flags.has("media")}, {id:"pure", c:(S,r)=>S && r && S.rewinds===0 && r.sat>=70},
  {id:"explorer", c:()=>new Set(SAVE.lives.map(l=>l.domain)).size>=3},
];

/* ============ game state ============ */
let SAVE;
let S = null;
let sampleFn = null;
let engine = "basic", quick = true;
let lobbyTab = "lives";
let pending = null;        // choice tapped but not yet confirmed
let view = {name:"create"};

function phaseOf(age){ return age<20?"teen":age<=25?"early":age<=31?"late":age<=39?"thirty":"mid"; }
const phaseLabel = age => t("ph_"+phaseOf(age));

function fill(str){
  if (!str) return str;
  const d = DOMAINS[S.domain], c = S.cross;
  const sit = (c.situation || "").replace(/\s+/g, " ").trim();
  const map = {field:d.field, place:d.place, mentor:d.mentor, untaken:c.untaken, taken:c.taken, name:myName(),
               situation: sit.length > 90 ? sit.slice(0, 88) + "…" : sit, years: Math.max(1, (S.ages[S.si]||c.forkAge) - c.forkAge), forkAge: c.forkAge,
               friend:S.npc.friend, rival:S.npc.rival, lover:S.npc.lover, mentorName:S.npc.mentorName};
  return str.replace(/\{ro\}/g, () => LANG==="ko" ? josa(d.field,"으로").slice(d.field.length) : "")
            .replace(/\{(\w+)\}\{:([^}]+)\}/g, (m,k,j) => map[k]!=null ? josa(map[k], j) : m)
            .replace(/\{(\w+)(?::([^}]+))?\}/g, (m,k,j) => { const v = map[k]; if (v==null) return m; return j ? josa(v,j) : v; });
}

function newLife(cross){
  const domain = detectDomain(cross);
  const stats = {h:50,b:55,m:45,r:50,s:40}; let luck = hasPerk(6) ? 5 : 0;
  SAVE.char.traits.forEach(id => { const e = TRAITS[id]||{}; for (const k in e) { if (k==="luck") luck+=e[k]; else stats[k]+=e[k]; } });
  for (const k of STAT_KEYS) stats[k] = clamp(Math.round(stats[k] + rnd(-6,6)), 5, 95);
  const nowAge = cross.nowAge || charAge() || cross.forkAge + 14;
  const endAge = Math.max(nowAge, cross.forkAge + 9), span = endAge - cross.forkAge;
  const nSt = quick ? QUICK_STATIONS : STATIONS, sps = quick ? QUICK_SPS : SCENES_PER_STATION;
  const ages = [cross.forkAge];
  for (let i=1;i<=nSt;i++) ages.push(Math.round(cross.forkAge + span*i/nSt));
  const names = shuffle(NAMES);
  S = {id:uid(), by:THIS_YEAR - nowAge, cross, domain, stats, luck, flags:new Set(), used:new Set(), ages, endAge, si:0, queue:[], qi:0,
       sceneNo:1, total:1 + nSt*sps, quick, sps, scene:null, chosen:null, log:[], focus:null, fatePending:false,
       rewinds:0, streakW:0, streakL:0, maxWin:0, maxLose:0, minM:stats.m, engine, aiFailed:false, aiError:null,
       npc:{friend:names[0], rival:names[1], lover:names[2], mentorName:pick(SURNAMES)}, startedAt:Date.now()};
  S.scene = firstScene(); pending = null;
  track(quick ? "start-quick" : "start-full");
  persist();
}
function restoreCurrent(){
  const c = SAVE.current; if (!c) return false;
  S = {...c, flags:new Set(c.flags), used:new Set(c.used)}; pending = null;
  return true;
}

/* ============ scenes ============ */
function firstScene(){
  const c = S.cross, name = myName(), F = FIRSTS[S.domain] || FIRSTS.generic;
  return {kind:"cross", title:t("firstTitle"), fate:null,
    text:t("firstText", {age:c.forkAge, sit:c.situation ? c.situation.trim()+"\n\n" : "", taken:c.taken, untaken:c.untaken, name,
      nameTopic: LANG==="ko" ? name+(hasBatchim(name)?"은":"는") : name, untakenObj: josa("'"+c.untaken+"'","을")}) + "\n\n" + fill(F.text),
    ch: shuffle([...shuffle(prepChoices(F.ch)).slice(0,2), pick([{t:t("f1"), e:{h:8,s:2}, x:t("f1x")}, {t:t("f2"), e:{s:5,m:3}, x:t("f2x")}, {t:t("f3"), e:{s:6,r:-6,h:2}, f:"stubborn", x:t("f3x")}])])};
}
function buildQueue(si){
  const by = birthYear(), year = by + S.ages[si], prev = by + S.ages[si-1];
  const q = [{k:"path"}];
  const sps = S.sps || SCENES_PER_STATION;
  if ((S.quick ? si === 2 : (si === 3 || si === 6)) && CALLBACKS.some((cb,i) => !S.used.has("cb"+i))) q.push({k:"callback"});
  q.push({k:"main"});
  const era = ERAS.find(e => e.y>prev && e.y<=year && e.y<=THIS_YEAR && !S.used.has("era"+e.y));
  if (era) { q.push({k:"era", y:era.y}); S.used.add("era"+era.y); }
  const fus = FOLLOWS.map((f,i)=>({f,i})).filter(({f,i}) => S.flags.has(f.need) && !(f.not && S.flags.has(f.not)) && !S.used.has("f"+i));
  if (fus.length && Math.random() < 0.85) { const {i} = pick(fus); q.push({k:"follow", i}); S.used.add("f"+i); }
  while (q.length < sps) q.push({k: Math.random()<0.4 ? "main" : "daily"});
  if (S.quick) return shuffle(q.slice(0, sps));
  return [{k:"plan"}, ...shuffle(q.slice(0, sps-1))];
}
const one = v => Array.isArray(v) ? pick(v) : v;
function prepChoices(list){
  return list.map(c => ({...c, t:fill(c.t), x:c.x && fill(one(c.x)),
    r: c.r && {...c.r, win:{...c.r.win, x:fill(one(c.r.win.x))}, lose:{...c.r.lose, x:fill(one(c.r.lose.x))}}}));
}
function pathScene(age){
  const ph = phaseOf(age);
  let pool = PATH_EVENTS.map((ev,i)=>({ev,i})).filter(({ev,i}) => !S.used.has("p"+i) && ev.ph.includes(ph));
  if (!pool.length) pool = PATH_EVENTS.map((ev,i)=>({ev,i})).filter(({i}) => !S.used.has("p"+i));
  if (!pool.length) return null;
  const {ev, i} = pick(pool); S.used.add("p"+i);
  return {kind:"path", title:fill(ev.title), text:fill(ev.text), ch:prepChoices(ev.ch)};
}
function callbackScene(){
  const pool = CALLBACKS.map((cb,i)=>({cb,i})).filter(({i}) => !S.used.has("cb"+i));
  if (!pool.length) return null;
  const {cb, i} = pick(pool); S.used.add("cb"+i);
  return {kind:"callback", title:fill(cb.title), text:fill((S.cross.situation||"").trim() ? cb.textS : cb.text), ch:prepChoices(cb.ch)};
}
function planScene(age){
  const st = S.stats, yrs = Math.max(1, age - S.cross.forkAge);
  const lowest = STAT_KEYS.slice().sort((a,b) => st[a]-st[b])[0], highest = STAT_KEYS.slice().sort((a,b) => st[b]-st[a])[0];
  const key = st[lowest] < 32 && PLAN_TXT[lowest+"_lo"] ? lowest+"_lo" : st[highest] > 68 && PLAN_TXT[highest+"_hi"] ? highest+"_hi" : "mid";
  const ch = PLANS.map((p,i) => Math.random() < 0.5 ? {...p} : prepChoices([PLANS_PATH[i]])[0]);
  return {kind:"plan", title:t("ageN",{n:age}) + " · " + fill(PLAN_TXT.title), text:fill(PLAN_TXT[key]) + " " + fill(PLAN_TXT.ask), ch, yrs};
}
function addWildcard(sc){
  if (!sc || !sc.ch) return sc;
  if (sc.ch.length >= 3 && Math.random() > 0.25) return sc;
  let pool = WILDCARDS.map((w,i)=>({w,i})).filter(({i}) => !S.used.has("w"+i));
  if (!pool.length) { WILDCARDS.forEach((w,i) => S.used.delete("w"+i)); pool = WILDCARDS.map((w,i)=>({w,i})); }
  const {w, i} = pick(pool); S.used.add("w"+i);
  sc.ch = [...sc.ch, prepChoices([w])[0]];
  return sc;
}
function basicMain(age){
  const ph = phaseOf(age);
  const pool = EVENTS.map((ev,i)=>({ev,i})).filter(({ev,i}) => ev.ph.includes(ph) && !S.used.has("e"+i) && (!ev.dom || ev.dom===S.domain) && (!ev.cond || ev.cond(S)));
  if (!pool.length) return null;
  const weighted = []; pool.forEach(p => { for (let k=0;k<(p.ev.dom?4:1);k++) weighted.push(p); });
  const {ev, i} = pick(weighted); S.used.add("e"+i);
  return {kind:"event", title:fill(ev.title), text:fill(ev.text), ch:prepChoices(ev.ch)};
}
function basicDaily(){
  let pool = DAILY.map((d,i)=>({d,i})).filter(({i}) => !S.used.has("d"+i));
  if (!pool.length) { DAILY.forEach((d,i) => S.used.delete("d"+i)); pool = DAILY.map((d,i)=>({d,i})); }
  const {d, i} = pick(pool); S.used.add("d"+i);
  return {kind:"daily", title:fill(d.title), text:fill(d.text), ch:prepChoices(d.ch)};
}
async function makeScene(spec){
  const age = S.ages[S.si];
  let sc;
  if (spec.k === "plan") sc = planScene(age);
  else if (spec.k === "path") sc = pathScene(age) || basicMain(age) || basicDaily();
  else if (spec.k === "callback") sc = callbackScene() || pathScene(age) || basicDaily();
  else if (spec.k === "era") { const e = ERAS.find(x => x.y === spec.y); sc = {kind:"year:"+e.y, title:e.title, text:fill(e.text), ch:prepChoices(e.ch)}; }
  else if (spec.k === "follow") { const f = FOLLOWS[spec.i]; sc = {kind:"follow", title:fill(f.title), text:fill(f.text), ch:prepChoices(f.ch)}; }
  else if (spec.k === "main") {
    if (S.engine === "ai" && sampleFn && !S.aiFailed) {
      renderThinking(t("thinkScene",{age}));
      try { sc = await aiScene(age); } catch(e) { S.aiFailed = true; S.aiError = e && e.code; }
    }
    if (!sc) { sc = basicMain(age) || basicDaily(); sc.lead = true; }
  } else { sc = basicDaily(); sc.lead = true; }
  if (sc.lead && Math.random() < 0.6) sc.text = fill(pick(LEADS[phaseOf(age)])) + " " + sc.text;
  delete sc.lead;
  if (spec.k !== "plan") addWildcard(sc);
  sc.fate = null;
  if (spec.k !== "plan" && S.fatePending) { S.fatePending = false; sc.fate = pick(FATES); sc.fateDelta = applyEffects(sc.fate.e); }
  return sc;
}
async function advance(){
  if (S.qi >= S.queue.length) {
    S.si++;
    if (S.si >= S.ages.length) return finish();
    S.queue = buildQueue(S.si); S.qi = 0; S.focus = null; S.fatePending = Math.random() < 0.6;
  }
  const spec = S.queue[S.qi++];
  S.sceneNo++;
  S.scene = await makeScene(spec);
  S.chosen = null; pending = null;
  persist(); renderScene();
}
function chanceOf(r){
  const base = r.st==="luck" ? 50 + S.luck : S.stats[r.st];
  const focus = S.focus && S.focus === r.st ? 0.1 : 0;
  return clamp(0.45 + (base-50)/90 + S.luck/100 - (r.d||0)/100 + focus, 0.12, 0.9);
}
function applyEffects(e, mult){
  const out = {}, m = mult || 1;
  for (const k in (e||{})) { if (!STAT_KEYS.includes(k)) continue; const before = S.stats[k]; S.stats[k] = clamp(Math.round(before + e[k]*m), 0, 100); out[k] = S.stats[k]-before; }
  S.minM = Math.min(S.minM, S.stats.m);
  return out;
}
function choose(i){
  const c = S.scene.ch[i];
  const snap = JSON.stringify({stats:S.stats, flags:[...S.flags], log:S.log.length, streakW:S.streakW, streakL:S.streakL, maxWin:S.maxWin, maxLose:S.maxLose, minM:S.minM, focus:S.focus});
  let res;
  if (c.r) {
    const p = chanceOf(c.r), win = Math.random() < p, out = win ? c.r.win : c.r.lose;
    const delta = applyEffects(out.e, S.quick ? QUICK_MULT : 1); if (out.f) S.flags.add(out.f);
    if (win) { S.streakW++; S.streakL=0; } else { S.streakL++; S.streakW=0; }
    S.maxWin = Math.max(S.maxWin, S.streakW); S.maxLose = Math.max(S.maxLose, S.streakL);
    res = {text:out.x||"", bad:!win, p:Math.round(p*100), win, delta};
  } else {
    const delta = applyEffects(c.e, S.quick ? QUICK_MULT : 1); if (c.f) S.flags.add(c.f);
    if (c.focus) S.focus = c.focus;
    res = {text:c.x||"", bad:false, delta};
  }
  const tr = SAVE.char.traits.filter(x => TRAIT_FLAVOR[x]);
  if (tr.length && S.scene.kind !== "plan" && Math.random() < 0.35) res.text = (res.text ? res.text + " " : "") + fill(TRAIT_FLAVOR[pick(tr)][res.bad ? "lose" : "win"]);
  S.log.push({a:S.ages[S.si], t:S.scene.title, k:S.scene.kind, c:c.t, w:c.r ? (res.win?1:0) : null, n:res.text});
  S.chosen = {i, res, snap}; pending = null;
  persist(); renderScene();
}
function rewind(){
  const o = JSON.parse(S.chosen.snap);
  S.stats = o.stats; S.flags = new Set(o.flags); S.log.length = o.log; S.streakW=o.streakW; S.streakL=o.streakL; S.maxWin=o.maxWin; S.maxLose=o.maxLose; S.minM=o.minM; S.focus=o.focus;
  S.rewinds++; S.chosen = null; pending = null; persist(); renderScene();
}

/* ============ endings ============ */
function scoreEndings(){
  const st = S.stats;
  return ENDINGS[S.domain].map((en, idx) => {
    let sc;
    if (en.pivot) sc = (55 - st.s)*1.6 + (S.flags.has("pivot")?35:0) + (S.flags.has("doubt")?15:0);
    else { sc = 0; for (const k in en.w) sc += en.w[k]*st[k]; for (const k in (en.need||{})) if (st[k] < en.need[k]) sc -= 999; }
    for (const k in (en.bonus||{})) if (S.flags.has(k)) sc += en.bonus[k];
    return {en, idx, sc: sc + rnd(0, 30)};
  }).sort((a,b) => b.sc-a.sc);
}
function lifeLines(st, flags){
  const lv = v => v>=70 ? "hi" : v>=42 ? "mid" : "lo";
  const L = [t("ls_"+lv(st.s)), t("lr_"+lv(st.r)), t("lm_"+lv(st.m)), t("lb_"+(st.b>=65?"hi":st.b>=40?"mid":"lo"))];
  if (flags.includes("child")) L.push(t("l_child")); else if (flags.includes("family")||flags.includes("partner")) L.push(t("l_partner"));
  return L;
}
function goodLines(st, taken){
  const weak = STAT_KEYS.slice().sort((a,b) => st[a]-st[b]).slice(0,2);
  return weak.map(k => t("good_"+k, {taken}));
}
function satisfaction(st){ const vk = VALUES[SAVE.char.value] || "h"; return Math.round(st.h*0.55 + st[vk]*0.45); }
const epilogue = (sat, taken) => t(sat>=70 ? "epiHigh" : sat>=45 ? "epiMid" : "epiLow", {taken});

async function finish(){
  track(S.quick ? "finish-quick" : "finish-full");
  const top = scoreEndings()[0];
  let job = fill(top.en.job), desc = fill(top.en.d), letter = "", ai = false;
  if (S.engine === "ai" && sampleFn && !S.aiFailed) {
    renderThinking(t("thinkEnd",{age:S.endAge}));
    try { const a = await aiEnding(job); job = a.job; desc = a.desc; letter = a.letter; ai = true; }
    catch(e){ S.aiFailed = true; S.aiError = e && e.code; }
  }
  const sat = satisfaction(S.stats);
  const found = SAVE.endings[S.domain] || (SAVE.endings[S.domain] = []);
  const newEnding = !found.includes(top.idx); if (newEnding) found.push(top.idx);
  const rec = {id:S.id, date:Date.now(), cross:S.cross, domain:S.domain, job, type:fill(top.en.job), desc, letter, ai,
               stats:{...S.stats}, flags:[...S.flags], sat, log:S.log, endAge:S.endAge, minutes:Math.max(1, Math.round((Date.now()-S.startedAt)/60000))};
  const lvBefore = levelOf(SAVE.xp), xp = 60 + Math.round(sat/2) + (newEnding?40:0);
  SAVE.xp += xp; SAVE.lives.unshift(rec);
  const newAch = ACH.filter(a => !SAVE.achievements.includes(a.id) && a.c(S, rec)).map(a => a.id);
  SAVE.achievements.push(...newAch); SAVE.xp += newAch.length * 20;
  const lvAfter = levelOf(SAVE.xp);
  rec.gain = {xp: xp + newAch.length*20, newEnding, newAch, perks: PERKS.filter(lv => lv>lvBefore && lv<=lvAfter), lvAfter, lvBefore};
  SAVE.current = null; S = null;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch(e){ storageOK = false; }
  renderLife(rec, true);
}

/* ============ Claude storyteller ============ */
const SEEDS = ["예상치 못한 만남","뼈아픈 실패","돈 문제","건강 문제","가족 문제","갑작스러운 기회","경쟁자의 등장","시대와 업계의 변화","인정받는 순간","이별","사고나 우연","오래된 꿈의 재등장"];
const outLang = () => `모든 출력(JSON의 값)은 반드시 ${UI[LANG].langName}로 작성하세요.`;
function profileText(){
  const c = S.cross, ch = SAVE.char;
  return `- 이름: ${myName()}\n- 지금 나이: ${S.endAge}살 (${birthYear()}년생)\n- 갈림길: ${c.forkAge}살\n- 당시 상황: ${c.situation||"(없음)"}\n- 실제로 한 선택: ${c.taken}\n- 이번에 체험할 선택(가지 않은 길): ${c.untaken}\n- 성격: ${ch.traits.map(x=>TRAIT_NAMES[x]).join(", ")||"(없음)"}\n- 중요하게 여기는 것: ${VALUE_NAMES[ch.value]}\n- 주변 인물: 친구 ${S.npc.friend}, 라이벌 ${S.npc.rival}, 인연 ${S.npc.lover}, 스승 ${S.npc.mentorName}`;
}
const historyText = () => S.log.slice(-14).map(l => `${l.a}살 「${l.t}」 → ${l.c}${l.w!=null?` (${l.w?"성공":"실패"})`:""}`).join("\n") || "(아직 없음)";
const statsText = () => STAT_KEYS.map(k => `${UI.ko["st_"+k]} ${S.stats[k]}`).join(", ");

async function aiScene(age){
  const prompt = `당신은 인생 시뮬레이션 게임 "그때 그 갈림길"의 이야기꾼입니다. 플레이어가 과거에 하지 않았던 선택을 했다면 어떤 삶을 살았을지 한 장면씩 보여줍니다.

[플레이어]
${profileText()}

[최근의 삶]
${historyText()}

[현재 상태 (0~100)] ${statsText()}

[이번 장면]
- 나이: ${age}살 (${birthYear()+age}년, ${UI.ko["ph_"+phaseOf(age)]}), 전체 ${S.total}장면 중 ${S.sceneNo}번째
- 반드시 담을 소재: ${pick(SEEDS)}

[규칙]
- 2인칭 "당신"으로, 플레이어가 사는 사회와 그 연도에 맞게 구체적으로 씁니다. 주변 인물을 자연스럽게 등장시켜도 좋습니다.
- 늘 잘 풀리지 않습니다. 현재 상태와 지난 선택의 결과를 이어받습니다. 낮은 수치는 문제로 드러납니다.
- 최근 장면과 겹치지 않는 새 사건을 만듭니다.
- 사건은 반드시 '가보지 않은 길'과 '당시 상황'에 적힌 내용에서 이어져야 합니다. 그 길을 골랐기 때문에 생기는 일이어야 합니다.
- 선택지는 3개, 각각 다른 가치(성장, 안정, 관계 등)를 대표합니다.
- effects는 h(행복), b(건강), m(재정), r(관계), s(성취) 중 2~3개, 각각 -12~12 정수.
- 최대 1개 선택지만 risky=true(결과가 운에 달림). risky면 win/lose에 각각 결과 한두 문장. 아니면 win에만 결과를 쓰고 lose는 "".
- ${outLang()}

JSON 하나만 출력하세요:
{"title":"장면 제목 (짧게)","story":"3~5문장","choices":[{"label":"선택지 (짧게)","effects":{"s":5,"b":-3},"risky":false,"win":"...","lose":""}]}`;
  const data = await sampleFn.json(prompt, {modelTier:"quick", cache:false});
  if (!data || !data.story || !Array.isArray(data.choices) || data.choices.length < 2) throw {code:"bad_shape"};
  const ch = data.choices.slice(0,3).map(c => {
    const e = {}; for (const k of STAT_KEYS) if (Number.isFinite(+c.effects?.[k])) e[k] = clamp(Math.round(+c.effects[k]),-15,15);
    if (c.risky) {
      const st = STAT_KEYS.slice().sort((a,b)=>(e[b]||0)-(e[a]||0))[0];
      const win = {}, lose = {};
      for (const k in e) { win[k] = Math.round(e[k] * (e[k] > 0 ? 1.3 : 0.5)); lose[k] = e[k] > 0 ? -Math.round(e[k]*0.6) : e[k]; }
      return {t:String(c.label), r:{st, d:5, win:{e:win, x:String(c.win||"")}, lose:{e:lose, x:String(c.lose||"")}}};
    }
    return {t:String(c.label), e, x:String(c.win||"")};
  });
  return {kind:"event", title:String(data.title||"…"), text:String(data.story), ch};
}
async function aiEnding(suggest){
  const prompt = `당신은 인생 시뮬레이션 게임 "그때 그 갈림길"의 이야기꾼입니다. 플레이어가 하지 않았던 선택으로 살아온 삶의 결말을 씁니다.

[플레이어]
${profileText()}

[살아온 삶]
${S.log.map(l => `${l.a}살 「${l.t}」 → ${l.c}${l.w!=null?` (${l.w?"성공":"실패"})`:""}`).join("\n")}

[최종 상태 (0~100)] ${statsText()}
[게임이 계산한 결말 유형] ${suggest}

[규칙]
- ${S.endAge}살의 모습을 씁니다. 중요한 선택들과 최종 상태가 드러나야 합니다. 낮은 수치도 그 삶에서 얻은 것과 함께 따뜻하게 씁니다. 결말은 어떤 경우에도 긍정적으로 끝냅니다.
- 직업/결말은 결말 유형을 따르되, 살아온 삶에 비춰 더 자연스러운 표현으로 다듬어도 됩니다.
- 2인칭 "당신", 구체적으로.
- letter는 이 삶의 당신이 '${S.cross.taken}' 쪽을 고른 현실의 당신에게 보내는 짧은 편지입니다. 어느 쪽이 정답이라고 단정하지 말고, 현실의 당신이 고른 길에만 있는 좋은 점을 구체적으로 짚으며 따뜻하게 마무리합니다.
- ${outLang()}

JSON 하나만 출력하세요:
{"job":"지금의 직업이나 삶을 한 구절로","story":"5~7문장","letter":"3~4문장"}`;
  const data = await sampleFn.json(prompt, {modelTier:"default", cache:false});
  if (!data || !data.job || !data.story) throw {code:"bad_shape"};
  return {job:String(data.job), desc:String(data.story), letter:String(data.letter||"")};
}

/* ============ rendering ============ */
const app = $("#app");
const DIE = `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="5.5" cy="5.5" r="1.3" fill="currentColor"/><circle cx="10.5" cy="10.5" r="1.3" fill="currentColor"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/></svg>`;
const STAR = `<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.5z" fill="var(--signal)"/></svg>`;
const HEART = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17s-7-4.4-7-9.2C3 5 5 3.5 7 3.5c1.4 0 2.4.8 3 1.8.6-1 1.6-1.8 3-1.8 2 0 4 1.5 4 4.3C17 12.6 10 17 10 17z" fill="var(--route)"/></svg>`;
const fmtDate = ts => { const d = new Date(ts); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; };
const toTop = () => window.scrollTo({top:0});
const kindLabel = k => !k ? "" : k.startsWith("year:") ? t("kYear",{y:k.slice(5)}) : t({plan:"kPlan", event:"kEvent", daily:"kDaily", follow:"kFollow", cross:"kCross", path:"kPath", callback:"kBack"}[k] || "kEvent");

function langSelect(){
  return `<label class="langsel"><span class="sr">${t("lang")}</span><select id="lang-sel" aria-label="${t("lang")}">${LANGS.map(l=>`<option value="${l}"${l===LANG?" selected":""}>${UI[l].langName}</option>`).join("")}</select></label>`;
}
function topbar(){
  return `<div class="topbar"><button class="brand" id="go-lobby" aria-label="${t("toLobbyAria")}">${esc(t("brandA"))}<em>${esc(t("brandB"))}</em></button>
    <div class="row" style="gap:10px;flex-wrap:nowrap">${langSelect()}
    ${SAVE.char ? `<button class="mini" id="go-lobby2">${avatar(SAVE.char.look,{size:32})}<span>Lv.${levelOf(SAVE.xp)}</span></button>` : ""}</div></div>`;
}
function bindTop(){
  ["#go-lobby","#go-lobby2"].forEach(s => { const b=$(s); if (b) b.onclick = () => { if (SAVE.char) { S && persist(); S = null; renderLobby(); toTop(); } }; });
  const ls = $("#lang-sel"); if (ls) ls.onchange = () => setLang(ls.value);
}
function rerender(){
  if (view.name === "scene" && S) renderScene();
  else if (view.name === "life" && view.rec) renderLife(view.rec, view.fresh);
  else { if (!SAVE.char) autoChar(); renderLobby(); }
}
function storageBanner(){ return storageOK ? "" : `<p class="banner">${t("storage")}</p>`; }

/* ---- character creation / edit ---- */
let draftLook = null;
function lookPicker(look){
  return `<div class="field"><label>${t("lookLabel")}</label><small>${t("lookNote")}</small>
    <div class="lookwrap"><div class="lookprev" id="look-prev">${avatar(look,{size:120})}</div>
    <div class="lookopts">
      <div class="lookrow"><span>${t("skin")}</span><div class="swatches" id="lk-skin">${SKINS.map((c,i)=>`<button type="button" class="swatch" style="background:${c}" data-v="${i}" aria-pressed="${look.skin===i}" aria-label="${t("skin")} ${i+1}"></button>`).join("")}</div></div>
      <div class="lookrow"><span>${t("hair")}</span><div class="swatches" id="lk-hair">${HAIRS.map(i=>`<button type="button" class="sym hairbtn" data-v="${i}" aria-pressed="${look.hair===i}" aria-label="${t("hair")} ${i+1}">${avatar({...look,hair:i},{size:34})}</button>`).join("")}</div></div>
      <div class="lookrow"><span>${t("hairColor")}</span><div class="swatches" id="lk-hc">${HAIRC.map((c,i)=>`<button type="button" class="swatch" style="background:${c}" data-v="${i}" aria-pressed="${look.hairColor===i}" aria-label="${t("hairColor")} ${i+1}"></button>`).join("")}</div></div>
      <div class="lookrow"><span>${t("shirt")}</span><div class="swatches" id="lk-shirt">${COLORS.map(c=>`<button type="button" class="swatch" style="background:${c}" data-v="${c}" aria-pressed="${look.shirt===c}" aria-label="${t("shirt")}"></button>`).join("")}</div></div>
    </div></div></div>`;
}
function bindLookPicker(){
  const map = {"lk-skin":"skin","lk-hair":"hair","lk-hc":"hairColor","lk-shirt":"shirt"};
  for (const id in map) $("#"+id).onclick = e => { const b = e.target.closest("button"); if (!b) return;
    const key = map[id]; draftLook[key] = key==="shirt" ? b.dataset.v : +b.dataset.v;
    $("#"+id).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x===b)));
    $("#look-prev").innerHTML = avatar(draftLook,{size:120});
    $("#lk-hair").querySelectorAll("button").forEach(x => x.innerHTML = avatar({...draftLook, hair:+x.dataset.v},{size:34})); };
}
function charForm(c, isNew){
  draftLook = {...c.look};
  return `
    <div class="field"><label for="c-name">${t("nameLabel")}</label><input id="c-name" maxlength="12" value="${esc(c.name||"")}" placeholder="${esc(t("namePh"))}"></div>
    ${isNew ? `<div class="field"><label for="c-age">${t("ageLabel")}</label><input id="c-age" type="number" inputmode="numeric" min="10" max="90" value="${esc(c.age||"")}" placeholder="${esc(t("agePh"))}"><small>${t("ageNote")}</small></div>` : ""}
    ${lookPicker(draftLook)}
    <div class="field"><label>${t("traitsLabel")} <span class="muted" style="font-weight:400">${t("traitsMax",{n:maxTraits()})}</span></label>
      <div class="chips" id="c-traits">${Object.keys(TRAITS).map(id=>`<button type="button" class="chip" data-id="${id}" aria-pressed="${(c.traits||[]).includes(id)}">${esc(TRAIT_NAMES[id])}</button>`).join("")}</div></div>
    <div class="field"><label for="c-value">${t("valueLabel")}</label>
      <select id="c-value">${Object.keys(VALUES).map(v=>`<option value="${v}"${v===c.value?" selected":""}>${esc(VALUE_NAMES[v])}</option>`).join("")}</select>
      <small>${t("valueNote")}</small></div>`;
}
function bindCharForm(){
  bindLookPicker();
  $("#c-traits").onclick = e => { const b = e.target.closest("button"); if (!b) return;
    const on = b.getAttribute("aria-pressed")==="true";
    if (!on && $("#c-traits").querySelectorAll('[aria-pressed="true"]').length >= maxTraits()) return;
    b.setAttribute("aria-pressed", String(!on)); };
}
function readCharForm(){
  return {name:$("#c-name").value.trim(), look:{...draftLook}, traits:[...$("#c-traits").querySelectorAll('[aria-pressed="true"]')].map(b=>b.dataset.id), value:$("#c-value").value};
}
function heroSVG(){
  return `<svg viewBox="0 0 150 190" role="img" aria-label="">
    <path d="M75 186 V110" stroke="var(--ink)" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M75 110 V14" stroke="var(--taken)" stroke-width="8" stroke-linecap="round" stroke-dasharray="2 14" fill="none"/>
    <path d="M75 110 C75 80 128 72 128 40 V14" stroke="var(--route)" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="75" cy="110" r="10" fill="var(--card)" stroke="var(--ink)" stroke-width="5"/>
    <circle cx="75" cy="18" r="7" fill="var(--card)" stroke="var(--taken)" stroke-width="4"/>
    <circle cx="128" cy="18" r="9" fill="var(--signal)" stroke="var(--route)" stroke-width="4"/>
  </svg>`;
}
function renderCreate(){
  view = {name:"create"};
  const c = {look:{skin:Math.floor(Math.random()*SKINS.length), hair:pick(HAIRS), hairColor:Math.floor(Math.random()*3), shirt:pick(COLORS)}, traits:[], value:"achieve"};
  app.innerHTML = `
  <div class="topbar"><span></span>${langSelect()}</div>
  <header class="hero">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <span class="eyebrow">${t("eyebrow")}</span>
      <h1>${esc(t("brandA"))}<em>${esc(t("brandB"))}</em></h1>
      <p class="muted">${t("hero")}</p>
    </div>
    ${heroSVG()}
  </header>
  ${storageBanner()}
  <form class="panel" id="cform" novalidate>
    <h2 style="font-size:24px">${t("createTitle")}</h2>
    <p class="muted" style="margin-top:-8px">${t("createNote")}</p>
    ${charForm(c, true)}
    <p class="err" id="err" hidden></p>
    <div class="row"><button class="btn" type="submit">${t("createBtn")}</button><button type="button" class="linkbtn" id="to-import">${t("importLink")}</button></div>
    <div id="import-box" hidden class="field"><label for="imp">${t("importLabel")}</label><textarea id="imp" placeholder="${esc(t("importPh"))}"></textarea><div class="row"><button type="button" class="btn sm" id="do-import">${t("importBtn")}</button></div></div>
  </form>`;
  const ls = $("#lang-sel"); if (ls) ls.onchange = () => setLang(ls.value);
  bindCharForm();
  $("#to-import").onclick = () => { $("#import-box").hidden = false; $("#imp").focus(); };
  $("#do-import").onclick = () => { try { importCode($("#imp").value); renderLobby(); } catch(e) { const er=$("#err"); er.textContent = t("importErr"); er.hidden=false; } };
  $("#cform").onsubmit = e => {
    e.preventDefault();
    const c = readCharForm(), age = parseInt($("#c-age").value, 10), er = $("#err");
    const msg = !c.name ? t("errName") : !(age>=10 && age<=90) ? t("errAge") : "";
    if (msg) { er.textContent = msg; er.hidden = false; return; }
    SAVE.char = {...c, age, year:THIS_YEAR, createdAt:Date.now()};
    persist(); renderLobby(); toTop();
  };
}

/* ---- lobby ---- */
function renderLobby(){
  view = {name:"lobby"};
  const ch = SAVE.char, lv = levelOf(SAVE.xp), lo = LEVELS[lv-1], hi = LEVELS[lv] ?? lo;
  const pct = hi>lo ? Math.round((SAVE.xp-lo)/(hi-lo)*100) : 100;
  const cur = SAVE.current;
  const fresh = !SAVE.lives.length && !cur;
  app.innerHTML = `
  ${topbar()}
  ${fresh ? `<header class="hero">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <span class="eyebrow">${t("eyebrow")}</span>
      <h1>${esc(t("brandA"))}<em>${esc(t("brandB"))}</em></h1>
      <p class="muted">${t("hero")}</p>
    </div>
    ${heroSVG()}
  </header>` : ""}
  ${storageBanner()}
  <section class="panel"${fresh ? ' style="display:none"' : ''}>
    <div class="charcard"><div class="avabox">${avatar(ch.look,{size:84})}</div>
      <div class="xp"><h2>${esc(myName())}</h2>
        <div class="kpis">${charAge() ? `<span>${t("ageN",{n:`<b>${charAge()}</b>`})}</span>` : ""}<span>${t("lvN",{n:`<b>${lv}</b>`})}</span><span>${t("lives")} <b>${SAVE.lives.length}</b></span><span>${t("endings")} <b>${foundEndings()}/${totalEndings()}</b></span></div>
        <div class="bar"><b style="width:${pct}%"></b></div>
        <span class="note mono">${hi>lo ? t("toNext",{n:hi-SAVE.xp}) : t("maxLv")}</span>
      </div>
    </div>
  </section>

  ${cur ? `<section class="panel">
    <span class="eyebrow">${t("inProgress")}</span>
    <div class="item" style="background:var(--route-soft);border-color:var(--route)"><div class="avamini">${avatar(ch.look,{size:44,outfit:cur.domain,mood:moodOf(cur.stats.h)})}</div><div><b>${esc(cur.cross.untaken)}</b><span class="sub mono">${t("ageN",{n:cur.ages[Math.min(cur.si,cur.ages.length-1)]})} · ${t("sceneOf",{n:cur.sceneNo,t:cur.total})}</span></div>
      <button class="btn sm" id="resume">${t("resume")}</button></div>
    <div class="confirm" id="quit-box"><button class="linkbtn" id="quit">${t("quit")}</button></div>
  </section>` : ""}

  <section class="panel">
    <div style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${t("newEyebrow")}</span><h2 style="font-size:24px">${t("newTitle")}</h2></div>
    <div class="field">
      <label>${t("lenLabel")}</label>
      <div class="engine" id="length">
        <button type="button" data-v="quick" aria-pressed="${quick}"><b>${t("lenQuick")}</b><span>${t("lenQuickD",{n:1+QUICK_STATIONS*QUICK_SPS})}</span></button>
        <button type="button" data-v="full" aria-pressed="${!quick}"><b>${t("lenFull")}</b><span>${t("lenFullD",{n:1+STATIONS*SCENES_PER_STATION})}</span></button>
      </div>
    </div>
    ${SAVE.crossroads.length ? `<div class="list">${SAVE.crossroads.map(c => {
        const n = SAVE.lives.filter(l=>l.cross.id===c.id).length;
        return `<div class="item"><div class="avamini">${avatar(ch.look,{size:44,outfit:detectDomain(c)})}</div><div><b>${esc(c.untaken)}</b><span class="sub">${esc(t("crossSub",{age:c.forkAge, taken:c.taken, n: n ? t("livedN",{n}) : t("notYet")}))}</span></div>
          <div class="row" style="flex:none;gap:6px"><button class="btn sm" data-start="${c.id}">${t("live")}</button><button class="linkbtn" data-del="${c.id}">${t("del")}</button></div></div>`; }).join("")}</div>`
      : `<p class="muted">${t("noCross")}</p>`}
    <details id="newcross" ${SAVE.crossroads.length?"":"open"}>
      <summary>${t("addCross")}</summary>
      <form id="xform" novalidate style="display:flex;flex-direction:column;gap:16px">
        <div class="field"><label>${t("presets")}</label><div class="chips" id="presets">${PRESETS.map((p,i)=>`<button type="button" class="chip preset" data-i="${i}">${esc(p.label)}</button>`).join("")}</div></div>
        <div class="fork-pair ages">
          <div class="field"><label for="x-fork">${t("forkLabel")}</label><input id="x-fork" type="number" inputmode="numeric" min="8" max="89" placeholder="${esc(t("forkPh"))}"></div>
          <div class="field"><label for="x-now">${t("nowLabel")}</label><input id="x-now" type="number" inputmode="numeric" min="9" max="90" value="${charAge()||""}" placeholder="${esc(t("nowPh"))}"></div>
        </div>
        <small class="note" style="margin-top:-8px">${t("nowNote")}</small>
        <div class="field"><label for="x-sit">${t("sitLabel")}</label><textarea id="x-sit" maxlength="300" placeholder="${esc(t("sitPh"))}"></textarea></div>
        <div class="fork-pair">
          <div class="field taken"><label for="x-taken">${t("takenLabel")}</label><input id="x-taken" maxlength="40" placeholder="${esc(t("takenPh"))}"></div>
          <div class="field untaken"><label for="x-untaken">${t("untakenLabel")}</label><input id="x-untaken" maxlength="40" placeholder="${esc(t("untakenPh"))}"></div>
        </div>
        <p class="err" id="xerr" hidden></p>
        <div class="row"><button class="btn" type="submit">${t("saveLive")}</button></div>
      </form>
    </details>
    <div class="field">
      <label>${t("engine")}</label>
      <div class="engine" id="engine">
        <button type="button" data-v="basic" aria-pressed="${engine==="basic"}"><b>${t("engBasic")}</b><span>${t("engBasicD")}</span></button>
        <button type="button" data-v="ai" aria-pressed="${engine==="ai"}" ${sampleFn?"":"disabled"}><b>${t("engAI")}</b><span id="ai-note">${sampleFn?t("engAID"):t("engAIOff")}</span></button>
      </div>
    </div>
    <p class="note">${t("saveNote")}</p>
  </section>

  <section class="panel">
    <div class="tabs" role="tablist">
      ${[["lives","tabLives"],["coll","tabColl"],["ach","tabAch"],["perks","tabPerks"],["me","tabMe"]].map(([k,key])=>`<button class="tab" role="tab" data-tab="${k}" aria-selected="${lobbyTab===k}">${t(key)}</button>`).join("")}
    </div>
    <div id="tabbody"></div>
  </section>`;
  bindTop();
  if (cur) {
    $("#resume").onclick = () => { restoreCurrent(); renderScene(); toTop(); };
    $("#quit").onclick = () => { $("#quit-box").innerHTML = `<span class="muted" style="font-size:14px">${t("quitQ")}</span><button class="btn sm danger" id="quit-yes">${t("quitYes")}</button><button class="btn sm ghost" id="quit-no">${t("cancel")}</button>`;
      $("#quit-yes").onclick = () => { SAVE.current = null; S = null; persist(); renderLobby(); };
      $("#quit-no").onclick = () => renderLobby(); };
  }
  app.querySelectorAll("[data-start]").forEach(b => b.onclick = () => startCross(SAVE.crossroads.find(c=>c.id===b.dataset.start)));
  app.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
    const box = b.parentElement; box.innerHTML = `<button class="btn sm danger" data-yes>${t("del")}</button><button class="btn sm ghost" data-no>${t("cancel")}</button>`;
    box.querySelector("[data-yes]").onclick = () => { SAVE.crossroads = SAVE.crossroads.filter(c=>c.id!==b.dataset.del); persist(); renderLobby(); };
    box.querySelector("[data-no]").onclick = () => renderLobby(); });
  $("#presets").onclick = e => { const b = e.target.closest("button"); if (!b) return; const p = PRESETS[+b.dataset.i];
    $("#x-fork").value = charAge() ? Math.min(p.forkAge, charAge()-1) : p.forkAge; $("#x-sit").value = p.situation; $("#x-taken").value = p.taken; $("#x-untaken").value = p.untaken; };
  $("#xform").onsubmit = e => {
    e.preventDefault();
    const nowV = parseInt($("#x-now").value,10);
    const c = {id:uid(), forkAge:parseInt($("#x-fork").value,10), nowAge: nowV>=9 && nowV<=90 ? nowV : null, situation:$("#x-sit").value.trim(), taken:$("#x-taken").value.trim(), untaken:$("#x-untaken").value.trim()};
    const er = $("#xerr");
    const msg = !c.untaken ? t("errUntaken") : !c.taken ? t("errTaken") : !(c.forkAge>=8 && c.forkAge<=80) ? t("errFork2") : (c.nowAge && c.nowAge <= c.forkAge) ? t("errNow") : "";
    if (msg) { er.textContent = msg; er.hidden = false; return; }
    SAVE.crossroads.unshift(c); persist(); startCross(c);
  };
  $("#length").onclick = e => { const b = e.target.closest("button"); if (!b) return; quick = b.dataset.v === "quick";
    $("#length").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x===b))); };
  $("#engine").onclick = e => { const b = e.target.closest("button"); if (!b || b.disabled) return; engine = b.dataset.v;
    $("#engine").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x===b))); };
  app.querySelector(".tabs").onclick = e => { const b = e.target.closest("[data-tab]"); if (!b) return; lobbyTab = b.dataset.tab;
    app.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", String(x===b))); renderTab(); };
  renderTab();
}
function startCross(c){
  if (SAVE.current) {
    const box = $("#quit-box");
    if (box) { box.innerHTML = `<span class="err">${t("busy")}</span>`; box.scrollIntoView({behavior:"smooth", block:"center"}); }
    return;
  }
  newLife(c); renderScene(); toTop();
}
function renderTab(){
  const body = $("#tabbody"), look = SAVE.char.look;
  if (lobbyTab === "lives") {
    body.innerHTML = SAVE.lives.length ? `<div class="list">${SAVE.lives.map(l => `<button class="item" data-life="${l.id}"><div class="avamini">${avatar(look,{size:44,outfit:l.domain,mood:"happy"})}</div><div><b>${esc(l.job)}</b><span class="sub">${esc(t("lifeSub",{path:l.cross.untaken, age:l.endAge, sat:l.sat, date:fmtDate(l.date)}))}</span></div><span class="mono muted" aria-hidden="true">›</span></button>`).join("")}</div>`
      : `<p class="muted">${t("livesEmpty")}</p>`;
    body.querySelectorAll("[data-life]").forEach(b => b.onclick = () => { renderLife(SAVE.lives.find(l=>l.id===b.dataset.life), false); toTop(); });
  } else if (lobbyTab === "coll") {
    body.innerHTML = `<p class="muted" style="margin-bottom:14px">${t("collIntro")}</p>` +
      Object.keys(ENDINGS).map(dk => { const got = SAVE.endings[dk] || [];
        return `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px"><div class="dom-h"><span class="row" style="gap:8px">${avatar(look,{size:36,outfit:dk})}<span class="cap">${esc(DOMAINS[dk].label)}</span></span><span class="mono muted" style="font-size:13px">${got.length}/${ENDINGS[dk].length}</span></div>
          <div class="coll">${ENDINGS[dk].map((en,i)=> got.includes(i) ? `<div class="cell">${esc(en.cjob || en.job)}</div>` : `<div class="cell locked">???</div>`).join("")}</div></div>`; }).join("");
  } else if (lobbyTab === "ach") {
    body.innerHTML = `<div class="list">${ACH.map(a => { const on = SAVE.achievements.includes(a.id);
      return `<div class="ach ${on?"on":"off"}"><i>${on?"★":"?"}</i><div><b>${esc(t("a_"+a.id))}</b><small>${esc(t("a_"+a.id+"d"))}</small></div></div>`; }).join("")}</div>
      <p class="note" style="margin-top:12px">${t("achNote")}</p>`;
  } else if (lobbyTab === "perks") {
    const lv = levelOf(SAVE.xp);
    body.innerHTML = `<p class="muted" style="margin-bottom:12px">${t("perksIntro")}</p>
      <div class="list">${PERKS.map(p => `<div class="ach ${lv>=p?"on":"off"}"><i class="mono" style="font-size:12px">${p}</i><div><b>Lv.${p} ${esc(t("perk"+p))}</b><small>${esc(t("perk"+p+"d"))}</small></div></div>`).join("")}</div>`;
  } else {
    body.innerHTML = `<form id="eform" novalidate style="display:flex;flex-direction:column;gap:16px">${charForm(SAVE.char, false)}
      <div class="row"><button class="btn sm" type="submit">${t("saveChar")}</button><span class="note" id="enote" aria-live="polite"></span></div></form>
      <hr class="sep">
      <div class="field"><label>${t("saveCode")}</label><small>${t("saveCodeNote")}</small>
        <div class="row"><button class="btn sm ghost" id="copycode">${t("copyCode")}</button><button class="btn sm ghost" id="showimp">${t("importCode")}</button></div>
        <div id="codebox"></div></div>
      <hr class="sep">
      <div class="confirm" id="reset-box"><button class="linkbtn" id="reset">${t("reset")}</button></div>`;
    bindCharForm();
    $("#eform").onsubmit = e => { e.preventDefault(); const c = readCharForm(); 
      Object.assign(SAVE.char, c); persist(); renderLobby(); };
    $("#copycode").onclick = () => { const code = exportCode(), box = $("#codebox");
      const show = () => { box.innerHTML = `<p class="note">${t("copyBlocked")}</p><textarea id="codearea" rows="4" readonly>${esc(code)}</textarea>`; $("#codearea").select(); };
      try { navigator.clipboard.writeText(code).then(() => { box.innerHTML = `<p class="note">${t("codeCopied")}</p>`; }, show); } catch(e){ show(); } };
    $("#showimp").onclick = () => { $("#codebox").innerHTML = `<textarea id="imp" rows="4" placeholder="${esc(t("importPh"))}"></textarea><p class="note">${t("importReplace")}</p><div class="row"><button class="btn sm" id="do-imp">${t("importBtn")}</button></div><p class="err" id="imperr" hidden></p>`;
      $("#do-imp").onclick = () => { try { importCode($("#imp").value); renderLobby(); toTop(); } catch(e) { const er=$("#imperr"); er.textContent=t("importErr"); er.hidden=false; } }; };
    $("#reset").onclick = () => { $("#reset-box").innerHTML = `<span class="muted" style="font-size:14px">${t("resetQ")}</span><button class="btn sm danger" id="reset-yes">${t("resetYes")}</button><button class="btn sm ghost" id="reset-no">${t("cancel")}</button>`;
      $("#reset-yes").onclick = () => { SAVE = blankSave(); S = null; autoChar(); renderLobby(); toTop(); };
      $("#reset-no").onclick = () => renderTab(); };
  }
}

/* ---- play ---- */
function routeBar(si, ages){
  const n = ages.length - 1, pct = Math.min(si, n)/n*100;
  return `<div class="route" aria-hidden="true">
    <span class="fill" style="width:calc((100% - 24px) * ${pct/100})"></span>
    ${ages.map((a,i)=>`<div class="stn ${i<si?"done":i===si?"now":""}"><i${i===n?' style="border-color:var(--signal)"':""}></i><span>${a}</span></div>`).join("")}
  </div>`;
}
function statsHTML(st){
  return `<div class="stats">${STAT_KEYS.map(k=>`<div class="stat ${st[k]<30?"low":""}"><div class="lab"><span>${statName(k)}</span><span class="mono">${st[k]}</span></div><div class="bar"><b style="width:${st[k]}%"></b></div></div>`).join("")}</div>`;
}
function deltasHTML(d){
  const keys = Object.keys(d||{}).filter(k=>d[k]);
  return keys.length ? `<div class="deltas">${keys.map(k=>`<span class="delta ${d[k]>0?"up":"down"}">${statName(k)} ${d[k]>0?"+":""}${d[k]}</span>`).join("")}</div>` : "";
}
function renderThinking(msg){
  app.innerHTML = `${topbar()}${routeBar(S.si, S.ages)}<section class="panel"><div class="thinking"><i></i><span>${esc(msg)}</span></div><p class="note">${t("thinkNote")}</p></section>${statsHTML(S.stats)}`;
  bindTop();
}
function aiNotice(failed, code){ return failed ? `<p class="note">${t(code==="not_granted"?"aiNo":code==="rate_limited"?"aiRate":"aiErr")}</p>` : ""; }

function renderScene(){
  view = {name:"scene"};
  const sc = S.scene, age = S.ages[S.si], ch = S.chosen, left = S.total - S.sceneNo, preview = hasPerk(3);
  app.innerHTML = `
  ${topbar()}
  ${routeBar(S.si, S.ages)}
  <div class="progress"><span>${t("progress",{n:S.sceneNo,t:S.total})}</span><span>${left ? t("minsLeft",{n:Math.max(1, Math.round(left*(S.quick?20:25)/60))}) : t("lastScene")}</span></div>
  <section class="panel scene">
    <div class="scenehead">
      <div class="avabox sm">${avatar(SAVE.char.look,{size:64,outfit:S.domain,mood:moodOf(S.stats.h)})}</div>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
        <div class="row" style="gap:8px"><span class="eyebrow mono">${t("ageYear",{age, year:birthYear()+age})}</span><span class="kind">${esc(kindLabel(sc.kind))}</span></div>
        <h2>${esc(sc.title)}</h2>
      </div>
    </div>
    <p class="story">${esc(sc.text)}</p>
    ${sc.fate ? `<div class="fate">${STAR}<div style="display:flex;flex-direction:column;gap:6px"><span><b>${t("fate")}</b> ${esc(sc.fate.t)}</span>${deltasHTML(sc.fateDelta)}</div></div>` : ""}
    <div class="choices" id="choices" role="radiogroup">
      ${sc.ch.map((c,i)=>`<button class="choice ${ch?(ch.i===i?"picked":"dim"):pending===i?"selected":""}" data-i="${i}" role="radio" aria-checked="${ch?ch.i===i:pending===i}" ${ch?"disabled":""}>
        <span class="radio" aria-hidden="true"></span>
        <span style="display:flex;flex-direction:column;gap:6px;min-width:0;flex:1"><span>${esc(c.t)}</span>${preview && !c.r && !ch ? deltasHTML(c.e) : ""}</span>
        ${c.r?`<span class="tag">${DIE} ${t("luck")} · <span class="mono">${Math.round(chanceOf(c.r)*100)}%</span></span>`:""}</button>`).join("")}
    </div>
    <div class="confirmbar" id="confirmbar" ${!ch && pending!=null ? "" : "hidden"}>
      <button class="btn" id="confirm-btn">${t("confirm")}</button><span class="note">${t("confirmHint")}</span>
    </div>
    <div id="result">${ch ? `
      <div class="outcome ${ch.res.bad?"bad":""}">${ch.res.p!=null?`<span class="dice">${DIE} ${esc(t("chance",{p:ch.res.p, res:t(ch.res.win?"success":"fail")}))}</span>`:""}<p>${esc(ch.res.text)}</p>${deltasHTML(ch.res.delta)}</div>
      <div class="row" style="margin-top:16px">
        <button class="btn" id="next">${left ? t("next") : t("meet",{age:S.endAge})}</button>
        ${S.rewinds < rewindMax() ? `<button class="btn ghost" id="rewind">${t("rewind",{n:rewindMax()-S.rewinds})}</button>` : ""}
      </div>` : ""}</div>
    ${aiNotice(S.aiFailed, S.aiError)}
  </section>
  ${statsHTML(S.stats)}
  <p class="note">${t("autosave")}</p>`;
  bindTop();
  $("#choices").onclick = e => { const b = e.target.closest("button"); if (!b || b.disabled) return;
    pending = +b.dataset.i;
    $("#choices").querySelectorAll(".choice").forEach((x,j) => { x.classList.toggle("selected", j===pending); x.setAttribute("aria-checked", String(j===pending)); });
    $("#confirmbar").hidden = false; };
  $("#confirm-btn").onclick = () => { if (pending != null) choose(pending); };
  if (ch) {
    $("#next").onclick = () => { $("#next").disabled = true; advance().then(toTop); };
    if ($("#rewind")) $("#rewind").onclick = rewind;
    $("#next").focus({preventScroll:true});
  }
}

/* ---- e-book story sharing (optional, with consent) ----
   Public visitors can't write to the artifact's own storage, so the page prepares the story
   and the player sends it as an Instagram DM to the project account. */
const STORY_IG = "whatif_newlife";
const STORY_DM = "https://ig.me/m/" + STORY_IG;
const STORY_CONTACT = "@" + STORY_IG;
const AGE_GROUPS = ["ag_none","ag_teen","ag_20","ag_30","ag_40","ag_50"];
const storyCode = () => Array.from({length:6}, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*32)]).join("");

function storyPackage(r, code, ageKey, note){
  const isHi = l => l.w!=null || l.k==="follow" || /^year:/.test(l.k||"");
  const moments = r.log.filter(isHi).slice(0,8).map(l => `- ${l.a}: ${l.t} → ${l.c}${l.w!=null?(l.w?" (O)":" (X)"):""}`).join("\n");
  const now = new Date().toISOString().replace("T"," ").slice(0,16) + " UTC";
  return `[접수번호] ${code}
[동의] 개인정보 수집·이용 동의, 익명 게시(카드뉴스)·출간(책) 동의, 만 14세 이상 확인 — ${now}
[언어] ${LANG}  [나이대] ${UI.ko[ageKey]}
[갈림길] ${r.cross.forkAge}살
[당시 상황] ${r.cross.situation || "-"}
[실제로 고른 길] ${r.cross.taken}
[가보지 않은 길] ${r.cross.untaken}
[결말] ${r.endAge}살 · ${r.type || r.job} · 만족도 ${r.sat}
[수치] ${STAT_KEYS.map(k=>`${UI.ko["st_"+k]} ${r.stats[k]}`).join(" / ")}
[결정적 순간]
${moments || "-"}
[남기고 싶은 이야기]
${note || "-"}`;
}
function storyBox(r){
  if (r.story && r.story.code) {
    return `<div class="storybox done"><b>${t("thanks")}</b>
      <span>${t("codeL")} <b class="mono">${esc(r.story.code)}</b></span>
      <span class="note">${esc(t("withdraw",{contact:STORY_CONTACT}))}</span></div>`;
  }
  return `<div class="storybox" id="storybox">
    <div class="row" style="gap:10px;align-items:flex-start"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="flex:none;margin-top:3px"><path d="M3 5.5C3 4.7 3.7 4 4.5 4H10c1.1 0 2 .9 2 2v13c0-.8-.7-1.5-1.5-1.5h-6C3.7 17.5 3 16.8 3 16V5.5zM21 5.5c0-.8-.7-1.5-1.5-1.5H14c-1.1 0-2 .9-2 2v13c0-.8.7-1.5 1.5-1.5h6c.8 0 1.5-.7 1.5-1.5V5.5z" fill="var(--signal)"/></svg>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:0"><b class="goodtitle">${t("storyTitle")}</b><span class="note">${t("storyOptional")}</span></div></div>
    <p>${esc(t("storyIntro"))}</p>
    <div class="row"><button class="btn" id="story-open">${t("storyJoin")}</button></div>
    <div id="story-form" hidden>
      <div class="consent">
        <b>${t("consentTitle")}</b>
        <dl>
          <dt>${t("c_purposeL")}</dt><dd>${t("c_purpose")}</dd>
          <dt>${t("c_itemsL")}</dt><dd>${t("c_items")}</dd>
          <dt>${t("c_keepL")}</dt><dd>${t("c_keep")}</dd>
          <dt>${t("c_whereL")}</dt><dd>${t("c_where")}</dd>
          <dt>${t("c_publishL")}</dt><dd>${t("c_publish")}</dd>
          <dt>${t("c_refuseL")}</dt><dd>${t("c_refuse")}</dd>
        </dl>
      </div>
      <div class="field"><label for="story-age">${t("ageGroup")}</label>
        <select id="story-age">${AGE_GROUPS.map(k=>`<option value="${k}">${esc(t(k))}</option>`).join("")}</select></div>
      <div class="field"><label for="story-note">${t("storyNoteL")}</label>
        <textarea id="story-note" maxlength="600" rows="4" placeholder="${esc(t("storyNotePh"))}"></textarea></div>
      <div class="checks">
        ${["chk1","chk2","chk3"].map(k=>`<label class="check"><input type="checkbox" class="story-chk"><span><b class="req">${t("req")}</b> ${t(k)}</span></label>`).join("")}
      </div>
      <div class="row"><button class="btn" id="story-prep" disabled>${t("storyPrepare")}</button><button class="linkbtn" id="story-close">${t("storyClose")}</button></div>
      <div id="story-step2"></div>
    </div>
  </div>`;
}
function bindStoryBox(r){
  const open = $("#story-open"); if (!open) return;
  open.onclick = () => { $("#story-form").hidden = false; open.parentElement.hidden = true; };
  $("#story-close").onclick = () => { $("#story-form").hidden = true; open.parentElement.hidden = false; $("#story-step2").innerHTML = ""; };
  const chks = [...document.querySelectorAll(".story-chk")];
  const sync = () => { $("#story-prep").disabled = !chks.every(c => c.checked); };
  chks.forEach(c => c.onchange = sync);
  $("#story-prep").onclick = () => {
    if (!chks.every(c => c.checked)) return;
    const code = storyCode();
    const text = storyPackage(r, code, $("#story-age").value, $("#story-note").value.trim());
    const box = $("#story-step2");
    box.innerHTML = `<div class="step2"><b>${t("step2Title")}</b>
        <ol class="steps"><li>${t("step2a")}</li><li>${t("step2b",{ig:STORY_CONTACT})}</li><li>${t("step2c")}</li></ol>
        <textarea rows="7" readonly id="story-text">${esc(text)}</textarea>
        <div class="row"><button class="btn ghost" id="story-copy">${t("step2CopyBtn")}</button>
          <a class="btn" id="story-dm" href="${STORY_DM}" target="_blank" rel="noopener">${t("step2Send")}</a></div>
        <span class="note" id="story-copied" aria-live="polite">${t("codeL")} <b class="mono">${code}</b></span>
        <div class="row" id="story-sent-row" hidden><button class="btn" id="story-sent">${t("step2Sent")}</button></div></div>`;
    const copy = () => { const ta = $("#story-text");
      try { navigator.clipboard.writeText(text).then(() => { $("#story-copied").textContent = t("step2Copied"); }, () => { ta.select(); $("#story-copied").textContent = t("copyBlocked"); }); }
      catch(e){ ta.select(); $("#story-copied").textContent = t("copyBlocked"); } };
    $("#story-copy").onclick = copy;
    $("#story-dm").addEventListener("click", () => { track("story-dm"); $("#story-sent-row").hidden = false; });
    $("#story-sent").onclick = () => { r.story = {code, at:Date.now()}; persist(); const sb = $("#storybox"); if (sb) sb.outerHTML = storyBox(r); };
  };
}


/* ---- shareable result card (Instagram story size) ---- */
let downloadsApi = null;
function wrapLines(ctx, text, maxW){
  const toks = String(text).match(/\s+|[^\s]+/g) || [];
  const out = []; let line = "";
  const push = () => { if (line.trim()) out.push(line.trim()); line = ""; };
  for (const tk of toks) {
    if (ctx.measureText(line + tk).width <= maxW) { line += tk; continue; }
    if (/^\s+$/.test(tk)) { push(); continue; }
    if (ctx.measureText(tk).width > maxW) { for (const ch of tk) { if (ctx.measureText(line + ch).width > maxW) push(); line += ch; } }
    else { push(); line = tk; }
  }
  push(); return out;
}
function rrect(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
async function makeShareCard(r){
  const W = 1080, H = 1920, cs = getComputedStyle(document.documentElement);
  const fD0 = cs.getPropertyValue("--f-display").trim() || "sans-serif", fB = cs.getPropertyValue("--f-body").trim() || "sans-serif";
  const fD = (LANG==="ja"||LANG==="zh") ? fD0 : fD0;  // weight is added per call below
  const dw = (LANG==="ja"||LANG==="zh") ? "800 " : "";
  const cardStat = k => (UI[LANG] && UI[LANG]["sc_"+k]) || statName(k);
  const path = r.cross.untaken, taken = r.cross.taken;
  const s1 = t("cardLine1",{age:r.cross.forkAge, taken}), s2 = t("cardLine2",{untaken:path, untakenObj:josa("'"+path+"'","을")});
  const sMe = t("cardMe",{age:r.endAge}), sCTA = t("cardCTA"), sPlay = t("cardPlay");
  const bA = t("brandA"), bB = t("brandB"), tail = "  ·  The Other Road";
  const dispText = bA + bB + tail + s2 + r.job + sCTA, bodyText = s1 + sMe + sPlay + STAT_KEYS.map(cardStat).join("") + "0123456789";
  // web fonts load per character range, so ask for exactly the characters we draw
  try { await Promise.all([document.fonts.load(`${dw}76px ${fD}`, dispText), document.fonts.load(`700 40px ${fB}`, bodyText)]); } catch(e){}
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const INKC = "#16233A", MUT = "#5A6577", GRN = "#0B8A69", SOFT = "#D6EEE5";
  c.fillStyle = "#EDF0EA"; c.fillRect(0,0,W,H);
  c.strokeStyle = "rgba(11,138,105,.18)"; c.lineWidth = 14; c.lineCap = "round";
  c.beginPath(); c.moveTo(80, 1880); c.lineTo(80, 980); c.bezierCurveTo(80, 860, 150, 820, 150, 700); c.lineTo(150, 60); c.stroke();
  // brand
  c.textBaseline = "alphabetic"; c.font = `${dw}34px ${fD}`;
  const bw = c.measureText(bA).width + c.measureText(bB).width + (LANG==="en" ? 0 : c.measureText(tail).width);
  let bx = (W - bw)/2; c.textAlign = "left";
  c.fillStyle = INKC; c.fillText(bA, bx, 250); bx += c.measureText(bA).width;
  c.fillStyle = GRN; c.fillText(bB, bx, 250); bx += c.measureText(bB).width;
  if (LANG !== "en") { c.fillStyle = MUT; c.fillText(tail, bx, 250); }
  c.textAlign = "center";
  // measure the text blocks first, then fit the character tile in the space left
  c.font = `700 40px ${fB}`; const l1 = wrapLines(c, s1, 900).slice(0,2);
  let f2 = 60; c.font = `${dw}${f2}px ${fD}`; let l2 = wrapLines(c, s2, 920);
  if (l2.length > 2) { f2 = 50; c.font = `${dw}${f2}px ${fD}`; l2 = wrapLines(c, s2, 920); }
  l2 = l2.slice(0,3);
  let fj = 76; c.font = `${dw}${fj}px ${fD}`; let lj = wrapLines(c, r.job, 920);
  if (lj.length > 2) { fj = 62; c.font = `${dw}${fj}px ${fD}`; lj = wrapLines(c, r.job, 920); }
  lj = lj.slice(0,3);
  const lh2 = Math.round(f2*1.25), lhj = Math.round(fj*1.2);
  let y = 340;
  c.font = `700 40px ${fB}`; c.fillStyle = MUT;
  for (const ln of l1) { c.fillText(ln, W/2, y); y += 54; }
  y += 10 + (f2 - 40); c.font = `${dw}${f2}px ${fD}`; c.fillStyle = GRN;
  for (const ln of l2) { c.fillText(ln, W/2, y); y += lh2; }
  const topEnd = y - lh2 + 40;
  const ctaY = 1560, statsY = 1440;
  const jobLast = statsY - 74, jobFirst = jobLast - (lj.length-1)*lhj, meY = jobFirst - fj - 22;
  const tileBottom = meY - 64, tileTop = topEnd + 26;
  const tile = Math.max(260, Math.min(540, tileBottom - tileTop));
  const tx = (W - tile)/2, ty = tileTop + Math.max(0, (tileBottom - tileTop - tile)/2);
  c.save(); rrect(c, tx, ty, tile, tile, Math.round(tile*0.15)); c.fillStyle = SOFT; c.fill(); c.clip();
  const svg = avatar(SAVE.char.look, {size:tile, outfit:r.domain, mood:"happy", sparkle:true});
  await new Promise(res => { const im = new Image(); im.onload = () => { c.drawImage(im, tx, ty + 2, tile, tile); res(); }; im.onerror = res; im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
  c.restore();
  c.font = `700 40px ${fB}`; c.fillStyle = MUT; c.fillText(sMe, W/2, meY);
  c.font = `${dw}${fj}px ${fD}`; c.fillStyle = INKC;
  lj.forEach((ln,i) => c.fillText(ln, W/2, jobFirst + i*lhj));
  // stats
  const bwid = 156, gap = 22, total = 5*bwid + 4*gap; let sx = (W - total)/2;
  STAT_KEYS.forEach(k => {
    c.font = `700 26px ${fB}`; c.fillStyle = MUT; c.textAlign = "left";
    const nm = cardStat(k); let lab = nm; while (c.measureText(lab).width > bwid - 48 && lab.length > 1) lab = lab.slice(0,-1);
    c.fillText(lab === nm ? nm : lab + "…", sx, statsY);
    c.textAlign = "right"; c.fillStyle = INKC; c.fillText(String(r.stats[k]), sx + bwid, statsY);
    rrect(c, sx, statsY + 14, bwid, 12, 6); c.fillStyle = "rgba(22,35,58,.12)"; c.fill();
    rrect(c, sx, statsY + 14, Math.max(12, bwid * r.stats[k]/100), 12, 6); c.fillStyle = r.stats[k] < 30 ? "#C2453A" : GRN; c.fill();
    sx += bwid + gap;
  });
  c.textAlign = "center";
  const bh = 150;
  rrect(c, 90, ctaY, W-180, bh, 40); c.fillStyle = INKC; c.fill();
  c.font = `${dw}50px ${fD}`; c.fillStyle = "#F2C04E"; c.fillText(sCTA, W/2, ctaY + 66);
  c.font = `700 30px ${fB}`; c.fillStyle = "#EDF0EA"; c.fillText(sPlay, W/2, ctaY + 116);
  const blob = await new Promise(res => cv.toBlob(res, "image/png"));
  return {blob, url: cv.toDataURL("image/png")};
}
async function openShare(r){
  const box = $("#sharebox"); if (!box) return;
  track("share-open");
  box.hidden = false;
  box.innerHTML = `<div class="thinking"><i></i><span>${t("shareMaking")}</span></div>`;
  let card;
  try { card = await makeShareCard(r); } catch(e) { box.innerHTML = `<p class="err">${t("shareFail")}</p>`; return; }
  box.innerHTML = `<b class="goodtitle">${t("shareTitle")}</b>
    <img class="sharecard" src="${card.url}" alt="${esc(r.job)}">
    <p class="note">${t("shareHint",{ig:STORY_CONTACT})}</p>
    <div class="row">${downloadsApi ? `<button class="btn" id="share-save">${t("shareSave")}</button>` : !window.claude ? `<a class="btn" id="share-dl" download="the-other-road.png" href="${card.url}">${t("shareSave")}</a>` : ""}</div>
    <p class="note" id="share-note" aria-live="polite">${t("shareLong")}</p>`;
  const sd = $("#share-dl"); if (sd) sd.addEventListener("click", () => track("share-save"));
  const sv = $("#share-save");
  if (sv) sv.onclick = async () => {
    sv.disabled = true;
    try { await downloadsApi.save({filename:"the-other-road.png", data:card.blob}); track("share-save"); $("#share-note").textContent = t("shareSaved"); }
    catch(e) { $("#share-note").textContent = e && e.code === "declined" ? t("shareLong") : t("shareFail"); }
    sv.disabled = false;
  };
  box.scrollIntoView({behavior:"smooth", block:"start"});
}

/* ---- ending / past life ---- */
function summaryText(r){
  return t("summary", {age:r.cross.forkAge, taken:r.cross.taken, untaken:r.cross.untaken, end:r.endAge, job:r.job, desc:r.desc,
    stats:STAT_KEYS.map(k=>`${statName(k)} ${r.stats[k]}`).join(" / "), sat:r.sat, good:goodLines(r.stats, r.cross.taken)[0]});
}
function renderLife(r, fresh){
  view = {name:"life", rec:r, fresh};
  const g = r.gain || {}, look = SAVE.char.look;
  const isHi = l => l.w!=null || l.r || l.k==="follow" || l.k==="path" || l.k==="callback" || /^year:/.test(l.k||"") || l.k==="그 후" || /년$/.test(l.k||"");
  const highlights = r.log.filter(isHi).slice(0, 8);
  const resTag = l => l.w!=null ? t(l.w?"success":"fail") : (l.r || "");
  const tl = list => `<ol class="timeline">${list.map(l=>`<li><span class="age">${esc(t("ageN",{n:l.a}))} · ${esc(l.t)}</span><b>${esc(l.c)}${resTag(l)?` <span class="tag" style="margin-left:4px">${esc(resTag(l))}</span>`:""}</b><span class="muted" style="font-size:15px">${esc(l.n)}</span></li>`).join("")}</ol>`;
  const path = r.cross.untaken;
  app.innerHTML = `
  ${topbar()}
  <section class="panel ending">
    <div class="endhead">
      <div class="avabox lg">${avatar(look,{size:132,outfit:r.domain,mood:"happy",sparkle:true})}</div>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:0">
        <span class="eyebrow mono">${esc(t("ageN",{n:r.endAge}))} · ${fresh ? t("endFresh") : fmtDate(r.date)}</span>
        <p class="muted">${esc(t("endLead",{age:r.cross.forkAge, path, pathObj:josa("'"+path+"'","을"), name:myName()}))}</p>
        <h2 class="job">${esc(r.job)}</h2>
        ${r.ai && r.type ? `<span class="note">${esc(t("endType",{t:r.type}))}</span>` : ""}
      </div>
    </div>
    <p class="story">${esc(r.desc)}</p>
    ${fresh ? `<div class="unlock"><b class="mono">${t("xp",{n:g.xp})}${g.lvAfter>g.lvBefore?` · ${t("lvUp",{n:g.lvAfter})}`:""}</b>
      <span>${g.newEnding ? esc(t("newEnding",{t:r.type})) : t("oldEnding")}</span>
      ${g.newAch.length ? `<span>${t("newAch")} ${g.newAch.map(id => `<b>${esc(t("a_"+id))}</b>`).join(", ")}</span>` : ""}
      ${g.perks.length ? `<span>${t("newPerk")} ${g.perks.map(p=>`<b>${esc(t("perk"+p))}</b>`).join(", ")}</span>` : ""}</div>` : ""}
    <div class="ticket">
      <div class="row" style="justify-content:space-between"><b>${t("satLabel")}</b><span class="mono" style="font-size:22px;font-weight:600">${r.sat}<span class="muted" style="font-size:14px"> / 100</span></span></div>
      ${statsHTML(r.stats)}
      <b style="margin-top:4px">${t("gainedLabel")}</b>
      <ul class="gained">${lifeLines(r.stats, r.flags).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>
    </div>
    ${r.letter ? `<div class="field"><label>${t("letterLabel")}</label><p class="letter">${esc(r.letter)}</p></div>` : `<p class="letter">${esc(epilogue(r.sat, r.cross.taken))}</p>`}
    <div class="goodbox">
      <div class="row" style="gap:10px">${HEART}<div style="display:flex;flex-direction:column"><b class="goodtitle">${t("goodTitle")}</b><span class="note">${esc(t("goodSub",{taken:r.cross.taken}))}</span></div></div>
      <ul>${goodLines(r.stats, r.cross.taken).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>
      <p class="goodclose">${esc(t("goodClose",{taken:r.cross.taken}))}</p>
    </div>
    ${storyBox(r)}
    ${highlights.length ? `<div class="field"><label>${t("highlights")}</label>${tl(highlights)}</div>` : ""}
    <details><summary>${t("allChoices",{n:r.log.length})}</summary>${tl(r.log)}</details>
    <div class="sharecta"><button class="btn share" id="share-open">${t("shareBtn")}</button><span class="note">${t("shareWhy")}</span></div>
    <div class="sharebox" id="sharebox" hidden></div>
    <div class="row">
      ${SAVE.crossroads.some(c=>c.id===r.cross.id) ? `<button class="btn" id="again">${t("again")}</button>` : ""}
      <button class="btn ghost" id="lobby">${t("toLobby")}</button>
      <button class="btn ghost" id="copy">${t("copy")}</button>
    </div>
    <p class="note" id="copy-note" aria-live="polite">${t("endNote",{m:r.minutes||"–"})}</p>
  </section>`;
  bindTop();
  bindStoryBox(r);
  if ($("#again")) $("#again").onclick = () => startCross(SAVE.crossroads.find(c=>c.id===r.cross.id));
  $("#lobby").onclick = () => { renderLobby(); toTop(); };
  $("#share-open").onclick = () => openShare(r);
  $("#copy").onclick = () => {
    const txt = summaryText(r), note = $("#copy-note");
    const fallback = () => { note.innerHTML = `${t("copyBlocked")}<textarea id="copy-box" rows="8" style="margin-top:8px">${esc(txt)}</textarea>`; $("#copy-box").select(); };
    try { navigator.clipboard.writeText(txt).then(()=>{ note.textContent = t("copiedResult"); }, fallback); } catch(e) { fallback(); }
  };
}

/* ============ boot ============ */
(async () => {
  document.documentElement.lang = LANG;
  try { await loadContent(LANG); } catch(e) { LANG = "ko"; await loadContent("ko"); }
  SAVE = loadSave();
  if (!SAVE.char) autoChar();
  renderLobby();
  try { if (window.claude && window.claude.use) window.claude.use("downloads").then(d => { downloadsApi = d; }).catch(()=>{}); } catch(e){}
  try {
    if (!window.claude || !window.claude.use) return;
    const s = await window.claude.use("sample");
    if (!s) return;
    sampleFn = s; engine = "ai";
    const box = document.getElementById("engine");
    if (box) {
      box.querySelectorAll("button").forEach(b => { b.disabled = false; b.setAttribute("aria-pressed", String(b.dataset.v === "ai")); });
      document.getElementById("ai-note").textContent = t("engAID");
    }
  } catch (e) {}
})();
