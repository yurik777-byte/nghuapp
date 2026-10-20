const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = 'C:\\Users\\юра\\Desktop\\VK_Branding\\Современные_логотипы_НГХУ';
fs.mkdirSync(outputDir, { recursive: true });

function renderPng(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_logo_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`[Generated] ${path.basename(outputPath)} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// =========================================================================
// EXACT OFFICIAL EMBLEM CONTOURS (WITHOUT TYPOGRAPHY, PERFECTLY CENTERED)
// =========================================================================
function getOfficialEmblemSvg(domeColor, bristleColor, bristleGlow) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 0 170 156" width="100%" height="100%">
  <!-- Central Spire Tip -->
  <path fill="${domeColor}" d="M 100 8 L 103.5 15 L 100.8 15 L 100.8 28 L 99.2 28 L 99.2 15 L 96.5 15 Z" />

  <!-- Outer Left Wing -->
  <path fill="${domeColor}" d="
    M 97 32
    C 86 42, 60 62, 38 88
    C 24 105, 23 124, 28 136
    C 31 143, 35 146, 38 147
    L 56 147
    C 54 139, 51 126, 52 112
    C 54 94, 66 76, 84 57
    C 89 52, 94 43, 97 32
    Z" />

  <!-- Outer Right Wing -->
  <path fill="${domeColor}" d="
    M 103 32
    C 114 42, 140 62, 162 88
    C 176 105, 177 124, 172 136
    C 169 143, 165 146, 162 147
    L 144 147
    C 146 139, 149 126, 148 112
    C 146 94, 134 76, 116 57
    C 111 52, 106 43, 103 32
    Z" />

  <!-- Inner Left Arch -->
  <path fill="${domeColor}" d="
    M 98 38
    C 90 48, 77 68, 68 88
    C 60 106, 60 125, 62 147
    L 75 147
    C 74 130, 76 114, 83 97
    C 89 83, 94 67, 98 48
    Z" />

  <!-- Inner Right Arch -->
  <path fill="${domeColor}" d="
    M 102 38
    C 110 48, 123 68, 132 88
    C 140 106, 140 125, 138 147
    L 125 147
    C 126 130, 124 114, 117 97
    C 111 83, 106 67, 102 48
    Z" />

  <!-- Central Vault Arch Frame (Surrounding the brush negative space) -->
  <path fill="${domeColor}" d="
    M 100 35
    C 96 46, 91 62, 86 78
    C 81 94, 79 116, 80 147
    L 88 147
    C 87 122, 89 102, 94 85
    C 97 75, 99 60, 100 48
    C 101 60, 103 75, 106 85
    C 111 102, 113 122, 112 147
    L 120 147
    C 121 116, 119 94, 114 78
    C 109 62, 104 46, 100 35
    Z" />

  <!-- ================= BRUSH BRISTLES (THE ARTIST FLAME) ================= -->
  <g fill="none">
    <!-- Center Spine Bristle -->
    <path d="M 100 147 L 100 68" stroke="${bristleColor}" stroke-width="2.8" stroke-linecap="round" />

    <!-- Left Organic Bristle -->
    <path d="M 92 147 C 91 125, 92 102, 96 82 C 98 74, 99.5 70, 100 66"
          stroke="${bristleColor}" stroke-width="2.4" stroke-linecap="round" />

    <!-- Right Organic Bristle -->
    <path d="M 108 147 C 109 125, 108 102, 104 82 C 102 74, 100.5 70, 100 66"
          stroke="${bristleColor}" stroke-width="2.4" stroke-linecap="round" />

    <!-- Inner Left Fine Hair -->
    <path d="M 96 147 C 95 132, 96 114, 98 96"
          stroke="${bristleGlow || bristleColor}" stroke-width="1.8" stroke-linecap="round" />

    <!-- Inner Right Fine Hair -->
    <path d="M 104 147 C 105 132, 104 114, 102 96"
          stroke="${bristleGlow || bristleColor}" stroke-width="1.8" stroke-linecap="round" />
  </g>
</svg>`;
}

