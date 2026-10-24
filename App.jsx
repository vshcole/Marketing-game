import {useEffect,useState} from "react";
import {useG,startRun,resetRun} from "./store";import {SC,SHOP,TOD,WX,evNow} from "./data";
import {judge} from "./ai";import {simulate,qFrom,grade,chanSplit,funnel} from "./engine";
import Scene,{bus} from "./Scene";import {Hud,Metrics,Panel,Title,Dlg,PlanForm,FD,hearts} from "./ui";
import {ABTest,AntiHate} from "./Minigames";import {Shop,Certificate} from "./Meta";import Dash from "./Dash";
const set=useG.setState,cr=x=>Math.max(-3,Math.min(3,x));
export default function App(){
  const g=useG(),sc=SC.find(s=>s.id===g.scId),ev=sc&&g.cast.length?evNow(g):null,[emo,setEmo]=useState("normal"),[shop,setShop]=useState(false),[tab,setTab]=useState("res");
  const own=SHOP.filter(i=>g.me.items.includes(i.id)),bonus=own.reduce((s,i)=>s+i.b,0),auth=own.reduce((s,i)=>s+i.au,0),last=g.hist[g.hist.length-1],r=g.res;
  const env={tod:TOD[(g.week-1)%5],weather:WX[(g.week-1)%5],theme:sc?sc.theme:0x25346b};
  useEffect(()=>{if(g.phase==="event")setEmo(ev&&ev.s===2?"angry":"shock")},[g.phase,g.week]);
  // Выбор реакции: эффекты события (+автоэффект финала) и изменение отношений (авторитет усиливает рост)
  const pickOpt=i=>{
    const o=ev.o[i],d={...o[2]};if(ev.auto)Object.entries(ev.auto).forEach(([k,v])=>{d[k]=(d[k]||0)+v});
    const rd=(o[3]||0)+(o[3]>0&&auth>=2?1:0);
    set({opt:{t:o[0],q:o[1],d},rel:{...g.rel,[ev.id]:cr(g.rel[ev.id]+rd)},phase:"plan"});setEmo("normal");
  };
  // После мини-игры: ИИ/локальная оценка плана, юнит-экономика недели, запись аналитики
  const mini=async score=>{
    set({phase:"judging"});setEmo("tired");
    const j=await judge({plan:g.plan,sc,st:g.st,ev:{t:ev.n.n+": "+ev.t},opt:g.opt});
    const q=qFrom(j.fields),sim=simulate(sc,g.st,q,j.spend,g.opt,bonus+score*.08),salary=Math.round(40+sim.effQ*160+score*40);
    const ch=chanSplit(g.plan.ch+" "+(g.plan.msg||""),j.spend);
    set({phase:"result",st:sim.st,hist:[...g.hist,{w:g.week,cash:sim.st.cash,cac:sim.cac,ltv:sim.ltv,romi:sim.romi,churn:sim.churn,newC:sim.newC,fun:funnel(sim),ch}],res:{...sim,j,q,salary,npc:ev.id},me:{...g.me,money:g.me.money+salary}});
    setEmo(sim.effQ>=.55?"happy":sim.effQ>=.35?"normal":"angry");setTab("res");
    if(sim.profit>0)bus.emit("coin");if(sim.st.tr<g.st.tr)bus.emit("bad");bus.emit("float",sim.effQ>=.55?"😍":"😡");
  };
  const next=()=>{setShop(false);if(g.week>=5||g.st.cash<0)return set({phase:"final"});set({week:g.week+1,phase:"event",opt:null,plan:null})};
  const buy=i=>set({me:{money:g.me.money-i.p,items:[...g.me.items,i.id]}});
  return <div className="max-w-3xl mx-auto p-3 pb-16"><Scene env={env} emo={emo} npc={ev?{look:ev.n.look,name:ev.n.n+" · "+ev.n.role}:null}/>
    {!sc?<Panel><h1 className="font-pixel text-yellow-300 text-sm leading-relaxed">ДИРЕКТОР ПО МАРКЕТИНГУ: КЛИК И МАСШТАБ</h1><p className="mt-2 text-sm">Пять недель, пять сценариев Казахстана. Личные деньги: {g.me.money} тыс. ₸. Авторитет: {auth}.</p>
      {SC.map(s=><button key={s.id} className="btn mt-2" onClick={()=>startRun(s.id)}>{s.icon} {s.name}<span className="block text-xs font-normal">{s.tag}</span></button>)}
      {g.me.items.length>0||g.me.money>0?<button className="btn mt-3 text-center" onClick={()=>setShop(true)}>🛍 Магазин</button>:null}
      {shop&&<Shop me={g.me} onBuy={buy} onBack={()=>setShop(false)}/>}</Panel>
    :<>
      <div className="flex justify-between mt-3 text-xs"><span>{sc.icon} {sc.name}</span><button className="underline" onClick={resetRun}>В меню</button></div>
      <Hud st={g.st} week={g.week}/>{last&&last.cac!=null&&g.phase!=="final"&&<Metrics r={last}/>}
      {g.phase==="event"&&ev&&<>
        {ev.s===2&&<div className="text-center mt-3 font-pixel text-[10px] text-red-400 animate-pulse">⚠ КРИТИЧЕСКАЯ РАЗВИЛКА ⚠</div>}
        <Dlg npc={ev.n} emo={emo} title={ev.t} text={ev.x} rel={g.rel[ev.id]}/>
        {ev.o.map((o,i)=><button key={i} className="opt" style={{animationDelay:i*90+"ms"}} onClick={()=>pickOpt(i)}><b className="font-pixel text-yellow-300 text-xs">{i+1}</b><span>{o[0]}</span></button>)}</>}
      {g.phase==="plan"&&<><Panel><p className="text-xs">Реакция на событие: «{g.opt?.t}»</p></Panel><PlanForm onSubmit={plan=>set({plan,phase:"mini"})}/></>}
      {g.phase==="mini"&&(g.week%2?<ABTest onDone={mini}/>:<AntiHate onDone={mini}/>)}
      {g.phase==="judging"&&<Panel><p>Совет директоров считает юнит-экономику...</p></Panel>}
      {g.phase==="result"&&r&&(shop?<Shop me={g.me} onBuy={buy} onBack={()=>setShop(false)}/>:<>
        <div className="flex gap-2 mt-3">{[["res","Итоги"],["dash","Аналитика"]].map(([k,l])=><button key={k} className={"btn text-center "+(tab===k?"":"opacity-60")} onClick={()=>setTab(k)}>{l}</button>)}</div>
        {tab==="dash"?<Dash hist={g.hist}/>:<>
          <Panel><p className="text-xs text-indigo-200">Оценка: {r.j.src==="ai"?"Claude (ИИ)":"локальный движок"} · {g.cast.includes(r.npc)?`${r.npc==="aliya"?"Алия":r.npc==="asel"?"Асель":r.npc==="nurzhan"?"Нуржан":"Диас"} ${hearts(g.rel[r.npc])}`:""}</p>
            <p className="mt-2 font-bold">{r.j.roast}</p><p className="mt-2 text-sm">💡 {r.j.coach}</p>
            {FD.map(([k,l])=>r.j.fields[k]&&<p key={k} className="text-xs mt-1"><span className="text-yellow-300">{l} {r.j.fields[k].s}/10:</span> {r.j.fields[k].c}</p>)}</Panel>
          <Panel><p className="text-xs">Новых клиентов: {Math.round(r.newC)} · конверсия {(r.conv*100).toFixed(1)}% · прибыль {Math.round(r.profit)} тыс. ₸ · зарплата +{r.salary} тыс. ₸</p></Panel></>}
        <button className="btn mt-3 text-center" onClick={()=>setShop(true)}>🛍 Магазин ({g.me.money} тыс. ₸)</button>
        <button className="btn mt-2 text-center" onClick={next}>{g.week>=5||g.st.cash<0?"К сертификату":"Следующая неделя"}</button></>)}
      {g.phase==="final"&&r&&<><Certificate sc={sc} st={g.st} hist={g.hist} g={grade(g.st,sc.s)} res={r} cast={g.cast} rel={g.rel} onRestart={resetRun}/><Dash hist={g.hist}/></>}
    </>}
  </div>;
}
