const MAX = 3;
const THEMES = [
  {
    id: "calm",
    name: "Спокій",
    cover: "backgrounds/photo-calm-1.jpg",
    images: [
      "backgrounds/photo-calm-1.jpg", "backgrounds/photo-calm-2.jpg", "backgrounds/photo-calm-3.jpg",
      "backgrounds/photo-calm-4.jpg", "backgrounds/photo-calm-5.jpg", "backgrounds/photo-calm-6.jpg"
    ]
  },
  {
    id: "nature",
    name: "Природа",
    cover: "backgrounds/theme-nature-1.jpg",
    images: [
      "backgrounds/theme-nature-1.jpg", "backgrounds/theme-nature-2.jpg", "backgrounds/theme-nature-3.jpg",
      "backgrounds/theme-nature-4.jpg", "backgrounds/theme-nature-5.jpg", "backgrounds/theme-nature-6.jpg"
    ]
  },
  {
    id: "cozy",
    name: "Затишок",
    cover: "backgrounds/theme-cozy-1.jpg",
    images: [
      "backgrounds/theme-cozy-1.jpg", "backgrounds/theme-cozy-2.jpg", "backgrounds/theme-cozy-3.jpg",
      "backgrounds/theme-cozy-4.jpg", "backgrounds/theme-cozy-5.jpg", "backgrounds/theme-cozy-6.jpg"
    ]
  },
  {
    id: "light",
    name: "Світло",
    cover: "backgrounds/theme-light-1.jpg",
    images: [
      "backgrounds/theme-light-1.jpg", "backgrounds/theme-light-2.jpg", "backgrounds/theme-light-3.jpg",
      "backgrounds/theme-light-4.jpg", "backgrounds/theme-light-5.jpg", "backgrounds/theme-light-6.jpg"
    ]
  },
  {
    id: "warm",
    name: "Теплі градієнти",
    cover: "backgrounds/grad-cream.jpg",
    images: [
      "backgrounds/grad-cream.jpg", "backgrounds/grad-sage.jpg", "backgrounds/grad-lavender.jpg",
      "backgrounds/grad-sand.jpg", "backgrounds/grad-coral.jpg", "backgrounds/grad-rose.jpg"
    ]
  },
  {
    id: "deep",
    name: "Глибокі",
    cover: "backgrounds/grad-night.jpg",
    images: [
      "backgrounds/grad-night.jpg", "backgrounds/grad-ocean.jpg", "backgrounds/grad-forest.jpg",
      "backgrounds/grad-ink.jpg", "backgrounds/grad-sage.jpg", "backgrounds/grad-lavender.jpg"
    ]
  },
  {
    id: "pastel",
    name: "Пастель",
    cover: "backgrounds/soft-peach.jpg",
    images: [
      "backgrounds/soft-peach.jpg", "backgrounds/soft-mint.jpg", "backgrounds/soft-lilac.jpg",
      "backgrounds/soft-butter.jpg", "backgrounds/grad-cream.jpg", "backgrounds/grad-sand.jpg"
    ]
  }
];

