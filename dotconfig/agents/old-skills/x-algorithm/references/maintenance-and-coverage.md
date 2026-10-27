# Maintenance, coverage, and offline use

## Coverage contract

This skill has two levels of coverage:

1. **Interpreted manuals:** the components, formulas, defaults, conditions, and operational implications relevant to For You, organized by question rather than repository layout.
2. **Lossless published evidence:** every tracked upstream blob at the pinned commit, including tests, schemas, offline jobs, model training, runtime infrastructure, and historical/alternative paths. This prevents an omitted prose summary from making an obscure detail unavailable offline.

The archive is complete for the public commit. That does not mean X published every production rule, weight artifact, prompt, dataset, experiment, or service implementation. A source file's presence also does not prove that a particular deployment enables it.

Installation validation compared the manifest directly against `git ls-tree -rz 3aa0fa336c4a20e4149b6151629b6050897bb8a5`: all **2,084 paths, Git modes, and blob IDs matched**, with no omissions. Every installed blob's SHA-256 was also checked. Supporting indexes contain all paths plus per-component declaration lookups; interpreted coverage is organized below.

## Component-to-manual map

| Published component | Primary manual |
|---|---|
| `home-mixer/`, `candidate-pipeline/` | [pipeline-and-filters](pipeline-and-filters.md), [features-and-context](features-and-context.md) |
| `home-mixer/scorers/`, `home-mixer/params/`, `vm-ranker/`, `docs/` | [ranking-and-weights](ranking-and-weights.md) |
| `phoenix/` | [phoenix-models](phoenix-models.md) |
| `thunder/`, `phoenix-rankall/`, `phoenix-rankall-strato/`, `simclusters/` | [retrieval-and-audiences](retrieval-and-audiences.md) |
| `visibility-filtering/`, `visibility-filtering-client/`, `safety-label-user-agg/` | [visibility-and-labels](visibility-and-labels.md) |
| `agatha/`, `bdsm/`, `user-cred-v2/`, `abuse-enforcement-service/` | [reputation-and-enforcement](reputation-and-enforcement.md) |
| `botmaker-rules/`, `botmaker/`, `scarecrow/` | [event-rules](event-rules.md) |
| `grox/`, `media-model-proxy/`, `clip/`, `adult-content/`, `pnsfwmedia/` | [content-and-media](content-and-media.md) |
| `under-the-hood/`, `takedowns/` | [transparency-and-takedowns](transparency-and-takedowns.md) |
| Root README/license | [overview-and-provenance](overview-and-provenance.md), bundled originals |

## Find an obscure fact offline

1. Search the relevant manual for the concept and aliases (tweet/post, favorite/like, retweet/repost, OON/out-of-network, IN/in-network).
2. Search [source-inventory.md](../indexes/source-inventory.md) for component/file names.
3. Search `indexes/symbols-<component>.md` for declarations. These indexes are regex-generated navigation aids, not a complete language parser.
4. Read the cited local source range and its callers/configuration/tests. Preserve conditional branches and missing-value behavior in the answer.
5. If the implementation is absent, identify the call/schema/parameter proving the boundary and state the missing detail. Reading an unrelated implementation is not a substitute.

The source tree can be searched directly with a file-content search tool. Numbered citations always refer to the original immutable blob; Markdown line anchors on local code links are navigation hints and may not be rendered by every viewer.

## Integrity check

See [verification-record.md](verification-record.md) for audit scope, independent mechanism checks, and the 12-question offline consultation test.

From this skill directory:

```sh
python3 scripts/snapshot.py verify
```

The verifier checks manifest identity/totals, every archived blob against its SHA-256 and Git blob ID, unexpected/missing source files, relative file links, and bounds of explicit source-line citations in manuals. This verifies consistency with the pinned manifest; completeness against the upstream commit comes from enumerating its full Git tree at installation. It does not prove citation semantics or runtime behavior. The repository is principally a transparency release; building unrelated services is unnecessary to consult it.

## Updating to a newer release

1. Clone/fetch into a separate working location. Record the new full commit ID/time and compare against `SOURCE-MANIFEST.json`.
2. Diff **all changed paths**, including defaults, gates, labels, training feature/label ordering, retrieval eligibility, and safety rules. Check additions/deletions, not just changed formulas.
3. Re-audit every affected manual and its strategy implications. Preserve a historical note only where it helps explain a known claim or behavior.
4. Regenerate evidence and indexes in a separate candidate skill directory, updating the script's expected commit and snapshot metadata deliberately. Never replace source under old line citations.
5. Re-run integrity/link checks and semantic cross-checks; verify all claimed defaults against executable configuration, all equations against implementation, and all live-path assertions against wiring.
6. Replace the installed skill as a coherent version only after source, citations, manuals, and routing agree. Record a dated change summary.

Do not auto-refresh on ordinary consultation: a stable cited snapshot is more referenceable than silently changing evidence.
