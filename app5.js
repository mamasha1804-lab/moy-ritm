// Улучшенный разбор голосового ввода еды и мобильной навигации
const FOOD_ALIASES={
'гречка':['гречка','гречки','гречку','гречкой','гречнев'],
'рис':['рис','риса','рисом'],
'картофель':['картофель','картофеля','картофел','картошк'],
'куриная грудка':['куриная грудка','куриной грудки','куриную грудку','грудка','грудки','грудку'],
'курица':['курица','курицы','курицу','курицей'],
'индейка':['индейка','индейки','индейку'],
'говядина':['говядина','говядины','говядину'],
'свинина':['свинина','свинины','свинину'],
'котлета':['котлета','котлеты','котлету'],
'огурец':['огурец','огурца','огурцы','огурцов'],
'помидор':['помидор','помидора','помидоры','помидоров','томат'],
'яблоко':['яблоко','яблока','яблок'],
'банан':['банан','банана','бананы','бананов'],
'сыр':['сыр','сыра','сыром'],
'tворог':['творог','творога','творогом'],
'яйцо':['яйцо','яйца','яиц'],
'кефир':['кефир','кефира'],
'молоко':['молоко','молока'],
'хлеб':['хлеб','хлеба'],
'овсянка':['овсянка','овсянки','овсянку','овсяной каш'],
'макароны':['макароны','макарон'],
'лосось':['лосось','лосося'],
'рыба':['рыба','рыбы','рыбу'],
'авокадо':['авокадо']
};
function foodKeyFromName(name){const s=name.toLowerCase().replace(/[.!?]/g,' ').replace(/\s+/g,' ').trim();return Object.entries(FOOD_ALIASES).find(([k,a])=>a.some(x=>s.includes(x)))?.[0]||Object.keys(FOOD).sort((a,b)=>b.length-a.length).find(x=>s.includes(x))||null}
calcFood=function(text){
 const items=[];
 const clean=String(text||'').toLowerCase().replace(/ё/g,'е').replace(/\b(съела|съел|съесть|поела|поел|ем|ела|ел|примерно|около|где-то|где то)\b/g,' ').replace(/\s+/g,' ').trim();
 const parts=clean.split(/[,;]|\s+и\s+/).map(x=>x.trim()).filter(Boolean);
 for(const part of parts){
   let grams=null,name='';
   let m=part.match(/(\d+(?:[.,]\d+)?)\s*(?:г|гр|грамм(?:а|ов)?)(?:\s+|$)(.+)/i);
   if(m){grams=parseFloat(m[1].replace(',','.'));name=m[2].trim()}
   if(!m){m=part.match(/(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:г|гр|грамм(?:а|ов)?)(?:\b|$)/i);if(m){name=m[1].trim();grams=parseFloat(m[2].replace(',','.'))}}
   if(!m){m=part.match(/(.+?)\s+(\d+(?:[.,]\d+)?)(?:\s*$)/i);if(m){name=m[1].trim();grams=parseFloat(m[2].replace(',','.'))}}
   if(!Number.isFinite(grams)||grams<=0||grams>5000)continue;
   const k=foodKeyFromName(name);if(!k||!FOOD[k])continue;
   const [kc,p,f,c]=FOOD[k],q=grams/100;items.push({name:k,grams,kcal:kc*q,protein:p*q,fat:f*q,carbs:c*q});
 }
 if(!items.length)return null;
 const sum=k=>items.reduce((s,x)=>s+x[k],0);
 return{items,total:{kcal:sum('kcal'),protein:sum('protein'),fat:sum('fat'),carbs:sum('carbs')},note:'Приблизительный расчёт по средним значениям. Проверь продукт и граммы перед сохранением.'}
};
const nav=document.querySelector('.nav');
if(nav){
 const st=document.createElement('style');
 st.textContent='.nav{scroll-snap-type:x proximity;padding-left:10px;padding-right:10px}.nav button{scroll-snap-align:center;flex:0 0 auto}.nav{display:flex}.nav button{min-width:72px}.nav button.on{min-width:82px}';
 document.head.appendChild(st);
 const centerActive=()=>document.querySelector('.nav button.on')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
 nav.addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(centerActive,30)});
 setTimeout(centerActive,150);
}