const els = {
  input: document.getElementById("input"),
  tone: document.getElementById("tone"),
  ctaWord: document.getElementById("ctaWord"),
  overlay: document.getElementById("overlay"),
  font: document.getElementById("font"),
  size: document.getElementById("size"),
  showTitles: document.getElementById("showTitles"),
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
  postCraftRank: document.getElementById("postCraftRank"),
  postStatus: document.getElementById("postStatus"),
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
let themeId = THEMES[0].id;
const bgImages = {};
let previewAlign = 'left';
let previewValign = 'middle';

function currentTheme() {
  return THEMES.find(function (t) { return t.id === themeId; }) || THEMES[0];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function preloadBg(path) {
  if (!path || bgImages[path]) return;
  const img = new Image();
  img.src = path;
  bgImages[path] = img;
}

function preloadTheme(theme) {
  theme.images.forEach(preloadBg);
}

function assignThemeToSlides(list) {
  const theme = currentTheme();
  preloadTheme(theme);
  const pool = shuffle(theme.images);
  list.forEach(function (s, i) {
    s.bg = pool[i % pool.length];
  });
}

function slideBg(slide) {
  if (slide && slide.bg) return slide.bg;
  return currentTheme().cover;
}

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
  els.quota.textContent = "";
  els.generate.disabled = false;
}
function truncate(s, n) {
  s = String(s || "").trim();
  return s.length <= n ? s : s.slice(0, n - 1).trim() + "…";
}
function hasSlides() {
  return slides.length > 0;
}

function buildSlides(text, toneVal) {
  // Timochko funnel anatomy: pain at journey step → hook → recognition → reframe → obstacle → micro-step → soft CTA (DM word)
  const topic = truncate(text.replace(/\s+/g, " "), 140) || "Твоя тема";
  const a = previewAlign;
  const v = previewValign;
  const word = ((els.ctaWord && els.ctaWord.value) || "СПОКІЙ").trim().toUpperCase() || "СПОКІЙ";
  const soft = toneVal === "direct" ? "direct" : toneVal === "expert" ? "expert" : "warm";

  const hookTitle =
    soft === "direct" ? "Стоп. Це не дрібниця." :
    soft === "expert" ? "Патерн, який дорого коштує" :
    "Якщо впізнаєш себе — дочитай";

  const step =
    soft === "direct"
      ? "Перед відповіддю одне питання: я хочу бути правим чи бути поруч?"
      : soft === "expert"
        ? "Назви вголос потребу під реакцією: повага, близькість, безпека, відпочинок."
        : "Пауза 10 секунд. Спочатку «я з тобою», потім тема конфлікту.";

  const phrase =
    soft === "direct"
      ? "Замість «ти завжди…»: «Мені зараз важко. Я відчуваю… Мені потрібно…»"
      : soft === "expert"
        ? "Формула: факт → почуття → потреба → прохання. Без діагноза партнеру."
        : "Спробуй: «Коли так відбувається, я відчуваю… Мені важливо…»";

  return [
    { type: "hook", title: hookTitle, body: topic, align: a, valign: v },
    { type: "pain", title: "Де це чіпляє", body: "За " + topic.toLowerCase() + " часто стоїть не «поганий характер», а втома бути непоміченою / контрольованою / самотньою поруч.", align: a, valign: v },
    { type: "shift", title: "Зсув погляду", body: "Контент-воронка працює так: спочатку впізнавання болю, потім сенс, і лише потім дія. Не мораль — дзеркало.", align: a, valign: v },
    { type: "block", title: "Що блокує", body: "Ми йдемо в правоту, сарказм або мовчанку. Коло замикається: дрібниця → удар → дистанція → нова дрібниця.", align: a, valign: v },
    { type: "step", title: "Один крок шляху", body: step + " " + phrase, align: a, valign: v },
    { type: "cta", title: "Наступний крок воронки", body: "Збережи. Якщо відгукнулось — напиши в Direct слово " + word + " і забери короткий гайд / запис на розбір.", align: a, valign: v }
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
  const path = hasSlides() ? slideBg(current()) : currentTheme().cover;
  preloadBg(path);
  els.slide.style.backgroundImage = 'url("' + path + '")';
  els.slide.classList.toggle("overlay-dark", els.overlay.value === "dark");
  els.slide.classList.remove("font-serif", "font-sans", "font-display", "size-s", "size-m", "size-l");
  els.slide.classList.add("font-" + els.font.value, "size-" + els.size.value);
  applyTitles();
}

function titlesOn() {
  return !els.showTitles || els.showTitles.checked;
}

function applyTitles() {
  const on = titlesOn();
  els.slideTitle.hidden = !on;
  els.slideTitle.style.display = on ? "" : "none";
  els.slide.classList.toggle("no-titles", !on);
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
  THEMES.forEach(function (theme) {
    preloadTheme(theme);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-opt" + (theme.id === themeId ? " active" : "");
    btn.title = theme.name + " — різне фото на кожен слайд";
    const cover = document.createElement("span");
    cover.className = "theme-cover";
    cover.style.backgroundImage = 'url("' + theme.cover + '")';
    const label = document.createElement("span");
    label.className = "theme-name";
    label.textContent = theme.name;
    const meta = document.createElement("span");
    meta.className = "theme-meta";
    meta.textContent = theme.images.length + " фото";
    btn.appendChild(cover);
    btn.appendChild(label);
    btn.appendChild(meta);
    btn.addEventListener("click", function () {
      themeId = theme.id;
      if (hasSlides()) {
        saveCurrentEdits();
        assignThemeToSlides(slides);
      }
      renderBgGrid();
      applyLook();
      render();
    });
    els.bgGrid.appendChild(btn);
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
    t.style.backgroundImage = 'url("' + slideBg(s) + '")';
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
    if (els.postCraftRank) els.postCraftRank.disabled = true;
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
  if (els.postCraftRank) els.postCraftRank.disabled = false;
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

  const img = bgImages[slideBg(slide)];
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

  const showTitle = titlesOn() && String(slide.title || "").trim();
  const titleLines = showTitle ? countLines(ctx, slide.title, maxW, "700 " + sz[0] + "px " + fam) : 0;
  const bodyLines = countLines(ctx, slide.body, maxW, sz[1] + "px " + fam);
  const titleGap = showTitle ? gap : 0;
  const blockH = titleLines * titleLh + titleGap + bodyLines * bodyLh;
  const lead = showTitle ? titleLh * 0.85 : bodyLh * 0.85;

  const topSafe = pad + 90;
  const bottomSafe = H - pad - 40;
  let startY = topSafe + lead;
  if (valign === "middle") startY = topSafe + (bottomSafe - topSafe - blockH) / 2 + lead;
  if (valign === "bottom") startY = bottomSafe - blockH + lead;

  const tx = align === "center" ? W / 2 : align === "right" ? W - pad : pad;
  ctx.textAlign = align;
  let y = startY;
  if (showTitle) {
    ctx.font = "700 " + sz[0] + "px " + fam;
    y = wrapText(ctx, slide.title, tx, startY, maxW, titleLh);
    y = y + gap;
  }
  ctx.font = sz[1] + "px " + fam;
  wrapText(ctx, slide.body, tx, y, maxW, bodyLh);

  ctx.textAlign = "left";
  ctx.globalAlpha = 0.7;
  ctx.font = "28px " + fam;
  ctx.fillText("SlideForge", pad, H - pad);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
}

els.overlay.addEventListener("change", function () { applyLook(); renderFilmstrip(); });
if (els.showTitles) {
  const saved = localStorage.getItem("sf-show-titles");
  if (saved === "0") els.showTitles.checked = false;
  if (saved === "1") els.showTitles.checked = true;
  els.showTitles.addEventListener("change", function () {
    localStorage.setItem("sf-show-titles", els.showTitles.checked ? "1" : "0");
    applyTitles();
  });
}
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
  slides = buildSlides(text, els.tone.value);
  assignThemeToSlides(slides);
  idx = 0;
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

if (els.postCraftRank) els.postCraftRank.addEventListener("click", function () { postViaCraftRank(); });

els.downloadAll.addEventListener("click", function () {
  saveCurrentEdits();
  slides.forEach(function (s, i) {
    const a = document.createElement("a");
    a.href = slideToPng(s);
    a.download = "slide-" + (i + 1) + ".png";
    setTimeout(function () { a.click(); }, i * 250);
  });
});


function apiBase() {
  // Same-origin on craftrank.app; on GitHub Pages there is no cookie session.
  if (location.hostname.endsWith("craftrank.app")) return "/api";
  return null;
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)[1];
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function postViaCraftRank() {
  const status = els.postStatus;
  const base = apiBase();
  if (!base) {
    status.textContent = "Постинг працює на https://craftrank.app/carousel/ (потрібен логін CraftRank). З github.io лише скачування PNG.";
    return;
  }
  if (!hasSlides()) return;
  saveCurrentEdits();
  els.postCraftRank.disabled = true;
  status.textContent = "Рендер PNG…";
  try {
    const files = slides.map(function (s, i) {
      const blob = dataUrlToBlob(slideToPng(s));
      return new File([blob], "slide-" + (i + 1) + ".png", { type: "image/png" });
    });
    status.textContent = "Завантаження в CraftRank…";
    const form = new FormData();
    files.forEach(function (f) { form.append("file", f, f.name); });
    const up = await fetch(base + "/media", { method: "POST", body: form, credentials: "include" });
    if (up.status === 401 || up.status === 403) {
      status.textContent = "Спочатку увійди в CraftRank, потім натисни знову.";
      window.open("https://craftrank.app/", "_blank");
      return;
    }
    if (!up.ok) throw new Error("upload " + up.status);
    const upJson = await up.json();
    const media = (upJson.media || []).map(function (m) { return m.url; });
    if (!media.length) throw new Error("no media urls");

    const word = ((els.ctaWord && els.ctaWord.value) || "СІМʼЯ").trim();
    const caption = (els.input.value.trim() || "Карусель") + "\n\nНапиши в Direct: " + word;
    status.textContent = "Створюю Instagram draft…";
    const draft = await fetch(base + "/schedule/drafts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: caption, platforms: ["instagram"], media: media })
    });
    if (!draft.ok) throw new Error("draft " + draft.status + " " + (await draft.text()));
    status.textContent = "Готово: draft у CraftRank. Відкрий календар/чернетки й опублікуй.";
    window.open("https://craftrank.app/", "_blank");
  } catch (e) {
    status.textContent = "Помилка: " + (e && e.message ? e.message : e);
  } finally {
    els.postCraftRank.disabled = !hasSlides();
  }
}


renderBgGrid();
refreshQuota();
applyLook();
render();
