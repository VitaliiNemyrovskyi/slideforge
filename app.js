const MAX = 3;
const BGS = [
  "backgrounds/grad-cream.jpg", "backgrounds/grad-sage.jpg", "backgrounds/grad-lavender.jpg",
  "backgrounds/grad-sand.jpg", "backgrounds/grad-night.jpg", "backgrounds/grad-coral.jpg",
  "backgrounds/grad-ocean.jpg", "backgrounds/grad-forest.jpg", "backgrounds/grad-rose.jpg",
  "backgrounds/grad-ink.jpg", "backgrounds/soft-peach.jpg", "backgrounds/soft-mint.jpg",
  "backgrounds/soft-lilac.jpg", "backgrounds/soft-butter.jpg", "backgrounds/photo-calm-1.jpg",
  "backgrounds/photo-calm-2.jpg", "backgrounds/photo-calm-3.jpg", "backgrounds/photo-calm-4.jpg",
  "backgrounds/photo-calm-5.jpg", "backgrounds/photo-calm-6.jpg"
];

const els = {
  input: document.getElementById("input"),
  tone: document.getElementById("tone"),
  overlay: document.getElementById("overlay"),
  font: document.getElementById("font"),
  size: document.getElementById("size"),
  bgGrid: document.getElementById("bgGrid"),
  generate: document.getElementById("generate"),
  quota: document.getElementById("quota"),
  error: document.getElementById("error"),
  slide: document.getElementById("slide"),
  slideInner: document.querySelector(".slide-inner"),
  textBlock: document.getElementById("textBlock"),
  slideType: document.getElementById("slideType"),
  slideNum: document.getElementById("slideNum"),
  slideTitle: document.getElementById("slideTitle"),
  slideBody: document.getElementById("slideBody"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  counter: document.getElementById("counter"),
  dots: document.getElementById("dots"),
  filmstrip: document.getElementById("filmstrip"),
  download: document.getElementById("download"),
  downloadAll: document.getElementById("downloadAll"),
  alignLeft: document.getElementById("alignLeft"),
  alignCenter: document.getElementById("alignCenter"),
  alignRight: document.getElementById("alignRight"),
  valignTop: document.getElementById("valignTop"),
  valignMiddle: document.getElementById("valignMiddle"),
  valignBottom: document.getElementById("valignBottom"),
  toolbar: document.getElementById("toolbar")
};

let slides = [];
let idx = 0;
let bgPath = BGS[0];
const bgImages = {};
let previewAlign = 'left';
let previewValign = 'middle';

function todayKey() {
  return "sf-" + new Date().toISOString().slice(0, 10);
}
function usedCount() {
  return Number(localStorage.getItem(todayKey()) || 0);
}
function bumpUse() {
  localStorage.setItem(todayKey(), String(usedCount() + 1));
}
function refreshQuota() {
  const left = Math.max(0, MAX - usedCount());
  els.quota.textContent = "Сьогодні: " + left + "/" + MAX;
  els.generate.disabled = left <= 0;
}
function truncate(s, n) {
  s = String(s || "").trim();
  return s.length <= n ? s : s.slice(0, n - 1).trim() + "…";
}
function hasSlides() {
  return slides.length > 0;
}

function buildSlides(text, toneVal) {
  const topic = truncate(text.replace(/\s+/g, " "), 140) || "Твоя тема";
  const soft = toneVal === "direct" ? false : toneVal === "expert" ? "expert" : "warm";
  const a = previewAlign;
  const v = previewValign;

  const isFight = /свар|дрібниц|конфлікт|партнер|стосунк|сімей|семья|ссори|крич/i.test(topic);

  if (isFight) {
    const tip1 =
      soft === false
        ? "Перед відповіддю спитай себе: я хочу бути правим чи бути поруч?"
        : soft === "expert"
          ? "Дрібниця часто активує старий тригер: контроль, знецінення, самотність у парі."
          : "Пауза на 10 секунд. Спочатку контакт, потім правота.";
    return [
      { type: "hook", title: "Це майже ніколи не про чашку", body: topic, align: a, valign: v },
      { type: "myth", title: "Міф про «дрібниці»", body: "Сварка через брудну чашку рідко про посуд. Це сигнал: «мене не чують», «я одна тягну», «мене знову контролюють».", align: a, valign: v },
      { type: "tip", title: "Що насправді болить", body: "Під криком часто ховається потреба в повазі, близькості або безпеці. Якщо говорити лише про факт — розмова йде по колу.", align: a, valign: v },
      { type: "tip", title: "Один маленький крок", body: tip1, align: a, valign: v },
      { type: "tip", title: "Фраза замість атаки", body: "Не «ти завжди…», а: «мені зараз важко, бо я відчуваю… Мені потрібно…»", align: a, valign: v },
      { type: "cta", title: "Забери собі", body: "Збережи, якщо впізнав свою пару. Хочеш розібрати свій сценарій — напиши в Direct слово СІМʼЯ.", align: a, valign: v }
    ];
  }

  const open = soft === false ? "Коротко по суті:" : soft === "expert" ? "З практики:" : "Мʼяко кажучи:";
  return [
    { type: "hook", title: "Стоп. Це про тебе.", body: topic, align: a, valign: v },
    { type: "myth", title: "Де застрягаємо", body: "Ми часто шукаємо «хто винен», замість питання: що насправді зараз потрібно кожному.", align: a, valign: v },
    { type: "tip", title: open + " помітити патерн", body: "Коли тема знову спливає — це вже не випадок, а сценарій. Його можна змінити.", align: a, valign: v },
    { type: "tip", title: "Один маленький крок", body: "Не треба вирішити все сьогодні. Досить однієї чесної фрази без звинувачення.", align: a, valign: v },
    { type: "tip", title: "Мова, яка зближує", body: "«Я відчуваю… коли… Мені важливо…» — замість ярликів і діагноза партнеру.", align: a, valign: v },
    { type: "cta", title: "Забери собі", body: "Збережи карусель. Якщо відгукнулось — напиши в Direct слово СПОКІЙ.", align: a, valign: v }
  ];
}

function current() {
  return slides[idx];
}

function saveCurrentEdits() {
  if (!hasSlides()) return;
  const s = current();
  s.title = els.slideTitle.innerText.trim();
  s.body = els.slideBody.innerText.trim();
  s.align = s.align || "left";
  s.valign = s.valign || "middle";
}

function applyLook() {
  els.slide.style.backgroundImage = 'url("' + bgPath + '")';
  els.slide.classList.toggle("overlay-dark", els.overlay.value === "dark");
  els.slide.classList.remove("font-serif", "font-sans", "font-display", "size-s", "size-m", "size-l");
  els.slide.classList.add("font-" + els.font.value, "size-" + els.size.value);
}

function applyAlign() {
  const a = hasSlides() ? (current().align || previewAlign) : previewAlign;
  const v = hasSlides() ? (current().valign || previewValign) : previewValign;
  previewAlign = a;
  previewValign = v;

  els.slideInner.classList.remove(
    'align-left', 'align-center', 'align-right',
    'valign-top', 'valign-middle', 'valign-bottom'
  );
  els.slideInner.classList.add('align-' + a, 'valign-' + v);

  // Direct styles so it always wins over leftover CSS
  els.textBlock.style.textAlign = a;
  els.textBlock.style.width = '100%';
  if (a === 'left') els.textBlock.style.alignItems = 'flex-start';
  if (a === 'center') els.textBlock.style.alignItems = 'center';
  if (a === 'right') els.textBlock.style.alignItems = 'flex-end';

  if (v === 'top') els.textBlock.style.alignSelf = 'start';
  if (v === 'middle') els.textBlock.style.alignSelf = 'center';
  if (v === 'bottom') els.textBlock.style.alignSelf = 'end';

  els.slideTitle.style.textAlign = a;
  els.slideBody.style.textAlign = a;
}

function updateAlignButtons() {
  [els.alignLeft, els.alignCenter, els.alignRight].forEach(function (btn) {
    btn.disabled = false;
    btn.classList.toggle('active', btn.dataset.align === previewAlign);
  });
  [els.valignTop, els.valignMiddle, els.valignBottom].forEach(function (btn) {
    btn.disabled = false;
    btn.classList.toggle('active', btn.dataset.valign === previewValign);
  });
}

function setAlign(align) {
  previewAlign = align;
  if (hasSlides()) {
    saveCurrentEdits();
    current().align = align;
  }
  applyAlign();
  updateAlignButtons();
}

function setValign(valign) {
  previewValign = valign;
  if (hasSlides()) {
    saveCurrentEdits();
    current().valign = valign;
  }
  applyAlign();
  updateAlignButtons();
}

function renderBgGrid() {
  els.bgGrid.innerHTML = "";
  BGS.forEach(function (path) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bg-opt" + (path === bgPath ? " active" : "");
    btn.style.backgroundImage = 'url("' + path + '")';
    btn.addEventListener("click", function () {
      bgPath = path;
      renderBgGrid();
      applyLook();
      renderFilmstrip();
    });
    els.bgGrid.appendChild(btn);
    if (!bgImages[path]) {
      const img = new Image();
      img.src = path;
      bgImages[path] = img;
    }
  });
}

