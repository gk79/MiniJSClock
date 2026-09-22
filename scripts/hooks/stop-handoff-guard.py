#!/usr/bin/env python3
"""Optional deterministic Codex Stop hook.

It does not generate memories or rules. It only prevents a coding turn from stopping once when
there are repository changes but no active-task file is part of the working-tree change set.
This keeps task evidence/handoff explicit while avoiding recursive autonomous policy writing.
"""
import json
import subprocess
import sys
from pathlib import Path


def run(*args: str) -> str:
    try:
        return subprocess.check_output(args, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""

payload = json.load(sys.stdin)
if payload.get("stop_hook_active"):
    print(json.dumps({"continue": True}))
    raise SystemExit(0)

root = run("git", "rev-parse", "--show-toplevel")
if not root:
    print(json.dumps({"continue": True}))
    raise SystemExit(0)

status = run("git", "-C", root, "status", "--porcelain")
if not status:
    print(json.dumps({"continue": True}))
    raise SystemExit(0)

changed = []
for line in status.splitlines():
    path = line[3:].strip()
    if " -> " in path:
        path = path.split(" -> ", 1)[1]
    changed.append(path)

# Ignore pure scratch/learning metadata changes.
meaningful = [p for p in changed if not p.startswith(".agent-scratch/")]
if not meaningful:
    print(json.dumps({"continue": True}))
    raise SystemExit(0)

active_task_changed = any(p.startswith("tasks/active/") and p.endswith(".md") for p in changed)
if not active_task_changed:
    reason = (
        "Repository files changed, but no active task file is part of the working-tree changes. "
        "Before stopping, ensure the change has an active task contract and update its verification/handoff evidence. "
        "For non-trivial work, also run the harness retrospective and capture a learning candidate only if evidence justifies one."
    )
    print(json.dumps({"decision": "block", "reason": reason}))
else:
    print(json.dumps({"continue": True}))
