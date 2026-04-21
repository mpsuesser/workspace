/**
 * ZellijLayout — author Zellij layouts in typesafe TypeScript and emit to KDL.
 *
 * A Zellij layout is a tree of panes and tabs wrapped in a `layout` node. This
 * module models that tree as schema-backed domain classes (EF-33), offers
 * ergonomic constructors for each variant, and renders the result to a KDL
 * string with `toKdl` or writes it to disk with the effectful `write`.
 *
 * Templates are just TypeScript functions: `(params) => Layout`. The Schema
 * layer is authoritative for the shape; the emitter walks the tree and
 * produces the matching `.kdl` text.
 *
 * @since 0.1.0
 */

import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as R from 'effect/Record';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

// ───────────────────────────────────────────────────────────────────────────
// Shared primitives
// ───────────────────────────────────────────────────────────────────────────

/**
 * A pane dimension. Either a fixed row/column count (number) or a percentage
 * string like `"50%"`.
 *
 * @category Primitives
 * @since 0.1.0
 */
export const PaneSize = Schema.Union([Schema.Number, Schema.String]);
export type PaneSize = typeof PaneSize.Type;

/**
 * Split orientation for a container pane.
 *
 * @category Primitives
 * @since 0.1.0
 */
export const SplitDirection = Schema.Literals(['vertical', 'horizontal']);
export type SplitDirection = typeof SplitDirection.Type;

// Fields every pane variant shares. `defaultFg`/`defaultBg` accept hex or rgb
// strings per the zellij layout docs; we don't attempt to validate them.
const CommonPaneFields = {
	name: Schema.OptionFromUndefinedOr(Schema.String),
	cwd: Schema.OptionFromUndefinedOr(Schema.String),
	focus: Schema.OptionFromUndefinedOr(Schema.Boolean),
	size: Schema.OptionFromUndefinedOr(PaneSize),
	borderless: Schema.OptionFromUndefinedOr(Schema.Boolean),
	defaultFg: Schema.OptionFromUndefinedOr(Schema.String),
	defaultBg: Schema.OptionFromUndefinedOr(Schema.String)
} as const;

// Fields for panes that run a command.
const ExecPaneFields = {
	closeOnExit: Schema.OptionFromUndefinedOr(Schema.Boolean),
	startSuspended: Schema.OptionFromUndefinedOr(Schema.Boolean)
} as const;

// Ergonomic input type for common props (plain JS, no Options).
export interface CommonPaneInput {
	readonly name?: string;
	readonly cwd?: string;
	readonly focus?: boolean;
	readonly size?: PaneSize;
	readonly borderless?: boolean;
	readonly defaultFg?: string;
	readonly defaultBg?: string;
}

export interface ExecPaneInput {
	readonly closeOnExit?: boolean;
	readonly startSuspended?: boolean;
}

const liftCommon = (input: CommonPaneInput) => ({
	name: Option.fromNullishOr(input.name),
	cwd: Option.fromNullishOr(input.cwd),
	focus: Option.fromNullishOr(input.focus),
	size: Option.fromNullishOr(input.size),
	borderless: Option.fromNullishOr(input.borderless),
	defaultFg: Option.fromNullishOr(input.defaultFg),
	defaultBg: Option.fromNullishOr(input.defaultBg)
});

const liftExec = (input: ExecPaneInput) => ({
	closeOnExit: Option.fromNullishOr(input.closeOnExit),
	startSuspended: Option.fromNullishOr(input.startSuspended)
});

// ───────────────────────────────────────────────────────────────────────────
// Pane variants
// ───────────────────────────────────────────────────────────────────────────

/**
 * A pane running the user's default shell.
 *
 * @category Panes
 * @since 0.1.0
 */
export class ShellPane extends Schema.Class<ShellPane>('ShellPane')({
	_tag: Schema.tag('Shell'),
	...CommonPaneFields
}) {}

/**
 * A pane running a specific command (with optional args).
 *
 * @category Panes
 * @since 0.1.0
 */
export class CommandPane extends Schema.Class<CommandPane>('CommandPane')({
	_tag: Schema.tag('Command'),
	command: Schema.String,
	args: Schema.OptionFromUndefinedOr(Schema.Array(Schema.String)),
	...ExecPaneFields,
	...CommonPaneFields
}) {}

