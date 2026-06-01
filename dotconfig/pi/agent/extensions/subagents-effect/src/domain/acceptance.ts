import { Effect } from "effect";
import * as Schema from "effect/Schema";

export const AcceptanceLevel = Schema.Literals(["auto", "none", "attested", "checked", "verified", "reviewed"]).annotate({
	title: "AcceptanceLevel",
	description: "Strictness level for validating a subagent step result."
});
export type AcceptanceLevel = typeof AcceptanceLevel.Type;

export const AcceptanceEvidenceKind = Schema.Literals([
	"changed-files",
	"tests-added",
	"commands-run",
	"validation-output",
	"residual-risks",
	"no-staged-files",
	"diff-summary",
	"review-findings",
	"manual-notes"
]).annotate({
	title: "AcceptanceEvidenceKind",
	description: "Evidence category requested by an acceptance gate."
});
export type AcceptanceEvidenceKind = typeof AcceptanceEvidenceKind.Type;

export class AcceptanceGate extends Schema.Class<AcceptanceGate>("AcceptanceGate")({
	id: Schema.NonEmptyString,
	must: Schema.NonEmptyString,
	evidence: Schema.OptionFromOptionalKey(Schema.Array(AcceptanceEvidenceKind)),
	severity: Schema.OptionFromOptionalKey(Schema.Literals(["required", "recommended"]))
}) {}

export class AcceptanceVerifyCommand extends Schema.Class<AcceptanceVerifyCommand>("AcceptanceVerifyCommand")({
	id: Schema.NonEmptyString,
	command: Schema.NonEmptyString,
	timeoutMs: Schema.OptionFromOptionalKey(Schema.Int.check(Schema.isGreaterThan(0))),
	cwd: Schema.OptionFromOptionalKey(Schema.String),
	env: Schema.OptionFromOptionalKey(Schema.Record(Schema.String, Schema.String)),
	allowFailure: Schema.OptionFromOptionalKey(Schema.Boolean)
}) {}

export class AcceptanceReviewGate extends Schema.Class<AcceptanceReviewGate>("AcceptanceReviewGate")({
	agent: Schema.OptionFromOptionalKey(Schema.String),
	focus: Schema.OptionFromOptionalKey(Schema.String),
	required: Schema.OptionFromOptionalKey(Schema.Boolean)
}) {}

export class AcceptancePolicy extends Schema.Class<AcceptancePolicy>("AcceptancePolicy")({
	level: AcceptanceLevel.pipe(
		Schema.withDecodingDefault(Effect.succeed("auto" as const)),
		Schema.withConstructorDefault(Effect.succeed("auto" as const))
	),
	criteria: Schema.Array(Schema.Union([Schema.String, AcceptanceGate])).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	evidence: Schema.Array(AcceptanceEvidenceKind).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	verify: Schema.Array(AcceptanceVerifyCommand).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	review: Schema.OptionFromOptionalKey(Schema.Union([Schema.Literal(false), AcceptanceReviewGate])),
	stopRules: Schema.Array(Schema.String).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	reason: Schema.OptionFromOptionalKey(Schema.String)
}) {}

export const AcceptanceInput = Schema.Union([
	AcceptanceLevel,
	Schema.Literal(false),
	AcceptancePolicy
]).annotate({
	title: "AcceptanceInput",
	description: "Public acceptance override accepted by tool invocations and agent definitions."
});
export type AcceptanceInput = typeof AcceptanceInput.Type;

export const AcceptanceLedgerStatus = Schema.Literals(["pending", "passed", "failed", "skipped"]).annotate({
	title: "AcceptanceLedgerStatus",
	description: "Evaluation state for an acceptance policy or gate."
});
export type AcceptanceLedgerStatus = typeof AcceptanceLedgerStatus.Type;

export class AcceptanceEvidenceRecord extends Schema.Class<AcceptanceEvidenceRecord>("AcceptanceEvidenceRecord")({
	kind: AcceptanceEvidenceKind,
	text: Schema.String
}) {}

export class AcceptanceGateResult extends Schema.Class<AcceptanceGateResult>("AcceptanceGateResult")({
	id: Schema.String,
	status: AcceptanceLedgerStatus,
	message: Schema.String,
	evidence: Schema.Array(AcceptanceEvidenceRecord).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	)
}) {}

export class AcceptanceLedger extends Schema.Class<AcceptanceLedger>("AcceptanceLedger")({
	level: AcceptanceLevel,
	status: AcceptanceLedgerStatus,
	gates: Schema.Array(AcceptanceGateResult).pipe(
		Schema.withDecodingDefault(Effect.succeed([])),
		Schema.withConstructorDefault(Effect.succeed([]))
	),
	summary: Schema.OptionFromOptionalKey(Schema.String)
}) {}
