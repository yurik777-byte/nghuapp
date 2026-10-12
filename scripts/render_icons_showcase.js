const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const logosDir = path.join(__dirname, '..', 'design', 'logos');
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';

const mark1 = fs.readFileSync(path.join(logosDir, 'nghu_mark_heritage.svg'), 'utf8');
const mark2 = fs.readFileSync(path.join(logosDir, 'nghu_mark_negative.svg'), 'utf8');
const mark3 = fs.readFileSync(path.join(logosDir, 'nghu_mark_monoline.svg'), 'utf8');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 650px;
    background: #F8F9FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1A241E;
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    border-bottom: 2px solid #E5E7EB;
    padding-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  h1 { font-size: 24px; font-weight: 800; }
  .sub { font-size: 13px; color: #64748B; margin-top: 3px; }

  .section-label {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #475569;
    margin-bottom: 12px;
  }

  /* Adaptive icons grid */
  .adaptive-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
  .icon-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .icon-preview {
    width: 88px;
    height: 88px;
    background: #F4EDE4;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .icon-preview.dark-bg {
    background: #19231D;
  }
  .icon-preview.circle { border-radius: 50%; }
  .icon-preview.squircle { border-radius: 22px; }
  .icon-preview.rounded { border-radius: 16px; }
  .icon-preview svg { width: 58px; height: 58px; }
  .icon-name { font-size: 13px; font-weight: 700; text-align: center; }
  .icon-sub { font-size: 11px; color: #64748B; text-align: center; }

  /* Ladder row */
  .ladder-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px 28px;
  }
  .ladder-flex {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .ladder-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .ladder-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748B;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Тест адаптивных иконок Android и масштабирования</h1>
      <div class="sub">Проверка безопасной зоны 72dp в системных масках Android (круг, сквиркл) и читаемости на микро-размерах</div>
    </div>
    <div style="font-size:12px; font-weight:700; color:#759A7E;">Safe Zone Test</div>
  </div>

  <div>
    <div class="section-label">1. Android Adaptive Icons (Pixel, Xiaomi, Samsung, AMOLED)</div>
    <div class="adaptive-grid">
      <div class="icon-card">
        <div class="icon-preview circle">${mark1}</div>
        <div class="icon-name">Google Pixel / Samsung</div>
        <div class="icon-sub">Круглая маска • Концепт 1</div>
      </div>
      <div class="icon-card">
        <div class="icon-preview squircle">${mark1}</div>
        <div class="icon-name">Xiaomi / HyperOS</div>
        <div class="icon-sub">Сквиркл • Концепт 1</div>
      </div>
      <div class="icon-card">
        <div class="icon-preview squircle">${mark2}</div>
        <div class="icon-name">Концепт 2 (Negative)</div>
        <div class="icon-sub">Сквиркл • Негативное пр-во</div>
      </div>
      <div class="icon-card">
        <div class="icon-preview squircle dark-bg">${mark3}</div>
        <div class="icon-name">Тёмная тема (AMOLED)</div>
        <div class="icon-sub">Концепт 3 (Line-Art)</div>
      </div>
    </div>
  </div>

  <div>
    <div class="section-label">2. Шкала масштабирования (Scale Ladder: 128px • 64px • 48px • 32px • 24px • 16px)</div>
    <div class="ladder-card">
      <div class="ladder-flex">
        <div class="ladder-col">
          <div style="width: 100px; height: 100px;">${mark1}</div>
          <span class="ladder-label">100px (HD Display)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 64px; height: 64px;">${mark1}</div>
          <span class="ladder-label">64px (App Drawer)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 48px; height: 48px;">${mark1}</div>
          <span class="ladder-label">48px (Home Screen)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 32px; height: 32px;">${mark1}</div>
          <span class="ladder-label">32px (App Bar)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 24px; height: 24px;">${mark1}</div>
          <span class="ladder-label">24px (Navigation)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 16px; height: 16px;">${mark1}</div>
          <span class="ladder-label">16px (Favicon)</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const tempHtml = path.join(logosDir, '_temp_icons.html');
fs.writeFileSync(tempHtml, html, 'utf8');

const outputPng = path.join(artifactDir, 'nghu_adaptive_icons_test.png');
const outputWorkspacePng = path.join(logosDir, 'nghu_adaptive_icons_test.png');

console.log('Rendering adaptive icons screenshot...');
execSync(`"${edgePath}" --headless --screenshot="${outputPng}" --window-size=1200,650 --hide-scrollbars "file:///${tempHtml.replace(/\\\\/g, '/')}"`);
fs.copyFileSync(outputPng, outputWorkspacePng);
fs.unlinkSync(tempHtml);
console.log('Done rendering adaptive icons test to:', outputPng);
