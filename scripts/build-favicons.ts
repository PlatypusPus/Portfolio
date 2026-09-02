// Builds the favicons from src/assets/bongo-cat.gif. Run with `npm run favicons`
// after changing the palette or the source art; the outputs are committed, so
// this is not part of the normal build.
//
// Why a script rather than hand-made files: the icon colours ARE the palette.
// Anything hand-exported drifts the first time --accent moves.
//
// The crop, downscale and recolour are all done here in JS rather than through
// sharp, for two reasons found the hard way:
//
//  - sharp keeps only the LAST resize in a pipeline and silently drops earlier
//    ones, so a crop expressed as chained resizes does nothing at all.
//  - `extract` is strip-wide on an animated image, so it would slice across
//    frames rather than crop each one.
//
// So sharp is used for exactly two things: decoding the source to raw pixels,
// and providing an animated container of the right size whose pixels are then
// overwritten wholesale with `blend:"source"`. That keeps the GIF animated
// while every pixel decision stays here, where it can be reasoned about.

import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { DARK, LIGHT } from "../src/tokens.ts";

const SRC = "src/assets/bongo-cat.gif";
const SIZE = 64; // the master; browsers scale down from it

/** Region of the 319x498 source to keep, in source pixels. The cat's head spans
 *  roughly x 40-304 and y 155-300 with the keyboard's edge crossing beneath it,
 *  so this is that with a margin — wide enough to keep both ears, which a
 *  square centre-crop clips. */
const CROP = { x: 10, y: 120, w: 305, h: 290 };

/** Below this luminance a pixel counts as ink. The art is line work on white:
 *  thresholding rather than shading is what stops the keyboard's key outlines
 *  averaging into one solid block at icon size, which is what buried the cat. */
const INK = 0.3;

/** Corner radius, as a fraction of the icon's size. */
const RADIUS = 0.22;

/** The drawing is resolved once on this grid and every output size samples it,
 *  rather than each size thresholding the source for itself. Otherwise they
 *  disagree: at 180px the keyboard's key outlines stay dark enough to count as
 *  ink and come back as a row of dashes, where at 64px they average away. Same
 *  icon at every size, only bigger pixels. */
const DESIGN = 64;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** sharp merges identical frames when it writes a GIF, so the source is pushed
 *  through one write first: after this the page count is stable and the pixel
 *  data and the container are guaranteed to agree about it. */
const normalised = await sharp(SRC, { animated: true }).gif().toBuffer();
const meta = await sharp(normalised, { animated: true }).metadata();
const SRC_W = meta.width!;
const PAGE_H = meta.pageHeight!;
const PAGES = meta.pages!;

const { data: grey } = await sharp(normalised, { animated: true })
  .flatten({ background: "#ffffff" })
  .greyscale()
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const CHANNELS = grey.length / (SRC_W * PAGE_H * PAGES);

/**
 * The drawing, once, at DESIGN resolution: one bit per cell, per frame.
 * Box-averaging before thresholding is what keeps the line weight even, and the
 * dilation afterwards is what lets a one-pixel line survive being seen at 16px.
 */
const stencil = () => {
  const frames: Uint8Array[] = [];
  for (let page = 0; page < PAGES; page++) {
    const ink = new Uint8Array(DESIGN * DESIGN);
    for (let y = 0; y < DESIGN; y++) {
      for (let x = 0; x < DESIGN; x++) {
        const x0 = CROP.x + (x * CROP.w) / DESIGN;
        const x1 = CROP.x + ((x + 1) * CROP.w) / DESIGN;
        const y0 = CROP.y + (y * CROP.h) / DESIGN;
        const y1 = CROP.y + ((y + 1) * CROP.h) / DESIGN;
        let sum = 0;
        let n = 0;
        for (let sy = Math.floor(y0); sy < Math.ceil(y1); sy++) {
          for (let sx = Math.floor(x0); sx < Math.ceil(x1); sx++) {
            const cx = Math.min(SRC_W - 1, Math.max(0, sx));
            const cy = Math.min(PAGE_H - 1, Math.max(0, sy));
            sum += grey[((page * PAGE_H + cy) * SRC_W + cx) * CHANNELS];
            n++;
          }
        }
        ink[y * DESIGN + x] = n && sum / n / 255 < INK ? 1 : 0;
      }
    }
    const grown = new Uint8Array(DESIGN * DESIGN);
    for (let y = 0; y < DESIGN; y++) {
      for (let x = 0; x < DESIGN; x++) {
        let on = 0;
        for (let j = -1; j <= 1 && !on; j++) {
          for (let i = -1; i <= 1 && !on; i++) {
            const xx = x + i;
            const yy = y + j;
            if (xx < 0 || yy < 0 || xx >= DESIGN || yy >= DESIGN) continue;
            on = ink[yy * DESIGN + xx];
          }
        }
        grown[y * DESIGN + x] = on;
      }
    }
    frames.push(grown);
  }
  return frames;
};

