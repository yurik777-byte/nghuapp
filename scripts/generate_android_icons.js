const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const primaryRes = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const srcRes = 'C:\\src\\nghuapp\\android\\app\\src\\main\\res';

const resDirs = [primaryRes];
if (fs.existsSync(srcRes)) {
  resDirs.push(srcRes);
}

const SAGE = '#7A9E83';
const CREAM = '#F4EDE4';

// 1. ic_launcher_background.xml
const backgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="${CREAM}"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;

// 2. ic_launcher_foreground.xml (Authentic Dome + Artist Brush scaled boldly to 76dp in 108dp safe zone)
// scale = 0.80, centered at (54, 54):
// translateX = 54 - 50*0.80 = 14
// translateY = 54 - 44*0.80 = 18.8
const foregroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:translateX="14"
        android:translateY="16"
        android:scaleX="0.80"
        android:scaleY="0.80">

        <!-- ================= SPIRE ================= -->
        <!-- Top Finial Tip -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M50,4 L52.5,8 L50,12 L47.5,8 Z" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1"
            android:strokeLineCap="round"
            android:pathData="M47.2,8.5 L52.8,8.5" />
        <!-- Spire Stem -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M49,11 h2 v9 h-2 z" />

        <!-- ================= DOME LOBES ================= -->
        <!-- 1. Left Outer Wing -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M48.2,19 C43,23 32,31 22,43 C14,53 13,62 15,67 C16.5,71 18,73 19,74 L29,74 C28,70 26.5,64 26.5,57 C26.5,48 33,39 42,30 C44.5,27.5 46.8,24 48,20.5 Z" />

        <!-- 2. Right Outer Wing -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M51.8,19 C57,23 68,31 78,43 C86,53 87,62 85,67 C83.5,71 82,73 81,74 L71,74 C72,70 73.5,64 73.5,57 C73.5,48 67,39 58,30 C55.5,27.5 53.2,24 52,20.5 Z" />

        <!-- 3. Left Middle Rib -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M48,25 C43,30 36,39 32,49 C28.5,57 28.5,65 29,74 L36.5,74 C36,66 37,58 41,50 C44,43 47,37 48.5,30 Z" />

        <!-- 4. Right Middle Rib -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M52,25 C57,30 64,39 68,49 C71.5,57 71.5,65 71,74 L63.5,74 C64,66 63,58 59,50 C56,43 53,37 51.5,30 Z" />

        <!-- 5. Central Vault Arch -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M50,21 C48,26 45.5,34 43,42 C40.5,50 39.5,60 40,74 L44.5,74 C44,62 45,52 48,44 C49,40 49.5,34 50,28 C50.5,34 51,40 52,44 C55,52 56,62 55.5,74 L60,74 C60.5,60 59.5,50 57,42 C54.5,34 52,26 50,21 Z" />

        <!-- ================= PAINTER'S BRUSH IN CENTER ================= -->
        <!-- Ferrule Base (Обойма кисти) -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M42.5,70 h15 v4 h-15 z" />
        <path
            android:strokeColor="#FFFFFF"
            android:strokeWidth="0.8"
            android:pathData="M42.5,72 L57.5,72" />

        <!-- Brush Bristle Body (Белый ворс кисти) -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M43.8,70 C43.8,60 45.8,49 48.2,41 C49.2,37 49.8,33 50,31 C50.2,33 50.8,37 51.8,41 C54.2,49 56.2,60 56.2,70 Z" />

        <!-- Bristle Strands (Пряди и волоски кисти) -->
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.3"
            android:strokeLineCap="round"
            android:pathData="M45.6,70 C45.6,59 47.8,48 49.6,37" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.5"
            android:strokeLineCap="round"
            android:pathData="M50,70 L50,31.5" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.3"
            android:strokeLineCap="round"
            android:pathData="M54.4,70 C54.4,59 52.2,48 50.4,37" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="0.9"
            android:strokeLineCap="round"
            android:pathData="M47.8,70 C47.8,62 48.6,54 49.6,47" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="0.9"
            android:strokeLineCap="round"
            android:pathData="M52.2,70 C52.2,62 51.4,54 50.4,47" />
    </group>
