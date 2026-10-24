import {Panel,Title} from "./ui";
// Линейный график двух рядов (CAC и LTV), нормированных по максимуму
const Line=({a,b,W=300,H=90})=>{
  const mx=Math.max(...a,...b,1),P=s=>s.map((v,i)=>`${i?"L":"M"}${(i/Math.max(s.length-1,1))*W},${H-(v/mx)*H}`).join(" ");
  return <svg viewBox={`-4 -4 ${W+8} ${H+8}`} className="w-full bg-[#0b1030]"><path d={P(a)} stroke="#ff8a80" fill="none" strokeWidth="3"/><path d={P(b)} stroke="#7fd68a" fill="none" strokeWidth="3"/></svg>;
};
const Bars=({rows,color})=>{
  const mx=Math.max(...rows.map(r=>r[1]),1);
  return <div className="mt-2">{rows.map(([l,v])=><div key={l} className="mt-1"><div className="flex justify-between text-xs"><span>{l}</span><span>{Math.round(v)}</span></div><div className="h-3 bg-[#0b1030]"><div className="h-full" style={{width:(v/mx*100)+"%",background:color}}/></div></div>)}</div>;
};
export default function Dash({hist}){
  const w=hist.filter(h=>h.cac!=null),ch={};w.forEach(h=>(h.ch||[]).forEach(([k,v])=>{ch[k]=(ch[k]||0)+v}));const last=w[w.length-1];
  return <Panel><Title>АНАЛИТИКА</Title>{!last?<p className="text-sm mt-2">Данные появятся после первой недели.</p>:<>
    <p className="text-xs mt-3 text-indigo-200">CAC (красный) против LTV (зелёный) по неделям</p><Line a={w.map(h=>h.cac)} b={w.map(h=>h.ltv)}/>
    <p className="text-xs mt-3 text-indigo-200">Воронка последней недели</p><Bars rows={last.fun} color="#ffd54f"/>
    <p className="text-xs mt-3 text-indigo-200">Расходы по каналам, тыс. ₸</p><Bars rows={Object.entries(ch)} color="#4fc3f7"/></>}</Panel>;
}
