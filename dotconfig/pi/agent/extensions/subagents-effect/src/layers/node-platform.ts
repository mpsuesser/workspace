import { Layer } from "effect";
import { NodeServices } from "@effect/platform-node";

/**
 * Real platform services for the extension runtime.
 *
 * `NodeServices.layer` provides `FileSystem`, `Path`, `Crypto`, `Stdio`,
 * `Terminal`, and `ChildProcessSpawner` in one composition, so every later
 * slice (catalog discovery, child process gateway, run engine) can capture the
 * platform capability it needs without importing `node:*` directly.
 */
export const NodePlatformLayer: Layer.Layer<NodeServices.NodeServices> = NodeServices.layer;

/**
 * Absolute path of this `src/layers` directory, exposed as a plain string via
 * the standard ESM `import.meta.dirname`. Path-dependent locations (such as the
 * bundled `agents/` directory) are derived from this with the `Path` service so
 * no `node:path`/`node:url` import is needed.
 */
export const layersDir: string = import.meta.dirname;
