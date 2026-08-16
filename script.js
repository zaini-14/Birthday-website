/* ================================================================
   PHOTO LIST — Exhibit A. photo1.jpg ... photo9.jpg sit in the
   same folder as this HTML file. Reorder / rename / add more by
   editing this array; missing files fall back to a placeholder.
   ================================================================ */
const PHOTO_FILES = [
  { src: "photo1.jpg", label: "Exhibit A-1" },
  { src: "photo2.jpg", label: "Exhibit A-2" },
  { src: "photo3.jpg", label: "Exhibit A-3" },
  { src: "photo4.jpg", label: "Exhibit A-4" },
  { src: "photo5.jpg", label: "Exhibit A-5" },
  { src: "photo6.jpg", label: "Exhibit A-6" },
  { src: "photo7.jpg", label: "Exhibit A-7" },
  { src: "photo8.jpg", label: "Exhibit A-8" },
  { src: "photo9.jpg", label: "Exhibit A-9" },
];
const evidenceGrid = document.getElementById('evidenceGrid');
PHOTO_FILES.forEach(p => {
  const card = document.createElement('div');
  card.className = 'evidence-tag';
  card.innerHTML = `
    <div class="pin"></div>
    <div class="frame">
      <img src="${p.src}" alt="${p.label}" loading="lazy"
        onerror="this.parentElement.classList.add('no-photo'); this.remove();">
    </div>
    <div class="label mono">${p.label}</div>
  `;
  evidenceGrid.appendChild(card);
});

/* ================================================================
   4-DIGIT LOCK — change the code here any time
   ================================================================ */
const LOCK_CODE = "2001";

const pinInputs = [...document.querySelectorAll('.pin-digit')];
const pinRow = document.getElementById('pinRow');
const lockMsg = document.getElementById('lockMsg');
const lockbox = document.getElementById('lockbox');
const letterEl = document.getElementById('letter');
const unlockBtn = document.getElementById('unlockBtn');

pinInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value && i < pinInputs.length - 1) pinInputs[i+1].focus();
    if (i === pinInputs.length - 1 && input.value) tryUnlock();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && i > 0) pinInputs[i-1].focus();
  });
});

function tryUnlock(){
  const code = pinInputs.map(i => i.value).join('');
  if (code.length < 4) return;
  if (code === LOCK_CODE){
    lockbox.style.display = 'none';
    letterEl.classList.add('show');
    requestAnimationFrame(() => letterEl.classList.add('in'));
    burstConfetti(90);
  } else {
    lockMsg.textContent = 'Objection — incorrect code. Try again.';
    pinRow.classList.remove('shake'); void pinRow.offsetWidth; pinRow.classList.add('shake');
    pinInputs.forEach(i => i.value = '');
    pinInputs[0].focus();
  }
}
unlockBtn.addEventListener('click', tryUnlock);

/* ================================================================
   GAVEL GATE — strike to enter, music starts immediately
   ================================================================ */
const gate = document.getElementById('gate');
const gavelBtn = document.getElementById('gavelBtn');
const impactRing = document.getElementById('impactRing');
const soundToggle = document.getElementById('soundToggle');
const soundToggleLabel = document.getElementById('soundToggleLabel');

let audioCtx;
function getAudioCtx(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playGavelThud(){
  try{
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.35);
  }catch(e){}
}

/* Happy Birthday melody, looped softly in the background */
const NOTES = { C4:261.6, D4:293.7, E4:329.6, F4:349.2, G4:392.0, A4:440.0, B4:493.9, C5:523.3 };
const MELODY = [
  ['C4',0.4],['C4',0.2],['D4',0.6],['C4',0.6],['F4',0.6],['E4',1.0],
  ['C4',0.4],['C4',0.2],['D4',0.6],['C4',0.6],['G4',0.6],['F4',1.0],
  ['C4',0.4],['C4',0.2],['C5',0.6],['A4',0.6],['F4',0.6],['E4',0.6],['D4',1.0],
  ['B4',0.4],['B4',0.2],['A4',0.6],['F4',0.6],['G4',0.6],['F4',1.0],
];
const MELODY_DURATION = MELODY.reduce((s,n) => s + n[1], 0);

let musicOn = true;
let musicLoopTimer = null;

function playMelodyOnce(){
  const ctx = getAudioCtx();
  let t = ctx.currentTime + 0.05;
  MELODY.forEach(([note, dur]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = NOTES[note];
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + dur);
    t += dur;
  });
}

function startMusicLoop(){
  if (!musicOn) return;
  playMelodyOnce();
  musicLoopTimer = setTimeout(startMusicLoop, (MELODY_DURATION + 0.6) * 1000);
}
function stopMusicLoop(){
  clearTimeout(musicLoopTimer);
}

soundToggle.addEventListener('click', () => {
  musicOn = !musicOn;
  soundToggleLabel.textContent = musicOn ? 'Music On' : 'Music Off';
  if (musicOn) startMusicLoop(); else stopMusicLoop();
});

gavelBtn.addEventListener('click', () => {
  gate.classList.add('striking');
  impactRing.classList.add('go');
  playGavelThud();
  burstConfetti(70);
  soundToggle.classList.add('show');
  setTimeout(() => {
    gate.classList.add('open');
    document.body.style.overflow = 'auto';
    startMusicLoop();
    startBalloons();
  }, 480);
}, { once:true });

