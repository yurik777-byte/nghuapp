const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const logosDir = path.join(__dirname, '..', 'design', 'logos');
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';

const mark1 = fs.readFileSync(path.join(logosDir, 'nghu_mark_heritage.svg'), 'utf8');
const lockup1 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_heritage.svg'), 'utf8');

const mark2 = fs.readFileSync(path.join(logosDir, 'nghu_mark_negative.svg'), 'utf8');
const lockup2 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_negative.svg'), 'utf8');

const mark3 = fs.readFileSync(path.join(logosDir, 'nghu_mark_monoline.svg'), 'utf8');
const lockup3 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_monoline.svg'), 'utf8');

// HTML for side-by-side showcase image
const showcaseHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 720px;
    background: #F8F9FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1A241E;
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #E5E7EB;
    padding-bottom: 16px;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .sub {
    font-size: 14px;
    color: #64748B;
    margin-top: 4px;
  }
  .badge {
    font-size: 12px;
    font-weight: 700;
    background: #E8F0EA;
    color: #2D5838;
    padding: 6px 12px;
    border-radius: 99px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    margin-top: 24px;
    flex: 1;
  }
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
  }
  .card-title {
    font-size: 17px;
    font-weight: 700;
  }
  .card-num {
    font-size: 11px;
    font-weight: 700;
    color: #759A7E;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .preview-area {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .box {
    flex: 1;
    height: 160px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #EEF2F6;
  }
  .box.light { background: #FFFFFF; }
  .box.dark { background: #18221B; border-color: #243328; }
  .box svg { width: 100px; height: 100px; }
  .box-label {
    font-size: 10px;
    font-weight: 600;
    color: #94A3B8;
    text-transform: uppercase;
    margin-top: 6px;
  }
  .lockup-area {
    height: 150px;
    background: #FAFAFA;
    border-radius: 12px;
    border: 1px solid #F1F5F9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .lockup-area svg { width: 110px; height: 110px; }
  .card-footer {
    font-size: 12px;
    color: #64748B;
    line-height: 1.4;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #F1F5F9;
  }
  .footer-note {
    font-size: 12px;
    color: #94A3B8;
    text-align: center;
    padding-top: 12px;
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Векторные концепты логотипа НГХУ</h1>
      <div class="sub">Созданы по методологии logo-design-skill • Чистый SVG • Изолированный вектор на прозрачном фоне</div>
    </div>
    <div class="badge">Векторный редизайн 2026</div>
  </div>

  <div class="grid">
    <!-- Concept 1 -->
    <div class="card">
      <div>
        <div class="card-top">
          <div class="card-title">Геометрический купол</div>
          <div class="card-num">Концепт 1 • Рекомендуемый</div>
        </div>
        <div class="preview-area">
          <div class="box light">
            ${mark1}
            <span class="box-label">Светлый фон</span>
          </div>
          <div class="box dark">
            ${mark1}
            <span class="box-label">Темный фон</span>
          </div>
        </div>
        <div class="lockup-area">
          ${lockup1}
          <span class="box-label">С надписью НГХУ</span>
        </div>
      </div>
      <div class="card-footer">
        Эволюционный редизайн: гармоничные лепестки купола, шпиль и живое пламя-кисть в тёплой терракоте.
      </div>
    </div>

    <!-- Concept 2 -->
    <div class="card">
      <div>
        <div class="card-top">
          <div class="card-title">Негативное пространство</div>
          <div class="card-num">Концепт 2</div>
        </div>
        <div class="preview-area">
          <div class="box light">
            ${mark2}
            <span class="box-label">Светлый фон</span>
          </div>
          <div class="box dark">
            ${mark2}
            <span class="box-label">Темный фон</span>
          </div>
        </div>
        <div class="lockup-area">
          ${lockup2}
          <span class="box-label">С надписью НГХУ</span>
        </div>
      </div>
      <div class="card-footer">
        Ультра-лаконичный силуэт: пламя и арки высечены негативным пространством. Идеально для малых масштабов.
      </div>
    </div>

    <!-- Concept 3 -->
    <div class="card">
      <div>
        <div class="card-top">
          <div class="card-title">Монолайн / Line-Art</div>
          <div class="card-num">Концепт 3</div>
        </div>
        <div class="preview-area">
          <div class="box light">
            ${mark3}
            <span class="box-label">Светлый фон</span>
          </div>
          <div class="box dark">
            ${mark3}
            <span class="box-label">Темный фон</span>
          </div>
        </div>
        <div class="lockup-area">
          ${lockup3}
          <span class="box-label">С надписью НГХУ</span>
        </div>
      </div>
      <div class="card-footer">
        Современный tech-минимализм: равномерная толщина линий 3.5px, скругления, эстетика Notion / Linear.
      </div>
    </div>
  </div>

  <div class="footer-note">
    100% чистый вектор без нарисованных псевдо-теней, рамок и AI-карточек • Готово к компиляции в Android VectorDrawable
  </div>
</body>
</html>`;

const tempHtmlPath = path.join(logosDir, '_temp_showcase.html');
fs.writeFileSync(tempHtmlPath, showcaseHtml, 'utf8');

const outputPng = path.join(artifactDir, 'nghu_vector_logos_showcase.png');
const outputWorkspacePng = path.join(logosDir, 'nghu_vector_logos_showcase.png');

console.log('Rendering high-res screenshot via Edge headless...');
try {
  execSync(`"${edgePath}" --headless --screenshot="${outputPng}" --window-size=1200,720 --hide-scrollbars "file:///${tempHtmlPath.replace(/\\\\/g, '/')}"`);
  fs.copyFileSync(outputPng, outputWorkspacePng);
  console.log('Screenshot successfully rendered to:', outputPng);
} catch (e) {
  console.error('Error rendering screenshot:', e.message);
}

// Cleanup temp file
fs.unlinkSync(tempHtmlPath);