// 5 Color Themes for Modern App Icons
const themes = [
  {
    id: '1_VK_Sapphire',
    title: 'Вариант 1 — Сапфир VK и Тёплый янтарь',
    desc: 'Глубокий синий градиент ВКонтакте, белоснежный архитектурный купол и яркие янтарно-коралловые ворсинки кисти.',
    bg: 'linear-gradient(135deg, #1971F6 0%, #0056C7 100%)',
    domeColor: '#FFFFFF',
    bristleColor: '#FFB03A',
    bristleGlow: '#FFD580',
    cardShadow: '0 12px 32px rgba(0, 86, 199, 0.3)',
  },
  {
    id: '2_Ceramic_White_Indigo',
    title: 'Вариант 2 — Минималистичный белый и Индиго',
    desc: 'Премиальный Apple-стиль на белоснежном фоне, глубокий сапфировый купол и контрастная коралловая кисть.',
    bg: '#FFFFFF',
    domeColor: '#183B7E',
    bristleColor: '#FF5722',
    bristleGlow: '#FF8A65',
    border: '1px solid #EAEAEA',
    cardShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
  },
  {
    id: '3_Dark_Graphite_Neon',
    title: 'Вариант 3 — Тёмный графит и Золотое пламя',
    desc: 'Современный Dark Mode: глубокий ониксовый фон, матовый светлый купол и светящийся золотой ворс кисти.',
    bg: 'linear-gradient(145deg, #1A1D24 0%, #0F1115 100%)',
    domeColor: '#F5F7FA',
    bristleColor: '#FFB703',
    bristleGlow: '#FFD166',
    cardShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  },
  {
    id: '4_Terracotta_Sunset',
    title: 'Вариант 4 — Закатный терракот и Шампанское',
    desc: 'Тёплый художественный терракотово-коралловый градиент в цвет знаменитого кирпича Академии и кисть цвета слоновой кости.',
    bg: 'linear-gradient(135deg, #E2583E 0%, #BA3820 100%)',
    domeColor: '#FFFDF9',
    bristleColor: '#FFD8A8',
    bristleGlow: '#FFF0D4',
    cardShadow: '0 12px 32px rgba(186, 56, 32, 0.35)',
  },
  {
    id: '5_Emerald_Academy_Gold',
    title: 'Вариант 5 — Академический изумруд и Золото',
    desc: 'Элегантный глубокий изумрудно-хвойный градиент с куполом из слоновой кости и благородными золотыми ворсинками.',
    bg: 'linear-gradient(135deg, #1F4E38 0%, #112F22 100%)',
    domeColor: '#F7F5EB',
    bristleColor: '#E9C46A',
    bristleGlow: '#F4A261',
    cardShadow: '0 12px 32px rgba(17, 47, 34, 0.4)',
  },
];

function buildIconHtml(theme, size) {
  const svg = getOfficialEmblemSvg(theme.domeColor, theme.bristleColor, theme.bristleGlow);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw;
      height: 100vh;
      background: ${theme.bg};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .emblem-wrapper {
      width: 68%;
      height: 68%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
    }
  </style>
</head>
<body>
  <div class="emblem-wrapper">
    ${svg}
  </div>
</body>
</html>`;
}

function buildSnippetHtml(theme) {
  const svg = getOfficialEmblemSvg(theme.domeColor, theme.bristleColor, theme.bristleGlow);
  const isLight = theme.bg === '#FFFFFF';
  const textColor = isLight ? '#183B7E' : '#FFFFFF';
  const subtextColor = isLight ? '#5E6E82' : 'rgba(255,255,255,0.75)';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: ${theme.bg};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 90px;
      overflow: hidden;
      position: relative;
    }
    .left-col {
      max-width: 580px;
      z-index: 2;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, ${isLight ? '0.15' : '0.12'});
      border: 1px solid rgba(255, 255, 255, ${isLight ? '0.3' : '0.2'});
      color: ${textColor};
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 46px;
      font-weight: 800;
      color: ${textColor};
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 20px;
      color: ${subtextColor};
      line-height: 1.45;
      font-weight: 400;
    }
    .right-col {
      width: 320px;
      height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 16px 36px rgba(0,0,0,0.25));
      z-index: 2;
    }
  </style>
</head>
<body>
  <div class="left-col">
    <div class="badge">НГУХУ • Расписание</div>
    <h1>Расписание занятий и аудиторий</h1>
    <p>Мгновенный поиск групп, расписание пар, свободные аудитории и педагоги колледжа и академии.</p>
  </div>
  <div class="right-col">
    ${svg}
  </div>
</body>
</html>`;
}

