const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = 'C:\\Users\\юра\\Desktop\\VK_Branding';
const iconImgPath = path.resolve(outDir, 'option_flat_original.jpg').replace(/\\/g, '/');

function render(html, outputPath, width, height) {
  const tempHtml = path.resolve(process.cwd(), `_temp_banner_${Date.now()}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${tempHtml.replace(/\\/g, '/')}"`);
    console.log(`Rendered banner: ${path.basename(outputPath)}`);
  } finally {
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}

// 1. Light Minimalist Banner (Cream / Natural Canvas matching the icon background)
const lightBanner = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #F7F5F0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .icon-wrapper {
      width: 240px;
      height: 240px;
      border-radius: 48px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .title {
      color: #2D3730;
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="icon-wrapper">
    <img src="file:///${iconImgPath}">
  </div>
  <div class="title">Расписание</div>
</body>
</html>`;

render(lightBanner, path.resolve(outDir, '5_big_snippet_1120x630.png'), 1120, 630);

// 2. Dark Minimalist Banner (Soft graphite)
const darkBanner = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1120px;
      height: 630px;
      background: #1C2320;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .icon-wrapper {
      width: 240px;
      height: 240px;
      border-radius: 48px;
      overflow: hidden;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: contain;
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
  <div class="icon-wrapper">
    <img src="file:///${iconImgPath}">
  </div>
  <div class="title">Расписание</div>
</body>
</html>`;

render(darkBanner, path.resolve(outDir, '5_big_snippet_dark_1120x630.png'), 1120, 630);

console.log('Banners updated!');
