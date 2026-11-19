// ARCADE VAULT — juegos canvas incluidos + portadas pixel-art.
// Para cargar un juego HTML externo, sustituir startGame() por un <iframe sandbox="allow-scripts"> (ver GAMES_EXT en el componente).
const C='#00f5ff',M='#ff006e',Y='#f5ff00',GR='#39ff88',WH='#e8f4ff';
const KM={KeyW:'ArrowUp',KeyA:'ArrowLeft',KeyS:'ArrowDown',KeyD:'ArrowRight'};
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b)),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const glow=(x,c,b=10)=>{x.shadowColor=c;x.shadowBlur=b;x.fillStyle=c;x.strokeStyle=c};
const clear=(x,W,H)=>{x.shadowBlur=0;x.fillStyle='#05050b';x.fillRect(0,0,W,H)};
const txt=(x,s,px,py,sz,c,al='center')=>{x.shadowBlur=0;x.fillStyle=c;x.font=sz+'px "Press Start 2P",monospace';x.textAlign=al;x.fillText(s,px,py)};

function snake(G){
 const{ctx,W,H,h}=G,N=20,S=24;let sn,dir,pend=[],food,acc=0,score=0,lives=3,level=1,eaten=0;
 const put=()=>{do{food=[ri(0,N),ri(0,N)]}while(sn.some(s=>s[0]===food[0]&&s[1]===food[1]))};
 const reset=()=>{sn=[[10,10],[9,10],[8,10]];dir=[1,0];pend=[];put()};
 const D={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
 reset();h.score(0);h.lives(3);h.level(1);
 const die=()=>{lives--;h.lives(lives);if(lives<=0)G.end(score);else reset()};
 return{
  update(dt){
   G.q.forEach(c=>{if(D[c]&&pend.length<3)pend.push(D[c])});
   acc+=dt;const iv=Math.max(.05,.14-level*.008);if(acc<iv)return;acc-=iv;
   const n=pend.shift();if(n&&!(n[0]===-dir[0]&&n[1]===-dir[1]))dir=n;
   const hd=[sn[0][0]+dir[0],sn[0][1]+dir[1]];
   if(hd[0]<0||hd[1]<0||hd[0]>=N||hd[1]>=N||sn.some(s=>s[0]===hd[0]&&s[1]===hd[1]))return die();
   sn.unshift(hd);
   if(hd[0]===food[0]&&hd[1]===food[1]){score+=10*level;eaten++;h.score(score);if(eaten%5===0){level++;h.level(level)}put()}else sn.pop();
  },
  draw(){
   clear(ctx,W,H);ctx.strokeStyle='rgba(0,245,255,.06)';ctx.lineWidth=1;
   for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(i*S,0);ctx.lineTo(i*S,H);ctx.moveTo(0,i*S);ctx.lineTo(W,i*S);ctx.stroke()}
   const p=6+3*Math.sin(performance.now()/120);glow(ctx,M,16);ctx.fillRect(food[0]*S+12-p,food[1]*S+12-p,p*2,p*2);
   sn.forEach((s,i)=>{glow(ctx,i?C:WH,i?8:14);ctx.fillRect(s[0]*S+1,s[1]*S+1,S-2,S-2)});
  }};
}

