#!/usr/bin/env python3
"""Sync the local deploy-config files (package.json, package-lock.json,
README.md) to the main branch via the GitHub Contents API.

The git smart-HTTP endpoint is blocked here, so we cannot `git push`;
this updates the 3 changed files individually on main instead.
"""
import os
import sys
import json
import base64
import urllib.request
import urllib.error

TOKEN = os.environ.get("GITHUB_TOKEN")
if not TOKEN:
    print("ERROR: GITHUB_TOKEN required")
    sys.exit(1)

OWNER = "wjm-0112"
REPO = "pm-sop"
API = "https://api.github.com"
H = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "push-main",
    "X-GitHub-Api-Version": "2022-11-28",
}


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


FILES = ["package.json", "package-lock.json", "README.md"]
for f in FILES:
    info = req("GET", f"/contents/{f}?ref=main")
    sha = info["sha"]
    raw = open(f, "rb").read()
    b64 = base64.b64encode(raw).decode()
    req("PUT", f"/contents/{f}", {
        "message": f"chore: sync {f} (GitHub Pages deploy config)",
        "content": b64,
        "sha": sha,
        "branch": "main",
    })
    print(f"updated main <- {f}")
print("DONE: main synced")
