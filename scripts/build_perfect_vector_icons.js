const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const desktopDir = 'C:\\Users\\юра\\Desktop\\VK_Branding';
fs.mkdirSync(desktopDir, { recursive: true });

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_v_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// =========================================================================
// PERFECT VECTOR MARK (100% mathematically smooth, symmetrical, zero text)
// =========================================================================
function getHeritageMark(domeColor, brushColor, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Central Spire -->
  <path d="M50 7 L53.5 16 L50 25 L46.5 16 Z" fill="${domeColor}"/>
  <rect x="49" y="23" width="2" height="11" rx="0.8" fill="${domeColor}"/>

  <!-- Left Outer Dome Wing -->
  <path d="M48 29 C40 33 33 40 27 50 C20 61 18 73 20 83 C20.5 85 22 86 24 86 L32 86 C33 86 34 85 34 84 C33 75 35 65 40 57 C44 49 47 43 49 39 Z" fill="${domeColor}"/>

  <!-- Right Outer Dome Wing -->
  <path d="M52 29 C60 33 67 40 73 50 C80 61 82 73 80 83 C79.5 85 78 86 76 86 L68 86 C67 86 66 85 66 84 C67 75 65 65 60 57 C56 49 53 43 51 39 Z" fill="${domeColor}"/>

  <!-- Left Inner Dome Flute -->
  <path d="M49 38 C44 44 40 52 38 61 C36 69 36 78 37 86 L44 86 C44.5 86 45 85.5 45 84.8 C44.2 76 45 67 48 58 C49 53 50 48 50 43 Z" fill="${domeColor}"/>

  <!-- Right Inner Dome Flute -->
  <path d="M51 38 C56 44 60 52 62 61 C64 69 64 78 63 86 L56 86 C55.5 86 55 85.5 55 84.8 C55.8 76 55 67 52 58 C51 53 50 48 50 43 Z" fill="${domeColor}"/>

  <!-- Simplified Core Flame Brush -->
  <path d="M50 49 C52.5 55 55.5 60 57 66 C58.5 73 56.5 80 53.5 84 C52.2 86 51 87.5 50 88 C49 87.5 47.8 86 46.5 84 C43.5 80 41.5 73 43 66 C44.5 60 47.5 55 50 49 Z" fill="${brushColor}"/>
  <!-- Inner Highlight Flame -->
  <path d="M50 60 C51.5 65 53 69 52.5 74 C52 79 51 83 50 85.5 C49 83 48 79 47.5 74 C47 69 48.5 65 50 60 Z" fill="${accentColor}"/>
</svg>`;
}

// Monoline Contour Mark (Modern clean Apple-style stroke)
function getMonolineMark(strokeColor, brushColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Spire Finial -->
  <circle cx="50" cy="11" r="3.2" fill="${strokeColor}"/>

  <!-- Outer Dome Contour -->
  <path d="M50 15
           C50 20 38 30 30 43
           C21 57 21 73 25 83
           C25.5 84.5 27 85 29 85
           L71 85
           C73 85 74.5 84.5 75 83
           C79 73 79 57 70 43
           C62 30 50 20 50 15 Z"
        fill="none" stroke="${strokeColor}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Inner Dome Flutes -->
  <path d="M37 85 C37 68 43 52 50 38 C57 52 63 68 63 85"
        fill="none" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Central Flame Core -->
  <path d="M50 50
           C53.5 57 56.5 63 56.5 69
           C56.5 76.5 53.5 82 50 85
           C46.5 82 43.5 76.5 43.5 69
           C43.5 63 46.5 57 50 50 Z"
        fill="${brushColor}" stroke="${brushColor}" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;
}

function makeHtml(svg, bg) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw;
      height: 100vh;
      background: ${bg};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .icon {
      width: 66%;
      height: 66%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="icon">${svg}</div>
</body>
</html>`;
}