function arkanoid(G){
 const{ctx,W,H,h,canvas}=G,pw=84,py=H-34,cols=10,bw=44,bh=18,CO=[M,M,Y,Y,C,C];
 let px=W/2,score=0,lives=3,level=1,stuck=true,bricks=[],b={x:0,y:0,vx:0,vy:0};
 const mk=()=>{bricks=[];for(let r=0;r<6;r++)for(let c=0;c<cols;c++)bricks.push({x:20+c*bw,y:56+r*(bh+4),c:CO[r],p:(6-r)*10})};
 const sp=()=>240+level*30;
 const launch=()=>{if(!stuck)return;stuck=false;const a=rnd(-.4,.4);b.vx=sp()*Math.sin(a);b.vy=-sp()*Math.cos(a)};
 const pm=e=>{const r=canvas.getBoundingClientRect();px=cl((e.clientX-r.left)*W/r.width,pw/2,W-pw/2)};
 canvas.addEventListener('pointermove',pm);canvas.addEventListener('pointerdown',e=>{pm(e);launch()});
 mk();h.score(0);h.lives(3);h.level(1);
 return{
  update(dt){
   const k=G.keys;if(k.ArrowLeft)px-=420*dt;if(k.ArrowRight)px+=420*dt;px=cl(px,pw/2,W-pw/2);
   if(G.hit('Space')||G.hit('ArrowUp'))launch();
   if(stuck){b.x=px;b.y=py-10;return}
   for(let s=0;s<3;s++){
    b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;
    if(b.x<6){b.x=6;b.vx=Math.abs(b.vx)}if(b.x>W-6){b.x=W-6;b.vx=-Math.abs(b.vx)}if(b.y<6){b.y=6;b.vy=Math.abs(b.vy)}
    if(b.vy>0&&b.y>py-6&&b.y<py+8&&Math.abs(b.x-px)<pw/2+4){const a=cl((b.x-px)/(pw/2),-1,1)*1.05,v=sp();b.vx=v*Math.sin(a);b.vy=-v*Math.cos(a);b.y=py-6}
    for(const br of bricks){if(b.x>br.x-6&&b.x<br.x+bw+6&&b.y>br.y-6&&b.y<br.y+bh+6){
     const ox=Math.min(b.x-br.x+6,br.x+bw+6-b.x),oy=Math.min(b.y-br.y+6,br.y+bh+6-b.y);if(ox<oy)b.vx*=-1;else b.vy*=-1;
     bricks.splice(bricks.indexOf(br),1);score+=br.p;h.score(score);break}}
   }
   if(!bricks.length){level++;h.level(level);mk();stuck=true}
   if(b.y>H+10){lives--;h.lives(lives);if(lives<=0)G.end(score);else stuck=true}
  },
  draw(){
   clear(ctx,W,H);bricks.forEach(r=>{glow(ctx,r.c,8);ctx.fillRect(r.x+1,r.y+1,bw-2,bh-2)});
   glow(ctx,C,14);ctx.fillRect(px-pw/2,py,pw,12);glow(ctx,WH,12);ctx.beginPath();ctx.arc(b.x,b.y,6,0,7);ctx.fill();
   if(stuck)txt(ctx,'ESPACIO PARA LANZAR',W/2,H-70,10,Y);
  }};
}

