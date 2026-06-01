import { Layer } from "effect";
import { NodePlatformLayer } from "./node-platform.ts";
import { ExtensionRegistrar } from "../services/extension-registrar.ts";
import { SubagentTool } from "../services/subagent-tool.ts";

export const ParentExtensionLayer = Layer.mergeAll(
	NodePlatformLayer,
	SubagentTool.layer,
	ExtensionRegistrar.layer.pipe(Layer.provide(SubagentTool.layer))
);
