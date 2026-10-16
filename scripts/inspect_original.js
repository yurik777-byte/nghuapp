const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';
const origImgPath = path.join(artifactDir, '.user_uploaded', 'media_1791784544937_fe82275e.png');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { background: #f0f0f0; margin: 0; padding: 20px; font-family: sans-serif; display: flex; gap: 20px; }
  .box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  img.pixelated { image-rendering: pixelated; width: 400px; height: 385px; border: 1px solid #ccc; }
</style>
</head>
<body>
  <div class="box">
    <h3>Original Emblem 1x</h3>
    <img src="file:///${origImgPath.replace(/\\\\/g, '/')}" />
  </div>
  <div class="box">
    <h3>Original Emblem 4x Pixelated</h3>
    <img class="pixelated" src="file:///${origImgPath.replace(/\\\\/g, '/')}" />
  </div>
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_inspect.html');
fs.writeFileSync(tempHtml, html, 'utf8');

const outputPng = path.join(artifactDir, 'inspect_original_zoom.png');
execSync(`"${edgePath}" --headless --screenshot="${outputPng}" --window-size=950,500 --hide-scrollbars "file:///${tempHtml.replace(/\\\\/g, '/')}"`);
fs.unlinkSync(tempHtml);
console.log('Original zoom generated at:', outputPng);
