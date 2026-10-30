// Deterministic, tapered branching paths keep each discharge rooted to the metal.
export function boltPath(start,end,seed=1,segments=24,spread=.16){
 let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 return Array.from({length:segments+1},(_,i)=>{const t=i/segments,envelope=Math.sin(Math.PI*t);return start.map((a,k)=>a+(end[k]-a)*t+(i===0||i===segments?0:(random()-.5)*spread*envelope));});
}
export function stormEnvelope(seconds){return .55+.2*Math.sin(seconds*.72)+.12*Math.sin(seconds*1.37+.8);}
