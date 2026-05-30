/**
 * Pure logic for rewriting `find` invocations into equivalent `fd` invocations.
 *
 * Design philosophy: CORRECTNESS FIRST. We only rewrite a `find` command when
 * every part of its expression falls inside a known-safe subset that maps
 * exactly onto `fd` (verified empirically against fd 10.4.2 + GNU/BSD find).
 * Anything outside that subset leaves the original `find` command byte-for-byte
 * untouched, so behavior can never silently change.
 *
 * Safe subset (translated):
 *   - path operands                       -> --search-path <root>
 *   - exactly one -name / -iname GLOB     -> -g [-i] -- <glob>
 *   - one or more -type f|d|l|b|c|p|s      -> -t <letter> ...
 *   - -maxdepth N (N>=1) / -mindepth N     -> --max-depth N / --min-depth N
 *   - -L / -follow                         -> -L
 *   - -P                                   -> dropped (fd default)
 *   - -print                               -> dropped (find default action)
 *   - always inject -H -I                  -> find-faithful scope (hidden + no ignore files)
 *
 * Everything else (-exec, -delete, -path, -regex, -size, -mtime, -newer, -empty,
 * -prune, -o/-a/!/-not, (), -print0, -ls, -depth, -H, command substitution in
 * patterns, heredocs, maxdepth 0, ...) -> BAIL, leave find untouched.
 */

export type Token = {
	start: number;
	end: number;
	text: string; // exact original substring (preserves quoting)
	value: string; // unquoted/unescaped logical value (for words)
	type: "word" | "control" | "redir";
};

const FIND_TYPE_MAP: Record<string, string> = {
	f: "f",
	d: "d",
	l: "l",
	b: "b",
	c: "c",
	p: "p",
	s: "s",
};

// Operators ordered longest-first so the matcher is greedy.
// Control operators reset "command position"; redirections do not.
const CONTROL_OPS = ["&&", "||", ";;", "|&", "|", "&", ";", "(", ")", "\n", "\r"];
const REDIR_OPS = ["&>>", "&>", ">>", ">&", "<>", "<&", ">", "<"];

function isWhitespace(ch: string): boolean {
	return ch === " " || ch === "\t";
}

/**
 * Try to match a shell operator at position `p`. Returns the matched operator
 * length and type, or null if no operator starts here.
 *
 * Handles digit-prefixed redirections (e.g. `2>`, `1>>`) so that
 * `find . -name x 2>/dev/null` tokenizes the `2>` as a redirection rather than
 * swallowing the `2` as a find argument.
 */
function matchOperator(s: string, p: number): { len: number; type: "control" | "redir" } | null {
	// Digit-prefixed redirection: one or more digits immediately followed by > or <.
	let d = p;
	while (d < s.length && s[d] >= "0" && s[d] <= "9") d++;
	if (d > p && d < s.length && (s[d] === ">" || s[d] === "<")) {
		for (const op of REDIR_OPS) {
			if (s.startsWith(op, d)) {
				return { len: d - p + op.length, type: "redir" };
			}
		}
	}

	for (const op of REDIR_OPS) {
		if (s.startsWith(op, p)) return { len: op.length, type: "redir" };
	}
	for (const op of CONTROL_OPS) {
		if (s.startsWith(op, p)) return { len: op.length, type: "control" };
	}
	return null;
}

/**
 * Tokenize a shell command string into words and operators with source offsets.
 * Quote-aware (single, double), escape-aware, and keeps command substitutions
 * (`$(...)`, backticks, `${...}`) intact as part of the surrounding word.
 *
 * Returns null if the command contains constructs we refuse to reason about
 * safely (heredocs / here-strings via `<<`).
 */
