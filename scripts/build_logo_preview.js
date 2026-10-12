const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'design', 'logos');
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';

// Run build_logo_concepts first
require('./build_logo_concepts.js');

const mark1 = fs.readFileSync(path.join(logosDir, 'nghu_mark_heritage.svg'), 'utf8');
const lockup1 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_heritage.svg'), 'utf8');

const mark2 = fs.readFileSync(path.join(logosDir, 'nghu_mark_negative.svg'), 'utf8');
const lockup2 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_negative.svg'), 'utf8');

const mark3 = fs.readFileSync(path.join(logosDir, 'nghu_mark_monoline.svg'), 'utf8');
const lockup3 = fs.readFileSync(path.join(logosDir, 'nghu_lockup_monoline.svg'), 'utf8');

// Copy SVGs to artifact directory
fs.writeFileSync(path.join(artifactDir, 'nghu_mark_heritage.svg'), mark1, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'nghu_lockup_heritage.svg'), lockup1, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'nghu_mark_negative.svg'), mark2, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'nghu_lockup_negative.svg'), lockup2, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'nghu_mark_monoline.svg'), mark3, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'nghu_lockup_monoline.svg'), lockup3, 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>NGHU Brand Sheet • Векторные концепты по методологии Logo-Design-Skill</title>
  <style>
    :root {
      --bg: #F9FAFB;
      --card-bg: #FFFFFF;
      --text: #111827;
      --text-muted: #6B7280;
      --border: #E5E7EB;
      --sage: #759A7E;
      --terracotta: #C45E47;
      --cream: #F4EDE4;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 48px 24px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      background: #E8F0EA;
      color: #2F5D3A;
      margin-bottom: 12px;
    }
    header {
      margin-bottom: 40px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #111827;
    }
    p.lead {
      color: var(--text-muted);
      font-size: 15px;
      margin-top: 8px;
      max-width: 760px;
    }

    /* Concept comparison grid */
    .concepts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 48px;
    }
    @media (max-width: 900px) {
      .concepts-grid { grid-template-columns: 1fr; }
    }
    .concept-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .concept-header {
      margin-bottom: 16px;
    }
    .concept-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--sage);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .concept-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin-top: 2px;
    }
    .concept-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 6px;
      min-height: 48px;
    }

    .preview-box {
      width: 100%;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      border: 1px solid #ECEFF1;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .preview-box.dark {
      background: #18221B;
      border-color: #233227;
    }
    .preview-box svg {
      width: 120px;
      height: 120px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin: 48px 0 8px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    .section-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    /* Test Sheets */
    .test-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    /* Size ladder row */
    .ladder-row {
      display: flex;
      align-items: flex-end;
      gap: 32px;
      padding: 16px 0;
      overflow-x: auto;
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
      color: var(--text-muted);
    }

    /* Android Adaptive Masks */
    .adaptive-row {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
      padding: 12px 0;
    }
    .adaptive-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .adaptive-icon-base {
      width: 76px;
      height: 76px;
      background: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
    }
    .adaptive-icon-base svg {
      width: 52px;
      height: 52px;
    }
    .mask-circle { border-radius: 50%; }
    .mask-squircle { border-radius: 20px; }
    .mask-rounded { border-radius: 14px; }
    .mask-dark { background: #1D2820; border-color: rgba(255,255,255,0.08); }

    /* Monochrome / 1-Color Test */
    .monochrome-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .mono-box {
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .mono-box.white-bg { background: #FFFFFF; }
    .mono-box.black-bg { background: #000000; }
    .mono-box svg { width: 90px; height: 90px; }
    .mono-box.black-bg svg path, .mono-box.black-bg svg rect, .mono-box.black-bg svg text { fill: #FFFFFF !important; stroke: #FFFFFF !important; }
    .mono-box.white-bg.pure-black svg path, .mono-box.white-bg.pure-black svg rect, .mono-box.white-bg.pure-black svg text { fill: #000000 !important; stroke: #000000 !important; }

    /* In-App Header Mockup */
    .appbar-demo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0 16px;
      margin-top: 12px;
    }
    .appbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .appbar-logo {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .appbar-logo svg {
      width: 28px;
      height: 28px;
    }
    .appbar-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Векторный дизайн логотипа • 100% SVG</div>
      <h1>Концепты логотипа НГХУ</h1>
      <p class="lead">
        Построены строго по принципам <code>logo-design-skill</code>: изолированные векторные формы, сохранение ключевого ДНК (исторический купол + кисть/факел искусства + фирменная палитра), без псевдо-карточек и искусственных 3D-теней.
      </p>
    </header>

    <!-- 3 Concepts -->
    <div class="concepts-grid">
      <!-- CONCEPT 1 -->
      <div class="concept-card">
        <div class="concept-header">
          <span class="concept-tag">Концепт 1</span>
          <h2 class="concept-title">Геометрический купол</h2>
          <p class="concept-desc">Точный эволюционный редизайн оригинала: чистые пропорциональные лепестки купола, шпиль и пламя-кисть терракотового цвета.</p>
        </div>
        <div class="preview-box">
          ${mark1}
        </div>
        <div class="preview-box dark">
          ${mark1}
        </div>
        <div style="font-size:12px; color:var(--text-muted); text-align:center; margin-top:8px;">
          Изолированный знак (значок приложения)
        </div>
      </div>

      <!-- CONCEPT 2 -->
      <div class="concept-card">
        <div class="concept-header">
          <span class="concept-tag">Концепт 2</span>
          <h2 class="concept-title">Негативное пространство</h2>
          <p class="concept-desc">Ультра-лаконичный силуэт: пламя и разделы вырезаны чистым негативным пространством. Максимальная узнаваемость при микро-размерах.</p>
        </div>
        <div class="preview-box">
          ${mark2}
        </div>
        <div class="preview-box dark">
          ${mark2}
        </div>
        <div style="font-size:12px; color:var(--text-muted); text-align:center; margin-top:8px;">
          Изолированный знак (значок приложения)
        </div>
      </div>

      <!-- CONCEPT 3 -->
      <div class="concept-card">
        <div class="concept-header">
          <span class="concept-tag">Концепт 3</span>
          <h2 class="concept-title">Монолайн / Контурный</h2>
          <p class="concept-desc">Современный tech-минимализм (в стиле Linear, Notion, Apple): единая толщина обводки 3.5px, скругленные окончания, дружелюбная графика.</p>
        </div>
        <div class="preview-box">
          ${mark3}
        </div>
        <div class="preview-box dark">
          ${mark3}
        </div>
        <div style="font-size:12px; color:var(--text-muted); text-align:center; margin-top:8px;">
          Изолированный знак (значок приложения)
        </div>
      </div>
    </div>

    <!-- Combination Marks (Lockups with Wordmark) -->
    <h2 class="section-title">Комбинаторные версии с надписью «НГХУ» (Lockups)</h2>
    <p class="section-subtitle">Для использования в заголовках документов, сплеш-скрине или веб-страницах.</p>
    <div class="test-card">
      <div style="display: flex; gap: 32px; justify-content: space-around; flex-wrap: wrap;">
        <div style="width: 200px; text-align: center;">
          <div style="height: 180px; display:flex; align-items:center; justify-content:center;">${lockup1}</div>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted);">Купол Heritage</span>
        </div>
        <div style="width: 200px; text-align: center;">
          <div style="height: 180px; display:flex; align-items:center; justify-content:center;">${lockup2}</div>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted);">Негативное пространство</span>
        </div>
        <div style="width: 200px; text-align: center;">
          <div style="height: 180px; display:flex; align-items:center; justify-content:center;">${lockup3}</div>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted);">Монолайн Line-Art</span>
        </div>
      </div>
    </div>

    <!-- Size Ladder Test -->
    <h2 class="section-title">Тест масштабируемости (Scale Ladder)</h2>
    <p class="section-subtitle">Проверка читаемости символа на экранах от 128px до микроскопических 16px (Favicon/Notification).</p>
    <div class="test-card">
      <div class="ladder-row">
        <div class="ladder-col">
          <div style="width: 128px; height: 128px;">${mark1}</div>
          <span class="ladder-label">128 px (HD)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 64px; height: 64px;">${mark1}</div>
          <span class="ladder-label">64 px (Icon)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 48px; height: 48px;">${mark1}</div>
          <span class="ladder-label">48 px (Android mdpi)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 32px; height: 32px;">${mark1}</div>
          <span class="ladder-label">32 px (Toolbar)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 24px; height: 24px;">${mark1}</div>
          <span class="ladder-label">24 px (Small)</span>
        </div>
        <div class="ladder-col">
          <div style="width: 16px; height: 16px;">${mark1}</div>
          <span class="ladder-label">16 px (Favicon)</span>
        </div>
      </div>
    </div>

    <!-- Android Adaptive Icon Test -->
    <h2 class="section-title">Адаптивные иконки Android (Safe-Zone & Masks)</h2>
    <p class="section-subtitle">Системные маски Android 8.0+ без нарисованных теней — чистый вектор в безопасной зоне 72dp.</p>
    <div class="test-card">
      <div class="adaptive-row">
        <div class="adaptive-item">
          <div class="adaptive-icon-base mask-circle">${mark1}</div>
          <span class="ladder-label">Круг (Pixel / OneUI)</span>
        </div>
        <div class="adaptive-item">
          <div class="adaptive-icon-base mask-squircle">${mark1}</div>
          <span class="ladder-label">Сквиркл (Xiaomi / Vivo)</span>
        </div>
        <div class="adaptive-item">
          <div class="adaptive-icon-base mask-rounded">${mark1}</div>
          <span class="ladder-label">Квадрат (Honor / Moto)</span>
        </div>
        <div class="adaptive-item">
          <div class="adaptive-icon-base mask-squircle mask-dark">${mark3}</div>
          <span class="ladder-label">Тёмная тема (AMOLED)</span>
        </div>
      </div>
    </div>

    <!-- 1-Color Test -->
    <h2 class="section-title">Одноцветный тест (1-Color & Monochrome Test)</h2>
    <p class="section-subtitle">Проверка на печать, гравировку, монохромный статус-бар или чёрно-белый бланк.</p>
    <div class="test-card">
      <div class="monochrome-row">
        <div class="mono-box white-bg pure-black">
          ${mark1}
        </div>
        <div class="mono-box black-bg">
          ${mark1}
        </div>
        <div class="mono-box white-bg pure-black">
          ${mark2}
        </div>
        <div class="mono-box black-bg">
          ${mark2}
        </div>
      </div>
    </div>

    <!-- In-App TopBar Mockup -->
    <h2 class="section-title">Отображение в шапке приложения (TopAppBar)</h2>
    <p class="section-subtitle">Как векторный знак выглядит рядом с названием группы в шапке расписания.</p>
    <div class="test-card">
      <div class="appbar-demo">
        <div class="appbar-left">
          <div class="appbar-logo">${mark1}</div>
          <div>
            <div class="appbar-title">НГХУ Расписание</div>
            <div style="font-size:11px; color:var(--text-muted);">Группа Д-11 • Корпус Красный пр-т, 9</div>
          </div>
        </div>
        <div style="font-size:12px; font-weight:600; color:var(--sage); background:#EBF2ED; padding:4px 8px; border-radius:6px;">
          Сегодня
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;

fs.writeFileSync(path.join(logosDir, 'preview.html'), htmlContent, 'utf8');
fs.writeFileSync(path.join(artifactDir, 'logo_preview.html'), htmlContent, 'utf8');

console.log('Complete logo preview generated at design/logos/preview.html and artifact directory.');
