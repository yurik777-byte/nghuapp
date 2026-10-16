const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';
const origImgPath = path.join(artifactDir, '.user_uploaded', 'media_1791784544937_fe82275e.png');

// Authentic colors
const SAGE = '#7B9D82';
const TERRACOTTA = '#B5533D';
const CREAM = '#F4EDE4';
const DARK_BG = '#16221A';

// Exact proportional geometry matching original 73x63 aspect ratio
const svgLockup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- ================= SPIRE ================= -->
  <!-- Top Finial Tip -->
  <path d="M50 4
           L52.5 8
           L50 12
           L47.5 8 Z" fill="${SAGE}"/>
  <line x1="47.2" y1="8.5" x2="52.8" y2="8.5" stroke="${SAGE}" stroke-width="1" stroke-linecap="round"/>
  <!-- Stem -->
  <rect x="49" y="11" width="2" height="9" rx="0.5" fill="${SAGE}"/>

  <!-- ================= TALL ONION DOME ================= -->
  <!-- 1. Left Outer Wing -->
  <path d="M48.2 19
           C43 23 32 31 22 43
           C14 53 13 62 15 67
           C16.5 71 18 73 19 74
           L29 74
           C28 70 26.5 64 26.5 57
           C26.5 48 33 39 42 30
           C44.5 27.5 46.8 24 48 20.5
           Z" fill="${SAGE}"/>

  <!-- 2. Right Outer Wing -->
  <path d="M51.8 19
           C57 23 68 31 78 43
           C86 53 87 62 85 67
           C83.5 71 82 73 81 74
           L71 74
           C72 70 73.5 64 73.5 57
           C73.5 48 67 39 58 30
           C55.5 27.5 53.2 24 52 20.5
           Z" fill="${SAGE}"/>

  <!-- 3. Left Middle Rib -->
  <path d="M48 25
           C43 30 36 39 32 49
           C28.5 57 28.5 65 29 74
           L36.5 74
           C36 66 37 58 41 50
           C44 43 47 37 48.5 30
           Z" fill="${SAGE}"/>

  <!-- 4. Right Middle Rib -->
  <path d="M52 25
           C57 30 64 39 68 49
           C71.5 57 71.5 65 71 74
           L63.5 74
           C64 66 63 58 59 50
           C56 43 53 37 51.5 30
           Z" fill="${SAGE}"/>

  <!-- 5. Central Vault Arch -->
  <path d="M50 21
           C48 26 45.5 34 43 42
           C40.5 50 39.5 60 40 74
           L44.5 74
           C44 62 45 52 48 44
           C49 40 49.5 34 50 28
           C50.5 34 51 40 52 44
           C55 52 56 62 55.5 74
           L60 74
           C60.5 60 59.5 50 57 42
           C54.5 34 52 26 50 21
           Z" fill="${SAGE}"/>

  <!-- ================= ARTIST BRUSH IN CENTER ================= -->
  <!-- Ferrule Base (Обойма кисти) -->
  <rect x="42.5" y="70" width="15" height="4" rx="0.8" fill="${SAGE}"/>
  <line x1="42.5" y1="72" x2="57.5" y2="72" stroke="#FFFFFF" stroke-width="0.8"/>

  <!-- Brush Bristle Body (White silhouette) -->
  <path d="M43.8 70
           C43.8 60 45.8 49 48.2 41
           C49.2 37 49.8 33 50 31
           C50.2 33 50.8 37 51.8 41
           C54.2 49 56.2 60 56.2 70
           Z" fill="#FFFFFF"/>

  <!-- Left S-curve Bristle Strand -->
  <path d="M45.6 70 C45.6 59 47.8 48 49.6 37"
        fill="none" stroke="${SAGE}" stroke-width="1.3" stroke-linecap="round"/>

  <!-- Center Master Bristle Stroke -->
  <path d="M50 70 L50 31.5"
        fill="none" stroke="${SAGE}" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Right S-curve Bristle Strand -->
  <path d="M54.4 70 C54.4 59 52.2 48 50.4 37"
        fill="none" stroke="${SAGE}" stroke-width="1.3" stroke-linecap="round"/>

  <!-- Inner hair lines -->
  <path d="M47.8 70 C47.8 62 48.6 54 49.6 47"
        fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
  <path d="M52.2 70 C52.2 62 51.4 54 50.4 47"
        fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>

  <!-- ================= TYPOGRAPHY НГХУ ================= -->
  <text x="50" y="93"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        font-size="16"
        font-weight="700"
        fill="${TERRACOTTA}"
        text-anchor="middle"
        letter-spacing="5">НГХУ</text>
