const MAX = 3;
const BGS = [
  "backgrounds/grad-cream.jpg","backgrounds/grad-sage.jpg","backgrounds/grad-lavender.jpg",
  "backgrounds/grad-sand.jpg","backgrounds/grad-night.jpg","backgrounds/grad-coral.jpg",
  "backgrounds/grad-ocean.jpg","backgrounds/grad-forest.jpg","backgrounds/grad-rose.jpg",
  "backgrounds/grad-ink.jpg","backgrounds/soft-peach.jpg","backgrounds/soft-mint.jpg",
  "backgrounds/soft-lilac.jpg","backgrounds/soft-butter.jpg","backgrounds/photo-calm-1.jpg",
  "backgrounds/photo-calm-2.jpg","backgrounds/photo-calm-3.jpg","backgrounds/photo-calm-4.jpg",
  "backgrounds/photo-calm-5.jpg","backgrounds/photo-calm-6.jpg"
];

const input = document.getElementById("input");
const tone = document.getElementById("tone");
const overlay = document.getElementById("overlay");
const fontSel = document.getElementById("font");
const sizeSel = document.getElementById("size");
const bgGrid = document.getElementById("bgGrid");
const generateBtn = document.getElementById("generate");
const quotaEl = document.getElementById("quota");
const errorEl = document.getElementById("error");
const slideEl = document.getElementById("slide");
const slideType = document.getElementById("slideType");
const slideNum = document.getElementById("slideNum");
const slideTitle = document.getElementById("slideTitle");
const slideBody = document.getElementById("slideBody");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const counter = document.getElementById("counter");
const dotsEl = document.getElementById("dots");
const filmstrip = document.getElementById("filmstrip");
const downloadBtn = document.getElementById("download");
const downloadAllBtn = document.getElementById("downloadAll");

let slides = [];
let idx = 0;
let bgPath = BGS[0];
const bgImages = {};

function todayKey() { return "sf-" + new Date().toISOString().slice(0, 10); }
function usedCount() { return Number(localStorage.getItem(todayKey()) || 0); }
function bumpUse() { localStorage.setItem(todayKey(), String(usedCount() + 1)); }
function refreshQuota() {
  const left = Math.max(0, MAX - usedCount());
  quotaEl.textContent = "Залишилось сьогодні: " + left + "/" + MAX;
  generateBtn.disabled = left <= 0;
}
function truncate(s, n) {
  s = (s || "").trim();
  return s.length <= n ? s : s.slice(0, n - 1).trim() + "…";
}

function buildSlides(text, toneVal) {
  const topic = truncate(text.replace(/\s+/g, " "), 120) || "Твоя тема";
  const tipOpen = toneVal === "direct" ? "Коротко:" : toneVal === "expert" ? "З практики:" : "Мʼяко кажучи:";
  return [
    { type: "hook", title: "Стоп. Це важливо.", body: topic },
    { type: "myth", title: "Міф, який шкодить", body: "Порада «просто відпусти» часто ігнорує нервову систему. Тривога — не лінь і не слабкість." },
    { type: "tip", title: tipOpen + " тіло спочатку", body: "Ноги на підлогу. Видих довше за вдих. Назви 5 речей, які бачиш. Потім думки." },
    { type: "tip", title: "Один маленький крок", body: "Не треба «стати спокійним». Досить зменшити інтенсивність на 10% і дати собі опору." },
    { type: "tip", title: "Мова до себе", body: "Замість «знову я» спробуй: «зараз мені важко — і це можна витримати з підтримкою»." },
    { type: "cta", title: "Забери собі", body: "Збережи карусель. Якщо відгукнулось — напиши в Direct слово СПОКІЙ або запишися на сесію." }
  ];
}

function renderBgGrid() {
  bgGrid.innerHTML = "";
  BGS.forEach(function (path) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bg-opt" + (path === bgPath ? " active" : "");
    btn.style.backgroundImage = "url(" + path + ")";
    btn.addEventListener("click", function () {
      bgPath = path;
      renderBgGrid();
      applyLook();
      renderFilmstrip();
    });
    bgGrid.appendChild(btn);
    if (!bgImages[path]) {
      const img = new Image();
      img.src = path;
      bgImages[path] = img;
    }
  });
}

function applyLook() {
  slideEl.style.backgroundImage = "url(" + bgPath + ")";
  slideEl.classList.toggle("overlay-dark", overlay.value === "dark");
  slideEl.classList.remove("font-serif", "font-sans", "font-display", "size-s", "size-m", "size-l");
  slideEl.classList.add("font-" + fontSel.value, "size-" + sizeSel.value);
}

function saveCurrentEdits() {
  if (!slides.length) return;
  slides[idx].title = slideTitle.innerText.trim();
  slides[idx].body = slideBody.innerText.trim();
}

function renderDots() {
  dotsEl.innerHTML = "";
  slides.forEach(function (_, i) {
    const d = document.createElement("span");
    if (i === idx) d.className = "on";
    dotsEl.appendChild(d);
  });
}

