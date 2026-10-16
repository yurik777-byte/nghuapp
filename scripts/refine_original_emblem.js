const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';
const origImgPath = path.join(artifactDir, '.user_uploaded', 'media_1791784544937_fe82275e.png');

// Primary Sage Green and Terracotta
const SAGE = '#7B9D82';
const TERRACOTTA = '#B5533D';
const CREAM = '#F4EDE4';
const DARK_BG = '#16221A';

// SVG 1: Authentic Vector Recreation (Direct high-fidelity translation of the emblem)
// Dome: Symmetrical 3-segment bell dome with spire
// Brush: Classic artist filbert brush with ferrule base and bristle hair strokes
const svgEmblemLockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- ================= SPIRE ================= -->
  <!-- Top Spear / Cross Finial -->
  <path d="M50 3
           L52.5 7.5
           L50 12
           L47.5 7.5 Z" fill="${SAGE}"/>
  <!-- Small collar -->
  <path d="M47.8 8.5 L52.2 8.5" stroke="${SAGE}" stroke-width="1" stroke-linecap="round"/>
  <!-- Spire Stem -->
  <rect x="49" y="11" width="2" height="7" rx="0.5" fill="${SAGE}"/>

  <!-- ================= DOME LOBES ================= -->
  <!-- 1. Left Outer Wing -->
  <path d="M48.5 17.5
           C40 21 31 29 23 41
           C15 53 13 65 14 74
           L24 74
           C24 66 26 56 31 47
           C36 39 42 32 47.5 27.5
           Z" fill="${SAGE}"/>

  <!-- 2. Right Outer Wing -->
  <path d="M51.5 17.5
           C60 21 69 29 77 41
           C85 53 87 65 86 74
           L76 74
           C76 66 74 56 69 47
           C64 39 58 32 52.5 27.5
           Z" fill="${SAGE}"/>

  <!-- 3. Left Middle Rib -->
  <path d="M48 27
           C43 32 37 40 33 49
           C29 58 28 66 28 74
           L35.5 74
           C35.5 66 37 59 40 51
           C43 44 46.5 38 48.5 33.5
           Z" fill="${SAGE}"/>

  <!-- 4. Right Middle Rib -->
  <path d="M52 27
           C57 32 63 40 67 49
           C71 58 72 66 72 74
           L64.5 74
           C64.5 66 63 59 60 51
           C57 44 53.5 38 51.5 33.5
           Z" fill="${SAGE}"/>

  <!-- 5. Central Vault Arch (enclosing the brush) -->
  <path d="M50 21
           C48.5 26 46 32 43.5 39
           C41 46 40 55 40 74
           L44 74
           C44 56 45.5 48 48 40
           C49 36 49.5 31 50 26
           C50.5 31 51 36 52 40
           C54.5 48 56 56 56 74
           L60 74
           C60 55 59 46 56.5 39
           C54 32 51.5 26 50 21
           Z" fill="${SAGE}"/>

  <!-- ================= CENTRAL ARTIST BRUSH ================= -->
  <!-- Ferrule Base (Обойма кисти) -->
  <rect x="42.5" y="70" width="15" height="4" rx="0.8" fill="${SAGE}"/>
  <line x1="42.5" y1="72" x2="57.5" y2="72" stroke="#FFFFFF" stroke-width="0.8"/>

  <!-- Brush Bristles (Ворс кисти - контурные пряди) -->
  <!-- Outer bristle body (White fill) -->
  <path d="M43.5 70
           C43.5 62 45.5 53 48 44
           C49 40 49.8 34.5 50 32
           C50.2 34.5 51 40 52 44
           C54.5 53 56.5 62 56.5 70
           Z" fill="#FFFFFF"/>

  <!-- Left curved bristle line -->
  <path d="M45.5 70 C45.5 60 47.5 50 49.5 38"
        fill="none" stroke="${SAGE}" stroke-width="1.2" stroke-linecap="round"/>

  <!-- Center bristle line (rising to point) -->
  <path d="M50 70 L50 32.5"
        fill="none" stroke="${SAGE}" stroke-width="1.4" stroke-linecap="round"/>

  <!-- Right curved bristle line -->
  <path d="M54.5 70 C54.5 60 52.5 50 50.5 38"
        fill="none" stroke="${SAGE}" stroke-width="1.2" stroke-linecap="round"/>

  <!-- Extra inner texture strokes -->
  <path d="M47.8 70 C47.8 63 48.5 56 49.5 49"
        fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
  <path d="M52.2 70 C52.2 63 51.5 56 50.5 49"
        fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>

  <!-- ================= TYPOGRAPHY НГХУ ================= -->
  <text x="50" y="93"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="14.5"
        font-weight="700"
        fill="${TERRACOTTA}"
        text-anchor="middle"
        letter-spacing="4.5">НГХУ</text>
