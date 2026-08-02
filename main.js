
/* main.js: radar, drone, mock YOLO, submitForm (uses global GOOGLE_SCRIPT_URL variable set in index.html) */

/* Status Bar & Uptime */

const startTime = Date.now();
function updateStatus() {
  const now = new Date();
  document.getElementById('sys-time').innerText = now.toTimeString().split(' ')[0];
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  document.getElementById('uptime').innerText = `${h}:${m}:${s}`;
  document.getElementById('latency').innerText = Math.floor(Math.random() * 20 + 5) + 'ms';
}
setInterval(updateStatus, 1000);

/* Engineer View Toggle Logic */
document.getElementById('mode-toggle').addEventListener('change', (e) => {
  const isEngineer = e.target.checked;
  document.body.classList.toggle('engineer-mode', isEngineer);
  const jobs = document.querySelectorAll('.job, .project');
  jobs.forEach(job => {
    if (isEngineer) {
      if (!job.dataset.originalHtml) job.dataset.originalHtml = job.innerHTML;
      const title = job.querySelector('h3').innerText;
      const meta = job.querySelector('.muted')?.innerText || '';
      const tags = Array.from(job.querySelectorAll('.tag')).map(t => t.innerText);
      const json = {
        object: "ProfessionalExperience",
        title: title,
        context: meta,
        stack: tags,
        status: "verified_by_human"
      };
      job.innerHTML = `<pre style="margin:0; font-size:11px; color:var(--accent2)">${JSON.stringify(json, null, 2)}</pre>`;
    } else {
      if (job.dataset.originalHtml) job.innerHTML = job.dataset.originalHtml;
    }
  });
});

/* Interactive Signal Background */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let points = [];
function initBg() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  points = [];
  for (let i = 0; i < 40; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
}
function drawBg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(124,92,255,0.08)';
  ctx.fillStyle = 'rgba(124,92,255,0.2)';
  points.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    for (let j = i + 1; j < points.length; j++) {
      const p2 = points[j];
      const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 150) {
        ctx.lineWidth = 1 - dist / 150;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }
  });
  requestAnimationFrame(drawBg);
}
window.addEventListener('resize', initBg);
initBg(); drawBg();

function radarToggle(){

  const d1=document.getElementById('dot1'), d2=document.getElementById('dot2'), sweep=document.getElementById('sweep');
  if(!radarToggle.running){
    d1.style.display='block'; d2.style.display='block';
    radarToggle.running=true; let a=0;
    radarToggle.int = setInterval(()=>{ a=(a+3)%360; sweep.style.transform='rotate('+a+'deg)'; [d1,d2].forEach((el)=>{ const left=parseFloat(el.style.left), top=parseFloat(el.style.top); const ang=(left+top)%360; const diff=Math.abs(((ang - a + 540)%360)-180); el.style.opacity=(diff<30)?1:0.18; }); },50);
  } else {
    clearInterval(radarToggle.int); radarToggle.running=false; d1.style.display='none'; d2.style.display='none';
  }
}

function startDrone(){
  const dot=document.getElementById('drone-dot'), path=document.getElementById('drone-path'); const length=path.getTotalLength(); let start=null;
  function animate(ts){ if(!start) start=ts; const t=((ts-start)/4000)%1; const p=path.getPointAtLength(length*t); dot.setAttribute('cx',p.x); dot.setAttribute('cy',p.y); requestAnimationFrame(animate); }
  requestAnimationFrame(animate);
}
function resetDrone(){ const dot=document.getElementById('drone-dot'); dot.setAttribute('cx',2); dot.setAttribute('cy',30); }

function mockYOLO(){
  const overlay=document.getElementById('overlay'); overlay.innerHTML='';
  const boxes=[{left:10,top:8,w:22,h:32,label:'Leaf blight (0.92)'},{left:52,top:18,w:30,h:25,label:'Healthy (0.98)'}];
  boxes.forEach(b=>{ const el=document.createElement('div'); el.style.position='absolute'; el.style.left=b.left+'%'; el.style.top=b.top+'%'; el.style.width=b.w+'%'; el.style.height=b.h+'%'; el.style.border='2px dashed rgba(124,92,255,0.9)'; el.style.boxSizing='border-box'; el.style.borderRadius='6px'; const lbl=document.createElement('div'); lbl.innerText=b.label; lbl.style.position='absolute'; lbl.style.left='0'; lbl.style.top='-18px'; lbl.style.background='rgba(2,6,12,0.7)'; lbl.style.padding='4px 6px'; lbl.style.fontSize='12px'; lbl.style.borderRadius='6px'; el.appendChild(lbl); overlay.appendChild(el); });
}