function renderFilmstrip() {
  filmstrip.innerHTML = "";
  slides.forEach(function (s, i) {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "thumb" + (i === idx ? " active" : "");
    t.style.backgroundImage = "url(" + bgPath + ")";
    const lab = document.createElement("div");
    lab.className = "t-label";
    lab.textContent = i + 1 + ". " + s.title;
    t.appendChild(lab);
    t.addEventListener("click", function () {
      saveCurrentEdits();
      idx = i;
      render();
    });
    filmstrip.appendChild(t);
  });
}

function render() {
  if (!slides.length) {
    counter.textContent = "0 / 0";
    slideNum.textContent = "—";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    downloadBtn.disabled = true;
    downloadAllBtn.disabled = true;
    filmstrip.innerHTML = "";
    dotsEl.innerHTML = "";
    return;
  }
  const s = slides[idx];
  slideType.textContent = s.type;
  slideNum.textContent = idx + 1 + " / " + slides.length;
  slideTitle.innerText = s.title;
  slideBody.innerText = s.body;
  counter.textContent = idx + 1 + " / " + slides.length;
  prevBtn.disabled = idx <= 0;
  nextBtn.disabled = idx >= slides.length - 1;
  downloadBtn.disabled = false;
  downloadAllBtn.disabled = false;
  renderDots();
  renderFilmstrip();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
  return yy;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function slideToPng(slide) {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const img = bgImages[bgPath];
  if (img && img.complete && img.naturalWidth) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#fff7ef";
    ctx.fillRect(0, 0, W, H);
  }
  const dark = overlay.value === "dark";
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) { grd.addColorStop(0, "rgba(0,0,0,0.4)"); grd.addColorStop(1, "rgba(0,0,0,0.62)"); }
  else { grd.addColorStop(0, "rgba(255,255,255,0.4)"); grd.addColorStop(1, "rgba(255,255,255,0.62)"); }
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  const fg = dark ? "#f5f0e8" : "#1a1a1a";
  const fontMap = { serif: "Georgia, serif", sans: "Manrope, system-ui, sans-serif", display: '"Playfair Display", Georgia, serif' };
  const sizeMap = { s: [56, 36, 64], m: [72, 44, 84], l: [88, 52, 96] };
  const fam = fontMap[fontSel.value] || fontMap.serif;
  const sz = sizeMap[sizeSel.value] || sizeMap.m;
  ctx.fillStyle = dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.55)";
  roundRect(ctx, 72, 72, 200, 52, 26); ctx.fill();
  roundRect(ctx, W - 220, 72, 148, 52, 26); ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = "28px " + fam;
  ctx.fillText(String(slide.type).toUpperCase(), 92, 108);
  const num = (slides.indexOf(slide) + 1) + " / " + slides.length;
  ctx.fillText(num, W - 200, 108);
  ctx.font = "bold " + sz[0] + "px " + fam;
  let y = wrapText(ctx, slide.title, 72, 230, W - 144, sz[2]);
  ctx.font = sz[1] + "px " + fam;
  wrapText(ctx, slide.body, 72, y + 80, W - 144, Math.round(sz[1] * 1.3));
  ctx.globalAlpha = 0.7;
  ctx.font = "28px " + fam;
  ctx.fillText("SlideForge", 72, H - 72);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
}

overlay.addEventListener("change", function () { applyLook(); renderFilmstrip(); });
fontSel.addEventListener("change", applyLook);
sizeSel.addEventListener("change", applyLook);
slideTitle.addEventListener("blur", function () { saveCurrentEdits(); renderFilmstrip(); });
slideBody.addEventListener("blur", function () { saveCurrentEdits(); renderFilmstrip(); });

prevBtn.addEventListener("click", function () {
  if (idx > 0) { saveCurrentEdits(); idx -= 1; render(); }
});
nextBtn.addEventListener("click", function () {
  if (idx < slides.length - 1) { saveCurrentEdits(); idx += 1; render(); }
});

generateBtn.addEventListener("click", function () {
  errorEl.hidden = true;
  const text = input.value.trim();
  if (!text) { errorEl.textContent = "Введи тему або чернетку."; errorEl.hidden = false; return; }
  if (usedCount() >= MAX) { errorEl.textContent = "Ліміт на сьогодні вичерпано."; errorEl.hidden = false; refreshQuota(); return; }
  slides = buildSlides(text, tone.value);
  idx = 0;
  bumpUse();
  refreshQuota();
  applyLook();
  render();
});

downloadBtn.addEventListener("click", function () {
  saveCurrentEdits();
  const a = document.createElement("a");
  a.href = slideToPng(slides[idx]);
  a.download = "slide-" + (idx + 1) + ".png";
  a.click();
});
downloadAllBtn.addEventListener("click", function () {
  saveCurrentEdits();
  slides.forEach(function (s, i) {
    const a = document.createElement("a");
    a.href = slideToPng(s);
    a.download = "slide-" + (i + 1) + ".png";
    setTimeout(function () { a.click(); }, i * 250);
  });
});

renderBgGrid();
refreshQuota();
applyLook();
render();
