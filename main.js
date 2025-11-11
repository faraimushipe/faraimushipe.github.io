
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
function clearYOLO(){ document.getElementById('overlay').innerHTML=''; }

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