/* ================================================================
   SCROLL REVEALS
   ================================================================ */
const revealEls = document.querySelectorAll('.reveal');
const chargeItems = document.querySelectorAll('.charge-list li');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('in');
      if (entry.target.closest('#charges')){
        chargeItems.forEach((li, i) => setTimeout(() => li.classList.add('in'), i * 140));
      }
    }
  });
}, { threshold:0.25 });
revealEls.forEach(el => io.observe(el));

/* ================================================================
   CANDLES
   ================================================================ */
const candles = document.querySelectorAll('.candle');
const blowAllBtn = document.getElementById('blowAllBtn');
const cakeCheer = document.getElementById('cakeCheer');
function checkAllOut(){
  const allOut = [...candles].every(c => c.classList.contains('out'));
  if (allOut){ cakeCheer.classList.add('show'); blowAllBtn.disabled = true; burstConfetti(110); }
}
candles.forEach(c => {
  c.addEventListener('click', () => { if (!c.classList.contains('out')){ c.classList.add('out'); checkAllOut(); } });
});
blowAllBtn.addEventListener('click', () => {
  candles.forEach((c, i) => setTimeout(() => { c.classList.add('out'); checkAllOut(); }, i * 160));
  playGavelThud();
});

/* ================================================================
   CANVASES — sizing
   ================================================================ */
const starsCanvas = document.getElementById('stars-canvas');
const sctx = starsCanvas.getContext('2d');
const confettiCanvas = document.getElementById('confetti-canvas');
const cctx = confettiCanvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvases(){
  [starsCanvas, confettiCanvas].forEach(c => { c.width = window.innerWidth; c.height = window.innerHeight; });
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

/* ================================================================
   TWINKLING STARS / SPARKLES
   ================================================================ */
let stars = [];
function initStars(){
  const count = reduceMotion ? 0 : Math.min(70, Math.floor(window.innerWidth / 20));
  stars = Array.from({length:count}, () => ({
    x: Math.random()*starsCanvas.width,
    y: Math.random()*starsCanvas.height,
    r: Math.random()*1.8 + 0.6,
    phase: Math.random()*Math.PI*2,
    speed: Math.random()*0.02 + 0.01,
  }));
}
initStars();
window.addEventListener('resize', initStars);

function drawStars(t){
  sctx.clearRect(0,0,starsCanvas.width, starsCanvas.height);
  stars.forEach(s => {
    s.phase += s.speed;
    const alpha = 0.25 + Math.abs(Math.sin(s.phase)) * 0.55;
    sctx.beginPath();
    sctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    sctx.fillStyle = `rgba(200,149,44,${alpha})`;
    sctx.fill();
  });
  requestAnimationFrame(drawStars);
}
if (!reduceMotion) requestAnimationFrame(drawStars);

/* ================================================================
   CONFETTI BURST
   ================================================================ */
let confettiPieces = [];
const CONFETTI_COLORS = ['#c8952c', '#e9c98a', '#e8a6a0', '#a7c6a5', '#a9c8e0', '#ffffff'];
function burstConfetti(count){
  if (reduceMotion) return;
  const originX = confettiCanvas.width / 2;
  const originY = confettiCanvas.height * 0.35;
  for (let i=0; i<count; i++){
    confettiPieces.push({
      x: originX + (Math.random()-0.5)*140, y: originY,
      vx: (Math.random()-0.5)*9, vy: Math.random()*-9 - 3,
      w: Math.random()*7+4, h: Math.random()*10+6,
      rot: Math.random()*360, vr: (Math.random()-0.5)*14,
      color: CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)], life: 0,
    });
  }
}
function drawConfetti(){
  cctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
    cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.rot * Math.PI/180);
    cctx.fillStyle = p.color; cctx.globalAlpha = Math.max(0, 1 - p.life/160);
    cctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); cctx.restore();
  });
  confettiPieces = confettiPieces.filter(p => p.life < 160 && p.y < confettiCanvas.height + 40);
  requestAnimationFrame(drawConfetti);
}
requestAnimationFrame(drawConfetti);

/* ================================================================
   RISING BALLOONS
   ================================================================ */
const balloonLayer = document.getElementById('balloon-layer');
const BALLOON_COLORS = ['#e8a6a0', '#a7c6a5', '#a9c8e0', '#e9c98a', '#c8952c'];
let balloonInterval = null;

function spawnBalloon(){
  if (reduceMotion) return;
  const b = document.createElement('div');
  b.className = 'balloon';
  const color = BALLOON_COLORS[Math.floor(Math.random()*BALLOON_COLORS.length)];
  b.style.background = color;
  b.style.left = Math.random()*94 + '%';
  const duration = Math.random()*6 + 10;
  const scale = Math.random()*0.4 + 0.7;
  b.style.transform = `scale(${scale})`;
  b.style.animation = `rise ${duration}s linear forwards`;
  balloonLayer.appendChild(b);
  setTimeout(() => b.remove(), duration*1000 + 200);
}

function startBalloons(){
  if (reduceMotion || balloonInterval) return;
  for (let i=0;i<3;i++) setTimeout(spawnBalloon, i*900);
  balloonInterval = setInterval(spawnBalloon, 1800);
}

/* lock scroll until the gate is opened */
document.body.style.overflow = 'hidden';
