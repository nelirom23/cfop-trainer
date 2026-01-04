const $ = (q)=>document.querySelector(q);

// ---------- Settings (saved) ----------
const LS_CONTRAST = "cfop_contrast_v1";

// ---------- Practice / UI ----------
let currentSet = "F2L";
let currentCase = CFOP_DATA[currentSet][0];

const setTitle = $("#setTitle");
const currentCasePill = $("#currentCasePill");
const caseName = $("#caseName");
const caseImg = $("#caseImg");
const caseLink = $("#caseLink");
const caseFrame = $("#caseFrame");
const searchInput = $("#searchInput");

const listBox = $("#listBox");
const caseGrid = $("#caseGrid");

// NEW: Contrast toggle element
const contrastToggle = $("#contrastToggle");

function setActiveTab(set){
  currentSet = set;

  document.querySelectorAll(".tab").forEach(btn=>{
    const on = btn.dataset.set === set;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });

  setTitle.textContent = `${set} Practice`;
  loadCase(CFOP_DATA[set][0]);
}

function loadCase(c){
  currentCase = c;

  caseName.textContent = c.name;
  currentCasePill.textContent = c.name;

  caseImg.alt = "Case diagram";
  caseImg.src = c.img;

  caseImg.onerror = () => {
    caseImg.removeAttribute("src");
    caseImg.alt = "Image not available (open explanation)";
  };

  caseLink.href = c.url;

  // Try embedding; if blocked, user can open link
  caseFrame.src = c.url;
}

function randomCase(){
  const arr = CFOP_DATA[currentSet];
  const next = arr[Math.floor(Math.random()*arr.length)];
  loadCase(next);
}

function normalizeQuery(q){
  return q.trim().toLowerCase().replace(/\s+/g,"");
}

function findCase(query){
  const q = normalizeQuery(query);
  if(!q) return null;

  const arr = CFOP_DATA[currentSet];

  // number only -> current set
  if(/^\d+$/.test(q)){
    const n = Number(q);
    const suffix = `-${String(n).padStart(2,"0")}`;
    return arr.find(x => x.id.toLowerCase().endsWith(suffix)) || null;
  }

  // direct match across sets by id/name
  for(const set of ["F2L","OLL","PLL"]){
    const list = CFOP_DATA[set];
    const hit = list.find(x => normalizeQuery(x.id) === q || normalizeQuery(x.name) === q);
    if(hit) return hit;
  }

  // PLL short code like "t", "ua"
  if(currentSet === "PLL"){
    const hit = CFOP_DATA.PLL.find(x => normalizeQuery(x.name).endsWith(q));
    if(hit) return hit;
  }

  // partial match
  const hit2 = arr.find(x => normalizeQuery(x.id).includes(q) || normalizeQuery(x.name).includes(q));
  return hit2 || null;
}

// ---------- List View ----------
function openList(){
  listBox.classList.remove("hidden");
  caseGrid.innerHTML = "";

  const items = CFOP_DATA[currentSet];
  for(const c of items){
    const div = document.createElement("div");
    div.className = "caseCard";
    div.innerHTML = `
      <img src="${c.img}" alt="${c.name}" />
      <div class="name">${c.name}</div>
    `;
    div.onclick = () => {
      loadCase(c);
      closeList();
      window.scrollTo({top:0, behavior:"smooth"});
    };
    caseGrid.appendChild(div);
  }
}
function closeList(){
  listBox.classList.add("hidden");
}

// ---------- Contrast Mode ----------
function applyContrast(on){
  document.body.classList.toggle("contrast", !!on);
  contrastToggle.checked = !!on;
  localStorage.setItem(LS_CONTRAST, on ? "1" : "0");
}

contrastToggle.addEventListener("change", () => {
  applyContrast(contrastToggle.checked);
});

// ---------- Timer ----------
const timerDisplay = $("#timerDisplay");
const btnStartStop = $("#btnStartStop");
const btnReset = $("#btnReset");
const btnClear = $("#btnClear");
const historyEl = $("#history");

let running = false;
let startAt = 0;
let rafId = 0;
let baseElapsed = 0; // ms

function fmt(ms){
  return (ms/1000).toFixed(2);
}

function tick(){
  if(!running) return;
  const now = performance.now();
  const elapsed = baseElapsed + (now - startAt);
  timerDisplay.textContent = fmt(elapsed);
  rafId = requestAnimationFrame(tick);
}

function loadHistory(){
  try{
    return JSON.parse(localStorage.getItem("cfop_times") || "[]");
  }catch{
    return [];
  }
}
function saveHistory(arr){
  localStorage.setItem("cfop_times", JSON.stringify(arr));
}
function renderHistory(){
  const arr = loadHistory();
  historyEl.innerHTML = "";

  if(arr.length === 0){
    historyEl.innerHTML = `<div class="histRow"><div class="histMeta">No solves yet. Start the timer!</div></div>`;
    return;
  }

  for(const item of arr.slice().reverse()){
    const row = document.createElement("div");
    row.className = "histRow";
    row.innerHTML = `
      <div class="histLeft">
        <div class="histTime">${item.time}s</div>
        <div class="histMeta">${item.case} • ${new Date(item.when).toLocaleString()}</div>
      </div>
      <div class="histMeta">${item.set}</div>
    `;
    historyEl.appendChild(row);
  }
}

function start(){
  if(running) return;
  running = true;
  btnStartStop.textContent = "Stop";
  startAt = performance.now();
  rafId = requestAnimationFrame(tick);
}

function stop(){
  if(!running) return;
  running = false;
  cancelAnimationFrame(rafId);

  const current = Number(timerDisplay.textContent) || 0;
  const record = {
    time: current.toFixed(2),
    when: Date.now(),
    set: currentSet,
    case: currentCase.name
  };

  const arr = loadHistory();
  arr.push(record);
  saveHistory(arr);
  renderHistory();

  btnStartStop.textContent = "Start";
}

function resetTimer(){
  cancelAnimationFrame(rafId);
  running = false;
  baseElapsed = 0;
  timerDisplay.textContent = "0.00";
  btnStartStop.textContent = "Start";
}

// Spacebar start/stop (don’t interfere with typing)
window.addEventListener("keydown", (e)=>{
  const tag = (document.activeElement?.tagName || "").toLowerCase();
  const typing = tag === "input" || tag === "textarea";
  if(typing) return;

  if(e.code === "Space"){
    e.preventDefault();
    if(running) stop(); else start();
  }
});

// ---------- Wire up ----------
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=> setActiveTab(btn.dataset.set));
});

$("#btnRandom").addEventListener("click", randomCase);
$("#btnList").addEventListener("click", openList);
$("#btnCloseList").addEventListener("click", closeList);

$("#btnGo").addEventListener("click", ()=>{
  const hit = findCase(searchInput.value);
  if(hit) loadCase(hit);
});
searchInput.addEventListener("keydown",(e)=>{
  if(e.key === "Enter"){
    const hit = findCase(searchInput.value);
    if(hit) loadCase(hit);
  }
});

btnStartStop.addEventListener("click", ()=> running ? stop() : start());
btnReset.addEventListener("click", resetTimer);

btnClear.addEventListener("click", ()=>{
  localStorage.removeItem("cfop_times");
  renderHistory();
});

// ---------- Init ----------
(function init(){
  // Load contrast preference
  const saved = localStorage.getItem(LS_CONTRAST);
  applyContrast(saved === "1");

  setActiveTab("F2L");
  renderHistory();
})();
