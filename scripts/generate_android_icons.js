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

// 1. ic_launcher_background.xml
const backgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#F4EDE4"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;

// 2. ic_launcher_foreground.xml (Concept 1: Geometric Heritage centered in 72dp safe zone)
const foregroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:translateX="24"
        android:translateY="24"
        android:scaleX="0.60"
        android:scaleY="0.60">
        <!-- Central Spire & Finial -->
        <path
            android:fillColor="#759A7E"
            android:pathData="M50,8 L53,17 L50,26 L47,17 Z" />
        <path
            android:fillColor="#759A7E"
            android:pathData="M49,24 h2 v12 h-2 z" />

        <!-- Left Outer Dome Wing -->
        <path
            android:fillColor="#759A7E"
            android:pathData="M48,29 C40,33 33,40 27,50 C20,61 18,73 20,83 C20.5,85 22,86 24,86 L32,86 C33,86 34,85 34,84 C33,75 35,65 40,57 C44,49 47,43 49,39 Z" />

        <!-- Right Outer Dome Wing -->
        <path
            android:fillColor="#759A7E"
            android:pathData="M52,29 C60,33 67,40 73,50 C80,61 82,73 80,83 C79.5,85 78,86 76,86 L68,86 C67,86 66,85 66,84 C67,75 65,65 60,57 C56,49 53,43 51,39 Z" />

        <!-- Left Inner Dome Flute -->
        <path
            android:fillColor="#759A7E"
            android:pathData="M49,38 C44,44 40,52 38,61 C36,69 36,78 37,86 L44,86 C44.5,86 45,85.5 45,84.8 C44.2,76 45,67 48,58 C49,53 50,48 50,43 Z" />

        <!-- Right Inner Dome Flute -->
        <path
            android:fillColor="#759A7E"
            android:pathData="M51,38 C56,44 60,52 62,61 C64,69 64,78 63,86 L56,86 C55.5,86 55,85.5 55,84.8 C55.8,76 55,67 52,58 C51,53 50,48 50,43 Z" />

        <!-- Center Core Flame / Brush (Terracotta) -->
        <path
            android:fillColor="#C45E47"
            android:pathData="M50,51 C52,56 55,60 56.5,65 C58,71 56,78 53.5,82 C52.5,84 51.2,86 50,87 C48.8,86 47.5,84 46.5,82 C44,78 42,71 43.5,65 C45,60 48,56 50,51 Z" />
        <path
            android:fillColor="#F4EDE4"
            android:pathData="M50,63 C51.2,67 52.8,71 52.2,75 C51.6,79 50.6,82 50,85 C49.4,82 48.4,79 47.8,75 C47.2,71 48.8,67 50,63 Z" />
    </group>
</vector>
`;

// 3. ic_nghu_logo.xml (In-app vector icon for App Bar and headers)
const inAppLogoXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="100"
    android:viewportHeight="100">
    <!-- Central Spire & Finial -->
    <path
        android:fillColor="#759A7E"
        android:pathData="M50,8 L53,17 L50,26 L47,17 Z" />
    <path
        android:fillColor="#759A7E"
        android:pathData="M49,24 h2 v12 h-2 z" />

    <!-- Left Outer Dome Wing -->
    <path
        android:fillColor="#759A7E"
        android:pathData="M48,29 C40,33 33,40 27,50 C20,61 18,73 20,83 C20.5,85 22,86 24,86 L32,86 C33,86 34,85 34,84 C33,75 35,65 40,57 C44,49 47,43 49,39 Z" />

    <!-- Right Outer Dome Wing -->
    <path
        android:fillColor="#759A7E"
        android:pathData="M52,29 C60,33 67,40 73,50 C80,61 82,73 80,83 C79.5,85 78,86 76,86 L68,86 C67,86 66,85 66,84 C67,75 65,65 60,57 C56,49 53,43 51,39 Z" />

    <!-- Left Inner Dome Flute -->
    <path
        android:fillColor="#759A7E"
        android:pathData="M49,38 C44,44 40,52 38,61 C36,69 36,78 37,86 L44,86 C44.5,86 45,85.5 45,84.8 C44.2,76 45,67 48,58 C49,53 50,48 50,43 Z" />

    <!-- Right Inner Dome Flute -->
    <path
        android:fillColor="#759A7E"
        android:pathData="M51,38 C56,44 60,52 62,61 C64,69 64,78 63,86 L56,86 C55.5,86 55,85.5 55,84.8 C55.8,76 55,67 52,58 C51,53 50,48 50,43 Z" />

    <!-- Center Core Flame / Brush (Terracotta) -->
    <path
        android:fillColor="#C45E47"
        android:pathData="M50,51 C52,56 55,60 56.5,65 C58,71 56,78 53.5,82 C52.5,84 51.2,86 50,87 C48.8,86 47.5,84 46.5,82 C44,78 42,71 43.5,65 C45,60 48,56 50,51 Z" />
    <path
        android:fillColor="#F4EDE4"
        android:pathData="M50,63 C51.2,67 52.8,71 52.2,75 C51.6,79 50.6,82 50,85 C49.4,82 48.4,79 47.8,75 C47.2,71 48.8,67 50,63 Z" />
</vector>
`;

// Save vector drawables to all target res dirs
for (const resDir of resDirs) {
  const drawableDir = path.join(resDir, 'drawable');
  fs.mkdirSync(drawableDir, { recursive: true });
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), backgroundXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), foregroundXml, 'utf8');
  fs.writeFileSync(path.join(drawableDir, 'ic_nghu_logo.xml'), inAppLogoXml, 'utf8');
}
console.log('Vector XML files written successfully.');

// SVG mark source for raster generation
const markSvg = fs.readFileSync(path.join(__dirname, '..', 'design', 'logos', 'nghu_mark_heritage.svg'), 'utf8');

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
  const squircleRadius = Math.round(d.size * 0.22);
  const markSize = Math.round(d.size * 0.65);
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
    background: #F4EDE4;
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
    background: #F4EDE4;
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
console.log('All Android raster mipmap and vector drawables successfully generated!');
