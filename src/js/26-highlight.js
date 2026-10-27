/* تمييز ألفاظ الذكر أو الدعاء بالذهبي داخل النصوص التي فيها رواية أو إرشاد (مثل: «كلمتان خفيفتان… سبحان الله وبحمده…»).
   العبارات في src/data/highlights.json منقولة من النص نفسه حرفًا بحرف (يتحقق منها tools/check.mjs)، ولا يتغيّر النص؛ التمييز في العرض والبطاقة فقط. */
var HL=/*@data:highlights*/;
function hlRanges(o,t){var P=HL[o.id];if(!P||!t)return null;var R=[];P.forEach(function(p){var k=0;while((k=t.indexOf(p,k))>-1){R.push([k,k+p.length]);k+=p.length}});
 R.sort(function(a,b){return a[0]-b[0]});var M=[];R.forEach(function(r){var l=M[M.length-1];if(l&&r[0]<=l[1])l[1]=Math.max(l[1],r[1]);else M.push(r.slice())});return M.length?M:null}
function hlHtml(o,t){var R=hlRanges(o,t);if(!R)return t;var s='',k=0;R.forEach(function(r){s+=t.slice(k,r[0])+'<mark class="dk">'+t.slice(r[0],r[1])+'</mark>';k=r[1]});return s+t.slice(k)}
/* لكل كلمة في النص (كما تقسمها البطاقة): هل هي من الألفاظ المميزة؟ */
function hlWords(o,t){var R=hlRanges(o,t);if(!R)return null;var w=[],re=/\S+/g,m;while((m=re.exec(t)))w.push(R.some(function(r){return m.index<r[1]&&m.index+m[0].length>r[0]}));return w}