function sendChat(){
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const text = input.value.trim();
  if(!text) return;
  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = text;
  messages.appendChild(userMsg);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.textContent = 'Thanks for your question! I can help with AI, IoT, and automation. How else can I assist?';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

function updateSensors(){
  document.getElementById('temp').textContent = (20 + Math.random() * 10).toFixed(1) + '°C';
  document.getElementById('humidity').textContent = (50 + Math.random() * 30).toFixed(0) + '%';
  document.getElementById('motion').textContent = Math.random() > 0.5 ? 'Yes' : 'No';
}

function runPrediction(){
  const input = document.getElementById('ai-input').value.trim().toLowerCase();
  const output = document.getElementById('ai-output');
  if(!input) {
    output.textContent = 'Please enter data';
    return;
  }
  output.textContent = 'Processing...';
  setTimeout(() => {
    let prediction = '';
    const confidence = 80 + Math.floor(Math.random() * 15); // 80-95%
    if (input.includes('blight') || input.includes('yellow') || input.includes('spots') || input.includes('lesion')) {
      prediction = 'Leaf Blight (' + confidence + '%)';
    } else if (input.includes('healthy') || input.includes('green') || input.includes('normal')) {
      prediction = 'Healthy Crop (' + confidence + '%)';
    } else if (input.includes('pest') || input.includes('bug') || input.includes('insect') || input.includes('damage')) {
      prediction = 'Pest Detected (' + confidence + '%)';
    } else {
      // Random for unknown inputs
      const predictions = ['Leaf Blight (' + confidence + '%)', 'Healthy Crop (' + confidence + '%)', 'Pest Detected (' + confidence + '%)'];
      prediction = predictions[Math.floor(Math.random() * predictions.length)];
    }
    output.textContent = 'Prediction: ' + prediction;
  }, 1000);
}

function runN8nSim(){
  const status = document.getElementById('n8n-status');
  status.innerText = 'Simulating: Webhook Trigger → Processing...';
  setTimeout(() => {
    status.innerText = 'Simulating: Google Sheets → Logging data...';
    setTimeout(() => {
      status.innerText = 'Simulating: Email → Sending notification...';
      setTimeout(() => {
        status.innerText = 'Simulating: WhatsApp → Alert sent!';
        setTimeout(() => {
          status.innerText = 'Workflow complete! Click to simulate again.';
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

function runSocialSim(){
  const status = document.getElementById('social-status');
  status.innerText = 'Simulating: Schedule → Fetching posts...';
  setTimeout(() => {
    status.innerText = 'Simulating: Google Sheets → Posting to LinkedIn...';
    setTimeout(() => {
      status.innerText = 'Simulating: LinkedIn API → Sending report...';
      setTimeout(() => {
        status.innerText = 'Workflow complete! Post published.';
        setTimeout(() => {
          status.innerText = 'Click to simulate social posting workflow';
        }, 2000);
      }, 1000);
    }, 1000);
  }, 500);
}

function runInventorySim(){
  const status = document.getElementById('inventory-status');
  status.innerText = 'Simulating: API Trigger → Checking stock...';
  setTimeout(() => {
    status.innerText = 'Simulating: Condition → Low stock detected!';
    setTimeout(() => {
      status.innerText = 'Simulating: WhatsApp → Alert sent to manager...';
      setTimeout(() => {
        status.innerText = 'Simulating: Slack → Team notified.';
        setTimeout(() => {
          status.innerText = 'Workflow complete! Inventory alert sent.';
          setTimeout(() => {
            status.innerText = 'Click to simulate inventory alert workflow';
          }, 2000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 500);
}

/* Contact submit (no recaptcha) */
async function submitForm(){
  const status=document.getElementById('form-status'); status.innerText='Sending...';
  const name=document.getElementById('name').value.trim(); const email=document.getElementById('email').value.trim();
  const subject=document.getElementById('subject').value.trim(); const message=document.getElementById('message').value.trim();
  const secretField=document.getElementById('secretField').value || '';
  if(!name||!email||!message){ status.innerText='Please complete required fields.'; return; }
  if(!window.GOOGLE_SCRIPT_URL){ status.innerText='Contact endpoint not configured.'; return; }
  try{
    const payload = {name,email,subject,message,ua:navigator.userAgent,origin:window.location.origin,secretField};
    const formData = new URLSearchParams();
    Object.keys(payload).forEach(key => formData.append(key, payload[key]));
    const res = await fetch(window.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });
    // Since no-cors, response is opaque, assume success if no network error
    status.innerText='Message sent — thank you!';
    document.getElementById('contact-form').reset();
  } catch(err){ console.error(err); status.innerText='Network error.'; }
}

function filterLabDemos(){
  const input=document.getElementById('lab-search-input');
  if(!input) return;
  const query=input.value.trim().toLowerCase();
  const cards=document.querySelectorAll('.lab-grid .lab-card');
  cards.forEach(card=>{
    const text=card.textContent.toLowerCase();
    const match=!query||text.indexOf(query)!==-1;
    card.style.display=match?'':'none';
  });
}

function updateNNVisualizer(){
  const slider=document.getElementById('nn-layers');
  const output=document.getElementById('nn-output');
  if(!slider||!output) return;
  const layers=parseInt(slider.value,10)||3;
  const hidden=Math.max(0,layers-2);
  const hiddenText=hidden===1?'1 hidden layer':hidden+' hidden layers';
  output.textContent=layers+'-layer network: input 		 '+(hidden>0?(' 		 '+hiddenText+' 		 '):'')+' 		 output.';
}

function updateARScenario(){
  const select=document.getElementById('ar-scenario');
  const output=document.getElementById('ar-output');
  if(!select||!output) return;
  const v=select.value;
  let text='';
  if(v==='training'){
    text='AR overlays show farmers exactly where to inspect fields and how to treat issues step-by-step.';
  } else if(v==='safety'){
    text='VR scenarios simulate emergencies so staff can practice safe responses without real-world risk.';
  } else if(v==='maintenance'){
    text='Technicians see AR instructions on top of equipment, reducing downtime and human error.';
  } else {
    text='Choose a scenario to see how AR/VR is used.';
  }
  output.textContent=text;
}

function detectVoiceIntent(){
  const input=document.getElementById('va-input');
  const output=document.getElementById('va-output');
  if(!input||!output) return;
  const text=input.value.trim().toLowerCase();
  if(!text){
    output.textContent='Type an example phrase to detect intent.';
    return;
  }
  let intent='general_help';
  if(text.indexOf('balance')!==-1||text.indexOf('account')!==-1){
    intent='check_balance';
  } else if(text.indexOf('loan')!==-1||text.indexOf('credit')!==-1){
    intent='loan_inquiry';
  } else if(text.indexOf('support')!==-1||text.indexOf('help')!==-1){
    intent='support_request';
  }
  output.textContent='Detected intent: '+intent;
}

function generateCloudLayout(){
  const web=document.getElementById('cloud-web');
  const db=document.getElementById('cloud-db');
  const analytics=document.getElementById('cloud-analytics');
  const output=document.getElementById('cloud-output');
  if(!web||!db||!analytics||!output) return;
  const parts=[];
  if(web.checked) parts.push('Public Web/API');
  if(db.checked) parts.push('Private Database');
  if(analytics.checked) parts.push('Analytics/BI');
  if(parts.length===0){
    output.textContent='No components selected. Enable at least one to generate a layout.';
    return;
  }
  output.textContent='Layout: '+parts.join('  		 ')+'. Secured with VLANs, VPNs and firewalls.';
}

function randomizeDashboardKPIs(){
  const list=document.getElementById('ds-kpis');
  if(!list) return;
  const acc=88+Math.floor(Math.random()*10);
  const alerts=10+Math.floor(Math.random()*40);
  const rt=(0.8+Math.random()*1.2).toFixed(1);
  const items=list.querySelectorAll('li');
  if(items[0]) items[0].textContent='Accuracy: '+acc+'%';
  if(items[1]) items[1].textContent='Alerts/day: '+alerts;
  if(items[2]) items[2].textContent='Response time: '+rt+'s';
}

function updateNetworkConfig(){
  const select=document.getElementById('net-profile');
  const output=document.getElementById('net-output');
  if(!select||!output) return;
  let text='';
  if(select.value==='branch'){
    text='[Users] -- LAN/VLAN -- [Mikrotik Router] == VPN == [HQ Firewall] -- [Core Services]';
  } else if(select.value==='hq'){
    text='[Edge Router] -- [Firewall] -- [Core Switch] -- {Servers, WiFi, Monitoring}';
  } else if(select.value==='remote'){
    text='[IoT/Field Devices] -- 4G Router -- Encrypted tunnel -- [Cloud/VPN Gateway]';
  } else {
    text='Select a profile to view a sample network layout.';
  }
  output.textContent=text;
}

function buildSQLQuery(){
  const metric=document.getElementById('sql-metric');
  const period=document.getElementById('sql-period');
  const output=document.getElementById('sql-output');
  if(!metric||!period||!output) return;
  const m=metric.value;
  const p=period.value;
  let column='created_at';
  let table='events';
  let agg='COUNT(*)';
  if(m==='alerts'){ table='alerts'; }
  if(m==='sessions'){ table='chat_sessions'; }
  if(m==='devices'){ table='devices'; }
  let interval='day';
  if(p==='week') interval='week';
  if(p==='month') interval='month';
  const query='SELECT DATE_TRUNC(\''+interval+'\', '+column+
    ") AS period, "+agg+' AS value FROM '+table+' GROUP BY period ORDER BY period;';
  output.textContent=query;
}

function toggleScraperOutput(){
  const out=document.getElementById('scraper-output');
  if(!out) return;
  out.style.display = out.style.display==='none' ? 'block' : 'none';
}

function timeAgo(dateStr){
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs/60000);
  if(mins < 60) return mins+'m ago';
  const hours = Math.floor(mins/60);
  if(hours < 24) return hours+'h ago';
  return Math.floor(hours/24)+'d ago';
}

function describeGitHubEvent(ev){
  const repo = ev.repo && ev.repo.name;
  const link = 'https://github.com/'+repo;
  if(ev.type==='PushEvent'){
    const n = ev.payload && ev.payload.commits ? ev.payload.commits.length : 1;
    return {text: 'Pushed '+n+' commit'+(n===1?'':'s')+' to', repo, link};
  }
  if(ev.type==='CreateEvent'){
    return {text: 'Created '+(ev.payload.ref_type||'repo')+' in', repo, link};
  }
  if(ev.type==='PullRequestEvent'){
    return {text: (ev.payload.action||'updated')+' a pull request in', repo, link};
  }
  if(ev.type==='IssuesEvent'){
    return {text: (ev.payload.action||'updated')+' an issue in', repo, link};
  }
  if(ev.type==='WatchEvent'){
    return {text: 'Starred', repo, link};
  }
  if(ev.type==='ForkEvent'){
    return {text: 'Forked', repo, link};
  }
  return {text: ev.type.replace('Event','')+' on', repo, link};
}

async function loadGitHubFeed(){
  const list=document.getElementById('github-feed-list');
  if(!list) return;
  try{
    const res = await fetch('https://api.github.com/users/faraimushipe/events/public');
    if(!res.ok) throw new Error('GitHub API error');
    const events = await res.json();
    if(!Array.isArray(events) || events.length===0){
      list.innerHTML = '<li class="muted">No recent public activity — <a href="https://github.com/faraimushipe" target="_blank">view profile</a>.</li>';
      return;
    }
    list.innerHTML = events.slice(0,6).map(ev=>{
      const d = describeGitHubEvent(ev);
      return '<li style="font-size:13px"><span class="muted">'+timeAgo(ev.created_at)+'</span> — '+d.text+' <a href="'+d.link+'" target="_blank">'+d.repo+'</a></li>';
    }).join('');
  } catch(err){
    console.error(err);
    list.innerHTML = '<li class="muted">Live feed unavailable right now — <a href="https://github.com/faraimushipe" target="_blank">view GitHub profile directly</a>.</li>';
  }
}
loadGitHubFeed();

function updateCVLite(){
  const slider=document.getElementById('cv-size');
  const output=document.getElementById('cv-output');
  if(!slider||!output) return;
  const v=parseInt(slider.value,10)||2;
  if(v===1){
    output.textContent='Edge model: fastest for low-power devices, slightly lower accuracy.';
  } else if(v===2){
    output.textContent='Balanced model: medium accuracy vs speed for most deployments.';
  } else {
    output.textContent='High-accuracy model: heavier but best performance for servers and GPUs.';
  }
}
