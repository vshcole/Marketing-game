import {useEffect,useState} from "react";
export const FD=[["aud","Целевая аудитория","Кому продаёшь? Возраст, привычки, где бывают (напр. студенты KBTU 18–22).",1],["msg","Оффер и сообщение","Чем отличаешься и что запомнят?",0],["ch","Каналы продвижения","Таргет Instagram, TikTok-хаусы, Kaspi-акции, 2GIS, баннеры на Аль-Фараби, блогеры...",1],["pro","Стимулирование спроса","Акция, подарок, лояльность, Kaspi-рассрочка...",1],["bud","Бюджет недели, тыс. ₸","Число и распределение по каналам.",0],["kpi","KPI","CAC, конверсия, ROMI, повторные визиты...",0]];
export const Panel=({children,className=""})=><div className={"card p-3 mt-3 "+className}>{children}</div>;
export const Title=({children})=><h2 className="font-pixel text-yellow-300 text-xs leading-relaxed">{children}</h2>;
export const hearts=r=>"♥".repeat(Math.max(0,r))+"♡".repeat(Math.max(0,3-Math.max(0,r)))+(r<0?" ⚡".repeat(-r):"");
export function Hud({st,week}){
  const T=[["⭐","Известность",st.aw,100],["🤝","Доверие",st.tr,100],["👥","Клиенты",st.c],["💰","Касса, тыс. ₸",st.cash]];
  return <div className="mt-3"><div className="flex gap-1 mb-2">{[1,2,3,4,5].map(w=><div key={w} className={"h-2 flex-1 border-2 border-black "+(w<week?"bg-yellow-300":w===week?"bg-orange-400 animate-pulse":"bg-indigo-900")}/>)}</div>
    <div className="grid grid-cols-2 gap-2">{T.map(([i,l,v,m])=><div key={l} className="card p-2" style={{boxShadow:"0 0 0 2px #000"}}><div className="text-[10px] text-indigo-200">{i} {l}</div>
      <div className={"font-pixel text-sm mt-1 "+(!m&&l.startsWith("Касса")&&v<500?"text-red-400":"text-yellow-300")}>{Math.round(v)}{m?"%":""}</div>
      {m&&<div className="h-1.5 bg-indigo-950 mt-1"><div className="h-full bg-yellow-300 transition-all duration-700" style={{width:Math.min(100,v)+"%"}}/></div>}</div>)}</div></div>;
}
// Диалог NPC: портрет с эмоцией, отношения, печатающийся текст (тап пропускает анимацию)
const FACE={normal:"🙂",shock:"😲",happy:"😄",angry:"😡",tired:"😮‍💨"};
export function Dlg({npc,title,text,rel,emo="normal"}){
  const [n,setN]=useState(0);
  useEffect(()=>{setN(0);const id=setInterval(()=>setN(k=>k+2),20);return()=>clearInterval(id)},[text]);
  return <div className="card p-3 mt-3 flex gap-3" onClick={()=>setN(999)}>
    <div className="por" style={{background:npc.c}}>{FACE[emo]||FACE.normal}<span className="absolute -bottom-2 -right-2 text-xl">{npc.e}</span></div>
    <div className="min-w-0"><div className="font-pixel text-[10px] text-yellow-300 leading-relaxed">{npc.n.toUpperCase()} · {npc.role}</div>
      <div className="text-xs text-orange-300 mt-1" title="Отношения">{hearts(rel)}</div>
      <h2 className="font-bold mt-2">{title}</h2><p className="mt-1 text-sm">{text.slice(0,n)}<span className="opacity-60">{n<text.length?"▌":""}</span></p></div></div>;
}
// Ключевые метрики юнит-экономики последней недели
export function Metrics({r}){
  const T=[["CAC",Math.round(r.cac)+" ₸"],["LTV",Math.round(r.ltv)+" ₸"],["ROMI",Math.round(r.romi*100)+"%"],["Churn",Math.round(r.churn*100)+"%"]];
  return <div className="grid grid-cols-4 gap-2 mt-2">{T.map(([a,b])=><div key={a} className="card p-2 text-center" style={{boxShadow:"0 0 0 2px #000"}}><div className="text-[9px] text-indigo-200">{a}</div><div className="font-pixel text-[10px] text-yellow-300 mt-1">{b}</div></div>)}</div>;
}
export function PlanForm({onSubmit}){
  const [v,setV]=useState({}),[err,setErr]=useState("");
  const go=()=>{const bad=FD.filter(f=>f[3]&&(v[f[0]]||"").trim().length<10);if(bad.length)return setErr("Заполни подробнее: "+bad.map(f=>f[1]).join(", "));onSubmit(v)};
  return <Panel><Title>ПЛАН НЕДЕЛИ</Title>
    {FD.map(([k,l,h,r])=><label key={k} className="block mt-3"><span className="text-yellow-300 text-sm font-bold">{l}{r?" *":""}</span><span className="block text-xs text-indigo-200 mb-1">{h}</span>
      <textarea rows={2} maxLength={400} value={v[k]||""} onChange={e=>setV({...v,[k]:e.target.value})} className="w-full p-2 text-black text-base border-4 border-black"/></label>)}
    {err&&<p className="text-red-400 text-sm mt-2">{err}</p>}<button onClick={go} className="btn mt-4 text-center">🚀 Запустить неделю</button></Panel>;
}
