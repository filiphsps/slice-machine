import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: [
				"fp-ts",
				"r19",
				"p-limit",
				"get-port",
				"node-fetch",
				"hast-util-to-string",
				"@wooorm/starry-night",
				"file-type",
			],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				client: "./src/client.ts",
			},
		},
	},
	test: {
		coverage: {
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__"],
	},
});
