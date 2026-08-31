(() => {
'use strict';
const $=id=>document.getElementById(id),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const MODULES=[
 ['ACTIONS','RQ 045 / Ações','Criar, editar, atualizar, concluir e excluir ações.'],
 ['AUDITS','Auditorias','Planejar, registrar resultados, editar e encerrar auditorias.'],
 ['KPIS','Indicadores','Cadastrar indicadores, metas, valores, análises e histórico.'],
 ['RISKS','Riscos e oportunidades','Cadastrar, avaliar, tratar, monitorar e encerrar riscos.'],
 ['ALERTS','Agenda e alertas','Criar e administrar alertas, agenda e prioridades.'],
 ['NORMS','Normas e Portarias','Cadastrar, atualizar e monitorar requisitos normativos.'],
 ['HISTORY','Histórico de Revisões','Criar nova revisão/retificação preservando rastreabilidade.'],
 ['DOCS','Documentos','Editar cadastro documental completo e controlar revisões.'],
 ['USERS','Usuários e acessos','Administrar usuários, papéis, status e credenciais.']
];
function css(){if($('masterUx2Style'))return;const s=document.createElement('style');s.id='masterUx2Style';s.textContent=`
#masterAdminPanel{padding:0!important;background:transparent!important;border:0!important}.masterbar{margin:0 0 12px!important}.master-home{display:grid;gap:12px}.master-home-head{border:1px solid #285b89;background:linear-gradient(135deg,rgba(22,134,255,.16),rgba(84,179,255,.04));border-radius:16px;padding:18px}.master-home-head h2{margin:0 0 4px;font-size:24px}.master-home-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.master-home-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.master-home-card{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:14px;text-align:left;color:var(--text);cursor:pointer;min-height:118px}.master-home-card:hover{border-color:#54b3ff;transform:translateY(-1px)}.master-home-card b{display:block;font-size:16px;margin-bottom:6px}.master-home-card small{color:var(--muted);line-height:1.35}.master-back{margin-bottom:10px}.master-working{display:none}.master-working.active{display:block}.mastertabs{margin-top:10px}.mastergrid{align-items:start}.masterform textarea{min-height:86px}.masterlist{min-height:180px}.mastertools{margin-top:12px}.master-home .tag{white-space:nowrap}@media(max-width:1000px){.master-home-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.master-home-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function nativeClick(view){const b=qa('.nav').find(n=>n.dataset.view===view);if(b)b.click();}
function openModule(key){if(key==='DOCS'){nativeClick('docs');return}if(key==='USERS'){nativeClick('users');return}const tab=qa('[data-master-tab]').find(x=>x.dataset.masterTab===key);if(tab){showWork();tab.click();}}
function ensureHome(){const p=$('masterAdminPanel');if(!p||$('masterHome'))return;css();const bar=p.querySelector('.masterbar'),grid=p.querySelector('.mastergrid'),tools=p.querySelector('.mastertools'),hint=p.querySelector('.masterhint');if(!bar||!grid)return;
 const work=document.createElement('div');work.id='masterWorking';work.className='master-working';grid.parentNode.insertBefore(work,grid);work.appendChild(bar);work.appendChild(grid);if(tools)work.appendChild(tools);if(hint)work.appendChild(hint);
 const home=document.createElement('div');home.id='masterHome';home.className='master-home';home.innerHTML=`<div class="master-home-head"><div class="toolbar" style="justify-content:space-between;align-items:flex-start"><div><h2>Administração MASTER</h2><div class="muted">Central de edição completa do SGQ Manager. Selecione o módulo que deseja administrar.</div></div><span class="tag ok">MASTER · EDIÇÃO 100%</span></div><div class="master-home-actions"><button class="btn" id="masterGoDash">Voltar ao Dashboard Executivo</button><button class="btn alt" id="masterGoDocs">Documentos</button><button class="btn alt" id="masterGoUsers">Usuários e acessos</button></div></div><div class="master-home-grid">${MODULES.map(([k,l,d])=>`<button class="master-home-card" type="button" data-master-home="${k}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`;
 p.prepend(home);qa('[data-master-home]',home).forEach(b=>b.onclick=()=>openModule(b.dataset.masterHome));$('masterGoDash').onclick=()=>nativeClick('dash');$('masterGoDocs').onclick=()=>nativeClick('docs');$('masterGoUsers').onclick=()=>nativeClick('users');
 const back=document.createElement('div');back.className='master-back';back.innerHTML='<button class="btn alt" id="masterBackHome" type="button">← Visão geral MASTER</button>';work.prepend(back);$('masterBackHome').onclick=showHome;
}
function showHome(){ensureHome();$('masterHome')?.classList.remove('hidden');$('masterWorking')?.classList.remove('active');window.scrollTo({top:0,behavior:'smooth'});}
function showWork(){ensureHome();$('masterHome')?.classList.add('hidden');$('masterWorking')?.classList.add('active');}
function bind(){ensureHome();const nav=$('masterAdminNav');if(nav&&!nav.dataset.ux2){nav.dataset.ux2='1';nav.addEventListener('click',()=>setTimeout(showHome,50));}qa('[data-master-tab]').forEach(t=>{if(t.dataset.ux2)return;t.dataset.ux2='1';t.addEventListener('click',showWork);});}
window.addEventListener('load',()=>{setTimeout(()=>{bind();},1500);setInterval(bind,1200);});
})();