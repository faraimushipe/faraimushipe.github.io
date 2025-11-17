
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
  const input = document.getElementById('ai-input').value.trim().toLowerCase();
  const output = document.getElementById('ai-output');
  const confidenceBar = document.getElementById('confidence-bar');
  if(!input) {
    output.textContent = 'Please enter data';
    confidenceBar.style.width = '0%';
    return;
  }
  output.innerHTML = '<span class="processing">Processing...</span>';
  confidenceBar.style.width = '0%';
  
  setTimeout(() => {
    let prediction = '';
    let confidence = 80 + Math.floor(Math.random() * 15);
    let category = '';
    
    if (input.includes('blight') || input.includes('yellow') || input.includes('spots') || input.includes('lesion')) {
      prediction = 'Leaf Blight';
      category = 'disease';
    } else if (input.includes('healthy') || input.includes('green') || input.includes('normal')) {
      prediction = 'Healthy Crop';
      category = 'healthy';
    } else if (input.includes('pest') || input.includes('bug') || input.includes('insect') || input.includes('damage')) {
      prediction = 'Pest Detected';
      category = 'pest';
    } else {
      const predictions = ['Leaf Blight', 'Healthy Crop', 'Pest Detected'];
      const categories = ['disease', 'healthy', 'pest'];
      const index = Math.floor(Math.random() * predictions.length);
      prediction = predictions[index];
      category = categories[index];
    }
    
    output.innerHTML = `<span class="prediction-${category}">${prediction}</span> <span class="confidence">${confidence}%</span>`;
    
    // Animate confidence bar
    let width = 0;
    const animateBar = setInterval(() => {
      if (width >= confidence) {
        clearInterval(animateBar);
      } else {
        width += 2;
        confidenceBar.style.width = width + '%';
        confidenceBar.style.background = category === 'healthy' ? '#10b981' : 
                                     category === 'disease' ? '#ef4444' : '#f59e0b';
      }
    }, 20);
  }, 1000);
}

function clearPrediction(){
  document.getElementById('ai-input').value = '';
  document.getElementById('ai-output').innerHTML = 'Prediction will appear here';
  document.getElementById('confidence-bar').style.width = '0%';
}

function runSecurityScan(){
  const target = document.getElementById('scan-target').value.trim();
  const results = document.getElementById('scan-results');
  const progress = document.getElementById('scan-progress');
  
  if(!target){
    results.innerHTML = '<span class="error">Please enter a target IP or domain</span>';
    return;
  }
  
  results.innerHTML = '';
  progress.style.width = '0%';
  
  const ports = [22, 80, 443, 3389, 8080, 21, 25, 53, 110, 143];
  const services = {
    22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 3389: 'RDP',
    8080: 'HTTP-Alt', 21: 'FTP', 25: 'SMTP', 53: 'DNS',
    110: 'POP3', 143: 'IMAP'
  };
  
  let currentPort = 0;
  const scanInterval = setInterval(() => {
    if(currentPort >= ports.length){
      clearInterval(scanInterval);
      progress.style.width = '100%';
      results.innerHTML += '<div class="scan-complete">✅ Scan Complete</div>';
      return;
    }
    
    const port = ports[currentPort];
    const isOpen = Math.random() > 0.7;
    const threat = isOpen && (port === 22 || port === 3389) ? 'high' : 
                   isOpen && (port === 80 || port === 443) ? 'medium' : 'low';
    
    results.innerHTML += `
      <div class="scan-result ${threat}">
        <span class="port">Port ${port}</span>
        <span class="service">${services[port]}</span>
        <span class="status ${isOpen ? 'open' : 'closed'}">${isOpen ? 'OPEN' : 'CLOSED'}</span>
        ${isOpen ? `<span class="threat ${threat}">⚠️ ${threat.toUpperCase()}</span>` : ''}
      </div>
    `;
    
    progress.style.width = ((currentPort + 1) / ports.length * 100) + '%';
    currentPort++;
  }, 300);
}

function clearScanResults(){
  document.getElementById('scan-target').value = '';
  document.getElementById('scan-results').innerHTML = 'Enter target to start scanning...';
  document.getElementById('scan-progress').style.width = '0%';
}

// Theme Toggle, Language, and Search functionality
let currentTheme = 'dark';
const translations = {
  en: {
    hero: {
      title: "Farai Mushipe | Founder, 4Thoughts",
      subtitle: "AI & IoT Systems Engineer — Automating workflows, building intelligent chatbots, and deploying embedded systems to boost efficiency and drive results for clients."
    },
    search: "Search..."
  },
  es: {
    hero: {
      title: "Farai Mushipe | Fundador, 4Thoughts", 
      subtitle: "Ingeniero de Sistemas IA & IoT — Automatizando flujos de trabajo, construyendo chatbots inteligentes y desplegando sistemas embebidos para impulsar la eficiencia y generar resultados para los clientes."
    },
    search: "Buscar..."
  },
  fr: {
    hero: {
      title: "Farai Mushipe | Fondateur, 4Thoughts",
      subtitle: "Ingénieur Systèmes IA & IoT — Automatisation des flux de travail, création de chatbots intelligents et déploiement de systèmes embarqués pour améliorer l'efficacité et générer des résultats pour les clients."
    },
    search: "Rechercher..."
  },
  de: {
    hero: {
      title: "Farai Mushipe | Gründer, 4Thoughts",
      subtitle: "KI & IoT Systemingenieur — Automatisierung von Workflows, Erstellung intelligenter Chatbots und Bereitstellung eingebetteter Systeme zur Steigerung der Effizienz und Erzielung von Ergebnissen für Kunden."
    },
    search: "Suchen..."
  }
};

