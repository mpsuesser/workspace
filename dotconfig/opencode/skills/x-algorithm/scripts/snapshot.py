#!/usr/bin/env python3
"""Install or verify the immutable, complete upstream evidence snapshot.

Usage: python3 scripts/snapshot.py install /path/to/repo
       python3 scripts/snapshot.py verify
An install requires an absent manifest (an interrupted install can resume); updating this skill requires
re-auditing its references, not merely replacing the evidence beneath them.
"""

import collections
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
COMMIT = "3aa0fa336c4a20e4149b6151629b6050897bb8a5"
UPSTREAM = "https://github.com/xai-org/x-algorithm"


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args])


def install(repo):
    actual = git(repo, "rev-parse", "HEAD").decode().strip()
    if actual != COMMIT:
        sys.exit(f"Expected {COMMIT}; got {actual}")
    source = ROOT / "source"
    if (ROOT / "SOURCE-MANIFEST.json").exists():
        sys.exit("Snapshot manifest already exists; verify instead of overwriting it")
    records = []
    groups = collections.defaultdict(list)
    symbols = collections.defaultdict(list)
    for entry in git(repo, "ls-tree", "-rz", "HEAD").split(b"\0"):
        if not entry:
            continue
        metadata, raw_path = entry.split(b"\t", 1)
        mode, kind, blob = metadata.decode().split()
        path = raw_path.decode()
        if kind != "blob" or mode not in ("100644", "100755", "120000"):
            sys.exit(f"Unsupported tree entry: {metadata!r} {path}")
        data = git(repo, "cat-file", "blob", blob)
        target = source / path
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and target.read_bytes() != data:
            sys.exit(f"Existing file differs: {path}")
        target.write_bytes(data)
        text = None
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            pass
        record = {
            "path": path,
            "git_blob": blob,
            "git_mode": mode,
            "sha256": hashlib.sha256(data).hexdigest(),
            "bytes": len(data),
            "lines": len(text.splitlines()) if text is not None else None,
        }
        records.append(record)
        group = path.split("/")[0] if "/" in path else "root"
        groups[group].append(record)
        if text is not None:
            for number, line in enumerate(text.splitlines(), 1):
                if re.match(r"\s*(?:(?:pub(?:\([^)]*\))?|async|override|private|protected|final|sealed|abstract|case|static|export)\s+)*(?:def|fn|class|trait|struct|enum|object|type|const)\s+[A-Za-z_]", line):
                    symbols[group].append((path, number, line.strip()))
    provenance = {
        "repository": UPSTREAM,
        "commit": COMMIT,
        "commit_time": git(repo, "show", "-s", "--format=%cI", "HEAD").decode().strip(),
        "snapshot_date": "2026-09-22",
        "file_count": len(records),
        "bytes": sum(item["bytes"] for item in records),
        "files": records,
    }
    indexes = ROOT / "indexes"
    indexes.mkdir(exist_ok=True)
    atlas = ["# Complete source inventory", "", f"Upstream commit: `{COMMIT}`. Every tracked blob is bundled byte-for-byte under `source/`. Upstream symlinks are stored as inert text containing their exact link target; original modes are recorded in SOURCE-MANIFEST.json. This is an evidence bundle, not a deployment checkout.", "", "Search paths here; then use the topical reference first. The symbol indexes are mechanically extracted navigation aids, not semantic audits or complete parsers.", "", "| Component | Files | Bytes | Symbol index |", "|---|---:|---:|---|"]
    for group, items in sorted(groups.items()):
        atlas.append(f"| {group} | {len(items)} | {sum(item['bytes'] for item in items):,} | [symbols](symbols-{group}.md) |")
        lines = [f"# {group}: source symbols", "", "Mechanically extracted declarations. Search the bundled source for declarations not captured by this index.", ""]
        for path, number, declaration in symbols[group]:
            lines.append(f"- [`{path}:{number}`](../source/{path}#L{number}) — `{declaration.replace('`', chr(39))}`")
        (indexes / f"symbols-{group}.md").write_text("\n".join(lines) + "\n")
    for group, items in sorted(groups.items()):
        atlas.extend(["", f"## {group}", "", "| File | Lines | Bytes |", "|---|---:|---:|"])
        for item in items:
            path = item["path"]
            atlas.append(f"| [`{path}`](../source/{path}) | {item['lines'] if item['lines'] is not None else 'binary'} | {item['bytes']} |")
    (indexes / "source-inventory.md").write_text("\n".join(atlas) + "\n")
    pending_manifest = ROOT / "SOURCE-MANIFEST.json.pending"
    pending_manifest.write_text(json.dumps(provenance, indent=2) + "\n")
    pending_manifest.replace(ROOT / "SOURCE-MANIFEST.json")
    print(f"Installed {len(records)} exact upstream files ({provenance['bytes']:,} bytes)")


