const KEY = "dlsTournamentHub_v1";
const starter = {title:"DLS Tournament",teams:[],matches:[]};
let data = loadData();
let currentFilter = "all";
function loadData(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(starter)}catch{return structuredClone(starter)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function stats(){
 const map={};data.teams.forEach(t=>map[t]={team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
 data.matches.filter(m=>m.played).forEach(m=>{
  const h=map[m.home],a=map[m.away];if(!h||!a)return;
  h.p++;a.p++;h.gf+=m.hs;h.ga+=m.as;a.gf+=m.as;a.ga+=m.hs;
  if(m.hs>m.as){h.w++;h.pts+=3;a.l++}else if(m.hs<m.as){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}
 });
 return Object.values(map).map(x=>({...x,gd:x.gf-x.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team.localeCompare(b.team));
}
function dateText(v){if(!v)return "Date to be announced";const d=new Date(v);return isNaN(d)?"Date to be announced":d.toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}
function render(){
 document.getElementById("tournamentTitle").textContent=data.title;
 document.getElementById("nameInput").value=data.title;
 const played=data.matches.filter(m=>m.played).length;
 document.getElementById("matchCount").textContent=played;
 document.getElementById("teamCount").textContent=data.teams.length;
 document.getElementById("upcomingCount").textContent=data.matches.length-played;
 const rows=stats();
 document.getElementById("standingsBody").innerHTML=rows.length?rows.map((r,i)=>`<tr><td class="rank">${i+1}</td><td>${escapeHTML(r.team)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd>0?"+":""}${r.gd}</td><td class="points">${r.pts}</td></tr>`).join(""):'<tr><td colspan="10" class="empty">Add teams and enter results to build the table.</td></tr>';
 const matches=data.matches.filter(m=>currentFilter==="all"||(currentFilter==="played"?m.played:!m.played)).slice().sort((a,b)=>(a.date||"").localeCompare(b.date||""));
 document.getElementById("matchesList").innerHTML=matches.length?matches.map(m=>`<article class="match-card"><div class="match-meta"><span>${escapeHTML(dateText(m.date))}</span><span class="status ${m.played?"played":""}">${m.played?"Full time":"Upcoming"}</span></div><div class="match-teams"><span class="team-name">${escapeHTML(m.home)}</span><span class="score">${m.played?`${m.hs} - ${m.as}`:'<span class="vs">VS</span>'}</span><span class="team-name">${escapeHTML(m.away)}</span></div></article>`).join(""):'<p class="empty">No matches in this view yet.</p>';
 const options=data.teams.map(t=>`<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join("");
 ["homeTeam","awayTeam"].forEach(id=>document.getElementById(id).innerHTML=options||'<option value="">Add teams first</option>');
 const available=data.matches.filter(m=>!m.played);
 document.getElementById("matchSelect").innerHTML=available.map(m=>`<option value="${m.id}">${escapeHTML(m.home)} vs ${escapeHTML(m.away)}</option>`).join("")||'<option value="">No unplayed fixtures</option>';
 document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===currentFilter));
}
document.getElementById("settingsForm").addEventListener("submit",e=>{e.preventDefault();const v=document.getElementById("nameInput").value.trim();if(v){data.title=v;save()}});
document.getElementById("teamForm").addEventListener("submit",e=>{e.preventDefault();const v=document.getElementById("teamInput").value.trim();if(!v)return;if(data.teams.some(t=>t.toLowerCase()===v.toLowerCase()))return alert("That team is already on the list.");data.teams.push(v);document.getElementById("teamInput").value="";save()});
document.getElementById("fixtureForm").addEventListener("submit",e=>{e.preventDefault();const h=document.getElementById("homeTeam").value,a=document.getElementById("awayTeam").value;if(!h||!a)return alert("Add at least two teams first.");if(h===a)return alert("Choose two different teams.");data.matches.push({id:Date.now().toString(),home:h,away:a,date:document.getElementById("matchDate").value,played:false});document.getElementById("matchDate").value="";save()});
document.getElementById("resultForm").addEventListener("submit",e=>{e.preventDefault();const m=data.matches.find(x=>x.id===document.getElementById("matchSelect").value);if(!m)return alert("Create a fixture first.");m.hs=Number(document.getElementById("homeScore").value);m.as=Number(document.getElementById("awayScore").value);m.played=true;save()});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;render()}));
document.getElementById("resetBtn").addEventListener("click",()=>{if(confirm("Delete all teams, fixtures and results from this browser?")){data=structuredClone(starter);save()}});
document.getElementById("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dls-tournament-data.json";a.click();URL.revokeObjectURL(a.href)});
document.getElementById("importBtn").addEventListener("click",()=>document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.title||!Array.isArray(x.teams)||!Array.isArray(x.matches))throw Error();data=x;save();alert("Tournament data imported.")}catch{alert("That file is not valid tournament data.")}e.target.value=""});
render();