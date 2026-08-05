// 一次性脚本：把 [id] 动态路由改为 ?id= 查询参数静态路由（适配 output:'export'）。
// 同时改写所有 Link/router.push 调用点。运行：node scripts/convert-routes.mjs
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const ROOT = resolve('.');
const SRC = resolve('src');

// 旧 [id] 文件 -> 新路径
const fileMap = [
  ['src/app/requirements/[id]/page.tsx', 'src/app/requirements/detail/page.tsx'],
  ['src/app/requirements/[id]/edit/page.tsx', 'src/app/requirements/edit/page.tsx'],
  ['src/app/planning/versions/[id]/page.tsx', 'src/app/planning/versions/detail/page.tsx'],
  ['src/app/planning/versions/[id]/edit/page.tsx', 'src/app/planning/versions/edit/page.tsx'],
  ['src/app/planning/prd/[id]/page.tsx', 'src/app/planning/prd/edit/page.tsx'],
  ['src/app/planning/prd/[id]/preview/page.tsx', 'src/app/planning/prd/preview/page.tsx'],
  ['src/app/projects/tasks/[id]/page.tsx', 'src/app/projects/tasks/detail/page.tsx'],
  ['src/app/projects/tasks/[id]/edit/page.tsx', 'src/app/projects/tasks/edit/page.tsx'],
  ['src/app/projects/milestones/[id]/page.tsx', 'src/app/projects/milestones/detail/page.tsx'],
  ['src/app/projects/risks/[id]/page.tsx', 'src/app/projects/risks/detail/page.tsx'],
  ['src/app/analysis/competitors/[id]/page.tsx', 'src/app/analysis/competitors/detail/page.tsx'],
  ['src/app/analysis/competitors/[id]/edit/page.tsx', 'src/app/analysis/competitors/edit/page.tsx'],
  ['src/app/analysis/market-research/[id]/page.tsx', 'src/app/analysis/market-research/detail/page.tsx'],
  ['src/app/analysis/market-research/[id]/edit/page.tsx', 'src/app/analysis/market-research/edit/page.tsx'],
  ['src/app/analysis/personas/[id]/page.tsx', 'src/app/analysis/personas/detail/page.tsx'],
  ['src/app/analysis/personas/[id]/edit/page.tsx', 'src/app/analysis/personas/edit/page.tsx'],
];

// 路由链接改写（顺序：preview -> edit -> base）
const routes = [
  { base: 'requirements', detail: 'detail', edit: 'edit' },
  { base: 'planning/versions', detail: 'detail', edit: 'edit' },
  { base: 'planning/prd', detail: 'edit', edit: null, preview: 'preview' },
  { base: 'projects/tasks', detail: 'detail', edit: 'edit' },
  { base: 'projects/milestones', detail: 'detail', edit: null },
  { base: 'projects/risks', detail: 'detail', edit: null },
  { base: 'analysis/competitors', detail: 'detail', edit: 'edit' },
  { base: 'analysis/market-research', detail: 'detail', edit: 'edit' },
  { base: 'analysis/personas', detail: 'detail', edit: 'edit' },
];

function linkReplacements() {
  const reps = [];
  for (const r of routes) {
    const esc = r.base.replace(/\//g, '\\/');
    if (r.preview) {
      reps.push([
        new RegExp(`/${esc}/\\$\\{([^}]+)\\}/preview`, 'g'),
        '/' + r.base + '/' + r.preview + '?id=$${' + '$1}',
      ]);
    }
    if (r.edit) {
      reps.push([
        new RegExp(`/${esc}/\\$\\{([^}]+)\\}/edit`, 'g'),
        '/' + r.base + '/' + r.edit + '?id=$${' + '$1}',
      ]);
    }
    reps.push([
      new RegExp(`/${esc}/\\$\\{([^}]+)\\}`, 'g'),
      '/' + r.base + '/' + r.detail + '?id=$${' + '$1}',
    ]);
  }
  return reps;
}

function applyLinks(content) {
  for (const [re, rep] of linkReplacements()) content = content.replace(re, rep);
  return content;
}

function transformIdFile(content) {
  // useParams -> useSearchParams
  content = content.replace(
    "import { useParams, useRouter } from 'next/navigation';",
    "import { useRouter } from 'next/navigation';\nimport { useSearchParams } from 'next/navigation';",
  );
  content = content.replace(
    "const { id } = useParams<{ id: string }>();",
    "const id = useSearchParams().get('id');",
  );
  // 重命名默认导出函数，便于包裹
  const nameMatch = content.match(/export default function (\w+)\s*\(/);
  const innerName = nameMatch ? nameMatch[1] : 'Page';
  content = content.replace(/export default function (\w+)\s*\(/, 'function $1(');
  // 添加 Suspense 导入
  if (!/Suspense/.test(content)) {
    if (/from 'react'/.test(content)) {
      content = content.replace(/(import \{[^}]*\} from 'react';)/, "$1\nimport { Suspense } from 'react';");
    } else {
      content = content.replace(/('use client';)/, "$1\nimport { Suspense } from 'react';");
    }
  }
  // 添加 LoadingSpinner 导入（兜底）
  if (!/LoadingSpinner/.test(content)) {
    if (/from '@\/components\/ui'/.test(content)) {
      content = content.replace(
        /(import \{[^}]*\} from '@\/components\/ui';)/,
        "$1\nimport { LoadingSpinner } from '@/components/ui';",
      );
    } else {
      content = content.replace(/('use client';)/, "$1\nimport { LoadingSpinner } from '@/components/ui';");
    }
  }
  // 包裹 Suspense
  const wrapper = `\n\nexport default function ${innerName}Wrap() {\n  return (\n    <Suspense fallback={<LoadingSpinner className=\"h-8 w-8\" />}>\n      <${innerName} />\n    </Suspense>\n  );\n}\n`;
  content = content + wrapper;
  // 内部链接改写
  content = applyLinks(content);
  return content;
}

// 1) 转换 [id] 文件
const sourceSet = new Set(fileMap.map(([s]) => resolve(s)));
for (const [from, to] of fileMap) {
  const fromPath = resolve(from);
  if (!existsSync(fromPath)) {
    console.log('SKIP (missing)', from);
    continue;
  }
  const content = readFileSync(fromPath, 'utf8');
  const out = transformIdFile(content);
  mkdirSync(dirname(resolve(to)), { recursive: true });
  writeFileSync(resolve(to), out);
  console.log('CONVERT', from, '->', to);
}

// 2) 改写其余 .tsx 内的链接
function walk(dir, cb) {
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, cb);
    else if (name.endsWith('.tsx') && !sourceSet.has(full)) cb(full);
  }
}
let edited = 0;
walk(SRC, (file) => {
  const original = readFileSync(file, 'utf8');
  const updated = applyLinks(original);
  if (updated !== original) {
    writeFileSync(file, updated);
    edited++;
  }
});
console.log('LINK-REWRITTEN files:', edited);

// 3) 删除所有 [id] 目录
function removeIdDirs(dir) {
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === '[id]') {
        rmSync(full, { recursive: true, force: true });
        console.log('DELETE', full);
      } else {
        removeIdDirs(full);
      }
    }
  }
}
removeIdDirs(SRC);
console.log('DONE');