/**
 * A pane that opens a file in `$EDITOR`/`$VISUAL`.
 *
 * @category Panes
 * @since 0.1.0
 */
export class EditPane extends Schema.Class<EditPane>('EditPane')({
	_tag: Schema.tag('Edit'),
	file: Schema.String,
	...CommonPaneFields
}) {}

/**
 * A pane hosting a Zellij plugin (URL or `zellij:<internal>`).
 *
 * @category Panes
 * @since 0.1.0
 */
export class PluginPane extends Schema.Class<PluginPane>('PluginPane')({
	_tag: Schema.tag('Plugin'),
	location: Schema.String,
	...CommonPaneFields
}) {}

/** Forward alias so recursive variants can describe their `children`. */
export type Pane =
	| ShellPane
	| CommandPane
	| EditPane
	| PluginPane
	| SplitPane
	| StackPane;

// For the suspend return type, we want `Schema.Codec<Pane, PaneEncoded>` per
// SCHEMA.md > "Recursive Opaque Struct with Different Encoded and Type". That
// pattern uses `interface PaneEncoded extends Schema.Codec.Encoded<typeof
// Pane> {}` to break the circular reference, but `interface ... extends` only
// accepts object types with statically known members — our `typeof Pane` is a
// `Schema.Union`, whose `.Encoded` is a union of variants, which is rejected
// (TS2312).
//
// Since this module is generation-only (we construct Panes from TS, never
// decode from unknown input), the precise encoded type is not exercised. We
// widen it to `unknown`; `Schema.Codec<A, E>` is covariant in `E`, so the
// actual union encoded type is assignable to `Codec<Pane, unknown>`.

/**
 * A logical container that splits its children horizontally or vertically.
 *
 * @category Panes
 * @since 0.1.0
 */
export class SplitPane extends Schema.Class<SplitPane>('SplitPane')({
	_tag: Schema.tag('Split'),
	direction: SplitDirection,
	children: Schema.Array(
		Schema.suspend((): Schema.Codec<Pane, unknown> => Pane)
	),
	...CommonPaneFields
}) {}

/**
 * A logical container that stacks its children (all but one collapsed).
 *
 * @category Panes
 * @since 0.1.0
 */
export class StackPane extends Schema.Class<StackPane>('StackPane')({
	_tag: Schema.tag('Stack'),
	children: Schema.Array(
		Schema.suspend((): Schema.Codec<Pane, unknown> => Pane)
	),
	expanded: Schema.OptionFromUndefinedOr(Schema.Boolean),
	...CommonPaneFields
}) {}

/**
 * Discriminated union of every pane variant. Use with `Match.typeTags<Pane>()`
 * for exhaustive branching.
 *
 * @category Panes
 * @since 0.1.0
 */
export const Pane = Schema.Union([
	ShellPane,
	CommandPane,
	EditPane,
	PluginPane,
	SplitPane,
	StackPane
]);

/**
 * Exhaustive pattern match on a `Pane`.
 *
 * @category Pattern Matching
 * @since 0.1.0
 */
export const matchPane = Match.typeTags<Pane>();

// ───────────────────────────────────────────────────────────────────────────
// Floating panes
// ───────────────────────────────────────────────────────────────────────────

/**
 * The inner content of a floating pane — a leaf variant only (no containers).
 *
 * @category Panes
 * @since 0.1.0
 */
export type FloatingContent = ShellPane | CommandPane | EditPane | PluginPane;

export const FloatingContent = Schema.Union([
	ShellPane,
	CommandPane,
	EditPane,
	PluginPane
]);

/**
 * A floating pane with optional position and size.
 *
 * @category Panes
 * @since 0.1.0
 */
export class FloatingPane extends Schema.Class<FloatingPane>('FloatingPane')({
	content: FloatingContent,
	x: Schema.OptionFromUndefinedOr(PaneSize),
	y: Schema.OptionFromUndefinedOr(PaneSize),
	width: Schema.OptionFromUndefinedOr(PaneSize),
	height: Schema.OptionFromUndefinedOr(PaneSize),
	pinned: Schema.OptionFromUndefinedOr(Schema.Boolean)
}) {}

// ───────────────────────────────────────────────────────────────────────────
// Tab & Layout
// ───────────────────────────────────────────────────────────────────────────

