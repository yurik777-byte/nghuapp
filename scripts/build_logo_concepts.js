const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'design', 'logos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// =============================================================================
// CONCEPT 1: Geometric Heritage (Эволюционный геометрический купол)
// Clean symmetrical lobes, architectural spire, terracotta flame core
// =============================================================================

// 1A. Standalone Mark (Optimized for Android Adaptive Icon & Favicon - centered in safe area)
const markConcept1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Central Spire & Finial -->
  <path d="M50 8 L53 17 L50 26 L47 17 Z" fill="#759A7E"/>
  <rect x="49" y="24" width="2" height="12" rx="1" fill="#759A7E"/>

  <!-- Left Outer Dome Wing -->
  <path d="M48 29 C40 33 33 40 27 50 C20 61 18 73 20 83 C20.5 85 22 86 24 86 L32 86 C33 86 34 85 34 84 C33 75 35 65 40 57 C44 49 47 43 49 39 Z" fill="#759A7E"/>

  <!-- Right Outer Dome Wing -->
  <path d="M52 29 C60 33 67 40 73 50 C80 61 82 73 80 83 C79.5 85 78 86 76 86 L68 86 C67 86 66 85 66 84 C67 75 65 65 60 57 C56 49 53 43 51 39 Z" fill="#759A7E"/>

  <!-- Left Inner Dome Flute -->
  <path d="M49 38 C44 44 40 52 38 61 C36 69 36 78 37 86 L44 86 C44.5 86 45 85.5 45 84.8 C44.2 76 45 67 48 58 C49 53 50 48 50 43 Z" fill="#759A7E"/>

  <!-- Right Inner Dome Flute -->
  <path d="M51 38 C56 44 60 52 62 61 C64 69 64 78 63 86 L56 86 C55.5 86 55 85.5 55 84.8 C55.8 76 55 67 52 58 C51 53 50 48 50 43 Z" fill="#759A7E"/>

  <!-- Center Core Flame / Brush (Terracotta) -->
  <path d="M50 51 C52 56 55 60 56.5 65 C58 71 56 78 53.5 82 C52.5 84 51.2 86 50 87 C48.8 86 47.5 84 46.5 82 C44 78 42 71 43.5 65 C45 60 48 56 50 51 Z" fill="#C45E47"/>
  <path d="M50 63 C51.2 67 52.8 71 52.2 75 C51.6 79 50.6 82 50 85 C49.4 82 48.4 79 47.8 75 C47.2 71 48.8 67 50 63 Z" fill="#F4EDE4"/>
</svg>`;

// 1B. Full Lockup with Wordmark
const lockupConcept1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Central Spire -->
  <path d="M50 5 L52.5 12 L50 19 L47.5 12 Z" fill="#759A7E"/>
  <rect x="49" y="17" width="2" height="10" rx="1" fill="#759A7E"/>

  <!-- Left Outer Dome Wing -->
  <path d="M48 22 C41 26 34 32 28 41 C21 51 19 62 21 72 C21.5 74 23 75 25 75 L32 75 C33 75 34 74 34 73 C33 64 35 55 40 47 C44 40 47 35 49 31 Z" fill="#759A7E"/>

  <!-- Right Outer Dome Wing -->
  <path d="M52 22 C59 26 66 32 72 41 C79 51 81 62 79 72 C78.5 74 77 75 75 75 L68 75 C67 75 66 74 66 73 C67 64 65 55 60 47 C56 40 53 35 51 31 Z" fill="#759A7E"/>

  <!-- Left Inner Dome Flute -->
  <path d="M49 29 C45 34 41 41 39 49 C37 56 37 65 38 75 L44 75 C44.5 75 45 74.5 45 73.8 C44.2 65 45 57 48 49 C49 45 50 40 50 35 Z" fill="#759A7E"/>

  <!-- Right Inner Dome Flute -->
  <path d="M51 29 C55 34 59 41 61 49 C63 56 63 65 62 75 L56 75 C55.5 75 55 74.5 55 73.8 C55.8 65 55 57 52 49 C51 45 50 40 50 35 Z" fill="#759A7E"/>

  <!-- Center Core Flame / Brush (Terracotta) -->
  <path d="M50 41 C51.5 46 54.5 49 56 54 C57.8 60 55.5 67 53 71 C52 73 51 75 50 76 C49 75 48 73 47 71 C44.5 67 42.2 60 44 54 C45.5 49 48.5 46 50 41 Z" fill="#C45E47"/>
  <path d="M50 52 C51 56 52.5 59 52 63 C51.5 67 50.5 70 50 73 C49.5 70 48.5 67 48 63 C47.5 59 49 56 50 52 Z" fill="#F4EDE4"/>

  <!-- Clean Geometrical Wordmark -->
  <text x="50" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11.5" font-weight="800" fill="#2E3C32" text-anchor="middle" letter-spacing="3.5">НГХУ</text>
</svg>`;


// =============================================================================
// CONCEPT 2: Minimalist Negative Space (Силуэт и негативное пространство)
// Ultra-clean solid silhouette, flame formed by carved out void. 100% 1-color test.
// =============================================================================