function toggleTheme(){
  const body = document.body;
  const themeBtn = document.getElementById('theme-btn');
  
  if(currentTheme === 'dark'){
    body.classList.add('light-theme');
    themeBtn.innerHTML = '☀️ Light';
    currentTheme = 'light';
  } else {
    body.classList.remove('light-theme');
    themeBtn.innerHTML = '🌙 Dark';
    currentTheme = 'dark';
  }
}

function changeLanguage(lang){
  const trans = translations[lang];
  if(trans){
    // Update hero text
    const heroTitle = document.querySelector('.hero-text h1');
    const heroSubtitle = document.querySelector('.hero-text p');
    if(heroTitle) heroTitle.innerHTML = heroTitle.innerHTML.replace(/Farai Mushipe \| Founder,.*4Thoughts/, trans.hero.title);
    if(heroSubtitle) heroSubtitle.textContent = trans.hero.subtitle;
    
    // Update search placeholder
    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.placeholder = '🔍 ' + trans.search;
  }
}

function performSearch(event){
  const query = event.target.value.toLowerCase();
  const resultsDiv = document.getElementById('search-results');
  
  if(query.length < 2){
    resultsDiv.style.display = 'none';
    return;
  }
  
  // Search through sections
  const sections = document.querySelectorAll('section, .lab-card');
  const matches = [];
  
  sections.forEach(section => {
    const text = section.textContent.toLowerCase();
    const title = section.querySelector('h2, h3')?.textContent || 'Unknown';
    
    if(text.includes(query) && !text.includes('search')){
      matches.push({
        title: title,
        element: section
      });
    }
  });
  
  // Display results
  if(matches.length > 0){
    resultsDiv.innerHTML = matches.slice(0, 5).map(match => 
      `<div class="search-result" onclick="scrollToElement('${match.element.id || match.element.className}')">${match.title}</div>`
    ).join('');
    resultsDiv.style.display = 'block';
  } else {
    resultsDiv.innerHTML = '<div class="search-result">No results found</div>';
    resultsDiv.style.display = 'block';
  }
  
  // Hide results on Escape
  if(event.key === 'Escape'){
    resultsDiv.style.display = 'none';
    event.target.value = '';
  }
}

function scrollToElement(selector){
  const element = document.querySelector(`#${selector}`) || document.querySelector(`.${selector}`);
  if(element){
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-input').value = '';
  }
}

// Computer Vision Lite Demo
let uploadedImage = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }
  
  // Validate file type
  if (!file.type.match('image.*')) {
    alert('Please upload an image file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImage = e.target.result;
    const uploadArea = document.getElementById('upload-area');
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    uploadArea.style.display = 'none';
    preview.style.display = 'block';
    previewImg.src = uploadedImage;
  };
  reader.readAsDataURL(file);
}

function runObjectDetection() {
  if (!uploadedImage) {
    alert('Please upload an image first');
    return;
  }
  
  const output = document.getElementById('vision-output');
  const overlay = document.getElementById('detection-overlay');
  
  output.innerHTML = '<span class="processing">Analyzing image...</span>';
  overlay.innerHTML = '';
  
  // Simulate detection delay
  setTimeout(() => {
    // Simulate object detection results
    const objects = [
      { name: 'Person', confidence: 0.92, color: '#10b981', bbox: { x: 20, y: 15, width: 35, height: 60 } },
      { name: 'Car', confidence: 0.87, color: '#3b82f6', bbox: { x: 55, y: 40, width: 40, height: 30 } },
      { name: 'Tree', confidence: 0.78, color: '#f59e0b', bbox: { x: 5, y: 25, width: 15, height: 50 } },
      { name: 'Building', confidence: 0.95, color: '#8b5cf6', bbox: { x: 70, y: 10, width: 25, height: 70 } }
    ];
    
    // Randomly select 2-4 objects
    const detectedObjects = objects.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    
    // Draw bounding boxes
    overlay.innerHTML = detectedObjects.map(obj => 
      `<div class="bounding-box" style="
        left: ${obj.bbox.x}%; 
        top: ${obj.bbox.y}%; 
        width: ${obj.bbox.width}%; 
        height: ${obj.bbox.height}%;
        border-color: ${obj.color};
      ">
        <div class="bbox-label" style="background: ${obj.color}">
          ${obj.name} ${(obj.confidence * 100).toFixed(0)}%
        </div>
      </div>`
    ).join('');
    
    // Display results
    output.innerHTML = detectedObjects.map(obj => 
      `<div class="detection-item">
        <div class="detection-label" style="color: ${obj.color}">${obj.name}</div>
        <div class="detection-confidence">${(obj.confidence * 100).toFixed(0)}% confidence</div>
      </div>`
    ).join('');
    
    // Add processing info
    output.innerHTML += `
      <div class="processing-info">
        <div>Model: YOLOv5 (Lite)</div>
        <div>Processing time: ${(50 + Math.random() * 100).toFixed(0)}ms</div>
        <div>Objects detected: ${detectedObjects.length}</div>
      </div>
    `;
    
  }, 1500);
}