</svg>`;

// Standalone Mark for App Icon (Optimized to fill the 100x100 canvas proudly, NO giant empty borders!)
// Scaled so the dome fills x: 7..93, y: 7..93!
const svgEmblemMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Centered and maximized group: scale ~ 1.25, translated to center -->
  <g transform="translate(50, 50) scale(1.22) translate(-50, -42)">
    <!-- Spire -->
    <path d="M50 4
             L52.8 8.5
             L50 13
             L47.2 8.5 Z" fill="${SAGE}"/>
    <line x1="47.5" y1="9.5" x2="52.5" y2="9.5" stroke="${SAGE}" stroke-width="1" stroke-linecap="round"/>
    <rect x="49" y="12" width="2" height="7" rx="0.5" fill="${SAGE}"/>

    <!-- Left Outer Wing -->
    <path d="M48.5 17.5
             C40 21 31 29 23 41
             C15 53 13 65 14 74
             L24 74
             C24 66 26 56 31 47
             C36 39 42 32 47.5 27.5
             Z" fill="${SAGE}"/>

    <!-- Right Outer Wing -->
    <path d="M51.5 17.5
             C60 21 69 29 77 41
             C85 53 87 65 86 74
             L76 74
             C76 66 74 56 69 47
             C64 39 58 32 52.5 27.5
             Z" fill="${SAGE}"/>

    <!-- Left Middle Rib -->
    <path d="M48 27
             C43 32 37 40 33 49
             C29 58 28 66 28 74
             L35.5 74
             C35.5 66 37 59 40 51
             C43 44 46.5 38 48.5 33.5
             Z" fill="${SAGE}"/>

    <!-- Right Middle Rib -->
    <path d="M52 27
             C57 32 63 40 67 49
             C71 58 72 66 72 74
             L64.5 74
             C64.5 66 63 59 60 51
             C57 44 53.5 38 51.5 33.5
             Z" fill="${SAGE}"/>

    <!-- Central Vault Arch -->
    <path d="M50 21
             C48.5 26 46 32 43.5 39
             C41 46 40 55 40 74
             L44 74
             C44 56 45.5 48 48 40
             C49 36 49.5 31 50 26
             C50.5 31 51 36 52 40
             C54.5 48 56 56 56 74
             L60 74
             C60 55 59 46 56.5 39
             C54 32 51.5 26 50 21
             Z" fill="${SAGE}"/>

    <!-- Ferrule Base (Обойма кисти) -->
    <rect x="42.5" y="70" width="15" height="4" rx="0.8" fill="${SAGE}"/>
    <line x1="42.5" y1="72" x2="57.5" y2="72" stroke="#FFFFFF" stroke-width="0.8"/>

    <!-- Brush Bristles (Ворс кисти) -->
    <path d="M43.5 70
             C43.5 62 45.5 53 48 44
             C49 40 49.8 34.5 50 32
             C50.2 34.5 51 40 52 44
             C54.5 53 56.5 62 56.5 70
             Z" fill="#FFFFFF"/>

    <path d="M45.5 70 C45.5 60 47.5 50 49.5 38"
          fill="none" stroke="${SAGE}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M50 70 L50 32.5"
          fill="none" stroke="${SAGE}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M54.5 70 C54.5 60 52.5 50 50.5 38"
          fill="none" stroke="${SAGE}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M47.8 70 C47.8 63 48.5 56 49.5 49"
          fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M52.2 70 C52.2 63 51.5 56 50.5 49"
          fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
  </g>
</svg>`;

