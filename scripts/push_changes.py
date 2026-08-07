#!/usr/bin/env python3
"""Push specific local files to the main branch via GitHub Contents API.

Works when github.com:443 (git protocol) is blocked but api.github.com is
reachable.  New files are created directly; existing files are updated with
the correct blob sha to avoid conflict errors.
"""
import os, sys, base64, json, urllib.request, urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN")
if not TOKEN:
    print("ERROR: GITHUB_TOKEN required"); sys.exit(1)

OWNER = "wjm-0112"
REPO = "pm-sop"
API = "https://api.github.com"
H = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "push-changes",
    "X-GitHub-Api-Version": "2022-11-28",
}

FILES = [
    "src/lib/crypto.ts",
    "src/lib/prd-templates.ts",
    "src/lib/types.ts",
    "src/lib/utils.ts",
    "src/db/index.ts",
    "src/services/sync.service.ts",
    "src/services/export.service.ts",
    "src/services/import.service.ts",
    "src/stores/useSyncStore.ts",
    "src/stores/useProjectStore.ts",
    "src/stores/useSettingsStore.ts",
    "src/stores/useRequirementStore.ts",
    "src/stores/usePlanningStore.ts",
    "src/stores/useAnalysisStore.ts",
    "src/stores/useUIStore.ts",
    "src/components/layout/AppInit.tsx",
    "src/components/layout/ProjectSwitcher.tsx",
    "src/components/layout/Sidebar.tsx",
    "src/components/projects/KanbanBoard.tsx",
    "src/providers/PWAProvider.tsx",
    "src/app/settings/page.tsx",
    "src/app/planning/prd/new/page.tsx",
    "docs/01-prd.md",
    "docs/03-database-schema.md",
    "docs/04-ui-design-guide.md",
]

def req(method, path, data=None):
    url = f"{API}/repos/{OWNER}/{REPO}{path}"
    r = urllib.request.Request(url, method=method)
    for k, v in H.items():
        r.add_header(k, v)
    if data is not None:
        b = json.dumps(data).encode()
        r.add_header("Content-Type", "application/json")
        r.data = b
    with urllib.request.urlopen(r, timeout=60) as resp:
        t = resp.read().decode()
        return json.loads(t) if t else {}

for f in FILES:
    raw = open(f, "rb").read()
    b64 = base64.b64encode(raw).decode()
    # 尝试获取远程 sha（若文件已存在）
    sha = None
    try:
        info = req("GET", f"/contents/{f}?ref=main")
        sha = info.get("sha")
        print(f"EXIST {f} sha={sha[:8]}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"NEW   {f}")
        else:
            raise
    body = {"message": "feat: 云端同步（E2E加密 + GitHub传输）", "content": b64, "branch": "main"}
    if sha:
        body["sha"] = sha
    req("PUT", f"/contents/{f}", body)
    print(f"  -> pushed")

print("DONE: main synced")