function clearVisionDemo() {
  const uploadArea = document.getElementById('upload-area');
  const preview = document.getElementById('image-preview');
  const uploadInput = document.getElementById('image-upload');
  const output = document.getElementById('vision-output');
  const overlay = document.getElementById('detection-overlay');
  
  uploadArea.style.display = 'block';
  preview.style.display = 'none';
  uploadInput.value = '';
  output.innerHTML = 'Upload an image to start detection...';
  overlay.innerHTML = '';
  uploadedImage = null;
}

// Setup drag and drop
document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        document.getElementById('image-upload').files = files;
        handleImageUpload({ target: { files: files } });
      }
    });
  }
});

// Git Workflow Visualizer
let currentBranch = 'main';
let commitCount = 3;
let featureCommits = 0;
let hasFeatureBranch = false;

function createBranch() {
  if (hasFeatureBranch) {
    updateStatus('Feature branch already exists!', 'warning');
    return;
  }
  
  const featureBranch = document.getElementById('feature-branch');
  featureBranch.style.display = 'block';
  hasFeatureBranch = true;
  
  addCommand('$ git checkout -b feature/new-feature');
  updateStatus('Created feature branch', 'success');
  
  // Animate branch appearance
  setTimeout(() => {
    featureBranch.style.opacity = '1';
  }, 100);
}

function makeCommit() {
  const branch = currentBranch === 'main' ? 'main' : 'feature';
  const commitNumber = branch === 'main' ? commitCount + 1 : featureCommits + 1;
  
  const commitMessages = {
    main: [
      'Fix responsive design',
      'Update dependencies',
      'Improve performance',
      'Add unit tests',
      'Refactor codebase'
    ],
    feature: [
      'Implement core logic',
      'Add user interface',
      'Write documentation',
      'Fix bugs',
      'Add tests'
    ]
  };
  
  const message = commitMessages[branch][Math.floor(Math.random() * commitMessages[branch].length)];
  const hash = generateCommitHash();
  
  const newCommit = document.createElement('div');
  newCommit.className = 'commit';
  newCommit.setAttribute('data-commit', `${branch}-${commitNumber}`);
  
  if (branch === 'main') {
    commitCount++;
    document.querySelector('.main-branch').appendChild(newCommit);
  } else {
    featureCommits++;
    document.querySelector('.feature-branch').appendChild(newCommit);
  }
  
  newCommit.innerHTML = `
    <div class="commit-dot ${currentBranch === branch ? 'current' : ''}"></div>
    <div class="commit-info">
      <div class="commit-hash">${hash}</div>
      <div class="commit-message">${message}</div>
    </div>
  `;
  
  // Update current commit indicator
  document.querySelectorAll('.commit-dot').forEach(dot => dot.classList.remove('current'));
  newCommit.querySelector('.commit-dot').classList.add('current');
  
  addCommand(`$ git commit -m "${message}"`);
  updateStatus(`Committed to ${branch}`, 'success');
  updateCommitCount();
}

function mergeBranch() {
  if (!hasFeatureBranch) {
    updateStatus('No feature branch to merge', 'warning');
    return;
  }
  
  if (currentBranch !== 'main') {
    updateStatus('Switch to main branch first', 'warning');
    return;
  }
  
  addCommand('$ git checkout main');
  addCommand('$ git merge feature/new-feature');
  
  // Simulate merge conflict resolution
  const hasConflict = Math.random() > 0.7;
  
  if (hasConflict) {
    addCommand('$ # Fixing merge conflicts...');
    addCommand('$ git add .');
    addCommand('$ git commit -m "Resolve merge conflicts"');
    updateStatus('Merge completed (with conflicts resolved)', 'success');
  } else {
    updateStatus('Merge completed successfully', 'success');
  }
  
  // Hide feature branch after merge
  setTimeout(() => {
    document.getElementById('feature-branch').style.display = 'none';
    hasFeatureBranch = false;
    featureCommits = 0;
    updateStatus('Feature branch merged and cleaned up', 'success');
  }, 2000);
}

