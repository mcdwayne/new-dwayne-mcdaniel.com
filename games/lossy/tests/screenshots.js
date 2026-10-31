/* Renders key screens to docs/screenshots/ with Playwright Chromium. Run: npm run screenshots (needs: npx playwright install chromium) */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');const out=path.join(__dirname,'..','docs','screenshots')+path.sep;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:820}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const shot=async n=>{await pg.waitForTimeout(250);await pg.screenshot({path:out+n+'.png'});};
 const dismiss=async()=>{for(let i=0;i<6;i++){const m=await pg.$('#msglayer .msg .hint');if(!m)break;await pg.click('#msglayer .msg');await pg.waitForTimeout(60);}};
 await pg.goto('file://'+path.join(__dirname,'..','index.html'));await pg.waitForTimeout(700);await shot('01-title');
 await pg.click('[data-tt="ult"]');await pg.click('[data-namego]');await shot('02-ult-intro');await dismiss();
 await pg.fill('#cmd','use drawer');await pg.press('#cmd','Enter');await pg.waitForTimeout(100);await dismiss();await shot('03-binder');
 await pg.click('[data-padclose]');await pg.fill('#cmd','use monitor');await pg.press('#cmd','Enter');await pg.click('[data-gg="honeytokens"]');await shot('04-honeytokens');
 await pg.click('[data-pcclose]');await pg.evaluate(()=>{GAME.S.room="dev";});await pg.fill('#cmd','talk ravi');await pg.press('#cmd','Enter');await shot('05-ravi');
 await pg.click('.dlg .opts button');await pg.waitForTimeout(100);await pg.click('text=Never mind');
 await pg.evaluate(()=>{GAME.S.room="desk";});await pg.fill('#cmd','use monitor');await pg.press('#cmd','Enter');await pg.click('[data-gg="endpoints"]');await pg.click('[data-ep="ravi-mbp"]');await shot('06-endpoint');
 await pg.click('[data-pc="vault"]');await pg.click('[data-vtab="tokens"]');await shot('07-vault-tokens');
 await pg.click('[data-pc="vault"]');await pg.click('[data-pcclose]');
 // day 1 world for nas01 + hall sign
 await pg.evaluate(()=>{GAME.startNew();});await dismiss();await pg.evaluate(()=>{GAME.S.room="hall";GAME.S.inv.push("badge");});await shot('08-hall');
 await pg.evaluate(()=>{GAME.S.room="closet";GAME.openTerm("nas01");});for(const c of ['curl -sSfL https://raw.githubusercontent.com/GitGuardian/ggshield/main/scripts/install/install.sh | bash -s -- --plugin machine_scan','ggshield machine report','history']){await pg.fill('#tinp',c);await pg.press('#tinp','Enter');await pg.waitForTimeout(80);}
 await shot('09-nas01-ep');await pg.fill('#tinp','nano ~/.bash_history');await pg.press('#tinp','Enter');await shot('10-nano-hist');await pg.keyboard.press('Control+x');
 await pg.evaluate(()=>{document.querySelector('[data-tclose]')&&0});await pg.click('[data-tclose]').catch(()=>{});await dismiss();
 // day 3 gcp and vm
 await pg.evaluate(()=>{GAME.S.results[1]="won";GAME.nextDay();});await dismiss();await pg.evaluate(()=>{GAME.S.results[2]="won";GAME.nextDay();GAME.S.f.breakglass=true;});await dismiss();
 await pg.evaluate(()=>GAME.openPC("gcp"));await shot('11-gcp');await pg.click('[data-gcp="vms"]');await pg.click('[data-gssh]');await pg.fill('#tinp','cat /etc/tvx/export.env');await pg.press('#tinp','Enter');await shot('12-tvx');
 await pg.click('[data-tclose]');await pg.click('[data-pcclose]');await dismiss();await pg.evaluate(()=>{GAME.S.room="dev"});await shot('13-dev-day3');
 await pg.click('[data-tasks].ic');await shot('14-checklist-d3');
 await pg.setViewportSize({width:390,height:780});await pg.click('[data-padclose]');await shot('15-mobile');
 console.log('errors',errs);await b.close();})();