</svg>`;

// Standalone Mark for App Icon (LARGE & PROMINENT)
// Scaled up by 1.35x and centered at (50, 50) so it fills the safe zone (80% of canvas)!
const svgAppIconMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <g transform="translate(50, 50) scale(1.36) translate(-50, -39)">
    <!-- Spire -->
    <path d="M50 4
             L52.5 8
             L50 12
             L47.5 8 Z" fill="${SAGE}"/>
    <line x1="47.2" y1="8.5" x2="52.8" y2="8.5" stroke="${SAGE}" stroke-width="1" stroke-linecap="round"/>
    <rect x="49" y="11" width="2" height="9" rx="0.5" fill="${SAGE}"/>

    <!-- 1. Left Outer Wing -->
    <path d="M48.2 19
             C43 23 32 31 22 43
             C14 53 13 62 15 67
             C16.5 71 18 73 19 74
             L29 74
             C28 70 26.5 64 26.5 57
             C26.5 48 33 39 42 30
             C44.5 27.5 46.8 24 48 20.5
             Z" fill="${SAGE}"/>

    <!-- 2. Right Outer Wing -->
    <path d="M51.8 19
             C57 23 68 31 78 43
             C86 53 87 62 85 67
             C83.5 71 82 73 81 74
             L71 74
             C72 70 73.5 64 73.5 57
             C73.5 48 67 39 58 30
             C55.5 27.5 53.2 24 52 20.5
             Z" fill="${SAGE}"/>

    <!-- 3. Left Middle Rib -->
    <path d="M48 25
             C43 30 36 39 32 49
             C28.5 57 28.5 65 29 74
             L36.5 74
             C36 66 37 58 41 50
             C44 43 47 37 48.5 30
             Z" fill="${SAGE}"/>

    <!-- 4. Right Middle Rib -->
    <path d="M52 25
             C57 30 64 39 68 49
             C71.5 57 71.5 65 71 74
             L63.5 74
             C64 66 63 58 59 50
             C56 43 53 37 51.5 30
             Z" fill="${SAGE}"/>

    <!-- 5. Central Vault Arch -->
    <path d="M50 21
             C48 26 45.5 34 43 42
             C40.5 50 39.5 60 40 74
             L44.5 74
             C44 62 45 52 48 44
             C49 40 49.5 34 50 28
             C50.5 34 51 40 52 44
             C55 52 56 62 55.5 74
             L60 74
             C60.5 60 59.5 50 57 42
             C54.5 34 52 26 50 21
             Z" fill="${SAGE}"/>

    <!-- Ferrule Base -->
    <rect x="42.5" y="70" width="15" height="4" rx="0.8" fill="${SAGE}"/>
    <line x1="42.5" y1="72" x2="57.5" y2="72" stroke="#FFFFFF" stroke-width="0.8"/>

    <!-- Brush Bristle Body -->
    <path d="M43.8 70
             C43.8 60 45.8 49 48.2 41
             C49.2 37 49.8 33 50 31
             C50.2 33 50.8 37 51.8 41
             C54.2 49 56.2 60 56.2 70
             Z" fill="#FFFFFF"/>

    <path d="M45.6 70 C45.6 59 47.8 48 49.6 37"
          fill="none" stroke="${SAGE}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M50 70 L50 31.5"
          fill="none" stroke="${SAGE}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M54.4 70 C54.4 59 52.2 48 50.4 37"
          fill="none" stroke="${SAGE}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M47.8 70 C47.8 62 48.6 54 49.6 47"
          fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M52.2 70 C52.2 62 51.4 54 50.4 47"
          fill="none" stroke="${SAGE}" stroke-width="0.9" stroke-linecap="round"/>
  </g>
</svg>`;