export function tokenize(s: string): Token[] | null {
	if (s.includes("<<")) return null; // heredoc / here-string: bail entirely.

	const tokens: Token[] = [];
	let i = 0;
	const n = s.length;

	while (i < n) {
		const ch = s[i];

		if (isWhitespace(ch)) {
			i++;
			continue;
		}

		// Comment: `#` at the start of a token runs to end of line.
		if (ch === "#") {
			let j = i + 1;
			while (j < n && s[j] !== "\n") j++;
			tokens.push({ start: i, end: j, text: s.slice(i, j), value: "", type: "control" });
			i = j;
			continue;
		}

		const op = matchOperator(s, i);
		if (op) {
			tokens.push({
				start: i,
				end: i + op.len,
				text: s.slice(i, i + op.len),
				value: s.slice(i, i + op.len),
				type: op.type,
			});
			i += op.len;
			continue;
		}

		// Word: read until whitespace or an operator boundary, respecting quotes.
		const start = i;
		let value = "";
		while (i < n) {
			const c = s[i];
			if (isWhitespace(c)) break;
			if (c === "#") break; // start of inline comment ends the word
			if (matchOperator(s, i)) break;

			if (c === "'") {
				const close = s.indexOf("'", i + 1);
				if (close === -1) {
					// Unterminated quote: give up on parsing this command.
					return null;
				}
				value += s.slice(i + 1, close);
				i = close + 1;
				continue;
			}

			if (c === '"') {
				i++; // consume opening quote
				while (i < n && s[i] !== '"') {
					if (s[i] === "\\" && i + 1 < n && '"\\$`\n'.includes(s[i + 1])) {
						if (s[i + 1] !== "\n") value += s[i + 1];
						i += 2;
						continue;
					}
					value += s[i];
					i++;
				}
				if (i >= n) return null; // unterminated double quote
				i++; // consume closing quote
				continue;
			}

			if (c === "`") {
				const close = s.indexOf("`", i + 1);
				if (close === -1) return null;
				value += s.slice(i, close + 1);
				i = close + 1;
				continue;
			}

			if (c === "$" && s[i + 1] === "(") {
				const close = matchBalanced(s, i + 1, "(", ")");
				if (close === -1) return null;
				value += s.slice(i, close + 1);
				i = close + 1;
				continue;
			}

			if (c === "$" && s[i + 1] === "{") {
				const close = matchBalanced(s, i + 1, "{", "}");
				if (close === -1) return null;
				value += s.slice(i, close + 1);
				i = close + 1;
				continue;
			}

			if (c === "\\") {
				if (i + 1 < n) {
					value += s[i + 1];
					i += 2;
				} else {
					value += c;
					i++;
				}
				continue;
			}

			value += c;
			i++;
		}

		tokens.push({ start, end: i, text: s.slice(start, i), value, type: "word" });
	}

	return tokens;
}

function matchBalanced(s: string, openIdx: number, open: string, close: string): number {
	let depth = 0;
	for (let k = openIdx; k < s.length; k++) {
		if (s[k] === open) depth++;
		else if (s[k] === close) {
			depth--;
			if (depth === 0) return k;
		}
	}
	return -1;
}

function isFindCommand(value: string): boolean {
	// Bare `find`, or an absolute system path like `/usr/bin/find`. Relative forms
	// (`./find`, `tools/find`) are deliberately excluded so we never hijack a
	// user's local script that happens to be named `find`.
	return value === "find" || (value.startsWith("/") && value.endsWith("/find"));
}

type FindIR = {
	roots: Token[]; // path operands, kept as raw tokens
	pattern?: { glob: string; ignoreCase: boolean };
	types: string[];
	maxDepth?: string;
	minDepth?: string;
	follow: boolean;
};

const INT_RE = /^\d+$/;

/**
 * Parse collected find argument tokens into an intermediate representation.
 * Returns null to signal "bail" (anything outside the safe subset).
 */
