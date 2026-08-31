// Главный голосовой помощник на экране «Сегодня»
(()=>{
const todayScreen=document.querySelector('#today');if(!todayScreen)return;
const box=document.createElement('div');
box.className='card voiceBoss';
box.innerHTML=`<div class="row"><div><b>Главный микрофон</b><div class="small muted">Расскажи всё одной фразой — я разложу по дневнику</div></div><span class="badge">🎙️</span></div>
<button class="btn pri bossMic" id="bossMic">🎙️ Говорить</button>
<div class="field"><label>Что распознано</label><textarea id="bossText" placeholder="Например: выпила Редуксин и Престариум, прошла 5000 шагов, выпила стакан воды, давление 125 на 80, пульс 76, настроение отличное"></textarea></div>
<button class="btn" id="bossParse" style="width:100%">Разобрать запись</button>
<div id="bossStatus" class="status"></div>
<div id="bossPreview" hidden><div class="report" id="bossPreviewText"></div><div class="grid" style="margin-top:10px"><button class="btn" id="bossCancel">Отмена</button><button class="btn pri" id="bossSave" style="margin-top:0">Всё верно — записать</button></div></div>`;
const firstCard=todayScreen.querySelector('.card');
firstCard?.insertAdjacentElement('afterend',box);

const $b=s=>box.querySelector(s);let pendingBoss=null;
const norm=s=>String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[.,;!?]/g,' ').replace(/\s+/g,' ').trim();
const moodMap=[['отличн','Отличное'],['прекрасн','Отличное'],['хорош','Хорошее'],['обычн','Обычное'],['устал','Усталость'],['плох','Плохое'],['тревож','Тревожное'],['раздраж','Раздражительность']];
const symptomsBoss=[['сердцеби','Сердцебиение'],['тревог','Тревога'],['голов','Головная боль'],['тошнот','Тошнота'],['сухост','Сухость во рту'],['изжог','Изжога']];
function findNum(t,re,min,max){const m=t.match(re);if(!m)return null;const v=parseFloat(String(m[1]).replace(',','.'));return Number.isFinite(v)&&v>=min&&v<=max?v:null}
function parseBoss(raw){
 const t=norm(raw),out={medIds:[],medNames:[],unknownMeds:[],notes:[]};
 // лекарства: отмечаем только уже добавленные препараты
 for(const m of d.meds){const n=norm(m.name);if(n&&t.includes(n)){out.medIds.push(m.id);out.medNames.push(m.name)}}
 const knownNames=['редуксин','престариум','конкор'];
 for(const n of knownNames){if(t.includes(n)&&!out.medNames.some(x=>norm(x).includes(n)))out.unknownMeds.push(n)}
 if(t.includes('редуксин'))out.reduxinTaken=!/(редуксин[^.]{0,20}(не приним|не пила|не выпила))/.test(t);
 const sm=t.match(/(?:прошла|прошел|сделала|сделал|находила|шагов|шаги)[^\d]{0,20}(\d{2,6})\s*(?:шаг|шагов|шаги)?/)||t.match(/(\d{2,6})\s*(?:шаг|шагов|шаги)/);if(sm){out.steps=Math.min(100000,+sm[1]);out.addSteps=/\bеще\b/.test(t)}
 const wm=t.match(/(?:выпила|выпил|пила|пил)?\s*(\d+)?\s*(?:стакан|стакана|стаканов)\s+(?:теплой\s+|тёплой\s+)?вод/);if(wm)out.waterGlasses=wm[1]?Math.max(1,Math.min(20,+wm[1])):1;
 const ml=t.match(/(\d{2,4})\s*(?:мл|миллилитр)/);if(ml&&/вод/.test(t))out.waterMl=Math.min(5000,+ml[1]);
 const bp=t.match(/(?:давление\s*)?(\d{2,3})\s*(?:на|\/|\\)\s*(\d{2,3})/);if(bp){const s=+bp[1],q=+bp[2];if(s>=50&&s<=260&&q>=30&&q<=180){out.sys=s;out.dia=q}}
 out.pulse=findNum(t,/(?:пульс|чсс)\s*(\d{2,3})/,25,250);
 out.appetite=findNum(t,/(?:аппетит)\s*(?:на\s*)?(\d+(?:[.,]\d+)?)/,0,10);
 out.sleep=findNum(t,/(?:спала|спал|сон|спала примерно|спал примерно)\s*(\d+(?:[.,]\d+)?)\s*(?:час|часа|часов)?/,0,24);
 out.weight=findNum(t,/(?:вес|вешу)\s*(\d{2,3}(?:[.,]\d+)?)/,30,350);
 for(const [k,v] of moodMap)if(t.includes(k)){out.mood=v;break}
 out.symptoms=[];for(const [k,v] of symptomsBoss)if(t.includes(k)&&!new RegExp(`(?:нет|без)\\s+[^ ]*${k}|${k}[^ ]*\\s+нет`).test(t))out.symptoms.push(v);
 if(/нет жалоб|ничего не беспокоит|жалоб нет/.test(t))out.symptoms=['Нет жалоб'];
 return out;
}
function previewText(o){const a=[];if(o.medNames.length)a.push('💊 Принято: '+o.medNames.join(', '));if(o.unknownMeds.length)a.push('⚠️ Не найдены в списке лекарств: '+o.unknownMeds.join(', '));if(o.reduxinTaken!==undefined)a.push('R Редуксин: '+(o.reduxinTaken?'принят':'не принят'));if(Number.isFinite(o.steps))a.push('👣 Шаги: '+(o.addSteps?'+':'')+o.steps.toLocaleString('ru-RU'));if(o.waterGlasses)a.push('💧 Вода: +'+o.waterGlasses+' стакан(а)');if(o.waterMl)a.push('💧 Вода: +'+o.waterMl+' мл');if(o.sys&&o.dia)a.push('❤️ Давление: '+o.sys+'/'+o.dia);if(o.pulse)a.push('♡ Пульс: '+o.pulse);if(Number.isFinite(o.appetite))a.push('🍽 Аппетит: '+o.appetite+'/10');if(Number.isFinite(o.sleep))a.push('😴 Сон: '+o.sleep+' ч');if(o.mood)a.push('🙂 Настроение: '+o.mood);if(Number.isFinite(o.weight))a.push('⚖ Вес: '+String(o.weight).replace('.',',')+' кг');if(o.symptoms?.length)a.push('📝 Ощущения: '+o.symptoms.join(', '));return a.length?a.join('\n'):'Не удалось уверенно выделить данные. Можно изменить текст и попробовать снова.'}
function doParse(){pendingBoss=parseBoss($b('#bossText').value);$b('#bossPreviewText').textContent=previewText(pendingBoss);$b('#bossPreview').hidden=false;$b('#bossStatus').textContent='Проверь запись перед сохранением.'}
$b('#bossParse').onclick=doParse;$b('#bossCancel').onclick=()=>{$b('#bossPreview').hidden=true;pendingBoss=null;$b('#bossStatus').textContent='Отменено.'};
$b('#bossSave').onclick=()=>{const o=pendingBoss;if(!o)return;const t=today();
 if(o.medIds.length){t.taken=t.taken||[];for(const id of o.medIds)if(!t.taken.includes(id))t.taken.push(id)}
 if(o.reduxinTaken!==undefined){t.reduxin=t.reduxin||{};t.reduxin.taken=o.reduxinTaken}
 if(Number.isFinite(o.steps))t.steps=o.addSteps?(t.steps||0)+o.steps:o.steps;
 if(o.waterGlasses)t.waterGlasses=(t.waterGlasses||0)+o.waterGlasses;if(o.waterMl)t.waterMl=(t.waterMl||0)+o.waterMl;
 if(o.sys&&o.dia){d.vitals.push({date:key(),sys:o.sys,dia:o.dia,pulse:o.pulse||0,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});t.reduxin=t.reduxin||{};t.reduxin.sys=o.sys;t.reduxin.dia=o.dia;if(o.pulse)t.reduxin.pulse=o.pulse}
 else if(o.pulse){t.reduxin=t.reduxin||{};t.reduxin.pulse=o.pulse}
 if(Number.isFinite(o.appetite)){t.appetite=o.appetite;t.reduxin=t.reduxin||{};t.reduxin.appetite=o.appetite}
 if(Number.isFinite(o.sleep)){t.reduxin=t.reduxin||{};t.reduxin.sleep=o.sleep}
 if(o.mood){t.mood=o.mood;t.reduxin=t.reduxin||{};t.reduxin.mood=o.mood}
 if(Number.isFinite(o.weight)){t.weight=Math.round(o.weight*10)/10;if(!Number.isFinite(d.startWeight))d.startWeight=t.weight}
 if(o.symptoms?.length){t.symptoms=o.symptoms;t.reduxin=t.reduxin||{};t.reduxin.symptoms=o.symptoms.filter(x=>x!=='Нет жалоб')}
 save();renderHome();renderMeds();renderChips();renderWeight();renderVitals();renderCalendar();renderRx();renderRxSummary();renderSteps();$b('#bossPreview').hidden=true;$b('#bossStatus').textContent='Готово — данные распределены по дневнику.';$b('#bossText').value='';pendingBoss=null};
const SRB=window.SpeechRecognition||window.webkitSpeechRecognition;let bossRec=null;if(SRB){bossRec=new SRB();bossRec.lang='ru-RU';bossRec.interimResults=false;bossRec.continuous=false;bossRec.onstart=()=>{$b('#bossMic').textContent='⏹ Слушаю…';$b('#bossMic').classList.add('listening')};bossRec.onend=()=>{$b('#bossMic').textContent='🎙️ Говорить';$b('#bossMic').classList.remove('listening')};bossRec.onresult=e=>{const s=e.results[0][0].transcript;$b('#bossText').value=s;$b('#bossStatus').textContent='Распознано. Разбираю…';doParse()};bossRec.onerror=()=>{$b('#bossStatus').textContent='Не удалось распознать речь. Можно продиктовать через микрофон клавиатуры.'};$b('#bossMic').onclick=()=>{try{bossRec.start()}catch{bossRec.stop()}}}else{$b('#bossMic').disabled=true;$b('#bossStatus').textContent='Голос браузером не поддерживается — можно использовать микрофон клавиатуры.'}
})();