function resetWorkflow() {
  // Reset all variables
  currentBranch = 'main';
  commitCount = 3;
  featureCommits = 0;
  hasFeatureBranch = false;
  
  // Reset UI
  document.getElementById('feature-branch').style.display = 'none';
  document.getElementById('current-branch').textContent = 'main';
  document.getElementById('total-commits').textContent = '3';
  document.getElementById('workflow-status').textContent = 'Ready';
  
  // Reset command history
  document.getElementById('command-list').innerHTML = `
    <div class="command-item">$ git init</div>
    <div class="command-item">$ git add .</div>
    <div class="command-item">$ git commit -m "Initial commit"</div>
  `;
  
  // Reset current commit indicator
  document.querySelectorAll('.commit-dot').forEach(dot => dot.classList.remove('current'));
  document.querySelector('[data-commit="main-3"] .commit-dot').classList.add('current');
  
  updateStatus('Workflow reset to initial state', 'info');
}

function generateCommitHash() {
  const chars = 'abcdef0123456789';
  let hash = '';
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function addCommand(command) {
  const commandList = document.getElementById('command-list');
  const commandItem = document.createElement('div');
  commandItem.className = 'command-item';
  commandItem.textContent = command;
  commandList.appendChild(commandItem);
  
  // Auto-scroll to bottom
  commandList.scrollTop = commandList.scrollHeight;
  
  // Limit history to 20 commands
  if (commandList.children.length > 20) {
    commandList.removeChild(commandList.firstChild);
  }
}

function updateStatus(message, type) {
  const statusElement = document.getElementById('workflow-status');
  statusElement.textContent = message;
  statusElement.className = `status-${type}`;
  
  setTimeout(() => {
    statusElement.className = '';
  }, 3000);
}

function updateCommitCount() {
  const totalCommits = commitCount + featureCommits;
  document.getElementById('total-commits').textContent = totalCommits;
}

// SQL Query Builder
let queryHistory = [];

function updateQueryBuilder() {
  const operation = document.getElementById('sql-operation').value;
  const table = document.getElementById('sql-table').value;
  const queryElement = document.getElementById('generated-query');
  
  // Show/hide controls based on operation
  document.getElementById('columns-control').style.display = 
    operation === 'SELECT' ? 'block' : 'none';
  document.getElementById('where-control').style.display = 
    operation !== 'INSERT' ? 'block' : 'none';
  document.getElementById('order-control').style.display = 
    operation === 'SELECT' ? 'block' : 'none';
  
  let query = '';
  
  switch(operation) {
    case 'SELECT':
      query = buildSelectQuery(table);
      break;
    case 'INSERT':
      query = buildInsertQuery(table);
      break;
    case 'UPDATE':
      query = buildUpdateQuery(table);
      break;
    case 'DELETE':
      query = buildDeleteQuery(table);
      break;
  }
  
  queryElement.textContent = query;
}

function buildSelectQuery(table) {
  const selectedColumns = getSelectedColumns();
  const whereConditions = getWhereConditions();
  const orderBy = document.getElementById('sql-order').value;
  const direction = document.getElementById('sql-direction').value;
  
  let query = `SELECT ${selectedColumns.join(', ')} FROM ${table}`;
  
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  if (orderBy) {
    query += ` ORDER BY ${orderBy} ${direction}`;
  }
  
  query += ';';
  return query;
}

function buildInsertQuery(table) {
  let query = `INSERT INTO ${table} (name, email) VALUES ('John Doe', 'john@example.com');`;
  return query;
}

function buildUpdateQuery(table) {
  const whereConditions = getWhereConditions();
  let query = `UPDATE ${table} SET name = 'Updated Name', email = 'updated@example.com'`;
  
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  query += ';';
  return query;
}

function buildDeleteQuery(table) {
  const whereConditions = getWhereConditions();
  let query = `DELETE FROM ${table}`;
  
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  query += ';';
  return query;
}

function getSelectedColumns() {
  const checkboxes = document.querySelectorAll('#sql-columns input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function getWhereConditions() {
  const clauses = document.querySelectorAll('.where-clause');
  const conditions = [];
  
  clauses.forEach(clause => {
    const field = clause.querySelector('.where-field').value;
    const operator = clause.querySelector('.where-operator').value;
    const value = clause.querySelector('.where-value').value;
    
    if (field && value) {
      const formattedValue = operator === 'LIKE' ? `'%${value}%'` : `'${value}'`;
      conditions.push(`${field} ${operator} ${formattedValue}`);
    }
  });
  
  return conditions;
}

function addWhereClause() {
  const whereBuilder = document.getElementById('where-builder');
  const newClause = document.createElement('div');
  newClause.className = 'where-clause';
  newClause.innerHTML = `
    <select class="where-field" onchange="updateQueryBuilder()">
      <option value="">Select field...</option>
      <option value="id">id</option>
      <option value="name">name</option>
      <option value="email">email</option>
    </select>
    <select class="where-operator" onchange="updateQueryBuilder()">
      <option value="=">=</option>
      <option value=">">></option>
      <option value="<"><</option>
      <option value="LIKE">LIKE</option>
    </select>
    <input type="text" class="where-value" placeholder="Value..." onchange="updateQueryBuilder()" />
    <button class="btn ghost small" onclick="removeWhereClause(this)">×</button>
  `;
  whereBuilder.appendChild(newClause);
}

function removeWhereClause(button) {
  const clause = button.parentElement;
  clause.remove();
  updateQueryBuilder();
}

function executeQuery() {
  const query = document.getElementById('generated-query').textContent;
  const resultsDiv = document.getElementById('query-results');
  const resultsTable = document.getElementById('results-table');
  const resultsInfo = document.getElementById('results-info');
  
  // Show loading state
  resultsDiv.style.display = 'block';
  resultsTable.innerHTML = '<div class="loading-message">Executing query...</div>';
  resultsInfo.innerHTML = '';
  
  // Simulate query execution
  setTimeout(() => {
    const mockData = generateMockData(query);
    displayResults(mockData);
    
    // Add to history
    queryHistory.push({
      query: query,
      timestamp: new Date().toLocaleTimeString(),
      rows: mockData.data.length
    });
    
  }, 1000);
}

function generateMockData(query) {
  const operation = document.getElementById('sql-operation').value;
  const table = document.getElementById('sql-table').value;
  
  if (operation === 'SELECT') {
    const mockRows = [];
    const rowCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      const selectedColumns = getSelectedColumns();
      
      selectedColumns.forEach(col => {
        switch(col) {
          case 'id':
            row[col] = i + 1;
            break;
          case 'name':
            row[col] = `User ${i + 1}`;
            break;
          case 'email':
            row[col] = `user${i + 1}@example.com`;
            break;
          case 'created_at':
            row[col] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
        }
      });
      
      mockRows.push(row);
    }
    
    return {
      success: true,
      data: mockRows,
      columns: getSelectedColumns()
    };
  } else {
    return {
      success: true,
      message: `${operation} operation completed successfully`,
      affectedRows: Math.floor(Math.random() * 10) + 1
    };
  }
}

function displayResults(results) {
  const resultsTable = document.getElementById('results-table');
  const resultsInfo = document.getElementById('results-info');
  
  if (results.data) {
    // Display table results
    let tableHTML = '<table class="sql-table"><thead><tr>';
    results.columns.forEach(col => {
      tableHTML += `<th>${col}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    results.data.forEach(row => {
      tableHTML += '<tr>';
      results.columns.forEach(col => {
        tableHTML += `<td>${row[col]}</td>`;
      });
      tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    resultsTable.innerHTML = tableHTML;
    resultsInfo.innerHTML = `<div class="result-stats">Rows returned: ${results.data.length}</div>`;
  } else {
    // Display operation result
    resultsTable.innerHTML = `<div class="operation-result">${results.message}</div>`;
    resultsInfo.innerHTML = `<div class="result-stats">Rows affected: ${results.affectedRows}</div>`;
  }
}

function copyQuery() {
  const query = document.getElementById('generated-query').textContent;
  navigator.clipboard.writeText(query).then(() => {
    // Show success feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('success');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('success');
    }, 2000);
  });
}

function clearQuery() {
  // Reset all controls
  document.getElementById('sql-operation').value = 'SELECT';
  document.getElementById('sql-table').value = 'users';
  document.getElementById('sql-order').value = '';
  document.getElementById('sql-direction').value = 'ASC';
  
  // Reset checkboxes
  document.querySelectorAll('#sql-columns input[type="checkbox"]').forEach(cb => {
    cb.checked = cb.value === 'id' || cb.value === 'name';
  });
  
  // Clear WHERE clauses except first one
  const whereBuilder = document.getElementById('where-builder');
  const clauses = whereBuilder.querySelectorAll('.where-clause');
  for (let i = 1; i < clauses.length; i++) {
    clauses[i].remove();
  }
  
  // Reset first WHERE clause
  const firstClause = clauses[0];
  firstClause.querySelector('.where-field').value = '';
  firstClause.querySelector('.where-value').value = '';
  
  // Hide results
  document.getElementById('query-results').style.display = 'none';
  
  // Update query
  updateQueryBuilder();
}

// Network Config Simulator
let selectedDeviceId = null;
let networkDevices = {
  router: {
    name: 'Router',
    type: 'Router',
    status: 'online',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '1'
  },
  switch: {
    name: 'Switch',
    type: 'Switch',
    status: 'online',
    ip: '192.168.1.2',
    mac: '00:1A:2B:3C:4D:5F',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '1'
  },
  server1: {
    name: 'Server 1',
    type: 'Server',
    status: 'online',
    ip: '192.168.1.10',
    mac: '00:1A:2B:3C:4D:60',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '10'
  },
  server2: {
    name: 'Server 2',
    type: 'Server',
    status: 'offline',
    ip: '192.168.1.11',
    mac: '00:1A:2B:3C:4D:61',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '10'
  },
  workstation1: {
    name: 'WS-01',
    type: 'Workstation',
    status: 'online',
    ip: '192.168.1.100',
    mac: '00:1A:2B:3C:4D:62',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '20'
  },
  workstation2: {
    name: 'WS-02',
    type: 'Workstation',
    status: 'online',
    ip: '192.168.1.101',
    mac: '00:1A:2B:3C:4D:63',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    vlan: '20'
  }
};

function selectDevice(deviceId) {
  selectedDeviceId = deviceId;
  const device = networkDevices[deviceId];
  
  // Update device info display
  document.getElementById('selected-device').textContent = device.name;
  document.getElementById('device-type').textContent = device.type;
  document.getElementById('device-status').textContent = device.status;
  document.getElementById('device-ip').textContent = device.ip;
  document.getElementById('device-mac').textContent = device.mac;
  
  // Update config form
  document.getElementById('config-ip').value = device.ip;
  document.getElementById('config-subnet').value = device.subnet;
  document.getElementById('config-gateway').value = device.gateway;
  document.getElementById('config-dns').value = device.dns;
  document.getElementById('config-vlan').value = device.vlan;
  
  // Highlight selected device
  document.querySelectorAll('.network-device').forEach(el => {
    el.classList.remove('selected');
  });
  document.querySelector(`[data-device="${deviceId}"]`).classList.add('selected');
  
  addLogEntry(`Selected device: ${device.name}`);
}

function applyConfig() {
  if (!selectedDeviceId) {
    alert('Please select a device first');
    return;
  }
  
  const device = networkDevices[selectedDeviceId];
  
  // Validate IP address
  const newIp = document.getElementById('config-ip').value;
  if (!isValidIP(newIp)) {
    alert('Invalid IP address format');
    return;
  }
  
  // Update device configuration
  device.ip = newIp;
  device.subnet = document.getElementById('config-subnet').value;
  device.gateway = document.getElementById('config-gateway').value;
  device.dns = document.getElementById('config-dns').value;
  device.vlan = document.getElementById('config-vlan').value;
  
  // Update display
  document.getElementById('device-ip').textContent = device.ip;
  
  addLogEntry(`${device.name}: Configuration applied successfully`);
  updateNetworkStats();
}

function pingDevice() {
  if (!selectedDeviceId) {
    alert('Please select a device first');
    return;
  }
  
  const device = networkDevices[selectedDeviceId];
  
  if (device.status === 'offline') {
    addLogEntry(`${device.name}: Ping failed - Device offline`);
    return;
  }
  
  // Simulate ping test
  addLogEntry(`${device.name}: Pinging ${device.ip}...`);
  
  setTimeout(() => {
    const latency = Math.floor(Math.random() * 50) + 5;
    addLogEntry(`${device.name}: Reply from ${device.ip} time=${latency}ms`);
  }, 1000);
}

function toggleDevice() {
  if (!selectedDeviceId) {
    alert('Please select a device first');
    return;
  }
  
  const device = networkDevices[selectedDeviceId];
  const deviceElement = document.querySelector(`[data-device="${selectedDeviceId}"]`);
  const statusElement = deviceElement.querySelector('.device-status');
  
  // Toggle device status
  device.status = device.status === 'online' ? 'offline' : 'online';
  
  // Update UI
  statusElement.className = `device-status ${device.status}`;
  document.getElementById('device-status').textContent = device.status;
  
  addLogEntry(`${device.name}: Status changed to ${device.status}`);
  updateNetworkStats();
}

function resetConfig() {
  if (!selectedDeviceId) {
    alert('Please select a device first');
    return;
  }
  
  const device = networkDevices[selectedDeviceId];
  
  // Reset to default values
  const defaults = {
    router: { ip: '192.168.1.1', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '1' },
    switch: { ip: '192.168.1.2', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '1' },
    server1: { ip: '192.168.1.10', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '10' },
    server2: { ip: '192.168.1.11', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '10' },
    workstation1: { ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '20' },
    workstation2: { ip: '192.168.1.101', subnet: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', vlan: '20' }
  };
  
  const defaultConfig = defaults[selectedDeviceId];
  
  // Apply defaults
  Object.assign(device, defaultConfig);
  
  // Update form and display
  document.getElementById('config-ip').value = device.ip;
  document.getElementById('config-subnet').value = device.subnet;
  document.getElementById('config-gateway').value = device.gateway;
  document.getElementById('config-dns').value = device.dns;
  document.getElementById('config-vlan').value = device.vlan;
  
  document.getElementById('device-ip').textContent = device.ip;
  
  addLogEntry(`${device.name}: Configuration reset to defaults`);
}

function isValidIP(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

function addLogEntry(message) {
  const logEntries = document.getElementById('log-entries');
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.textContent = `[${timestamp}] ${message}`;
  
  logEntries.appendChild(logEntry);
  
  // Auto-scroll to bottom
  logEntries.scrollTop = logEntries.scrollHeight;
  
  // Limit log entries to 20
  if (logEntries.children.length > 20) {
    logEntries.removeChild(logEntries.firstChild);
  }
}

function updateNetworkStats() {
  // Count active devices
  const activeCount = Object.values(networkDevices).filter(d => d.status === 'online').length;
  const totalCount = Object.keys(networkDevices).length;
  document.getElementById('active-devices').textContent = `${activeCount}/${totalCount}`;
  
  // Simulate network traffic
  const traffic = (Math.random() * 5 + 1).toFixed(1);
  document.getElementById('network-traffic').textContent = `${traffic} MB/s`;
  
  // Simulate latency
  const latency = Math.floor(Math.random() * 30) + 5;
  document.getElementById('network-latency').textContent = `${latency}ms`;
}

// Simulate network activity
setInterval(() => {
  const activities = [
    'Health check completed',
    'Data backup initiated',
    'Security scan running',
    'Firmware update available',
    'Port scan detected',
    'Connection established',
    'Bandwidth threshold warning'
  ];
  
  const devices = Object.values(networkDevices).filter(d => d.status === 'online');
  if (devices.length > 0) {
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    addLogEntry(`${randomDevice.name}: ${randomActivity}`);
  }
  
  updateNetworkStats();
}, 8000);

// Data Science Dashboard
let mainChart, pieChart, barChart;
let dashboardData = {
  sales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      borderColor: 'rgb(124, 92, 255)',
      backgroundColor: 'rgba(124, 92, 255, 0.1)',
      tension: 0.4
    }]
  },
  performance: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Performance Score',
      data: [85, 88, 82, 91],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4
    }]
  },
  customer: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Active Users',
      data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  },
  operations: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Efficiency',
      data: [75, 82, 88, 92],
      borderColor: 'rgb(251, 146, 60)',
      backgroundColor: 'rgba(251, 146, 60, 0.1)',
      tension: 0.4
    }]
  }
};

function initializeDashboard() {
  const mainCtx = document.getElementById('main-chart').getContext('2d');
  const pieCtx = document.getElementById('pie-chart').getContext('2d');
  const barCtx = document.getElementById('bar-chart').getContext('2d');
  
  // Initialize main chart
  mainChart = new Chart(mainCtx, {
    type: 'line',
    data: JSON.parse(JSON.stringify(dashboardData.sales)),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // Initialize pie chart
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
      datasets: [{
        data: [45, 35, 15, 5],
        backgroundColor: [
          'rgba(124, 92, 255, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Initialize bar chart
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Product A', 'Product B', 'Product C', 'Product D'],
      datasets: [{
        label: 'Sales',
        data: [120, 190, 80, 150],
        backgroundColor: 'rgba(124, 92, 255, 0.8)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function updateDashboard() {
  const dataset = document.getElementById('dataset-select').value;
  const timeRange = document.getElementById('time-range').value;
  const chartType = document.getElementById('chart-type').value;
  
  // Update main chart
  mainChart.destroy();
  const mainCtx = document.getElementById('main-chart').getContext('2d');
  
  mainChart = new Chart(mainCtx, {
    type: chartType,
    data: JSON.parse(JSON.stringify(dashboardData[dataset])),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // Update stats based on dataset
  updateStats(dataset);
  
  // Update table data
  updateTableData(dataset);
}

function updateStats(dataset) {
  const stats = {
    sales: {
      revenue: '$124,563',
      users: '8,429',
      conversion: '3.8%',
      aov: '$67.42'
    },
    performance: {
      revenue: '92.3%',
      users: '156',
      conversion: '94.2%',
      aov: '8.7s'
    },
    customer: {
      revenue: '$89,234',
      users: '12,456',
      conversion: '4.2%',
      aov: '$45.67'
    },
    operations: {
      revenue: '98.7%',
      users: '24',
      conversion: '99.1%',
      aov: '2.3h'
    }
  };
  
  const currentStats = stats[dataset];
  document.getElementById('stat-revenue').textContent = currentStats.revenue;
  document.getElementById('stat-users').textContent = currentStats.users;
  document.getElementById('stat-conversion').textContent = currentStats.conversion;
  document.getElementById('stat-aov').textContent = currentStats.aov;
  
  // Animate stat changes
  document.querySelectorAll('.stat-card').forEach(card => {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 200);
  });
}

function updateTableData(dataset) {
  const tableData = {
    sales: [
      ['Sales Revenue', '$45,231', '$40,192', '+12.5%', '📈'],
      ['Customer Acquisition', '1,234', '1,142', '+8.1%', '📈'],
      ['Page Views', '89,432', '92,145', '-2.9%', '📉'],
      ['Bounce Rate', '42.3%', '44.1%', '-4.1%', '📉']
    ],
    performance: [
      ['Response Time', '1.2s', '1.8s', '-33.3%', '📉'],
      ['Uptime', '99.9%', '99.7%', '+0.2%', '📈'],
      ['Error Rate', '0.1%', '0.3%', '-66.7%', '📉'],
      ['Load Time', '2.3s', '3.1s', '-25.8%', '📉']
    ],
    customer: [
      ['New Users', '2,345', '2,123', '+10.5%', '📈'],
      ['Returning Users', '8,234', '7,890', '+4.4%', '📈'],
      ['Session Duration', '5m 23s', '4m 45s', '+13.9%', '📈'],
      ['Pages per Session', '4.2', '3.8', '+10.5%', '📈']
    ],
    operations: [
      ['Processing Time', '2.1h', '2.8h', '-25.0%', '📉'],
      ['Accuracy Rate', '98.7%', '97.2%', '+1.5%', '📈'],
      ['Cost per Operation', '$12.34', '$15.67', '-21.3%', '📉'],
      ['Throughput', '1,234/h', '1,098/h', '+12.4%', '📈']
    ]
  };
  
  const tbody = document.getElementById('data-table-body');
  tbody.innerHTML = '';
  
  tableData[dataset].forEach(row => {
    const tr = document.createElement('tr');
    const changeClass = row[3].startsWith('+') ? 'positive' : 'negative';
    
    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td class="${changeClass}">${row[3]}</td>
      <td>${row[4]}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportData() {
  const dataset = document.getElementById('dataset-select').value;
  const data = {
    dataset: dataset,
    timeRange: document.getElementById('time-range').value,
    chartData: dashboardData[dataset],
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-data-${dataset}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function refreshDashboard() {
  // Simulate data refresh with random variations
  Object.keys(dashboardData).forEach(key => {
    dashboardData[key].datasets[0].data = dashboardData[key].datasets[0].data.map(value => 
      Math.round(value * (0.9 + Math.random() * 0.2))
    );
  });
  
  updateDashboard();
  
  // Show refresh animation
  const dashboard = document.querySelector('.data-science-dashboard');
  dashboard.style.opacity = '0.5';
  setTimeout(() => {
    dashboard.style.opacity = '1';
  }, 300);
}

function generateReport() {
  const dataset = document.getElementById('dataset-select').value;
  const reportData = {
    title: `${dataset.charAt(0).toUpperCase() + dataset.slice(1)} Analytics Report`,
    generated: new Date().toLocaleString(),
    summary: {
      totalRevenue: document.getElementById('stat-revenue').textContent,
      activeUsers: document.getElementById('stat-users').textContent,
      conversionRate: document.getElementById('stat-conversion').textContent,
      averageOrderValue: document.getElementById('stat-aov').textContent
    },
    insights: [
      'Performance metrics show positive trends across all key indicators',
      'User engagement has increased significantly compared to previous period',
      'Conversion optimization strategies are showing measurable results',
      'Operational efficiency improvements have reduced costs by 15%'
    ]
  };
  
  const reportContent = `
# ${reportData.title}

**Generated:** ${reportData.generated}

## Executive Summary
- **Total Revenue:** ${reportData.summary.totalRevenue}
- **Active Users:** ${reportData.summary.activeUsers}
- **Conversion Rate:** ${reportData.summary.conversionRate}
- **Average Order Value:** ${reportData.summary.averageOrderValue}

## Key Insights
${reportData.insights.map(insight => `- ${insight}`).join('\n')}

---
*This report was generated automatically from the Data Science Dashboard*
  `;
  
  const blob = new Blob([reportContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-report-${dataset}-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('main-chart')) {
    setTimeout(initializeDashboard, 100);
  }
});

// IoT Sensor Dashboard
let sensorInterval;
function startIoTDashboard(){
  const tempEl = document.getElementById('iot-temp');
  const humidityEl = document.getElementById('iot-humidity');
  const motionEl = document.getElementById('iot-motion');
  const lightEl = document.getElementById('iot-light');
  
  if(sensorInterval) clearInterval(sensorInterval);
  
  sensorInterval = setInterval(() => {
    // Simulate sensor readings
    const temp = 20 + Math.random() * 15;
    const humidity = 40 + Math.random() * 40;
    const motion = Math.random() > 0.7;
    const light = 100 + Math.random() * 900;
    
    // Update displays
    tempEl.textContent = temp.toFixed(1) + '°C';
    humidityEl.textContent = humidity.toFixed(0) + '%';
    motionEl.textContent = motion ? 'DETECTED' : 'NONE';
    motionEl.className = motion ? 'sensor-status active' : 'sensor-status';
    lightEl.textContent = light.toFixed(0) + ' lux';
    
    // Update mini charts
    updateMiniChart('temp-chart', temp, 35);
    updateMiniChart('humidity-chart', humidity, 100);
    updateMiniChart('light-chart', light, 1000);
  }, 2000);
}

function stopIoTDashboard(){
  if(sensorInterval) clearInterval(sensorInterval);
}

function updateMiniChart(chartId, value, max){
  const chart = document.getElementById(chartId);
  const percentage = (value / max) * 100;
  const bar = chart.querySelector('.chart-bar');
  if(bar){
    bar.style.width = percentage + '%';
    bar.style.background = percentage > 80 ? '#ef4444' : 
                          percentage > 60 ? '#f59e0b' : '#10b981';
  }
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
