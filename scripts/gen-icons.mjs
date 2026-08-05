// 从 public/icon.svg 栅格化生成 PWA 所需 PNG 图标（192 / 512 / maskable / apple-touch-icon）。
// 运行：node scripts/gen-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const OUT = new URL('../public/icons/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const baseSvg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8');

// 标准版：直接铺满
function standard(size) {
  const resvg = new Resvg(baseSvg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

// maskable 版：在标准渐变底上把 "PM" 缩到中心 80% 安全区（保留满出血背景）
function maskable(size) {
  const svg = baseSvg
    .replace('<rect width="512" height="512" rx="112" fill="url(#g)"/>', '')
    .replace(
      '<text x="256" y="268" font-family="Arial, Helvetica, sans-serif" font-size="208" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">PM</text>',
      '<rect width="512" height="512" fill="#3B82F6"/><text x="256" y="268" font-family="Arial, Helvetica, sans-serif" font-size="166" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">PM</text>',
    );
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

const jobs = [
  ['icon-192.png', () => standard(192)],
  ['icon-512.png', () => standard(512)],
  ['icon-maskable-512.png', () => maskable(512)],
  ['apple-touch-icon.png', () => standard(180)],
];

for (const [name, make] of jobs) {
  writeFileSync(new URL(name, OUT), make());
  console.log('generated', name);
}
