import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Schema from 'effect/Schema';
import * as ServiceMap from 'effect/ServiceMap';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class PresentermError extends Schema.TaggedErrorClass<PresentermError>()(
	'PresentermError',
	{
		reason: Schema.Literals([
			'NotInstalled',
			'CommandFailed',
			'ExportFailed'
		]),
		message: Schema.String
	}
) {}

// ---------------------------------------------------------------------------
// Export format
// ---------------------------------------------------------------------------

export const ExportFormat = Schema.Literals(['pdf', 'html']);
export type ExportFormat = typeof ExportFormat.Type;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class Presenterm extends ServiceMap.Service<Presenterm>()(
	'@workspace/presenterm-binding/Presenterm',
	{
		make: Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			const mapError = (e: { message: string }) =>
				new PresentermError({
					reason: 'CommandFailed',
					message: `presenterm failed: ${e.message}`
				});

			return {
				/**
				 * Launch a presentation.
				 * Spawns presenterm with stdin/stdout/stderr inherited
				 * so the user interacts with it directly.
				 */
				present: Effect.fn('Presenterm.present')(
					(
						filePath: string,
						options?: {
							readonly theme?: string;
							readonly publishSpeakerNotes?: boolean;
						}
					) =>
						Effect.scoped(
							Effect.gen(function* () {
								const args: Array<string> = [filePath];
								if (options?.theme) {
									args.push('--theme', options.theme);
								}
								if (options?.publishSpeakerNotes) {
									args.push('--publish-speaker-notes');
								}

								const cmd = ChildProcess.make(
									'presenterm',
									args,
									{
										stdin: 'inherit',
										stdout: 'inherit',
										stderr: 'inherit'
									}
								);
								const process = yield* spawner
									.spawn(cmd)
									.pipe(Effect.mapError(mapError));
								yield* Effect.addFinalizer(() =>
									process.kill().pipe(Effect.ignore)
								);
								return yield* process.exitCode.pipe(
									Effect.mapError(mapError)
								);
							})
						)
				),

				/**
				 * Export a presentation to PDF or HTML.
				 */
				export: Effect.fn('Presenterm.export')(
					(
						filePath: string,
						format: ExportFormat,
						options?: {
							readonly outputPath?: string;
							readonly theme?: string;
						}
					): Effect.Effect<void, PresentermError> =>
						Effect.gen(function* () {
							const args: Array<string> = [filePath];

							if (format === 'pdf') {
								args.push('--export-pdf');
							} else {
								args.push('--export-html');
							}

							if (options?.outputPath) {
								args.push(options.outputPath);
							}

							if (options?.theme) {
								args.push('--theme', options.theme);
							}

							const cmd = ChildProcess.make('presenterm', args);
							const code = yield* spawner
								.exitCode(cmd)
								.pipe(Effect.mapError(mapError));
							if (code !== 0) {
								return yield* new PresentermError({
									reason: 'ExportFailed',
									message: `presenterm export exited with code ${code}`
								});
							}
						})
				),

				/**
				 * List available built-in themes.
				 * Parses the output of `presenterm --list-themes`.
				 */
				listThemes: Effect.fn('Presenterm.listThemes')(
					(): Effect.Effect<ReadonlyArray<string>, PresentermError> =>
						Effect.gen(function* () {
							const cmd = ChildProcess.make('presenterm', [
								'--list-themes'
							]);
							const output = yield* spawner
								.string(cmd)
								.pipe(Effect.mapError(mapError));
							return output
								.trim()
								.split('\n')
								.filter((line) => line.trim().length > 0);
						})
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make);
}
