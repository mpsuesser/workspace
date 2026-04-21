import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as FileSystem from 'effect/FileSystem';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';
import * as Random from 'effect/Random';
import * as Schedule from 'effect/Schedule';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

import type { HammerspoonCliError } from './HammerspoonError.ts';
import {
	HammerspoonCliError as HammerspoonCliErrorClass,
	HammerspoonIpcTimeout as HammerspoonIpcTimeoutClass
} from './HammerspoonError.ts';

// --- Internal helpers ---

const mapHsError =
	(luaCode: string) => (error: { message: string; exitCode?: unknown }) =>
		new HammerspoonCliErrorClass({
			command: `hs -c '${luaCode.slice(0, 100)}...'`,
			exitCode: 'exitCode' in error && P.isNumber(error.exitCode)
				? error.exitCode
				: 1,
			stderr: error.message
		});

const runHs = Effect.fn('Hammerspoon.runHs')((luaCode: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make('hs', ['-n', '-q', '-c', luaCode]);
		return yield* spawner.string(command).pipe(
			Effect.map((s) => s.trim()),
			Effect.mapError(mapHsError(luaCode))
		);
	})
);

const runHsVoid = Effect.fn('Hammerspoon.runHsVoid')((luaCode: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make('hs', ['-n', '-q', '-c', luaCode]);
		yield* spawner
			.exitCode(command)
			.pipe(Effect.mapError(mapHsError(luaCode)));
	})
);

const decodeJsonString = Schema.decodeUnknownEffect(
	Schema.UnknownFromJsonString
);

const runHsJson = <A, I>(luaCode: string, schema: Schema.Codec<A, I>) =>
	Effect.gen(function* () {
		const raw = yield* runHs(luaCode);
		const json = yield* decodeJsonString(raw).pipe(
			Effect.mapError(
				() =>
					new HammerspoonCliErrorClass({
						command: `hs -c '${luaCode.slice(0, 100)}...'`,
						exitCode: 0,
						stderr: `Invalid JSON: ${raw.slice(0, 200)}`
					})
			)
		);
		return yield* Schema.decodeUnknownEffect(schema)(json);
	});

const isHammerspoonRunning = Effect.fn('Hammerspoon.isRunningCheck')(() =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make('pgrep', ['-f', 'Hammerspoon']);
		return yield* spawner.exitCode(command).pipe(
			Effect.map((code) => code === 0),
			Effect.catchTag('PlatformError', () => Effect.succeed(false))
		);
	})
);

const escapeLuaString = (s: string): string =>
	s
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r');

const pollFileForResult = <A, I>(
	filePath: string,
	schema: Schema.Codec<A, I>,
	timeoutMs: number = 60_000
) => Effect.gen(function* () {
	const fs = yield* FileSystem.FileSystem;

	const timeoutError = new HammerspoonIpcTimeoutClass({
		message: `Dialog did not return a result within ${timeoutMs}ms`,
		timeoutMs
	});

	const readFile: Effect.Effect<
		string,
		HammerspoonCliError,
		FileSystem.FileSystem
	> = fs.readFileString(filePath).pipe(
		Effect.flatMap((text) =>
			text.length > 0
				? Effect.succeed(text)
				: Effect.fail(
					new HammerspoonCliErrorClass({
						command: `pollFile(${filePath})`,
						exitCode: 0,
						stderr: 'Empty result file'
					})
				)
		),
		Effect.catchTag('PlatformError', () =>
			Effect.fail(
				new HammerspoonCliErrorClass({
					command: `pollFile(${filePath})`,
					exitCode: 0,
					stderr: 'File not found or unreadable'
				})
			))
	);

	const raw = yield* readFile.pipe(
		Effect.retry(Schedule.spaced('200 millis')),
		Effect.timeout(`${timeoutMs} millis`),
		Effect.catchTag('TimeoutError', () => Effect.fail(timeoutError)),
		Effect.catchTag('HammerspoonCliError', () => Effect.fail(timeoutError))
	);

	const json = yield* decodeJsonString(raw).pipe(
		Effect.mapError(
			() =>
				new HammerspoonCliErrorClass({
					command: `pollFile(${filePath})`,
					exitCode: 0,
					stderr: `Invalid JSON in result file: ${raw.slice(0, 200)}`
				})
		)
	);

	yield* fs.remove(filePath).pipe(Effect.ignore);

	return yield* Schema.decodeUnknownEffect(schema)(json);
});

