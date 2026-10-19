const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve('C:\\Users\\юра\\Desktop\\VK_Branding');
fs.mkdirSync(outDir, { recursive: true });

// Vector mark without text
const svgMark = fs.readFileSync(path.resolve(process.cwd(), 'design/logos/nghu_authentic_mark.svg'), 'utf8');

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_min_${Date.now()}_${width}x${height}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`[Created] ${path.basename(outputPath)} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// ==========================================
// 1. ИКОНКИ (576, 278, 150, 32)
// Максимально простые, чистые, аккуратные
// ==========================================

function makeIcon(size, innerSize = 65, bg = '#FFFFFF') {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .icon {
      width: ${innerSize}%;
      height: ${innerSize}%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="icon">
    ${svgMark}
  </div>
</body>
</html>`;
}

// Белый чистый вариант
render(makeIcon(576, 68, '#FFFFFF'), path.resolve(outDir, '1_universal_icon_576x576.png'), 576, 576);
render(makeIcon(278, 68, '#FFFFFF'), path.resolve(outDir, '2_catalog_icon_278x278.png'), 278, 278);
render(makeIcon(150, 72, '#FFFFFF'), path.resolve(outDir, '3_small_icon_150x150.png'), 150, 150);
render(makeIcon(32, 85, '#FFFFFF'), path.resolve(outDir, '4_favicon_32x32.png'), 32, 32);

// ==========================================
// 2. БОЛЬШОЙ СНИППЕТ (1120x630)
// Просто спокойный красивый фон и логотип по центру. Никаких описаний.
// ==========================================

const darkBannerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #1C2321;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .emblem-card {
      width: 220px;
      height: 220px;
      background: #FFFFFF;
      border-radius: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
    }
    .emblem-card svg {
      width: 100%;
      height: 100%;
    }
    .title {
      color: #FFFFFF;
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="emblem-card">
    ${svgMark}
  </div>
  <div class="title">Расписание</div>
</body>
</html>`;

render(darkBannerHtml, path.resolve(outDir, '5_big_snippet_1120x630.png'), 1120, 630);

// Светлый минималистичный вариант сниппета (на выбор)
const lightBannerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #F5F4F0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .emblem-card {
      width: 220px;
      height: 220px;
      background: #FFFFFF;
      border-radius: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
      border: 1px solid #EAE8E0;
    }
    .emblem-card svg {
      width: 100%;
      height: 100%;
    }
    .title {
      color: #202422;
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="emblem-card">
    ${svgMark}
  </div>
  <div class="title">Расписание</div>
</body>
</html>`;

render(lightBannerHtml, path.resolve(outDir, '5_big_snippet_light_1120x630.png'), 1120, 630);

console.log('Minimal human branding ready on Desktop!');