function tetris(G){
 const{ctx,W,H,h}=G,CS=24,OX=40;
 const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
 const CO=[0,C,Y,M,GR,'#ff7a00','#4d7cff','#c36bff'];
 const B=Array.from({length:20},()=>Array(10).fill(0));
 let p,nx,score=0,lines=0,level=1,acc=0;const hold={ArrowLeft:0,ArrowRight:0};
 const np=()=>{const i=ri(0,7);return{m:SH[i].map(r=>[...r]),c:i+1,x:i===1?4:3,y:0}};
 const coll=(m,x,y)=>m.some((r,j)=>r.some((v,i)=>v&&(x+i<0||x+i>9||y+j>19||(y+j>=0&&B[y+j][x+i]))));
 const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
 const spawn=()=>{p=nx||np();nx=np();if(coll(p.m,p.x,p.y))G.end(score)};
 const lock=()=>{p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&p.y+j>=0)B[p.y+j][p.x+i]=p.c}));
  let n=0;for(let y=19;y>=0;y--)if(B[y].every(v=>v)){B.splice(y,1);B.unshift(Array(10).fill(0));n++;y++}
  if(n){score+=[0,100,300,500,800][n]*level;lines+=n;level=1+Math.floor(lines/10);h.level(level)}
  h.score(score);spawn()};
 spawn();h.score(0);h.lives('—');h.level(1);
 const cell=(x,y,c,sz=CS)=>{ctx.fillStyle=c;ctx.fillRect(x+1,y+1,sz-2,sz-2);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x+1,y+1,sz-2,3)};
 return{
  update(dt){
   const k=G.keys;
   for(const c of['ArrowLeft','ArrowRight']){const d=c==='ArrowLeft'?-1:1;
    if(G.hit(c)){if(!coll(p.m,p.x+d,p.y))p.x+=d;hold[c]=.17}
    else if(k[c]){hold[c]-=dt;if(hold[c]<=0){hold[c]=.05;if(!coll(p.m,p.x+d,p.y))p.x+=d}}}
   if(G.hit('ArrowUp')){const r=rot(p.m);for(const d of[0,-1,1,-2,2])if(!coll(r,p.x+d,p.y)){p.m=r;p.x+=d;break}}
   if(G.hit('Space')){while(!coll(p.m,p.x,p.y+1)){p.y++;score+=2}lock();return}
   acc+=dt*(k.ArrowDown?12:1);const iv=Math.max(.07,.8-(level-1)*.07);
   while(acc>=iv){acc-=iv;if(!coll(p.m,p.x,p.y+1))p.y++;else{lock();acc=0;break}}
  },
  draw(){
   clear(ctx,W,H);ctx.fillStyle='#090913';ctx.fillRect(OX,0,240,H);ctx.strokeStyle='rgba(0,245,255,.07)';ctx.lineWidth=1;
   for(let i=0;i<=10;i++){ctx.beginPath();ctx.moveTo(OX+i*CS,0);ctx.lineTo(OX+i*CS,H);ctx.stroke()}
   for(let j=0;j<=20;j++){ctx.beginPath();ctx.moveTo(OX,j*CS);ctx.lineTo(OX+240,j*CS);ctx.stroke()}
   B.forEach((r,j)=>r.forEach((v,i)=>{if(v)cell(OX+i*CS,j*CS,CO[v])}));
   if(!p)return;ctx.shadowColor=CO[p.c];ctx.shadowBlur=10;
   p.m.forEach((r,j)=>r.forEach((v,i)=>{if(v)cell(OX+(p.x+i)*CS,(p.y+j)*CS,CO[p.c])}));
   ctx.shadowBlur=0;glow(ctx,C,8);ctx.strokeRect(OX,0,240,H);
   txt(ctx,'SIGUIENTE',370,40,10,C);
   nx.m.forEach((r,j)=>r.forEach((v,i)=>{if(v)cell(335+i*18,60+j*18,CO[nx.c],18)}));
   txt(ctx,'LÍNEAS',370,170,10,M);txt(ctx,String(lines),370,196,14,WH);
  }};
}

function invaders(G){
 const{ctx,W,H,h}=G;
 const A=[["00100000100","00010001000","00111111100","01101110110","11111111111","10111111101","10100000101","00011011000"],["00100000100","10010001001","10111111101","11101110111","11111111111","01111111110","00100000100","01000000010"]];
 const RC=[M,M,Y,C],PT=[40,30,20,10];
 let al,gx,gy,gd=1,fr=0,ft=0,px=W/2,pb=null,eb=[],cd=0,es=1.2,score=0,lives=3,level=1,inv=0;
 const mk=()=>{al=[];for(let r=0;r<4;r++)for(let c=0;c<8;c++)al.push({r,x:c*46,y:r*32});gx=66;gy=50+Math.min(level-1,4)*10;gd=1;eb=[];pb=null};
 mk();h.score(0);h.lives(3);h.level(1);
 return{
  update(dt){
   const k=G.keys;if(k.ArrowLeft)px-=300*dt;if(k.ArrowRight)px+=300*dt;px=cl(px,20,W-20);cd-=dt;inv-=dt;
   if((G.hit('Space')||k.Space)&&!pb&&cd<=0){pb={x:px,y:H-50};cd=.25}
   if(pb){pb.y-=520*dt;if(pb.y<0)pb=null}
   const fq=1-al.length/32,spd=(34+level*8)*(1+fq*2.6);gx+=gd*spd*dt;ft+=dt;if(ft>Math.max(.15,.55-fq*.4)){ft=0;fr^=1}
   const mn=Math.min(...al.map(a=>a.x))+gx,mx=Math.max(...al.map(a=>a.x))+gx+22;
   if((mx>W-14&&gd>0)||(mn<14&&gd<0)){gd*=-1;gy+=14}
   es-=dt;if(es<=0){es=Math.max(.35,1.1-level*.1)*rnd(.6,1.2);const s=al[ri(0,al.length)];eb.push({x:gx+s.x+11,y:gy+s.y+16})}
   if(pb)for(const a of al){if(Math.abs(pb.x-(gx+a.x+11))<12&&pb.y>gy+a.y&&pb.y<gy+a.y+16){al.splice(al.indexOf(a),1);score+=PT[a.r]*level;h.score(score);pb=null;break}}
   eb.forEach(e=>e.y+=(220+level*10)*dt);
   for(const e of eb){if(inv<=0&&Math.abs(e.x-px)<16&&e.y>H-46&&e.y<H-26){e.y=H+99;inv=1.6;lives--;h.lives(lives);if(lives<=0){G.end(score);return}}}
   eb=eb.filter(e=>e.y<H);
   if(al.some(a=>gy+a.y>H-80)){G.end(score);return}
   if(!al.length){level++;h.level(level);mk()}
  },
  draw(){
   clear(ctx,W,H);
   al.forEach(a=>{glow(ctx,RC[a.r],6);A[fr].forEach((row,j)=>{for(let i=0;i<11;i++)if(row[i]==='1')ctx.fillRect(gx+a.x+i*2,gy+a.y+j*2,2,2)})});
   if(Math.floor(inv*10)%2===0||inv<=0){glow(ctx,C,12);ctx.fillRect(px-15,H-34,30,8);ctx.fillRect(px-9,H-40,18,6);ctx.fillRect(px-2,H-48,4,8)}
   if(pb){glow(ctx,Y,10);ctx.fillRect(pb.x-1.5,pb.y,3,12)}
   glow(ctx,M,8);eb.forEach(e=>ctx.fillRect(e.x-1.5,e.y,3,12));
   glow(ctx,M,10);ctx.fillRect(0,H-22,W,2);
  }};
}