function parseFindArgs(args: Token[]): FindIR | null {
	const ir: FindIR = { roots: [], types: [], follow: false };
	let seenPrimary = false;

	for (let i = 0; i < args.length; i++) {
		const tok = args[i];
		const v = tok.value;

		// Expression grouping / boolean operators: out of scope.
		if (v === "(" || v === ")" || v === "!" || v === "," || v === "-o" || v === "-a" || v === "-and" || v === "-or" || v === "-not") {
			return null;
		}

		if (!v.startsWith("-")) {
			// A bare word. Before any primary it's a path root; after, it's a syntax error for us.
			if (seenPrimary) return null;
			ir.roots.push(tok);
			continue;
		}

		// Global options that may precede paths.
		if (v === "-P") continue; // physical (no symlink follow): fd default, drop.
		if (v === "-L" || v === "-follow") {
			ir.follow = true;
			continue;
		}
		if (v === "-H") return null; // follow symlinks from cmdline only: no fd equivalent.

		// Primaries we support.
		seenPrimary = true;

		if (v === "-print") continue; // default action, no-op.

		if (v === "-name" || v === "-iname") {
			const valTok = args[i + 1];
			if (!valTok || valTok.type !== "word") return null;
			if (ir.pattern) return null; // multiple name tests: cannot express as one fd pattern.
			const glob = valTok.value;
			if (glob === "") return null; // empty glob diverges (find: no match; fd: matches all).
			// A pattern containing shell expansion can't be faithfully re-quoted.
			if (/[`$]/.test(valTok.text)) return null;
			ir.pattern = { glob, ignoreCase: v === "-iname" };
			i++;
			continue;
		}

		if (v === "-type") {
			const valTok = args[i + 1];
			if (!valTok || valTok.type !== "word") return null;
			// Only a single type letter. Comma-lists (`-type f,d`) are a GNU-only
			// extension that BSD/macOS find does not honor the same way, and a second
			// -type primary ANDs in find (matches nothing) but ORs in fd. Bail on both
			// so we never diverge from the find that would actually have run.
			const mapped = FIND_TYPE_MAP[valTok.value];
			if (!mapped) return null; // multi-char, comma-list, 'D' (door), or unknown.
			if (ir.types.length > 0) return null;
			ir.types.push(mapped);
			i++;
			continue;
		}

		if (v === "-maxdepth") {
			const valTok = args[i + 1];
			if (!valTok || !INT_RE.test(valTok.value)) return null;
			if (valTok.value === "0") return null; // root-only test; fd never yields the root.
			ir.maxDepth = valTok.value;
			i++;
			continue;
		}

		if (v === "-mindepth") {
			const valTok = args[i + 1];
			if (!valTok || !INT_RE.test(valTok.value)) return null;
			ir.minDepth = valTok.value;
			i++;
			continue;
		}

		// Any other primary (-path, -regex, -exec, -delete, -size, -mtime, -newer,
		// -empty, -prune, -print0, -printf, -ls, -depth, -perm, -user, ...): bail.
		return null;
	}

	return ir;
}

function singleQuote(s: string): string {
	return "'" + s.replace(/'/g, "'\\''") + "'";
}

function buildFdCommand(ir: FindIR, fdBinary: string): string {
	const parts: string[] = [fdBinary, "-H", "-I"]; // hidden + no-ignore => parity with find's scope
	if (ir.follow) parts.push("-L");
	for (const t of ir.types) parts.push("-t", t);
	if (ir.minDepth !== undefined) parts.push("--min-depth", ir.minDepth);
	if (ir.maxDepth !== undefined) parts.push("--max-depth", ir.maxDepth);
	// Search paths as options so they don't collide with the positional pattern,
	// and so they remain separate words (preserving tilde / $VAR expansion).
	for (const root of ir.roots) parts.push("--search-path", root.text);
	if (ir.pattern) {
		parts.push("-g");
		// find's -name is case-sensitive and -iname is case-insensitive. fd defaults
		// to *smart-case*, so we must pin the case mode explicitly to preserve parity
		// (otherwise a lowercase glob like '*.ts' would also match 'Bar.TS').
		parts.push(ir.pattern.ignoreCase ? "-i" : "-s");
		// `--` guards a glob that begins with '-'. Nothing follows the pattern.
		if (ir.pattern.glob.startsWith("-")) parts.push("--");
		parts.push(singleQuote(ir.pattern.glob));
	}
	return parts.join(" ");
}

/**
 * Given the full token list and the index of a `find` head token, collect its
 * argument tokens (words) up to the first operator. Returns the args plus the
 * index of the terminator token (or tokens.length).
 */
function collectArgs(tokens: Token[], headIdx: number): { args: Token[]; termIdx: number } {
	const args: Token[] = [];
	let j = headIdx + 1;
	while (j < tokens.length && tokens[j].type === "word") {
		args.push(tokens[j]);
		j++;
	}
	return { args, termIdx: j };
}

/**
 * Determine whether the tokens after the collected args are safe to leave
 * untouched. Unsafe when a redirection is followed by more find argument words
 * (e.g. `find . 2>/dev/null -name x`), because splicing would tear the
 * expression apart.
 */
function safeTerminator(tokens: Token[], termIdx: number): boolean {
	if (termIdx >= tokens.length) return true;
	if (tokens[termIdx].type === "control") return true;
	// Redirection(s): skip each redir op and its (optional) target word.
	let j = termIdx;
	while (j < tokens.length && tokens[j].type === "redir") {
		j++;
		if (j < tokens.length && tokens[j].type === "word") j++;
	}
	if (j >= tokens.length) return true;
	if (tokens[j].type === "control") return true;
	// A bare word here would be another find argument after a redirection.
	return false;
}

/**
 * Rewrite all translatable `find` invocations in a shell command into `fd`.
 * Returns the rewritten command, or null if nothing was (or could be) changed.
 *
 * Untranslatable find invocations and all surrounding text are preserved
 * byte-for-byte via offset splicing.
 */
export function rewriteFindToFd(command: string, fdBinary = "fd"): string | null {
	const tokens = tokenize(command);
	if (!tokens) return null;

	type Replacement = { start: number; end: number; text: string };
	const replacements: Replacement[] = [];

	let cmdPos = true;
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];

		if (tok.type === "control") {
			cmdPos = true;
			continue;
		}
		if (tok.type === "redir") {
			// Redirection does not start a new command; the next word is its target.
			continue;
		}

		// word
		if (cmdPos && isFindCommand(tok.value)) {
			const { args, termIdx } = collectArgs(tokens, i);
			cmdPos = false;
			if (!safeTerminator(tokens, termIdx)) {
				i = termIdx - 1;
				continue;
			}
			const ir = parseFindArgs(args);
			if (ir) {
				const fd = buildFdCommand(ir, fdBinary);
				const lastTok = args.length > 0 ? args[args.length - 1] : tok;
				replacements.push({ start: tok.start, end: lastTok.end, text: fd });
			}
			i = termIdx - 1;
			continue;
		}

		cmdPos = false;
	}

	if (replacements.length === 0) return null;

	// Apply right-to-left so earlier offsets stay valid.
	replacements.sort((a, b) => b.start - a.start);
	let out = command;
	for (const r of replacements) {
		out = out.slice(0, r.start) + r.text + out.slice(r.end);
	}
	return out === command ? null : out;
}
