import React,{useEffect,useRef} from 'react';
import {boltPath,stormEnvelope} from './lightning.js';
export default function Storm({motion}){
 const ref=useRef();
 useEffect(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,w=0,h=0,last=0;
 const canvas=ref.current,ctx=canvas.getContext('2d');if(!ctx)return;
 const resize=()=>{w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};resize();addEventListener('resize',resize);
 const enabled=()=>motion&&!media.matches;
 const draw=now=>{frame=requestAnimationFrame(draw);if(now-last<1000/30)return;last=now;ctx.clearRect(0,0,w,h);if(!enabled()||document.hidden){document.documentElement.classList.remove('storm-active');return;}document.documentElement.classList.add('storm-active');
 const time=now/1000,power=stormEnvelope(time);document.documentElement.style.setProperty('--storm-power',power.toFixed(3));
 const candidates=[...document.querySelectorAll('.artifact-scene[data-lightning-x]')];const detailed=candidates.find(e=>e.closest('.detail-scene'));const source=detailed||candidates.find(e=>e.classList.contains('hero-scene'))||candidates[0];if(!source)return;
 const rect=source.getBoundingClientRect();let x=rect.left+Number(source.dataset.lightningX)*rect.width,y=rect.top+Number(source.dataset.lightningY)*rect.height;
 x=Math.max(0,Math.min(w,x));y=Math.max(0,Math.min(h,y));
 // The electrical network remains energized; slow cross-fades replace hard flashes.
 const epoch=Math.floor(time/1.8),phase=time/1.8-epoch;
 for(let layer=0;layer<2;layer++){const generation=epoch+layer,blend=layer?phase:1-phase;const targets=[[w*.02,h*.12],[w*.99,h*.2],[w*.92,h*.95],[w*.12,h*.89],[w*.48,h*.04]];
 for(let i=0;i<targets.length;i++){const target=targets[i],points=boltPath([x,y],[target[0],target[1]],generation*93+i*101,30,Math.min(w,h)*.11);
 const path=(pts)=>{ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));};
 const alpha=(.15+power*.13)*blend;ctx.lineCap='round';ctx.lineJoin='round';path(points);ctx.strokeStyle=`rgba(46,119,255,${alpha})`;ctx.lineWidth=5;ctx.shadowColor='#398eff';ctx.shadowBlur=18;ctx.stroke();path(points);ctx.lineWidth=.8;ctx.strokeStyle=`rgba(191,226,255,${alpha*1.7})`;ctx.shadowBlur=5;ctx.stroke();
 const root=points[12+i],tip=[root[0]+(i%2?-1:1)*w*.15,root[1]+h*.2];path(boltPath(root,tip,generation*41+i,12,30));ctx.lineWidth=.55;ctx.strokeStyle=`rgba(128,190,255,${alpha})`;ctx.stroke();
 }}ctx.shadowBlur=0;
 const halo=ctx.createRadialGradient(x,y,0,x,y,Math.min(w,h)*.3);halo.addColorStop(0,`rgba(104,178,255,${power*.12})`);halo.addColorStop(1,'rgba(24,72,132,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
 };frame=requestAnimationFrame(draw);
 return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);document.documentElement.classList.remove('storm-active');document.documentElement.style.removeProperty('--storm-power');};
 },[motion]);
 return <div className="storm-atmosphere" aria-hidden="true"><div className="storm-clouds"/><canvas ref={ref} className="storm-network"/></div>;
}
