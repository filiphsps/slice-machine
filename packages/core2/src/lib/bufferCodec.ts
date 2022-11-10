import * as t from "io-ts";
import { Buffer } from "node:buffer";

export const bufferCodec = new t.Type<Buffer, Buffer, unknown>(
	"Buffer",
	(input): input is Buffer => Buffer.isBuffer(input),
	(input, context) =>
		Buffer.isBuffer(input) ? t.success(input) : t.failure(input, context),
	t.identity,
);