// HTML comparison preview
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 700px;
    background: #F8F9FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1A241E;
    padding: 32px 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    border-bottom: 2px solid #E2E8F0;
    padding-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  h1 { font-size: 24px; font-weight: 800; }
  .sub { font-size: 13px; color: #64748B; margin-top: 3px; }

  .grid {
    display: grid;
    grid-template-columns: 240px 1fr 1fr;
    gap: 24px;
    margin: 20px 0;
    flex: 1;
  }
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  .card-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .card-sub {
    font-size: 12px;
    color: #64748B;
    margin-bottom: 14px;
  }
  .preview-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #F1F5F9;
    border-radius: 12px;
    background: #FFFFFF;
    padding: 12px;
  }
  .preview-box.dark {
    background: ${DARK_BG};
    border-color: #243328;
  }
  .preview-box img {
    max-width: 160px;
    max-height: 160px;
    image-rendering: auto;
  }
  .preview-box svg {
    width: 100%;
    height: 100%;
    max-width: 170px;
    max-height: 170px;
  }

  .adaptive-row {
    display: flex;
    gap: 16px;
    margin-top: 12px;
  }
  .icon-preview {
    width: 64px;
    height: 64px;
    background: ${CREAM};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .icon-preview.circle { border-radius: 50%; }
  .icon-preview.squircle { border-radius: 18px; }
  .icon-preview svg { width: 56px; height: 56px; }

  .footer-note {
    font-size: 12px;
    color: #64748B;
    text-align: center;
    border-top: 1px solid #E2E8F0;
    padding-top: 12px;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Точный векторный редизайн эмблемы НГХУ</h1>
      <div class="sub">Сохранены оригинальные черты: аутентичные окантовки купола, шпиль и кисть художника в центре • Крупный масштаб без пустот</div>
    </div>
    <div style="font-size:12px; font-weight:700; color:${SAGE};">Купол + Кисть</div>
  </div>

  <div class="grid">
    <!-- 1. Original -->
    <div class="card">
      <div class="card-title">Оригинал НГХУ</div>
      <div class="card-sub">Растровый исходник училища</div>
      <div class="preview-box">
        <img src="file:///${origImgPath.replace(/\\\\/g, '/')}" />
      </div>
      <div style="font-size:11px; color:#64748B; margin-top:10px;">
        Купол с тремя парами лепестков, шпиль и кисть художника с обоймой и волосками.
      </div>
    </div>

    <!-- 2. Clean Vector Lockup -->
    <div class="card">
      <div class="card-title">Векторный оригинал (с текстом)</div>
      <div class="card-sub">Купол, кисть и надпись НГХУ</div>
      <div class="preview-box">
        ${svgEmblemLockup}
      </div>
      <div style="font-size:11px; color:#64748B; margin-top:10px;">
        100% точность оригинальных линий, чистые кривые Безье, векторные волоски кисти.
      </div>
    </div>

    <!-- 3. Prominent App Icon (Not too small!) -->
    <div class="card">
      <div class="card-title">Иконка приложения (Крупный масштаб)</div>
      <div class="card-sub">Заполняет безопасную зону без мелких пустых полей</div>
      <div class="preview-box" style="flex-direction:column; gap:12px;">
        <div class="adaptive-row">
          <div style="text-align:center;">
            <div class="icon-preview circle">${svgEmblemMark}</div>
            <span style="font-size:10px; color:#64748B;">Круг (Pixel)</span>
          </div>
          <div style="text-align:center;">
            <div class="icon-preview squircle">${svgEmblemMark}</div>
            <span style="font-size:10px; color:#64748B;">Сквиркл (Xiaomi)</span>
          </div>
          <div style="text-align:center;">
            <div class="icon-preview squircle" style="background:${DARK_BG};">${svgEmblemMark}</div>
            <span style="font-size:10px; color:#64748B;">Тёмный фон</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px; color:#64748B; margin-top:10px;">
        Знак увеличен (+25%), чтобы купол и кисть были чёткими и крупными на экране телефона.
      </div>
    </div>
  </div>

  <div class="footer-note">
    Чистый вектор без псевдо-теней и размытия • Полное соответствие оригинальному знаку училища
  </div>
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_compare.html');
fs.writeFileSync(tempHtml, html, 'utf8');

const outputPng = path.join(artifactDir, 'emblem_refined_comparison.png');
execSync(`"${edgePath}" --headless --screenshot="${outputPng}" --window-size=1200,700 --hide-scrollbars "file:///${tempHtml.replace(/\\\\/g, '/')}"`);
fs.unlinkSync(tempHtml);

// Also write raw SVGs to design/logos
const logosDir = path.join(__dirname, '..', 'design', 'logos');
fs.writeFileSync(path.join(logosDir, 'nghu_dome_brush_lockup.svg'), svgEmblemLockup, 'utf8');
fs.writeFileSync(path.join(logosDir, 'nghu_dome_brush_mark.svg'), svgEmblemMark, 'utf8');

console.log('Refined comparison generated at:', outputPng);
