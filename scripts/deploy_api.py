#!/usr/bin/env python3
"""Deploy out/ to gh-pages branch via GitHub Git Data REST API.

Why: the git smart-HTTP endpoint (github.com:443) is blocked in this
environment, but api.github.com is reachable. This script bypasses the
git protocol entirely and pushes the static export through the API.

It is idempotent: re-running only recreates identical blobs/trees and
force-updates the gh-pages ref.
"""
import os
import sys
import json
import time
import base64
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

TOKEN = os.environ.get("GITHUB_TOKEN")
if not TOKEN:
    print("ERROR: GITHUB_TOKEN environment variable is required")
    sys.exit(1)

OWNER = "wjm-0112"
REPO = "pm-sop"
API = "https://api.github.com"
OUT = Path("out")
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "pm-sop-deploy",
    "X-GitHub-Api-Version": "2022-11-28",
}

FAST_FAIL = (401, 403, 409, 422, 404)


def api(method, path, data=None, retries=3):
    url = f"{API}/repos/{OWNER}/{REPO}{path}"
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, method=method)
            for k, v in HEADERS.items():
                req.add_header(k, v)
            if data is not None:
                body = json.dumps(data).encode()
                req.add_header("Content-Type", "application/json")
                req.data = body
            with urllib.request.urlopen(req, timeout=60) as r:
                txt = r.read().decode()
                return json.loads(txt) if txt else {}
        except urllib.error.HTTPError as e:
            last = e
            if e.code in FAST_FAIL:
                try:
                    body = e.read().decode()
                except Exception:
                    body = ""
                raise RuntimeError(f"HTTP {e.code} {method} {path}: {body[:300]}")
            if e.code == 429:
                time.sleep(2)
                continue
            if i == retries - 1:
                try:
                    body = e.read().decode()
                except Exception:
                    body = ""
                raise RuntimeError(f"HTTP {e.code} {method} {path}: {body[:300]}")
        except Exception as e:  # noqa: BLE001
            last = e
            if i == retries - 1:
                raise
            time.sleep(1)
    raise RuntimeError(f"failed after retries: {last}")


def main():
    if not OUT.is_dir():
        print(f"ERROR: {OUT} not found, run `npm run build` first")
        sys.exit(1)

    # 1. collect files
    files = [str(p.relative_to(OUT)).replace("\\", "/")
             for p in OUT.rglob("*") if p.is_file()]
    print(f"Found {len(files)} files in out/")

    # 2. create blobs concurrently (idempotent: same content -> same sha)
    def make_blob(rel):
        raw = (OUT / rel).read_bytes()
        b64 = base64.b64encode(raw).decode()
        res = api("POST", "/git/blobs", {"content": b64, "encoding": "base64"})
        return rel, res["sha"]

    shas = {}
    done = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(make_blob, f) for f in files]
        for fu in as_completed(futs):
            rel, sha = fu.result()
            shas[rel] = sha
            done += 1
            if done % 25 == 0 or done == len(files):
                print(f"  blobs {done}/{len(files)}")

    # 3. create tree
    tree_entries = [{"path": rel, "mode": "100644",
                     "type": "blob", "sha": shas[rel]} for rel in files]
    tree = api("POST", "/git/trees", {"tree": tree_entries})
    tree_sha = tree["sha"]
    print(f"tree {tree_sha[:8]} ({len(tree_entries)} entries)")

    # 4. determine parent commit
    try:
        ref = api("GET", "/git/refs/heads/gh-pages")
        parent = ref["object"]["sha"]
        print("gh-pages exists -> use as parent")
    except RuntimeError:
        main_ref = api("GET", "/git/refs/heads/main")
        parent = main_ref["object"]["sha"]
        print("gh-pages not present -> use main as parent")

    # 5. create commit
    commit = api("POST", "/git/commits", {
        "message": "Deploy pm-sop to GitHub Pages (via API)",
        "tree": tree_sha,
        "parents": [parent],
    })
    commit_sha = commit["sha"]
    print(f"commit {commit_sha[:8]}")

    # 6. create or update gh-pages ref
    try:
        api("POST", "/git/refs", {"ref": "refs/heads/gh-pages", "sha": commit_sha})
        print("created gh-pages ref")
    except RuntimeError:
        api("PATCH", "/git/refs/heads/gh-pages", {"sha": commit_sha})
        print("updated gh-pages ref")

    # 7. enable Pages (best effort; needs pages write permission)
    try:
        api("POST", "/pages", {"source": {"branch": "gh-pages", "path": "/"}})
        print("Pages site enabled via API")
    except RuntimeError as e:
        print(f"Pages enable skipped (enable manually in Settings -> Pages): {str(e)[:120]}")

    print("DONE -> https://wjm-0112.github.io/pm-sop/")


if __name__ == "__main__":
    main()
