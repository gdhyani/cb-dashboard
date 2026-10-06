// Frames raw docs screenshots onto the docs gradient (PRD v1.36): docs-images-raw/<section>/<name>.png →
// public/docs/images/<section>/<name>.png. Raw captures are not committed; the framed PNGs are.
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW = path.join(ROOT, "docs-images-raw");
const OUT = path.join(ROOT, "public/docs/images");
const MAX_INNER = 1472; // widest screenshot inside the frame (never upscaled)
const PAD = 64; // gradient around the screenshot
const RADIUS = 14;

const walk = (d) =>
  readdirSync(d).flatMap((n) => (statSync(path.join(d, n)).isDirectory() ? walk(path.join(d, n)) : [path.join(d, n)]));

const gradient = (w, h) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#6d28d9"/><stop offset="0.55" stop-color="#a21caf"/><stop offset="1" stop-color="#db2777"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" rx="${RADIUS + 6}" fill="url(#g)"/></svg>`);

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
    .blur(18)
    .png()
    .toBuffer();
  const out = path.join(OUT, path.relative(RAW, file));
  mkdirSync(path.dirname(out), { recursive: true });
  await sharp(gradient(w + PAD * 2, h + PAD * 2))
    .composite([
      { input: shadow, left: PAD, top: PAD + 10 },
      { input: rounded, left: PAD, top: PAD },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(out);
  console.log(`${path.relative(OUT, out)}  ${Math.round(statSync(out).size / 1024)} KB`);
}
