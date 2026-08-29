// Erzeugt public/og.jpg (1200x630): rundes Logo auf Papierton mit Wortmarke und Claim
import sharp from 'sharp';

const SIZE = 380;
const mask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`
);
const roundLogo = await sharp('src/assets/nc-logo.png')
  .resize(Math.round(SIZE * 1.58), Math.round(SIZE * 1.58), { fit: 'cover' })
  .extract({
    left: Math.round((SIZE * 1.58 - SIZE) / 2),
    top: Math.round((SIZE * 1.58 - SIZE) / 2),
    width: SIZE,
    height: SIZE,
  })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();

const bg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F9F7F3"/>
  <circle cx="600" cy="240" r="205" fill="#FF6B4A" opacity="0.18"/>
  <text x="600" y="530" text-anchor="middle" font-family="Georgia, serif" font-size="60"
    letter-spacing="3" fill="#122A2F">NextCourse</text>
  <text x="600" y="585" text-anchor="middle" font-family="Georgia, serif" font-size="27"
    font-style="italic" fill="#2B2D2F">Menschliche Kompetenz. Digitale Kraft.</text>
</svg>`);

await sharp(bg)
  .composite([{ input: roundLogo, left: 600 - SIZE / 2, top: 240 - SIZE / 2 }])
  .jpeg({ quality: 88 })
  .toFile('public/og.jpg');

// Favicon: runder Logo-Ausschnitt auf transparentem Grund
const FAV = 64;
const favMask = Buffer.from(
  `<svg width="${FAV}" height="${FAV}"><circle cx="${FAV / 2}" cy="${FAV / 2}" r="${FAV / 2}" fill="#fff"/></svg>`
);
await sharp('src/assets/nc-logo.png')
  .resize(Math.round(FAV * 1.58), Math.round(FAV * 1.58), { fit: 'cover' })
  .extract({
    left: Math.round((FAV * 1.58 - FAV) / 2),
    top: Math.round((FAV * 1.58 - FAV) / 2),
    width: FAV,
    height: FAV,
  })
  .composite([{ input: favMask, blend: 'dest-in' }])
  .png()
  .toFile('public/favicon.png');

console.log('og.jpg und favicon.png erzeugt');
