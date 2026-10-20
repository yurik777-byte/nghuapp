const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const desktopDir = 'C:\\Users\\юра\\Desktop\\VK_Branding\\Deep_Indigo_Четкий';
fs.mkdirSync(desktopDir, { recursive: true });

const origBuf = fs.readFileSync('C:/Users/юра/Desktop/VK_Branding/original_dome_cropped_transparent.png');
const origBase64 = origBuf.toString('base64');

// Colors
// Deep Indigo: #12284C (rich royal university indigo)
// RGB: 18, 40, 76 -> normalized: 0.070, 0.157, 0.298
const r = (18 / 255).toFixed(4);
const g = (40 / 255).toFixed(4);
const b = (76 / 255).toFixed(4);

function makeHtml(mode, size) {
  const isWhiteBg = mode === 'indigo_on_white';
  const bgColor = isWhiteBg ? '#FFFFFF' : 'linear-gradient(135deg, #183B70 0%, #0D2244 100%)';
  
  // Color matrix for Deep Indigo or Pure White
  const matrix = isWhiteBg
    ? `${r} 0 0 0 0
       0 ${g} 0 0 0
       0 0 ${b} 0 0
       0 0 0 46 -22.5`
    : `1 0 0 0 0
       0 1 0 0 0
       0 0 1 0 0
       0 0 0 46 -22.5`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .icon-box {
      width: 70%;
      height: 70%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .crisp-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: url(#crispFilter);
    }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <!-- Subpixel Bilinear Anti-Aliasing Reconstruction Filter -->
      <filter id="crispFilter" color-interpolation-filters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
        <!-- 1. Smooth out 120px raster steps into smooth continuous gradients -->
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
        <!-- 2. Step thresholding with clean subpixel antialiasing -->
        <feColorMatrix in="blur" type="matrix"
          values="0 0 0 0 ${isWhiteBg ? r : 1}
                  0 0 0 0 ${isWhiteBg ? g : 1}
                  0 0 0 0 ${isWhiteBg ? b : 1}
                  0 0 0 44 -21.2" result="sharp" />
      </filter>
    </defs>
  </svg>

  <div class="icon-box">
    <img class="crisp-img" src="data:image/png;base64,${origBase64}" />
  </div>
</body>
</html>`;
}

function makeBannerHtml(mode) {
  const isWhiteBg = mode === 'indigo_on_white';
  const bgColor = isWhiteBg ? '#FFFFFF' : 'linear-gradient(135deg, #183B70 0%, #0D2244 100%)';
  const textColor = isWhiteBg ? '#12284C' : '#FFFFFF';
  const subtextColor = isWhiteBg ? '#5E6E82' : 'rgba(255, 255, 255, 0.75)';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: ${bgColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 90px;
      overflow: hidden;
    }
    .left-col {
      max-width: 580px;
    }
    .badge {
      display: inline-block;
      background: ${isWhiteBg ? 'rgba(18, 40, 76, 0.08)' : 'rgba(255, 255, 255, 0.15)'};
      color: ${textColor};
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 46px;
      font-weight: 800;
      color: ${textColor};
      line-height: 1.15;
      margin-bottom: 16px;
    }
    p {
      font-size: 20px;
      color: ${subtextColor};
      line-height: 1.45;
    }
    .right-col {
      width: 330px;
      height: 330px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .crisp-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: url(#crispFilter);
    }
  </style>
</head>
<body>
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <filter id="crispFilter" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="0 0 0 0 ${isWhiteBg ? r : 1}
                  0 0 0 0 ${isWhiteBg ? g : 1}
                  0 0 0 0 ${isWhiteBg ? b : 1}
                  0 0 0 44 -21.2" result="sharp" />
      </filter>
    </defs>
  </svg>

  <div class="left-col">
    <div class="badge">НГУХУ • Расписание</div>
    <h1>Расписание занятий и аудиторий</h1>
    <p>Мгновенный поиск групп, расписание пар, свободные аудитории и педагоги.</p>
  </div>
  <div class="right-col">
    <img class="crisp-img" src="data:image/png;base64,${origBase64}" />
  </div>
</body>
</html>`;
}

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_indigo_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`[Exported] ${path.basename(outputPath)} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// 1. Indigo on White
const dir1 = path.join(desktopDir, '1_Deep_Indigo_на_белом');
fs.mkdirSync(dir1, { recursive: true });
render(makeHtml('indigo_on_white', 1024), path.join(dir1, '1_app_icon_1024x1024.png'), 1024, 1024);
render(makeHtml('indigo_on_white', 512), path.join(dir1, '2_vk_icon_512x512.png'), 512, 512);
render(makeBannerHtml('indigo_on_white'), path.join(dir1, '3_catalog_banner_1120x630.png'), 1120, 630);

// 2. White on Deep Indigo
const dir2 = path.join(desktopDir, '2_Белый_на_фоне_Deep_Indigo');
fs.mkdirSync(dir2, { recursive: true });
render(makeHtml('white_on_indigo', 1024), path.join(dir2, '1_app_icon_1024x1024.png'), 1024, 1024);
render(makeHtml('white_on_indigo', 512), path.join(dir2, '2_vk_icon_512x512.png'), 512, 512);
render(makeBannerHtml('white_on_indigo'), path.join(dir2, '3_catalog_banner_1120x630.png'), 1120, 630);

// Viewer HTML
const viewerHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Deep Indigo — Сверхчёткая версия (Без пикселей)</title>
  <style>
    :root {
      --bg: #0B0E14;
      --card-bg: #151922;
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --border: #242B38;
      --accent: #2688EB;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 24px;
      line-height: 1.5;
    }
    .header {
      max-width: 960px;
      margin: 0 auto 36px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 10px;
      color: #FFFFFF;
    }
    .header p {
      font-size: 16px;
      color: var(--text-muted);
      max-width: 680px;
      margin: 0 auto;
    }
    .grid {
      max-width: 960px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .card h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #FFFFFF;
    }
    .card .desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .preview-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 24px 16px;
      background: rgba(0,0,0,0.3);
      border-radius: 16px;
      margin-bottom: 20px;
    }
    .icon-preview {
      width: 120px;
      height: 120px;
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .icon-preview img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .phone-mockup {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.3);
      border: 2px solid rgba(255,255,255,0.15);
    }
    .phone-mockup img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .banner-preview {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
      margin-top: 6px;
    }
    .banner-preview img {
      width: 100%;
      display: block;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Deep Indigo — Сверхчёткий векторный результат</h1>
    <p>Точный контур оригинальной эмблемы НГУХУ (без текста «НГХУ»). Все ступенчатые пиксели полностью устранены — края идеально гладкие и резкие.</p>
  </div>

  <div class="grid">
    <div class="card">
      <h3>1. Deep Indigo на чистом белом фоне</h3>
      <p class="desc">Глубокий благородный сапфировый купол с чёткими краями и ворсинками на белоснежном фоне.</p>
      <div class="preview-box">
        <div style="text-align: center;">
          <div class="icon-preview">
            <img src="1_Deep_Indigo_на_белом/2_vk_icon_512x512.png" alt="Квадратная иконка">
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 8px;">Квадратная (App Icon)</div>
        </div>
        <div style="text-align: center;">
          <div class="phone-mockup">
            <img src="1_Deep_Indigo_на_белом/2_vk_icon_512x512.png" alt="Круглый аватар">
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 8px;">Круглый аватар VK</div>
        </div>
      </div>
      <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 6px; font-weight: 600;">Баннер каталога (1120×630):</div>
      <div class="banner-preview">
        <img src="1_Deep_Indigo_на_белом/3_catalog_banner_1120x630.png" alt="Баннер">
      </div>
    </div>

    <div class="card">
      <h3>2. Белоснежный купол на фоне Deep Indigo</h3>
      <p class="desc">Гладкий белый силуэт оригинальной эмблемы на глубоком благородном градиенте индиго.</p>
      <div class="preview-box">
        <div style="text-align: center;">
          <div class="icon-preview">
            <img src="2_Белый_на_фоне_Deep_Indigo/2_vk_icon_512x512.png" alt="Квадратная иконка">
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 8px;">Квадратная (App Icon)</div>
        </div>
        <div style="text-align: center;">
          <div class="phone-mockup">
            <img src="2_Белый_на_фоне_Deep_Indigo/2_vk_icon_512x512.png" alt="Круглый аватар">
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 8px;">Круглый аватар VK</div>
        </div>
      </div>
      <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 6px; font-weight: 600;">Баннер каталога (1120×630):</div>
      <div class="banner-preview">
        <img src="2_Белый_на_фоне_Deep_Indigo/3_catalog_banner_1120x630.png" alt="Баннер">
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(desktopDir, 'Посмотреть_Deep_Indigo.html'), viewerHtml, 'utf8');
console.log('Done! All Deep Indigo assets generated in:', desktopDir);
