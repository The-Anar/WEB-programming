const money = n => '₩' + Math.round(n).toLocaleString('en-US');
const form = document.getElementById('transactionForm');
let totals = { balance:1250000, income:1800000, expenses:550000 };
let entries = [
 {name:'Lunch',category:'Food',date:'Nov 02',amount:8500,type:'expense'},
 {name:'Subway',category:'Transport',date:'Nov 02',amount:1450,type:'expense'},
 {name:'Part-time work',category:'Income',date:'Nov 01',amount:420000,type:'income'}
];
const updateDemo = () => {
 document.getElementById('demoBalance').textContent=money(totals.balance);
 document.getElementById('heroBalance').textContent=money(totals.balance);
 document.getElementById('demoIncome').textContent=money(totals.income);
 document.getElementById('demoExpenses').textContent=money(totals.expenses);
 document.getElementById('activityCount').textContent=entries.length+' entr'+(entries.length===1?'y':'ies');
 document.getElementById('activityList').innerHTML=entries.slice(0,5).map(e=>`<li><span class="activity-dot ${e.type==='income'?'green':e.category==='Transport'?'blue':'red'}"></span><span><b>${escapeHtml(e.name)}</b><small>${escapeHtml(e.category)} · ${escapeHtml(e.date)}</small></span><strong class="${e.type==='income'?'positive':'negative'}">${e.type==='income'?'+':'−'}${money(e.amount)}</strong></li>`).join('');
};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
form.addEventListener('submit',e=>{
 e.preventDefault(); const amount=Number(document.getElementById('amount').value); const type=document.getElementById('type').value; const category=document.getElementById('category').value; const name=document.getElementById('description').value.trim(); const rawDate=document.getElementById('date').value;
 if(!Number.isFinite(amount)||amount<1||amount>100000000||!name||!rawDate){document.getElementById('formMessage').textContent='Please enter a valid amount, description, and date.';return;}
 if(type==='expense'){totals.expenses+=amount;totals.balance-=amount;}else{totals.income+=amount;totals.balance+=amount;}
 const date=new Date(rawDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'2-digit'});
 entries.unshift({name,category,date,amount,type}); updateDemo(); form.reset(); document.getElementById('date').value='2026-11-02'; document.getElementById('formMessage').textContent='Added to this temporary preview. Refreshing resets the sample data.';
});
// Mobile navigation
const nav=document.getElementById('mainNav');document.getElementById('menuToggle').addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
// Presentation mode: same project content, re-authored as a compact slide sequence.
const slides=[
 {k:'WEB PROGRAMMING · GROUP PROJECT',t:'Money, made clear.',p:'FINORA — a personal finance management system for people starting to budget.',v:'stats'},
 {k:'01 / THE IDEA',t:'One place to make sense of money.',p:'Bring daily records and monthly plans together. Useful information first. Clear steps. No finance expertise required.',v:'pills',items:['Record income & expenses','Plan monthly category limits','Understand spending patterns']},
 {k:'02 / PEOPLE & USE',t:'Built for people starting a budget.',p:'University students, young professionals, and first-time budgeters. A short journey makes everyday money management less intimidating.',v:'pills',items:['Sign in','Add records','Review dashboard','Set budget','Check progress']},
 {k:'03 / PRODUCT MAP',t:'Six workspaces. One clear picture.',p:'Each workspace supports a practical everyday money task.',v:'list',items:['Dashboard — balance, budgets, goals','Transactions — add, edit, search, filter','Budgets — category limits','Analytics — cash-flow trends','Savings goals — targets and progress','Profile & settings — personal preferences']},
 {k:'04 / INTERFACE STUDY',t:'A dashboard for everyday decisions.',p:'Balance, monthly income and expenses, spending categories, and recent activity share one focused view.',v:'bars'},
 {k:'05 / IMPLEMENTATION',t:'A realistic full-stack direction.',p:'Each layer has a clear responsibility, from the page to persistent records.',v:'flow',items:['HTML · CSS · JavaScript','Node.js · Express.js','SQLite · SQL','Chart.js · Lucide']},
 {k:'06 / UNDER THE HOOD',t:'The browser talks to an API.',p:'Express validates requests and reads or writes records in SQLite. Example entities: USERS, TRANSACTIONS, and BUDGETS.',v:'flow',items:['USER / Pages & forms','FRONTEND / HTML · CSS · JS','BACKEND / Express routes','DATABASE / SQLite records']},
 {k:'07 / TRUST & QUALITY',t:'Security belongs in the first version.',p:'Hash passwords, protect authenticated routes, validate server-side input, use parameterized SQL, and test CRUD flows and error states.',v:'pills',items:['Account security','Data protection','Testing & accessibility','Fictional demo data only']},
 {k:'08 / BUILD PLAN',t:'Five milestones make the work demonstrable.',p:'Plan → Build UI → Add behavior → Build backend → Test & present. Each stage adds something that can be shown and reviewed.',v:'list',items:['01 Plan — requirements & wireframes','02 Build UI — responsive pages','03 Add behavior — forms & charts','04 Backend — API, database & auth','05 Test & present — verify the user journey']},
 {k:'09 / IN-CLASS DEMO',t:'Show the core loop.',p:'Log in, add a transaction, review the updated dashboard, set a budget, and explore reports — using fictional sample data.',v:'pills',items:['Log in','Add a transaction','Review dashboard','Set a budget','Explore reports']},
 {k:'10 / THE TEAM',t:'A clearer view of every won.',p:'ANKHORGIL · 202637470  |  ANAR · 202637018\nWeb Programming · Gachon University. Questions?',v:'pills',items:['FINORA','BUILD · EXPLAIN · VERIFY']}
];
let slideIndex=0;const pres=document.getElementById('presentation');const title=document.getElementById('presTitle'),text=document.getElementById('presText'),visual=document.getElementById('presVisual'),dots=document.getElementById('presDots');
function renderSlide(){const s=slides[slideIndex];document.getElementById('presKicker').textContent=s.k;title.textContent=s.t;text.textContent=s.p;document.getElementById('slideCount').textContent=String(slideIndex+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');document.getElementById('presProgress').style.width=((slideIndex+1)/slides.length*100)+'%';document.getElementById('prevSlide').disabled=slideIndex===0;document.getElementById('nextSlide').disabled=slideIndex===slides.length-1;dots.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===slideIndex));
 if(s.v==='stats')visual.innerHTML='<div class="pres-stat"><small>AVAILABLE BALANCE</small><b>₩1,250,000</b><em>DEMO FIGURES</em></div><div class="pres-stat"><small>MONTHLY INCOME</small><b>₩1,800,000</b></div><div class="pres-stat"><small>SPENT</small><b>₩550,000</b></div>';
 else if(s.v==='pills')visual.innerHTML=s.items.map(x=>`<span class="pres-pill">${escapeHtml(x)}</span>`).join('');
 else if(s.v==='list')visual.innerHTML='<div class="pres-list">'+s.items.map(x=>`<span>${escapeHtml(x)}</span>`).join('')+'</div>';
 else if(s.v==='flow')visual.innerHTML='<div class="pres-flow">'+s.items.map((x,i)=>`${i?'<i>→</i>':''}<span>${escapeHtml(x)}</span>`).join('')+'</div>';
 else visual.innerHTML='<div class="pres-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="pres-note">Balance · cash flow · category spending · recent activity</span>';
}
slides.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Go to slide '+(i+1));b.addEventListener('click',()=>{slideIndex=i;renderSlide()});dots.appendChild(b)});
function openPresentation(){pres.classList.add('active');pres.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';slideIndex=0;renderSlide();}
function closePresentation(){pres.classList.remove('active');pres.setAttribute('aria-hidden','true');document.body.style.overflow='';if(document.fullscreenElement)document.exitFullscreen?.();}
['presentBtn','heroPresent','closingPresent'].forEach(id=>document.getElementById(id).addEventListener('click',openPresentation));document.getElementById('exitPresent').addEventListener('click',closePresentation);document.getElementById('prevSlide').addEventListener('click',()=>{if(slideIndex>0){slideIndex--;renderSlide()}});document.getElementById('nextSlide').addEventListener('click',()=>{if(slideIndex<slides.length-1){slideIndex++;renderSlide()}});document.getElementById('fullScreen').addEventListener('click',()=>{if(!document.fullscreenElement)pres.requestFullscreen?.();else document.exitFullscreen?.()});document.addEventListener('keydown',e=>{if(!pres.classList.contains('active'))return;if(e.key==='Escape')closePresentation();if(e.key==='ArrowRight'&&slideIndex<slides.length-1){slideIndex++;renderSlide()}if(e.key==='ArrowLeft'&&slideIndex>0){slideIndex--;renderSlide()}});
updateDemo();
