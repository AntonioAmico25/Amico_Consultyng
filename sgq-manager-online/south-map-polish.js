(() => {
'use strict';
const MAP_URL='https://upload.wikimedia.org/wikipedia/commons/6/65/Brazil_Region_States_Sul.svg';
const COMMONS_URL='https://commons.wikimedia.org/wiki/File:Brazil_Region_States_Sul.svg';
function installStyle(){
 if(document.getElementById('sgqSouthPolishStyle')) return;
 const s=document.createElement('style');s.id='sgqSouthPolishStyle';s.textContent=`
 .sgq-south-real-stage{height:100%;display:flex;align-items:center;justify-content:center;padding:18px;background:#eef3f7}
 .sgq-south-real-stage img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;filter:saturate(.9) contrast(1.03);filter:drop-shadow(0 14px 22px rgba(15,31,48,.18))}
 .sgq-south-credit{position:absolute;left:14px;top:14px;z-index:3;background:rgba(8,17,29,.92);border:1px solid var(--line);border-radius:10px;padding:7px 9px;font-size:9px;color:#a9bdd1}
 .sgq-south-credit a{color:#8ec5ff}
 `;document.head.appendChild(s);
}
function apply(){
 installStyle();
 const host=document.getElementById('southMapVisual')||document.getElementById('sgqsMapVisual');
 if(!host||host.dataset.realMap==='1') return false;
 host.dataset.realMap='1';
 const previous=host.innerHTML;
 host.innerHTML=`<div class="sgq-south-real-stage"><img src="${MAP_URL}" alt="Mapa geográfico da Região Sul do Brasil — Paraná, Santa Catarina e Rio Grande do Sul"></div><div class="sgq-south-credit">Mapa-base: <a href="${COMMONS_URL}" target="_blank" rel="noopener">Wikimedia Commons</a> · CC BY 2.5</div>`;
 const img=host.querySelector('img');
 if(img) img.onerror=()=>{host.dataset.realMap='0';host.innerHTML=previous;};
 return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>30)clearInterval(timer);},250);
window.SGQSouthMapPolish={apply};
})();