// --- Schemas ---

export class WindowInfo extends Schema.Class<WindowInfo>('WindowInfo')({
	id: Schema.Number,
	title: Schema.String,
	app: Schema.String,
	x: Schema.Number,
	y: Schema.Number,
	w: Schema.Number,
	h: Schema.Number,
	screen: Schema.String,
	screenId: Schema.Number
}) {}

export class ScreenInfo extends Schema.Class<ScreenInfo>('ScreenInfo')({
	id: Schema.Number,
	name: Schema.String,
	x: Schema.Number,
	y: Schema.Number,
	w: Schema.Number,
	h: Schema.Number
}) {}

export class AppInfo extends Schema.Class<AppInfo>('AppInfo')({
	name: Schema.String,
	bundleID: Schema.String,
	pid: Schema.Number
}) {}

export class DialogResult extends Schema.Class<DialogResult>('DialogResult')({
	button: Schema.String
}) {}

export class TextPromptResult extends Schema.Class<TextPromptResult>(
	'TextPromptResult'
)({
	button: Schema.String,
	text: Schema.String
}) {}

export class AppContext extends Schema.Class<AppContext>('AppContext')({
	app: Schema.String,
	bundleID: Schema.String,
	timestamp: Schema.Number
}) {}

// --- Service ---

export class Hammerspoon extends Context.Service<Hammerspoon>()(
	'@workspace/hammerspoon-binding/Hammerspoon',
	{
		make: Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const fs = yield* FileSystem.FileSystem;

			const provideSpawner = <A, E>(
				effect: Effect.Effect<
					A,
					E,
					ChildProcessSpawner.ChildProcessSpawner
				>
			) => Effect.provideService(
				effect,
				ChildProcessSpawner.ChildProcessSpawner,
				spawner
			);

			const _isRunning = provideSpawner(isHammerspoonRunning());

			const focusedWindow = provideSpawner(
				runHs(
					`local w = hs.window.focusedWindow(); if w then local f = w:frame(); local s = w:screen(); return hs.json.encode({id=w:id(), title=w:title(), app=w:application():name(), x=f.x, y=f.y, w=f.w, h=f.h, screen=s:name(), screenId=s:id()}) end`
				).pipe(
					Effect.flatMap((raw) =>
						raw === ''
							? Effect.succeed(Option.none<WindowInfo>())
							: Schema.decodeEffect(
								Schema.fromJsonString(WindowInfo)
							)(raw).pipe(Effect.map(Option.some))
					)
				)
			);

			const _allWindows = provideSpawner(
				runHsJson(
					`local wins = {}; for _,w in ipairs(hs.window.allWindows()) do local f = w:frame(); local s = w:screen(); table.insert(wins, {id=w:id(), title=w:title(), app=w:application():name(), x=f.x, y=f.y, w=f.w, h=f.h, screen=s:name(), screenId=s:id()}) end; return hs.json.encode(wins)`,
					Schema.Array(WindowInfo)
				)
			);

			const _allScreens = provideSpawner(
				runHsJson(
					`local screens = {}; for _,s in ipairs(hs.screen.allScreens()) do local f = s:fullFrame(); table.insert(screens, {id=s:id(), name=s:name(), x=f.x, y=f.y, w=f.w, h=f.h}) end; return hs.json.encode(screens)`,
					Schema.Array(ScreenInfo)
				)
			);

			const focusedApp = provideSpawner(
				runHs(
					`local w = hs.window.focusedWindow(); if w then local a = w:application(); return hs.json.encode({name=a:name(), bundleID=a:bundleID(), pid=a:pid()}) end`
				).pipe(
					Effect.flatMap((raw) =>
						raw === ''
							? Effect.succeed(Option.none<AppInfo>())
							: Schema.decodeEffect(
								Schema.fromJsonString(AppInfo)
							)(raw).pipe(Effect.map(Option.some))
					)
				)
			);

			const _runningApps = provideSpawner(
				runHsJson(
					`local apps = {}; for _,a in ipairs(hs.application.runningApplications()) do if a:mainWindow() then table.insert(apps, {name=a:name(), bundleID=a:bundleID(), pid=a:pid()}) end end; return hs.json.encode(apps)`,
					Schema.Array(AppInfo)
				)
			);

			const _focusApp = (
				name: string
			): Effect.Effect<void, HammerspoonCliError> =>
				provideSpawner(
					runHsVoid(
						`hs.application.launchOrFocus('${
							escapeLuaString(name)
						}')`
					)
				);

			const _notify = (
				title: string,
				body?: string
			): Effect.Effect<void, HammerspoonCliError> =>
				provideSpawner(
					runHsVoid(
						`showNotification('${escapeLuaString(title)}', '${
							escapeLuaString(body ?? '')
						}')`
					)
				);

			const _moveWindow = (
				windowId: number,
				frame: {
					readonly x: number;
					readonly y: number;
					readonly w: number;
					readonly h: number;
				}
			): Effect.Effect<void, HammerspoonCliError> =>
				provideSpawner(
					runHsVoid(
						`local w = hs.window.get(${windowId}); if w then w:setFrame(hs.geometry.rect(${frame.x}, ${frame.y}, ${frame.w}, ${frame.h})) end`
					)
				);

			const _focusWindow = (
				windowId: number
			): Effect.Effect<void, HammerspoonCliError> =>
				provideSpawner(
					runHsVoid(
						`local w = hs.window.get(${windowId}); if w then w:focus() end`
					)
				);

			const makeTmpFile = (prefix: string) =>
				Effect.map(
					Random.nextIntBetween(0, 0x7fffffff),
					(n) => `/tmp/${prefix}-${n.toString(36)}.json`
				);

			const _blockingDialog = (opts: {
				readonly message: string;
				readonly informativeText?: string;
				readonly buttonOne?: string;
				readonly buttonTwo?: string;
				readonly timeoutMs?: number;
			}) =>
				Effect.gen(function* () {
					const tmpFile = yield* makeTmpFile('hs-dialog');
					const e = escapeLuaString;
					yield* provideSpawner(
						runHsVoid(
							`showBlockingDialog('${tmpFile}', '${
								e(opts.message)
							}', '${e(opts.informativeText ?? '')}', '${
								e(opts.buttonOne ?? 'OK')
							}', '${e(opts.buttonTwo ?? '')}')`
						)
					);
					const button = yield* pollFileForResult(
						tmpFile,
						Schema.String,
						opts.timeoutMs
					);
					return new DialogResult({ button });
				});

			const _textPrompt = (opts: {
				readonly message: string;
				readonly informativeText?: string;
				readonly defaultText?: string;
				readonly buttonOne?: string;
				readonly buttonTwo?: string;
				readonly timeoutMs?: number;
			}) =>
				Effect.gen(function* () {
					const tmpFile = yield* makeTmpFile('hs-dialog');
					const e = escapeLuaString;
					yield* provideSpawner(
						runHsVoid(
							`showTextPromptDialog('${tmpFile}', '${
								e(opts.message)
							}', '${e(opts.informativeText ?? '')}', '${
								e(opts.defaultText ?? '')
							}', '${e(opts.buttonOne ?? 'OK')}', '${
								e(opts.buttonTwo ?? 'Cancel')
							}')`
						)
					);
					return yield* pollFileForResult(
						tmpFile,
						TextPromptResult,
						opts.timeoutMs
					);
				});

			// -- Dynamic hotkey registration --

			const _registerHotkey = (
				id: string,
				mods: ReadonlyArray<string>,
				key: string
			) => {
				const modsLua = `{${
					mods.map((m) => `'${escapeLuaString(m)}'`).join(',')
				}}`;
				return provideSpawner(
					runHsVoid(
						`registerHotkey('${
							escapeLuaString(id)
						}', ${modsLua}, '${escapeLuaString(key)}')`
					)
				);
			};

			const _unregisterHotkey = (id: string) =>
				provideSpawner(
					runHsVoid(`unregisterHotkey('${escapeLuaString(id)}')`)
				);

			const _listDynamicHotkeys = provideSpawner(
				runHsJson(
					`return listDynamicHotkeys()`,
					Schema.Array(Schema.String)
				)
			);

			const _waitForHotkey = (id: string, timeoutMs: number = 60_000) =>
				pollFileForResult(
					`/tmp/hs-hotkey-${id}.trigger`,
					Schema.String,
					timeoutMs
				).pipe(Effect.asVoid);

			// -- App context detection --

			const _currentContext = fs
				.readFileString('/tmp/hs-context.json')
				.pipe(
					Effect.flatMap((text) =>
						text.length > 0
							? Schema.decodeEffect(
								Schema.fromJsonString(AppContext)
							)(text).pipe(Effect.map(Option.some))
							: Effect.succeed(Option.none<AppContext>())
					),
					Effect.catchTag(
						'PlatformError',
						() => Effect.succeed(Option.none<AppContext>())
					),
					Effect.catchTag(
						'SchemaError',
						() => Effect.succeed(Option.none<AppContext>())
					)
				);

			const watchContext = Stream.fromEffectRepeat(_currentContext).pipe(
				Stream.schedule(Schedule.spaced('500 millis')),
				Stream.filter(Option.isSome),
				Stream.map((opt) => opt.value),
				Stream.changes
			);

			// -- Window layout snapshots --

			const snapshotLayout = Effect.all({
				windows: _allWindows,
				screens: _allScreens
			});

			const _restoreLayout = (layout: {
				readonly windows: ReadonlyArray<WindowInfo>;
			}) =>
				Effect.forEach(
					layout.windows,
					(saved) =>
						_allWindows.pipe(
							Effect.flatMap((current) =>
								Option.match(
									Arr.findFirst(
										current,
										(w) =>
											w.app === saved.app &&
											w.title.startsWith(
												saved.title.slice(0, 20)
											)
									),
									{
										onNone: () =>
											Effect.logInfo(
												`Window not found for restore: ${saved.app} - ${
													saved.title.slice(0, 40)
												}`
											),
										onSome: (matched) =>
											_moveWindow(matched.id, {
												x: saved.x,
												y: saved.y,
												w: saved.w,
												h: saved.h
											})
									}
								)
							)
						),
					{ discard: true }
				);

			return {
				isRunning: _isRunning.pipe(
					Effect.withSpan('Hammerspoon.isRunning')
				),
				focusedWindow: focusedWindow.pipe(
					Effect.withSpan('Hammerspoon.focusedWindow')
				),
				allWindows: _allWindows.pipe(
					Effect.withSpan('Hammerspoon.allWindows')
				),
				allScreens: _allScreens.pipe(
					Effect.withSpan('Hammerspoon.allScreens')
				),
				focusedApp: focusedApp.pipe(
					Effect.withSpan('Hammerspoon.focusedApp')
				),
				runningApps: _runningApps.pipe(
					Effect.withSpan('Hammerspoon.runningApps')
				),
				focusApp: Effect.fn('Hammerspoon.focusApp')(_focusApp),
				notify: Effect.fn('Hammerspoon.notify')(_notify),
				moveWindow: Effect.fn('Hammerspoon.moveWindow')(_moveWindow),
				focusWindow: Effect.fn('Hammerspoon.focusWindow')(_focusWindow),
				blockingDialog: Effect.fn('Hammerspoon.blockingDialog')(
					_blockingDialog
				),
				textPrompt: Effect.fn('Hammerspoon.textPrompt')(_textPrompt),
				registerHotkey: Effect.fn('Hammerspoon.registerHotkey')(
					_registerHotkey
				),
				unregisterHotkey: Effect.fn('Hammerspoon.unregisterHotkey')(
					_unregisterHotkey
				),
				listDynamicHotkeys: _listDynamicHotkeys.pipe(
					Effect.withSpan('Hammerspoon.listDynamicHotkeys')
				),
				waitForHotkey: Effect.fn('Hammerspoon.waitForHotkey')(
					_waitForHotkey
				),
				currentContext: _currentContext.pipe(
					Effect.withSpan('Hammerspoon.currentContext')
				),
				watchContext,
				snapshotLayout: snapshotLayout.pipe(
					Effect.withSpan('Hammerspoon.snapshotLayout')
				),
				restoreLayout: Effect.fn('Hammerspoon.restoreLayout')(
					_restoreLayout
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make);
}
