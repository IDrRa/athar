/* ===== «صمّم» — محرر تصاميم الآيات والأذكار والأدعية (2026-11-28) =====
   النص الشرعي يأتي من مكتبة أثر الموثقة فقط (القرآن من Tanzil حرفًا بحرف، والأذكار والأدعية من حصن المسلم، والأحاديث من موسوعة الأحاديث)،
   ولا يُحرَّر داخل المحرر. المستخدم يغيّر الشكل فقط، ويضيف إن شاء عنوانًا أو إهداءً من عنده يظهر منفصلًا.
   الرسم كله على canvas بالمقاس الحقيقي: المعاينة هي الصورة نفسها التي تُنزَّل. التصاميم تُحفظ على هذا الجهاز فقط (localStorage). */
var SDZ={sq:[1080,1080,'مربع','منشور مربع'],post:[1080,1350,'طولي','منشور ٤:٥'],story:[1080,1920,'قصة','حالة وقصص'],wide:[1920,1080,'عرضي','شاشة وعرض']};
var SDP={
 layl:['ليل ذهبي','#0d0c0a','#211c13','#f4efe4','#a59c88','#c9a85a'],
 waraq:['ورق وحبر','#f5efe3','#e6dbc5','#1e1a14','#6b604d','#86662a'],
 zumurrud:['زمردي','#0b2720','#164536','#f1ede2','#a9bfae','#d3b46f'],
 kuhli:['كحلي','#0d182b','#1d3152','#eef1f6','#9fb0c8','#cfb072'],
 unnabi:['عنّابي','#280e13','#4a1b24','#f6ece4','#c9a9a0','#d9b47c'],
 ramli:['رملي','#ebdfc8','#d5c19c','#2b2116','#6a583f','#7a4f1f'],
 hajari:['حجري','#26282a','#3e4245','#f2f2ef','#b5b6b2','#cdb78d'],
 naqi:['أبيض نقي','#ffffff','#eeeeea','#151515','#666666','#8f7136'],
 fajr:['فجر','#1d1a36','#b9806a','#fff8ef','#e8d6c8','#f2cf8f']};
/* القوالب: [الاسم، اللوحة، الخلفية، الخط لغير القرآن، المحاذاة] */
var SDT={
 mihrab:['محراب','layl','glow','amiri','c'],
 window:['نافذة','zumurrud','pattern','amiri','c'],
 paper:['ورق','waraq','solid','amiri','c'],
 frame:['إطار','unnabi','grad','amiri','c'],
 crescent:['هلال','kuhli','glow','amiri','c'],
 band:['شريط','naqi','solid','plex','c'],
 lattice:['نقش','hajari','pattern','amiri','c'],
 minimal:['بسيط','ramli','solid','amiri','r'],
 tablet:['لوح','kuhli','grad','amiri','c'],
 dawn:['فجر','fajr','grad','amiri','c']};
var SDF={hafs:['حفص',"'KFGQPC Hafs','Amiri Quran','Amiri',serif"],amiriq:['أميري قرآن',"'Amiri Quran','Amiri',serif"],amiri:['أميري',"'Amiri','Amiri Quran',serif"],plex:['بلكس',"'IBM Plex Sans Arabic',system-ui,sans-serif"]};
var SDU="'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif";
var SD=null,SDIN=null,SDTAB='content',SDKIND='q',SDQ='',SDCV=null,SDRAF=0,SDTH={},SDINK={},SDEXP={f:'png',k:2};

/* ---------- المحتوى (من مكتبة أثر الموثقة) ---------- */
function sdVerses(n,a,b){n=Math.max(1,Math.min(114,n|0));var c=QC[n-1];a=Math.max(1,Math.min(c,a|0||1));b=Math.max(a,Math.min(c,b|0||a));var V=QV(n),t=[];
 for(var v=a;v<=b;v++)t.push(V[v-1]+cdNum(v));
 return{k:'q',n:n,a:a,b:b,label:'سورة '+QN[n-1],text:t.join(' ').trim(),ref:'سورة '+QN[n-1]+' · '+(a===b?'الآية '+ar(a):'الآيات '+ar(a)+'–'+ar(b)),quran:true,name:'quran-'+n+'-'+a+(b>a?'-'+b:'')}}
function sdItem(id){var o=ALL[id];if(!o||!isPub(o))return null;var x=cdFromItem(o);x.k=o.type==='dua'?'d':'z';x.id=id;return x}
function sdHadith(id){var w=wqById(id);if(!w||w.textType!=='hadith')return null;return{k:'h',id:id,label:'حديث نبوي',title:'',text:w.text,ref:wqRef(w),quran:false,name:w.id}}
function sdHadiths(){return WQ.filter(function(w){return w.textType==='hadith'})}
/* يُعاد بناء النص من مصدره عند الفتح (لا يُحفظ نص معدّل)؛ وإن تعذّر يبقى النص المحفوظ كما جاء من المكتبة */
function sdResolve(c){var r=null;try{if(c.k==='q')r=sdVerses(c.n,c.a,c.b);else if(c.k==='h')r=sdHadith(c.id);else if(c.id)r=sdItem(c.id)}catch(e){}return r||c}

