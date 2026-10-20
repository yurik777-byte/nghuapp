const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseDir = 'C:\\Users\\юра\\Desktop\\VK_Branding';
fs.mkdirSync(baseDir, { recursive: true });

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_sim_${Date.now()}_${width}x${height}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`[Exported] ${path.basename(outputPath)} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// ========================================================
// SIMPLIFIED, SLEEK DOME + BRUSH MARK (NO TEXT, PURE ICON)
// ========================================================
function getSimplifiedSvg(domeColor, brushColor, spireColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Top Finial / Spire -->
  <path d="M 50 6 L 53 12 L 50.8 12 L 50.8 20 L 49.2 20 L 49.2 12 L 47 12 Z" fill="${spireColor || domeColor}" />

  <!-- Outer Dome Wings (Left & Right) -->
  <!-- Left Wing -->
  <path d="
    M 48 22
    C 42 28, 26 44, 18 60
    C 11 72, 12 82, 16 88
    L 28 88
    C 26 82, 25 74, 27 66
    C 30 54, 38 42, 48 30
    Z" fill="${domeColor}" />

  <!-- Right Wing -->
  <path d="
    M 52 22
    C 58 28, 74 44, 82 60
    C 89 72, 88 82, 84 88
    L 72 88
    C 74 82, 75 74, 73 66
    C 70 54, 62 42, 52 30
    Z" fill="${domeColor}" />

  <!-- Inner Vault Arches -->
  <!-- Left Inner Arch -->
  <path d="
    M 49 26
    C 44 34, 36 48, 32 62
    C 28 74, 29 82, 31 88
    L 41 88
    C 39 80, 40 70, 44 58
    C 47 48, 48.5 38, 49 32
    Z" fill="${domeColor}" />

  <!-- Right Inner Arch -->
  <path d="
    M 51 26
    C 56 34, 64 48, 68 62
    C 72 74, 71 82, 69 88
    L 59 88
    C 61 80, 60 70, 56 58
    C 53 48, 51.5 38, 51 32
    Z" fill="${domeColor}" />

  <!-- ================= SIMPLIFIED ARTIST BRUSH FLAME ================= -->
  <!-- Central bold, fluid paint brush tip -->
  <path d="
    M 50 30
    C 47 42, 43 56, 43 70
    C 43 81, 46 87, 50 88
    C 54 87, 57 81, 57 70
    C 57 56, 53 42, 50 30
    Z" fill="${brushColor}" />

  <!-- Inner elegant fluid stroke -->
  <path d="
    M 50 40
    C 48.5 48, 47 58, 47 68
    C 47 77, 49 84, 50 86
    C 51 84, 53 77, 53 68
    C 53 58, 51.5 48, 50 40
    Z" fill="${domeColor}" opacity="0.25" />
</svg>`;
}

function makeHtml(svgContent, bgColor) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw;
      height: 100vh;
      background: ${bgColor};
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
    svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div class="icon">
    ${svgContent}
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------------------
// ВАРИАНТ 1: Теплый кораллово-терракотовый (Aesthetic Warm Coral & Cream)
// -------------------------------------------------------------------------
const var1Dir = path.resolve(baseDir, 'Вариант_1_Теплый_Коралл');
fs.mkdirSync(var1Dir, { recursive: true });
const svg1 = getSimplifiedSvg('#C85A3F', '#D96E54', '#C85A3F');
const html1 = makeHtml(svg1, '#FDFBF7');

render(html1, path.resolve(var1Dir, '1_universal_icon_576x576.png'), 576, 576);
render(html1, path.resolve(var1Dir, '2_catalog_icon_278x278.png'), 278, 278);
render(html1, path.resolve(var1Dir, '3_small_icon_150x150.png'), 150, 150);
render(html1, path.resolve(var1Dir, '4_favicon_32x32.png'), 32, 32);

// -------------------------------------------------------------------------
// ВАРИАНТ 2: Глубокий сапфир и золото (Deep Sapphire & Gold)
// -------------------------------------------------------------------------
const var2Dir = path.resolve(baseDir, 'Вариант_2_Сапфир_и_Золото');
fs.mkdirSync(var2Dir, { recursive: true });
const svg2 = getSimplifiedSvg('#E2B36E', '#F5CD8C', '#F5CD8C');
const html2 = makeHtml(svg2, '#141C26');

render(html2, path.resolve(var2Dir, '1_universal_icon_576x576.png'), 576, 576);
render(html2, path.resolve(var2Dir, '2_catalog_icon_278x278.png'), 278, 278);
render(html2, path.resolve(var2Dir, '3_small_icon_150x150.png'), 150, 150);
render(html2, path.resolve(var2Dir, '4_favicon_32x32.png'), 32, 32);

// -------------------------------------------------------------------------
// ВАРИАНТ 3: Чистый минимализм — благородный изумруд / шалфей на белом
// -------------------------------------------------------------------------
const var3Dir = path.resolve(baseDir, 'Вариант_3_Шалфей_на_Белом');
fs.mkdirSync(var3Dir, { recursive: true });
const svg3 = getSimplifiedSvg('#466E53', '#5E8F6D', '#466E53');
const html3 = makeHtml(svg3, '#FFFFFF');

render(html3, path.resolve(var3Dir, '1_universal_icon_576x576.png'), 576, 576);
render(html3, path.resolve(var3Dir, '2_catalog_icon_278x278.png'), 278, 278);
render(html3, path.resolve(var3Dir, '3_small_icon_150x150.png'), 150, 150);
render(html3, path.resolve(var3Dir, '4_favicon_32x32.png'), 32, 32);

console.log('All 3 simplified colorways rendered!');
