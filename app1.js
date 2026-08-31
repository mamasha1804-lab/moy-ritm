const K='moy-ritm-data-v2';
const D={startWeight:null,goalWeight:null,stepsGoal:8000,meds:[],days:{},vitals:[],nextMedId:1};
let d;try{d={...structuredClone(D),...JSON.parse(localStorage.getItem(K)||'{}')}}catch{d=structuredClone(D)}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],pad=n=>String(n).padStart(2,'0');
const key=(x=new Date)=>`${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`;
const today=()=>d.days[key()]||(d.days[key()]={});
const save=()=>localStorage.setItem(K,JSON.stringify(d));
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
$('#date').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
$('#month').textContent=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(new Date());
function go(id){$$('.screen').forEach(x=>x.classList.toggle('on',x.id===id));$$('.nav button').forEach(x=>x.classList.toggle('on',x.dataset.screen===id));scrollTo(0,0)}
$$('[data-screen]').forEach(b=>b.onclick=()=>go(b.dataset.screen));$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
const periodName=p=>({morning:'Утро',day:'День',evening:'Вечер',other:'Другое'})[p]||'Другое';
function renderMeds(){const t=today(),taken=t.taken||[];let html='';for(const p of ['morning','day','evening','other']){const a=d.meds.filter(m=>m.period===p);if(!a.length)continue;html+=`<div class="grp">${periodName(p)}</div>`+a.map(m=>`<div class="med"><button class="tick ${taken.includes(m.id)?'done':''}" data-med="${m.id}">${taken.includes(m.id)?'✓':'○'}</button><div><b>${esc(m.name)}</b><div class="small muted">${esc(m.dose||'доза не указана')}<span class="tag">${periodName(m.period)}${m.time?' · '+m.time:''}</span></div></div><div class="actions"><button class="ib" data-edit="${m.id}">✎</button><button class="ib" data-del="${m.id}">×</button></div></div>`).join('')}
$('#medList').innerHTML=$('#todayMeds').innerHTML=html||'<span class="small muted">Препараты пока не добавлены.</span>';$('#mc').textContent=`${taken.length} из ${d.meds.length} принято`;
$$('[data-med]').forEach(b=>b.onclick=()=>{const id=+b.dataset.med,t=today();t.taken=t.taken||[];t.taken=t.taken.includes(id)?t.taken.filter(x=>x!==id):[...t.taken,id];save();renderMeds();renderCalendar()});
$$('[data-del]').forEach(b=>b.onclick=()=>{const id=+b.dataset.del;if(confirm('Удалить препарат?')){d.meds=d.meds.filter(x=>x.id!==id);Object.values(d.days).forEach(x=>x.taken&&(x.taken=x.taken.filter(v=>v!==id)));save();renderMeds()}});
$$('[data-edit]').forEach(b=>b.onclick=()=>{const m=d.meds.find(x=>x.id===+b.dataset.edit);const n=prompt('Название',m.name);if(n===null||!n.trim())return;const z=prompt('Дозировка',m.dose||'');if(z===null)return;m.name=n.trim();m.dose=z.trim();save();renderMeds()})}
$('#add').onclick=()=>{const n=$('#mn').value.trim();if(!n)return $('#ms').textContent='Введите название.';d.meds.push({id:d.nextMedId++,name:n,dose:$('#md').value.trim(),period:$('#mp').value,time:$('#mt').value});save();$('#mn').value=$('#md').value=$('#mt').value='';$('#ms').textContent='Добавлено.';renderMeds()};