def verify():
    manifest = json.loads((ROOT / "SOURCE-MANIFEST.json").read_text())
    failures = []
    if manifest["commit"] != COMMIT or manifest["repository"] != UPSTREAM:
        failures.append("Manifest identity differs from the script's pinned commit/repository")
    if manifest["file_count"] != len(manifest["files"]):
        failures.append("Manifest file_count differs from record count")
    if manifest["bytes"] != sum(item["bytes"] for item in manifest["files"]):
        failures.append("Manifest byte total differs from record total")
    expected = set()
    for item in manifest["files"]:
        path = ROOT / "source" / item["path"]
        if item["path"] in expected:
            failures.append(f"Duplicate manifest path: {item['path']}")
        expected.add(item["path"])
        if not path.is_file():
            failures.append(f"Missing: {item['path']}")
        else:
            data = path.read_bytes()
            if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
                failures.append(f"Changed: {item['path']}")
            git_blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            if git_blob != item["git_blob"]:
                failures.append(f"Git blob ID mismatch: {item['path']}")
    actual = {str(path.relative_to(ROOT / "source")) for path in (ROOT / "source").rglob("*") if path.is_file()}
    failures.extend(f"Unexpected source file: {path}" for path in sorted(actual - expected))
    # Check ordinary relative Markdown links in authored references and indexes.
    docs = [ROOT / "SKILL.md", *sorted((ROOT / "references").glob("*.md")), *sorted((ROOT / "indexes").glob("*.md"))]
    links = 0
    citation_ranges = 0
    for path in docs:
        if not path.exists():
            failures.append(f"Missing authored entry: {path}")
            continue
        text = path.read_text()
        # Code declarations can contain syntax resembling Markdown links.
        link_text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
        link_text = re.sub(r"`[^`\n]*`", "", link_text)
        for match in re.finditer(r"\[[^\]]*\]\(([^\s)]+)\)", link_text):
            target = match.group(1)
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
                continue
            file_part = target.split("#", 1)[0]
            if file_part:
                links += 1
                if not (path.parent / file_part).exists():
                    failures.append(f"Broken link in {path.relative_to(ROOT)}: {target}")
        # Explicit file:line citations must use canonical upstream-relative
        # paths. Bare :line continuations and prose/table line numbers are not
        # interpreted by this check.
        if path.parent.name == "references" or path.name == "SKILL.md":
            for match in re.finditer(r"`(?:source/)?([A-Za-z0-9_./-]+\.[A-Za-z0-9]+):((?:L)?\d+(?:[-–](?:L)?\d+)?(?:,\s*(?:L)?\d+(?:[-–](?:L)?\d+)?)*)`", text):
                source_path, ranges = match.groups()
                target = ROOT / "source" / source_path
                if not target.is_file():
                    failures.append(f"Missing or noncanonical cited source in {path.name}: {match.group(0)}")
                    continue
                line_count = len(target.read_text().splitlines())
                for line_range in ranges.split(","):
                    citation_ranges += 1
                    bounds = re.split(r"[-–]", line_range.strip().replace("L", ""))
                    start, end = int(bounds[0]), int(bounds[-1])
                    if not 1 <= start <= end <= line_count:
                        failures.append(f"Out-of-range source citation in {path.name}: {match.group(0)} ({line_count} lines)")
    if failures:
        print("\n".join(failures))
        sys.exit(1)
    print(f"PASS: manifest identity/totals and {len(expected)} source files match SHA-256/Git blob IDs; {links} relative documentation links resolve; {citation_ranges} source citation ranges checked.")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "install":
        install(pathlib.Path(sys.argv[2]))
    elif len(sys.argv) == 2 and sys.argv[1] == "verify":
        verify()
    else:
        sys.exit(__doc__)
