const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\юра\\.gemini\\antigravity\\brain\\b8749bdc-e32a-4d20-9b4f-09da4dc13ef2';
const origImgPath = path.join(artifactDir, '.user_uploaded', 'media_1791784544937_fe82275e.png');

const html = `<!DOCTYPE html>
<html>
<body>
<canvas id="c"></canvas>
<script>
const img = new Image();
img.onload = () => {
  const c = document.getElementById('c');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  
  let minX = 999, maxX = -1, minY = 999, maxY = -1;
  const greenPixels = [];
  const redPixels = [];
  
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a > 30) {
        // check if green (dome) or red (text)
        if (g > r + 15 && g > b) {
          greenPixels.push({x, y, r, g, b});
        } else if (r > g + 25 && r > b + 25) {
          redPixels.push({x, y, r, g, b});
        }
      }
    }
  }

  let domeMinX = 999, domeMaxX = 0, domeMinY = 999, domeMaxY = 0;
  greenPixels.forEach(p => {
    if (p.x < domeMinX) domeMinX = p.x;
    if (p.x > domeMaxX) domeMaxX = p.x;
    if (p.y < domeMinY) domeMinY = p.y;
    if (p.y > domeMaxY) domeMaxY = p.y;
  });

  let textMinX = 999, textMaxX = 0, textMinY = 999, textMaxY = 0;
  redPixels.forEach(p => {
    if (p.x < textMinX) textMinX = p.x;
    if (p.x > textMaxX) textMaxX = p.x;
    if (p.y < textMinY) textMinY = p.y;
    if (p.y > textMaxY) textMaxY = p.y;
  });

  const res = {
    imgW: img.width,
    imgH: img.height,
    dome: { minX: domeMinX, maxX: domeMaxX, minY: domeMinY, maxY: domeMaxY, w: domeMaxX - domeMinX + 1, h: domeMaxY - domeMinY + 1 },
    text: { minX: textMinX, maxX: textMaxX, minY: textMinY, maxY: textMaxY, w: textMaxX - textMinX + 1, h: textMaxY - textMinY + 1 }
  };

  const pre = document.createElement('pre');
  pre.id = 'output';
  pre.innerText = JSON.stringify(res, null, 2);
  document.body.appendChild(pre);
};
img.src = 'file:///${origImgPath.replace(/\\\\/g, '/')}';
</script>
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_coords.html');
fs.writeFileSync(tempHtml, html, 'utf8');

// Run edge and dump document
const outJson = path.join(__dirname, 'coords.json');
try {
  const result = execSync(`"${edgePath}" --headless --dump-dom "file:///${tempHtml.replace(/\\\\/g, '/')}"`, { encoding: 'utf8' });
  const match = result.match(/<pre id="output">([\s\S]*?)<\/pre>/);
  if (match) {
    fs.writeFileSync(outJson, match[1], 'utf8');
    console.log('Coordinates dumped:\n', match[1]);
  } else {
    console.log('No pre found in dump-dom, output len:', result.length);
  }
} finally {
  if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
}