function renderDots() {
  els.dots.innerHTML = "";
  slides.forEach(function (_, i) {
    const d = document.createElement("span");
    if (i === idx) d.className = "on";
    d.addEventListener("click", function () {
      if (!hasSlides()) return;
      saveCurrentEdits();
      idx = i;
      render();
    });
    els.dots.appendChild(d);
  });
}

function renderFilmstrip() {
  els.filmstrip.innerHTML = "";
  slides.forEach(function (s, i) {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "thumb" + (i === idx ? " active" : "");
    t.style.backgroundImage = 'url("' + bgPath + '")';
    const lab = document.createElement("div");
    lab.className = "t-label";
    lab.textContent = i + 1 + ". " + s.title;
    t.appendChild(lab);
    t.addEventListener("click", function () {
      saveCurrentEdits();
      idx = i;
      render();
    });
    els.filmstrip.appendChild(t);
  });
}

function render() {
  if (!hasSlides()) {
    els.counter.textContent = "0 / 0";
    els.slideNum.textContent = "0 / 0";
    els.prev.disabled = true;
    els.next.disabled = true;
    els.download.disabled = true;
    els.downloadAll.disabled = true;
    els.filmstrip.innerHTML = "";
    els.dots.innerHTML = "";
    applyAlign();
    updateAlignButtons();
    return;
  }
  const s = current();
  els.slideType.textContent = s.type;
  els.slideNum.textContent = idx + 1 + " / " + slides.length;
  els.slideTitle.innerText = s.title;
  els.slideBody.innerText = s.body;
  els.counter.textContent = idx + 1 + " / " + slides.length;
  els.prev.disabled = idx <= 0;
  els.next.disabled = idx >= slides.length - 1;
  els.download.disabled = false;
  els.downloadAll.disabled = false;
  applyAlign();
  updateAlignButtons();
  renderDots();
  renderFilmstrip();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line ? line + " " + words[n] : words[n];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = words[n];
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

function countLines(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = String(text).split(/\s+/);
  let line = "";
  let lines = 1;
  for (let n = 0; n < words.length; n++) {
    const test = line ? line + " " + words[n] : words[n];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = words[n];
    } else line = test;
  }
  return lines;
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
  const W = 1080;
  const H = 1350;
  const pad = 72;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const img = bgImages[bgPath];
  if (img && img.complete && img.naturalWidth) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#fff7ef";
    ctx.fillRect(0, 0, W, H);
  }

  const dark = els.overlay.value === "dark";
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) {
    grd.addColorStop(0, "rgba(0,0,0,0.35)");
    grd.addColorStop(1, "rgba(0,0,0,0.62)");
  } else {
    grd.addColorStop(0, "rgba(255,255,255,0.35)");
    grd.addColorStop(1, "rgba(255,255,255,0.62)");
  }
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const fg = dark ? "#fafaf9" : "#1c1917";
  const chip = dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.55)";
  const fontMap = {
    serif: "Georgia, serif",
    sans: "Manrope, system-ui, sans-serif",
    display: '"Playfair Display", Georgia, serif'
  };
  const sizeMap = { s: [56, 36, 64], m: [72, 44, 84], l: [88, 52, 96] };
  const fam = fontMap[els.font.value] || fontMap.sans;
  const sz = sizeMap[els.size.value] || sizeMap.m;
  const align = slide.align || "left";
  const valign = slide.valign || "middle";
  const maxW = W - pad * 2;
  const titleLh = sz[2];
  const bodyLh = Math.round(sz[1] * 1.3);
  const gap = 48;

  ctx.fillStyle = chip;
  roundRect(ctx, pad, pad, 200, 52, 26);
  ctx.fill();
  roundRect(ctx, W - pad - 160, pad, 160, 52, 26);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.font = "700 28px " + fam;
  ctx.fillText(String(slide.type).toUpperCase(), pad + 24, pad + 34);
  const num = (slides.indexOf(slide) + 1) + " / " + slides.length;
  ctx.fillText(num, W - pad - 130, pad + 34);

  const titleLines = countLines(ctx, slide.title, maxW, "700 " + sz[0] + "px " + fam);
  const bodyLines = countLines(ctx, slide.body, maxW, sz[1] + "px " + fam);
  const blockH = titleLines * titleLh + gap + bodyLines * bodyLh;

  const topSafe = pad + 90;
  const bottomSafe = H - pad - 40;
  let startY = topSafe + titleLh * 0.85;
  if (valign === "middle") startY = topSafe + (bottomSafe - topSafe - blockH) / 2 + titleLh * 0.85;
  if (valign === "bottom") startY = bottomSafe - blockH + titleLh * 0.85;

  const tx = align === "center" ? W / 2 : align === "right" ? W - pad : pad;
  ctx.textAlign = align;
  ctx.font = "700 " + sz[0] + "px " + fam;
  let y = wrapText(ctx, slide.title, tx, startY, maxW, titleLh);
  ctx.font = sz[1] + "px " + fam;
  wrapText(ctx, slide.body, tx, y + gap, maxW, bodyLh);

  ctx.textAlign = "left";
  ctx.globalAlpha = 0.7;
  ctx.font = "28px " + fam;
  ctx.fillText("SlideForge", pad, H - pad);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
}

