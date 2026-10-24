import {useEffect,useRef,useState} from "react";import {Panel} from "./ui";
const AB=[["СКИДКА 90%!!! ТОЛЬКО СЕГОДНЯ!!!",0],["Бесплатная доставка по Алматы за 60 минут",1],["Ты не поверишь, что мы сделали с кофе 😱",0],["Первый заказ в Kaspi с кэшбэком 10%",1],["Лучшие в мире, просто поверьте",0],["Студентам KBTU латте за 990 ₸ по карте",1],["Гарантия возврата в 14 дней",1],["Жми, пока не удалили!!!",0]];
// A/B-тест: свайп вправо = в запуск, влево = в мусор. 10 секунд.
export function ABTest({onDone}){
  const [i,setI]=useState(0),[ok,setOk]=useState(0),[t,setT]=useState(10),x0=useRef(0),fin=useRef(false);
  const end=o=>{if(!fin.current){fin.current=true;onDone(o/AB.length)}};
  const ans=v=>{const o=ok+(AB[i][1]===v?1:0);setOk(o);i+1>=AB.length?end(o):setI(i+1)};
  useEffect(()=>{const id=setInterval(()=>setT(s=>s-1),1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(t<=0)end(ok)},[t]);
  return <Panel><h2 className="font-pixel text-yellow-300 text-xs">A/B ТЕСТ · {t} с</h2><p className="text-sm text-indigo-200 mt-1">Свайпни креатив вправо, если он рабочий, и влево, если кликбейтный мусор.</p>
    <div onPointerDown={e=>x0.current=e.clientX} onPointerUp={e=>{const d=e.clientX-x0.current;if(d>50)ans(1);else if(d<-50)ans(0)}} className="mt-3 p-6 bg-white text-black text-xl font-bold text-center select-none touch-pan-y">{AB[i][0]}</div>
    <div className="flex gap-2 mt-3"><button className="btn text-center" onClick={()=>ans(0)}>👎 Мусор</button><button className="btn text-center" onClick={()=>ans(1)}>👍 В запуск</button></div>
    <p className="text-xs mt-2">{i+1}/{AB.length}</p></Panel>;
}
const HT=[{c:"Кофе у вас невкусный, а цены космос",a:[["Сам такой",0],["Спасибо за отзыв! Напишите в директ: исправим или вернём деньги",1],["Удалить комментарий",0]]},{c:"Это всё проплаченная реклама!",a:[["Да, мы работаем с блогерами, вот отзывы реальных гостей",1],["Не верите, не покупайте",0],["Пишите-пишите, вы нам рекламу делаете",0]]},{c:"Доставка опоздала на час!",a:[["Мы не виноваты, был дождь",0],["Приносим извинения, вернули доставку и дарим кофе",1],["Пишите в поддержку, тут не отвечаем",0]]}];
// Антикризисный SMM: 8 секунд на ответ хейтеру
export function AntiHate({onDone}){
  const [i,setI]=useState(0),[ok,setOk]=useState(0),[t,setT]=useState(8),fin=useRef(false);
  const next=(o,k)=>{if(k+1>=HT.length){if(!fin.current){fin.current=true;onDone(o/HT.length)}}else{setI(k+1);setT(8)}};
  const ans=v=>{const o=ok+v;setOk(o);next(o,i)};
  useEffect(()=>{const id=setInterval(()=>setT(s=>s-1),1000);return()=>clearInterval(id)},[i]);
  useEffect(()=>{if(t<=0)next(ok,i)},[t]);
  return <Panel><h2 className="font-pixel text-yellow-300 text-xs">АНТИКРИЗИСНЫЙ SMM · {t} с</h2>
    <p className="mt-3 p-3 bg-red-900 border-2 border-red-400">💬 «{HT[i].c}»</p>
    {HT[i].a.map(([x,v],k)=><button key={k} className="btn mt-2" onClick={()=>ans(v)}>{x}</button>)}<p className="text-xs mt-2">{i+1}/{HT.length}</p></Panel>;
}