/**
 * A Zellij tab.
 *
 * @category Tabs
 * @since 0.1.0
 */
export class Tab extends Schema.Class<Tab>('Tab')({
	name: Schema.OptionFromUndefinedOr(Schema.String),
	cwd: Schema.OptionFromUndefinedOr(Schema.String),
	focus: Schema.OptionFromUndefinedOr(Schema.Boolean),
	splitDirection: Schema.OptionFromUndefinedOr(SplitDirection),
	hideFloatingPanes: Schema.OptionFromUndefinedOr(Schema.Boolean),
	panes: Schema.Array(Pane),
	floatingPanes: Schema.OptionFromUndefinedOr(Schema.Array(FloatingPane))
}) {}

/**
 * A complete Zellij layout — the root `layout { ... }` block.
 *
 * Either `panes` or `tabs` should typically be provided. When `tabs` are
 * present, root `panes` are rarely meaningful; when absent, root `panes`
 * form the single default tab.
 *
 * @category Layouts
 * @since 0.1.0
 */
export class Layout extends Schema.Class<Layout>('Layout')({
	cwd: Schema.OptionFromUndefinedOr(Schema.String),
	panes: Schema.OptionFromUndefinedOr(Schema.Array(Pane)),
	tabs: Schema.OptionFromUndefinedOr(Schema.Array(Tab)),
	floatingPanes: Schema.OptionFromUndefinedOr(Schema.Array(FloatingPane))
}) {}

// ───────────────────────────────────────────────────────────────────────────
// Ergonomic constructors
// ───────────────────────────────────────────────────────────────────────────

/**
 * Construct a shell pane.
 *
 * @category Constructors
 * @since 0.1.0
 * @example
 * import * as ZellijLayout from '@workspace/zellij-binding/ZellijLayout'
 * const p = ZellijLayout.shell({ focus: true, cwd: '/Users/m' })
 */
export const shell = (input: CommonPaneInput = {}): ShellPane =>
	new ShellPane(liftCommon(input));

/**
 * Construct a command pane.
 *
 * `command` may be a bare string or a `[cmd, ...args]` tuple. The former is
 * rendered as `pane command="cmd"`; the latter as `pane command="cmd" { args "arg1" "arg2"; ... }`.
 *
 * @category Constructors
 * @since 0.1.0
 * @example
 * import * as ZellijLayout from '@workspace/zellij-binding/ZellijLayout'
 * const p = ZellijLayout.command(['pi', 'chat'], { name: 'pi', closeOnExit: true })
 */
export const command = (
	cmd: string | readonly [string, ...ReadonlyArray<string>],
	input: CommonPaneInput & ExecPaneInput = {}
): CommandPane => {
	// `as const` on the singleton branch unifies both arms to a non-empty
	// readonly tuple, so `head` narrows to `string` and `rest` to
	// `ReadonlyArray<string>` without any runtime assertion.
	const [head, ...rest] = typeof cmd === 'string' ? ([cmd] as const) : cmd;
	return new CommandPane({
		command: head,
		args: Arr.match(rest, {
			onEmpty: (): Option.Option<ReadonlyArray<string>> => Option.none(),
			onNonEmpty: (xs) => Option.some<ReadonlyArray<string>>(xs)
		}),
		...liftCommon(input),
		...liftExec(input)
	});
};

/**
 * Construct an edit pane that opens `file` in `$EDITOR`.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const edit = (file: string, input: CommonPaneInput = {}): EditPane =>
	new EditPane({ file, ...liftCommon(input) });

/**
 * Construct a plugin pane. `location` accepts `zellij:<name>` or a URL/file URL
 * to a `.wasm` plugin.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const plugin = (
	location: string,
	input: CommonPaneInput = {}
): PluginPane => new PluginPane({ location, ...liftCommon(input) });

/**
 * Construct a split container pane.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const split = (
	direction: SplitDirection,
	children: ReadonlyArray<Pane>,
	input: CommonPaneInput = {}
): SplitPane =>
	new SplitPane({ direction, children, ...liftCommon(input) });

/**
 * Horizontal split shortcut — children arranged left-to-right.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const hsplit = (
	children: ReadonlyArray<Pane>,
	input: CommonPaneInput = {}
): SplitPane => split('vertical', children, input);

/**
 * Vertical split shortcut — children arranged top-to-bottom.
 *
 * Note: zellij names this a `"horizontal"` `split_direction`, because it's the
 * children that are arranged horizontally w.r.t. one another. This helper
 * reads the way users usually think: "stack them vertically".
 *
 * @category Constructors
 * @since 0.1.0
 */
