
const SP_ADMIN_EMAIL_PROP = "ADMIN_EMAIL";
const SP_ALLOWED_ORIGINS = "ALLOWED_ORIGINS";
const MAX_IP_PER_HOUR = 10;
const MAX_EMAIL_PER_HOUR = 6;

function doPost(e){
  try{
    if(!e || !e.postData) return _json({status:'error',message:'No data'},400);
    const postData = e.postData.contents;
    const params = new URLSearchParams(postData);
    const data = {};
    for (let [key, value] of params) {
      data[key] = value;
    }
    const props = PropertiesService.getScriptProperties();
    const ADMIN_EMAIL = props.getProperty(SP_ADMIN_EMAIL_PROP) || "";
    const allowedOriginsRaw = props.getProperty(SP_ALLOWED_ORIGINS) || "";
    const allowedOrigins = allowedOriginsRaw.split(',').map(s=>s.trim()).filter(Boolean);
    const name=(data.name||'').trim(), email=(data.email||'').trim(), subject=(data.subject||'').trim(), message=(data.message||'').trim();
    const origin=(data.origin||'').trim(), ua=(data.ua||'').trim(), ip=(data.ip||'').trim();
    if(data.secretField && data.secretField.length>0) return _json({status:'blocked'},200);
    if(!name||!email||!message) return _json({status:'error',message:'Missing fields'},400);
    if(allowedOrigins.length && allowedOrigins.indexOf(origin)===-1) return _json({status:'blocked',message:'Invalid origin'},403);
    const cache=CacheService.getScriptCache();
    const ipKey='ip:'+ (ip||origin);
    const emailKey='email:'+email.toLowerCase();
    if(!_rateLimit(cache, ipKey, MAX_IP_PER_HOUR)) return _json({status:'error',message:'Too many requests (IP)'},429);
    if(!_rateLimit(cache, emailKey, MAX_EMAIL_PER_HOUR)) return _json({status:'error',message:'Too many requests (email)'},429);
    const ss=SpreadsheetApp.getActiveSpreadsheet();
    const sheet=ss.getSheetByName('FormData')||ss.getSheets()[0];
    sheet.appendRow([new Date(),name,email,subject,message,ip,ua,origin]);
    if(ADMIN_EMAIL){
      const throttleKey='adminNotice';
      if(!cache.get(throttleKey)){
        try{ MailApp.sendEmail(ADMIN_EMAIL, '📩 New Contact — '+name, 'Message:\n'+message+'\nFrom: '+email); }catch(e){ Logger.log('Admin email error:'+e) }
        cache.put(throttleKey,'1',15);
      }
    }
    if(email && email.indexOf('@')>-1){
      try{ MailApp.sendEmail({to:email, subject:'✅ Message received — 4Thoughts', htmlBody:'<p>Thanks '+name+', we got your message.</p><p>— Farai</p>'}); }catch(e){Logger.log('Reply error:'+e)}
    }
    return _json({status:'success'},200);
  }catch(err){ Logger.log(err); return _json({status:'error',message:'Server error'},500); }
}

function _json(obj, code){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function _rateLimit(cache,key,max){ const v=cache.get(key); if(!v){ cache.put(key,'1',3600); return true } const c=parseInt(v,10); if(c>=max) return false; cache.put(key,String(c+1),3600); return true }
