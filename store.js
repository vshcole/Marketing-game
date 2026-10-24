import {create} from "zustand";import {persist} from "zustand/middleware";
import {SC,NPC,relInit} from "./data";
const init={scId:null,week:1,phase:"menu",st:null,cast:[],rel:{},opt:null,plan:null,res:null,hist:[],me:{money:0,items:[]}};
export const useG=create(persist(()=>({...init}),{name:"cmo-save",version:2,partialize:s=>({...s,phase:s.phase==="judging"?"plan":s.phase})}));
export const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
export const startRun=id=>{const sc=SC.find(s=>s.id===id);useG.setState({scId:id,week:1,phase:"event",st:{...sc.s},cast:shuffle(Object.keys(NPC)).slice(0,2),rel:relInit(),opt:null,plan:null,res:null,hist:[{w:0,cash:sc.s.cash}]})};
export const resetRun=()=>useG.setState({scId:null,phase:"menu",st:null,res:null,hist:[],cast:[]});
