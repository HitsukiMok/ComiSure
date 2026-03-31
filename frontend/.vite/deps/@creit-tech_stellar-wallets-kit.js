import { A as LocalStorageKeys, B as J, C as selectedNetwork, D as KitEventType, E as wcSessionPaths, F as C, H as x, I as g, L as y$1, M as SwkAppLightTheme, N as SwkAppMode, O as ModuleType, P as SwkAppRoute, R as d, S as selectedModuleId, T as theme, V as _, _ as modalTitle, a as createSubject, b as route, c as activeAddress, d as allowedWallets, f as hardwareWalletPaths, g as mnemonicPath, h as installText, i as closeEvent, j as SwkAppDarkTheme, k as Networks, l as activeModule, m as horizonUrl, n as parseError, o as disconnectEvent, p as hideUnsupportedWallets, r as addressUpdatedEvent, s as moduleSelectedEvent, t as disconnect, u as activeModules, v as mode, w as showInstallLabel, x as routerHistory, y as resetWalletState, z as y } from "./utils-Db3O7fom.js";
//#region node_modules/htm/dist/htm.module.js
var n = function(t, s, r, e) {
	var u;
	s[0] = 0;
	for (var h = 1; h < s.length; h++) {
		var p = s[h++], a = s[h] ? (s[0] |= p ? 1 : 2, r[s[h++]]) : s[++h];
		3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h]] = a : 6 === p ? e[1][s[++h]] += a + "" : p ? (u = t.apply(a, n(t, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h - 2] = 0, s[h] = u)) : e.push(a);
	}
	return e;
}, t$1 = /* @__PURE__ */ new Map();
function htm_module_default(s) {
	var r = t$1.get(this);
	return r || (r = /* @__PURE__ */ new Map(), t$1.set(this, r)), (r = n(this, r.get(s) || (r.set(s, r = function(n) {
		for (var t, s, r = 1, e = "", u = "", h = [0], p = function(n) {
			1 === r && (n || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h.push(0, n, e) : 3 === r && (n || e) ? (h.push(3, n, e), r = 2) : 2 === r && "..." === e && n ? h.push(4, n, 0) : 2 === r && e && !n ? h.push(5, 0, !0, e) : r >= 5 && ((e || !n && 5 === r) && (h.push(r, 0, e, s), r = 6), n && (h.push(r, n, 0, s), r = 6)), e = "";
		}, a = 0; a < n.length; a++) {
			a && (1 === r && p(), p(a));
			for (var l = 0; l < n[a].length; l++) t = n[a][l], 1 === r ? "<" === t ? (p(), h = [h], r = 3) : e += t : 4 === r ? "--" === e && ">" === t ? (r = 1, e = "") : e = t + e[0] : u ? t === u ? u = "" : e += t : "\"" === t || "'" === t ? u = t : ">" === t ? (p(), r = 1) : r && ("=" === t ? (r = 5, s = e, e = "") : "/" === t && (r < 5 || ">" === n[a][l + 1]) ? (p(), 3 === r && (h = h[0]), r = h, (h = h[0]).push(2, 0, r), r = 0) : " " === t || "	" === t || "\n" === t || "\r" === t ? (p(), r = 2) : e += t), 3 === r && "!--" === e && (r = 4, h = h[0]);
		}
		return p(), h;
	}(s)), r), arguments, [])).length > 1 ? r : r[0];
}
//#endregion
//#region node_modules/htm/preact/index.module.js
var m = htm_module_default.bind(_);
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/state/effects.js
var localstorage = globalThis.localStorage;
var document$1 = globalThis.document;
var updatedThemeEffect = C(() => {
	if (document$1) for (const [key, value] of Object.entries(theme.value)) document$1.documentElement.style.setProperty(`--swk-${key}`, value);
});
var updatedSelectedModule = C(() => {
	if (localstorage && !!activeModule.value) try {
		const record = localstorage.getItem(LocalStorageKeys.usedWalletsIds);
		const usedWalletsIds = record ? new Set(JSON.parse(record)) : /* @__PURE__ */ new Set();
		if (usedWalletsIds.has(activeModule.value.productId)) usedWalletsIds.delete(activeModule.value.productId);
		localstorage.setItem(LocalStorageKeys.usedWalletsIds, JSON.stringify([activeModule.value.productId, ...usedWalletsIds]));
	} catch (e) {
		console.error(e);
	}
});
var updateActiveSession = C(() => {
	if (localstorage) {
		if (activeAddress.value) localstorage.setItem(LocalStorageKeys.activeAddress, activeAddress.value);
		else localstorage.removeItem(LocalStorageKeys.activeAddress);
		if (selectedModuleId.value) localstorage.setItem(LocalStorageKeys.selectedModuleId, selectedModuleId.value);
		else localstorage.removeItem(LocalStorageKeys.selectedModuleId);
		if (typeof hardwareWalletPaths.value !== "undefined") localstorage.setItem(LocalStorageKeys.hardwareWalletPaths, JSON.stringify(hardwareWalletPaths.value));
		if (typeof wcSessionPaths.value !== "undefined") localstorage.setItem(LocalStorageKeys.wcSessionPaths, JSON.stringify(wcSessionPaths.value));
	}
});
//#endregion
//#region node_modules/@twind/core/core.dev.js
var active;
function toClassName(rule) {
	return [...rule.v, (rule.i ? "!" : "") + rule.n].join(":");
}
function format(rules, seperator = ",") {
	return rules.map(toClassName).join(seperator);
}
/**
* @internal
*/ var escape = "undefined" != typeof CSS && CSS.escape || ((className) => className.replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, "\\$&").replace(/^\d/, "\\3$& "));
/**
* @group Configuration
* @param value
* @returns
*/ function hash(value) {
	for (var h = 9, index = value.length; index--;) h = Math.imul(h ^ value.charCodeAt(index), 1597334677);
	return "#" + ((h ^ h >>> 9) >>> 0).toString(36);
}
/**
* @internal
* @param screen
* @param prefix
* @returns
*/ function mql(screen, prefix = "@media ") {
	return prefix + asArray(screen).map((screen) => {
		return "string" == typeof screen && (screen = { min: screen }), screen.raw || Object.keys(screen).map((feature) => `(${feature}-width:${screen[feature]})`).join(" and ");
	}).join(",");
}
/**
* @internal
* @param value
* @returns
*/ function asArray(value = []) {
	return Array.isArray(value) ? value : null == value ? [] : [value];
}
/**
* @internal
* @param value
* @returns
*/ function identity(value) {
	return value;
}
/**
* @internal
*/ function noop() {}
var Layer = {
	d: 0,
	b: 134217728,
	c: 268435456,
	a: 671088640,
	u: 805306368,
	o: 939524096
};
function seperatorPrecedence(string) {
	return string.match(/[-=:;]/g)?.length || 0;
}
function atRulePrecedence(css) {
	return Math.min(/(?:^|width[^\d]+)(\d+(?:.\d+)?)(p)?/.test(css) ? Math.max(0, 29.63 * (+RegExp.$1 / (RegExp.$2 ? 15 : 1)) ** .137 - 43) : 0, 15) << 22 | Math.min(seperatorPrecedence(css), 15) << 18;
}
var PRECEDENCES_BY_PSEUDO_CLASS = [
	"rst-c",
	"st-ch",
	"h-chi",
	"y-lin",
	"nk",
	"sited",
	"ecked",
	"pty",
	"ad-on",
	"cus-w",
	"ver",
	"cus",
	"cus-v",
	"tive",
	"sable",
	"tiona",
	"quire"
];
/** The name to use for `&` expansion in selectors. Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ... */ /** The calculated precedence taking all variants into account. */ /** The rulesets (selectors and at-rules). expanded variants `@media ...`, `@supports ...`, `&:focus`, `.dark &` */ /** Is this rule `!important` eg something like `!underline` or `!bg-red-500` or `!red-500` */ function convert({ n: name, i: important, v: variants = [] }, context, precedence, conditions) {
	name && (name = toClassName({
		n: name,
		i: important,
		v: variants
	}));
	conditions = [...asArray(conditions)];
	for (let variant of variants) {
		let screen = context.theme("screens", variant);
		for (let condition of asArray(screen && mql(screen) || context.v(variant))) {
			var selector;
			conditions.push(condition);
			precedence |= screen ? 67108864 | atRulePrecedence(condition) : "dark" == variant ? 1073741824 : "@" == condition[0] ? atRulePrecedence(condition) : (selector = condition, 1 << ~(/:([a-z-]+)/.test(selector) && ~PRECEDENCES_BY_PSEUDO_CLASS.indexOf(RegExp.$1.slice(2, 7)) || -18));
		}
	}
	return {
		n: name,
		p: precedence,
		r: conditions,
		i: important
	};
}
var registry = /* @__PURE__ */ new Map();
function stringify$1(rule) {
	if (rule.d) {
		let groups = [], selector = replaceEach(rule.r.reduce((selector, condition) => {
			return "@" == condition[0] ? (groups.push(condition), selector) : condition ? replaceEach(selector, (selectorPart) => replaceEach(condition, (conditionPart) => {
				let mergeMatch = /(:merge\(.+?\))(:[a-z-]+|\\[.+])/.exec(conditionPart);
				if (mergeMatch) {
					let selectorIndex = selectorPart.indexOf(mergeMatch[1]);
					return ~selectorIndex ? selectorPart.slice(0, selectorIndex) + mergeMatch[0] + selectorPart.slice(selectorIndex + mergeMatch[1].length) : replaceReference(selectorPart, conditionPart);
				}
				return replaceReference(conditionPart, selectorPart);
			})) : selector;
		}, "&"), (selectorPart) => replaceReference(selectorPart, rule.n ? "." + escape(rule.n) : ""));
		return selector && groups.push(selector.replace(/:merge\((.+?)\)/g, "$1")), groups.reduceRight((body, grouping) => grouping + "{" + body + "}", rule.d);
	}
}
function replaceEach(selector, iteratee) {
	return selector.replace(/ *((?:\(.+?\)|\[.+?\]|[^,])+) *(,|$)/g, (_, selectorPart, comma) => iteratee(selectorPart) + comma);
}
function replaceReference(selector, reference) {
	return selector.replace(/&/g, reference);
}
var collator = new Intl.Collator("en", { numeric: true });
/** The calculated precedence taking all variants into account. */ /** The name to use for `&` expansion in selectors. Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ... */ /**
* Find the array index of where to add an element to keep it sorted.
*
* @returns The insertion index
*/ function sortedInsertionIndex(array, element) {
	for (var low = 0, high = array.length; low < high;) {
		let pivot = high + low >> 1;
		0 >= compareTwindRules(array[pivot], element) ? low = pivot + 1 : high = pivot;
	}
	return high;
}
function compareTwindRules(a, b) {
	let layer = a.p & Layer.o;
	return layer == (b.p & Layer.o) && (layer == Layer.b || layer == Layer.o) ? 0 : a.p - b.p || a.o - b.o || collator.compare(byModifier(a.n), byModifier(b.n)) || collator.compare(byName(a.n), byName(b.n));
}
function byModifier(s) {
	return (s || "").split(/:/).pop().split("/").pop() || "\0";
}
function byName(s) {
	return (s || "").replace(/\W/g, (c) => String.fromCharCode(127 + c.charCodeAt(0))) + "\0";
}
function parseColorComponent(chars, factor) {
	return Math.round(parseInt(chars, 16) * factor);
}
/**
* @internal
* @param color
* @param options
* @returns
*/ function toColorValue(color, options = {}) {
	if ("function" == typeof color) return color(options);
	let { opacityValue = "1", opacityVariable } = options, opacity = opacityVariable ? `var(${opacityVariable})` : opacityValue;
	if (color.includes("<alpha-value>")) return color.replace("<alpha-value>", opacity);
	if ("#" == color[0] && (4 == color.length || 7 == color.length)) {
		let size = (color.length - 1) / 3, factor = [
			17,
			1,
			.062272
		][size - 1];
		return `rgba(${[
			parseColorComponent(color.substr(1, size), factor),
			parseColorComponent(color.substr(1 + size, size), factor),
			parseColorComponent(color.substr(1 + 2 * size, size), factor),
			opacity
		]})`;
	}
	return "1" == opacity ? color : "0" == opacity ? "#0000" : color.replace(/^(rgb|hsl)(\([^)]+)\)$/, `$1a$2,${opacity})`);
}
function serialize(style, rule, context, precedence, conditions = []) {
	return function serialize$(style, { n: name, p: precedence, r: conditions = [], i: important }, context) {
		let rules = [], declarations = "", maxPropertyPrecedence = 0, numberOfDeclarations = 0;
		for (let key in style || {}) {
			var layer, property;
			let value = style[key];
			if ("@" == key[0]) {
				if (!value) continue;
				if ("a" == key[1]) {
					rules.push(...translateWith(name, precedence, parse("" + value), context, precedence, conditions, important, true));
					continue;
				}
				if ("l" == key[1]) {
					for (let css of asArray(value)) rules.push(...serialize$(css, {
						n: name,
						p: (layer = Layer[key[7]], precedence & ~Layer.o | layer),
						r: "d" == key[7] ? [] : conditions,
						i: important
					}, context));
					continue;
				}
				if ("i" == key[1]) {
					rules.push(...asArray(value).map((value) => ({
						p: -1,
						o: 0,
						r: [],
						d: key + " " + value
					})));
					continue;
				}
				if ("k" == key[1]) {
					rules.push({
						p: Layer.d,
						o: 0,
						r: [key],
						d: serialize$(value, { p: Layer.d }, context).map(stringify$1).join("")
					});
					continue;
				}
				if ("f" == key[1]) {
					rules.push(...asArray(value).map((value) => ({
						p: Layer.d,
						o: 0,
						r: [key],
						d: serialize$(value, { p: Layer.d }, context).map(stringify$1).join("")
					})));
					continue;
				}
			}
			if ("object" != typeof value || Array.isArray(value)) {
				if ("label" == key && value) name = value + hash(JSON.stringify([
					precedence,
					important,
					style
				]));
				else if (value || 0 === value) {
					key = key.replace(/[A-Z]/g, (_) => "-" + _.toLowerCase());
					numberOfDeclarations += 1;
					maxPropertyPrecedence = Math.max(maxPropertyPrecedence, "-" == (property = key)[0] ? 0 : seperatorPrecedence(property) + (/^(?:(border-(?!w|c|sty)|[tlbr].{2,4}m?$|c.{7,8}$)|([fl].{5}l|g.{8}$|pl))/.test(property) ? +!!RegExp.$1 || -!!RegExp.$2 : 0) + 1);
					declarations += (declarations ? ";" : "") + asArray(value).map((value) => context.s(key, resolveThemeFunction("" + value, context.theme) + (important ? " !important" : ""))).join(";");
				}
			} else if ("@" == key[0] || key.includes("&")) {
				let rulePrecedence = precedence;
				if ("@" == key[0]) {
					key = key.replace(/\bscreen\(([^)]+)\)/g, (_, screenKey) => {
						let screen = context.theme("screens", screenKey);
						return screen ? (rulePrecedence |= 67108864, mql(screen, "")) : _;
					});
					rulePrecedence |= atRulePrecedence(key);
				}
				rules.push(...serialize$(value, {
					n: name,
					p: rulePrecedence,
					r: [...conditions, key],
					i: important
				}, context));
			} else rules.push(...serialize$(value, {
				p: precedence,
				r: [...conditions, key]
			}, context));
		}
		return rules.unshift({
			n: name,
			p: precedence,
			o: Math.max(0, 15 - numberOfDeclarations) + 1.5 * Math.min(maxPropertyPrecedence || 15, 15),
			r: conditions,
			d: declarations
		}), rules.sort(compareTwindRules);
	}(style, convert(rule, context, precedence, conditions), context);
}
function resolveThemeFunction(value, theme) {
	return value.replace(/theme\((["'`])?(.+?)\1(?:\s*,\s*(["'`])?(.+?)\3)?\)/g, (_, __, key, ___, defaultValue = "") => {
		let value = theme(key, defaultValue);
		return "function" == typeof value && /color|fill|stroke/i.test(key) ? toColorValue(value) : "" + asArray(value).filter((v) => Object(v) !== v);
	});
}
function merge(rules, name) {
	let current;
	let result = [];
	for (let rule of rules) if (rule.d && rule.n) if (current?.p == rule.p && "" + current.r == "" + rule.r) {
		current.c = [current.c, rule.c].filter(Boolean).join(" ");
		current.d = current.d + ";" + rule.d;
	} else result.push(current = {
		...rule,
		n: rule.n && name
	});
	else result.push({
		...rule,
		n: rule.n && name
	});
	return result;
}
function translate(rules, context, precedence = Layer.u, conditions, important) {
	let result = [];
	for (let rule of rules) for (let cssRule of function(rule, context, precedence, conditions, important) {
		rule = {
			...rule,
			i: rule.i || important
		};
		let resolved = function(rule, context) {
			let factory = registry.get(rule.n);
			return factory ? factory(rule, context) : context.r(rule.n, "dark" == rule.v[0]);
		}(rule, context);
		return resolved ? "string" == typeof resolved ? ({r: conditions, p: precedence} = convert(rule, context, precedence, conditions), merge(translate(parse(resolved), context, precedence, conditions, rule.i), rule.n)) : Array.isArray(resolved) ? resolved.map((rule) => {
			var precedence1, layer;
			return {
				o: 0,
				...rule,
				r: [...asArray(conditions), ...asArray(rule.r)],
				p: (precedence1 = precedence, layer = rule.p ?? precedence, precedence1 & ~Layer.o | layer)
			};
		}) : serialize(resolved, rule, context, precedence, conditions) : [{
			c: toClassName(rule),
			p: 0,
			o: 0,
			r: []
		}];
	}(rule, context, precedence, conditions, important)) result.splice(sortedInsertionIndex(result, cssRule), 0, cssRule);
	return result;
}
function translateWith(name, layer, rules, context, precedence, conditions, important, useOrderOfRules) {
	return merge((useOrderOfRules ? rules.flatMap((rule) => translate([rule], context, precedence, conditions, important)) : translate(rules, context, precedence, conditions, important)).map((rule) => {
		return rule.p & Layer.o && (rule.n || layer == Layer.b) ? {
			...rule,
			p: rule.p & ~Layer.o | layer,
			o: 0
		} : rule;
	}), name);
}
function define(className, layer, rules, useOrderOfRules) {
	var factory;
	return factory = (rule, context) => {
		let { n: name, p: precedence, r: conditions, i: important } = convert(rule, context, layer);
		return rules && translateWith(name, layer, rules, context, precedence, conditions, important, useOrderOfRules);
	}, registry.set(className, factory), className;
}
/**
* The utility name including `-` if set, but without `!` and variants
*/ /**
* All variants without trailing colon: `hover`, `after:`, `[...]`
*/ /**
* Something like `!underline` or `!bg-red-500` or `!red-500`
*/ function createRule(active, current, loc) {
	if ("(" != active[active.length - 1]) {
		let variants = [], important = false, negated = false, name = "";
		for (let value of active) if (!("(" == value || /[~@]$/.test(value))) {
			if ("!" == value[0]) {
				value = value.slice(1);
				important = !important;
			}
			if (value.endsWith(":")) {
				variants["dark:" == value ? "unshift" : "push"](value.slice(0, -1));
				continue;
			}
			if ("-" == value[0]) {
				value = value.slice(1);
				negated = !negated;
			}
			value.endsWith("-") && (value = value.slice(0, -1));
			value && "&" != value && (name += (name && "-") + value);
		}
		if (name) {
			negated && (name = "-" + name);
			current[0].push(Object.defineProperties({
				n: name,
				v: variants.filter(uniq),
				i: important
			}, {
				a: { value: [...active] },
				l: { value: loc }
			}));
		}
	}
}
function uniq(value, index, values) {
	return values.indexOf(value) == index;
}
var cache = /* @__PURE__ */ new Map();
/**
* @internal
* @param token
* @returns
*/ function parse(token) {
	let parsed = cache.get(token);
	if (!parsed) {
		let active = [], current = [[]], startIndex = 0, skip = 0, comment = null, position = 0, commit = (isRule, endOffset = 0) => {
			if (startIndex != position) {
				active.push(token.slice(startIndex, position + endOffset));
				isRule && createRule(active, current, [startIndex, position + endOffset]);
			}
			startIndex = position + 1;
		};
		for (; position < token.length; position++) {
			let char = token[position];
			if (skip) "\\" != token[position - 1] && (skip += +("[" == char) || -("]" == char));
			else if ("[" == char) skip += 1;
			else if (comment) {
				if ("\\" != token[position - 1] && comment.test(token.slice(position))) {
					comment = null;
					startIndex = position + RegExp.lastMatch.length;
				}
			} else if ("/" == char && "\\" != token[position - 1] && ("*" == token[position + 1] || "/" == token[position + 1])) comment = "*" == token[position + 1] ? /^\*\// : /^[\r\n]/;
			else if ("(" == char) {
				commit();
				active.push(char);
			} else if (":" == char) ":" != token[position + 1] && commit(false, 1);
			else if (/[\s,)]/.test(char)) {
				commit(true);
				let lastGroup = active.lastIndexOf("(");
				if (")" == char) {
					let nested = active[lastGroup - 1];
					if (/[~@]$/.test(nested)) {
						let rules = current.shift();
						active.length = lastGroup;
						createRule([...active, "#"], current, [startIndex, position]);
						let { v } = current[0].pop();
						for (let rule of rules) rule.v.splice(+("dark" == rule.v[0]) - +("dark" == v[0]), v.length);
						createRule([...active, define(nested.length > 1 ? nested.slice(0, -1) + hash(JSON.stringify([nested, rules])) : nested + "(" + format(rules) + ")", Layer.a, rules, /@$/.test(nested))], current, [startIndex, position]);
					}
					lastGroup = active.lastIndexOf("(", lastGroup - 1);
				}
				active.length = lastGroup + 1;
			} else /[~@]/.test(char) && "(" == token[position + 1] && current.unshift([]);
		}
		commit(true);
		cache.set(token, parsed = current[0]);
	}
	return parsed;
}
function interleave(strings, interpolations, handle) {
	return interpolations.reduce((result, interpolation, index) => result + handle(interpolation) + strings[index + 1], strings[0]);
}
function interpolate(strings, interpolations) {
	return Array.isArray(strings) && Array.isArray(strings.raw) ? interleave(strings, interpolations, (value) => toString(value).trim()) : interpolations.filter(Boolean).reduce((result, value) => result + toString(value), strings ? toString(strings) : "");
}
function toString(value) {
	let tmp, result = "";
	if (value && "object" == typeof value) if (Array.isArray(value)) (tmp = interpolate(value[0], value.slice(1))) && (result += " " + tmp);
	else for (let key in value) value[key] && (result += " " + key);
	else null != value && "boolean" != typeof value && (result += " " + value);
	return result;
}
function astish(strings, interpolations) {
	return Array.isArray(strings) ? astish$(interleave(strings, interpolations, (interpolation) => null != interpolation && "boolean" != typeof interpolation ? interpolation : "")) : "string" == typeof strings ? astish$(strings) : [strings];
}
var newRule = / *(?:(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}))/g;
/**
* Convert a css style string into a object
*/ function astish$(css) {
	let block;
	css = css.replace(/\/\*[^]*?\*\/|\s\s+|\n/gm, " ");
	let tree = [{}], rules = [tree[0]], conditions = [];
	for (; block = newRule.exec(css);) {
		if (block[4]) {
			tree.shift();
			conditions.shift();
		}
		if (block[3]) {
			conditions.unshift(block[3]);
			tree.unshift({});
			rules.push(conditions.reduce((body, condition) => ({ [condition]: body }), tree[0]));
		} else if (!block[4]) {
			if (tree[0][block[1]]) {
				tree.unshift({});
				rules.push(conditions.reduce((body, condition) => ({ [condition]: body }), tree[0]));
			}
			tree[0][block[1]] = block[2];
		}
	}
	return rules;
}
/**
* @group Class Name Generators
* @param strings
* @param interpolations
*/ function css(strings, ...interpolations) {
	var factory;
	let ast = astish(strings, interpolations), className = (ast.find((o) => o.label)?.label || "css") + hash(JSON.stringify(ast));
	return factory = (rule, context) => merge(ast.flatMap((css) => serialize(css, rule, context, Layer.o)), className), registry.set(className, factory), className;
}
/**
* @group Configuration
* @param pattern
*/ /**
* @group Configuration
* @param pattern
* @param resolver
*/ /**
* @group Configuration
* @param pattern
* @param resolve
*/
/**
* @group Configuration
* @param pattern
* @param resolve
* @param convert
*/ function match(pattern, resolve, convert) {
	return [pattern, fromMatch(resolve, convert)];
}
/**
* @group Configuration
* @internal
* @deprecated Use {@link match} instead.
*/ /**
* @group Configuration
* @internal
* @deprecated Use {@link match} instead.
*/ /**
* @group Configuration
* @internal
* @deprecated Use {@link match} instead.
*/ /**
* @group Configuration
* @internal
* @deprecated Use {@link match} instead.
*/ function fromMatch(resolve, convert) {
	return "function" == typeof resolve ? resolve : "string" == typeof resolve && /^[\w-]+$/.test(resolve) ? (match, context) => ({ [resolve]: convert ? convert(match, context) : maybeNegate(match, 1) }) : (match) => resolve || { [match[1]]: maybeNegate(match, 2) };
}
function maybeNegate(match, offset, value = match.slice(offset).find(Boolean) || match.$$ || match.input) {
	return "-" == match.input[0] ? `calc(${value} * -1)` : value;
}
/**
* @group Configuration
* @param pattern
* @param section
* @param resolve
* @param convert
* @returns
*/ function matchTheme(pattern, section, resolve, convert) {
	return [pattern, fromTheme(section, resolve, convert)];
}
/**
* @group Configuration
* @internal
* @deprecated Use {@link matchTheme} instead.
* @param section
* @param resolve
* @param convert
* @returns
*/ function fromTheme(section, resolve, convert) {
	let factory = "string" == typeof resolve ? (match, context) => ({ [resolve]: convert ? convert(match, context) : match._ }) : resolve || (({ 1: $1, _ }, context, section) => ({ [$1 || section]: _ }));
	return withAutocomplete((match, context) => {
		let themeSection = camelize(section || match[1]), value = context.theme(themeSection, match.$$) ?? arbitrary(match.$$, themeSection, context);
		if (null != value) return match._ = maybeNegate(match, 0, value), factory(match, context, themeSection);
	}, (match, context) => {
		let themeSection = camelize(section || match[1]);
		if (match.input.endsWith("-")) return Object.entries(context.theme(themeSection) || {}).filter(([key, value]) => key && "DEFAULT" != key && (!/color|fill|stroke/i.test(themeSection) || ["string", "function"].includes(typeof value))).map(([key, value]) => ({
			suffix: key.replace(/-DEFAULT/g, ""),
			theme: {
				section: themeSection,
				key
			},
			color: /color|fill|stroke/i.test(themeSection) && toColorValue(value, { opacityValue: "1" })
		})).concat([{ suffix: "[" }]);
		let value = context.theme(themeSection, "DEFAULT");
		return value ? [{
			suffix: "",
			theme: {
				section: themeSection,
				key: "DEFAULT"
			},
			color: /color|fill|stroke/i.test(themeSection) && toColorValue(value, { opacityValue: "1" })
		}] : [];
	});
}
/** Theme section to use (default: `$0.replace('-', 'Color')` — The matched string with `Color` appended) */ /** The css property (default: value of {@link section}) */ /** `--tw-${$0}opacity` -> '--tw-text-opacity' */ /** `section.replace('Color', 'Opacity')` -> 'textOpacity' */ /**
* @group Configuration
* @param pattern
* @param options
* @param resolve
* @returns
*/ function matchColor(pattern, options = {}, resolve) {
	return [pattern, colorFromTheme(options, resolve)];
}
/**
* @group Configuration
* @internal
* @deprecated Use {@link matchColor} instead.
* @param options
* @param resolve
* @returns
*/ function colorFromTheme(options = {}, resolve) {
	return withAutocomplete((match, context) => {
		let { section = camelize(match[0]).replace("-", "") + "Color" } = options, [colorMatch, opacityMatch] = parseValue(match.$$);
		if (!colorMatch) return;
		let colorValue = context.theme(section, colorMatch) || arbitrary(colorMatch, section, context);
		if (!colorValue || "object" == typeof colorValue) return;
		let { opacityVariable = `--tw-${match[0].replace(/-$/, "")}-opacity`, opacitySection = section.replace("Color", "Opacity"), property = section, selector } = options, opacityValue = context.theme(opacitySection, opacityMatch || "DEFAULT") || opacityMatch && arbitrary(opacityMatch, opacitySection, context), create = resolve || (({ _ }) => {
			let properties = toCSS(property, _);
			return selector ? { [selector]: properties } : properties;
		});
		match._ = {
			value: toColorValue(colorValue, {
				opacityVariable: opacityVariable || void 0,
				opacityValue: opacityValue || void 0
			}),
			color: (options) => toColorValue(colorValue, options),
			opacityVariable: opacityVariable || void 0,
			opacityValue: opacityValue || void 0
		};
		let properties = create(match, context);
		if (!match.dark) {
			let darkColorValue = context.d(section, colorMatch, colorValue);
			if (darkColorValue && darkColorValue !== colorValue) {
				match._ = {
					value: toColorValue(darkColorValue, {
						opacityVariable: opacityVariable || void 0,
						opacityValue: opacityValue || "1"
					}),
					color: (options) => toColorValue(darkColorValue, options),
					opacityVariable: opacityVariable || void 0,
					opacityValue: opacityValue || void 0
				};
				properties = {
					"&": properties,
					[context.v("dark")]: create(match, context)
				};
			}
		}
		return properties;
	}, (match, context) => {
		let { section = camelize(match[0]).replace("-", "") + "Color", opacitySection = section.replace("Color", "Opacity") } = options, isKeyLookup = match.input.endsWith("-"), opacities = Object.entries(context.theme(opacitySection) || {}).filter(([key, value]) => "DEFAULT" != key && /^[\w-]+$/.test(key) && "string" == typeof value);
		if (isKeyLookup) return Object.entries(context.theme(section) || {}).filter(([key, value]) => key && "DEFAULT" != key && ["string", "function"].includes(typeof value)).map(([key, value]) => ({
			suffix: key.replace(/-DEFAULT/g, ""),
			theme: {
				section,
				key
			},
			color: toColorValue(value, { opacityValue: context.theme(opacitySection, "DEFAULT") || "1" }),
			modifiers: ("function" == typeof value || "string" == typeof value && (value.includes("<alpha-value>") || "#" == value[0] && (4 == value.length || 7 == value.length))) && opacities.map(([key, opacityValue]) => ({
				modifier: key,
				theme: {
					section: opacitySection,
					key
				},
				color: toColorValue(value, { opacityValue })
			})).concat([{
				modifier: "[",
				color: toColorValue(value, { opacityValue: "1" })
			}])
		})).concat([{ suffix: "[" }]);
		let value = context.theme(section, "DEFAULT");
		return value ? [{
			suffix: "",
			theme: {
				section,
				key: "DEFAULT"
			},
			color: toColorValue(value, { opacityValue: context.theme(opacitySection, "DEFAULT") || "1" }),
			modifiers: ("function" == typeof value || "string" == typeof value && (value.includes("<alpha-value>") || "#" == value[0] && (4 == value.length || 7 == value.length))) && opacities.map(([key, opacityValue]) => ({
				modifier: key,
				theme: {
					section: opacitySection,
					key
				},
				color: toColorValue(value, { opacityValue })
			})).concat([{
				modifier: "[",
				color: toColorValue(value, { opacityValue: "1" })
			}])
		}] : [];
	});
}
/**
* @internal
* @param input
*/ function parseValue(input) {
	return (input.match(/^(\[[^\]]+]|[^/]+?)(?:\/(.+))?$/) || []).slice(1);
}
/**
* @internal
* @param property
* @param value
* @returns
*/ function toCSS(property, value) {
	let properties = {};
	if ("string" == typeof value) properties[property] = value;
	else {
		value.opacityVariable && value.value.includes(value.opacityVariable) && (properties[value.opacityVariable] = value.opacityValue || "1");
		properties[property] = value.value;
	}
	return properties;
}
/**
* @internal
* @param value
* @param section
* @param context
* @returns
*/ function arbitrary(value, section, context) {
	if ("[" == value[0] && "]" == value.slice(-1)) {
		value = normalize(resolveThemeFunction(value.slice(1, -1), context.theme));
		if (!section) return value;
		if (!(/color|fill|stroke/i.test(section) && !(/^color:/.test(value) || /^(#|((hsl|rgb)a?|hwb|lab|lch|color)\(|[a-z]+$)/.test(value)) || /image/i.test(section) && !(/^image:/.test(value) || /^[a-z-]+\(/.test(value)) || /weight/i.test(section) && !(/^(number|any):/.test(value) || /^\d+$/.test(value)) || /position/i.test(section) && /^(length|size):/.test(value))) return value.replace(/^[a-z-]+:/, "");
	}
}
function camelize(value) {
	return value.replace(/-./g, (x) => x[1].toUpperCase());
}
/**
* @internal
* @param value
* @returns
*/ function normalize(value) {
	return value.includes("url(") ? value.replace(/(.*?)(url\(.*?\))(.*?)/g, (_, before = "", url, after = "") => normalize(before) + url + normalize(after)) : value.replace(/(^|[^\\])_+/g, (fullMatch, characterBefore) => characterBefore + " ".repeat(fullMatch.length - characterBefore.length)).replace(/\\_/g, "_").replace(/(calc|min|max|clamp)\(.+\)/g, (match) => match.replace(/(-?\d*\.?\d(?!\b-.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, "$1 $2 "));
}
/** Allows to resolve theme values. */ var kAutocomplete = /* @__PURE__ */ Symbol("@twind/autocomplete");
/**
* @experimental
* @group Configuration
* @param resolver
* @param autocomplete
*/ function withAutocomplete(rule, autocomplete) {
	if (autocomplete) {
		if ("function" == typeof rule) return Object.defineProperty(rule, kAutocomplete, {
			value: autocomplete,
			configurable: true
		});
		let [pattern, resolve, convert] = asArray(rule);
		return [pattern, Object.defineProperty(fromMatch(resolve, convert), kAutocomplete, {
			value: autocomplete,
			configurable: true
		})];
	}
	return rule;
}
/**
* Constructs `class` strings conditionally.
*
* Twinds version of popular libraries like [classnames](https://github.com/JedWatson/classnames) or [clsx](https://github.com/lukeed/clsx).
* The key advantage of `cx` is that it supports twinds enhanced class name syntax like grouping and aliases.
*
* @group Class Name Generators
* @param strings
* @param interpolations
* @returns
*/ /**
* Constructs `class` strings conditionally.
*
* Twinds version of popular libraries like [classnames](https://github.com/JedWatson/classnames) or [clsx](https://github.com/lukeed/clsx).
* The key advantage of `cx` is that it supports twinds enhanced class name syntax like grouping and aliases.
*
* @group Class Name Generators
* @param input
*/ function cx(strings, ...interpolations) {
	return format(parse(interpolate(strings, interpolations)), " ");
}
/**
* @group Configuration
* @param param0
* @returns
*/ function defineConfig({ presets = [], ...userConfig }) {
	let config = {
		darkMode: void 0,
		darkColor: void 0,
		preflight: false !== userConfig.preflight && [],
		theme: {},
		variants: asArray(userConfig.variants),
		rules: asArray(userConfig.rules),
		ignorelist: asArray(userConfig.ignorelist),
		hash: void 0,
		stringify: (property, value) => property + ":" + value,
		finalize: []
	};
	for (let preset of asArray([...presets, {
		darkMode: userConfig.darkMode,
		darkColor: userConfig.darkColor,
		preflight: false !== userConfig.preflight && asArray(userConfig.preflight),
		theme: userConfig.theme,
		hash: userConfig.hash,
		stringify: userConfig.stringify,
		finalize: userConfig.finalize
	}])) {
		let { preflight, darkMode = config.darkMode, darkColor = config.darkColor, theme, variants, rules, ignorelist, hash = config.hash, stringify = config.stringify, finalize } = "function" == typeof preset ? preset(config) : preset;
		config = {
			preflight: false !== config.preflight && false !== preflight && [...config.preflight, ...asArray(preflight)],
			darkMode,
			darkColor,
			theme: {
				...config.theme,
				...theme,
				extend: {
					...config.theme.extend,
					...theme?.extend
				}
			},
			variants: [...config.variants, ...asArray(variants)],
			rules: [...config.rules, ...asArray(rules)],
			ignorelist: [...config.ignorelist, ...asArray(ignorelist)],
			hash,
			stringify,
			finalize: [...config.finalize, ...asArray(finalize)]
		};
	}
	return config;
}
function warn(message, code, detail) {
	if ("function" == typeof dispatchEvent && "function" == typeof CustomEvent) {
		let event = new CustomEvent("warning", {
			detail: {
				message,
				code,
				detail
			},
			cancelable: true
		});
		dispatchEvent(event);
		event.defaultPrevented || console.warn(`[${code}] ${message}`, { detail });
	} else "object" == typeof process && "function" == typeof process.emitWarning ? process.emitWarning(message, {
		code,
		detail
	}) : console.warn(`[${code}] ${message}`, { detail });
}
function find(value, list, cache, getResolver, context, isDark) {
	for (let item of list) {
		let resolver = cache.get(item);
		resolver || cache.set(item, resolver = getResolver(item));
		let resolved = resolver(value, context, isDark);
		if (resolved) return resolved;
	}
}
function getVariantResolver(variant) {
	var resolve;
	return createResolve(variant[0], "function" == typeof (resolve = variant[1]) ? resolve : () => resolve);
}
function getRuleResolver(rule) {
	var resolve, convert;
	return Array.isArray(rule) ? createResolve(rule[0], fromMatch(rule[1], rule[2])) : createResolve(rule, fromMatch(resolve, convert));
}
function createResolve(patterns, resolve) {
	return createRegExpExecutor(patterns, (value, condition, context, isDark) => {
		let match = condition.exec(value);
		if (match) return match.$$ = value.slice(match[0].length), match.dark = isDark, resolve(match, context);
	});
}
function createRegExpExecutor(patterns, run) {
	let conditions = asArray(patterns).map(toCondition);
	return (value, context, isDark) => {
		for (let condition of conditions) {
			let result = run(value, condition, context, isDark);
			if (result) return result;
		}
	};
}
function toCondition(value) {
	return "string" == typeof value ? RegExp("^" + value + (value.includes("$") || "-" == value.slice(-1) ? "" : "$")) : value;
}
/**
* @group Runtime
* @param config
* @param sheet
*/ function twind(userConfig, sheet) {
	let config = defineConfig(userConfig), context = function({ theme, darkMode, darkColor = noop, variants, rules, hash: hash$1, stringify, ignorelist, finalize }) {
		let variantCache = /* @__PURE__ */ new Map(), variantResolvers = /* @__PURE__ */ new Map(), ruleCache = /* @__PURE__ */ new Map(), ruleResolvers = /* @__PURE__ */ new Map(), ignored = createRegExpExecutor(ignorelist, (value, condition) => condition.test(value)), reportedUnknownClasses = /* @__PURE__ */ new Set();
		variants.push(["dark", Array.isArray(darkMode) || "class" == darkMode ? `${asArray(darkMode)[1] || ".dark"} &` : "string" == typeof darkMode && "media" != darkMode ? darkMode : "@media (prefers-color-scheme:dark)"]);
		let h = "function" == typeof hash$1 ? (value) => hash$1(value, hash) : hash$1 ? hash : identity;
		h !== identity && finalize.push((rule) => ({
			...rule,
			n: rule.n && h(rule.n),
			d: rule.d?.replace(/--(tw(?:-[\w-]+)?)\b/g, (_, property) => "--" + h(property).replace("#", ""))
		}));
		let ctx = {
			theme: function({ extend = {}, ...base }) {
				let resolved = {}, resolveContext = {
					get colors() {
						return theme("colors");
					},
					theme,
					negative() {
						return {};
					},
					breakpoints(screens) {
						let breakpoints = {};
						for (let key in screens) "string" == typeof screens[key] && (breakpoints["screen-" + key] = screens[key]);
						return breakpoints;
					}
				};
				return theme;
				function theme(sectionKey, key, defaultValue, opacityValue) {
					if (sectionKey) {
						({1: sectionKey, 2: opacityValue} = /^(\S+?)(?:\s*\/\s*([^/]+))?$/.exec(sectionKey) || [, sectionKey]);
						if (/[.[]/.test(sectionKey)) {
							let path = [];
							sectionKey.replace(/\[([^\]]+)\]|([^.[]+)/g, (_, $1, $2 = $1) => path.push($2));
							sectionKey = path.shift();
							defaultValue = key;
							key = path.join("-");
						}
						let section = resolved[sectionKey] || Object.assign(Object.assign(resolved[sectionKey] = {}, deref(base, sectionKey)), deref(extend, sectionKey));
						if (null == key) return section;
						key || (key = "DEFAULT");
						let value = section[key] ?? key.split("-").reduce((obj, prop) => obj?.[prop], section) ?? defaultValue;
						return opacityValue ? toColorValue(value, { opacityValue: resolveThemeFunction(opacityValue, theme) }) : value;
					}
					let result = {};
					for (let section1 of [...Object.keys(base), ...Object.keys(extend)]) result[section1] = theme(section1);
					return result;
				}
				function deref(source, section) {
					let value = source[section];
					return ("function" == typeof value && (value = value(resolveContext)), value && /color|fill|stroke/i.test(section)) ? function flattenColorPalette(colors, path = []) {
						let flattend = {};
						for (let key in colors) {
							let value = colors[key], keyPath = [...path, key];
							flattend[keyPath.join("-")] = value;
							if ("DEFAULT" == key) {
								keyPath = path;
								flattend[path.join("-")] = value;
							}
							"object" == typeof value && Object.assign(flattend, flattenColorPalette(value, keyPath));
						}
						return flattend;
					}(value) : value;
				}
			}(theme),
			e: escape,
			h,
			s(property, value) {
				return stringify(property, value, ctx);
			},
			d(section, key, color) {
				return darkColor(section, key, ctx, color);
			},
			v(value) {
				return variantCache.has(value) || variantCache.set(value, find(value, variants, variantResolvers, getVariantResolver, ctx) || "&:" + value), variantCache.get(value);
			},
			r(className, isDark) {
				let key = JSON.stringify([className, isDark]);
				if (!ruleCache.has(key)) {
					ruleCache.set(key, !ignored(className, ctx) && find(className, rules, ruleResolvers, getRuleResolver, ctx, isDark));
					if (null == ruleCache.get(key) && !reportedUnknownClasses.has(className)) {
						reportedUnknownClasses.add(className);
						warn(`Unknown class ${JSON.stringify(className)} found.`, "TWIND_INVALID_CLASS", className);
					}
				}
				return ruleCache.get(key);
			},
			f(rule) {
				return finalize.reduce((rule, p) => p(rule, ctx), rule);
			}
		};
		return ctx;
	}(config), cache = /* @__PURE__ */ new Map(), sortedPrecedences = [], insertedRules = /* @__PURE__ */ new Set();
	sheet.resume((className) => cache.set(className, className), (cssText, rule) => {
		sheet.insert(cssText, sortedPrecedences.length, rule);
		sortedPrecedences.push(rule);
		insertedRules.add(cssText);
	});
	function insert(rule) {
		let finalRule = context.f(rule), cssText = stringify$1(finalRule);
		if (cssText && !insertedRules.has(cssText)) {
			insertedRules.add(cssText);
			let index = sortedInsertionIndex(sortedPrecedences, rule);
			sheet.insert(cssText, index, rule);
			sortedPrecedences.splice(index, 0, rule);
		}
		return finalRule.n;
	}
	return Object.defineProperties(function tw(tokens) {
		if (!cache.size) for (let preflight of asArray(config.preflight)) {
			"function" == typeof preflight && (preflight = preflight(context));
			preflight && ("string" == typeof preflight ? translateWith("", Layer.b, parse(preflight), context, Layer.b, [], false, true) : serialize(preflight, {}, context, Layer.b)).forEach(insert);
		}
		tokens = "" + tokens;
		let className = cache.get(tokens);
		if (!className) {
			let classNames = /* @__PURE__ */ new Set();
			for (let rule of translate(parse(tokens), context)) classNames.add(rule.c).add(insert(rule));
			className = [...classNames].filter(Boolean).join(" ");
			cache.set(tokens, className).set(className, className);
		}
		return className;
	}, Object.getOwnPropertyDescriptors({
		get target() {
			return sheet.target;
		},
		theme: context.theme,
		config,
		snapshot() {
			let restoreSheet = sheet.snapshot(), insertedRules$ = new Set(insertedRules), cache$ = new Map(cache), sortedPrecedences$ = [...sortedPrecedences];
			return () => {
				restoreSheet();
				insertedRules = insertedRules$;
				cache = cache$;
				sortedPrecedences = sortedPrecedences$;
			};
		},
		clear() {
			sheet.clear();
			insertedRules = /* @__PURE__ */ new Set();
			cache = /* @__PURE__ */ new Map();
			sortedPrecedences = [];
		},
		destroy() {
			this.clear();
			sheet.destroy();
		}
	}));
}
/**
* Simplified MutationRecord which allows us to pass an
* ArrayLike (compatible with Array and NodeList) `addedNodes` and
* omit other properties we are not interested in.
*/ function getStyleElement(selector) {
	let style = document.querySelector(selector || "style[data-twind=\"\"]");
	if (!style || "STYLE" != style.tagName) {
		style = document.createElement("style");
		document.head.prepend(style);
	}
	return style.dataset.twind = "claimed", style;
}
/**
* @group Sheets
* @param element
* @returns
*/ function cssom(element) {
	let target = element?.cssRules ? element : (element && "string" != typeof element ? element : getStyleElement(element)).sheet;
	return {
		target,
		snapshot() {
			let rules = Array.from(target.cssRules, (rule) => rule.cssText);
			return () => {
				this.clear();
				rules.forEach(this.insert);
			};
		},
		clear() {
			for (let index = target.cssRules.length; index--;) target.deleteRule(index);
		},
		destroy() {
			target.ownerNode?.remove();
		},
		insert(cssText, index) {
			try {
				target.insertRule(cssText, index);
			} catch (error) {
				target.insertRule(":root{}", index);
				/:-[mwo]/.test(cssText) || warn(error.message, "TWIND_INVALID_CSS", cssText);
			}
		},
		resume: noop
	};
}
/**
* @group Sheets
* @param includeResumeData
* @returns
*/ function virtual(includeResumeData) {
	let target = [];
	return {
		target,
		snapshot() {
			let rules = [...target];
			return () => {
				target.splice(0, target.length, ...rules);
			};
		},
		clear() {
			target.length = 0;
		},
		destroy() {
			this.clear();
		},
		insert(css, index, rule) {
			target.splice(index, 0, includeResumeData ? `/*!${rule.p.toString(36)},${(2 * rule.o).toString(36)}${rule.n ? "," + rule.n : ""}*/${css}` : css);
		},
		resume: noop
	};
}
function assertActive() {
	if (!active) throw Error("No active twind instance found. Make sure to call setup or install before accessing tw.");
}
/**
* A proxy to the currently active Twind instance.
* @group Style Injectors
*/ var tw$2 = /* @__PURE__ */ new Proxy(noop, {
	apply(_target, _thisArg, args) {
		return assertActive(), active(args[0]);
	},
	get(target, property) {
		if (!active && property in target) return target[property];
		assertActive();
		let value = active[property];
		return "function" == typeof value ? function() {
			return assertActive(), value.apply(active, arguments);
		} : value;
	}
});
/**
* Injects styles into the global scope and is useful for applications such as gloabl styles, CSS resets or font faces.
*
* It **does not** return a class name, but adds the styles within the base layer to the stylesheet directly.
*
* @group Style Injectors
*/ var injectGlobal$1 = function(strings, ...interpolations) {
	("function" == typeof this ? this : tw$2)(css({ "@layer base": astish(strings, interpolations) }));
};
/**
* **Note**: The styles will be injected on first use.
*
* @group Style Injectors
*/ var keyframes$1 = /* @__PURE__ */ function bind(thisArg) {
	return new Proxy(function keyframes(strings, ...interpolations) {
		return keyframes$(thisArg, "", strings, interpolations);
	}, { get(target, name) {
		return "bind" === name ? bind : name in target ? target[name] : function namedKeyframes(strings, ...interpolations) {
			return keyframes$(thisArg, name, strings, interpolations);
		};
	} });
}();
function keyframes$(thisArg, name, strings, interpolations) {
	return { toString() {
		let ast = astish(strings, interpolations), keyframeName = escape(name + hash(JSON.stringify([name, ast])));
		return ("function" == typeof thisArg ? thisArg : tw$2)(css({ [`@keyframes ${keyframeName}`]: astish(strings, interpolations) })), keyframeName;
	} };
}
/**
* Combines {@link tw} and {@link cx}.
*
* Using the default `tw` instance:
*
* ```js
* import { tw } from '@twind/core'
* tx`underline ${falsy && 'italic'}`
* tx('underline', falsy && 'italic')
* tx({'underline': true, 'italic': false})
*
* // using a custom twind instance
* import { tw } from './custom/twind'
* import { tw } from './custom/twind'
* tx.bind(tw)
* ```
*
* Using a custom `tw` instance:
*
* ```js
* import { tx as tx$ } from '@twind/core'
* import { tw } from './custom/twind'
*
* export const tx = tx$.bind(tw)
*
* tx`underline ${falsy && 'italic'}`
* tx('underline', falsy && 'italic')
* tx({'underline': true, 'italic': false})
* ```
*
* @group Style Injectors
* @param this {@link Twind} instance to use (default: {@link tw})
* @param strings
* @param interpolations
* @returns the class name
*/ var tx$1 = function(strings, ...interpolations) {
	return ("function" == typeof this ? this : tw$2)(interpolate(strings, interpolations));
};
//#endregion
//#region node_modules/style-vendorizer/dist/esm/bundle.min.mjs
var i = new Map([
	["align-self", "-ms-grid-row-align"],
	["color-adjust", "-webkit-print-color-adjust"],
	["column-gap", "grid-column-gap"],
	["forced-color-adjust", "-ms-high-contrast-adjust"],
	["gap", "grid-gap"],
	["grid-template-columns", "-ms-grid-columns"],
	["grid-template-rows", "-ms-grid-rows"],
	["justify-self", "-ms-grid-column-align"],
	["margin-inline-end", "-webkit-margin-end"],
	["margin-inline-start", "-webkit-margin-start"],
	["mask-border", "-webkit-mask-box-image"],
	["mask-border-outset", "-webkit-mask-box-image-outset"],
	["mask-border-slice", "-webkit-mask-box-image-slice"],
	["mask-border-source", "-webkit-mask-box-image-source"],
	["mask-border-repeat", "-webkit-mask-box-image-repeat"],
	["mask-border-width", "-webkit-mask-box-image-width"],
	["overflow-wrap", "word-wrap"],
	["padding-inline-end", "-webkit-padding-end"],
	["padding-inline-start", "-webkit-padding-start"],
	["print-color-adjust", "color-adjust"],
	["row-gap", "grid-row-gap"],
	["scroll-margin-bottom", "scroll-snap-margin-bottom"],
	["scroll-margin-left", "scroll-snap-margin-left"],
	["scroll-margin-right", "scroll-snap-margin-right"],
	["scroll-margin-top", "scroll-snap-margin-top"],
	["scroll-margin", "scroll-snap-margin"],
	["text-combine-upright", "-ms-text-combine-horizontal"]
]);
function r(r) {
	return i.get(r);
}
function a(i) {
	var r = /^(?:(text-(?:decoration$|e|or|si)|back(?:ground-cl|d|f)|box-d|mask(?:$|-[ispro]|-cl)|pr|hyphena|flex-d)|(tab-|column(?!-s)|text-align-l)|(ap)|u|hy)/i.exec(i);
	return r ? r[1] ? 1 : r[2] ? 2 : r[3] ? 3 : 5 : 0;
}
function t(i, r) {
	var a = /^(?:(pos)|(cli)|(background-i)|(flex(?:$|-b)|(?:max-|min-)?(?:block-s|inl|he|widt))|dis)/i.exec(i);
	return a ? a[1] ? /^sti/i.test(r) ? 1 : 0 : a[2] ? /^pat/i.test(r) ? 1 : 0 : a[3] ? /^image-/i.test(r) ? 1 : 0 : a[4] ? "-" === r[3] ? 2 : 0 : /^(?:inline-)?grid$/i.test(r) ? 4 : 0 : 0;
}
//#endregion
//#region node_modules/@twind/preset-autoprefix/preset-autoprefix.js
var CSSPrefixFlags = [
	["-webkit-", 1],
	["-moz-", 2],
	["-ms-", 4]
];
function presetAutoprefix() {
	return ({ stringify }) => ({ stringify(property, value, context) {
		let cssText = "", propertyAlias = r(property);
		propertyAlias && (cssText += stringify(propertyAlias, value, context) + ";");
		let propertyFlags = a(property), valueFlags = t(property, value);
		for (let prefix of CSSPrefixFlags) {
			propertyFlags & prefix[1] && (cssText += stringify(prefix[0] + property, value, context) + ";");
			valueFlags & prefix[1] && (cssText += stringify(property, prefix[0] + value, context) + ";");
		}
		return cssText + stringify(property, value, context);
	} });
}
//#endregion
//#region node_modules/@twind/preset-tailwind/baseTheme.js
/**
* @module @twind/preset-tailwind/baseTheme
*/ /**
* @experimental
*/ var theme$1 = {
	screens: {
		sm: "640px",
		md: "768px",
		lg: "1024px",
		xl: "1280px",
		"2xl": "1536px"
	},
	columns: {
		auto: "auto",
		"3xs": "16rem",
		"2xs": "18rem",
		xs: "20rem",
		sm: "24rem",
		md: "28rem",
		lg: "32rem",
		xl: "36rem",
		"2xl": "42rem",
		"3xl": "48rem",
		"4xl": "56rem",
		"5xl": "64rem",
		"6xl": "72rem",
		"7xl": "80rem"
	},
	spacing: {
		px: "1px",
		0: "0px",
		.../* @__PURE__ */ linear(4, "rem", 4, .5, .5),
		.../* @__PURE__ */ linear(12, "rem", 4, 5),
		14: "3.5rem",
		.../* @__PURE__ */ linear(64, "rem", 4, 16, 4),
		72: "18rem",
		80: "20rem",
		96: "24rem"
	},
	durations: {
		75: "75ms",
		100: "100ms",
		150: "150ms",
		200: "200ms",
		300: "300ms",
		500: "500ms",
		700: "700ms",
		1e3: "1000ms"
	},
	animation: {
		none: "none",
		spin: "spin 1s linear infinite",
		ping: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
		pulse: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
		bounce: "bounce 1s infinite"
	},
	aspectRatio: {
		auto: "auto",
		square: "1/1",
		video: "16/9"
	},
	backdropBlur: /* @__PURE__ */ alias("blur"),
	backdropBrightness: /* @__PURE__ */ alias("brightness"),
	backdropContrast: /* @__PURE__ */ alias("contrast"),
	backdropGrayscale: /* @__PURE__ */ alias("grayscale"),
	backdropHueRotate: /* @__PURE__ */ alias("hueRotate"),
	backdropInvert: /* @__PURE__ */ alias("invert"),
	backdropOpacity: /* @__PURE__ */ alias("opacity"),
	backdropSaturate: /* @__PURE__ */ alias("saturate"),
	backdropSepia: /* @__PURE__ */ alias("sepia"),
	backgroundColor: /* @__PURE__ */ alias("colors"),
	backgroundImage: { none: "none" },
	backgroundOpacity: /* @__PURE__ */ alias("opacity"),
	backgroundSize: {
		auto: "auto",
		cover: "cover",
		contain: "contain"
	},
	blur: {
		none: "none",
		0: "0",
		sm: "4px",
		DEFAULT: "8px",
		md: "12px",
		lg: "16px",
		xl: "24px",
		"2xl": "40px",
		"3xl": "64px"
	},
	brightness: {
		.../* @__PURE__ */ linear(200, "", 100, 0, 50),
		.../* @__PURE__ */ linear(110, "", 100, 90, 5),
		75: "0.75",
		125: "1.25"
	},
	borderColor: ({ theme }) => ({
		DEFAULT: theme("colors.gray.200", "currentColor"),
		...theme("colors")
	}),
	borderOpacity: /* @__PURE__ */ alias("opacity"),
	borderRadius: {
		none: "0px",
		sm: "0.125rem",
		DEFAULT: "0.25rem",
		md: "0.375rem",
		lg: "0.5rem",
		xl: "0.75rem",
		"2xl": "1rem",
		"3xl": "1.5rem",
		"1/2": "50%",
		full: "9999px"
	},
	borderSpacing: /* @__PURE__ */ alias("spacing"),
	borderWidth: {
		DEFAULT: "1px",
		.../* @__PURE__ */ exponential(8, "px")
	},
	boxShadow: {
		sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
		DEFAULT: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
		md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
		lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
		xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
		"2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
		inner: "inset 0 2px 4px 0 rgba(0,0,0,0.05)",
		none: "0 0 #0000"
	},
	boxShadowColor: alias("colors"),
	caretColor: /* @__PURE__ */ alias("colors"),
	accentColor: ({ theme }) => ({
		auto: "auto",
		...theme("colors")
	}),
	contrast: {
		.../* @__PURE__ */ linear(200, "", 100, 0, 50),
		75: "0.75",
		125: "1.25"
	},
	content: { none: "none" },
	divideColor: /* @__PURE__ */ alias("borderColor"),
	divideOpacity: /* @__PURE__ */ alias("borderOpacity"),
	divideWidth: /* @__PURE__ */ alias("borderWidth"),
	dropShadow: {
		sm: "0 1px 1px rgba(0,0,0,0.05)",
		DEFAULT: ["0 1px 2px rgba(0,0,0,0.1)", "0 1px 1px rgba(0,0,0,0.06)"],
		md: ["0 4px 3px rgba(0,0,0,0.07)", "0 2px 2px rgba(0,0,0,0.06)"],
		lg: ["0 10px 8px rgba(0,0,0,0.04)", "0 4px 3px rgba(0,0,0,0.1)"],
		xl: ["0 20px 13px rgba(0,0,0,0.03)", "0 8px 5px rgba(0,0,0,0.08)"],
		"2xl": "0 25px 25px rgba(0,0,0,0.15)",
		none: "0 0 #0000"
	},
	fill: ({ theme }) => ({
		...theme("colors"),
		none: "none"
	}),
	grayscale: {
		DEFAULT: "100%",
		0: "0"
	},
	hueRotate: {
		0: "0deg",
		15: "15deg",
		30: "30deg",
		60: "60deg",
		90: "90deg",
		180: "180deg"
	},
	invert: {
		DEFAULT: "100%",
		0: "0"
	},
	flex: {
		1: "1 1 0%",
		auto: "1 1 auto",
		initial: "0 1 auto",
		none: "none"
	},
	flexBasis: ({ theme }) => ({
		...theme("spacing"),
		...ratios(2, 6),
		...ratios(12, 12),
		auto: "auto",
		full: "100%"
	}),
	flexGrow: {
		DEFAULT: 1,
		0: 0
	},
	flexShrink: {
		DEFAULT: 1,
		0: 0
	},
	fontFamily: {
		sans: "ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,\"Noto Sans\",sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"".split(","),
		serif: "ui-serif,Georgia,Cambria,\"Times New Roman\",Times,serif".split(","),
		mono: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace".split(",")
	},
	fontSize: {
		xs: ["0.75rem", "1rem"],
		sm: ["0.875rem", "1.25rem"],
		base: ["1rem", "1.5rem"],
		lg: ["1.125rem", "1.75rem"],
		xl: ["1.25rem", "1.75rem"],
		"2xl": ["1.5rem", "2rem"],
		"3xl": ["1.875rem", "2.25rem"],
		"4xl": ["2.25rem", "2.5rem"],
		"5xl": ["3rem", "1"],
		"6xl": ["3.75rem", "1"],
		"7xl": ["4.5rem", "1"],
		"8xl": ["6rem", "1"],
		"9xl": ["8rem", "1"]
	},
	fontWeight: {
		thin: "100",
		extralight: "200",
		light: "300",
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
		extrabold: "800",
		black: "900"
	},
	gap: /* @__PURE__ */ alias("spacing"),
	gradientColorStops: /* @__PURE__ */ alias("colors"),
	gridAutoColumns: {
		auto: "auto",
		min: "min-content",
		max: "max-content",
		fr: "minmax(0,1fr)"
	},
	gridAutoRows: {
		auto: "auto",
		min: "min-content",
		max: "max-content",
		fr: "minmax(0,1fr)"
	},
	gridColumn: {
		auto: "auto",
		"span-full": "1 / -1"
	},
	gridRow: {
		auto: "auto",
		"span-full": "1 / -1"
	},
	gridTemplateColumns: { none: "none" },
	gridTemplateRows: { none: "none" },
	height: ({ theme }) => ({
		...theme("spacing"),
		...ratios(2, 6),
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
		auto: "auto",
		full: "100%",
		screen: "100vh"
	}),
	inset: ({ theme }) => ({
		...theme("spacing"),
		...ratios(2, 4),
		auto: "auto",
		full: "100%"
	}),
	keyframes: {
		spin: {
			from: { transform: "rotate(0deg)" },
			to: { transform: "rotate(360deg)" }
		},
		ping: {
			"0%": {
				transform: "scale(1)",
				opacity: "1"
			},
			"75%,100%": {
				transform: "scale(2)",
				opacity: "0"
			}
		},
		pulse: {
			"0%,100%": { opacity: "1" },
			"50%": { opacity: ".5" }
		},
		bounce: {
			"0%, 100%": {
				transform: "translateY(-25%)",
				animationTimingFunction: "cubic-bezier(0.8,0,1,1)"
			},
			"50%": {
				transform: "none",
				animationTimingFunction: "cubic-bezier(0,0,0.2,1)"
			}
		}
	},
	letterSpacing: {
		tighter: "-0.05em",
		tight: "-0.025em",
		normal: "0em",
		wide: "0.025em",
		wider: "0.05em",
		widest: "0.1em"
	},
	lineHeight: {
		.../* @__PURE__ */ linear(10, "rem", 4, 3),
		none: "1",
		tight: "1.25",
		snug: "1.375",
		normal: "1.5",
		relaxed: "1.625",
		loose: "2"
	},
	margin: ({ theme }) => ({
		auto: "auto",
		...theme("spacing")
	}),
	maxHeight: ({ theme }) => ({
		full: "100%",
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
		screen: "100vh",
		...theme("spacing")
	}),
	maxWidth: ({ theme, breakpoints }) => ({
		...breakpoints(theme("screens")),
		none: "none",
		0: "0rem",
		xs: "20rem",
		sm: "24rem",
		md: "28rem",
		lg: "32rem",
		xl: "36rem",
		"2xl": "42rem",
		"3xl": "48rem",
		"4xl": "56rem",
		"5xl": "64rem",
		"6xl": "72rem",
		"7xl": "80rem",
		full: "100%",
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
		prose: "65ch"
	}),
	minHeight: {
		0: "0px",
		full: "100%",
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
		screen: "100vh"
	},
	minWidth: {
		0: "0px",
		full: "100%",
		min: "min-content",
		max: "max-content",
		fit: "fit-content"
	},
	opacity: {
		.../* @__PURE__ */ linear(100, "", 100, 0, 10),
		5: "0.05",
		25: "0.25",
		75: "0.75",
		95: "0.95"
	},
	order: {
		first: "-9999",
		last: "9999",
		none: "0"
	},
	padding: /* @__PURE__ */ alias("spacing"),
	placeholderColor: /* @__PURE__ */ alias("colors"),
	placeholderOpacity: /* @__PURE__ */ alias("opacity"),
	outlineColor: /* @__PURE__ */ alias("colors"),
	outlineOffset: /* @__PURE__ */ exponential(8, "px"),
	outlineWidth: /* @__PURE__ */ exponential(8, "px"),
	ringColor: ({ theme }) => ({
		...theme("colors"),
		DEFAULT: "#3b82f6"
	}),
	ringOffsetColor: /* @__PURE__ */ alias("colors"),
	ringOffsetWidth: /* @__PURE__ */ exponential(8, "px"),
	ringOpacity: ({ theme }) => ({
		...theme("opacity"),
		DEFAULT: "0.5"
	}),
	ringWidth: {
		DEFAULT: "3px",
		.../* @__PURE__ */ exponential(8, "px")
	},
	rotate: {
		.../* @__PURE__ */ exponential(2, "deg"),
		.../* @__PURE__ */ exponential(12, "deg", 3),
		.../* @__PURE__ */ exponential(180, "deg", 45)
	},
	saturate: /* @__PURE__ */ linear(200, "", 100, 0, 50),
	scale: {
		.../* @__PURE__ */ linear(150, "", 100, 0, 50),
		.../* @__PURE__ */ linear(110, "", 100, 90, 5),
		75: "0.75",
		125: "1.25"
	},
	scrollMargin: /* @__PURE__ */ alias("spacing"),
	scrollPadding: /* @__PURE__ */ alias("spacing"),
	sepia: {
		0: "0",
		DEFAULT: "100%"
	},
	skew: {
		.../* @__PURE__ */ exponential(2, "deg"),
		.../* @__PURE__ */ exponential(12, "deg", 3)
	},
	space: /* @__PURE__ */ alias("spacing"),
	stroke: ({ theme }) => ({
		...theme("colors"),
		none: "none"
	}),
	strokeWidth: /* @__PURE__ */ linear(2),
	textColor: /* @__PURE__ */ alias("colors"),
	textDecorationColor: /* @__PURE__ */ alias("colors"),
	textDecorationThickness: {
		"from-font": "from-font",
		auto: "auto",
		.../* @__PURE__ */ exponential(8, "px")
	},
	textUnderlineOffset: {
		auto: "auto",
		.../* @__PURE__ */ exponential(8, "px")
	},
	textIndent: /* @__PURE__ */ alias("spacing"),
	textOpacity: /* @__PURE__ */ alias("opacity"),
	transitionDuration: ({ theme }) => ({
		...theme("durations"),
		DEFAULT: "150ms"
	}),
	transitionDelay: /* @__PURE__ */ alias("durations"),
	transitionProperty: {
		none: "none",
		all: "all",
		DEFAULT: "color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter",
		colors: "color,background-color,border-color,text-decoration-color,fill,stroke",
		opacity: "opacity",
		shadow: "box-shadow",
		transform: "transform"
	},
	transitionTimingFunction: {
		DEFAULT: "cubic-bezier(0.4,0,0.2,1)",
		linear: "linear",
		in: "cubic-bezier(0.4,0,1,1)",
		out: "cubic-bezier(0,0,0.2,1)",
		"in-out": "cubic-bezier(0.4,0,0.2,1)"
	},
	translate: ({ theme }) => ({
		...theme("spacing"),
		...ratios(2, 4),
		full: "100%"
	}),
	width: ({ theme }) => ({
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
		screen: "100vw",
		...theme("flexBasis")
	}),
	willChange: { scroll: "scroll-position" },
	zIndex: {
		.../* @__PURE__ */ linear(50, "", 1, 0, 10),
		auto: "auto"
	}
};
function ratios(start, end) {
	let result = {};
	do
		for (var dividend = 1; dividend < start; dividend++) result[`${dividend}/${start}`] = Number((dividend / start * 100).toFixed(6)) + "%";
	while (++start <= end);
	return result;
}
function exponential(stop, unit, start = 0) {
	let result = {};
	for (; start <= stop; start = 2 * start || 1) result[start] = start + unit;
	return result;
}
function linear(stop, unit = "", divideBy = 1, start = 0, step = 1, result = {}) {
	for (; start <= stop; start += step) result[start] = start / divideBy + unit;
	return result;
}
function alias(section) {
	return ({ theme }) => theme(section);
}
//#endregion
//#region node_modules/@twind/preset-tailwind/preflight.dev.js
var preflight = {
	"*,::before,::after": {
		boxSizing: "border-box",
		borderWidth: "0",
		borderStyle: "solid",
		borderColor: "theme(borderColor.DEFAULT, currentColor)"
	},
	"::before,::after": { "--tw-content": "''" },
	html: {
		lineHeight: 1.5,
		WebkitTextSizeAdjust: "100%",
		MozTabSize: "4",
		tabSize: 4,
		fontFamily: `theme(fontFamily.sans, ${theme$1.fontFamily.sans})`,
		fontFeatureSettings: "theme(fontFamily.sans[1].fontFeatureSettings, normal)"
	},
	body: {
		margin: "0",
		lineHeight: "inherit"
	},
	hr: {
		height: "0",
		color: "inherit",
		borderTopWidth: "1px"
	},
	"abbr:where([title])": { textDecoration: "underline dotted" },
	"h1,h2,h3,h4,h5,h6": {
		fontSize: "inherit",
		fontWeight: "inherit"
	},
	a: {
		color: "inherit",
		textDecoration: "inherit"
	},
	"b,strong": { fontWeight: "bolder" },
	"code,kbd,samp,pre": {
		fontFamily: `theme(fontFamily.mono, ${theme$1.fontFamily.mono})`,
		fontFeatureSettings: "theme(fontFamily.mono[1].fontFeatureSettings, normal)",
		fontSize: "1em"
	},
	small: { fontSize: "80%" },
	"sub,sup": {
		fontSize: "75%",
		lineHeight: 0,
		position: "relative",
		verticalAlign: "baseline"
	},
	sub: { bottom: "-0.25em" },
	sup: { top: "-0.5em" },
	table: {
		textIndent: "0",
		borderColor: "inherit",
		borderCollapse: "collapse"
	},
	"button,input,optgroup,select,textarea": {
		fontFamily: "inherit",
		fontSize: "100%",
		lineHeight: "inherit",
		color: "inherit",
		margin: "0",
		padding: "0"
	},
	"button,select": { textTransform: "none" },
	"button,[type='button'],[type='reset'],[type='submit']": {
		WebkitAppearance: "button",
		backgroundColor: "transparent",
		backgroundImage: "none"
	},
	":-moz-focusring": { outline: "auto" },
	":-moz-ui-invalid": { boxShadow: "none" },
	progress: { verticalAlign: "baseline" },
	"::-webkit-inner-spin-button,::-webkit-outer-spin-button": { height: "auto" },
	"[type='search']": {
		WebkitAppearance: "textfield",
		outlineOffset: "-2px"
	},
	"::-webkit-search-decoration": { WebkitAppearance: "none" },
	"::-webkit-file-upload-button": {
		WebkitAppearance: "button",
		font: "inherit"
	},
	summary: { display: "list-item" },
	"blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre": { margin: "0" },
	fieldset: {
		margin: "0",
		padding: "0"
	},
	legend: { padding: "0" },
	"ol,ul,menu": {
		listStyle: "none",
		margin: "0",
		padding: "0"
	},
	textarea: { resize: "vertical" },
	"input::placeholder,textarea::placeholder": {
		opacity: 1,
		color: "theme(colors.gray.400, #9ca3af)"
	},
	"button,[role=\"button\"]": { cursor: "pointer" },
	":disabled": { cursor: "default" },
	"img,svg,video,canvas,audio,iframe,embed,object": {
		display: "block",
		verticalAlign: "middle"
	},
	"img,video": {
		maxWidth: "100%",
		height: "auto"
	},
	"[hidden]": { display: "none" }
};
//#endregion
//#region node_modules/@twind/preset-tailwind/rules.dev.js
var rule, rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9, rule10, rule11, rule12, rule13, rule14, rule15, rule16, rule17;
var rules = [
	match("\\[([-\\w]+):(.+)]", ({ 1: $1, 2: $2 }, context) => ({ "@layer overrides": { "&": { [$1]: arbitrary(`[${$2}]`, "", context) } } })),
	(rule = match("(group|peer)([~/][^-[]+)?", ({ input }, { h }) => [{ c: h(input) }]), withAutocomplete(rule, () => ["group", "peer"])),
	matchTheme("aspect-", "aspectRatio"),
	match("container", (_, { theme }) => {
		let { screens = theme("screens"), center, padding } = theme("container"), rules = {
			width: "100%",
			marginRight: center && "auto",
			marginLeft: center && "auto",
			...paddingFor("xs")
		};
		for (let screen in screens) {
			let value = screens[screen];
			"string" == typeof value && (rules[mql(value)] = { "&": {
				maxWidth: value,
				...paddingFor(screen)
			} });
		}
		return rules;
		function paddingFor(screen) {
			let value = padding && ("string" == typeof padding ? padding : padding[screen] || padding.DEFAULT);
			if (value) return {
				paddingRight: value,
				paddingLeft: value
			};
		}
	}),
	matchTheme("content-", "content", ({ _ }) => ({
		"--tw-content": _,
		content: "var(--tw-content)"
	})),
	match("(?:box-)?decoration-(slice|clone)", "boxDecorationBreak"),
	match("box-(border|content)", "boxSizing", ({ 1: $1 }) => $1 + "-box"),
	match("hidden", { display: "none" }),
	match("table-(auto|fixed)", "tableLayout"),
	match([
		"(block|flex|table|grid|inline|contents|flow-root|list-item)",
		"(inline-(block|flex|table|grid))",
		"(table-(caption|cell|column|row|(column|row|footer|header)-group))"
	], "display"),
	"(float)-(left|right|none)",
	"(clear)-(left|right|none|both)",
	"(overflow(?:-[xy])?)-(auto|hidden|clip|visible|scroll)",
	"(isolation)-(auto)",
	match("isolate", "isolation"),
	match("object-(contain|cover|fill|none|scale-down)", "objectFit"),
	matchTheme("object-", "objectPosition"),
	match("object-(top|bottom|center|(left|right)(-(top|bottom))?)", "objectPosition", spacify),
	match("overscroll(-[xy])?-(auto|contain|none)", ({ 1: $1 = "", 2: $2 }) => ({ ["overscroll-behavior" + $1]: $2 })),
	match("(static|fixed|absolute|relative|sticky)", "position"),
	matchTheme("-?inset(-[xy])?(?:$|-)", "inset", ({ 1: $1, _ }) => ({
		top: "-x" != $1 && _,
		right: "-y" != $1 && _,
		bottom: "-x" != $1 && _,
		left: "-y" != $1 && _
	})),
	matchTheme("-?(top|bottom|left|right)(?:$|-)", "inset"),
	match("(visible|collapse)", "visibility"),
	match("invisible", { visibility: "hidden" }),
	matchTheme("-?z-", "zIndex"),
	match("flex-((row|col)(-reverse)?)", "flexDirection", columnify),
	match("flex-(wrap|wrap-reverse|nowrap)", "flexWrap"),
	matchTheme("(flex-(?:grow|shrink))(?:$|-)"),
	matchTheme("(flex)-"),
	matchTheme("grow(?:$|-)", "flexGrow"),
	matchTheme("shrink(?:$|-)", "flexShrink"),
	matchTheme("basis-", "flexBasis"),
	matchTheme("-?(order)-"),
	withAutocomplete("-?(order)-(\\d+)", () => range({ end: 12 })),
	matchTheme("grid-cols-", "gridTemplateColumns"),
	(rule1 = match("grid-cols-(\\d+)", "gridTemplateColumns", gridTemplate), withAutocomplete(rule1, () => range({ end: 6 }))),
	matchTheme("col-", "gridColumn"),
	(rule2 = match("col-(span)-(\\d+)", "gridColumn", span), withAutocomplete(rule2, () => range({ end: 12 }))),
	matchTheme("col-start-", "gridColumnStart"),
	(rule3 = match("col-start-(auto|\\d+)", "gridColumnStart"), withAutocomplete(rule3, ({ 1: $1 }) => "auto" === $1 ? [""] : range({ end: 13 }))),
	matchTheme("col-end-", "gridColumnEnd"),
	(rule4 = match("col-end-(auto|\\d+)", "gridColumnEnd"), withAutocomplete(rule4, ({ 1: $1 }) => "auto" === $1 ? [""] : range({ end: 13 }))),
	matchTheme("grid-rows-", "gridTemplateRows"),
	(rule5 = match("grid-rows-(\\d+)", "gridTemplateRows", gridTemplate), withAutocomplete(rule5, () => range({ end: 6 }))),
	matchTheme("row-", "gridRow"),
	(rule6 = match("row-(span)-(\\d+)", "gridRow", span), withAutocomplete(rule6, () => range({ end: 6 }))),
	matchTheme("row-start-", "gridRowStart"),
	(rule7 = match("row-start-(auto|\\d+)", "gridRowStart"), withAutocomplete(rule7, ({ 1: $1 }) => "auto" === $1 ? [""] : range({ end: 7 }))),
	matchTheme("row-end-", "gridRowEnd"),
	(rule8 = match("row-end-(auto|\\d+)", "gridRowEnd"), withAutocomplete(rule8, ({ 1: $1 }) => "auto" === $1 ? [""] : range({ end: 7 }))),
	match("grid-flow-((row|col)(-dense)?)", "gridAutoFlow", (match) => spacify(columnify(match))),
	match("grid-flow-(dense)", "gridAutoFlow"),
	matchTheme("auto-cols-", "gridAutoColumns"),
	matchTheme("auto-rows-", "gridAutoRows"),
	matchTheme("gap-x(?:$|-)", "gap", "columnGap"),
	matchTheme("gap-y(?:$|-)", "gap", "rowGap"),
	matchTheme("gap(?:$|-)", "gap"),
	withAutocomplete("(justify-(?:items|self))-", ({ 1: $1 }) => $1.endsWith("-items-") ? [
		"start",
		"end",
		"center",
		"stretch"
	] : [
		"auto",
		"start",
		"end",
		"center",
		"stretch"
	]),
	(rule9 = match("justify-", "justifyContent", convertContentValue), withAutocomplete(rule9, () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly"
	])),
	(rule10 = match("(content|items|self)-", (match) => ({ ["align-" + match[1]]: convertContentValue(match) })), withAutocomplete(rule10, ({ 1: $1 }) => "content" == $1 ? [
		"center",
		"start",
		"end",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline"
	] : "items" == $1 ? [
		"start",
		"end",
		"center",
		"stretch",
		"baseline"
	] : [
		"auto",
		"start",
		"end",
		"center",
		"stretch",
		"baseline"
	])),
	(rule11 = match("(place-(content|items|self))-", ({ 1: $1, $$ }) => ({ [$1]: ("wun".includes($$[3]) ? "space-" : "") + $$ })), withAutocomplete(rule11, ({ 2: $2 }) => "content" == $2 ? [
		"center",
		"start",
		"end",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline"
	] : "items" == $2 ? [
		"start",
		"end",
		"center",
		"stretch",
		"baseline"
	] : [
		"auto",
		"start",
		"end",
		"center",
		"stretch",
		"baseline"
	])),
	matchTheme("p([xytrbl])?(?:$|-)", "padding", edge("padding")),
	matchTheme("-?m([xytrbl])?(?:$|-)", "margin", edge("margin")),
	matchTheme("-?space-(x|y)(?:$|-)", "space", ({ 1: $1, _ }) => ({ "&>:not([hidden])~:not([hidden])": {
		[`--tw-space-${$1}-reverse`]: "0",
		["margin-" + {
			y: "top",
			x: "left"
		}[$1]]: `calc(${_} * calc(1 - var(--tw-space-${$1}-reverse)))`,
		["margin-" + {
			y: "bottom",
			x: "right"
		}[$1]]: `calc(${_} * var(--tw-space-${$1}-reverse))`
	} })),
	match("space-(x|y)-reverse", ({ 1: $1 }) => ({ "&>:not([hidden])~:not([hidden])": { [`--tw-space-${$1}-reverse`]: "1" } })),
	matchTheme("w-", "width"),
	matchTheme("min-w-", "minWidth"),
	matchTheme("max-w-", "maxWidth"),
	matchTheme("h-", "height"),
	matchTheme("min-h-", "minHeight"),
	matchTheme("max-h-", "maxHeight"),
	matchTheme("font-", "fontWeight"),
	matchTheme("font-", "fontFamily", ({ _ }) => {
		return "string" == typeof (_ = asArray(_))[1] ? { fontFamily: join(_) } : {
			fontFamily: join(_[0]),
			..._[1]
		};
	}),
	match("antialiased", {
		WebkitFontSmoothing: "antialiased",
		MozOsxFontSmoothing: "grayscale"
	}),
	match("subpixel-antialiased", {
		WebkitFontSmoothing: "auto",
		MozOsxFontSmoothing: "auto"
	}),
	match("italic", "fontStyle"),
	match("not-italic", { fontStyle: "normal" }),
	match("(ordinal|slashed-zero|(normal|lining|oldstyle|proportional|tabular)-nums|(diagonal|stacked)-fractions)", ({ 1: $1, 2: $2 = "", 3: $3 }) => "normal" == $2 ? { fontVariantNumeric: "normal" } : {
		["--tw-" + ($3 ? "numeric-fraction" : "pt".includes($2[0]) ? "numeric-spacing" : $2 ? "numeric-figure" : $1)]: $1,
		fontVariantNumeric: "var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)",
		...asDefaults({
			"--tw-ordinal": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-slashed-zero": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-numeric-figure": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-numeric-spacing": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-numeric-fraction": "var(--tw-empty,/*!*/ /*!*/)"
		})
	}),
	matchTheme("tracking-", "letterSpacing"),
	matchTheme("leading-", "lineHeight"),
	match("list-(inside|outside)", "listStylePosition"),
	matchTheme("list-", "listStyleType"),
	(rule12 = match("list-", "listStyleType"), withAutocomplete(rule12, () => [
		"none",
		"disc",
		"decimal"
	])),
	matchTheme("placeholder-opacity-", "placeholderOpacity", ({ _ }) => ({ "&::placeholder": { "--tw-placeholder-opacity": _ } })),
	matchColor("placeholder-", {
		property: "color",
		selector: "&::placeholder"
	}),
	match("text-(left|center|right|justify|start|end)", "textAlign"),
	match("text-(ellipsis|clip)", "textOverflow"),
	matchTheme("text-opacity-", "textOpacity", "--tw-text-opacity"),
	matchColor("text-", { property: "color" }),
	matchTheme("text-", "fontSize", ({ _ }) => "string" == typeof _ ? { fontSize: _ } : {
		fontSize: _[0],
		..."string" == typeof _[1] ? { lineHeight: _[1] } : _[1]
	}),
	matchTheme("indent-", "textIndent"),
	match("(overline|underline|line-through)", "textDecorationLine"),
	match("no-underline", { textDecorationLine: "none" }),
	matchTheme("underline-offset-", "textUnderlineOffset"),
	matchColor("decoration-", {
		section: "textDecorationColor",
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	matchTheme("decoration-", "textDecorationThickness"),
	(rule13 = match("decoration-", "textDecorationStyle"), withAutocomplete(rule13, () => [
		"solid",
		"double",
		"dotted",
		"dashed",
		"wavy"
	])),
	match("(uppercase|lowercase|capitalize)", "textTransform"),
	match("normal-case", { textTransform: "none" }),
	match("truncate", {
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	}),
	(rule14 = match("align-", "verticalAlign"), withAutocomplete(rule14, () => [
		"baseline",
		"top",
		"middle",
		"bottom",
		"text-top",
		"text-bottom",
		"sub",
		"super"
	])),
	(rule15 = match("whitespace-", "whiteSpace"), withAutocomplete(rule15, () => [
		"normal",
		"nowrap",
		"pre",
		"pre-line",
		"pre-wrap"
	])),
	match("break-normal", {
		wordBreak: "normal",
		overflowWrap: "normal"
	}),
	match("break-words", { overflowWrap: "break-word" }),
	match("break-all", { wordBreak: "break-all" }),
	match("break-keep", { wordBreak: "keep-all" }),
	matchColor("caret-", {
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	matchColor("accent-", {
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	match("bg-gradient-to-([trbl]|[tb][rl])", "backgroundImage", ({ 1: $1 }) => `linear-gradient(to ${position($1, " ")},var(--tw-gradient-stops))`),
	matchColor("from-", {
		section: "gradientColorStops",
		opacityVariable: false,
		opacitySection: "opacity"
	}, ({ _ }) => ({
		"--tw-gradient-from": _.value,
		"--tw-gradient-to": _.color({ opacityValue: "0" }),
		"--tw-gradient-stops": "var(--tw-gradient-from),var(--tw-gradient-to)"
	})),
	matchColor("via-", {
		section: "gradientColorStops",
		opacityVariable: false,
		opacitySection: "opacity"
	}, ({ _ }) => ({
		"--tw-gradient-to": _.color({ opacityValue: "0" }),
		"--tw-gradient-stops": `var(--tw-gradient-from),${_.value},var(--tw-gradient-to)`
	})),
	matchColor("to-", {
		section: "gradientColorStops",
		property: "--tw-gradient-to",
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	match("bg-(fixed|local|scroll)", "backgroundAttachment"),
	match("bg-origin-(border|padding|content)", "backgroundOrigin", ({ 1: $1 }) => $1 + "-box"),
	match(["bg-(no-repeat|repeat(-[xy])?)", "bg-repeat-(round|space)"], "backgroundRepeat"),
	(rule16 = match("bg-blend-", "backgroundBlendMode"), withAutocomplete(rule16, () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	])),
	match("bg-clip-(border|padding|content|text)", "backgroundClip", ({ 1: $1 }) => $1 + ("text" == $1 ? "" : "-box")),
	matchTheme("bg-opacity-", "backgroundOpacity", "--tw-bg-opacity"),
	matchColor("bg-", { section: "backgroundColor" }),
	matchTheme("bg-", "backgroundImage"),
	matchTheme("bg-", "backgroundPosition"),
	match("bg-(top|bottom|center|(left|right)(-(top|bottom))?)", "backgroundPosition", spacify),
	matchTheme("bg-", "backgroundSize"),
	matchTheme("rounded(?:$|-)", "borderRadius"),
	matchTheme("rounded-([trbl]|[tb][rl])(?:$|-)", "borderRadius", ({ 1: $1, _ }) => {
		let corners = {
			t: ["tl", "tr"],
			r: ["tr", "br"],
			b: ["bl", "br"],
			l: ["bl", "tl"]
		}[$1] || [$1, $1];
		return {
			[`border-${position(corners[0])}-radius`]: _,
			[`border-${position(corners[1])}-radius`]: _
		};
	}),
	match("border-(collapse|separate)", "borderCollapse"),
	matchTheme("border-opacity(?:$|-)", "borderOpacity", "--tw-border-opacity"),
	match("border-(solid|dashed|dotted|double|none)", "borderStyle"),
	matchTheme("border-spacing(-[xy])?(?:$|-)", "borderSpacing", ({ 1: $1, _ }) => ({
		...asDefaults({
			"--tw-border-spacing-x": "0",
			"--tw-border-spacing-y": "0"
		}),
		["--tw-border-spacing" + ($1 || "-x")]: _,
		["--tw-border-spacing" + ($1 || "-y")]: _,
		"border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)"
	})),
	matchColor("border-([xytrbl])-", { section: "borderColor" }, edge("border", "Color")),
	matchColor("border-"),
	matchTheme("border-([xytrbl])(?:$|-)", "borderWidth", edge("border", "Width")),
	matchTheme("border(?:$|-)", "borderWidth"),
	matchTheme("divide-opacity(?:$|-)", "divideOpacity", ({ _ }) => ({ "&>:not([hidden])~:not([hidden])": { "--tw-divide-opacity": _ } })),
	match("divide-(solid|dashed|dotted|double|none)", ({ 1: $1 }) => ({ "&>:not([hidden])~:not([hidden])": { borderStyle: $1 } })),
	match("divide-([xy]-reverse)", ({ 1: $1 }) => ({ "&>:not([hidden])~:not([hidden])": { ["--tw-divide-" + $1]: "1" } })),
	matchTheme("divide-([xy])(?:$|-)", "divideWidth", ({ 1: $1, _ }) => {
		let edges = {
			x: "lr",
			y: "tb"
		}[$1];
		return { "&>:not([hidden])~:not([hidden])": {
			[`--tw-divide-${$1}-reverse`]: "0",
			[`border-${position(edges[0])}Width`]: `calc(${_} * calc(1 - var(--tw-divide-${$1}-reverse)))`,
			[`border-${position(edges[1])}Width`]: `calc(${_} * var(--tw-divide-${$1}-reverse))`
		} };
	}),
	matchColor("divide-", {
		property: "borderColor",
		selector: "&>:not([hidden])~:not([hidden])"
	}),
	matchTheme("ring-opacity(?:$|-)", "ringOpacity", "--tw-ring-opacity"),
	matchColor("ring-offset-", {
		property: "--tw-ring-offset-color",
		opacityVariable: false
	}),
	matchTheme("ring-offset(?:$|-)", "ringOffsetWidth", "--tw-ring-offset-width"),
	match("ring-inset", { "--tw-ring-inset": "inset" }),
	matchColor("ring-", { property: "--tw-ring-color" }),
	matchTheme("ring(?:$|-)", "ringWidth", ({ _ }, { theme }) => ({
		...asDefaults({
			"--tw-ring-offset-shadow": "0 0 #0000",
			"--tw-ring-shadow": "0 0 #0000",
			"--tw-shadow": "0 0 #0000",
			"--tw-shadow-colored": "0 0 #0000",
			"&": {
				"--tw-ring-inset": "var(--tw-empty,/*!*/ /*!*/)",
				"--tw-ring-offset-width": theme("ringOffsetWidth", "", "0px"),
				"--tw-ring-offset-color": toColorValue(theme("ringOffsetColor", "", "#fff")),
				"--tw-ring-color": toColorValue(theme("ringColor", "", "#93c5fd"), { opacityVariable: "--tw-ring-opacity" }),
				"--tw-ring-opacity": theme("ringOpacity", "", "0.5")
			}
		}),
		"--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
		"--tw-ring-shadow": `var(--tw-ring-inset) 0 0 0 calc(${_} + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
		boxShadow: "var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)"
	})),
	matchColor("shadow-", {
		section: "boxShadowColor",
		opacityVariable: false,
		opacitySection: "opacity"
	}, ({ _ }) => ({
		"--tw-shadow-color": _.value,
		"--tw-shadow": "var(--tw-shadow-colored)"
	})),
	matchTheme("shadow(?:$|-)", "boxShadow", ({ _ }) => ({
		...asDefaults({
			"--tw-ring-offset-shadow": "0 0 #0000",
			"--tw-ring-shadow": "0 0 #0000",
			"--tw-shadow": "0 0 #0000",
			"--tw-shadow-colored": "0 0 #0000"
		}),
		"--tw-shadow": join(_),
		"--tw-shadow-colored": join(_).replace(/([^,]\s+)(?:#[a-f\d]+|(?:(?:hsl|rgb)a?|hwb|lab|lch|color|var)\(.+?\)|[a-z]+)(,|$)/g, "$1var(--tw-shadow-color)$2"),
		boxShadow: "var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)"
	})),
	matchTheme("(opacity)-"),
	(rule17 = match("mix-blend-", "mixBlendMode"), withAutocomplete(rule17, () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	])),
	...filter(),
	...filter("backdrop-"),
	matchTheme("transition(?:$|-)", "transitionProperty", (match, { theme }) => ({
		transitionProperty: join(match),
		transitionTimingFunction: "none" == match._ ? void 0 : join(theme("transitionTimingFunction", "")),
		transitionDuration: "none" == match._ ? void 0 : join(theme("transitionDuration", ""))
	})),
	matchTheme("duration(?:$|-)", "transitionDuration", "transitionDuration", join),
	matchTheme("ease(?:$|-)", "transitionTimingFunction", "transitionTimingFunction", join),
	matchTheme("delay(?:$|-)", "transitionDelay", "transitionDelay", join),
	matchTheme("animate(?:$|-)", "animation", (match, { theme, h, e }) => {
		let animation = join(match), parts = animation.split(" "), keyframeValues = theme("keyframes", parts[0]);
		return keyframeValues ? {
			["@keyframes " + (parts[0] = e(h(parts[0])))]: keyframeValues,
			animation: parts.join(" ")
		} : { animation };
	}),
	"(transform)-(none)",
	match("transform", tranformDefaults),
	match("transform-(cpu|gpu)", ({ 1: $1 }) => ({ "--tw-transform": transformValue("gpu" == $1) })),
	matchTheme("scale(-[xy])?-", "scale", ({ 1: $1, _ }) => ({
		["--tw-scale" + ($1 || "-x")]: _,
		["--tw-scale" + ($1 || "-y")]: _,
		...tranformDefaults()
	})),
	matchTheme("-?(rotate)-", "rotate", transform),
	matchTheme("-?(translate-[xy])-", "translate", transform),
	matchTheme("-?(skew-[xy])-", "skew", transform),
	match("origin-(center|((top|bottom)(-(left|right))?)|left|right)", "transformOrigin", spacify),
	withAutocomplete("(appearance)-", () => ["auto", "none"]),
	matchTheme("(columns)-"),
	withAutocomplete("(columns)-(\\d+)", () => range({ end: 12 })),
	withAutocomplete("(break-(?:before|after|inside))-", ({ 1: $1 }) => $1.endsWith("-inside-") ? [
		"auto",
		"avoid",
		"avoid-page",
		"avoid-column"
	] : [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	]),
	matchTheme("(cursor)-"),
	withAutocomplete("(cursor)-", () => [
		"alias",
		"all-scroll",
		"auto",
		"cell",
		"col-resize",
		"context-menu",
		"copy",
		"crosshair",
		"default",
		"e-resize",
		"ew-resize",
		"grab",
		"grabbing",
		"help",
		"move",
		"n-resize",
		"ne-resize",
		"nesw-resize",
		"no-drop",
		"none",
		"not-allowed",
		"ns-resize",
		"nw-resize",
		"nwse-resize",
		"pointer",
		"progress",
		"row-resize",
		"s-resize",
		"se-resize",
		"sw-resize",
		"text",
		"vertical-text",
		"w-resize",
		"wait",
		"zoom-in",
		"zoom-out"
	]),
	match("snap-(none)", "scroll-snap-type"),
	match("snap-(x|y|both)", ({ 1: $1 }) => ({
		...asDefaults({ "--tw-scroll-snap-strictness": "proximity" }),
		"scroll-snap-type": $1 + " var(--tw-scroll-snap-strictness)"
	})),
	match("snap-(mandatory|proximity)", "--tw-scroll-snap-strictness"),
	match("snap-(?:(start|end|center)|align-(none))", "scroll-snap-align"),
	match("snap-(normal|always)", "scroll-snap-stop"),
	match("scroll-(auto|smooth)", "scroll-behavior"),
	matchTheme("scroll-p([xytrbl])?(?:$|-)", "padding", edge("scroll-padding")),
	matchTheme("-?scroll-m([xytrbl])?(?:$|-)", "scroll-margin", edge("scroll-margin")),
	match("touch-(auto|none|manipulation)", "touch-action"),
	match("touch-(pinch-zoom|pan-(?:(x|left|right)|(y|up|down)))", ({ 1: $1, 2: $2, 3: $3 }) => ({
		...asDefaults({
			"--tw-pan-x": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-pan-y": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-pinch-zoom": "var(--tw-empty,/*!*/ /*!*/)",
			"--tw-touch-action": "var(--tw-pan-x) var(--tw-pan-y) var(--tw-pinch-zoom)"
		}),
		[`--tw-${$2 ? "pan-x" : $3 ? "pan-y" : $1}`]: $1,
		"touch-action": "var(--tw-touch-action)"
	})),
	match("outline-none", {
		outline: "2px solid transparent",
		"outline-offset": "2px"
	}),
	match("outline", { outlineStyle: "solid" }),
	match("outline-(dashed|dotted|double)", "outlineStyle"),
	matchTheme("-?(outline-offset)-"),
	matchColor("outline-", {
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	matchTheme("outline-", "outlineWidth"),
	withAutocomplete("(pointer-events)-", () => ["auto", "none"]),
	matchTheme("(will-change)-"),
	withAutocomplete("(will-change)-", () => [
		"auto",
		"contents",
		"transform"
	]),
	[
		"resize(?:-(none|x|y))?",
		"resize",
		({ 1: $1 }) => ({
			x: "horizontal",
			y: "vertical"
		})[$1] || $1 || "both"
	],
	match("select-(none|text|all|auto)", "userSelect"),
	matchColor("fill-", {
		section: "fill",
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	matchColor("stroke-", {
		section: "stroke",
		opacityVariable: false,
		opacitySection: "opacity"
	}),
	matchTheme("stroke-", "strokeWidth"),
	match("sr-only", {
		position: "absolute",
		width: "1px",
		height: "1px",
		padding: "0",
		margin: "-1px",
		overflow: "hidden",
		whiteSpace: "nowrap",
		clip: "rect(0,0,0,0)",
		borderWidth: "0"
	}),
	match("not-sr-only", {
		position: "static",
		width: "auto",
		height: "auto",
		padding: "0",
		margin: "0",
		overflow: "visible",
		whiteSpace: "normal",
		clip: "auto"
	})
];
function spacify(value) {
	return ("string" == typeof value ? value : value[1]).replace(/-/g, " ").trim();
}
function columnify(value) {
	return ("string" == typeof value ? value : value[1]).replace("col", "column");
}
function position(shorthand, separator = "-") {
	let longhand = [];
	for (let short of shorthand) longhand.push({
		t: "top",
		r: "right",
		b: "bottom",
		l: "left"
	}[short]);
	return longhand.join(separator);
}
function join(value) {
	return value && "" + (value._ || value);
}
function convertContentValue({ $$ }) {
	return ({
		r: "flex-",
		"": "flex-",
		w: "space-",
		u: "space-",
		n: "space-"
	}[$$[3] || ""] || "") + $$;
}
function edge(propertyPrefix, propertySuffix = "") {
	return ({ 1: $1, _ }) => {
		let edges = {
			x: "lr",
			y: "tb"
		}[$1] || $1 + $1;
		return edges ? {
			...toCSS(propertyPrefix + "-" + position(edges[0]) + propertySuffix, _),
			...toCSS(propertyPrefix + "-" + position(edges[1]) + propertySuffix, _)
		} : toCSS(propertyPrefix + propertySuffix, _);
	};
}
function filter(prefix = "") {
	let filters = [
		"blur",
		"brightness",
		"contrast",
		"grayscale",
		"hue-rotate",
		"invert",
		prefix && "opacity",
		"saturate",
		"sepia",
		!prefix && "drop-shadow"
	].filter(Boolean), defaults = {};
	for (let key of filters) defaults[`--tw-${prefix}${key}`] = "var(--tw-empty,/*!*/ /*!*/)";
	return defaults = {
		...asDefaults(defaults),
		[`${prefix}filter`]: filters.map((key) => `var(--tw-${prefix}${key})`).join(" ")
	}, [
		`(${prefix}filter)-(none)`,
		match(`${prefix}filter`, defaults),
		...filters.map((key) => matchTheme(`${"h" == key[0] ? "-?" : ""}(${prefix}${key})(?:$|-)`, key, ({ 1: $1, _ }) => ({
			[`--tw-${$1}`]: asArray(_).map((value) => `${key}(${value})`).join(" "),
			...defaults
		})))
	];
}
function transform({ 1: $1, _ }) {
	return {
		["--tw-" + $1]: _,
		...tranformDefaults()
	};
}
function tranformDefaults() {
	return {
		...asDefaults({
			"--tw-translate-x": "0",
			"--tw-translate-y": "0",
			"--tw-rotate": "0",
			"--tw-skew-x": "0",
			"--tw-skew-y": "0",
			"--tw-scale-x": "1",
			"--tw-scale-y": "1",
			"--tw-transform": transformValue()
		}),
		transform: "var(--tw-transform)"
	};
}
function transformValue(gpu) {
	return [
		gpu ? "translate3d(var(--tw-translate-x),var(--tw-translate-y),0)" : "translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y))",
		"rotate(var(--tw-rotate))",
		"skewX(var(--tw-skew-x))",
		"skewY(var(--tw-skew-y))",
		"scaleX(var(--tw-scale-x))",
		"scaleY(var(--tw-scale-y))"
	].join(" ");
}
function span({ 1: $1, 2: $2 }) {
	return `${$1} ${$2} / ${$1} ${$2}`;
}
function gridTemplate({ 1: $1 }) {
	return `repeat(${$1},minmax(0,1fr))`;
}
function range({ start = 1, end, step = 1 }) {
	let result = [];
	for (let index = start; index <= end; index += step) result.push(`${index}`);
	return result;
}
function asDefaults(props) {
	return { "@layer defaults": {
		"*,::before,::after": props,
		"::backdrop": props
	} };
}
//#endregion
//#region node_modules/@twind/preset-tailwind/variants.dev.js
var variants = [
	["sticky", "@supports ((position: -webkit-sticky) or (position:sticky))"],
	["motion-reduce", "@media (prefers-reduced-motion:reduce)"],
	["motion-safe", "@media (prefers-reduced-motion:no-preference)"],
	["print", "@media print"],
	["(portrait|landscape)", ({ 1: $1 }) => `@media (orientation:${$1})`],
	["contrast-(more|less)", ({ 1: $1 }) => `@media (prefers-contrast:${$1})`],
	["(first-(letter|line)|placeholder|backdrop|before|after)", ({ 1: $1 }) => `&::${$1}`],
	["(marker|selection)", ({ 1: $1 }) => `& *::${$1},&::${$1}`],
	["file", "&::file-selector-button"],
	["(first|last|only)", ({ 1: $1 }) => `&:${$1}-child`],
	["even", "&:nth-child(2n)"],
	["odd", "&:nth-child(odd)"],
	["open", "&[open]"],
	["(aria|data)-", withAutocomplete(({ 1: $1, $$ }, context) => $$ && `&[${$1}-${context.theme($1, $$) || arbitrary($$, "", context) || `${$$}="true"`}]`, ({ 1: $1 }, { theme }) => [...new Set([..."aria" == $1 ? [
		"checked",
		"disabled",
		"expanded",
		"hidden",
		"pressed",
		"readonly",
		"required",
		"selected"
	] : [], ...Object.keys(theme($1) || {})])].map((key) => ({
		suffix: key,
		label: `&[${$1}-${theme($1, key) || `${key}="true"`}]`,
		theme: {
			section: $1,
			key
		}
	})).concat([{
		suffix: "[",
		label: `&[${$1}-…]`
	}]))],
	["((group|peer)(~[^-[]+)?)(-\\[(.+)]|[-[].+?)(\\/.+)?", withAutocomplete(({ 2: type, 3: name = "", 4: $4, 5: $5 = "", 6: label = name }, { e, h, v }) => {
		let selector = normalize($5) || ("[" == $4[0] ? $4 : v($4.slice(1)));
		return `${(selector.includes("&") ? selector : "&" + selector).replace(/&/g, `:merge(.${e(h(type + label))})`)}${"p" == type[0] ? "~" : " "}&`;
	}, (_, { variants }) => Object.entries(variants).filter(([, selector]) => /^&(\[|:[^:])/.test(selector)).flatMap(([variant, selector]) => [{
		prefix: "group-",
		suffix: variant,
		label: `${selector.replace("&", ".group")} &`,
		modifiers: []
	}, {
		prefix: "peer-",
		suffix: variant,
		label: `${selector.replace("&", ".peer")} &`,
		modifiers: []
	}]))],
	["(ltr|rtl)", withAutocomplete(({ 1: $1 }) => `[dir="${$1}"] &`, ({ 1: $1 }) => [{
		prefix: $1,
		suffix: "",
		label: `[dir="${$1}"] &`
	}])],
	["supports-", withAutocomplete(({ $$ }, context) => {
		$$ && ($$ = context.theme("supports", $$) || arbitrary($$, "", context));
		if ($$) return $$.includes(":") || ($$ += ":var(--tw)"), /^\w*\s*\(/.test($$) || ($$ = `(${$$})`), `@supports ${$$.replace(/\b(and|or|not)\b/g, " $1 ").trim()}`;
	}, (_, { theme }) => Object.keys(theme("supports") || {}).map((key) => ({
		suffix: key,
		theme: {
			section: "supports",
			key
		}
	})).concat([{
		suffix: "[",
		label: `@supports …`
	}]))],
	["max-", withAutocomplete(({ $$ }, context) => {
		$$ && ($$ = context.theme("screens", $$) || arbitrary($$, "", context));
		if ("string" == typeof $$) return `@media not all and (min-width:${$$})`;
	}, (_, { theme }) => Object.entries(theme("screens") || {}).filter(([, value]) => "string" == typeof value).map(([key, value]) => ({
		suffix: key,
		label: `@media not all and (min-width:${value})`,
		theme: {
			section: "screens",
			key
		}
	})).concat([{
		suffix: "[",
		label: `@media not all and (min-width: …)`
	}]))],
	["min-", withAutocomplete(({ $$ }, context) => {
		return $$ && ($$ = arbitrary($$, "", context)), $$ && `@media (min-width:${$$})`;
	}, () => [{
		suffix: "[",
		label: `@media (min-width: …)`
	}])],
	[/^\[(.+)]$/, ({ 1: $1 }) => /[&@]/.test($1) && normalize($1).replace(/[}]+$/, "").split("{")]
];
//#endregion
//#region node_modules/@twind/preset-tailwind/base.dev.js
/** Allows to disable to tailwind preflight (default: `false` eg include the tailwind preflight ) */ /**
* @experimental
*/ function presetTailwindBase({ colors, disablePreflight } = {}) {
	return {
		preflight: disablePreflight ? void 0 : preflight,
		theme: {
			...theme$1,
			colors: {
				inherit: "inherit",
				current: "currentColor",
				transparent: "transparent",
				black: "#000",
				white: "#fff",
				...colors
			}
		},
		variants,
		rules,
		finalize(rule) {
			return rule.n && rule.d && rule.r.some((r) => /^&::(before|after)$/.test(r)) && !/(^|;)content:/.test(rule.d) ? {
				...rule,
				d: "content:var(--tw-content);" + rule.d
			} : rule;
		}
	};
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/twind.js
var _tw = twind(defineConfig({
	preflight: false,
	hash: true,
	darkMode: "class",
	theme: { extend: {
		colors: {
			"background": "var(--swk-background)",
			"background-secondary": "var(--swk-background-secondary)",
			"foreground-strong": "var(--swk-foreground-strong)",
			"foreground": "var(--swk-foreground)",
			"foreground-secondary": "var(--swk-foreground-secondary)",
			"primary": "var(--swk-primary)",
			"primary-foreground": "var(--swk-primary-foreground)",
			"transparent": "var(--swk-transparent)",
			"lighter": "var(--swk-lighter)",
			"light": "var(--swk-light)",
			"light-gray": "var(--swk-light-gray)",
			"gray": "var(--swk-gray)",
			"danger": "var(--swk-danger)",
			"border": "var(--swk-border)"
		},
		boxShadow: { default: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" },
		borderRadius: { default: "var(--swk-border-radius)" },
		fontFamily: { default: "var(--swk-font-family)" }
	} },
	presets: [presetAutoprefix(), presetTailwindBase({ disablePreflight: true })]
}), typeof document === "undefined" ? virtual() : cssom("style[data-library]"));
var tw = (text) => _tw(`!(${text})`);
tx$1.bind(_tw);
injectGlobal$1.bind(_tw);
keyframes$1.bind(_tw);
var reset = css`
  .stellar-wallets-kit *,
  .stellar-wallets-kit ::after,
  .stellar-wallets-kit ::before,
  .stellar-wallets-kit ::backdrop,
  .stellar-wallets-kit ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
  }
  .stellar-wallets-kit :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    font-family:
      ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
      "Noto Color Emoji";
    font-feature-settings: normal;
    font-variation-settings: normal;
    -webkit-tap-highlight-color: transparent;
  }
  .stellar-wallets-kit hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }
  .stellar-wallets-kit abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }
  .stellar-wallets-kit h1,
  .stellar-wallets-kit h2,
  .stellar-wallets-kit h3,
  .stellar-wallets-kit h4,
  .stellar-wallets-kit h5,
  .stellar-wallets-kit h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  .stellar-wallets-kit a {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }
  .stellar-wallets-kit b,
  .stellar-wallets-kit strong {
    font-weight: bolder;
  }
  .stellar-wallets-kit code,
  .stellar-wallets-kit kbd,
  .stellar-wallets-kit samp,
  .stellar-wallets-kit pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-feature-settings: normal;
    font-variation-settings: normal;
    font-size: 1em;
  }
  .stellar-wallets-kit small {
    font-size: 80%;
  }
  .stellar-wallets-kit sub,
  .stellar-wallets-kit sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  .stellar-wallets-kit sub {
    bottom: -0.25em;
  }
  .stellar-wallets-kit sup {
    top: -0.5em;
  }
  .stellar-wallets-kit table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }
  .stellar-wallets-kit :-moz-focusring {
    outline: auto;
  }
  .stellar-wallets-kit progress {
    vertical-align: baseline;
  }
  .stellar-wallets-kit summary {
    display: list-item;
  }
  .stellar-wallets-kit ol,
  .stellar-wallets-kit ul,
  .stellar-wallets-kit menu {
    list-style: none;
  }
  .stellar-wallets-kit img,
  .stellar-wallets-kit svg,
  .stellar-wallets-kit video,
  .stellar-wallets-kit canvas,
  .stellar-wallets-kit audio,
  .stellar-wallets-kit iframe,
  .stellar-wallets-kit embed,
  .stellar-wallets-kit object {
    display: block;
    vertical-align: middle;
  }
  .stellar-wallets-kit img,
  .stellar-wallets-kit video {
    max-width: 100%;
    height: auto;
  }
  .stellar-wallets-kit button,
  .stellar-wallets-kit input,
  .stellar-wallets-kit select,
  .stellar-wallets-kit optgroup,
  .stellar-wallets-kit textarea,
  .stellar-wallets-kit ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  .stellar-wallets-kit :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }
  .stellar-wallets-kit :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }
  .stellar-wallets-kit ::file-selector-button {
    margin-inline-end: 4px;
  }
  .stellar-wallets-kit ::placeholder {
    opacity: 1;
  }
  .stellar-wallets-kit textarea {
    resize: vertical;
  }
  .stellar-wallets-kit ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  .stellar-wallets-kit ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }
  .stellar-wallets-kit ::-webkit-datetime-edit {
    display: inline-flex;
  }
  .stellar-wallets-kit ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }
  .stellar-wallets-kit ::-webkit-datetime-edit,
  .stellar-wallets-kit ::-webkit-datetime-edit-year-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-month-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-day-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-hour-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-minute-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-second-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-millisecond-field,
  .stellar-wallets-kit ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }
  .stellar-wallets-kit ::-webkit-calendar-picker-indicator {
    line-height: 1;
  }
  .stellar-wallets-kit :-moz-ui-invalid {
    box-shadow: none;
  }
  .stellar-wallets-kit button,
  .stellar-wallets-kit input:where([type="button"], [type="reset"], [type="submit"]),
  .stellar-wallets-kit ::file-selector-button {
    appearance: button;
  }
  .stellar-wallets-kit ::-webkit-inner-spin-button,
  .stellar-wallets-kit ::-webkit-outer-spin-button {
    height: auto;
  }
  .stellar-wallets-kit [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }
`;
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/shared/button.js
var ButtonSize = /* @__PURE__ */ function(ButtonSize) {
	ButtonSize["xs"] = "xs";
	ButtonSize["sm"] = "sm";
	ButtonSize["md"] = "md";
	ButtonSize["lg"] = "lg";
	ButtonSize["xl"] = "xl";
	return ButtonSize;
}({});
var ButtonMode = /* @__PURE__ */ function(ButtonMode) {
	ButtonMode["primary"] = "primary";
	ButtonMode["secondary"] = "secondary";
	ButtonMode["ghost"] = "ghost";
	ButtonMode["free"] = "free";
	return ButtonMode;
}({});
var ButtonShape = /* @__PURE__ */ function(ButtonShape) {
	ButtonShape["regular"] = "regular";
	ButtonShape["icon"] = "icon";
	return ButtonShape;
}({});
var defaultClasses$1 = "flex items-center justify-center font-semibold easy-in-out transition leading-none";
function Button({ size = ButtonSize.md, mode = ButtonMode.primary, shape = ButtonShape.regular, classes, styles, children, onClick }) {
	const modeStyle = cx({
		"border-none bg-primary text-primary-foreground shadow-default hover:opacity-70 focus:opacity-90": mode === ButtonMode.primary,
		"border-none bg-background text-foreground shadow-default hover:opacity-70 focus:opacity-90": mode === ButtonMode.secondary,
		"bg-transparent text-foreground border-transparent border-1 hover:border-light-gray": mode === ButtonMode.ghost
	});
	const radius = cx({
		"rounded-default": shape === ButtonShape.regular,
		"rounded-full": shape === ButtonShape.icon
	});
	const sizeStyle = cx({
		"text-xs": size === ButtonSize.xs,
		"text-sm": size !== ButtonSize.xs
	});
	const padding = cx({
		"px-2 py-1": shape === ButtonShape.regular && (size === ButtonSize.xs || size === ButtonSize.sm),
		"px-2.5 py-1.5": shape === ButtonShape.regular && size === ButtonSize.md,
		"px-3 py-2": shape === ButtonShape.regular && size === ButtonSize.lg,
		"px-3.5 py-2.5": shape === ButtonShape.regular && size === ButtonSize.xl,
		"p-1": shape === ButtonShape.icon && size === ButtonSize.xs,
		"p-1.5": shape === ButtonShape.icon && size === ButtonSize.sm,
		"p-2": shape === ButtonShape.icon && size === ButtonSize.md,
		"p-2.5": shape === ButtonShape.icon && size === ButtonSize.lg,
		"p-3": shape === ButtonShape.icon && size === ButtonSize.xl
	});
	return m`
    <button onClick="${() => onClick()}" type="button" style="${styles}" class="${mode === ButtonMode.free ? "" : tw(cx("cursor-pointer", defaultClasses$1, modeStyle, radius, sizeStyle, padding))} ${classes}">
      ${children}
    </button>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/router.js
function resetHistory() {
	routerHistory.value = [];
}
function navigateTo(nextRoute) {
	route.value = nextRoute;
	routerHistory.value = [...routerHistory.value, nextRoute];
}
function goBack() {
	const currentHistory = routerHistory.value;
	currentHistory.pop();
	routerHistory.value = currentHistory.slice();
	route.value = currentHistory[currentHistory.length - 1];
}
function PageTransition({ children, isActive, duration = 300 }) {
	const [visible, setVisible] = d(isActive);
	const [shouldRender, setShouldRender] = d(isActive);
	y(() => {
		if (isActive) {
			setShouldRender(true);
			globalThis.requestAnimationFrame(() => setVisible(true));
		} else {
			setVisible(false);
			const timer = globalThis.setTimeout(() => setShouldRender(false), duration);
			return () => globalThis.clearTimeout(timer);
		}
	}, [isActive, duration]);
	if (!shouldRender) return null;
	return m`<div style=${{
		position: visible ? "relative" : "absolute",
		inset: 0,
		transition: `opacity ${duration}ms ease, transform ${duration}ms ease, position ${duration}ms ease`,
		opacity: visible ? 1 : 0
	}}>${children}</div>`;
}
function MultiPageAnimator({ currentRoute, pages, duration = 300 }) {
	return m`<div style=${{
		position: "relative",
		width: "100%",
		height: "100%"
	}}>${Object.entries(pages).map(([key, Component]) => m`
      <${PageTransition} id=${key} key=${key} isActive=${currentRoute === key} duration=${duration}>
        <${Component} />
      <//>
    `)}</div>`;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/shared/header.js
function openHelpPage() {
	navigateTo(SwkAppRoute.HELP_PAGE);
}
function back() {
	goBack();
}
var leftButtonComponent = g(() => {
	if (route.value !== SwkAppRoute.AUTH_OPTIONS) {
		if (routerHistory.value.length < 2) return m``;
		return m`
      <${Button} onClick=${() => back()}
                 size="${ButtonSize.md}"
                 mode="${ButtonMode.ghost}"
                 shape="${ButtonShape.icon}">
        
        <svg class="${tw("w-4 h-4")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path></svg>
      <//>
    `;
	} else return m`
      <${Button} onClick=${() => openHelpPage()}
                 size="${ButtonSize.md}"
                 mode="${ButtonMode.ghost}"
                 shape="${ButtonShape.icon}">
        <svg class="${tw("w-4 h-4")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z"></path></svg>
      <//>
    `;
});
function Header() {
	return m`
    <header class="${tw("flex items-center px-3 py-2")}">
      <div class="${tw("w-3/12 flex justify-start")}">
        ${leftButtonComponent.value}
      </div>

      <div class="${tw("w-6/12 text-center")}">
        <h1 class="${tw("text-foreground-strong font-semibold")}">
          ${modalTitle.value}
        </h1>
      </div>

      <div class="${tw("w-3/12 flex justify-end")}">
        <${Button} onClick=${() => closeEvent.next()}
                   size="${ButtonSize.md}"
                   mode="${ButtonMode.ghost}"
                   shape="${ButtonShape.icon}">

          <svg class="${tw("w-4 h-4")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
        <//>
      </div>
    </header>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/shared/footer.js
function Footer() {
	return m`
    <footer class="${tw("w-full text-center p-2 border-t-1 border-t-border")}">
      <p class="${tw("text-xs text-foreground")}">
        Powered by
        <a target="_blank" href="https://stellarwalletskit.dev/" class="${tw("font-semibold underline ml-1")}">
          Stellar Wallets Kit
        </a>
      </p>
    </footer>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/shared/avatar.js
var AvatarSize = /* @__PURE__ */ function(AvatarSize) {
	AvatarSize["xs"] = "w-6 h-6";
	AvatarSize["sm"] = "w-8 h-8";
	AvatarSize["md"] = "w-10 h-10";
	AvatarSize["lg"] = "w-12 h-12";
	AvatarSize["xl"] = "w-14 h-14";
	return AvatarSize;
}({});
var defaultClasses = "inline-block rounded-full outline -outline-offset-1 outline-black/5 dark:outline-white/10";
function Avatar(props) {
	return m`
    <img alt="${props.alt}" src="${props.image}" class="${tw(cx(defaultClasses, props.size))}" />
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/pages/auth-options.page.js
var sortedWallet = g(() => {
	const tempSortedWallets = allowedWallets.value.reduce((all, current) => {
		return {
			available: current.isAvailable ? [...all.available, current] : all.available,
			unavailable: !current.isAvailable ? [...all.unavailable, current] : all.unavailable
		};
	}, {
		available: [],
		unavailable: []
	});
	let usedWalletsIds;
	try {
		const record = globalThis?.localStorage.getItem(LocalStorageKeys.usedWalletsIds);
		usedWalletsIds = record ? JSON.parse(record) : [];
	} catch (e) {
		console.error(e);
		usedWalletsIds = [];
	}
	const usedWallets = [];
	const nonUsedWallets = [];
	for (const availableWallet of tempSortedWallets.available) if (usedWalletsIds.find((id) => id === availableWallet.id)) usedWallets.push(availableWallet);
	else nonUsedWallets.push(availableWallet);
	return [
		...usedWallets.sort((a, b) => {
			return usedWalletsIds.indexOf(a.id) - usedWalletsIds.indexOf(b.id);
		}),
		...nonUsedWallets,
		...tempSortedWallets.unavailable
	];
});
async function onWalletSelected(item) {
	if (!item.isAvailable) {
		globalThis.open(item.url, "_blank");
		return;
	}
	selectedModuleId.value = item.id;
	moduleSelectedEvent.next(item);
	if (item.type === ModuleType.HW_WALLET) navigateTo(SwkAppRoute.HW_ACCOUNTS_FETCHER);
	else try {
		const { address } = await activeModule.value.getAddress();
		activeAddress.value = address;
		addressUpdatedEvent.next(address);
	} catch (e) {
		addressUpdatedEvent.next(e);
	}
}
function AuthOptionsPage() {
	modalTitle.value = "Connect Wallet";
	const wrapper = sortedWallet.value.find((w) => w.isPlatformWrapper);
	if (wrapper) {
		onWalletSelected(wrapper).then();
		return m`
      <div class="${tw("w-full text-center px-4 py-8")}">
        <div class="${tw("w-full mb-4")}">
          <${Avatar} alt="${wrapper.name} icon" image="${wrapper.icon}" size="${AvatarSize.md}" />
        </div>

        <p class="${tw("text-foreground text-lg w-full")}">
          Connecting to your wallet using <b>${wrapper.name}</b>
        </p>
      </div>
    `;
	}
	const loadingMessage = m`
    <div class="${tw("w-full text-center text-foreground font-semibold p-4")}">Loading wallets...</div>
  `;
	const walletItem = sortedWallet.value.map((wallet) => {
		return m`
      <li
        onClick="${() => onWalletSelected(wallet)}"
        class="${tw("px-2 py-2 cursor-pointer flex justify-between items-center bg-background hover:border-light-gray border-1 border-transparent rounded-default duration-150 ease active:bg-background active:border-gray")}"
      >
        <div class="${tw("flex items-center gap-2")}">
          <${Avatar} class="${tw("mr-2")}" alt="${wallet.name} icon" image="${wallet.icon}" size="${AvatarSize.sm}" />
          <p class="${tw("text-foreground font-semibold")}">${wallet.name}</p>
        </div>

        ${showInstallLabel.value && !wallet.isAvailable ? m`
            <div class="${tw("ml-4 flex items-center")}">
              <small
                class="${tw("inline-flex items-center border-1 border-border px-2 py-1 rounded-default text-foreground-secondary text-xs bg-background-secondary")}"
              >
                ${installText.value}

                <svg class="${tw("w-4 h-4")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.0037 9.41421L7.39712 18.0208L5.98291 16.6066L14.5895 8H7.00373V6H18.0037V17H16.0037V9.41421Z"></path>
                </svg>
              </small>
            </div>
          ` : ""}
      </li>
    `;
	});
	return m`
    <ul class="${tw("w-full grid gap-2 px-2 py-4")}">
      ${sortedWallet.value.length === 0 ? loadingMessage : walletItem}
    </ul>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/pages/what-is-a-wallet.page.js
function WhatIsAWalletPage() {
	return m`
    <section class="${tw("w-full p-4 pb-8 rounded-tl-default")}">
      <div class="${tw("w-full mb-6")}">
        <h3 class="${tw("text-foreground-strong font-semibold text-lg mb-2")}">What is a wallet?</h3>
        <p class="${tw("text-foreground text-sm")}">
          Wallets are used to send, receive, and store the keys you use to sign blockchain transactions.
        </p>
      </div>

      <div class="w-full">
        <h3 class="${tw("text-foreground-strong font-semibold text-lg mb-2")}">What is Stellar?</h3>
        <p class="${tw("text-foreground text-sm")}">
          Stellar is a decentralized, public blockchain that gives developers the tools to create experiences that are more
          like cash than crypto.
        </p>
      </div>
    </section>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/pages/profile.page.js
var showCopiedText = y$1(false);
function copyToClipboard() {
	if (!activeAddress.value) throw new Error(`Text to copy to the clipboard can't be undefined`);
	navigator.clipboard.writeText(activeAddress.value).then(() => {
		showCopiedText.value = true;
		setTimeout(() => {
			showCopiedText.value = false;
		}, 2500);
	}).catch((e) => console.error(e));
}
function ProfilePage() {
	modalTitle.value = "";
	return m`
    <section class="${tw("w-full flex flex-col pb-8")}">
      <div class="${tw("w-full flex justify-center mb-4")}">
        <${Avatar} alt="${activeModule.value?.productName} icon" image="${activeModule.value?.productIcon}" size="${AvatarSize.xl}" />
      </div>
      
      <div class="${tw("w-full flex items-center justify-center mb-2")}">
        <h1 class="${tw("text-lg font-semibold text-foreground")}">
          ${activeAddress.value && `${activeAddress.value.slice(0, 6)}....${activeAddress.value.slice(-6)}`}
        </h1>
      </div>
      
      <div class="${tw("w-full flex flex-col items-center justify-center gap-2")}">
        <${Button} mode="${ButtonMode.ghost}" onClick="${copyToClipboard}" size="${ButtonSize.sm}">
          ${showCopiedText.value ? "Address copied!" : m`Copy address`} <svg class="${tw("w-4 h-4 ml-2")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>
        <//>

        <${Button} mode="${ButtonMode.ghost}" onClick="${disconnect}" size="${ButtonSize.sm}">
          Disconnect <svg class="${tw("w-4 h-4 ml-2")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11H13V13H5V16L0 12L5 8V11ZM3.99927 18H6.70835C8.11862 19.2447 9.97111 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.97111 4 8.11862 4.75527 6.70835 6H3.99927C5.82368 3.57111 8.72836 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C8.72836 22 5.82368 20.4289 3.99927 18Z"></path></svg>
        <//>
      </div>
    </section>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/pages/hw-accounts-fetcher.page.js
var initialState = {
	error: null,
	loading: true,
	accounts: []
};
var HwAccountsFetcherPage = class extends x {
	stateSignal = y$1(initialState);
	componentWillMount() {
		modalTitle.value = "Wallet Accounts";
		this.fetchAccounts();
	}
	async fetchAccounts() {
		const hwModule = activeModule.value;
		this.stateSignal.value = initialState;
		if (hwModule.disconnect) {
			await hwModule.disconnect();
			await new Promise((r) => setTimeout(r, 500));
		}
		try {
			const accounts = await hwModule.getAddresses();
			this.stateSignal.value = {
				...this.stateSignal.value,
				loading: false,
				accounts
			};
		} catch (err) {
			this.stateSignal.value = {
				...this.stateSignal.value,
				error: err.message
			};
		}
	}
	async selectAccount(params) {
		activeAddress.value = params.publicKey;
		addressUpdatedEvent.next(params.publicKey);
	}
	render() {
		const loadingComponent = m`
      <div class="${tw("py-8 w-full flex justify-center items-center text-foreground")}">
        <svg class="${tw("w-8 h-8 text-gray-200 animate-spin")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C16.9706 3 21 7.02944 21 12H19C19 8.13401 15.866 5 12 5V3Z"></path>
        </svg>
      </div>
    `;
		const accountsListComponent = m`    
      <ul class="${tw("w-full grid gap-2 px-2 py-4 text-foreground")}">
        ${hardwareWalletPaths.value.map(({ publicKey, index }) => {
			return m`
            <li onClick=${() => this.selectAccount({
				publicKey,
				index
			})}
                class="${tw("px-2 py-2 cursor-pointer flex justify-between items-center bg-background hover:border-light-gray border-1 border-transparent rounded-default duration-150 ease active:bg-background active:border-gray")}">
              ${publicKey.slice(0, 6)}....${publicKey.slice(-6)}

              <span class="dialog-text">(44'/148'/${index}')</span>
            </li>
          `;
		})}
      </ul>
    `;
		const errorComponent = m`
      <div class="${tw("w-full text-center text-foreground py-4")}">
        <div class="${tw("text-danger")}">
          <svg class="${tw("inline-block mx-auto w-8 h-8 mb-2")}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.8659 3.00017L22.3922 19.5002C22.6684 19.9785 22.5045 20.5901 22.0262 20.8662C21.8742 20.954 21.7017 21.0002 21.5262 21.0002H2.47363C1.92135 21.0002 1.47363 20.5525 1.47363 20.0002C1.47363 19.8246 1.51984 19.6522 1.60761 19.5002L11.1339 3.00017C11.41 2.52187 12.0216 2.358 12.4999 2.63414C12.6519 2.72191 12.7782 2.84815 12.8659 3.00017ZM4.20568 19.0002H19.7941L11.9999 5.50017L4.20568 19.0002ZM10.9999 16.0002H12.9999V18.0002H10.9999V16.0002ZM10.9999 9.00017H12.9999V14.0002H10.9999V9.00017Z"></path>
          </svg>
        </div>
        
        <h3 class="${tw("text-sm font-semibold")}">
          Error while fetching accounts with reason:
        </h3>
        
        <p class="${tw("mb-4 text-sm")}">
          ${this.stateSignal.value.error}
        </p>
        
        <div class="${tw("w-full flex justify-center items-center")}">
          <${Button} onClick=${() => this.fetchAccounts()} size="${ButtonSize.md}">
            Retry
          <//>
        </div>
      </div>
    `;
		if (this.stateSignal.value.error) return errorComponent;
		else return this.stateSignal.value.loading ? loadingComponent : accountsListComponent;
	}
};
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/app.js
var pages = {
	[SwkAppRoute.AUTH_OPTIONS]: AuthOptionsPage,
	[SwkAppRoute.HELP_PAGE]: WhatIsAWalletPage,
	[SwkAppRoute.PROFILE_PAGE]: ProfilePage,
	[SwkAppRoute.HW_ACCOUNTS_FETCHER]: HwAccountsFetcherPage
};
var glass = css`
  .glass {
    backdrop-filter: blur(10px);
    background-color: color-mix(in srgb, var(--swk-background) 25%, transparent);
  }
`;
function SwkApp() {
	return m`
    <section class="stellar-wallets-kit ${tw(cx([mode.value === SwkAppMode.FIXED ? "fixed flex left-0 top-0 z-[999] w-full h-full" : "inline-flex", "font-default justify-center items-center"]))} ${tw(reset)} ${tw(glass)}">
      ${mode.value === SwkAppMode.FIXED ? m`
          <div class="${tw("absolute left-0 top-0 z-0 w-full h-full bg-[rgba(0,0,0,0.5)]")}" onClick="${() => closeEvent.next()}"></div>
        ` : ""}

      <section
        class="${tw("w-full h-fit relative max-w-[22rem] max-h-[39.4375rem] grid grid-cols-1 grid-rows-[auto_1fr_auto] bg-background rounded-default shadow-default transition-all duration-[0.5s] ease-in-out overflow-hidden max-h-[400px] overflow-y-scroll")}"
      >
        <div class="${tw("col-span-1 top-0 sticky z-50")} glass">
          <${Header} />
        </div>

        <div class="${tw("col-span-1 relative z-10")}">
          <${MultiPageAnimator}
            currentRoute="${route.value}"
            pages="${pages}"
            duration="${400}"
          />
        </div>

        <div class="${tw("col-span-1 bottom-0 sticky z-50")} glass">
          <${Footer} />
        </div>
      </section>
    </section>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/components/kit-button.js
async function handleOnClick(cb) {
	if (cb) cb();
	if (typeof activeModules.value === "undefined") throw new Error(`The kit hasn't been initiated.`);
	if (!activeModule.value || !activeAddress.value) await StellarWalletsKit.authModal();
	else await StellarWalletsKit.profileModal();
}
function SwkButton(props) {
	const content = activeAddress.value ? `${activeAddress.value.slice(0, 4)}....${activeAddress.value.slice(-6)}` : "Connect Wallet";
	return m`
    <div class="${tw(reset)} ${tw("inline-block")}">      
      <${Button} styles=${props.styles} 
                 classes=${props.classes}
                 mode=${props.mode || ButtonMode.primary}
                 shape=${props.shape || ButtonShape.regular}
                 size=${props.size}
                 onClick=${() => handleOnClick(props.onClick)}>        
        ${props.children ? props.children : content}
      <//>
    </div>
  `;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/sdk/kit.js
var StellarWalletsKit = class StellarWalletsKit {
	static init(params) {
		activeModules.value = params.modules;
		if (params.selectedWalletId) StellarWalletsKit.setWallet(params.selectedWalletId);
		if (params.network) StellarWalletsKit.setNetwork(params.network);
		if (params.theme) StellarWalletsKit.setTheme(params.theme);
		if (params.authModal) {
			if (typeof params.authModal.showInstallLabel !== "undefined") showInstallLabel.value = params.authModal.showInstallLabel;
			if (typeof params.authModal.hideUnsupportedWallets !== "undefined") hideUnsupportedWallets.value = params.authModal.hideUnsupportedWallets;
		}
	}
	static get selectedModule() {
		if (!activeModule.value) throw {
			code: -3,
			message: "Please set the wallet first"
		};
		return activeModule.value;
	}
	/**
	* This method sets the active wallet (module) that will be used when calling others methods (for example getAddress).
	*/ static setWallet(id) {
		const target = activeModules.value.find((mod) => mod.productId === id);
		if (!target) throw new Error(`Wallet id "${id}" is not and existing module`);
		selectedModuleId.value = target.productId;
	}
	/**
	* This method sets the Stellar network the kit will use across calls.
	*/ static setNetwork(network) {
		selectedNetwork.value = network;
	}
	/**
	* You can manually update the kit's styles with this method.
	*/ static setTheme(newTheme = SwkAppLightTheme) {
		theme.value = newTheme;
	}
	/**
	* This method will get you the `address` that's currently active in the Kit's memory. Such address is fetched when the user connects its wallet
	*
	* NOTE: If you want to fetch the address directly from the wallet, use the `fetchAddress` method instead.
	*/ static async getAddress() {
		if (!activeAddress.value) throw {
			code: -1,
			message: "No wallet has been connected."
		};
		return { address: activeAddress.value };
	}
	/**
	* This method will fetch the address from the selected module and update the internal kit's memory
	*
	* NOTE: We suggest that you use `getAddress` when possible instead of this method. Trying to fetch the address from a module
	* that is not ready might cause unexpected behaviors (for example with Freighter if no permission has been granted or when the user is using a hardware wallet);
	*/ static async fetchAddress() {
		const { address } = await StellarWalletsKit.selectedModule.getAddress();
		activeAddress.value = address;
		addressUpdatedEvent.next(address);
		return { address };
	}
	static signTransaction(xdr, opts) {
		return StellarWalletsKit.selectedModule.signTransaction(xdr, {
			...opts,
			networkPassphrase: opts?.networkPassphrase || selectedNetwork.value
		});
	}
	static signAuthEntry(authEntry, opts) {
		return StellarWalletsKit.selectedModule.signAuthEntry(authEntry, {
			...opts,
			networkPassphrase: opts?.networkPassphrase || selectedNetwork.value
		});
	}
	static signMessage(message, opts) {
		return StellarWalletsKit.selectedModule.signMessage(message, {
			...opts,
			networkPassphrase: opts?.networkPassphrase || selectedNetwork.value
		});
	}
	static signAndSubmitTransaction(xdr, opts) {
		const module = StellarWalletsKit.selectedModule;
		if (!module.signAndSubmitTransaction) throw {
			code: -3,
			message: `The selected module "${module.productName}" does not support the "signAndSubmitTransaction" method.`
		};
		return module.signAndSubmitTransaction(xdr, {
			...opts,
			networkPassphrase: opts?.networkPassphrase || selectedNetwork.value
		});
	}
	static getNetwork() {
		return StellarWalletsKit.selectedModule.getNetwork();
	}
	static async disconnect() {
		disconnect();
	}
	static on(type, callback) {
		switch (type) {
			case KitEventType.STATE_UPDATED: {
				let currentActiveAddress = void 0;
				let currentSelectedNetwork = void 0;
				return C(() => {
					if (activeAddress.value !== currentActiveAddress || selectedNetwork.value !== currentSelectedNetwork) {
						currentActiveAddress = activeAddress.value;
						currentSelectedNetwork = selectedNetwork.value;
						callback({
							eventType: KitEventType.STATE_UPDATED,
							payload: {
								address: activeAddress.value,
								networkPassphrase: selectedNetwork.value
							}
						});
					}
				});
			}
			case KitEventType.WALLET_SELECTED: {
				let current = void 0;
				return C(() => {
					if (selectedModuleId.value !== current) {
						current = selectedModuleId.value;
						callback({
							eventType: KitEventType.WALLET_SELECTED,
							payload: { id: selectedModuleId.value }
						});
					}
				});
			}
			case KitEventType.DISCONNECT: return disconnectEvent.subscribe(() => {
				callback({
					eventType: KitEventType.DISCONNECT,
					payload: {}
				});
			});
			default: throw new Error(`${type} event type is not supported`);
		}
	}
	static async refreshSupportedWallets() {
		const results = await Promise.all(activeModules.value.map(async (mod) => {
			const timer = new Promise((r) => setTimeout(() => r(false), 1e3));
			return {
				id: mod.productId,
				name: mod.productName,
				type: mod.moduleType,
				icon: mod.productIcon,
				isAvailable: await Promise.race([timer, mod.isAvailable()]).catch(() => false),
				isPlatformWrapper: await Promise.race([timer, mod.isPlatformWrapper ? mod.isPlatformWrapper() : Promise.resolve(false)]).catch(() => false),
				url: mod.productUrl
			};
		}));
		allowedWallets.value = results;
		return results;
	}
	static async createButton(container, props = {}) {
		J(m`
        <${SwkButton}
          styles="${props.styles}"
          classes="${props.classes}"
          mode="${props.mode}"
          shape="${props.shape}"
          size="${props.size}"
          onClick="${() => props.onClick && props.onClick()}"
          children="${props.children}"
        />
      `, container);
	}
	/**
	* This method opens an "authentication" modal where the user can pick the wallet they want to connect,
	* it sets the selected wallet as the currently active module and then it requests the public key from the wallet.
	*/ static async authModal(params) {
		resetHistory();
		navigateTo(SwkAppRoute.AUTH_OPTIONS);
		mode.value = params?.container ? SwkAppMode.BLOCK : SwkAppMode.FIXED;
		const wrapper = document.createElement("div");
		(params?.container || document.body).appendChild(wrapper);
		J(m`
        <${SwkApp} />
      `, wrapper);
		await StellarWalletsKit.refreshSupportedWallets();
		const subs = [];
		const close = () => {
			for (const sub of subs) sub();
			J(null, wrapper);
			wrapper.parentNode?.removeChild(wrapper);
		};
		return new Promise((resolve, reject) => {
			const sub1 = addressUpdatedEvent.subscribe((result) => {
				if (typeof result === "string") resolve({ address: result });
				else reject(parseError(result));
			});
			const sub2 = closeEvent.subscribe(() => {
				reject({
					code: -1,
					message: "The user closed the modal."
				});
			});
			subs.push(sub1);
			subs.push(sub2);
		}).then((r) => {
			close();
			return r;
		}).catch((e) => {
			close();
			throw e;
		});
	}
	/**
	* This method opens the "profile" modal, this modal allows the user to check its currently connected account, copy its public key
	*/ static async profileModal(params) {
		if (!activeAddress.value) throw {
			code: -1,
			message: "There is no active address, the user needs to authenticate first."
		};
		resetHistory();
		navigateTo(SwkAppRoute.PROFILE_PAGE);
		mode.value = params?.container ? SwkAppMode.BLOCK : SwkAppMode.FIXED;
		const wrapper = document.createElement("div");
		(params?.container || document.body).appendChild(wrapper);
		J(m`
        <${SwkApp} />
      `, wrapper);
		const sub = closeEvent.subscribe(() => {
			sub();
			J(null, wrapper);
			wrapper.parentNode?.removeChild(wrapper);
		});
	}
};
//#endregion
export { Avatar, AvatarSize, Button, ButtonMode, ButtonShape, ButtonSize, Footer, Header, KitEventType, LocalStorageKeys, ModuleType, Networks, StellarWalletsKit, SwkApp, SwkAppDarkTheme, SwkAppLightTheme, SwkAppMode, SwkAppRoute, SwkButton, activeAddress, activeModule, activeModules, addressUpdatedEvent, allowedWallets, closeEvent, createSubject, disconnect, disconnectEvent, goBack, hardwareWalletPaths, hideUnsupportedWallets, horizonUrl, installText, mnemonicPath, modalTitle, mode, moduleSelectedEvent, navigateTo, parseError, resetWalletState, route, routerHistory, selectedModuleId, selectedNetwork, showInstallLabel, theme, updateActiveSession, updatedSelectedModule, updatedThemeEffect, wcSessionPaths };

//# sourceMappingURL=@creit-tech_stellar-wallets-kit.js.map