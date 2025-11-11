
/* main.js: radar, drone, mock YOLO, submitForm (uses global GOOGLE_SCRIPT_URL variable set in index.html) */

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
  const input = document.getElementById('ai-input').value.trim();
  const output = document.getElementById('ai-output');
  if(!input) {
    output.textContent = 'Please enter data';
    return;
  }
  output.textContent = 'Processing...';
  setTimeout(() => {
    const predictions = ['Leaf Blight (85%)', 'Healthy Crop (92%)', 'Pest Detected (78%)'];
    output.textContent = 'Prediction: ' + predictions[Math.floor(Math.random() * predictions.length)];
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
