/**
 * generate-zellij-layout-kdl-files
 *
 * Discover `workspace/dotconfig/zellij/layouts/ts/*.ts`, dynamically import
 * each one, and for any whose default export is a {@link ZellijLayout.Layout}
 * instance, emit a matching `<name>.kdl` into `workspace/dotconfig/zellij/layouts/`.
 *
 * Files without a default `Layout` export are silently skipped — that lets
 * helper/template modules live in the same directory without special-casing.
 *
 * Run with:
 *   bun run scripts/generate-zellij-layout-kdl-files.ts
 * or:
 *   bun run gen:zellij-layouts
 *
 * @since 0.1.0
 */

import * as BunServices from '@effect/platform-bun/BunServices';
import * as ZellijLayout from '@workspace/zellij-binding/ZellijLayout';
import * as Arr from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

/**
 * Raised when a layout `.ts` file fails to dynamically import (syntax error,
 * missing dep, runtime throw during module evaluation, etc.).
 */
class LayoutImportError extends Schema.TaggedErrorClass<LayoutImportError>(
	'LayoutImportError'
)(
	'LayoutImportError',
	{
		path: Schema.String,
		message: Schema.String
	},
	{ description: 'Failed to dynamically import a layout TypeScript file.' }
) {}

const importLayoutModule = Effect.fn('gen.importLayoutModule')(function* (
	absPath: string
) {
	return yield* Effect.tryPromise({
		try: (): Promise<{ default?: unknown }> => import(absPath),
		catch: (cause) =>
			new LayoutImportError({
				path: absPath,
				message: String(cause)
			})
	});
});

// Discriminate a module's default export as a generation-ready Layout.
const pickLayout = (mod: {
	default?: unknown;
}): Option.Option<ZellijLayout.Layout> =>
	mod.default instanceof ZellijLayout.Layout
		? Option.some(mod.default)
		: Option.none();

const generateOne = Effect.fn('gen.generateOne')(function* (input: {
	readonly filename: string;
	readonly absTsPath: string;
	readonly outPath: string;
}) {
	const mod = yield* importLayoutModule(input.absTsPath);
	const maybeLayout = pickLayout(mod);

	return yield* Option.match(maybeLayout, {
		onNone: () =>
			Effect.logDebug(
				`skipped (no default Layout export): ${input.filename}`
			),
		onSome: (layout) =>
			Effect.gen(function* () {
				yield* ZellijLayout.write(layout, input.outPath);
				yield* Effect.logInfo(
					`generated ${input.filename} → ${input.outPath}`
				);
			})
	});
});

const program = Effect.fn('gen.all')(function* () {
	const fs = yield* FileSystem.FileSystem;
	const path = yield* Path.Path;

	// Resolve directories relative to this script's location so the generator
	// travels with the repo. `import.meta.dir` is bun-native.
	const scriptDir = import.meta.dir;
	const workspaceDir = path.resolve(scriptDir, '..');
	const tsDir = path.join(workspaceDir, 'dotconfig/zellij/layouts/ts');
	const outDir = path.join(workspaceDir, 'dotconfig/zellij/layouts');

	yield* Effect.logInfo(`tsDir:  ${tsDir}`);
	yield* Effect.logInfo(`outDir: ${outDir}`);

	const entries = yield* fs.readDirectory(tsDir);
	const tsFiles = Arr.filter(entries, Str.endsWith('.ts'));

	yield* Effect.logInfo(`scanning ${tsFiles.length} TypeScript file(s)`);

	yield* Effect.forEach(
		tsFiles,
		(filename) =>
			generateOne({
				filename,
				absTsPath: path.join(tsDir, filename),
				outPath: path.join(
					outDir,
					`${path.basename(filename, '.ts')}.kdl`
				)
			}),
		{ concurrency: 4 }
	);
})();

void Effect.runPromise(program.pipe(Effect.provide(BunServices.layer)));
