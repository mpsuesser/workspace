/**
 * Standalone test harness (no test framework needed).
 *
 *   node --experimental-strip-types find-to-fd/translate.test.ts
 *
 * Part 1: unit assertions on the rewrite string output.
 * Part 2: behavioral parity — run real `find` and the rewritten `fd` against a
 *         fixture tree and assert identical result sets.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { rewriteFindToFd } from "./translate.ts";

let failures = 0;
let passes = 0;

function eq(name: string, actual: unknown, expected: unknown): void {
	const a = JSON.stringify(actual);
	const e = JSON.stringify(expected);
	if (a === e) {
		passes++;
	} else {
		failures++;
		console.error(`FAIL: ${name}\n  expected: ${e}\n  actual:   ${a}`);
	}
}

// ---------------------------------------------------------------------------
// Part 1: rewrite string assertions
// ---------------------------------------------------------------------------

// Translatable cases
eq("simple -name", rewriteFindToFd("find . -name '*.ts'"), "fd -H -I --search-path . -g -s '*.ts'");
eq("iname", rewriteFindToFd("find . -iname '*.TS'"), "fd -H -I --search-path . -g -i '*.TS'");
eq("type d + iname (the motivating case)",
	rewriteFindToFd('find / -type d -iname "*effect*skill*"'),
	"fd -H -I -t d --search-path / -g -i '*effect*skill*'");
eq("type only, no pattern", rewriteFindToFd("find /var -type f"), "fd -H -I -t f --search-path /var");
eq("maxdepth", rewriteFindToFd("find . -maxdepth 2 -name '*.js'"),
	"fd -H -I --max-depth 2 --search-path . -g -s '*.js'");
eq("mindepth+maxdepth", rewriteFindToFd("find . -mindepth 1 -maxdepth 3 -type f -name x"),
	"fd -H -I -t f --min-depth 1 --max-depth 3 --search-path . -g -s 'x'");
eq("multiple roots", rewriteFindToFd("find src test -name '*.ts'"),
	"fd -H -I --search-path src --search-path test -g -s '*.ts'");
eq("bail: comma type list (GNU-only)", rewriteFindToFd("find . -type f,d -name x"), null);
eq("bail: repeated -type", rewriteFindToFd("find . -type f -type d"), null);
eq("no root defaults (find .)", rewriteFindToFd("find -name '*.md'"), "fd -H -I -g -s '*.md'");
eq("follow -L", rewriteFindToFd("find -L . -name x"), "fd -H -I -L --search-path . -g -s 'x'");
eq("-P dropped", rewriteFindToFd("find -P . -type l"), "fd -H -I -t l --search-path .");
eq("-print dropped", rewriteFindToFd("find . -name x -print"), "fd -H -I --search-path . -g -s 'x'");
eq("absolute path root", rewriteFindToFd("find /usr/bin -type f"), "fd -H -I -t f --search-path /usr/bin");
eq("/usr/bin/find form", rewriteFindToFd("/usr/bin/find . -name x"), "fd -H -I --search-path . -g -s 'x'");
eq("glob starting with dash gets --", rewriteFindToFd("find . -name -foo"),
	"fd -H -I --search-path . -g -s -- '-foo'");
eq("single-quote inside pattern", rewriteFindToFd("find . -name \"a'b\""),
	"fd -H -I --search-path . -g -s 'a'\\''b'");

// Surrounding context preserved byte-for-byte
eq("trailing 2>/dev/null", rewriteFindToFd("find / -name x 2>/dev/null"),
	"fd -H -I --search-path / -g -s 'x' 2>/dev/null");
eq("piped to head", rewriteFindToFd("find / -iname '*.so' 2>/dev/null | head"),
	"fd -H -I --search-path / -g -i '*.so' 2>/dev/null | head");
eq("after &&", rewriteFindToFd("cd /tmp && find . -name x"), "cd /tmp && fd -H -I --search-path . -g -s 'x'");
eq("two finds in one line", rewriteFindToFd("find a -name x; find b -type d"),
	"fd -H -I --search-path a -g -s 'x'; fd -H -I -t d --search-path b");
eq("redirect to file then pipe", rewriteFindToFd("find . -name x > out.txt"),
	"fd -H -I --search-path . -g -s 'x' > out.txt");

// Bail cases (must return null — leave find untouched)
eq("bail: -exec", rewriteFindToFd("find . -name x -exec rm {} \\;"), null);
eq("bail: -delete", rewriteFindToFd("find . -name x -delete"), null);
eq("bail: -path", rewriteFindToFd("find . -path '*/b/*'"), null);
eq("bail: -regex", rewriteFindToFd("find . -regex '.*foo'"), null);
eq("bail: -size", rewriteFindToFd("find . -size +1M"), null);
eq("bail: -mtime", rewriteFindToFd("find . -mtime -1"), null);
eq("bail: -newer", rewriteFindToFd("find . -newer ref"), null);
eq("bail: -empty", rewriteFindToFd("find . -empty"), null);
eq("bail: -prune", rewriteFindToFd("find . -name node_modules -prune"), null);
eq("bail: -print0", rewriteFindToFd("find . -name x -print0"), null);
eq("bail: -o (or)", rewriteFindToFd("find . -name a -o -name b"), null);
eq("bail: parens", rewriteFindToFd("find . \\( -name a \\)"), null);
eq("bail: !", rewriteFindToFd("find . ! -name a"), null);
eq("bail: -H", rewriteFindToFd("find -H . -name x"), null);
eq("bail: maxdepth 0", rewriteFindToFd("find . -maxdepth 0 -name x"), null);
eq("bail: two -name", rewriteFindToFd("find . -name a -name b"), null);
eq("bail: -type D (door)", rewriteFindToFd("find . -type D"), null);
eq("bail: heredoc present", rewriteFindToFd("cat <<EOF\nfind . -name x\nEOF"), null);
eq("bail: pattern with var", rewriteFindToFd('find . -name "$x"'), null);
eq("bail: pattern with cmd subst", rewriteFindToFd("find . -name `echo x`"), null);
eq("bail: redir mid-args", rewriteFindToFd("find . 2>/dev/null -name x"), null);
eq("no find at all", rewriteFindToFd("ls -la | grep find"), null);
eq("find as substring of path arg only", rewriteFindToFd("grep find file.txt"), null);
eq("find as grep target (not command head)", rewriteFindToFd("echo hi | grep -i find"), null);
eq("bail: relative ./find script", rewriteFindToFd("./find . -name x"), null);
eq("bail: relative tools/find script", rewriteFindToFd("tools/find . -name x"), null);
eq("findfoo is not find", rewriteFindToFd("findfoo . -name x"), null);
eq("subshell ( find ) is rewritten", rewriteFindToFd("( find . -name x )"),
	"( fd -H -I --search-path . -g -s 'x' )");
eq("primary order swapped", rewriteFindToFd("find . -name x -maxdepth 2"),
	"fd -H -I --max-depth 2 --search-path . -g -s 'x'");
eq("-name value that looks like a flag", rewriteFindToFd("find . -name -type"),
	"fd -H -I --search-path . -g -s -- '-type'");
eq("dir named with digits as root", rewriteFindToFd("find 2 -name x"),
	"fd -H -I --search-path 2 -g -s 'x'");

// Root with $VAR is preserved raw (shell re-expands after --search-path)
eq("root with env var kept raw", rewriteFindToFd("find $HOME -name x"),
	"fd -H -I --search-path $HOME -g -s 'x'");
eq("root with tilde kept raw", rewriteFindToFd("find ~/src -name x"),
	"fd -H -I --search-path ~/src -g -s 'x'");

// ---------------------------------------------------------------------------
// Part 2: behavioral parity against a real fixture tree
// ---------------------------------------------------------------------------

function hasFd(): boolean {
	try {
		execFileSync("fd", ["--version"], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

function runShell(cmd: string, cwd: string, root: string): string[] {
	const out = execFileSync("bash", ["-c", cmd], { encoding: "utf8", cwd });
	return normalize(out, cwd, root);
}

// Canonicalize a result set to absolute paths so we can compare `find` and `fd`
// fairly, neutralizing the three known cosmetic differences:
//   - fd omits the `./` prefix on relative roots
//   - fd appends a trailing `/` to directories (resolve() drops it)
//   - fd never emits the search root itself (find does, at depth 0)
function normalize(out: string, cwd: string, root: string): string[] {
	const rootAbs = resolve(cwd, root);
	const set = new Set<string>();
	for (const raw of out.split("\n")) {
		const l = raw.trim();
		if (l.length === 0) continue;
		const abs = resolve(cwd, l);
		if (abs === rootAbs) continue; // ignore root-inclusion difference
		set.add(abs);
	}
	return [...set].sort();
}

function parityCheck(name: string, root: string, cwd: string, findArgs: string[]): void {
	if (!fdReady) return;
	const findCmd = `find ${root} ${findArgs.join(" ")}`;
	const rewritten = rewriteFindToFd(findCmd);
	if (rewritten === null) {
		failures++;
		console.error(`FAIL parity ${name}: expected a rewrite but got null for: ${findCmd}`);
		return;
	}
	let findOut: string[];
	let fdOut: string[];
	try {
		findOut = runShell(findCmd, cwd, root);
	} catch (e: any) {
		findOut = normalize(e.stdout ?? "", cwd, root);
	}
	try {
		fdOut = runShell(rewritten, cwd, root);
	} catch (e: any) {
		failures++;
		console.error(`FAIL parity ${name}: fd command errored: ${rewritten}\n  ${e.message}`);
		return;
	}
	eq(`parity: ${name}`, fdOut, findOut);
}

const fdReady = hasFd();
let fixture = "";
if (fdReady) {
	fixture = mkdtempSync(join(tmpdir(), "find-to-fd-"));
	mkdirSync(join(fixture, "a/b/c"), { recursive: true });
	mkdirSync(join(fixture, ".hidden"), { recursive: true });
	mkdirSync(join(fixture, "node_modules/pkg"), { recursive: true });
	mkdirSync(join(fixture, "deep/d1/d2/d3"), { recursive: true });
	writeFileSync(join(fixture, "a/foo.ts"), "x");
	writeFileSync(join(fixture, "a/b/Bar.TS"), "x");
	writeFileSync(join(fixture, "a/b/c/baz.txt"), "x");
	writeFileSync(join(fixture, ".hidden/secret.ts"), "x");
	writeFileSync(join(fixture, "node_modules/pkg/dep.ts"), "x");
	writeFileSync(join(fixture, "deep/d1/d2/d3/deep.ts"), "x");
	writeFileSync(join(fixture, ".gitignore"), "node_modules\n");
	try {
		execFileSync("git", ["init", "-q"], { cwd: fixture, stdio: "ignore" });
	} catch {}

	parityCheck("name glob", fixture, fixture, ["-name", "'*.ts'"]);
	parityCheck("iname glob", fixture, fixture, ["-iname", "'*.ts'"]);
	parityCheck("type d", fixture, fixture, ["-type", "d"]);
	parityCheck("type f", fixture, fixture, ["-type", "f"]);
	parityCheck("type f + name", fixture, fixture, ["-type", "f", "-name", "'*.ts'"]);
	parityCheck("maxdepth 2 name", fixture, fixture, ["-maxdepth", "2", "-name", "'*.ts'"]);
	parityCheck("mindepth 3 type f", fixture, fixture, ["-mindepth", "3", "-type", "f"]);
	parityCheck("name substring case-sensitive", fixture, fixture, ["-name", "'*a*'"]);
	parityCheck("iname substring", fixture, fixture, ["-iname", "'*A*'"]);
	parityCheck("no matches", fixture, fixture, ["-name", "'zzz-nope'"]);

	// Relative-root parity (run from inside the fixture): exercises the ./ prefix path.
	parityCheck("relative root .", ".", fixture, ["-name", "'*.ts'"]);

	rmSync(fixture, { recursive: true, force: true });
} else {
	console.warn("fd not found on PATH — skipping behavioral parity checks.");
}

console.log(`\n${passes} passed, ${failures} failed${fdReady ? "" : " (parity skipped)"}`);
process.exit(failures === 0 ? 0 : 1);