function asteroids(G){
 const{ctx,W,H,h}=G;let sh,rocks=[],bl=[],score=0,lives=3,level=1,inv=0;
 const mkRock=(x,y,r)=>{const n=ri(8,12),pts=[];for(let i=0;i<n;i++)pts.push([Math.cos(i/n*6.2832)*r*rnd(.75,1.15),Math.sin(i/n*6.2832)*r*rnd(.75,1.15)]);
  const a=rnd(0,6.28),s=rnd(25,60)*(1+level*.08)*Math.pow(40/r,.4);return{x,y,r,pts,vx:Math.cos(a)*s,vy:Math.sin(a)*s}};
 const wave=()=>{rocks=[];for(let i=0;i<2+level;i++){let x,y;do{x=rnd(0,W);y=rnd(0,H)}while(Math.hypot(x-W/2,y-H/2)<130);rocks.push(mkRock(x,y,40))}};
 const respawn=()=>{sh={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0};inv=2.2};
 wave();respawn();h.score(0);h.lives(3);h.level(1);
 const wr=o=>{o.x=(o.x+W)%W;o.y=(o.y+H)%H};
 return{
  update(dt){
   const k=G.keys;if(k.ArrowLeft)sh.a-=4.2*dt;if(k.ArrowRight)sh.a+=4.2*dt;
   if(k.ArrowUp){sh.vx+=Math.cos(sh.a)*260*dt;sh.vy+=Math.sin(sh.a)*260*dt}
   const f=Math.pow(.5,dt);sh.vx*=f;sh.vy*=f;sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;wr(sh);inv-=dt;
   if(G.hit('Space')&&bl.length<5)bl.push({x:sh.x+Math.cos(sh.a)*14,y:sh.y+Math.sin(sh.a)*14,vx:Math.cos(sh.a)*520+sh.vx*.3,vy:Math.sin(sh.a)*520+sh.vy*.3,l:.9});
   bl.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;wr(b)});bl=bl.filter(b=>b.l>0);
   rocks.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;wr(r)});
   for(const b of bl)for(const r of rocks){if(Math.hypot(b.x-r.x,b.y-r.y)<r.r){b.l=0;rocks.splice(rocks.indexOf(r),1);score+=r.r>30?20:r.r>16?50:100;h.score(score);
    if(r.r>16){rocks.push(mkRock(r.x,r.y,r.r/2),mkRock(r.x,r.y,r.r/2))}break}}
   if(inv<=0)for(const r of rocks){if(Math.hypot(sh.x-r.x,sh.y-r.y)<r.r*.85+7){lives--;h.lives(lives);if(lives<=0){G.end(score);return}respawn();break}}
   if(!rocks.length){level++;h.level(level);wave();inv=1.5}
  },
  draw(){
   clear(ctx,W,H);ctx.lineWidth=2;
   rocks.forEach(r=>{glow(ctx,r.r>30?M:r.r>16?Y:C,8);ctx.beginPath();r.pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](r.x+p[0],r.y+p[1]));ctx.closePath();ctx.stroke()});
   if(inv<=0||Math.floor(inv*8)%2===0){glow(ctx,C,12);ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(sh.a);ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-9);ctx.lineTo(-6,0);ctx.lineTo(-10,9);ctx.closePath();ctx.stroke();
    if(G.keys.ArrowUp){glow(ctx,Y,10);ctx.beginPath();ctx.moveTo(-8,-4);ctx.lineTo(-16-Math.random()*6,0);ctx.lineTo(-8,4);ctx.stroke()}ctx.restore()}
   glow(ctx,WH,8);bl.forEach(b=>ctx.fillRect(b.x-2,b.y-2,4,4));
  }};
}

