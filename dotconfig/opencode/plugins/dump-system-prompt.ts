import type { Plugin } from "@opencode-ai/plugin";

const outputFile = new URL("../system-prompt.txt", import.meta.url);
const pendingSessions = new Set<string>();
const dumpedSessions = new Set<string>();

const log = async (
	client: Parameters<Plugin>[0]["client"],
	level: "info" | "warn" | "error",
	message: string,
	extra?: Record<string, unknown>
) => {
	const body = extra === undefined
		? { service: "dump-system-prompt", level, message }
		: { service: "dump-system-prompt", level, message, extra };

	await client.app
		.log({
			body
		})
		.catch(() => {});
};

const plugin = (async ({ client }) => {
	return {
		"chat.message": async (_input, output) => {
			const sessionID = output.message.sessionID;

			if (!dumpedSessions.has(sessionID)) {
				pendingSessions.add(sessionID);
			}
		},

		"experimental.chat.system.transform": async (input, output) => {
			const sessionID = input.sessionID;

			if (!sessionID || !pendingSessions.has(sessionID)) {
				return;
			}

			pendingSessions.delete(sessionID);

			await Bun.write(outputFile, output.system.join("\n\n"))
				.then(async () => {
					dumpedSessions.add(sessionID);

					await log(client, "info", "Wrote system prompt dump", {
						path: outputFile.pathname,
						sessionID
					});
				})
				.catch(async (error) => {
					pendingSessions.add(sessionID);

					await log(client, "error", "Failed to write system prompt dump", {
						path: outputFile.pathname,
						sessionID,
						error: String(error)
					});
				});
		},

		event: async ({ event }) => {
			if (event.type === "session.deleted") {
				pendingSessions.delete(event.properties.info.id);
				dumpedSessions.delete(event.properties.info.id);
			}
		}
	};
}) satisfies Plugin;

export default plugin;