// Comparison HTML
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1240px;
    height: 740px;
    background: #F8F9FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1A241E;
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    border-bottom: 2px solid #E2E8F0;
    padding-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  h1 { font-size: 25px; font-weight: 800; }
  .sub { font-size: 13.5px; color: #64748B; margin-top: 4px; }

  .grid {
    display: grid;
    grid-template-columns: 260px 1fr 1fr;
    gap: 24px;
    margin: 22px 0;
    flex: 1;
  }
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 22px;
    display: flex;
    flex-direction: column;
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
  }
  .card-title { font-size: 16px; font-weight: 700; }
  .card-badge {
    font-size: 11px;
    font-weight: 700;
    color: ${SAGE};
    text-transform: uppercase;
  }

  .preview-box {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #F1F5F9;
    border-radius: 14px;
    background: #FFFFFF;
    padding: 16px;
  }
  .preview-box img {
    max-width: 180px;
    max-height: 180px;
  }
  .preview-box svg {
    width: 100%;
    height: 100%;
    max-width: 210px;
    max-height: 210px;
  }

  .adaptive-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    padding: 16px 0;
  }
  .icon-preview {
    width: 92px;
    height: 92px;
    background: ${CREAM};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.06);
  }
  .icon-preview.circle { border-radius: 50%; }
  .icon-preview.squircle { border-radius: 24px; }
  .icon-preview svg { width: 78px; height: 78px; }

  .card-desc {
    font-size: 12px;
    color: #64748B;
    line-height: 1.45;
    margin-top: 12px;
  }
  .footer-note {
    font-size: 12.5px;
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
      <h1>Обновлённый логотип НГХУ: Купол и кисть в оригинальных окантовках</h1>
      <div class="sub">Точная передача аутентичных черт: луковичный купол училища, кисть художника с обоймой и волосками • Крупный масштаб без пустот</div>
    </div>
    <div style="font-size:12px; font-weight:700; color:${SAGE};">Купол + Кисть</div>
  </div>

  <div class="grid">
    <!-- 1. Original Source -->
    <div class="card">
      <div class="card-top">
        <div class="card-title">Оригинал НГХУ</div>
        <div class="card-badge">Растр</div>
      </div>
      <div class="preview-box">
        <img src="file:///${origImgPath.replace(/\\\\/g, '/')}" />
      </div>
      <div class="card-desc">
        Исторический знак: характерный силуэт купола в стиле модерн, три секции лепестков, шпиль и кисть художника в центре.
      </div>
    </div>

    <!-- 2. Precise Vector Lockup -->
    <div class="card">
      <div class="card-top">
        <div class="card-title">Векторный оригинал</div>
        <div class="card-badge">100% SVG</div>
      </div>
      <div class="preview-box">
        ${svgLockup}
      </div>
      <div class="card-desc">
        Точные окантовки и изгибы, шпиль-навершие, металлическая обойма и фактурные волоски кисти. Аутентичная надпись «НГХУ».
      </div>
    </div>

    <!-- 3. Prominent App Icon (Not too small!) -->
    <div class="card">
      <div class="card-top">
        <div class="card-title">Иконка приложения</div>
        <div class="card-badge">Крупный масштаб</div>
      </div>
      <div class="preview-box" style="flex-direction:column;">
        <div class="adaptive-row">
          <div style="text-align:center;">
            <div class="icon-preview circle">${svgAppIconMark}</div>
            <div style="font-size:11px; font-weight:600; color:#475569; margin-top:8px;">Круг (Pixel/Samsung)</div>
          </div>
          <div style="text-align:center;">
            <div class="icon-preview squircle">${svgAppIconMark}</div>
            <div style="font-size:11px; font-weight:600; color:#475569; margin-top:8px;">Сквиркл (Xiaomi/Vivo)</div>
          </div>
        </div>
      </div>
      <div class="card-desc">
        Масштаб знака увеличен (+35%): купол и кисть заполняют безопасную зону 72dp, чётко видны на рабочем столе и не теряются.
      </div>
    </div>
  </div>

  <div class="footer-note">
    Векторная графика высокой точности • Идеально масштабируется от 16px до 512px • Полное соответствие оригиналу
  </div>
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_authentic2.html');
fs.writeFileSync(tempHtml, html, 'utf8');

const outputPng = path.join(artifactDir, 'authentic_dome_brush_showcase.png');
execSync(`"${edgePath}" --headless --screenshot="${outputPng}" --window-size=1240,740 --hide-scrollbars "file:///${tempHtml.replace(/\\\\/g, '/')}"`);
fs.unlinkSync(tempHtml);

// Save SVGs to design/logos
const logosDir = path.join(__dirname, '..', 'design', 'logos');
fs.writeFileSync(path.join(logosDir, 'nghu_authentic_lockup.svg'), svgLockup, 'utf8');
fs.writeFileSync(path.join(logosDir, 'nghu_authentic_mark.svg'), svgAppIconMark, 'utf8');

console.log('Authentic showcase 2 successfully rendered to:', outputPng);