function pacman(G){
 const{ctx,W,H,h}=G,CS=24;
 const HF=["##########","#o........","#.##.###.#","#.##.###.#","#.........","#.##.#.###","#....#....","#.##.#.##.","#.........","#.##.##.#.","#.##.##.#.","#.........","#.##....#.","#.##.##.#.","#....##...","#.##.##.##","#.##......","#.........","#o........","##########"];
 const MZ=HF.map(r=>r+[...r].reverse().join(''));
 const wall=(x,y)=>!MZ[y]||MZ[y][x]!=='.'&&MZ[y][x]!=='o';
 const DR=[[1,0],[-1,0],[0,1],[0,-1]];
 let dots,left,pac,gh,score=0,lives=3,level=1,fright=0,combo=0,inv=0,want=[0,0];
 const ent=(x,y)=>({cx:x,cy:y,nx:x,ny:y,t:0,dir:null});
 const fill=()=>{dots=MZ.map(r=>[...r].map(c=>c==='.'?1:c==='o'?2:0));const seen=new Set(['9,11']),st=[[9,11]];
  while(st.length){const[x,y]=st.pop();DR.forEach(d=>{const a=x+d[0],b=y+d[1],k=a+','+b;if(!wall(a,b)&&!seen.has(k)){seen.add(k);st.push([a,b])}})}
  left=0;dots.forEach((r,y)=>r.forEach((v,x)=>{if(v&&!seen.has(x+','+y))dots[y][x]=0;else if(v)left++}))};
 const place=()=>{pac=ent(9,11);want=[0,0];gh=[[18,1,M],[1,8,C],[18,8,'#ff7a00']].map(g=>({...ent(g[0],g[1]),c:g[2],sx:g[0],sy:g[1],safe:0}));inv=2};
 const adv=(e,spd,dt,pick,arr)=>{
  if(e.nx===e.cx&&e.ny===e.cy){const d=pick(e);if(!d)return;e.nx=e.cx+d[0];e.ny=e.cy+d[1];e.dir=d;e.t=0}
  e.t+=spd*dt;
  while(e.t>=1){e.t-=1;e.cx=e.nx;e.cy=e.ny;arr&&arr(e);const d=pick(e);if(d){e.nx=e.cx+d[0];e.ny=e.cy+d[1];e.dir=d}else{e.nx=e.cx;e.ny=e.cy;e.t=0;break}}
 };
 const pos=e=>[e.cx+(e.nx-e.cx)*e.t,e.cy+(e.ny-e.cy)*e.t];
 fill();place();h.score(0);h.lives(3);h.level(1);
 const eat=e=>{const v=dots[e.cy][e.cx];if(!v)return;dots[e.cy][e.cx]=0;left--;score+=v===2?50:10;if(v===2){fright=6;combo=0}h.score(score);
  if(!left){level++;h.level(level);fill();place()}};
 const pickP=e=>{if(!wall(e.cx+want[0],e.cy+want[1])&&(want[0]||want[1]))return want;if(e.dir&&!wall(e.cx+e.dir[0],e.cy+e.dir[1]))return e.dir;return null};
 const pickG=g=>{let o=DR.filter(d=>!wall(g.cx+d[0],g.cy+d[1])&&!(g.dir&&d[0]===-g.dir[0]&&d[1]===-g.dir[1]));if(!o.length)o=DR.filter(d=>!wall(g.cx+d[0],g.cy+d[1]));
  if(fright>0||Math.random()<.35||g.safe>0)return o[ri(0,o.length)];
  return o.sort((a,b)=>Math.abs(g.cx+a[0]-pac.cx)+Math.abs(g.cy+a[1]-pac.cy)-Math.abs(g.cx+b[0]-pac.cx)-Math.abs(g.cy+b[1]-pac.cy))[0]};
 return{
  update(dt){
   G.q.forEach(c=>{const i=['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].indexOf(c);if(i>=0)want=DR[i]});
   if(pac.dir&&(want[0]===-pac.dir[0]&&want[1]===-pac.dir[1])&&(pac.nx!==pac.cx||pac.ny!==pac.cy)){[pac.cx,pac.nx]=[pac.nx,pac.cx];[pac.cy,pac.ny]=[pac.ny,pac.cy];pac.t=1-pac.t;pac.dir=want}
   adv(pac,4.8,dt,pickP,eat);fright=Math.max(0,fright-dt);inv-=dt;
   gh.forEach(g=>{g.safe-=dt;adv(g,fright>0?2.4:3.4+level*.2,dt,pickG)});
   const pp=pos(pac);
   for(const g of gh){const gp=pos(g);if(Math.hypot(gp[0]-pp[0],gp[1]-pp[1])<.7){
    if(fright>0&&g.safe<=0){score+=200*Math.pow(2,combo++);h.score(score);Object.assign(g,ent(g.sx,g.sy),{safe:2})}
    else if(inv<=0&&g.safe<=0){lives--;h.lives(lives);if(lives<=0){G.end(score);return}place();break}}}
  },
  draw(){
   clear(ctx,W,H);const tm=performance.now()/1000;
   MZ.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='#'){ctx.shadowBlur=0;ctx.fillStyle='#07122e';ctx.fillRect(x*CS,y*CS,CS,CS);glow(ctx,C,5);ctx.lineWidth=1.5;ctx.strokeRect(x*CS+3,y*CS+3,CS-6,CS-6)}
    else if(dots[y][x]===1){ctx.shadowBlur=0;ctx.fillStyle=WH;ctx.fillRect(x*CS+10,y*CS+10,4,4)}
    else if(dots[y][x]===2){glow(ctx,WH,10);ctx.beginPath();ctx.arc(x*CS+12,y*CS+12,4+2*Math.sin(tm*8),0,7);ctx.fill()}}));
   const pp=pos(pac),a=pac.dir?Math.atan2(pac.dir[1],pac.dir[0]):0,m=.05+.3*Math.abs(Math.sin(tm*14));
   if(inv<=0||Math.floor(inv*8)%2===0){glow(ctx,Y,12);ctx.beginPath();ctx.moveTo(pp[0]*CS+12,pp[1]*CS+12);ctx.arc(pp[0]*CS+12,pp[1]*CS+12,10,a+m*Math.PI,a+(2-m)*Math.PI);ctx.closePath();ctx.fill()}
   gh.forEach(g=>{const p=pos(g),x=p[0]*CS+12,y=p[1]*CS+12,fr=fright>0&&g.safe<=0;glow(ctx,fr?(fright<2&&Math.floor(tm*6)%2?WH:'#3355ff'):g.c,12);
    ctx.beginPath();ctx.arc(x,y-1,10,Math.PI,0);ctx.lineTo(x+10,y+10);ctx.lineTo(x+5,y+6);ctx.lineTo(x,y+10);ctx.lineTo(x-5,y+6);ctx.lineTo(x-10,y+10);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle=fr?WH:'#fff';ctx.fillRect(x-6,y-5,4,5);ctx.fillRect(x+2,y-5,4,5)});
  }};
}

