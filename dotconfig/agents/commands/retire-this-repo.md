---
description: Permanently retire a repository while preserving its history and artifacts
---

Retire the repository indicated by `$ARGUMENTS` or by the current conversation and workspace context. Resolve the intended repository pragmatically; ask only if there is genuine ambiguity.

Treat this as permanent project retirement: the code and published artifacts remain available for historical or existing use, but maintenance, support, compatibility work, security fixes, releases, and contributions have ended with no intention to resume.

Carry the retirement through end-to-end in this order:

1. Inspect the repository, its remote host, open issues and contributions, releases, automation, documentation, and any package registries or other distribution surfaces it publishes to. Identify maintained replacements only when one actually exists.
2. Make a small final documentation change that puts an unmistakable retirement notice at the top of the primary README. State the retirement date, permanent unmaintained status, historical or experimental nature where appropriate, lack of future fixes, and the maintained replacement when applicable. Record the retirement in an existing changelog if the repository has one.
3. Remove release and publishing automation plus host-facing issue and contribution templates. Preserve ordinary CI configuration, contribution documentation, source code, tests, documentation, history, licenses, releases, and other useful artifacts.
4. Verify the final repository change, commit it, and push it before making the remote read-only.
5. Courteously close outstanding issues and contributions with a concise retirement explanation, thanking external contributors where applicable.
6. Mark packages and other published artifacts as deprecated or archived using each distribution service's native mechanism. Keep existing versions available; use a clear retirement message and replacement link when applicable. Do not publish a ceremonial final version merely to announce retirement. If a service requires the user's interactive authentication, ask them to complete that action and verify it before continuing.
7. Only after every discovered distribution surface is retired, update the repository host's public metadata so retirement is visible in listings, disable contribution surfaces, and use its native archive or read-only mechanism last. Do not cross this gate with an outstanding registry action unless the user explicitly chooses that exception.
8. Verify every applicable surface shows the retirement state and that preserved code, history, releases, and package versions remain accessible. Report completed actions and any surface that could not be updated.

Prefer reversible deprecation and archival controls over deletion or unpublishing. Adapt the details to the repository and services discovered rather than assuming a particular forge, registry, language, or project layout.
