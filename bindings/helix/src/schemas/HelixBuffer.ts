import * as Schema from 'effect/Schema';

export class HelixBuffer extends Schema.Class<HelixBuffer>('HelixBuffer')({
	buffer_name: Schema.String,
	cursor_column: Schema.Int.check(Schema.isGreaterThan(0)),
	cursor_line: Schema.Int.check(Schema.isGreaterThan(0)),
	language: Schema.String,
	selection_line_end: Schema.Int.check(Schema.isGreaterThan(0)),
	selection_line_start: Schema.Int.check(Schema.isGreaterThan(0))
}) {}