const GAMES={snake,arkanoid,tetris,invaders,asteroids,pacman};

export function startGame(id,canvas,h){
 const ctx=canvas.getContext('2d'),W=480,H=480,keys={},q=[];
 let paused=false,over=false,dead=false,raf=0,last=performance.now();
 const kd=e=>{const c=KM[e.code]||e.code;if(c.startsWith('Arrow')||c==='Space')e.preventDefault();if(!keys[c])q.push(c);keys[c]=true};
 const ku=e=>{keys[KM[e.code]||e.code]=false};
 window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
 const G={ctx,W,H,keys,q,h,canvas,hit:c=>q.includes(c),end(s){over=true;h.over(s)}};
 const g=GAMES[id](G);
 const tick=t=>{if(dead)return;const dt=Math.min(.05,(t-last)/1000);last=t;if(!paused&&!over)g.update(dt);q.length=0;g.draw();raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);
 return{setPaused(p){paused=p},destroy(){dead=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)}};
}

const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.substr(i,2),16)*(1-t)+parseInt(b.substr(i,2),16)*t).toString(16).padStart(2,'0')).join('');
export function cover(id){
 const c=document.createElement('canvas');c.width=96;c.height=56;const x=c.getContext('2d');
 const bg={arkanoid:['#16064a','#003a52'],tetris:['#34052a','#14064a'],snake:['#032a30','#0c0c38'],pacman:['#0a0a42','#38093a'],invaders:['#0c0c30','#470628'],asteroids:['#05051c','#16265a']}[id];
 for(let y=0;y<56;y+=4){x.fillStyle=mix(bg[0],bg[1],y/56);x.fillRect(0,y,96,4)}
 x.fillStyle='#fff';for(let i=0;i<22;i++)x.fillRect((i*37+11)%96,(i*23+5)%36,1,1);
 const R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 if(id==='snake'){[[12,36],[16,36],[20,36],[24,36],[28,36],[32,36],[32,32],[32,28],[36,28],[40,28],[44,28],[48,28],[52,28],[52,24],[52,20],[56,20]].forEach((p,i,a)=>R(p[0],p[1],4,4,i===a.length-1?'#fff':C));R(70,18,4,4,M);R(71,15,2,2,Y)}
 if(id==='tetris'){const K={C,M,Y,G:GR,O:'#ff7a00'};['..O....G..','C.OMM.GGY.','CCOMMYGYY.','CCOMMYYGYC'].forEach((r,j)=>[...r].forEach((ch,i)=>{if(K[ch])R(18+i*6,32+j*6,5,5,K[ch])}));[[24,6],[30,6],[36,6],[30,12]].forEach(p=>R(p[0]+12,p[1],5,5,M))}
 if(id==='arkanoid'){const CO=[M,M,Y,Y,C];for(let r=0;r<5;r++)for(let i=0;i<8;i++)R(8+i*11,6+r*5,10,4,CO[r]);R(36,50,24,3,C);R(56,38,3,3,'#fff')}
 if(id==='pacman'){for(let dx=-12;dx<=12;dx++)for(let dy=-12;dy<=12;dy++)if(dx*dx+dy*dy<=144&&!(dx>0&&Math.abs(dy)<=dx*.6))R(24+dx,30+dy,1,1,Y);[44,52,60].forEach(p=>R(p,30,2,2,'#fff'));
  for(let dx=-9;dx<=9;dx++)for(let dy=-9;dy<=9;dy++)if((dy<=0&&dx*dx+dy*dy<=81)||(dy>0&&dy<=9))R(78+dx,30+dy,1,1,M);R(73,27,3,4,'#fff');R(80,27,3,4,'#fff')}
 if(id==='invaders'){const S=["00100000100","00010001000","00111111100","01101110110","11111111111","10111111101","10100000101","00011011000"];S.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='1')R(31+i*3,12+j*3,3,3,M)}));R(47,34,2,6,Y);R(40,48,16,4,C);R(44,45,8,3,C)}
 if(id==='asteroids'){x.lineWidth=1;const P=(pts,col)=>{x.strokeStyle=col;x.beginPath();pts.forEach((p,i)=>x[i?'lineTo':'moveTo'](p[0],p[1]));x.closePath();x.stroke()};
  P([[44,34],[30,40],[33,34],[30,28]],C);P([[60,12],[70,10],[76,18],[72,28],[62,28],[56,20]],M);P([[78,40],[84,38],[88,44],[82,48],[77,46]],Y);R(54,31,2,2,'#fff');R(60,29,2,2,'#fff')}
 return c.toDataURL();
}
