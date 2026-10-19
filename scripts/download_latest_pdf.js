const https = require('https');
const fs = require('fs');
const path = require('path');

// Clean HTML entities: &#038; -> &
const downloadUrl = 'https://nghu.ru/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download&wpfd_category_id=31&wpfd_file_id=19191&token=&preview=1';
const outPath = path.join(__dirname, '..', 'live_schedule_latest.pdf');

console.log('Downloading live PDF from:', downloadUrl);

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, { rejectUnauthorized: false }, res => {
    console.log('Status code:', res.statusCode);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return download(res.headers.location, dest, cb);
    }
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Content-Disposition:', res.headers['content-disposition']);
    res.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        console.log('Saved to:', dest, 'size:', fs.statSync(dest).size);
        cb();
      });
    });
  }).on('error', err => {
    fs.unlink(dest, () => {});
    console.error('Error downloading:', err.message);
  });
}

download(downloadUrl, outPath, () => {
  console.log('Download complete!');
});
