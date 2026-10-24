import {useState} from "react";import {Panel,Title,hearts} from "./ui";import {SHOP,NPC} from "./data";
export function Shop({me,onBuy,onBack}){
  return <Panel><Title>МАГАЗИН · {me.money} тыс. ₸</Title><p className="text-xs text-indigo-200 mt-1">Кабинет даёт бонус к качеству плана, флекс-вещи дают авторитет: при авторитете 2+ хорошие ответы NPC сильнее улучшают отношения.</p>
    {SHOP.map(i=>{const own=me.items.includes(i.id);return <button key={i.id} disabled={own||me.money<i.p} onClick={()=>onBuy(i)} className="btn mt-2">{i.e} {i.n}: {i.p} тыс. ₸<span className="block text-xs font-normal">{i.b?`+${Math.round(i.b*100)}% к качеству `:""}{i.au?`+${i.au} авторитета`:""}{own?" ✓ куплено":""}</span></button>})}
    <button onClick={onBack} className="btn mt-3 text-center">Назад</button></Panel>;
}
const fate=r=>r>=2?"верный союзник":r>=1?"союзник":r<=-2?"злейший враг":r<=-1?"недоброжелатель":"нейтрален";
export function Certificate({sc,st,hist,g,res,cast,rel,onRestart}){
  const [ok,setOk]=useState(false),pts=hist.map(h=>h.cash),mx=Math.max(...pts,1),mn=Math.min(...pts,0),W=300,H=80,wk=hist.filter(h=>h.cac!=null);
  const path=pts.map((v,i)=>`${i?"L":"M"}${(i/Math.max(pts.length-1,1))*W},${H-((v-mn)/(mx-mn||1))*H}`).join(" ");
  const cac0=wk[0]?Math.round(wk[0].cac):0,cac1=Math.round(res.cac);
  const md=`**Кейс CMO Sim: ${sc.name}**\n- Рейтинг: ${g}\n- Вырастил кассу с ${Math.round(hist[0].cash)} до ${Math.round(st.cash)} тыс. ₸ за 5 недель\n- CAC: ${cac0} → ${cac1} ₸, LTV ${Math.round(res.ltv)} ₸, ROMI ${Math.round(res.romi*100)}%, отток ${Math.round(res.churn*100)}%\n- Известность ${Math.round(st.aw)}%, доверие ${Math.round(st.tr)}%, клиентов ${st.c}\n- Команда: ${cast.map(k=>NPC[k].n+" ("+fate(rel[k])+")").join(", ")}\n- Решал кризисы (налоговая, блогеры, конкуренты) и работал с каналами Kaspi, 2GIS, таргет, TikTok.`;
  return <Panel className="text-center"><Title>СЕРТИФИКАТ CMO</Title>
    <div className="font-pixel text-6xl text-yellow-300 my-3">{g}</div><p className="font-bold">{sc.name}</p>
    <svg viewBox={`-4 -4 ${W+8} ${H+8}`} className="w-full mt-3 bg-[#0b1030]"><path d={path} fill="none" stroke="#ffd54f" strokeWidth="3"/></svg>
    <p className="text-xs text-indigo-200 mt-1">Динамика кассы по неделям</p>
    <div className="text-left text-sm mt-3">{cast.map(k=><p key={k}>{NPC[k].e} {NPC[k].n}: {fate(rel[k])} <span className="text-orange-300">{hearts(rel[k])}</span></p>)}</div>
    <pre className="text-left text-xs whitespace-pre-wrap bg-[#0b1030] p-2 mt-3">{md}</pre>
    <button className="btn mt-3 text-center" onClick={()=>navigator.clipboard.writeText(md).then(()=>setOk(true)).catch(()=>{})}>{ok?"Скопировано ✓":"Скопировать кейс для резюме и LinkedIn"}</button>
    <button className="btn mt-2 text-center" onClick={onRestart}>Новая игра</button></Panel>;
}