// Generate all themes
for (const theme of themes) {
  const themeDir = path.join(outputDir, theme.id);
  fs.mkdirSync(themeDir, { recursive: true });

  // 1. App Icon 1024x1024 (App Store / VK high-res)
  renderPng(buildIconHtml(theme, 1024), path.join(themeDir, '1_app_icon_1024x1024.png'), 1024, 1024);

  // 2. VK Mini App Icon 512x512
  renderPng(buildIconHtml(theme, 512), path.join(themeDir, '2_vk_icon_512x512.png'), 512, 512);

  // 3. Catalog Banner / Snippet 1120x630
  renderPng(buildSnippetHtml(theme), path.join(themeDir, '3_catalog_banner_1120x630.png'), 1120, 630);
}

// Create an interactive HTML Viewer for the user
const viewerHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Современные варианты логотипа НГУХУ (Без текста, под App Store / VK)</title>
  <style>
    :root {
      --bg: #0E1015;
      --card-bg: #181B22;
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --border: #2D3139;
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
      max-width: 1200px;
      margin: 0 auto 36px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 12px;
      color: #FFFFFF;
    }
    .header p {
      font-size: 16px;
      color: var(--text-muted);
      max-width: 760px;
      margin: 0 auto;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 28px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .card h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #FFFFFF;
    }
    .card .desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 20px;
      flex-grow: 1;
    }
    .preview-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 20px 10px;
      background: rgba(0,0,0,0.25);
      border-radius: 16px;
      margin-bottom: 20px;
    }
    .icon-preview {
      width: 108px;
      height: 108px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .icon-preview img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .phone-mockup {
      width: 74px;
      height: 74px;
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
      border: 1px solid rgba(255,255,255,0.1);
      margin-top: 4px;
    }
    .banner-preview img {
      width: 100%;
      display: block;
    }
    .folder-link {
      display: inline-block;
      margin-top: 14px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
    }
    .folder-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Современные варианты эмблемы НГУХУ</h1>
    <p>Точные исторические контуры эмблемы (купол + кисть с ворсинками), без текстовой надписи, с современными премиальными палитрами для мобильного приложения.</p>
  </div>

  <div class="grid">
    ${themes.map(t => `
      <div class="card">
        <h3>${t.title}</h3>
        <p class="desc">${t.desc}</p>
        <div class="preview-box">
          <div style="text-align: center;">
            <div class="icon-preview">
              <img src="${t.id}/2_vk_icon_512x512.png" alt="Квадратная иконка">
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 6px;">Квадратная (App Icon)</div>
          </div>
          <div style="text-align: center;">
            <div class="phone-mockup">
              <img src="${t.id}/2_vk_icon_512x512.png" alt="Круглый аватар">
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 6px;">Круглый аватар VK</div>
          </div>
        </div>
        <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 6px; font-weight: 600;">Баннер / Обложка каталога (1120×630):</div>
        <div class="banner-preview">
          <img src="${t.id}/3_catalog_banner_1120x630.png" alt="Баннер">
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'Посмотреть_все_новые_варианты.html'), viewerHtml, 'utf8');
console.log('Done! All assets generated in:', outputDir);
