import React,{useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {boltPath,stormEnvelope} from './lightning.js';
const metal=(color='#b3bdca',roughness=.3,metalness=.85)=>new T.MeshStandardMaterial({color,roughness,metalness});
export function makeArtifact(type){
 const g=new T.Group(),steel=metal(),dark=metal('#242e3c',.65),gold=metal('#bd9860'),wood=metal('#5d4433',.95,.05),glow=new T.MeshStandardMaterial({color:'#b7e4ff',emissive:'#53adff',emissiveIntensity:2});
 const add=(geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
 const box=(w,h,d,mat,x,y,z)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z);
 if(type==='hammer'){
 box(2.2,1.15,1.1,steel,0,.75,0);box(1.94,1.18,.91,dark,0,.75,0);box(1.84,1.19,.85,steel,0,.75,0);box(2.23,.78,.75,steel,0,.75,0);
 for(const x of [-1.115,1.115]){box(.012,.7,.73,gold,x,.75,0);for(let i=0;i<3;i++)box(.016,.02,.55,dark,x,.54+i*.2,0);}
 add(new T.CylinderGeometry(.13,.16,2.2,16),wood,0,-.9,0);for(let i=0;i<12;i++)add(new T.TorusGeometry(.147,.024,5,20),gold,0,-.12-i*.16,0).rotation.x=Math.PI/2;
 add(new T.CylinderGeometry(.19,.19,.14,16),steel,0,-2.03,0);add(new T.TorusGeometry(.25,.035,6,24),wood,0,-2.25,0);box(.025,.65,.012,glow,.53,.75,.557);g.rotation.z=-.48;
 }else if(type==='axe'){
 add(new T.CylinderGeometry(.12,.19,3.8,12),wood,0,-.6,0).rotation.z=-.08;
 const s=new T.Shape();s.moveTo(0,.8);s.lineTo(.55,1.25);s.quadraticCurveTo(1.1,1.4,1.7,1.0);s.quadraticCurveTo(1.05,.4,1.6,-.2);s.quadraticCurveTo(.8,-.35,.25,.25);s.lineTo(0,.8);
 const blade=add(new T.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelThickness:.08,bevelSize:.07,bevelSegments:2}),steel);blade.position.z=-.12;
 box(.9,.7,.8,dark,-.43,.6,0);box(.12,.73,.84,steel,-.9,.6,0);for(let i=0;i<5;i++)add(new T.TorusGeometry(.17,.035,5,15),wood,0,.2-i*.2,0).rotation.x=Math.PI/2;g.rotation.z=.3;
 }else if(type==='cube'){const m=new T.MeshPhysicalMaterial({color:'#52adff',metalness:.1,roughness:.1,transmission:.35,thickness:1,emissive:'#155fb8',emissiveIntensity:.8});box(1.65,1.65,1.65,m,0,0,0);const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.69,1.69,1.69)),new T.LineBasicMaterial({color:'#a9dcff'}));g.add(edge);add(new T.IcosahedronGeometry(.5,1),glow);g.rotation.set(.3,.4,.2);
 }else if(type==='spear'){add(new T.CylinderGeometry(.06,.08,3.5,12),gold,0,-.2,0);add(new T.ConeGeometry(.32,1.1,4),gold,0,2,0);for(const x of [-.24,.24]){const p=add(new T.ConeGeometry(.1,.8,4),gold,x,1.7,0);p.rotation.z=x;}}else if(type==='crown'){add(new T.CylinderGeometry(.9,.8,.5,10,1,true),gold,0,-.5,0);for(let i=0;i<7;i++){let a=i*Math.PI*2/7;const m=add(new T.ConeGeometry(.18,1.4+(i%2)*.4,4),gold,Math.sin(a)*.84,.25,Math.cos(a)*.84);m.rotation.z=-Math.sin(a)*.3;}add(new T.OctahedronGeometry(.25),glow,0,-.35,.85);}else{add(new T.OctahedronGeometry(1.25),new T.MeshPhysicalMaterial({color:'#b1a5f7',metalness:.3,roughness:.12,transmission:.2,emissive:'#3f3478',emissiveIntensity:.6}));add(new T.TorusGeometry(1.65,.025,6,80),gold).rotation.x=1.2;}
 return g;
}
export default function Scene({type='hammer',hero=false,motion=true,theme='dark'}){
 const el=useRef(),[failed,setFailed]=useState(false),[visible,setVisible]=useState(true);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'100px'});if(el.current)observer.observe(el.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!el.current)return;let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:hero?'high-performance':'low-power'});}catch{setFailed(true);return;}
 const host=el.current;renderer.setPixelRatio(Math.min(devicePixelRatio,hero?2:1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(34,1,.1,100);cam.position.set(0,.25,hero?9.5:8);cam.lookAt(0,-.1,0);scene.add(new T.AmbientLight('#b9d2ff',theme==='light'?2.6:1.3));const key=new T.DirectionalLight('#e9f1ff',5);key.position.set(3,4,5);scene.add(key);const rim=new T.PointLight('#5c9dff',70,20);rim.position.set(-3,1,-2);scene.add(rim);const warm=new T.PointLight('#c7a06b',30,20);warm.position.set(3,-1,2);scene.add(warm);
 const pivot=new T.Group();scene.add(pivot);const artifact=makeArtifact(type);pivot.add(artifact);if(type==='hammer')artifact.position.y=.4;
 const ringMat=new T.MeshBasicMaterial({color:theme==='dark'?'#577596':'#a6b6cd',transparent:true,opacity:.23});for(let i=0;i<2;i++){const ring=new T.Mesh(new T.TorusGeometry(2.65+i*.18,.006,4,120),ringMat);ring.rotation.x=Math.PI/2-.15;ring.position.y=-2;scene.add(ring);}
 const electric=['hammer','axe'].includes(type), discharge=new T.Group();artifact.add(discharge);
 const head=new T.Vector3(type==='hammer'?.35:.7,.8,.35), projected=new T.Vector3();
 const arcMaterials=[new T.MeshBasicMaterial({color:'#2b77ff',transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),new T.MeshBasicMaterial({color:'#80c9ff',transparent:true,opacity:.7,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),new T.MeshBasicMaterial({color:'#effaff',transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false})];
 const charge=new T.PointLight('#72b7ff',0,8,2);charge.position.copy(head);artifact.add(charge);let generation=-1;
 function rebuildArcs(seed){
 for(const child of [...discharge.children]){child.geometry.dispose();discharge.remove(child);}
 const count=hero?5:3;
 function tube(points,radius,mat){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');discharge.add(new T.Mesh(new T.TubeGeometry(curve,points.length*2,radius,4,false),mat));}
 for(let i=0;i<count;i++){const angle=i/count*Math.PI*2+seed*.37;const target=[head.x+Math.cos(angle)*(hero?2.4:1.5),head.y+Math.sin(angle)*(hero?1.7:1.2),head.z+Math.sin(i*2)*.55];const pts=boltPath(head.toArray(),target,seed*97+i*73,20,.5);
 tube(pts,.038,arcMaterials[0]);tube(pts,.014,arcMaterials[1]);tube(pts,.0045,arcMaterials[2]);
 const branch=boltPath(pts[11],[target[0]+Math.sin(i)*.6,target[1]+.5,target[2]+.15],seed+i*29,10,.3);tube(branch,.008,arcMaterials[1]);tube(branch,.0025,arcMaterials[2]);}
 }
 let raf=0,start=performance.now(),pointer={x:0,y:0},drag=false,last=0,manual=0;const move=e=>{const r=host.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5);pointer.y=((e.clientY-r.top)/r.height-.5);if(drag){manual+=(e.clientX-last)*.01;last=e.clientX;}};const down=e=>{drag=true;last=e.clientX;host.setPointerCapture?.(e.pointerId);};const up=()=>drag=false;host.addEventListener('pointermove',move);host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();};const obs=new ResizeObserver(resize);obs.observe(host);resize();
 const animate=()=>{if(!visible)return;const t=(performance.now()-start)*.001;const active=motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;pivot.rotation.y=manual+(active?Math.sin(t*.3)*.7:0)+pointer.x*.3;pivot.rotation.x=pointer.y*.15;pivot.position.y=active?Math.sin(t*.9)*.09:0;discharge.visible=electric&&active;
 if(electric&&active){const step=Math.floor(t/1.1);if(step!==generation){generation=step;rebuildArcs(step+3);}const power=stormEnvelope(performance.now()/1000);charge.intensity=18+power*32;arcMaterials[0].opacity=.14+power*.1;arcMaterials[1].opacity=.5+power*.3;
 artifact.updateWorldMatrix(true,false);projected.copy(head);artifact.localToWorld(projected);projected.project(cam);host.dataset.lightningX=String((projected.x+1)/2);host.dataset.lightningY=String((1-projected.y)/2);
 }else{charge.intensity=0;delete host.dataset.lightningX;delete host.dataset.lightningY;}renderer.render(scene,cam);if(active)raf=requestAnimationFrame(animate);};animate();const refresh=()=>{if(!motion)animate();};host.addEventListener('pointermove',refresh);
 return()=>{cancelAnimationFrame(raf);obs.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointermove',refresh);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});arcMaterials.forEach(m=>m.dispose());delete host.dataset.lightningX;delete host.dataset.lightningY;renderer.dispose();renderer.domElement.remove();};
 },[type,hero,motion,theme,visible]);
 return <div ref={el} className={'artifact-scene '+(hero?'hero-scene':'')} role="img" aria-label={`Interactive 3D ${type}. Drag to rotate.`}>{failed&&<div className="model-fallback">{type==='hammer'?'⚒':type==='axe'?'⚔':'◇'}<small>3D preview unavailable on this device</small></div>}</div>;
}
