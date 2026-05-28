import { defineConfig } from "vite-plus";

export default defineConfig({
	test: {
		setupFiles: [`${import.meta.dirname}/vitest.setup.ts`],
		include: ["test/**/*.test.ts"],
		passWithNoTests: true,
		globals: false,
		testTimeout: 30000,
		hookTimeout: 30000,
		pool: "forks",
		isolate: false,
	},
	fmt: {
		useTabs: true,
		tabWidth: 4,
		printWidth: 100,
		endOfLine: "lf",
		singleQuote: false,
		arrowParens: "always",
		bracketSpacing: true,
		semi: true,
		trailingComma: "all",
		ignore: ["*.md"],
	},
	staged: {
		"*.{ts,tsx,js,jsx}": ["vp check --fix", "vitest run"],
	},
	lint: {
		plugins: ["typescript", "import", "unicorn", "vitest"],
		overrides: [
			{
				files: ["**/*.{test,spec}.*"],
				rules: {},
			},
		],
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
});