const STENCIL = stencil();

/** Paint the stencil in one theme's colours at `size`, as raw RGBA for the
 *  whole frame strip. The corner mask is evaluated at the output resolution,
 *  so it stays round while the drawing stays on its grid. */
function paint(size: number, bg: string, accent: string) {
  const [Br, Bg, Bb] = rgb(bg);
  const [Ar, Ag, Ab] = rgb(accent);
  const out = Buffer.alloc(size * size * PAGES * 4);
  const radius = Math.round(size * RADIUS);

  for (let page = 0; page < PAGES; page++) {
    const cells = STENCIL[page];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const on = cells[Math.floor((y * DESIGN) / size) * DESIGN + Math.floor((x * DESIGN) / size)];
        const p = page * size * size + y * size + x;
        out[p * 4 + 0] = on ? Ar : Br;
        out[p * 4 + 1] = on ? Ag : Bg;
        out[p * 4 + 2] = on ? Ab : Bb;
        // Rounded square: distance to the nearest corner arc's centre. The edge
        // is hard because GIF alpha is 1 bit — there is no partial coverage to
        // give the rim, so browsers smooth it on the way down from 64px.
        const dx = Math.max(0, radius - x, x - (size - 1 - radius));
        const dy = Math.max(0, radius - y, y - (size - 1 - radius));
        out[p * 4 + 3] = Math.hypot(dx, dy) <= radius ? 255 : 0;
      }
    }
  }
  return out;
}

const overlay = (size: number, bg: string, accent: string) =>
  sharp(paint(size, bg, accent), { raw: { width: size, height: size * PAGES, channels: 4 } })
    .png()
    .toBuffer();

// Pixels here are irrelevant — every one is overwritten. All this provides is an
// animated container of the right shape, with its frame delays intact.
const container = await sharp(normalised, { animated: true })
  .resize({ width: SIZE, height: SIZE, fit: "fill" })
  .gif()
  .toBuffer();
if ((await sharp(container, { animated: true }).metadata()).pages !== PAGES) {
  throw new Error("container page count drifted from the source");
}

let master: Buffer | undefined;
for (const [name, theme] of [["dark", DARK], ["light", LIGHT]] as const) {
  const gif = await sharp(container, { animated: true })
    .composite([{ input: await overlay(SIZE, theme.bg, theme.accent), blend: "source" }])
    .gif()
    .toBuffer();
  writeFileSync(`public/favicon-${name}.gif`, gif);
  if (name === "dark") master = gif;
  console.log(`favicon-${name}.gif  ${gif.length} bytes`);
}

/** ICO is a 6-byte header, one 16-byte directory entry per image, then the
 *  payloads. PNG payloads are legal inside an ICO and every current browser
 *  reads them, which saves writing a BMP encoder. */
const ico = (entries: { size: number; buf: Buffer }[]) => {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dir = entries.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  return Buffer.concat([head, ...dir, ...entries.map((e) => e.buf)]);
};

// A bare /favicon.ico request predates any of the <link> tags and cannot know
// the theme, so it gets the dark one — the site's default. Downscaled from the
// master rather than re-thresholded per size: below ~32px re-thresholding drops
// strokes entirely, where a downscale keeps them as grey.
const still = sharp(master!, { page: 0 });
const stillPng = await still.png().toBuffer();
writeFileSync(
  "public/favicon.ico",
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        buf: await sharp(stillPng).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer(),
      })),
    ),
  ),
);

// iOS ignores GIF for a home-screen icon and rounds the corners itself, so this
// one is rendered at its own size — sharp enough to stand on a wallpaper — and
// flattened, since a transparent rim would show the wallpaper through it.
const touch = 180;
await sharp(paint(touch, DARK.bg, DARK.accent), { raw: { width: touch, height: touch * PAGES, channels: 4 } })
  .extract({ left: 0, top: 0, width: touch, height: touch })
  .flatten({ background: DARK.bg })
  .png({ compressionLevel: 9 })
  .toFile("public/apple-touch-icon.png");

console.log("favicon.ico + apple-touch-icon.png written");
