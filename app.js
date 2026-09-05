const MAX = 3;
const input = document.getElementById("input");
const tone = document.getElementById("tone");
const theme = document.getElementById("theme");
const generateBtn = document.getElementById("generate");
const quotaEl = document.getElementById("quota");
const errorEl = document.getElementById("error");
const slideEl = document.getElementById("slide");
const slideType = document.getElementById("slideType");
const slideTitle = document.getElementById("slideTitle");
const slideBody = document.getElementById("slideBody");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const counter = document.getElementById("counter");
const downloadBtn = document.getElementById("download");
const downloadAllBtn = document.getElementById("downloadAll");

let slides = [];
let idx = 0;

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
  quotaEl.textContent = "Залишилось сьогодні: " + left + "/" + MAX;
  generateBtn.disabled = left <= 0;
}

function truncate(s, n) {
  s = (s || "").trim();
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trim() + "…";
}

function buildSlides(text, toneVal) {
  const topic = truncate(text.replace(/\s+/g, " "), 120) || "Твоя тема";
  const tipOpen =
    toneVal === "direct"
      ? "Коротко:"
      : toneVal === "expert"
        ? "З практики:"
        : "Мʼяко кажучи:";
  return [
    { type: "hook", title: "Стоп. Це важливо.", body: topic },
    {
      type: "myth",
      title: "Міф, який шкодить",
      body: "Порада «просто відпусти» часто ігнорує нервову систему. Тривога — не лінь і не слабкість."
    },
    {
      type: "tip",
      title: tipOpen + " тіло спочатку",
      body: "Ноги на підлогу. Видих довше за вдих. Назви 5 речей, які бачиш. Потім думки."
    },
    {
      type: "tip",
      title: "Один маленький крок",
      body: "Не треба «стати спокійним». Досить зменшити інтенсивність на 10% і дати собі опору."
    },
    {
      type: "tip",
      title: "Мова до себе",
      body: "Замість «знову я» спробуй: «зараз мені важко — і це можна витримати з підтримкою»."
    },
    {
      type: "cta",
      title: "Забери собі",
      body: "Збережи карусель. Якщо відгукнулось — напиши в Direct слово СПОКІЙ або запишися на сесію."
    }
  ];
}

function render() {
  if (!slides.length) {
    counter.textContent = "0 / 0";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    downloadBtn.disabled = true;
    downloadAllBtn.disabled = true;
    return;
  }
  const s = slides[idx];
  slideType.textContent = s.type;
  slideTitle.textContent = s.title;
  slideBody.textContent = s.body;
  counter.textContent = idx + 1 + " / " + slides.length;
  prevBtn.disabled = idx <= 0;
  nextBtn.disabled = idx >= slides.length - 1;
  downloadBtn.disabled = false;
  downloadAllBtn.disabled = false;
}

function applyTheme() {
  slideEl.className = "slide theme-" + theme.value;
}

function themeColors(name) {
  if (name === "dark") return { bg: "#17141f", fg: "#f5f0e8", badge: "rgba(255,255,255,0.12)" };
  if (name === "accent") return { bg: "#c45c26", fg: "#ffffff", badge: "rgba(255,255,255,0.2)" };
  return { bg: "#fff7ef", fg: "#1a1a1a", badge: "rgba(0,0,0,0.08)" };
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, yy);
  return yy;
}

function slideToPng(slide, themeName) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const c = themeColors(themeName);
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c.badge;
  roundRect(ctx, 72, 72, 180, 48, 24);
  ctx.fill();
  ctx.fillStyle = c.fg;
  ctx.font = "28px Georgia, serif";
  ctx.fillText(String(slide.type).toUpperCase(), 92, 105);
  ctx.font = "bold 72px Georgia, serif";
  let y = wrapText(ctx, slide.title, 72, 220, W - 144, 84);
  ctx.font = "44px Georgia, serif";
  wrapText(ctx, slide.body, 72, y + 80, W - 144, 58);
  ctx.globalAlpha = 0.55;
  ctx.font = "28px Georgia, serif";
  ctx.fillText("SlideForge", 72, H - 72);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/png");
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

theme.addEventListener("change", applyTheme);
prevBtn.addEventListener("click", function () {
  if (idx > 0) {
    idx -= 1;
    render();
  }
});
nextBtn.addEventListener("click", function () {
  if (idx < slides.length - 1) {
    idx += 1;
    render();
  }
});

generateBtn.addEventListener("click", function () {
  errorEl.hidden = true;
  const text = input.value.trim();
  if (!text) {
    errorEl.textContent = "Введи тему або чернетку.";
    errorEl.hidden = false;
    return;
  }
  if (usedCount() >= MAX) {
    errorEl.textContent = "Ліміт на сьогодні вичерпано.";
    errorEl.hidden = false;
    refreshQuota();
    return;
  }
  slides = buildSlides(text, tone.value);
  idx = 0;
  bumpUse();
  refreshQuota();
  applyTheme();
  render();
});

downloadBtn.addEventListener("click", function () {
  const url = slideToPng(slides[idx], theme.value);
  const a = document.createElement("a");
  a.href = url;
  a.download = "slide-" + (idx + 1) + ".png";
  a.click();
});

downloadAllBtn.addEventListener("click", function () {
  slides.forEach(function (s, i) {
    const url = slideToPng(s, theme.value);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slide-" + (i + 1) + ".png";
    setTimeout(function () {
      a.click();
    }, i * 250);
  });
});

refreshQuota();
applyTheme();
render();