export const vsplit = (
	children: ReadonlyArray<Pane>,
	input: CommonPaneInput = {}
): SplitPane => split('horizontal', children, input);

/**
 * Construct a stacked container pane.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const stack = (
	children: ReadonlyArray<Pane>,
	input: CommonPaneInput & { readonly expanded?: boolean } = {}
): StackPane =>
	new StackPane({
		children,
		expanded: Option.fromNullishOr(input.expanded),
		...liftCommon(input)
	});

/**
 * Construct a floating pane.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const floating = (input: {
	readonly content: FloatingContent;
	readonly x?: PaneSize;
	readonly y?: PaneSize;
	readonly width?: PaneSize;
	readonly height?: PaneSize;
	readonly pinned?: boolean;
}): FloatingPane =>
	new FloatingPane({
		content: input.content,
		x: Option.fromNullishOr(input.x),
		y: Option.fromNullishOr(input.y),
		width: Option.fromNullishOr(input.width),
		height: Option.fromNullishOr(input.height),
		pinned: Option.fromNullishOr(input.pinned)
	});

/**
 * Construct a tab.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const tab = (input: {
	readonly panes: ReadonlyArray<Pane>;
	readonly name?: string;
	readonly cwd?: string;
	readonly focus?: boolean;
	readonly splitDirection?: SplitDirection;
	readonly hideFloatingPanes?: boolean;
	readonly floatingPanes?: ReadonlyArray<FloatingPane>;
}): Tab =>
	new Tab({
		panes: input.panes,
		name: Option.fromNullishOr(input.name),
		cwd: Option.fromNullishOr(input.cwd),
		focus: Option.fromNullishOr(input.focus),
		splitDirection: Option.fromNullishOr(input.splitDirection),
		hideFloatingPanes: Option.fromNullishOr(input.hideFloatingPanes),
		floatingPanes: Option.fromNullishOr(input.floatingPanes)
	});

/**
 * Top-level layout constructor.
 *
 * @category Constructors
 * @since 0.1.0
 * @example
 * import * as ZellijLayout from '@workspace/zellij-binding/ZellijLayout'
 *
 * export default ZellijLayout.make({
 *   cwd: '/Users/m/repos/workspace/dotconfig/zellij',
 *   panes: [
 *     ZellijLayout.hsplit([
 *       ZellijLayout.shell({ focus: true }),
 *       ZellijLayout.command('pi', { name: 'pi' })
 *     ])
 *   ]
 * })
 */
export const make = (input: {
	readonly cwd?: string;
	readonly panes?: ReadonlyArray<Pane>;
	readonly tabs?: ReadonlyArray<Tab>;
	readonly floatingPanes?: ReadonlyArray<FloatingPane>;
}): Layout =>
	new Layout({
		cwd: Option.fromNullishOr(input.cwd),
		panes: Option.fromNullishOr(input.panes),
		tabs: Option.fromNullishOr(input.tabs),
		floatingPanes: Option.fromNullishOr(input.floatingPanes)
	});

// ───────────────────────────────────────────────────────────────────────────
// KDL emission
// ───────────────────────────────────────────────────────────────────────────

// Zellij's KDL flavor uses v1-style booleans (bare `true`/`false`). Keep the
// emitter local and dependency-free — we only need one-way generation.

const INDENT = '\t';

/** A KDL property value: string | number | boolean. */
type KdlValue = string | number | boolean;

/** An internal KDL node shape we walk and stringify. */
interface KdlNode {
	readonly name: string;
	readonly args: ReadonlyArray<KdlValue>;
	readonly props: ReadonlyArray<readonly [string, KdlValue]>;
	readonly children: ReadonlyArray<KdlNode>;
}

const kdlNode = (
	name: string,
	parts: {
		readonly args?: ReadonlyArray<KdlValue>;
		readonly props?: ReadonlyArray<readonly [string, KdlValue]>;
		readonly children?: ReadonlyArray<KdlNode>;
	} = {}
): KdlNode => ({
	name,
	args: parts.args ?? [],
	props: parts.props ?? [],
	children: parts.children ?? []
});

