const fallback={ALL:{sat:93.61,diss:1.68,respondents:616,scores:9213,dq:27},U01:{sat:96.59,diss:1.71,respondents:43,scores:645,dq:0},U02:null,U03:null,U04:{sat:98.34,diss:.11,respondents:62,scores:930,dq:0},U05:{sat:91.75,diss:2.40,respondents:163,scores:2418,dq:27},U06:{sat:93.26,diss:1.63,respondents:348,scores:5220,dq:0}};
const names={U01:"ไตเทียม",U02:"วิสัญญี",U03:"งานห้องผ่าตัด",U04:"ศูนย์ส่องกล้องโรคระบบทางเดินอาหาร",U05:"ห้องคลอด",U06:"ห้องส่องกล้องระบบทางเดินหายใจ"};
let live=null;let publicComments=null;
function fmt(x){return x==null?"ไม่มีข้อมูล":Number(x).toFixed(2)+"%"}
function setStatus(message,isLive=false){const el=document.querySelector(".live");if(el){el.textContent=(isLive?"● ":"○ ")+message;el.title=isLive?"ข้อมูลจากระบบ Live":"กำลังใช้ข้อมูลสำรองล่าสุด"}}
function currentData(){return live?.summary||fallback}
function renderComments(unit){const dev=document.querySelector("#development-comments"),praise=document.querySelector("#praise-comments");if(!dev||!praise)return;const units=unit==="ALL"?Object.keys(names):[unit];const collect=k=>units.flatMap(u=>publicComments?.units?.[u]?.[k]||[]);const show=(el,arr)=>{el.innerHTML=arr.length?arr.slice(0,12).map(t=>"<div class=\"comment-item\">“"+t+"”</div>").join(""):"<div class=\"empty\">ไม่มีข้อมูลที่ผ่านการอนุมัติสำหรับเผยแพร่</div>"};show(dev,collect("development"));show(praise,collect("praise"))}
function render(){
 const unit=document.querySelector("#unit").value,fy=document.querySelector("#fy").value;
 const dataset=currentData();
 let d=dataset[unit];
 if(live&&fy!=="ALL"){d=live.byFY?.[unit]?.[fy]||null}
 document.querySelector("#sat").textContent=d?fmt(d.sat):"ไม่มีข้อมูล";
 document.querySelector("#diss").textContent=d?fmt(d.diss):"ไม่มีข้อมูล";
 document.querySelector("#respondents").textContent=d&&d.respondents!=null?Number(d.respondents).toLocaleString("th-TH"):"—";
 document.querySelector("#scores").textContent=d&&d.scores!=null?Number(d.scores).toLocaleString("th-TH"):"—";
 const s=document.querySelector("#status");s.textContent=d?(Number(d.sat)>80?"ผ่านเกณฑ์ >80%":"ไม่ผ่านเกณฑ์"):"ไม่มีข้อมูล";s.className=d&&Number(d.sat)>80?"pass":"fail";
 renderComments(unit);
 document.querySelector("#bars").innerHTML=Object.keys(names).map(k=>{let x=dataset[k];if(live&&fy!=="ALL")x=live.byFY?.[k]?.[fy]||null;return '<div class="barrow"><b>'+names[k]+'</b><div class="track"><div class="fill" style="width:'+(x?Math.min(100,Number(x.sat)):0)+'%"></div></div><strong>'+(x?fmt(x.sat):"—")+'</strong></div>'}).join("");
}
async function loadLive(){
 setStatus("กำลังตรวจสอบข้อมูลล่าสุด…");
 try{
  const r=await fetch("./data/dashboard.json",{headers:{"Accept":"application/json"},cache:"no-store"});
  if(!r.ok)throw new Error("API "+r.status);
  const j=await r.json();
  if(!j||!j.summary)throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
  live=j;setStatus("ข้อมูล Dashboard ล่าสุด",true);render();
 }catch(e){console.warn("Live data unavailable; using verified fallback.",e);setStatus("ข้อมูลสำรองล่าสุด • รอเปิด Live Data");render()}
}
document.querySelector("#apply").onclick=render;
document.querySelector("#clear").onclick=()=>{document.querySelector("#unit").value="ALL";document.querySelector("#fy").value="ALL";document.querySelector("#from").value="";document.querySelector("#to").value="";render()};
async function loadComments(){try{const r=await fetch("./data/comments.json",{cache:"no-store"});if(!r.ok)throw new Error("comments "+r.status);publicComments=await r.json();render()}catch(e){console.warn("Public comments unavailable",e)}}
render();loadLive();loadComments();