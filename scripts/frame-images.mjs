// Frames raw docs screenshots onto the cb brand panel (PRD v1.36, brand v1.73): docs-images-raw/<section>/<name>.png →
// public/docs/images/<section>/<name>.png. Raw captures are not committed; the framed PNGs are.
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "docs-images-raw");
const OUT = path.join(ROOT, "public/docs/images");
const MAX_INNER = 2560; // widest screenshot inside the frame (raw captures are 2x; never upscaled)
const PAD = 112; // brand panel around the screenshot
const RADIUS = 24;

const walk = (d) =>
  readdirSync(d).flatMap((n) => (statSync(path.join(d, n)).isDirectory() ? walk(path.join(d, n)) : [path.join(d, n)]));

// The landing page's ground (near-black) with the yellow highlighter as a soft glow from the top-left and a faint dot
// grid: dark artwork that sits well on both the light and the dark docs theme.
const gradient = (w, h) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14161a"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(${w * 0.9} ${h * 0.9})">
      <stop offset="0" stop-color="#ffd84a" stop-opacity="0.16"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#ecece7" fill-opacity="0.07"/></pattern>
  </defs>
  <rect width="${w}" height="${h}" rx="${RADIUS + 6}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" rx="${RADIUS + 6}" fill="url(#dots)"/>
  <rect width="${w}" height="${h}" rx="${RADIUS + 6}" fill="url(#glow)"/></svg>`);

const roundMask = (w, h) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" fill="#fff"/></svg>`,
  );

for (const file of walk(RAW).filter((f) => f.endsWith(".png"))) {
  const shot = await sharp(file).resize({ width: MAX_INNER, withoutEnlargement: true }).png().toBuffer();
  const { width: w = MAX_INNER, height: h = 0 } = await sharp(shot).metadata();
  const rounded = await sharp(shot)
    .composite([{ input: roundMask(w, h), blend: "dest-in" }])
    .png()
    .toBuffer();
  const shadow = await sharp({
    create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.45 } },
  })
    .composite([{ input: roundMask(w, h), blend: "dest-in" }])
    .blur(30)
    .png()
    .toBuffer();
  const out = path.join(OUT, path.relative(RAW, file));
  mkdirSync(path.dirname(out), { recursive: true });
  await sharp(gradient(w + PAD * 2, h + PAD * 2))
    .composite([
      { input: shadow, left: PAD, top: PAD + 16 },
      { input: rounded, left: PAD, top: PAD },
    ])
    .png({ compressionLevel: 9 }) // lossless: palette quantisation blurs text
    .toFile(out);
  console.log(`${path.relative(OUT, out)}  ${Math.round(statSync(out).size / 1024)} KB`);
}