/* ---------- الحالة ---------- */
function sdDef(){return{v:1,c:sdVerses(2,152,152),tpl:'mihrab',pal:'layl',bgk:'glow',sz:'sq',font:'',bold:false,fs:100,lh:100,al:'c',lab:null,ttl:'',note:'',ref:true,brand:true,cu:null}}
function sdLoad(){var s=null;try{s=JSON.parse(localStorage.getItem('athar-studio')||'null')}catch(e){}if(!s||s.v!==1||!s.c)s=sdDef();s.c=sdResolve(s.c);return s}
function sdStore(){try{localStorage.setItem('athar-studio',JSON.stringify(SD))}catch(e){}}
function sdMine(){try{var a=JSON.parse(localStorage.getItem('athar-designs')||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function sdFontId(s){var q=s.c.quran;if(s.font&&SDF[s.font]&&!(q&&s.font==='plex'))return s.font;return q?'hafs':SDT[s.tpl][3]}
function sdPal(s){var p=SDP[s.pal]||SDP.layl,o={bg:p[1],bg2:p[2],tx:p[3],mu:p[4],ac:p[5]};if(s.pal==='custom'&&s.cu){o.bg=s.cu.bg;o.tx=s.cu.tx;o.ac=s.cu.ac;o.bg2=sdMix(o.bg,o.tx,.12);o.mu=sdMix(o.tx,o.bg,.66)}return o}
function sdRGB(h){h=String(h).replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]}
function sdMix(a,b,t){var x=sdRGB(a),y=sdRGB(b);return '#'+x.map(function(v,i){return('0'+Math.round(y[i]*t+v*(1-t)).toString(16)).slice(-2)}).join('')}
function sdA(h,a){var x=sdRGB(h);return 'rgba('+x.join(',')+','+a+')'}
function sdLum(h){return sdRGB(h).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce(function(s,v,i){return s+v*[.2126,.7152,.0722][i]},0)}
function sdCon(a,b){var x=sdLum(a),y=sdLum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}

/* ---------- الرسم ---------- */
/* تقسيم الأسطر المتوازن من بطاقة المشاركة؛ وإن أعاد سطرًا أعرض من المساحة (يحدث مع الخطوط الكبيرة) يُقسَّم تقسيمًا عاديًا */
function sdWrap(c,t,w){var L=cdWrap(c,t,w);if(!L.some(function(l){return l.indexOf(' ')>0&&c.measureText(l).width>w+1}))return L;var out=[];
 String(t).replace(/\r\n?/g,'\n').split('\n').forEach(function(par){var l='';par.split(/[ \t]+/).filter(Boolean).forEach(function(x){var tr=l?l+' '+x:x;if(l&&c.measureText(tr).width>w){out.push(l);l=x}else l=tr});if(l)out.push(l)});return out}
function sdInk(c,t,fs){var k=c.font+'|'+t;if(k in SDINK)return SDINK[k];var v=cdInk(c,t,fs);if(Object.keys(SDINK).length>3000)SDINK={};return SDINK[k]=v}
/* سطر عربي من اليمين: يُرسم قطعة قطعة (أرقام الآيات منفصلة) مع تصحيح خط القاعدة في سفاري، وبمحاذاة وسط أو يمين أو ضبط */
function sdLine(c,l,xr,w,y,fs,ratio,al,last,hf,hc){var just=al==='j'&&!last,sep=!!(just||hf),ws=l.split(/[ ]+/).filter(Boolean),P=[];
 ws.forEach(function(t,i){var num=/^[٠-٩]+$/.test(t),lp=P[P.length-1];
  if(!sep&&lp&&!num&&!lp.num&&lp.t.indexOf(' ')<0&&t.indexOf(' ')<0)lp.t+=' '+t;else P.push({t:t,num:num,hl:!!(hf&&hf[i])})});
 var sp=c.measureText(' ').width,tot=0;P.forEach(function(p){p.w=c.measureText(p.t).width;tot+=p.w});tot+=sp*(P.length-1);
 var ex=0;if(just&&P.length>1){ex=(w-tot)/(P.length-1);if(ex<0||ex>fs*.5)ex=0}
 var x=al==='c'?xr-(w-tot)/2:xr,fc=c.fillStyle;c.textAlign='right';
 P.forEach(function(p){var adj=0;if(!p.num){var s=sdInk(c,p.t,fs);if(s!==null&&Math.abs(s-ratio*fs)>fs*.06)adj=s-ratio*fs}if(p.hl&&hc)c.fillStyle=hc;c.fillText(p.t,x,y-adj);c.fillStyle=fc;x-=p.w+sp+ex})}
function sdArch(c,x0,x1,top,bot,sh){var w=x1-x0,s=w*(sh||.42),m=(x0+x1)/2;c.beginPath();c.moveTo(x0,bot);c.lineTo(x0,top+s);c.bezierCurveTo(x0,top+s*.45,m-w*.18,top+s*.12,m,top);c.bezierCurveTo(m+w*.18,top+s*.12,x1,top+s*.45,x1,top+s);c.lineTo(x1,bot)}
function sdPattern(c,W,H,col,u){c.save();c.strokeStyle=col;c.lineWidth=1.4*u;var cw=64*u,ch=86*u;for(var r=-1;r*ch<H+ch;r++)for(var q=-1;q*cw<W+cw;q++){var x=q*cw+(r%2?cw/2:0),y=r*ch;sdArch(c,x+cw*.18,x+cw*.82,y+ch*.12,y+ch*.92,.5);c.stroke()}c.restore()}
function sdBg(c,W,H,P,k,u){c.fillStyle=P.bg;c.fillRect(0,0,W,H);var g;
 if(k==='grad'){g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.bg2);g.addColorStop(1,P.bg);c.fillStyle=g;c.fillRect(0,0,W,H)}
 else if(k==='glow'){g=c.createRadialGradient(W/2,H*.18,10*u,W/2,H*.18,Math.max(W,H)*.75);g.addColorStop(0,P.bg2);g.addColorStop(1,P.bg);c.fillStyle=g;c.fillRect(0,0,W,H)}
 else if(k==='pattern'){sdPattern(c,W,H,sdA(P.ac,sdLum(P.bg)>.4?.13:.09),u)}}
/* كل قالب يرسم زخرفته ويعيد صندوق النص {x0,x1,y0,y1} ومكان العنوان العلوي والسطر السفلي */
function sdDeco(c,s,W,H,P,u){var t=s.tpl,m=Math.round(Math.min(W,H)*.07),bx={x0:W*.14,x1:W*.86,y0:H*.2,y1:H*.84,lab:H*.13,foot:H*.92,labc:P.ac};
 c.strokeStyle=P.ac;c.fillStyle=P.ac;var wide=W>H;
 if(t==='mihrab'){var aw=wide?H*.95:W,ax0=(W-aw)/2+m,ax1=W-(W-aw)/2-m;c.lineWidth=3*u;sdArch(c,ax0,ax1,m*.9,H-m*.6);c.stroke();c.globalAlpha=.5;c.lineWidth=1.3*u;sdArch(c,ax0+26*u,ax1-26*u,m*.9+40*u,H-m*.6);c.stroke();c.globalAlpha=1;
  var top=m*.9+(ax1-ax0)*.42*.55;bx={x0:ax0+70*u,x1:ax1-70*u,y0:top+70*u,y1:H-m*.6-120*u,lab:top+10*u,foot:H-m*.6-55*u,labc:P.ac}}
 else if(t==='window'){var ww=wide?H*.92:W*.8,wx0=(W-ww)/2,wx1=wx0+ww,wt=m*1.3,wb=H-m*1.3;c.fillStyle=P.bg2;sdArch(c,wx0,wx1,wt,wb,.36);c.closePath();c.fill();c.lineWidth=2.4*u;c.stroke();c.globalAlpha=.45;c.lineWidth=1.2*u;sdArch(c,wx0+18*u,wx1-18*u,wt+28*u,wb-18*u,.36);c.closePath();c.stroke();c.globalAlpha=1;
  var wtop=wt+ww*.36*.5;bx={x0:wx0+60*u,x1:wx1-60*u,y0:wtop+60*u,y1:wb-110*u,lab:wtop+4*u,foot:wb-50*u,labc:P.ac}}
 else if(t==='paper'){c.lineWidth=4*u;c.strokeRect(m,m,W-2*m,H-2*m);c.lineWidth=1.2*u;c.strokeRect(m+16*u,m+16*u,W-2*m-32*u,H-2*m-32*u);
  [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(function(q){c.fillRect(q[0]+(q[2]>0?0:-34*u),q[1]+(q[3]>0?0:-34*u),34*u,34*u)});c.fillStyle=P.bg;[[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(function(q){c.fillRect(q[0]+(q[2]>0?6*u:-28*u),q[1]+(q[3]>0?6*u:-28*u),22*u,22*u)});
  bx={x0:m+80*u,x1:W-m-80*u,y0:m+150*u,y1:H-m-140*u,lab:m+85*u,foot:H-m-70*u,labc:P.ac}}
 else if(t==='frame'){var f=m*1.1,r=46*u;c.lineWidth=2.6*u;c.beginPath();c.moveTo(f+r,f);c.lineTo(W-f-r,f);c.arc(W-f,f,r,Math.PI,Math.PI/2,true);c.lineTo(W-f,H-f-r);c.arc(W-f,H-f,r,-Math.PI/2,Math.PI,true);c.lineTo(f+r,H-f);c.arc(f,H-f,r,0,-Math.PI/2,true);c.lineTo(f,f+r);c.arc(f,f,r,Math.PI/2,0,true);c.stroke();
  c.globalAlpha=.4;c.lineWidth=1.1*u;c.strokeRect(f+22*u,f+22*u,W-2*f-44*u,H-2*f-44*u);c.globalAlpha=1;
  [f,H-f].forEach(function(y){c.save();c.translate(W/2,y);c.rotate(Math.PI/4);c.fillStyle=P.bg;c.fillRect(-15*u,-15*u,30*u,30*u);c.strokeRect(-15*u,-15*u,30*u,30*u);c.fillStyle=P.ac;c.fillRect(-6*u,-6*u,12*u,12*u);c.restore()});
  bx={x0:f+80*u,x1:W-f-80*u,y0:f+150*u,y1:H-f-140*u,lab:f+85*u,foot:H-f-70*u,labc:P.ac}}
 else if(t==='crescent'){var cx=W/2,cy=wide?H*.17:Math.min(H*.13,150*u+m),R=46*u;c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.arc(cx+R*.42,cy-R*.22,R*.84,0,Math.PI*2,true);c.fill('evenodd');
  c.globalAlpha=.55;c.lineWidth=1.4*u;c.beginPath();c.moveTo(W*.3,cy+R+40*u);c.lineTo(W*.7,cy+R+40*u);c.stroke();c.globalAlpha=1;
  bx={x0:W*.13,x1:W*.87,y0:cy+R+150*u,y1:H-m-120*u,lab:cy+R+90*u,foot:H-m-40*u,labc:P.ac}}
 else if(t==='band'){var bh=wide?150*u:190*u;c.fillRect(0,0,W,bh);c.fillRect(0,H-18*u,W,18*u);bx={x0:W*.12,x1:W*.88,y0:bh+110*u,y1:H-170*u,lab:bh/2,foot:H-90*u,labc:P.bg,labbig:true}}
 else if(t==='lattice'){var pw=wide?W*.62:W*.78,ph=wide?H*.8:H*.78,px=(W-pw)/2,py=(H-ph)/2;c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=40*u;c.fillStyle=P.bg;cdRR(c,px,py,pw,ph,28*u);c.fill();c.restore();c.lineWidth=1.6*u;c.globalAlpha=.6;cdRR(c,px+14*u,py+14*u,pw-28*u,ph-28*u,20*u);c.stroke();c.globalAlpha=1;
  bx={x0:px+70*u,x1:px+pw-70*u,y0:py+140*u,y1:py+ph-130*u,lab:py+80*u,foot:py+ph-62*u,labc:P.ac}}
 else if(t==='minimal'){bx={x0:W*.12,x1:W*.88,y0:H*.22,y1:H*.8,lab:H*.12,foot:H*.9,labc:P.ac,rule:true}}
 else if(t==='tablet'){var tw=wide?W*.66:W*.82,th=wide?H*.76:H*.74,tx0=(W-tw)/2,ty0=(H-th)/2+20*u;c.fillStyle=sdA(P.bg2,.55);cdRR(c,tx0,ty0,tw,th,40*u);c.fill();c.lineWidth=1.4*u;c.strokeStyle=sdA(P.ac,.55);c.stroke();
  bx={x0:tx0+60*u,x1:tx0+tw-60*u,y0:ty0+90*u,y1:ty0+th-110*u,lab:ty0,foot:ty0+th-52*u,labc:P.bg,pill:P.ac}}
 else if(t==='dawn'){var hy=H*.83,sr=wide?120*u:150*u;c.save();c.beginPath();c.rect(0,0,W,hy);c.clip();var g=c.createRadialGradient(W/2,hy,10*u,W/2,hy,sr*2.2);g.addColorStop(0,sdA(P.ac,.55));g.addColorStop(1,sdA(P.ac,0));c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle=sdA(P.ac,.9);c.beginPath();c.arc(W/2,hy,sr*.55,0,Math.PI*2);c.fill();c.restore();
  c.fillStyle=P.bg;c.fillRect(0,hy,W,H-hy);c.lineWidth=2*u;c.strokeStyle=P.ac;c.beginPath();c.moveTo(0,hy);c.lineTo(W,hy);c.stroke();
  c.globalAlpha=.85;c.lineWidth=2.2*u;sdArch(c,W/2-sr*.95,W/2+sr*.95,hy-sr*1.55,hy,.5);c.stroke();c.globalAlpha=1;
  bx={x0:W*.12,x1:W*.88,y0:H*.17,y1:hy-sr*1.75,lab:H*.1,foot:H-(H-hy)/2,labc:P.ac}}
 return bx}
/* يرسم التصميم كاملًا بالمقاس الحقيقي مضروبًا في k؛ ويعيد {cv,fit} — fit=false إن لم يتسع النص حتى بأصغر خط */
function sdDraw(s,k){k=k||1;var Z=SDZ[s.sz]||SDZ.sq,W=Z[0],H=Z[1],u=Math.min(W,H)/1080,P=sdPal(s),cv=document.createElement('canvas');cv.width=Math.round(W*k);cv.height=Math.round(H*k);
 var c=cv.getContext('2d');c.scale(k,k);c.direction='rtl';c.textBaseline='middle';c.textAlign='center';
 sdBg(c,W,H,P,s.bgk,u);var bx=sdDeco(c,s,W,H,P,u);
 var TX=String(s.c.text).replace(/[ ]+([\u06D6-\u06DE]+)(?=[ \n]|$)/g,'\u00A0$1'),fid=sdFontId(s),fam=SDF[fid][1],wt=(s.bold&&(fid==='amiri'||fid==='plex'))?(fid==='plex'?'600':'700'):'400',q=s.c.quran;
 var lab=s.lab==null?(s.c.label||''):s.lab,top=bx.y0,bot=bx.y1;
 /* العنوان العلوي (من المكتبة أو من المستخدم) */
 if(lab){c.fillStyle=bx.labc;c.font='500 '+Math.round((bx.labbig?40:30)*u)+'px '+SDU;c.textBaseline='middle';var l1=cdWrap(c,lab,bx.x1-bx.x0)[0]||'';
  if(bx.pill){var pw2=c.measureText(l1).width+70*u,ph2=60*u;c.fillStyle=bx.pill;cdRR(c,W/2-pw2/2,bx.lab-ph2/2,pw2,ph2,ph2/2);c.fill();c.fillStyle=bx.labc}c.fillText(l1,W/2,bx.lab)}
 if(s.ttl){c.fillStyle=P.tx;c.font='600 '+Math.round(44*u)+'px '+SDU;var tl=cdWrap(c,s.ttl,bx.x1-bx.x0).slice(0,2);tl.forEach(function(l,i){c.fillText(l,W/2,top+30*u+i*58*u)});top+=tl.length*58*u+40*u}
 /* السطر السفلي: المرجع ثم «أثر» */
 var foot=[];if(s.note)foot.push(['note',s.note]);if(s.ref&&s.c.ref)foot.push(['ref',s.c.ref]);if(s.brand)foot.push(['brand','أثر · atharuk.com']);
 var fy=bx.foot;for(var i=foot.length-1;i>=0;i--){var f=foot[i],big=f[0]==='note';c.font=(f[0]==='brand'?'500 ':big?'600 ':'400 ')+Math.round((f[0]==='brand'?24:big?32:26)*u)+'px '+SDU;c.fillStyle=f[0]==='brand'?bx.labc===P.bg?P.ac:bx.labc:f[0]==='note'?P.tx:P.mu;c.globalAlpha=f[0]==='brand'?.9:1;
  var fl=cdWrap(c,f[1],bx.x1-bx.x0).slice(0,2);for(var j=fl.length-1;j>=0;j--){c.fillText(fl[j],W/2,fy);fy-=(big?46:38)*u}c.globalAlpha=1;fy-=8*u}
 bot=Math.min(bot,fy-30*u);
 if(bx.rule){c.fillStyle=P.ac;c.fillRect(W/2-30*u,top-10*u,60*u,3*u)}
 /* النص: أكبر خط يتسع في الصندوق، ثم نسبة المستخدم منه */
 var w=bx.x1-bx.x0,h=bot-top-(bx.rule?40*u:0),lm=(q?2.05:2)*(s.lh/100),fs,L,fit=true,c0=document.createElement('canvas').getContext('2d');c0.direction='rtl';
 for(fs=Math.round(130*u);fs>=Math.round(20*u);fs-=2){c0.font=wt+' '+fs+'px '+fam;L=sdWrap(c0,TX,w);if(L.length*fs*lm<=h)break}
 if(fs<Math.round(20*u)){fit=false;fs=Math.round(20*u)}
 var f2=Math.max(Math.round(18*u),Math.round(fs*s.fs/100));if(f2!==fs){fs=f2;c0.font=wt+' '+fs+'px '+fam;L=sdWrap(c0,TX,w)}
 var lh=fs*lm,blk=L.length*lh,y=top+(bx.rule?20*u:0)+Math.max(0,(h-blk)/2);
 if(blk>h+2)fit=false;
 c.font=wt+' '+fs+'px '+fam;c.fillStyle=P.tx;c.textBaseline='alphabetic';var wi=0,hw=s.c.hlw||null,al=s.al||'c';
 /* نهاية كل فقرة لا تُضبط */
 var paraEnd=[],acc=0;TX.replace(/\r\n?/g,'\n').split('\n').forEach(function(par){var c1=document.createElement('canvas').getContext('2d');c1.direction='rtl';c1.font=c.font;var n=sdWrap(c1,par,w).length;acc+=n;paraEnd.push(acc-1)});
 L.forEach(function(l,i){var n=l.split(/[ \t]+/).filter(Boolean).length,hf=hw?hw.slice(wi,wi+n):null;wi+=n;sdLine(c,l,bx.x1,w,y+lh/2+fs*.32,fs,q?-.07:-.09,al,paraEnd.indexOf(i)>-1,hf,P.ac);y+=lh});
 if(bx.rule){c.fillStyle=P.ac;c.fillRect(W/2-30*u,y+14*u,60*u,3*u)}
 return{cv:cv,fit:fit}}

/* ---------- الخطوط ---------- */
var SDFL={};
function sdFonts(s){var fid=sdFontId(s),key=fid+(s.bold?'b':''),fam=SDF[fid][1].split(',')[0];if(SDFL[key])return SDFL[key];
 var ld=function(f,t){try{return document.fonts.load(f,t||'أثر').catch(function(){})}catch(e){return Promise.resolve()}},sample=String(s.c.text).slice(0,120);
 return SDFL[key]=Promise.all([ld((s.bold?'700 ':'400 ')+'40px '+fam,sample),ld('400 40px '+fam,sample),ld('500 30px "IBM Plex Sans Arabic"'),ld('600 40px "IBM Plex Sans Arabic"'),ld('400 30px "IBM Plex Sans Arabic"')]).then(function(){SDINK={}})}

/* ---------- الواجهة ---------- */
var SDI={save:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/></svg>',del:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'};
function sdSeg(name,opts,cur,lab){return '<div class="apseg sdseg" role="radiogroup" aria-label="'+lab+'" style="grid-template-columns:repeat('+opts.length+',1fr)">'+opts.map(function(o){return '<button type="button" role="radio" aria-checked="'+(String(cur)===String(o[0]))+'" data-sd="'+name+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div>'}
function vStudio(){return head('صمّم بطاقة','آية أو ذكر أو دعاء من مصادر موثقة، بتصميمك')+
 '<div class="sd" id="sd"><div class="sdpv"><div class="sdcv" id="sdV"><canvas id="sdC" role="img" aria-label="معاينة التصميم"></canvas></div><p class="sdw" id="sdW" role="status" hidden></p></div>'+
 '<div class="sdpn"><div class="sdtabs" role="tablist" aria-label="أقسام المحرر">'+[['content','المحتوى'],['tpl','القالب'],['text','النص'],['color','الألوان'],['size','المقاس']].map(function(t){return '<button type="button" role="tab" id="sdt-'+t[0]+'" aria-controls="sdP" aria-selected="'+(SDTAB===t[0])+'" data-sdtab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
 '<div class="sdp" id="sdP" role="tabpanel" aria-labelledby="sdt-'+SDTAB+'"></div></div>'+
 '<div class="sdbar"><button class="btn primary" type="button" data-sdgo="share">'+SDI.share+'مشاركة</button><button class="btn" type="button" data-sdgo="dl" aria-expanded="false" aria-controls="sdX">'+SDI.down+'تنزيل</button><button class="btn" type="button" data-sdgo="keep" aria-label="حفظ في تصاميمي">'+SDI.save+'حفظ</button></div>'+
 '<div class="sdx" id="sdX" hidden><div class="sdrow"><span class="sdl" id="sdxf">الصيغة</span>'+sdSeg('xf',[['png','PNG'],['jpg','JPG']],SDEXP.f,'صيغة الصورة')+'</div><div class="sdrow"><span class="sdl">الجودة</span>'+sdSeg('xk',[[1,'عادية'],[2,'عالية']],SDEXP.k,'جودة الصورة')+'</div><p class="sdsm" id="sdXs"></p><button class="btn primary sdxgo" type="button" data-sdgo="dlnow">'+SDI.down+'تنزيل الصورة</button></div>'+
 '<section class="sdmine" aria-labelledby="sdmh"><h2 class="mrs" id="sdmh">تصاميمي</h2><div id="sdM"></div><p class="sdsm">تُحفظ تصاميمك على هذا الجهاز فقط.</p></section></div>'}
function sdNorm(t){return String(t).replace(/[ً-ٰٟـۖ-ۭ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')}
function sdPick(L,cur){var q=sdNorm(SDQ.trim());var R=L.filter(function(x){return !q||sdNorm(x[1]+' '+x[2]).indexOf(q)>-1});
 return '<label class="sr" for="sdq">ابحث في القائمة</label><input id="sdq" class="sdin sdq" type="search" placeholder="ابحث في القائمة" autocomplete="off" value="'+esc(SDQ)+'">'+
 (R.length?'<ul class="sdlist" role="listbox" aria-label="اختر النص">'+R.slice(0,120).map(function(x){return '<li><button type="button" role="option" aria-selected="'+(x[0]===cur)+'" data-sdpick="'+x[0]+'"><b>'+esc(x[1])+'</b><span>'+esc(x[2].length>90?x[2].slice(0,90).replace(/\s+\S*$/,'')+' …':x[2])+'</span></button></li>'}).join('')+'</ul>':'<p class="sdsm">لا نتائج.</p>')}
function sdPanel(){var P=document.getElementById('sdP');if(!P||!SD)return;var s=SD,h='',c=s.c;
 if(SDTAB==='content'){h=sdSeg('kind',[['q','آية'],['z','ذكر'],['d','دعاء'],['h','حديث']],SDKIND,'نوع النص');
  if(SDKIND==='q'){var n=c.k==='q'?c.n:2,a=c.k==='q'?c.a:1,b=c.k==='q'?c.b:a;
   h+='<div class="sdq3"><label>السورة<select id="sdqs">'+QN.map(function(nm,i){return '<option value="'+(i+1)+'"'+(i+1===n?' selected':'')+'>'+ar(i+1)+'. '+nm+'</option>'}).join('')+'</select></label><label>من الآية<input id="sdqa" type="number" inputmode="numeric" min="1" max="'+QC[n-1]+'" value="'+a+'"></label><label>إلى الآية<input id="sdqb" type="number" inputmode="numeric" min="1" max="'+QC[n-1]+'" value="'+b+'"></label></div><p class="sdsm">نص المصحف كما هو حرفًا بحرف. حتى ٢٠ آية في التصميم الواحد.</p>'}
  else if(SDKIND==='z'){var cz=c.k==='z'&&ALL[c.id]?ALL[c.id].category:CA[0][0];h+='<label class="sdl" for="sdzc">القسم</label><select id="sdzc" class="sdsel">'+CA.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===cz?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'+sdPick(rdList('dhikr',cz).map(function(o){var x=cdFromItem(o);return[o.id,o.title||(x.text.split(' ').slice(0,4).join(' ')),x.text]}),c.id)}
  else if(SDKIND==='d'){var kd=c.k==='d'&&ALL[c.id]?(ALL[c.id].kind||'general'):'sunnah';h+='<label class="sdl" for="sddk">النوع</label><select id="sddk" class="sdsel">'+DK.map(function(x){return '<option value="'+x[0]+'"'+(x[0]===kd?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'+sdPick(rdList('dua',kd).map(function(o){var x=cdFromItem(o);return[o.id,o.title||(x.text.split(' ').slice(0,4).join(' ')),x.text]}),c.id)}
  else h+=sdPick(sdHadiths().map(function(w){return[w.id,w.title,w.text]}),c.id);
  h+='<div class="sdref"><span>المرجع</span><b>'+esc(c.ref||'—')+'</b></div>'}
 else if(SDTAB==='tpl'){h='<div class="sdtpl" role="radiogroup" aria-label="القالب">'+Object.keys(SDT).map(function(k){return '<button type="button" role="radio" aria-checked="'+(s.tpl===k)+'" data-sd="tpl" data-v="'+k+'"><img alt="" src="'+(SDTH[k]||'')+'" data-sdth="'+k+'" width="120" height="120"><span>'+SDT[k][0]+'</span></button>'}).join('')+'</div><p class="sdsm">اختيار القالب يضبط ألوانه وخلفيته، وتقدر تغيّرها بعده.</p>'}
 else if(SDTAB==='text'){var q=c.quran,F=(q?['hafs','amiriq','amiri']:['amiri','amiriq','plex']).map(function(k){return[k,SDF[k][0]]}),fid=sdFontId(s);
  h='<div class="sdrow"><span class="sdl">الخط</span>'+sdSeg('font',F,fid,'الخط')+'</div>'+(fid==='amiri'||fid==='plex'?'<div class="sdrow"><span class="sdl">السُّمك</span>'+sdSeg('bold',[['0','عادي'],['1','عريض']],s.bold?'1':'0','سمك الخط')+'</div>':'')+
  '<div class="sdrow"><span class="sdl">المحاذاة</span>'+sdSeg('al',[['c','وسط'],['r','يمين'],['j','ضبط']],s.al,'المحاذاة')+'</div>'+
  '<label class="sdrng"><span>حجم الخط <output id="sdfo">'+ar(s.fs)+'٪</output></span><input type="range" min="55" max="100" step="5" value="'+s.fs+'" data-sdr="fs" aria-describedby="sdfh"></label><p class="sdsm" id="sdfh">١٠٠٪ = أكبر حجم يتسع له النص في هذا المقاس.</p>'+
  '<label class="sdrng"><span>تباعد الأسطر <output id="sdlo">'+ar(s.lh)+'٪</output></span><input type="range" min="80" max="130" step="5" value="'+s.lh+'" data-sdr="lh"></label>'+
  '<label class="sdl" for="sdlab">العنوان العلوي</label><input id="sdlab" class="sdin" maxlength="40" value="'+esc(s.lab==null?(c.label||''):s.lab)+'" placeholder="بدون عنوان">'+
  '<label class="sdl" for="sdttl">عبارة من عندك فوق النص (اختياري)</label><input id="sdttl" class="sdin" maxlength="50" value="'+esc(s.ttl)+'" placeholder="مثل: جمعة مباركة">'+
  '<label class="sdl" for="sdnote">إهداء أسفل التصميم (اختياري)</label><input id="sdnote" class="sdin" maxlength="50" value="'+esc(s.note)+'" placeholder="مثل: صدقة جارية عن والدي">'+
  '<div class="sdrow"><span class="sdl">المرجع</span>'+sdSeg('ref',[['1','ظاهر'],['0','مخفي']],s.ref?'1':'0','إظهار المرجع')+'</div><div class="sdrow"><span class="sdl">اسم أثر</span>'+sdSeg('brand',[['1','ظاهر'],['0','مخفي']],s.brand?'1':'0','إظهار اسم أثر')+'</div>'}
 else if(SDTAB==='color'){var cu=s.cu||{bg:sdPal(s).bg,tx:sdPal(s).tx,ac:sdPal(s).ac};
  h='<div class="sdpal" role="radiogroup" aria-label="الألوان">'+Object.keys(SDP).map(function(k){var p=SDP[k];return '<button type="button" role="radio" aria-checked="'+(s.pal===k)+'" data-sd="pal" data-v="'+k+'"><i style="background:linear-gradient(135deg,'+p[1]+' 0 55%,'+p[2]+' 55% 78%,'+p[5]+' 78%)"></i><span>'+p[0]+'</span></button>'}).join('')+'</div>'+
  '<div class="sdcus"><span class="sdl">ألوانك</span><label><input type="color" value="'+cu.bg+'" data-sdc="bg"><span>الخلفية</span></label><label><input type="color" value="'+cu.tx+'" data-sdc="tx"><span>النص</span></label><label><input type="color" value="'+cu.ac+'" data-sdc="ac"><span>الزخرفة</span></label></div>'+
  '<div class="sdrow"><span class="sdl">الخلفية</span>'+sdSeg('bgk',[['solid','لون'],['grad','تدرّج'],['glow','توهّج'],['pattern','نقش']],s.bgk,'نوع الخلفية')+'</div>'}
 else if(SDTAB==='size'){h='<div class="sdsz" role="radiogroup" aria-label="المقاس">'+Object.keys(SDZ).map(function(k){var z=SDZ[k],r=z[0]/z[1];return '<button type="button" role="radio" aria-checked="'+(s.sz===k)+'" data-sd="sz" data-v="'+k+'"><i style="width:'+Math.round(r>=1?46:46*r)+'px;height:'+Math.round(r>=1?46/r:46)+'px"></i><b>'+z[2]+'</b><span>'+z[3]+'</span><small>'+ar(z[0])+'×'+ar(z[1])+'</small></button>'}).join('')+'</div>'}
 P.innerHTML=h;P.setAttribute('aria-labelledby','sdt-'+SDTAB);if(SDTAB==='tpl')sdThumbs()}
/* معاينات القوالب: تُرسم مرة بنص قصير ثابت */
function sdThumbs(){var smp={k:'z',label:'ذكر',text:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',ref:'',quran:false};
 Promise.all([sdFonts({c:smp,tpl:'mihrab',font:'amiri',bold:false}),sdFonts({c:smp,tpl:'band',font:'plex',bold:false})]).then(function(){Object.keys(SDT).forEach(function(k,i){if(SDTH[k]){var im=document.querySelector('[data-sdth="'+k+'"]');if(im&&!im.getAttribute('src'))im.src=SDTH[k];return}
  setTimeout(function(){var t=SDT[k],s={c:smp,tpl:k,pal:t[1],bgk:t[2],sz:'sq',font:'',bold:false,fs:100,lh:100,al:'c',lab:null,ttl:'',note:'',ref:false,brand:false};
   var cv=sdDraw(s,.25).cv;SDTH[k]=cv.toDataURL('image/jpeg',.82);var im=document.querySelector('[data-sdth="'+k+'"]');if(im)im.src=SDTH[k]},i*30)})})}
function sdMineHtml(){var M=sdMine(),B=document.getElementById('sdM');if(!B)return;
 B.innerHTML=M.length?'<ul class="sdgrid">'+M.map(function(d){return '<li><button type="button" class="sdopen" data-sdopen="'+d.id+'" aria-label="فتح التصميم: '+esc((d.s.c.label||'')+' '+(d.s.c.ref||''))+'"><img alt="" src="'+d.th+'"></button><button type="button" class="sddel" data-sddel="'+d.id+'" aria-label="حذف التصميم">'+SDI.del+'</button></li>'}).join('')+'</ul>':'<p class="sdsm">لم تحفظ تصميمًا بعد. اضغط «حفظ» ليبقى هنا وتعود إليه لاحقًا.</p>'}
function sdSizeNote(){var x=document.getElementById('sdXs');if(!x||!SD)return;var Z=SDZ[SD.sz];x.textContent='المقاس: '+ar(Z[0]*SDEXP.k)+'×'+ar(Z[1]*SDEXP.k)+' بكسل'}
function sdDraft(){sdStore();sdQueue()}
function sdQueue(){if(SDRAF)return;SDRAF=requestAnimationFrame(function(){SDRAF=0;sdRender()})}
function sdRender(){var C=document.getElementById('sdC');if(!C||!SD)return;var s=SD;sdFonts(s).then(function(){if(s!==SD||!document.getElementById('sdC'))return;var r=sdDraw(s,1),C2=document.getElementById('sdC');
 C2.width=r.cv.width;C2.height=r.cv.height;C2.getContext('2d').drawImage(r.cv,0,0);SDCV=r.cv;var V2=document.getElementById('sdV');if(V2)V2.style.aspectRatio=r.cv.width+'/'+r.cv.height;
 var Wn=document.getElementById('sdW'),P=sdPal(s),msg=!r.fit?'النص طويل على هذا المقاس، فصغُر الخط كثيرًا. جرّب مقاس «قصة» أو آيات أقل.':sdCon(P.bg,P.tx)<3?'التباين بين لون النص والخلفية ضعيف، وقد يصعب قراءته.':'';
 if(Wn){Wn.hidden=!msg;Wn.textContent=msg}C2.setAttribute('aria-label','معاينة التصميم: '+String(s.c.text).slice(0,120))})}
function sdInit(){if(!document.getElementById('sd'))return;SD=sdLoad();if(SDIN){var x=SDIN;SDIN=null;x.k=x.k||(x.quran?'q':'z');SD.c=x;SD.lab=null;SD.ttl='';SD.note='';SDKIND=x.k==='q'||x.quran?'q':x.k}else SDKIND=SD.c.k||'q';
 if(SD.c.k==='x')SDKIND='q';sdStore();sdPanel();sdMineHtml();sdSizeNote();sdRender()}
function sdSetC(x){if(!x)return;SD.c=x;SD.lab=null;if(SD.font&&x.quran&&SD.font==='plex')SD.font='';sdDraft();var r=document.querySelector('.sdref b');if(r)r.textContent=x.ref||'—';live('تم اختيار النص')}
function sdFile(cb,f,k){var s=SD;sdFonts(s).then(function(){var r=sdDraw(s,k||SDEXP.k),ty=f==='jpg'?'image/jpeg':'image/png',nm='athar-'+(s.c.name||'design')+'.'+(f==='jpg'?'jpg':'png');
 r.cv.toBlob(function(bl){var file=null;try{file=new File([bl],nm,{type:ty})}catch(e){}cb(bl,file,nm,r.cv,ty)},ty,f==='jpg'?.94:undefined)})}
function sdDownload(){sdFile(function(bl,file,nm,cv,ty){
 if(cdIOS()&&file&&navigator.canShare&&navigator.canShare({files:[file]})){kmTo('اختر «حفظ الصورة»');navigator.share({files:[file]}).catch(function(){});return}
 var cl=window.claude;if(cl&&typeof cl.use==='function'){cl.use('downloads').then(function(dl){if(!dl)throw 0;return dl.save({filename:nm,data:bl}).then(function(r){if(r&&r.status==='saved')kmTo('حُفظت الصورة')})}).catch(function(){kmTo('تعذّر التنزيل هنا')});return}
 var u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=nm;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);kmTo('نُزّلت الصورة')},SDEXP.f,SDEXP.k)}
function sdShare(){sdFile(function(bl,file){if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'أثر'}).catch(function(){})}else{kmTo('المشاركة غير متاحة في هذا المتصفح — نزّل الصورة ثم شاركها');var x=document.getElementById('sdX');if(x&&x.hidden)document.querySelector('[data-sdgo="dl"]').click()}},'png',1)}
function sdKeep(){var M=sdMine(),th=sdDraw(SD,.22).cv.toDataURL('image/jpeg',.78),id='d'+Date.now().toString(36);M.unshift({id:id,t:Date.now(),s:JSON.parse(JSON.stringify(SD)),th:th});if(M.length>40)M.length=40;
 try{localStorage.setItem('athar-designs',JSON.stringify(M));kmTo('حُفظ في تصاميمي')}catch(e){kmTo('مساحة الحفظ ممتلئة — احذف بعض التصاميم القديمة')}sdMineHtml()}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest||!t.closest('#sd'))return;var b;
 if((b=t.closest('[data-sdtab]'))){SDTAB=b.dataset.sdtab;SDQ='';document.querySelectorAll('[data-sdtab]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});sdPanel();return}
 if((b=t.closest('[data-sdpick]'))){var id=b.dataset.sdpick,x=SDKIND==='h'?sdHadith(id):sdItem(id);if(x){sdSetC(x);document.querySelectorAll('[data-sdpick]').forEach(function(y){y.setAttribute('aria-selected',String(y===b))})}return}
 if((b=t.closest('[data-sd]'))){var k=b.dataset.sd,v=b.dataset.v;
  if(k==='kind'){SDKIND=v;SDQ='';sdPanel();return}
  if(k==='xf'||k==='xk'){if(k==='xf')SDEXP.f=v;else SDEXP.k=+v;b.parentNode.querySelectorAll('button').forEach(function(y){y.setAttribute('aria-checked',String(y===b))});sdSizeNote();return}
  if(k==='tpl'){var T=SDT[v];SD.tpl=v;SD.pal=T[1];SD.bgk=T[2];SD.al=T[4];SD.font='';SD.bold=false}
  else if(k==='bold'||k==='ref'||k==='brand')SD[k]=v==='1';else SD[k]=v;
  b.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]').forEach(function(y){y.setAttribute('aria-checked',String(y===b))});
  if(k==='font'||k==='sz')sdPanel();if(k==='sz')sdSizeNote();sdDraft();return}
 if((b=t.closest('[data-sdgo]'))){var g=b.dataset.sdgo;
  if(g==='dl'){var X=document.getElementById('sdX');X.hidden=!X.hidden;b.setAttribute('aria-expanded',String(!X.hidden));if(!X.hidden){sdSizeNote();X.scrollIntoView({block:'nearest',behavior:'smooth'})}return}
  if(g==='dlnow'){sdDownload();return}if(g==='share'){sdShare();return}if(g==='keep'){sdKeep();return}}
 if((b=t.closest('[data-sdopen]'))){var d=sdMine().filter(function(x){return x.id===b.dataset.sdopen})[0];if(d){SD=d.s;SD.c=sdResolve(SD.c);SDKIND=SD.c.k||'q';sdStore();sdPanel();sdSizeNote();sdRender();document.getElementById('sd').scrollIntoView({behavior:'smooth'});kmTo('فُتح التصميم')}return}
 if((b=t.closest('[data-sddel]'))){if(!confirm('حذف هذا التصميم من تصاميمك؟'))return;var M=sdMine().filter(function(x){return x.id!==b.dataset.sddel});try{localStorage.setItem('athar-designs',JSON.stringify(M))}catch(x){}sdMineHtml();kmTo('حُذف التصميم')}});
document.addEventListener('input',function(e){var t=e.target;if(!t.closest||!t.closest('#sd')||!SD)return;
 if(t.dataset.sdr){SD[t.dataset.sdr]=+t.value;var o=document.getElementById(t.dataset.sdr==='fs'?'sdfo':'sdlo');if(o)o.textContent=ar(t.value)+'٪';sdDraft();return}
 if(t.dataset.sdc){var p=sdPal(SD);SD.cu=SD.cu||{bg:p.bg,tx:p.tx,ac:p.ac};SD.cu[t.dataset.sdc]=t.value;SD.pal='custom';document.querySelectorAll('.sdpal [role="radio"]').forEach(function(y){y.setAttribute('aria-checked','false')});sdDraft();return}
 if(t.id==='sdlab'){SD.lab=t.value;sdDraft();return}if(t.id==='sdttl'){SD.ttl=t.value;sdDraft();return}if(t.id==='sdnote'){SD.note=t.value;sdDraft();return}
 if(t.id==='sdq'){SDQ=t.value;var pos=t.selectionStart;sdPanel();var q=document.getElementById('sdq');if(q){q.focus();try{q.setSelectionRange(pos,pos)}catch(x){}}return}});
document.addEventListener('change',function(e){var t=e.target;if(!t.closest||!t.closest('#sd')||!SD)return;
 if(t.id==='sdqs'||t.id==='sdqa'||t.id==='sdqb'){var n=+document.getElementById('sdqs').value,a=+document.getElementById('sdqa').value||1,b=+document.getElementById('sdqb').value||a;
  if(t.id==='sdqs'){a=1;b=1}if(b<a)b=a;if(b-a>19)b=a+19;var x=sdVerses(n,a,b);sdSetC(x);sdPanel();return}
 if(t.id==='sdzc'||t.id==='sddk'){SDQ='';var L=t.id==='sdzc'?rdList('dhikr',t.value):rdList('dua',t.value);if(L[0])sdSetC(sdItem(L[0].id));sdPanel();var s2=document.getElementById(t.id);if(s2)s2.focus()}});
/* من بطاقة المشاركة: «تخصيص التصميم» يفتح المحرر بالنص نفسه */
function sdFromCard(){if(!CDO)return;var x=JSON.parse(JSON.stringify(CDO));x.k=x.quran?'x':'z';
 if(x.name&&ALL[x.name]){var y=sdItem(x.name);if(y)x=y}else if(/^quran-(\d+)-(\d+)(?:-(\d+))?$/.test(x.name||'')){var m=/^quran-(\d+)-(\d+)(?:-(\d+))?$/.exec(x.name);x=sdVerses(+m[1],+m[2],+(m[3]||m[2]))}else if(x.name&&wqById(x.name)){var w=wqById(x.name);x=w.textType==='hadith'?sdHadith(w.id):x}
 SDIN=x;cdClose();nav('#/studio')}