</vector>
`;

// 3. ic_nghu_logo.xml (In-app vector icon for App Bar and headers)
const inAppLogoXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="32dp"
    android:height="32dp"
    android:viewportWidth="100"
    android:viewportHeight="100">
    <group
        android:translateX="2"
        android:translateY="4"
        android:scaleX="0.96"
        android:scaleY="0.96">

        <!-- Spire -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M50,4 L52.5,8 L50,12 L47.5,8 Z" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1"
            android:strokeLineCap="round"
            android:pathData="M47.2,8.5 L52.8,8.5" />
        <path
            android:fillColor="${SAGE}"
            android:pathData="M49,11 h2 v9 h-2 z" />

        <!-- Left Outer Wing -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M48.2,19 C43,23 32,31 22,43 C14,53 13,62 15,67 C16.5,71 18,73 19,74 L29,74 C28,70 26.5,64 26.5,57 C26.5,48 33,39 42,30 C44.5,27.5 46.8,24 48,20.5 Z" />

        <!-- Right Outer Wing -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M51.8,19 C57,23 68,31 78,43 C86,53 87,62 85,67 C83.5,71 82,73 81,74 L71,74 C72,70 73.5,64 73.5,57 C73.5,48 67,39 58,30 C55.5,27.5 53.2,24 52,20.5 Z" />

        <!-- Left Middle Rib -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M48,25 C43,30 36,39 32,49 C28.5,57 28.5,65 29,74 L36.5,74 C36,66 37,58 41,50 C44,43 47,37 48.5,30 Z" />

        <!-- Right Middle Rib -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M52,25 C57,30 64,39 68,49 C71.5,57 71.5,65 71,74 L63.5,74 C64,66 63,58 59,50 C56,43 53,37 51.5,30 Z" />

        <!-- Central Vault Arch -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M50,21 C48,26 45.5,34 43,42 C40.5,50 39.5,60 40,74 L44.5,74 C44,62 45,52 48,44 C49,40 49.5,34 50,28 C50.5,34 51,40 52,44 C55,52 56,62 55.5,74 L60,74 C60.5,60 59.5,50 57,42 C54.5,34 52,26 50,21 Z" />

        <!-- Ferrule Base -->
        <path
            android:fillColor="${SAGE}"
            android:pathData="M42.5,70 h15 v4 h-15 z" />
        <path
            android:strokeColor="#FFFFFF"
            android:strokeWidth="0.8"
            android:pathData="M42.5,72 L57.5,72" />

        <!-- Brush Bristles -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M43.8,70 C43.8,60 45.8,49 48.2,41 C49.2,37 49.8,33 50,31 C50.2,33 50.8,37 51.8,41 C54.2,49 56.2,60 56.2,70 Z" />

        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.3"
            android:strokeLineCap="round"
            android:pathData="M45.6,70 C45.6,59 47.8,48 49.6,37" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.5"
            android:strokeLineCap="round"
            android:pathData="M50,70 L50,31.5" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="1.3"
            android:strokeLineCap="round"
            android:pathData="M54.4,70 C54.4,59 52.2,48 50.4,37" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="0.9"
            android:strokeLineCap="round"
            android:pathData="M47.8,70 C47.8,62 48.6,54 49.6,47" />
        <path
            android:strokeColor="${SAGE}"
            android:strokeWidth="0.9"
            android:strokeLineCap="round"
            android:pathData="M52.2,70 C52.2,62 51.4,54 50.4,47" />
    </group>
</vector>
`;

// Save vector drawables
for (const resDir of resDirs) {
  const drawableDir = path.join(resDir, 'drawable');
  fs.mkdirSync(drawableDir, { recursive: true });
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), backgroundXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), foregroundXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_nghu_logo.xml'), inAppLogoXml, 'utf8');
}
console.log('Vector XML files written successfully.');

// SVG mark source for raster generation
const markSvg = fs.readFileSync(path.join(__dirname, '..', 'design', 'logos', 'nghu_authentic_mark.svg'), 'utf8');

// Render raster icons for mipmap densities
const densities = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 }
];

const tempDir = path.join(__dirname, '..', 'design', 'logos', '_temp_raster');
fs.mkdirSync(tempDir, { recursive: true });

function renderHtmlToPng(html, outputPath, width, height) {
  const htmlPath = path.join(tempDir, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  try {
    execSync(`"${edgePath}" --headless --screenshot="${outputPath}" --window-size=${width},${height} --hide-scrollbars "file:///${htmlPath.replace(/\\\\/g, '/')}"`);
  } finally {
    if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
  }
}

for (const d of densities) {
  console.log(`Generating raster icons for ${d.name} (${d.size}x${d.size})...`);
  
  // 1. Regular icon (squircle with #F4EDE4 background)
  const squircleRadius = Math.round(d.size * 0.24);
  const markSize = Math.round(d.size * 0.84); // Bold, fills the icon nicely!
  const htmlSquircle = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${d.size}px;
    height: ${d.size}px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .tile {
    width: ${d.size}px;
    height: ${d.size}px;
    border-radius: ${squircleRadius}px;
    background: ${CREAM};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tile svg {
    width: ${markSize}px;
    height: ${markSize}px;
  }
</style>
</head>
<body>
  <div class="tile">${markSvg}</div>
</body>
</html>`;

  // 2. Round icon (circle with #F4EDE4 background)
  const htmlRound = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${d.size}px;
    height: ${d.size}px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .tile {
    width: ${d.size}px;
    height: ${d.size}px;
    border-radius: 50%;
    background: ${CREAM};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tile svg {
    width: ${markSize}px;
    height: ${markSize}px;
  }
</style>
</head>
<body>
  <div class="tile">${markSvg}</div>
</body>
</html>`;

  const tempSquirclePng = path.join(tempDir, `sq_${d.name}.png`);
  const tempRoundPng = path.join(tempDir, `rd_${d.name}.png`);

  renderHtmlToPng(htmlSquircle, tempSquirclePng, d.size, d.size);
  renderHtmlToPng(htmlRound, tempRoundPng, d.size, d.size);

  // Copy to each res dir
  for (const resDir of resDirs) {
    const targetDir = path.join(resDir, d.name);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(tempSquirclePng, path.join(targetDir, 'ic_launcher.png'));
    fs.copyFileSync(tempRoundPng, path.join(targetDir, 'ic_launcher_round.png'));
  }

  fs.unlinkSync(tempSquirclePng);
  fs.unlinkSync(tempRoundPng);
}

fs.rmdirSync(tempDir);
console.log('All authentic Android raster mipmaps and vector drawables successfully generated!');
