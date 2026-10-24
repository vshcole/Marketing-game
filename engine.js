export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const KEYS=["aud","msg","ch","pro","bud","kpi"];
const W={aud:.2,msg:.15,ch:.2,pro:.2,bud:.1,kpi:.15};
export const qFrom=f=>clamp(KEYS.reduce((s,k)=>s+W[k]*((f[k]&&+f[k].s)||0),0)/10,0,1);
const CH=/таргет|tiktok|тикток|kaspi|каспи|2гис|2gis|баннер|аль-фараби|блогер|instagram|инста|threads|telegram|рассылк|linkedin|вебинар|seo|push|пуш|google/gi;
const cm=s=>s>=7?"Конкретно и по делу.":s>=4?"База есть, добавь цифр и деталей.":"Водянисто: нет конкретики.";
// Локальный движок оценки (fallback без интернета и API)
export function localJudge(p,sc,cash){
  const t=k=>(p[k]||"").trim(),L=k=>t(k).length,ls=(k,n)=>clamp(L(k)/n*5,0,5),has=(k,re)=>re.test(t(k))?4:0,f={};
  f.aud=Math.round(ls("aud",40)+has("aud",/\d{2}\s*[-–]\s*\d{2}|студент|мам|школьн|владельц|менеджер|женщин|мужчин|kbtu|almau|hr|b2b/i)+(L("aud")>70?1:0));
  f.msg=Math.round(ls("msg",40)+has("msg",/потому что|отлич|быстр|дешев|гарант|уникал|качеств|за \d+/i)+(L("msg")>70?1:0));
  f.ch=Math.round(clamp(new Set((t("ch").toLowerCase().match(CH)||[])).size*3+ls("ch",40)/2,0,10));
  f.pro=Math.round(ls("pro",30)+has("pro",/скидк|акци|бонус|кэшбэк|kaspi|каспи|подар|промокод|рассрочк|пробн|бесплатн|лояльн|2\+1/i)+(L("pro")>60?1:0));
  const m=t("bud").replace(/\s/g,"").match(/\d+(?:[.,]\d+)?/),n=m?parseFloat(m[0].replace(",",".")):0;
  f.bud=n<=0?0:n>cash?2:n<=cash*.5?8:5;
  f.kpi=Math.round(clamp((t("kpi").match(/cac|ltv|romi|конверс|охват|churn|отток|ctr|заявк|повторн|%/gi)||[]).length*3+ls("kpi",20)/2,0,10));
  const out={};KEYS.forEach(k=>{const s=clamp(L(k)<12?Math.min(f[k],3):f[k],0,10);out[k]={s,c:cm(s)}});
  const q=qFrom(out),o=sc.owner;
  return {src:"local",fields:out,spend:clamp(n,0,Math.max(cash,0)),
    roast:q<.35?`${o}: «Ты сжёг бюджет на воздух. Я просил план, а получил настроение.»`:q<.65?`${o}: «Неплохо, но цифр и конкретики маловато. Клиенты не покупают намерения.»`:`${o}: «Вот это уже похоже на работу маркетолога. Продолжай в том же духе.»`,
    coach:"Опиши аудиторию цифрами (возраст, где бывает), выбери 2–3 канала и посчитай KPI заранее."};
}
// Юнит-экономика недели
export function simulate(sc,st,q,spend,opt,bonus){
  const e=sc.e,effQ=clamp(q*.85+opt.q*.15+bonus,0,1);
  const cac=e.cac*(1.6-1.1*effQ)*(1.15-st.aw/400),newC=spend*1000/cac;
  const churn=clamp(e.ch*(1.5-st.tr/100),.02,.6),c2=Math.round(st.c*(1-churn)+newC);
  const revenue=c2*e.t*e.f/1000,profit=revenue*e.m-e.fx-spend;
  const ltv=e.t*e.f*e.m*Math.min(1/churn,26),romi=((newC*ltv/1000)-spend)/Math.max(spend,1);
  const d=opt.d||{};
  return {effQ,cac,newC,churn,ltv,romi,conv:.02+.06*effQ,revenue,profit,spend,
    st:{c:c2,aw:clamp(st.aw+14*effQ*Math.min(1,spend/300)+(d.aw||0)-(effQ<.3?2:0),0,100),tr:clamp(st.tr+12*(effQ-.4)+(d.tr||0),0,100),cash:st.cash+profit+(d.cash||0)}};
}
export function grade(st,start){
  if(st.cash<0)return "D";
  const p=st.tr*.3+st.aw*.2+clamp(st.cash/start.cash*25,0,50);
  return p>=80?"S":p>=65?"A":p>=50?"B":p>=35?"C":"D";
}

// Расходы по каналам (для дашборда): бюджет делится между найденными в плане каналами
export const CHN={"Таргет Instagram":/таргет|instagram|инста/i,"TikTok":/tiktok|тикток/i,"Kaspi":/kaspi|каспи/i,"2GIS":/2гис|2gis/i,"Наружка":/баннер|аль-фараби|абая|наружн/i,"Блогеры":/блогер|интеграц/i,"Вузы":/kbtu|almau|kaznu|вуз|универ/i,"Рассылки":/рассылк|telegram|email|push|пуш/i};
export function chanSplit(text,spend){const f=Object.keys(CHN).filter(k=>CHN[k].test(text||"")),l=f.length?f:["Прочее"];return l.map(k=>[k,spend/l.length])}
export const funnel=r=>{const reach=r.newC/Math.max(r.conv,.01);return[["Охват",reach],["Интерес",reach*.35],["Заявки",reach*.12],["Покупки",r.newC]]};