els.overlay.addEventListener("change", function () { applyLook(); renderFilmstrip(); });
els.font.addEventListener("change", applyLook);
els.size.addEventListener("change", applyLook);
els.slideTitle.addEventListener("blur", function () { saveCurrentEdits(); renderFilmstrip(); });
els.slideBody.addEventListener("blur", function () { saveCurrentEdits(); renderFilmstrip(); });

els.alignLeft.addEventListener("click", function () { setAlign("left"); });
els.alignCenter.addEventListener("click", function () { setAlign("center"); });
els.alignRight.addEventListener("click", function () { setAlign("right"); });
els.valignTop.addEventListener("click", function () { setValign("top"); });
els.valignMiddle.addEventListener("click", function () { setValign("middle"); });
els.valignBottom.addEventListener("click", function () { setValign("bottom"); });

els.prev.addEventListener("click", function () {
  if (idx > 0) { saveCurrentEdits(); idx -= 1; render(); }
});
els.next.addEventListener("click", function () {
  if (idx < slides.length - 1) { saveCurrentEdits(); idx += 1; render(); }
});

els.generate.addEventListener("click", function () {
  els.error.hidden = true;
  const text = els.input.value.trim();
  if (!text) {
    els.error.textContent = "Введи тему або чернетку.";
    els.error.hidden = false;
    return;
  }
  if (usedCount() >= MAX) {
    els.error.textContent = "Ліміт на сьогодні вичерпано.";
    els.error.hidden = false;
    refreshQuota();
    return;
  }
  slides = buildSlides(text, els.tone.value);
  idx = 0;
  bumpUse();
  refreshQuota();
  applyLook();
  render();
});

els.download.addEventListener("click", function () {
  saveCurrentEdits();
  const a = document.createElement("a");
  a.href = slideToPng(current());
  a.download = "slide-" + (idx + 1) + ".png";
  a.click();
});

els.downloadAll.addEventListener("click", function () {
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