// 2A. Standalone Mark
const markConcept2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Dome Body with sculpted negative space flame -->
  <path d="M50 8
           L53 16
           C53 16 61 26 69 37
           C78 50 81 65 79 79
           C78 84 74 85 71 85
           L63 85
           C62 78 61 70 59 64
           C60 70 58 79 55 85
           L45 85
           C42 79 40 70 41 64
           C39 70 38 78 37 85
           L29 85
           C26 85 22 84 21 79
           C19 65 22 50 31 37
           C39 26 47 16 47 16
           Z" fill="#759A7E"/>

  <!-- Negative Space Flame Cutout (Transparent Void) -->
  <path d="M50 46
           C53.5 53 57 58 57 66
           C57 74 53.5 81 50 86
           C46.5 81 43 74 43 66
           C43 58 46.5 53 50 46
           Z" fill="#F8F9FA"/>

  <!-- Terracotta Inner Flame Accent -->
  <path d="M50 53
           C52 58 54 62 54 68
           C54 75 51.8 80 50 84
           C48.2 80 46 75 46 68
           C46 62 48 58 50 53
           Z" fill="#C45E47"/>
</svg>`;

// 2B. Full Lockup with Wordmark
const lockupConcept2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Dome Silhouette -->
  <path d="M50 5
           L52.5 12
           C52.5 12 60 21 68 31
           C77 43 80 57 78 70
           C77 75 73 76 70 76
           L62 76
           C61 70 60 62 58 56
           C59 62 57 70 54 76
           L46 76
           C43 70 41 62 42 56
           C40 62 39 70 38 76
           L30 76
           C27 76 23 75 22 70
           C20 57 23 43 32 31
           C40 21 47.5 12 47.5 12
           Z" fill="#759A7E"/>

  <!-- Negative Space Flame Cutout -->
  <path d="M50 38
           C53 45 56 50 56 57
           C56 64 53 71 50 76
           C47 71 44 64 44 57
           C44 50 47 45 50 38
           Z" fill="#F8F9FA"/>

  <!-- Inner Terracotta Flame -->
  <path d="M50 45
           C51.8 50 53.5 54 53.5 59
           C53.5 65 51.5 70 50 74
           C48.5 70 46.5 65 46.5 59
           C46.5 54 48.2 50 50 45
           Z" fill="#C45E47"/>

  <!-- Clean Modern Wordmark -->
  <text x="50" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11.5" font-weight="800" fill="#2E3C32" text-anchor="middle" letter-spacing="3.5">НГХУ</text>
</svg>`;


// =============================================================================
// CONCEPT 3: Modern Monoline / Line-Art (Контурный стиль Linear / Notion)
// Uniform 3.5px line art, rounded terminals, contemporary, clean
// =============================================================================

// 3A. Standalone Mark
const markConcept3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Spire Finial -->
  <circle cx="50" cy="11" r="3" fill="#759A7E"/>

  <!-- Outer Dome Contour -->
  <path d="M50 15
           C50 20 38 30 30 43
           C21 57 21 73 25 83
           C25.5 84.5 27 85 29 85
           L71 85
           C73 85 74.5 84.5 75 83
           C79 73 79 57 70 43
           C62 30 50 20 50 15 Z"
        fill="none" stroke="#759A7E" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Inner Dome Arches -->
  <path d="M37 85 C37 68 43 52 50 38 C57 52 63 68 63 85"
        fill="none" stroke="#759A7E" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Central Flame Core (Terracotta Stroke & Fill) -->
  <path d="M50 52
           C53 58 55.5 63 55.5 69
           C55.5 76 53 82 50 85
           C47 82 44.5 76 44.5 69
           C44.5 63 47 58 50 52 Z"
        fill="#C45E47" stroke="#C45E47" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;

// 3B. Full Lockup with Wordmark
const lockupConcept3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <!-- Spire Finial -->
  <circle cx="50" cy="8" r="2.5" fill="#759A7E"/>

  <!-- Outer Dome Contour -->
  <path d="M50 11
           C50 15 38 24 30 36
           C21 49 21 65 25 75
           C25.5 76.5 27 77 29 77
           L71 77
           C73 77 74.5 76.5 75 75
           C79 65 79 49 70 36
           C62 24 50 15 50 11 Z"
        fill="none" stroke="#759A7E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Inner Dome Arches -->
  <path d="M37 77 C37 61 43 46 50 33 C57 46 63 61 63 77"
        fill="none" stroke="#759A7E" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Central Flame Core -->
  <path d="M50 45
           C52.5 51 55 55 55 61
           C55 67 52.8 73 50 76
           C47.2 73 45 67 45 61
           C45 55 47.5 51 50 45 Z"
        fill="#C45E47" stroke="#C45E47" stroke-width="1.6" stroke-linejoin="round"/>

  <!-- Clean Modern Wordmark -->
  <text x="50" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="11.5" font-weight="800" fill="#2E3C32" text-anchor="middle" letter-spacing="3.5">НГХУ</text>
</svg>`;

// Write all SVGs
fs.writeFileSync(path.join(outDir, 'nghu_mark_heritage.svg'), markConcept1, 'utf8');
fs.writeFileSync(path.join(outDir, 'nghu_lockup_heritage.svg'), lockupConcept1, 'utf8');

fs.writeFileSync(path.join(outDir, 'nghu_mark_negative.svg'), markConcept2, 'utf8');
fs.writeFileSync(path.join(outDir, 'nghu_lockup_negative.svg'), lockupConcept2, 'utf8');

fs.writeFileSync(path.join(outDir, 'nghu_mark_monoline.svg'), markConcept3, 'utf8');
fs.writeFileSync(path.join(outDir, 'nghu_lockup_monoline.svg'), lockupConcept3, 'utf8');

// Backward compatibility filenames
fs.writeFileSync(path.join(outDir, 'nghu_dome_heritage.svg'), lockupConcept1, 'utf8');
fs.writeFileSync(path.join(outDir, 'nghu_dome_negative_space.svg'), lockupConcept2, 'utf8');
fs.writeFileSync(path.join(outDir, 'nghu_dome_monoline.svg'), lockupConcept3, 'utf8');

console.log('All standalone marks and lockups generated in design/logos/');