function makeBannerHtml(svg, bg, textColor, cardBg = '#FFFFFF') {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: ${bg};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .icon-card {
      width: 210px;
      height: 210px;
      background: ${cardBg};
      border-radius: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
    }
    .icon-card svg { width: 100%; height: 100%; }
    .title {
      color: ${textColor};
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="icon-card">${svg}</div>
  <div class="title">Расписание</div>
</body>
</html>`;
}

// 4 DISTINCT, CAREFULLY CRAFTED COLORWAYS:
const PALETTES = [
  {
    folder: '1_Нежный_Коралл_и_Айвори',
    title: 'Тёплый коралл и айвори (эстетичный, мягкий)',
    bg: '#FAF7F2',
    cardBg: '#FFFFFF',
    textColor: '#2E2825',
    svg: getHeritageMark('#CF5C44', '#E6755E', '#FAF7F2'),
  },
  {
    folder: '2_Сапфир_и_Теплое_Золото',
    title: 'Глубокий сапфир и тёплое золото (контрастный, стильный)',
    bg: '#141C2B',
    cardBg: '#1B263B',
    textColor: '#FFFFFF',
    svg: getHeritageMark('#E8BE74', '#F7D69B', '#141C2B'),
  },
  {
    folder: '3_Изумрудный_Шалфей_на_Белом',
    title: 'Изумрудный шалфей на чистом белом (скандинавский минимализм)',
    bg: '#FFFFFF',
    cardBg: '#F8FAF9',
    textColor: '#1A2E20',
    svg: getHeritageMark('#4F7A5E', '#D96E54', '#FFFFFF'),
  },
  {
    folder: '4_Контурный_Монолайн_Минимум',
    title: 'Минималистичный контурный (тонкие плавные линии)',
    bg: '#FAF9F6',
    cardBg: '#FFFFFF',
    textColor: '#222222',
    svg: getMonolineMark('#2B3830', '#D45A42'),
  },
];

console.log('Rendering 4 clean vector colorways...');

for (const p of PALETTES) {
  const pDir = path.resolve(desktopDir, p.folder);
  fs.mkdirSync(pDir, { recursive: true });

  const html = makeHtml(p.svg, p.bg);
  render(html, path.resolve(pDir, '1_universal_icon_576x576.png'), 576, 576);
  render(html, path.resolve(pDir, '2_catalog_icon_278x278.png'), 278, 278);
  render(html, path.resolve(pDir, '3_small_icon_150x150.png'), 150, 150);
  render(html, path.resolve(pDir, '4_favicon_32x32.png'), 32, 32);

  const bannerHtml = makeBannerHtml(p.svg, p.bg, p.textColor, p.cardBg);
  render(bannerHtml, path.resolve(pDir, '5_big_snippet_1120x630.png'), 1120, 630);

  console.log(`Rendered palette: ${p.folder}`);
}

// Generate an interactive HTML Showcase to view all options side-by-side
const showcaseHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Выбор оформления расписания</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #EEF2F5; margin: 0; padding: 40px; color: #1E293B; }
    h1 { font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 8px; }
    p.lead { text-align: center; color: #64748B; font-size: 16px; margin-bottom: 36px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
    .card { background: #FFFFFF; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; text-align: center; }
    .icon-box { width: 140px; height: 140px; border-radius: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 16px; overflow: hidden; }
    .card h3 { font-size: 18px; margin: 8px 0 4px; }
    .card p { font-size: 13px; color: #64748B; margin: 0 0 16px; }
    .folder-hint { font-size: 12px; font-family: monospace; background: #F1F5F9; padding: 6px 12px; border-radius: 8px; color: #334155; }
  </style>
</head>
<body>
  <h1>Выберите понравившуюся иконку</h1>
  <p class="lead">Все варианты абсолютно ровные, математически симметричные, без текста и лишних надписей</p>
  <div class="grid">
    <div class="card">
      <div class="icon-box" style="background: #FAF7F2;">
        ${PALETTES[0].svg}
      </div>
      <h3>1. Тёплый коралл и айвори</h3>
      <p>Мягкий, нежный, романтичный оттенок</p>
      <div class="folder-hint">Папка: 1_Нежный_Коралл_и_Айвори</div>
    </div>
    <div class="card">
      <div class="icon-box" style="background: #141C2B;">
        ${PALETTES[1].svg}
      </div>
      <h3>2. Сапфир и тёплое золото</h3>
      <p>Стильный, контрастный, благородный</p>
      <div class="folder-hint">Папка: 2_Сапфир_и_Теплое_Золото</div>
    </div>
    <div class="card">
      <div class="icon-box" style="background: #FFFFFF; border: 1px solid #E2E8F0;">
        ${PALETTES[2].svg}
      </div>
      <h3>3. Шалфей на белом</h3>
      <p>Фирменный академический, чистый и свежий</p>
      <div class="folder-hint">Папка: 3_Изумрудный_Шалфей_на_Белом</div>
    </div>
    <div class="card">
      <div class="icon-box" style="background: #FAF9F6; border: 1px solid #E2E8F0;">
        ${PALETTES[3].svg}
      </div>
      <h3>4. Контурный минимал</h3>
      <p>Тонкие современные линии в стиле Apple</p>
      <div class="folder-hint">Папка: 4_Контурный_Монолайн_Минимум</div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.resolve(desktopDir, 'Посмотреть_все_варианты.html'), showcaseHtml, 'utf8');
console.log('Showcase HTML generated!');
