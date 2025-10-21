/**
 * @fileoverview Tests for baseline rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/use-baseline.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";
import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		css,
	},
	language: "css/css",
});

ruleTester.run("use-baseline", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
		"body { padding: 0; }",
		"::before { content: attr(foo); }",
		"a { color: red; -moz-transition: bar }",
		"@font-face { font-weight: 100 400 }",
		"@media (min-width: 800px) { a { color: red; } }",
		"@media (foo) { a { color: red; } }",
		"@media (prefers-color-scheme: dark) { a { color: red; } }",
		"@MEDIA (min-width: 800px) { a { color: red; } }",
		"@Media (foo) { a { color: red; } }",
		"@MeDia (prefers-color-scheme: dark) { a { color: red; } }",
		"@supports (accent-color: auto) { a { accent-color: auto; } }",
		"@supports (accent-color: red) { a { accent-color: red; } }",
		"@supports (accent-color: auto) { a { accent-color: red; } }",
		"@supports (clip-path: fill-box) { a { clip-path: fill-box; } }",
		`@supports (accent-color: auto) and (backdrop-filter: auto) {
			a { accent-color: auto; background-filter: auto }
		}`,
		`@supports (accent-color: auto) {
			@supports (backdrop-filter: auto) {
				a { accent-color: auto; background-filter: auto }
			}
		}`,
		"@SUPPORTS (clip-path: fill-box) { a { clip-path: fill-box; } }",
		`@Supports (accent-color: auto) and (backdrop-filter: auto) {
			a { accent-color: auto; background-filter: auto }
		}`,
		`@SUPPORTS (accent-color: auto) {
			@SuPpOrTs (backdrop-filter: auto) {
				a { accent-color: auto; background-filter: auto }
			}
		}`,
		`@supports (accent-color: auto) {
			@supports (accent-color: auto) {
				a { accent-color: auto; }
			}
			a { accent-color: auto; }
		}`,
		`@supports (width: abs(20% - 100px)) {
			a { width: abs(20% - 100px); }
		}`,
		`@supports selector(:has()) {
				h1:has(+ h2) { color: red; }
		}`,
		"div { cursor: pointer; }",
		"pre { overflow: auto; }",
		".highlight, #highlight, highlight { color: red }",
		{
			code: `@property --foo {
				syntax: "*";
				inherits: false;
			}`,
			options: [{ available: "newly" }],
		},
		{
			code: "a { backdrop-filter: auto }",
			options: [{ available: "newly" }],
		},
		{
			code: "p { margin: .; }",
			languageOptions: {
				tolerant: true,
			},
		},
		{
			code: ".messages { overscroll-behavior: contain; }",
			options: [{ available: 2022 }],
		},
		{
			code: ".box { backdrop-filter: blur(10px); }",
			options: [{ available: 2024 }],
		},
		"@container (min-width: 800px) { a { color: red; } }",
		"@media (color-gamut: srgb) { a { color: red; } }",
		"@MEDIA (color-gamut: srgb) { a { color: red; } }",
		{
			code: "h1:has(+ h2) { margin: 0 0 0.25rem 0; }",
			options: [{ allowSelectors: ["has"] }],
		},
		{
			code: `label {
				& input {
					border: blue 2px dashed;
				}
			}`,
			options: [{ available: 2022, allowSelectors: ["nesting"] }],
		},
		{
			code: "@container (min-width: 800px) { a { color: red; } }",
			options: [{ available: 2022, allowAtRules: ["container"] }],
		},
		{
			code: "a { accent-color: bar; backdrop-filter: auto }",
			options: [{ allowProperties: ["accent-color", "backdrop-filter"] }],
		},
	],
	invalid: [
		{
			code: "a { accent-color: bar; backdrop-filter: auto }",
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "widely",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 17,
				},
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: "a { accent-color: bar; backdrop-filter: auto }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "newly",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: `@property --foo {
				syntax: "*";
				inherits: false;
			}
			@media (min-width: 800px) {
				a { color: red; }
			}`,
			options: [{ available: "widely" }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "property",
						availability: "widely",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "@view-transition { from-view: a; to-view: b; }\n@container (min-width: 800px) { a { color: red; } }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "view-transition",
						availability: "newly",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "@VIEW-TRANSITION { from-view: a; to-view: b; }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "VIEW-TRANSITION",
						availability: "newly",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`@supports (accent-color: auto) {
				@supports (backdrop-filter: auto) {
					a { accent-color: red; }
				}

				a { backdrop-filter: auto; }
			}`,
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 6,
					column: 6,
					endLine: 6,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`@SUPPORTS (accent-color: auto) {
				@SuPpOrTs (backdrop-filter: auto) {
					a { accent-color: red; }
				}

				a { backdrop-filter: auto; }
			}`,
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 6,
					column: 6,
					endLine: 6,
					endColumn: 21,
				},
			],
		},
		{
			code: "@supports (clip-path: fill-box) { a { clip-path: stroke-box; } }",
			errors: [
				{
					messageId: "notBaselinePropertyValue",
					data: {
						property: "clip-path",
						value: "stroke-box",
						availability: "widely",
					},
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 60,
				},
			],
		},
		{
			code: "@SUPPORTS (clip-path: fill-box) { a { clip-path: stroke-box; } }",
			errors: [
				{
					messageId: "notBaselinePropertyValue",
					data: {
						property: "clip-path",
						value: "stroke-box",
						availability: "widely",
					},
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 60,
				},
			],
		},
		{
			code: "@supports (accent-color: auto) { a { accent-color: abs(20% - 10px); } }",
			errors: [
				{
					messageId: "notBaselineFunction",
					data: {
						function: "abs",
						availability: "widely",
					},
					line: 1,
					column: 52,
					endLine: 1,
					endColumn: 67,
				},
			],
		},
		{
			code: "@supports not (accent-color: auto) { a { accent-color: auto } }",
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "widely",
					},
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 54,
				},
			],
		},
		{
			code: "a { width: abs(20% - 100px); }",
			errors: [
				{
					messageId: "notBaselineFunction",
					data: {
						function: "abs",
						availability: "widely",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "a { color: color-mix(in hsl, hsl(200 50 80), coral 80%); }",
			errors: [
				{
					messageId: "notBaselineFunction",
					data: {
						function: "color-mix",
						availability: "widely",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 56,
				},
			],
		},
		{
			code: "@media (inverted-colors: inverted) { a { color: red; } }",
			errors: [
				{
					messageId: "notBaselineMediaCondition",
					data: {
						condition: "inverted-colors",
						availability: "widely",
					},
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "@media (device-posture: folded) { a { color: red; } }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineMediaCondition",
					data: {
						condition: "device-posture",
						availability: "newly",
					},
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "@media (height: 600px) and (inverted-colors: inverted) and (device-posture: folded) { a { color: red; } }",
			errors: [
				{
					messageId: "notBaselineMediaCondition",
					data: {
						condition: "inverted-colors",
						availability: "widely",
					},
					line: 1,
					column: 29,
					endLine: 1,
					endColumn: 44,
				},
				{
					messageId: "notBaselineMediaCondition",
					data: {
						condition: "device-posture",
						availability: "widely",
					},
					line: 1,
					column: 61,
					endLine: 1,
					endColumn: 75,
				},
			],
		},
		{
			code: "@media (foo) and (inverted-colors: inverted) { a { color: red; } }",
			errors: [
				{
					messageId: "notBaselineMediaCondition",
					data: {
						condition: "inverted-colors",
						availability: "widely",
					},
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 34,
				},
			],
		},
		{
			code: "h1:has(+ h2) { margin: 0 0 0.25rem 0; }",
			errors: [
				{
					messageId: "notBaselineSelector",
					data: {
						selector: "has",
						availability: "widely",
					},
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: `@supports selector(:has()) {}

			@supports (color: red) {
				h1:has(+ h2) {
					color: red;
				}
			}`,
			errors: [
				{
					messageId: "notBaselineSelector",
					data: {
						selector: "has",
						availability: "widely",
					},
					line: 4,
					column: 7,
					endLine: 4,
					endColumn: 11,
				},
			],
		},
		{
			code: "details::details-content { background-color: #a29bfe; }",
			errors: [
				{
					messageId: "notBaselineSelector",
					data: {
						selector: "details-content",
						availability: "widely",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: ".box { backdrop-filter: blur(10px); }",
			options: [{ available: 2021 }],
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: 2021,
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: ".p { font-stretch: condensed; }",
			options: [{ available: 2015 }],
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "font-stretch",
						availability: 2015,
					},
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: `label {
				& input {
					border: blue 2px dashed;
				}
			}`,
			options: [{ available: 2022 }],
			errors: [
				{
					messageId: "notBaselineSelector",
					data: {
						selector: "nesting",
						availability: 2022,
					},
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 6,
				},
			],
		},
		{
			code: "@view-transition { from-view: a; to-view: b; }\n@container (min-width: 800px) { a { color: red; } }",
			options: [{ allowAtRules: ["container"] }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "view-transition",
						availability: "widely",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "a { accent-color: red; backdrop-filter: blur(10px); }",
			options: [{ allowProperties: ["accent-color"] }],
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: "h1:has(+ h2) { margin: 0; }\nh1:fullscreen { color: red; }",
			options: [{ allowSelectors: ["has"] }],
			errors: [
				{
					messageId: "notBaselineSelector",
					data: {
						selector: "fullscreen",
						availability: "widely",
					},
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 14,
				},
			],
		},
	],
});