const escapeKdlString = (value: string): string =>
	`"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const formatKdlValue = (value: KdlValue): string => {
	if (typeof value === 'string') return escapeKdlString(value);
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return String(value);
};

const formatKdlNode = (node: KdlNode, depth: number): string => {
	const pad = INDENT.repeat(depth);
	const head = Arr.appendAll(
		Arr.map(node.args, formatKdlValue),
		Arr.map(node.props, ([k, v]) => `${k}=${formatKdlValue(v)}`)
	);
	const prefix = `${pad}${node.name}${head.length === 0 ? '' : ' ' + head.join(' ')}`;

	if (node.children.length === 0) {
		return prefix;
	}

	const body = Arr.map(node.children, (child) =>
		formatKdlNode(child, depth + 1)
	).join('\n');

	return `${prefix} {\n${body}\n${pad}}`;
};

const formatKdlDocument = (nodes: ReadonlyArray<KdlNode>): string =>
	Arr.map(nodes, (node) => formatKdlNode(node, 0)).join('\n') + '\n';

// ───────────────────────────────────────────────────────────────────────────
// Domain → KDL walkers
// ───────────────────────────────────────────────────────────────────────────

type PropEntry = readonly [string, KdlValue];
type PropList = ReadonlyArray<PropEntry>;

const emptyProps: PropList = [];
const emptyKdlNodes: ReadonlyArray<KdlNode> = [];

const optionalProp = <A extends KdlValue>(
	key: string,
	value: Option.Option<A>
): PropList =>
	Option.match(value, {
		onNone: () => emptyProps,
		onSome: (v) => [[key, v] as const]
	});

const commonPropsOf = (
	p: Pick<
		ShellPane,
		'name' | 'cwd' | 'focus' | 'size' | 'borderless' | 'defaultFg' | 'defaultBg'
	>
): ReadonlyArray<readonly [string, KdlValue]> =>
	Arr.flatten([
		optionalProp('name', p.name),
		optionalProp('cwd', p.cwd),
		optionalProp('focus', p.focus),
		optionalProp('size', p.size),
		optionalProp('borderless', p.borderless),
		optionalProp('default_fg', p.defaultFg),
		optionalProp('default_bg', p.defaultBg)
	]);

const execPropsOf = (
	p: Pick<CommandPane, 'closeOnExit' | 'startSuspended'>
): ReadonlyArray<readonly [string, KdlValue]> =>
	Arr.flatten([
		optionalProp('close_on_exit', p.closeOnExit),
		optionalProp('start_suspended', p.startSuspended)
	]);

const argsChildNode = (args: ReadonlyArray<string>): KdlNode =>
	kdlNode('args', { args });

const pluginChildNode = (location: string): KdlNode =>
	kdlNode('plugin', { props: [['location', location]] });

const paneToKdl = (p: Pane): KdlNode =>
	matchPane({
		Shell: (v) =>
			kdlNode('pane', {
				props: commonPropsOf(v)
			}),
		Command: (v) =>
			kdlNode('pane', {
				props: Arr.appendAll(
					[['command', v.command] as const, ...execPropsOf(v)],
					commonPropsOf(v)
				),
				children: Option.match(v.args, {
					onNone: () => [],
					onSome: (a) => (a.length === 0 ? [] : [argsChildNode(a)])
				})
			}),
		Edit: (v) =>
			kdlNode('pane', {
				props: Arr.appendAll(
					[['edit', v.file] as const],
					commonPropsOf(v)
				)
			}),
		Plugin: (v) =>
			kdlNode('pane', {
				props: commonPropsOf(v),
				children: [pluginChildNode(v.location)]
			}),
		Split: (v) =>
			kdlNode('pane', {
				props: Arr.appendAll(
					[['split_direction', v.direction] as const],
					commonPropsOf(v)
				),
				children: Arr.map(v.children, paneToKdl)
			}),
		Stack: (v) =>
			kdlNode('pane', {
				props: Arr.appendAll(
					Arr.appendAll(
						[['stacked', true] as const],
						optionalProp('expanded', v.expanded)
					),
					commonPropsOf(v)
				),
				children: Arr.map(v.children, paneToKdl)
			})
	})(p);

const floatingPaneToKdl = (f: FloatingPane): KdlNode => {
	const inner = paneToKdl(f.content);
	const coordProps = Arr.flatten([
		optionalProp('x', f.x),
		optionalProp('y', f.y),
		optionalProp('width', f.width),
		optionalProp('height', f.height),
		optionalProp('pinned', f.pinned)
	]);
	return kdlNode(inner.name, {
		args: inner.args,
		props: Arr.appendAll(inner.props, coordProps),
		children: inner.children
	});
};

const floatingPanesBlock = (
	fs: ReadonlyArray<FloatingPane>
): Option.Option<KdlNode> =>
	fs.length === 0
		? Option.none()
		: Option.some(
				kdlNode('floating_panes', {
					children: Arr.map(fs, floatingPaneToKdl)
				})
			);

const tabToKdl = (t: Tab): KdlNode =>
	kdlNode('tab', {
		props: Arr.flatten([
			optionalProp('name', t.name),
			optionalProp('cwd', t.cwd),
			optionalProp('focus', t.focus),
			optionalProp('split_direction', t.splitDirection),
			optionalProp('hide_floating_panes', t.hideFloatingPanes)
		]),
		children: Arr.appendAll(
			Arr.map(t.panes, paneToKdl),
			Option.match(t.floatingPanes, {
				onNone: () => emptyKdlNodes,
				onSome: (f) =>
					Option.match(floatingPanesBlock(f), {
						onNone: () => emptyKdlNodes,
						onSome: (node) => [node]
					})
			})
		)
	});

const layoutChildren = (layout: Layout): ReadonlyArray<KdlNode> => {
	const cwdNode = Option.match(layout.cwd, {
		onNone: () => emptyKdlNodes,
		onSome: (cwd) => [kdlNode('cwd', { args: [cwd] })]
	});

	const paneNodes = Option.match(layout.panes, {
		onNone: () => emptyKdlNodes,
		onSome: (ps) => Arr.map(ps, paneToKdl)
	});

	const tabNodes = Option.match(layout.tabs, {
		onNone: () => emptyKdlNodes,
		onSome: (ts) => Arr.map(ts, tabToKdl)
	});

	const floatingNode = Option.match(layout.floatingPanes, {
		onNone: () => emptyKdlNodes,
		onSome: (fs) =>
			Option.match(floatingPanesBlock(fs), {
				onNone: () => emptyKdlNodes,
				onSome: (n) => [n]
			})
	});

	return Arr.flatten([cwdNode, paneNodes, tabNodes, floatingNode]);
};

/**
 * Render a `Layout` to a KDL document string.
 *
 * @category Emission
 * @since 0.1.0
 */
export const toKdl = (layout: Layout): string => {
	const rootChildren = layoutChildren(layout);
	const root = kdlNode('layout', { children: rootChildren });
	return formatKdlDocument([root]);
};

// ───────────────────────────────────────────────────────────────────────────
// Effectful writers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Write a `Layout` to `filePath` as KDL. Creates parent directories as needed.
 *
 * @category IO
 * @since 0.1.0
 */
export const write = Effect.fn('ZellijLayout.write')(
	(layout: Layout, filePath: string) =>
		Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const path = yield* Path.Path;

			const dir = path.dirname(filePath);
			yield* fs.makeDirectory(dir, { recursive: true });

			const kdl = toKdl(layout);
			yield* fs.writeFileString(filePath, kdl);
			yield* Effect.logDebug('wrote zellij layout', {
				filePath,
				bytes: kdl.length
			});
			return filePath;
		})
);

/**
 * Write many named layouts into a directory. Each entry's key becomes the
 * filename (with `.kdl` appended if absent).
 *
 * @category IO
 * @since 0.1.0
 */
export const writeAll = Effect.fn('ZellijLayout.writeAll')(
	(entries: Readonly<Record<string, Layout>>, dir: string) =>
		Effect.gen(function* () {
			const path = yield* Path.Path;
			const pairs = R.toEntries(entries);
			return yield* Effect.forEach(
				pairs,
				([name, layout]) => {
					const filename = Str.endsWith('.kdl')(name)
						? name
						: `${name}.kdl`;
					return write(layout, path.join(dir, filename));
				},
				{ concurrency: 4 }
			);
		})
);
