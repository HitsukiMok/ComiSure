//#region node_modules/preact/dist/preact.module.js
var n$1, l$3, u$2, t$2, i$2, r$2, o$2, e$2, f$2, c$2, s$2, a$2, p$3 = {}, v$2 = [], y$3 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, d$3 = Array.isArray;
function w$3(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function g$2(n) {
	n && n.parentNode && n.parentNode.removeChild(n);
}
function _$2(l, u, t) {
	var i, r, o, e = {};
	for (o in u) "key" == o ? i = u[o] : "ref" == o ? r = u[o] : e[o] = u[o];
	if (arguments.length > 2 && (e.children = arguments.length > 3 ? n$1.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === e[o] && (e[o] = l.defaultProps[o]);
	return m$3(l, e, i, r, null);
}
function m$3(n, t, i, r, o) {
	var e = {
		type: n,
		props: t,
		key: i,
		ref: r,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: null == o ? ++u$2 : o,
		__i: -1,
		__u: 0
	};
	return null == o && null != l$3.vnode && l$3.vnode(e), e;
}
function k$2(n) {
	return n.children;
}
function x$2(n, l) {
	this.props = n, this.context = l;
}
function S$1(n, l) {
	if (null == l) return n.__ ? S$1(n.__, n.__i + 1) : null;
	for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? S$1(n) : null;
}
function C$2(n) {
	if (n.__P && n.__d) {
		var u = n.__v, t = u.__e, i = [], r = [], o = w$3({}, u);
		o.__v = u.__v + 1, l$3.vnode && l$3.vnode(o), z$1(n.__P, o, u, n.__n, n.__P.namespaceURI, 32 & u.__u ? [t] : null, i, null == t ? S$1(u) : t, !!(32 & u.__u), r), o.__v = u.__v, o.__.__k[o.__i] = o, V(i, o, r), u.__e = u.__ = null, o.__e != t && M(o);
	}
}
function M(n) {
	if (null != (n = n.__) && null != n.__c) return n.__e = n.__c.base = null, n.__k.some(function(l) {
		if (null != l && null != l.__e) return n.__e = n.__c.base = l.__e;
	}), M(n);
}
function $(n) {
	(!n.__d && (n.__d = !0) && i$2.push(n) && !I.__r++ || r$2 != l$3.debounceRendering) && ((r$2 = l$3.debounceRendering) || o$2)(I);
}
function I() {
	try {
		for (var n, l = 1; i$2.length;) i$2.length > l && i$2.sort(e$2), n = i$2.shift(), l = i$2.length, C$2(n);
	} finally {
		i$2.length = I.__r = 0;
	}
}
function P(n, l, u, t, i, r, o, e, f, c, s) {
	var a, h, y, d, w, g, _, m = t && t.__k || v$2, b = l.length;
	for (f = A(u, l, m, f, b), a = 0; a < b; a++) null != (y = u.__k[a]) && (h = -1 != y.__i && m[y.__i] || p$3, y.__i = a, g = z$1(n, y, h, i, r, o, e, f, c, s), d = y.__e, y.ref && h.ref != y.ref && (h.ref && D$1(h.ref, null, y), s.push(y.ref, y.__c || d, y)), null == w && null != d && (w = d), (_ = !!(4 & y.__u)) || h.__k === y.__k ? f = H(y, f, n, _) : "function" == typeof y.type && void 0 !== g ? f = g : d && (f = d.nextSibling), y.__u &= -7);
	return u.__e = w, f;
}
function A(n, l, u, t, i) {
	var r, o, e, f, c, s = u.length, a = s, h = 0;
	for (n.__k = new Array(i), r = 0; r < i; r++) null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o ? ("string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? o = n.__k[r] = m$3(null, o, null, null, null) : d$3(o) ? o = n.__k[r] = m$3(k$2, { children: o }, null, null, null) : void 0 === o.constructor && o.__b > 0 ? o = n.__k[r] = m$3(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : n.__k[r] = o, f = r + h, o.__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = T$1(o, u, f, a)) && (a--, (e = u[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (i > s ? h-- : i < s && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[r] = null;
	if (a) for (r = 0; r < s; r++) null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = S$1(e)), E$1(e, e));
	return t;
}
function H(n, l, u, t) {
	var i, r;
	if ("function" == typeof n.type) {
		for (i = n.__k, r = 0; i && r < i.length; r++) i[r] && (i[r].__ = n, l = H(i[r], l, u, t));
		return l;
	}
	n.__e != l && (t && (l && n.type && !l.parentNode && (l = S$1(n)), u.insertBefore(n.__e, l || null)), l = n.__e);
	do
		l = l && l.nextSibling;
	while (null != l && 8 == l.nodeType);
	return l;
}
function T$1(n, l, u, t) {
	var i, r, o, e = n.key, f = n.type, c = l[u], s = null != c && 0 == (2 & c.__u);
	if (null === c && null == e || s && e == c.key && f == c.type) return u;
	if (t > (s ? 1 : 0)) {
		for (i = u - 1, r = u + 1; i >= 0 || r < l.length;) if (null != (c = l[o = i >= 0 ? i-- : r++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
	}
	return -1;
}
function j$1(n, l, u) {
	"-" == l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || y$3.test(l) ? u : u + "px";
}
function F$1(n, l, u, t, i) {
	var r, o;
	n: if ("style" == l) if ("string" == typeof u) n.style.cssText = u;
	else {
		if ("string" == typeof t && (n.style.cssText = t = ""), t) for (l in t) u && l in u || j$1(n.style, l, "");
		if (u) for (l in u) t && u[l] == t[l] || j$1(n.style, l, u[l]);
	}
	else if ("o" == l[0] && "n" == l[1]) r = l != (l = l.replace(f$2, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? t ? u.u = t.u : (u.u = c$2, n.addEventListener(l, r ? a$2 : s$2, r)) : n.removeEventListener(l, r ? a$2 : s$2, r);
	else {
		if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
			n[l] = null == u ? "" : u;
			break n;
		} catch (n) {}
		"function" == typeof u || (null == u || !1 === u && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
	}
}
function O(n) {
	return function(u) {
		if (this.l) {
			var t = this.l[u.type + n];
			if (null == u.t) u.t = c$2++;
			else if (u.t < t.u) return;
			return t(l$3.event ? l$3.event(u) : u);
		}
	};
}
function z$1(n, u, t, i, r, o, e, f, c, s) {
	var a, h, p, y, _, m, b, S, C, M, $, I, A, H, L, T = u.type;
	if (void 0 !== u.constructor) return null;
	128 & t.__u && (c = !!(32 & t.__u), o = [f = u.__e = t.__e]), (a = l$3.__b) && a(u);
	n: if ("function" == typeof T) try {
		if (S = u.props, C = T.prototype && T.prototype.render, M = (a = T.contextType) && i[a.__c], $ = a ? M ? M.props.value : a.__ : i, t.__c ? b = (h = u.__c = t.__c).__ = h.__E : (C ? u.__c = h = new T(S, $) : (u.__c = h = new x$2(S, $), h.constructor = T, h.render = G), M && M.sub(h), h.state || (h.state = {}), h.__n = i, p = h.__d = !0, h.__h = [], h._sb = []), C && null == h.__s && (h.__s = h.state), C && null != T.getDerivedStateFromProps && (h.__s == h.state && (h.__s = w$3({}, h.__s)), w$3(h.__s, T.getDerivedStateFromProps(S, h.__s))), y = h.props, _ = h.state, h.__v = u, p) C && null == T.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), C && null != h.componentDidMount && h.__h.push(h.componentDidMount);
		else {
			if (C && null == T.getDerivedStateFromProps && S !== y && null != h.componentWillReceiveProps && h.componentWillReceiveProps(S, $), u.__v == t.__v || !h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(S, h.__s, $)) {
				u.__v != t.__v && (h.props = S, h.state = h.__s, h.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
					n && (n.__ = u);
				}), v$2.push.apply(h.__h, h._sb), h._sb = [], h.__h.length && e.push(h);
				break n;
			}
			null != h.componentWillUpdate && h.componentWillUpdate(S, h.__s, $), C && null != h.componentDidUpdate && h.__h.push(function() {
				h.componentDidUpdate(y, _, m);
			});
		}
		if (h.context = $, h.props = S, h.__P = n, h.__e = !1, I = l$3.__r, A = 0, C) h.state = h.__s, h.__d = !1, I && I(u), a = h.render(h.props, h.state, h.context), v$2.push.apply(h.__h, h._sb), h._sb = [];
		else do
			h.__d = !1, I && I(u), a = h.render(h.props, h.state, h.context), h.state = h.__s;
		while (h.__d && ++A < 25);
		h.state = h.__s, null != h.getChildContext && (i = w$3(w$3({}, i), h.getChildContext())), C && !p && null != h.getSnapshotBeforeUpdate && (m = h.getSnapshotBeforeUpdate(y, _)), H = null != a && a.type === k$2 && null == a.key ? q$1(a.props.children) : a, f = P(n, d$3(H) ? H : [H], u, t, i, r, o, e, f, c, s), h.base = u.__e, u.__u &= -161, h.__h.length && e.push(h), b && (h.__E = h.__ = null);
	} catch (n) {
		if (u.__v = null, c || null != o) if (n.then) {
			for (u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;) f = f.nextSibling;
			o[o.indexOf(f)] = null, u.__e = f;
		} else {
			for (L = o.length; L--;) g$2(o[L]);
			N(u);
		}
		else u.__e = t.__e, u.__k = t.__k, n.then || N(u);
		l$3.__e(n, u, t);
	}
	else null == o && u.__v == t.__v ? (u.__k = t.__k, u.__e = t.__e) : f = u.__e = B$1(t.__e, u, t, i, r, o, e, c, s);
	return (a = l$3.diffed) && a(u), 128 & u.__u ? void 0 : f;
}
function N(n) {
	n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(N));
}
function V(n, u, t) {
	for (var i = 0; i < t.length; i++) D$1(t[i], t[++i], t[++i]);
	l$3.__c && l$3.__c(u, n), n.some(function(u) {
		try {
			n = u.__h, u.__h = [], n.some(function(n) {
				n.call(u);
			});
		} catch (n) {
			l$3.__e(n, u.__v);
		}
	});
}
function q$1(n) {
	return "object" != typeof n || null == n || n.__b > 0 ? n : d$3(n) ? n.map(q$1) : w$3({}, n);
}
function B$1(u, t, i, r, o, e, f, c, s) {
	var a, h, v, y, w, _, m, b = i.props || p$3, k = t.props, x = t.type;
	if ("svg" == x ? o = "http://www.w3.org/2000/svg" : "math" == x ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
		for (a = 0; a < e.length; a++) if ((w = e[a]) && "setAttribute" in w == !!x && (x ? w.localName == x : 3 == w.nodeType)) {
			u = w, e[a] = null;
			break;
		}
	}
	if (null == u) {
		if (null == x) return document.createTextNode(k);
		u = document.createElementNS(o, x, k.is && k), c && (l$3.__m && l$3.__m(t, e), c = !1), e = null;
	}
	if (null == x) b === k || c && u.data == k || (u.data = k);
	else {
		if (e = e && n$1.call(u.childNodes), !c && null != e) for (b = {}, a = 0; a < u.attributes.length; a++) b[(w = u.attributes[a]).name] = w.value;
		for (a in b) w = b[a], "dangerouslySetInnerHTML" == a ? v = w : "children" == a || a in k || "value" == a && "defaultValue" in k || "checked" == a && "defaultChecked" in k || F$1(u, a, null, w, o);
		for (a in k) w = k[a], "children" == a ? y = w : "dangerouslySetInnerHTML" == a ? h = w : "value" == a ? _ = w : "checked" == a ? m = w : c && "function" != typeof w || b[a] === w || F$1(u, a, w, b[a], o);
		if (h) c || v && (h.__html == v.__html || h.__html == u.innerHTML) || (u.innerHTML = h.__html), t.__k = [];
		else if (v && (u.innerHTML = ""), P("template" == t.type ? u.content : u, d$3(y) ? y : [y], t, i, r, "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : i.__k && S$1(i, 0), c, s), null != e) for (a = e.length; a--;) g$2(e[a]);
		c || (a = "value", "progress" == x && null == _ ? u.removeAttribute("value") : null != _ && (_ !== u[a] || "progress" == x && !_ || "option" == x && _ != b[a]) && F$1(u, a, _, b[a], o), a = "checked", null != m && m != u[a] && F$1(u, a, m, b[a], o));
	}
	return u;
}
function D$1(n, u, t) {
	try {
		if ("function" == typeof n) {
			var i = "function" == typeof n.__u;
			i && n.__u(), i && null == u || (n.__u = n(u));
		} else n.current = u;
	} catch (n) {
		l$3.__e(n, t);
	}
}
function E$1(n, u, t) {
	var i, r;
	if (l$3.unmount && l$3.unmount(n), (i = n.ref) && (i.current && i.current != n.__e || D$1(i, null, u)), null != (i = n.__c)) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (n) {
			l$3.__e(n, u);
		}
		i.base = i.__P = null;
	}
	if (i = n.__k) for (r = 0; r < i.length; r++) i[r] && E$1(i[r], u, t || "function" != typeof n.type);
	t || g$2(n.__e), n.__c = n.__ = n.__e = void 0;
}
function G(n, l, u) {
	return this.constructor(n, u);
}
function J(u, t, i) {
	var r, o, e, f;
	t == document && (t = document.documentElement), l$3.__ && l$3.__(u, t), o = (r = "function" == typeof i) ? null : i && i.__k || t.__k, e = [], f = [], z$1(t, u = (!r && i || t).__k = _$2(k$2, null, [u]), o || p$3, p$3, t.namespaceURI, !r && i ? [i] : o ? null : t.firstChild ? n$1.call(t.childNodes) : null, e, !r && i ? i : o ? o.__e : t.firstChild, r, f), V(e, u, f);
}
n$1 = v$2.slice, l$3 = { __e: function(n, l, u, t) {
	for (var i, r, o; l = l.__;) if ((i = l.__c) && !i.__) try {
		if ((r = i.constructor) && null != r.getDerivedStateFromError && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), o = i.__d), o) return i.__E = i;
	} catch (l) {
		n = l;
	}
	throw n;
} }, u$2 = 0, t$2 = function(n) {
	return null != n && void 0 === n.constructor;
}, x$2.prototype.setState = function(n, l) {
	var u = null != this.__s && this.__s != this.state ? this.__s : this.__s = w$3({}, this.state);
	"function" == typeof n && (n = n(w$3({}, u), this.props)), n && w$3(u, n), null != n && this.__v && (l && this._sb.push(l), $(this));
}, x$2.prototype.forceUpdate = function(n) {
	this.__v && (this.__e = !0, n && this.__h.push(n), $(this));
}, x$2.prototype.render = k$2, i$2 = [], o$2 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$2 = function(n, l) {
	return n.__v.__b - l.__v.__b;
}, I.__r = 0, f$2 = /(PointerCapture)$|Capture$/i, c$2 = 0, s$2 = O(!1), a$2 = O(!0);
//#endregion
//#region node_modules/preact/hooks/dist/hooks.module.js
var t$1, r$1, u$1, i$1, o$1 = 0, f$1 = [], c$1 = l$3, e$1 = c$1.__b, a$1 = c$1.__r, v$1 = c$1.diffed, l$2 = c$1.__c, m$2 = c$1.unmount, s$1 = c$1.__;
function p$2(n, t) {
	c$1.__h && c$1.__h(r$1, n, o$1 || t), o$1 = 0;
	var u = r$1.__H || (r$1.__H = {
		__: [],
		__h: []
	});
	return n >= u.__.length && u.__.push({}), u.__[n];
}
function d$2(n) {
	return o$1 = 1, h$2(D, n);
}
function h$2(n, u, i) {
	var o = p$2(t$1++, 2);
	if (o.t = n, !o.__c && (o.__ = [i ? i(u) : D(void 0, u), function(n) {
		var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
		t !== r && (o.__N = [r, o.__[1]], o.__c.setState({}));
	}], o.__c = r$1, !r$1.__f)) {
		var f = function(n, t, r) {
			if (!o.__c.__H) return !0;
			var u = o.__c.__H.__.filter(function(n) {
				return n.__c;
			});
			if (u.every(function(n) {
				return !n.__N;
			})) return !c || c.call(this, n, t, r);
			var i = o.__c.props !== n;
			return u.some(function(n) {
				if (n.__N) {
					var t = n.__[0];
					n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
				}
			}), c && c.call(this, n, t, r) || i;
		};
		r$1.__f = !0;
		var c = r$1.shouldComponentUpdate, e = r$1.componentWillUpdate;
		r$1.componentWillUpdate = function(n, t, r) {
			if (this.__e) {
				var u = c;
				c = void 0, f(n, t, r), c = u;
			}
			e && e.call(this, n, t, r);
		}, r$1.shouldComponentUpdate = f;
	}
	return o.__N || o.__;
}
function y$2(n, u) {
	var i = p$2(t$1++, 3);
	!c$1.__s && C$1(i.__H, u) && (i.__ = n, i.u = u, r$1.__H.__h.push(i));
}
function T(n, r) {
	var u = p$2(t$1++, 7);
	return C$1(u.__H, r) && (u.__ = n(), u.__H = r, u.__h = n), u.__;
}
function j() {
	for (var n; n = f$1.shift();) {
		var t = n.__H;
		if (n.__P && t) try {
			t.__h.some(z), t.__h.some(B), t.__h = [];
		} catch (r) {
			t.__h = [], c$1.__e(r, n.__v);
		}
	}
}
c$1.__b = function(n) {
	r$1 = null, e$1 && e$1(n);
}, c$1.__ = function(n, t) {
	n && t.__k && t.__k.__m && (n.__m = t.__k.__m), s$1 && s$1(n, t);
}, c$1.__r = function(n) {
	a$1 && a$1(n), t$1 = 0;
	var i = (r$1 = n.__c).__H;
	i && (u$1 === r$1 ? (i.__h = [], r$1.__h = [], i.__.some(function(n) {
		n.__N && (n.__ = n.__N), n.u = n.__N = void 0;
	})) : (i.__h.some(z), i.__h.some(B), i.__h = [], t$1 = 0)), u$1 = r$1;
}, c$1.diffed = function(n) {
	v$1 && v$1(n);
	var t = n.__c;
	t && t.__H && (t.__H.__h.length && (1 !== f$1.push(t) && i$1 === c$1.requestAnimationFrame || ((i$1 = c$1.requestAnimationFrame) || w$2)(j)), t.__H.__.some(function(n) {
		n.u && (n.__H = n.u), n.u = void 0;
	})), u$1 = r$1 = null;
}, c$1.__c = function(n, t) {
	t.some(function(n) {
		try {
			n.__h.some(z), n.__h = n.__h.filter(function(n) {
				return !n.__ || B(n);
			});
		} catch (r) {
			t.some(function(n) {
				n.__h && (n.__h = []);
			}), t = [], c$1.__e(r, n.__v);
		}
	}), l$2 && l$2(n, t);
}, c$1.unmount = function(n) {
	m$2 && m$2(n);
	var t, r = n.__c;
	r && r.__H && (r.__H.__.some(function(n) {
		try {
			z(n);
		} catch (n) {
			t = n;
		}
	}), r.__H = void 0, t && c$1.__e(t, r.__v));
};
var k$1 = "function" == typeof requestAnimationFrame;
function w$2(n) {
	var t, r = function() {
		clearTimeout(u), k$1 && cancelAnimationFrame(t), setTimeout(n);
	}, u = setTimeout(r, 35);
	k$1 && (t = requestAnimationFrame(r));
}
function z(n) {
	var t = r$1, u = n.__c;
	"function" == typeof u && (n.__c = void 0, u()), r$1 = t;
}
function B(n) {
	var t = r$1;
	n.__c = n.__(), r$1 = t;
}
function C$1(n, t) {
	return !n || n.length !== t.length || t.some(function(t, r) {
		return t !== n[r];
	});
}
function D(n, t) {
	return "function" == typeof t ? t(n) : t;
}
//#endregion
//#region node_modules/@preact/signals-core/dist/signals-core.module.js
var i = Symbol.for("preact-signals");
function t() {
	if (!(s > 1)) {
		var i, t = !1;
		(function() {
			var i = d$1;
			d$1 = void 0;
			while (void 0 !== i) {
				if (i.S.v === i.v) i.S.i = i.i;
				i = i.o;
			}
		})();
		while (void 0 !== h$1) {
			var n = h$1;
			h$1 = void 0;
			v++;
			while (void 0 !== n) {
				var r = n.u;
				n.u = void 0;
				n.f &= -3;
				if (!(8 & n.f) && w$1(n)) try {
					n.c();
				} catch (n) {
					if (!t) {
						i = n;
						t = !0;
					}
				}
				n = r;
			}
		}
		v = 0;
		s--;
		if (t) throw i;
	} else s--;
}
function n(i) {
	if (s > 0) return i();
	e = ++u;
	s++;
	try {
		return i();
	} finally {
		t();
	}
}
var r = void 0;
function o(i) {
	var t = r;
	r = void 0;
	try {
		return i();
	} finally {
		r = t;
	}
}
var f, h$1 = void 0, s = 0, v = 0, u = 0, e = 0, d$1 = void 0, c = 0;
function a(i) {
	if (void 0 !== r) {
		var t = i.n;
		if (void 0 === t || t.t !== r) {
			t = {
				i: 0,
				S: i,
				p: r.s,
				n: void 0,
				t: r,
				e: void 0,
				x: void 0,
				r: t
			};
			if (void 0 !== r.s) r.s.n = t;
			r.s = t;
			i.n = t;
			if (32 & r.f) i.S(t);
			return t;
		} else if (-1 === t.i) {
			t.i = 0;
			if (void 0 !== t.n) {
				t.n.p = t.p;
				if (void 0 !== t.p) t.p.n = t.n;
				t.p = r.s;
				t.n = void 0;
				r.s.n = t;
				r.s = t;
			}
			return t;
		}
	}
}
function l$1(i, t) {
	this.v = i;
	this.i = 0;
	this.n = void 0;
	this.t = void 0;
	this.l = 0;
	this.W = null == t ? void 0 : t.watched;
	this.Z = null == t ? void 0 : t.unwatched;
	this.name = null == t ? void 0 : t.name;
}
l$1.prototype.brand = i;
l$1.prototype.h = function() {
	return !0;
};
l$1.prototype.S = function(i) {
	var t = this, n = this.t;
	if (n !== i && void 0 === i.e) {
		i.x = n;
		this.t = i;
		if (void 0 !== n) n.e = i;
		else o(function() {
			var i;
			null == (i = t.W) || i.call(t);
		});
	}
};
l$1.prototype.U = function(i) {
	var t = this;
	if (void 0 !== this.t) {
		var n = i.e, r = i.x;
		if (void 0 !== n) {
			n.x = r;
			i.e = void 0;
		}
		if (void 0 !== r) {
			r.e = n;
			i.x = void 0;
		}
		if (i === this.t) {
			this.t = r;
			if (void 0 === r) o(function() {
				var i;
				null == (i = t.Z) || i.call(t);
			});
		}
	}
};
l$1.prototype.subscribe = function(i) {
	var t = this;
	return C(function() {
		var n = t.value, o = r;
		r = void 0;
		try {
			i(n);
		} finally {
			r = o;
		}
	}, { name: "sub" });
};
l$1.prototype.valueOf = function() {
	return this.value;
};
l$1.prototype.toString = function() {
	return this.value + "";
};
l$1.prototype.toJSON = function() {
	return this.value;
};
l$1.prototype.peek = function() {
	var i = r;
	r = void 0;
	try {
		return this.value;
	} finally {
		r = i;
	}
};
Object.defineProperty(l$1.prototype, "value", {
	get: function() {
		var i = a(this);
		if (void 0 !== i) i.i = this.i;
		return this.v;
	},
	set: function(i) {
		if (i !== this.v) {
			if (v > 100) throw new Error("Cycle detected");
			(function(i) {
				if (0 !== s && 0 === v) {
					if (i.l !== e) {
						i.l = e;
						d$1 = {
							S: i,
							v: i.v,
							i: i.i,
							o: d$1
						};
					}
				}
			})(this);
			this.v = i;
			this.i++;
			c++;
			s++;
			try {
				for (var n = this.t; void 0 !== n; n = n.x) n.t.N();
			} finally {
				t();
			}
		}
	}
});
function y$1(i, t) {
	return new l$1(i, t);
}
function w$1(i) {
	for (var t = i.s; void 0 !== t; t = t.n) if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
	return !1;
}
function _$1(i) {
	for (var t = i.s; void 0 !== t; t = t.n) {
		var n = t.S.n;
		if (void 0 !== n) t.r = n;
		t.S.n = t;
		t.i = -1;
		if (void 0 === t.n) {
			i.s = t;
			break;
		}
	}
}
function b$1(i) {
	var t = i.s, n = void 0;
	while (void 0 !== t) {
		var r = t.p;
		if (-1 === t.i) {
			t.S.U(t);
			if (void 0 !== r) r.n = t.n;
			if (void 0 !== t.n) t.n.p = r;
		} else n = t;
		t.S.n = t.r;
		if (void 0 !== t.r) t.r = void 0;
		t = r;
	}
	i.s = n;
}
function p$1(i, t) {
	l$1.call(this, void 0);
	this.x = i;
	this.s = void 0;
	this.g = c - 1;
	this.f = 4;
	this.W = null == t ? void 0 : t.watched;
	this.Z = null == t ? void 0 : t.unwatched;
	this.name = null == t ? void 0 : t.name;
}
p$1.prototype = new l$1();
p$1.prototype.h = function() {
	this.f &= -3;
	if (1 & this.f) return !1;
	if (32 == (36 & this.f)) return !0;
	this.f &= -5;
	if (this.g === c) return !0;
	this.g = c;
	this.f |= 1;
	if (this.i > 0 && !w$1(this)) {
		this.f &= -2;
		return !0;
	}
	var i = r;
	try {
		_$1(this);
		r = this;
		var t = this.x();
		if (16 & this.f || this.v !== t || 0 === this.i) {
			this.v = t;
			this.f &= -17;
			this.i++;
		}
	} catch (i) {
		this.v = i;
		this.f |= 16;
		this.i++;
	}
	r = i;
	b$1(this);
	this.f &= -2;
	return !0;
};
p$1.prototype.S = function(i) {
	if (void 0 === this.t) {
		this.f |= 36;
		for (var t = this.s; void 0 !== t; t = t.n) t.S.S(t);
	}
	l$1.prototype.S.call(this, i);
};
p$1.prototype.U = function(i) {
	if (void 0 !== this.t) {
		l$1.prototype.U.call(this, i);
		if (void 0 === this.t) {
			this.f &= -33;
			for (var t = this.s; void 0 !== t; t = t.n) t.S.U(t);
		}
	}
};
p$1.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 6;
		for (var i = this.t; void 0 !== i; i = i.x) i.t.N();
	}
};
Object.defineProperty(p$1.prototype, "value", { get: function() {
	if (1 & this.f) throw new Error("Cycle detected");
	var i = a(this);
	this.h();
	if (void 0 !== i) i.i = this.i;
	if (16 & this.f) throw this.v;
	return this.v;
} });
function g$1(i, t) {
	return new p$1(i, t);
}
function S(i) {
	var n = i.m;
	i.m = void 0;
	if ("function" == typeof n) {
		s++;
		var o = r;
		r = void 0;
		try {
			n();
		} catch (t) {
			i.f &= -2;
			i.f |= 8;
			m$1(i);
			throw t;
		} finally {
			r = o;
			t();
		}
	}
}
function m$1(i) {
	for (var t = i.s; void 0 !== t; t = t.n) t.S.U(t);
	i.x = void 0;
	i.s = void 0;
	S(i);
}
function x$1(i) {
	if (r !== this) throw new Error("Out-of-order effect");
	b$1(this);
	r = i;
	this.f &= -2;
	if (8 & this.f) m$1(this);
	t();
}
function E(i, t) {
	this.x = i;
	this.m = void 0;
	this.s = void 0;
	this.u = void 0;
	this.f = 32;
	this.name = null == t ? void 0 : t.name;
	if (f) f.push(this);
}
E.prototype.c = function() {
	var i = this.S();
	try {
		if (8 & this.f) return;
		if (void 0 === this.x) return;
		var t = this.x();
		if ("function" == typeof t) this.m = t;
	} finally {
		i();
	}
};
E.prototype.S = function() {
	if (1 & this.f) throw new Error("Cycle detected");
	this.f |= 1;
	this.f &= -9;
	S(this);
	_$1(this);
	s++;
	var i = r;
	r = this;
	return x$1.bind(this, i);
};
E.prototype.N = function() {
	if (!(2 & this.f)) {
		this.f |= 2;
		this.u = h$1;
		h$1 = this;
	}
};
E.prototype.d = function() {
	this.f |= 8;
	if (!(1 & this.f)) m$1(this);
};
E.prototype.dispose = function() {
	this.d();
};
function C(i, t) {
	var n = new E(i, t);
	try {
		n.c();
	} catch (i) {
		n.d();
		throw i;
	}
	var r = n.d.bind(n);
	r[Symbol.dispose] = r;
	return r;
}
//#endregion
//#region node_modules/@preact/signals/dist/signals.module.js
var l, h, p = "undefined" != typeof window && !!window.__PREACT_SIGNALS_DEVTOOLS__, _ = [];
C(function() {
	l = this.N;
})();
function g(i, r) {
	l$3[i] = r.bind(null, l$3[i] || function() {});
}
function b(i) {
	if (h) {
		var n = h;
		h = void 0;
		n();
	}
	h = i && i.S();
}
function y(i) {
	var n = this, t = i.data, e = useSignal(t);
	e.value = t;
	var f = T(function() {
		var i = n, t = n.__v;
		while (t = t.__) if (t.__c) {
			t.__c.__$f |= 4;
			break;
		}
		var o = g$1(function() {
			var i = e.value.value;
			return 0 === i ? 0 : !0 === i ? "" : i || "";
		}), f = g$1(function() {
			return !Array.isArray(o.value) && !t$2(o.value);
		}), a = C(function() {
			this.N = F;
			if (f.value) {
				var n = o.value;
				if (i.__v && i.__v.__e && 3 === i.__v.__e.nodeType) i.__v.__e.data = n;
			}
		}), v = n.__$u.d;
		n.__$u.d = function() {
			a();
			v.call(this);
		};
		return [f, o];
	}, []), a = f[0], v = f[1];
	return a.value ? v.peek() : v.value;
}
y.displayName = "ReactiveTextNode";
Object.defineProperties(l$1.prototype, {
	constructor: {
		configurable: !0,
		value: void 0
	},
	type: {
		configurable: !0,
		value: y
	},
	props: {
		configurable: !0,
		get: function() {
			var i = this;
			return { data: { get value() {
				return i.value;
			} } };
		}
	},
	__b: {
		configurable: !0,
		value: 1
	}
});
g("__b", function(i, n) {
	if ("string" == typeof n.type) {
		var r, t = n.props;
		for (var o in t) if ("children" !== o) {
			var e = t[o];
			if (e instanceof l$1) {
				if (!r) n.__np = r = {};
				r[o] = e;
				t[o] = e.peek();
			}
		}
	}
	i(n);
});
g("__r", function(i, n) {
	i(n);
	if (n.type !== k$2) {
		b();
		var r, o = n.__c;
		if (o) {
			o.__$f &= -2;
			if (void 0 === (r = o.__$u)) o.__$u = r = function(i, n) {
				var r;
				C(function() {
					r = this;
				}, { name: n });
				r.c = i;
				return r;
			}(function() {
				var i;
				if (p) null == (i = r.y) || i.call(r);
				o.__$f |= 1;
				o.setState({});
			}, "function" == typeof n.type ? n.type.displayName || n.type.name : "");
		}
		b(r);
	}
});
g("__e", function(i, n, r, t) {
	b();
	i(n, r, t);
});
g("diffed", function(i, n) {
	b();
	var r;
	if ("string" == typeof n.type && (r = n.__e)) {
		var t = n.__np, o = n.props;
		if (t) {
			var e = r.U;
			if (e) for (var f in e) {
				var u = e[f];
				if (void 0 !== u && !(f in t)) {
					u.d();
					e[f] = void 0;
				}
			}
			else {
				e = {};
				r.U = e;
			}
			for (var a in t) {
				var c = e[a], v = t[a];
				if (void 0 === c) {
					c = w(r, a, v);
					e[a] = c;
				} else c.o(v, o);
			}
			for (var s in t) o[s] = t[s];
		}
	}
	i(n);
});
function w(i, n, r, t) {
	var o = n in i && void 0 === i.ownerSVGElement, e = y$1(r), f = r.peek();
	return {
		o: function(i, n) {
			e.value = i;
			f = i.peek();
		},
		d: C(function() {
			this.N = F;
			var r = e.value.value;
			if (f !== r) {
				f = void 0;
				if (o) i[n] = r;
				else if (null != r && (!1 !== r || "-" === n[4])) i.setAttribute(n, r);
				else i.removeAttribute(n);
			} else f = void 0;
		})
	};
}
g("unmount", function(i, n) {
	if ("string" == typeof n.type) {
		var r = n.__e;
		if (r) {
			var t = r.U;
			if (t) {
				r.U = void 0;
				for (var o in t) {
					var e = t[o];
					if (e) e.d();
				}
			}
		}
		n.__np = void 0;
	} else {
		var f = n.__c;
		if (f) {
			var u = f.__$u;
			if (u) {
				f.__$u = void 0;
				u.d();
			}
		}
	}
	i(n);
});
g("__h", function(i, n, r, t) {
	if (t < 3 || 9 === t) n.__$f |= 2;
	i(n, r, t);
});
x$2.prototype.shouldComponentUpdate = function(i, n) {
	if (this.__R) return !0;
	var r = this.__$u, t = r && void 0 !== r.s;
	for (var o in n) return !0;
	if (this.__f || "boolean" == typeof this.u && !0 === this.u) {
		var e = 2 & this.__$f;
		if (!(t || e || 4 & this.__$f)) return !0;
		if (1 & this.__$f) return !0;
	} else {
		if (!(t || 4 & this.__$f)) return !0;
		if (3 & this.__$f) return !0;
	}
	for (var f in i) if ("__source" !== f && i[f] !== this.props[f]) return !0;
	for (var u in this.props) if (!(u in i)) return !0;
	return !1;
};
function useSignal(i, n) {
	return T(function() {
		return y$1(i, n);
	}, []);
}
var q = function(i) {
	queueMicrotask(function() {
		queueMicrotask(i);
	});
};
function x() {
	n(function() {
		var i;
		while (i = _.shift()) l.call(i);
	});
}
function F() {
	if (1 === _.push(this)) (l$3.requestAnimationFrame || q)(x);
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/types/components.js
var SwkAppRoute = /* @__PURE__ */ function(SwkAppRoute) {
	SwkAppRoute["AUTH_OPTIONS"] = "AUTH_OPTIONS";
	SwkAppRoute["HELP_PAGE"] = "HELP_PAGE";
	SwkAppRoute["PROFILE_PAGE"] = "PROFILE_PAGE";
	SwkAppRoute["HW_ACCOUNTS_FETCHER"] = "HW_ACCOUNTS_FETCHER";
	return SwkAppRoute;
}({});
var SwkAppMode = /* @__PURE__ */ function(SwkAppMode) {
	SwkAppMode["FIXED"] = "FIXED";
	SwkAppMode["BLOCK"] = "BLOCK";
	SwkAppMode["HIDDEN"] = "HIDDEN";
	return SwkAppMode;
}({});
var SwkAppLightTheme = {
	"background": "#fcfcfcff",
	"background-secondary": "#f8f8f8ff",
	"foreground-strong": "#000000",
	"foreground": "#161619ff",
	"foreground-secondary": "#2d2d31ff",
	"primary": "#3b82f6",
	"primary-foreground": "#ffffff",
	"transparent": "rgba(0, 0, 0, 0)",
	"lighter": "#fcfcfc",
	"light": "#f8f8f8",
	"light-gray": "oklch(0.800 0.006 286.033)",
	"gray": "oklch(0.600 0.006 286.033)",
	"danger": "oklch(57.7% 0.245 27.325)",
	"border": "rgba(0, 0, 0, 0.15)",
	"shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
	"border-radius": "0.5rem",
	"font-family": "sans-serif"
};
var SwkAppDarkTheme = {
	"background": "oklch(0.333 0 89.876)",
	"background-secondary": "oklch(0 0 0)",
	"foreground-strong": "#fff",
	"foreground": "oklch(0.985 0 0)",
	"foreground-secondary": "oklch(0.97 0 0)",
	"primary": "#e0e0e0",
	"primary-foreground": "#1e1e1e",
	"transparent": "rgba(0, 0, 0, 0)",
	"lighter": "#fcfcfc",
	"light": "#f8f8f8",
	"light-gray": "oklch(0.800 0.006 286.033)",
	"gray": "oklch(0.600 0.006 286.033)",
	"danger": "oklch(57.7% 0.245 27.325)",
	"border": "rgba(58,58,58,0.15)",
	"shadow": "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)",
	"border-radius": "0.5rem",
	"font-family": "sans-serif"
};
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/types/storage.js
var LocalStorageKeys = /* @__PURE__ */ function(LocalStorageKeys) {
	LocalStorageKeys["usedWalletsIds"] = "@StellarWalletsKit/usedWalletsIds";
	LocalStorageKeys["activeAddress"] = "@StellarWalletsKit/activeAddress";
	LocalStorageKeys["selectedModuleId"] = "@StellarWalletsKit/selectedModuleId";
	LocalStorageKeys["hardwareWalletPaths"] = "@StellarWalletsKit/hardwareWalletPaths";
	LocalStorageKeys["wcSessionPaths"] = "@StellarWalletsKit/wcSessionPaths";
	return LocalStorageKeys;
}({});
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/types/mod.js
var Networks = /* @__PURE__ */ function(Networks) {
	Networks["PUBLIC"] = "Public Global Stellar Network ; September 2015";
	Networks["TESTNET"] = "Test SDF Network ; September 2015";
	Networks["FUTURENET"] = "Test SDF Future Network ; October 2022";
	Networks["SANDBOX"] = "Local Sandbox Stellar Network ; September 2022";
	Networks["STANDALONE"] = "Standalone Network ; February 2017";
	return Networks;
}({});
var ModuleType = /* @__PURE__ */ function(ModuleType) {
	ModuleType["HW_WALLET"] = "HW_WALLET";
	ModuleType["HOT_WALLET"] = "HOT_WALLET";
	ModuleType["BRIDGE_WALLET"] = "BRIDGE_WALLET";
	ModuleType["AIR_GAPED_WALLET"] = "AIR_GAPED_WALLET";
	return ModuleType;
}({});
var KitEventType = /* @__PURE__ */ function(KitEventType) {
	KitEventType["STATE_UPDATED"] = "STATE_UPDATE";
	KitEventType["WALLET_SELECTED"] = "WALLET_SELECTED";
	KitEventType["DISCONNECT"] = "DISCONNECT";
	return KitEventType;
}({});
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/state/values.js
var localstorage = globalThis.localStorage;
var mode = y$1(SwkAppMode.FIXED);
var modalTitle = y$1("Connect a Wallet");
var showInstallLabel = y$1(true);
var hideUnsupportedWallets = y$1(true);
var installText = y$1("Install");
var horizonUrl = y$1("https://horizon.stellar.org");
var selectedNetwork = y$1(Networks.PUBLIC);
var theme = y$1(SwkAppLightTheme);
var route = y$1(SwkAppRoute.AUTH_OPTIONS);
var routerHistory = y$1([SwkAppRoute.AUTH_OPTIONS]);
var activeAddress = y$1(localstorage?.getItem(LocalStorageKeys.activeAddress) || void 0);
var selectedModuleId = y$1(localstorage?.getItem(LocalStorageKeys.selectedModuleId) || void 0);
var allowedWallets = y$1([]);
var activeModules = y$1([]);
var activeModule = g$1(() => {
	return activeModules.value.find((m) => m.productId === selectedModuleId.value);
});
var hardwareWalletPathsInitial = localstorage?.getItem(LocalStorageKeys.hardwareWalletPaths);
var hardwareWalletPaths = y$1(JSON.parse(hardwareWalletPathsInitial || "[]"));
var mnemonicPath = g$1(() => {
	const path = hardwareWalletPaths.value.find(({ publicKey }) => publicKey === activeAddress.value);
	if (!path) return void 0;
	return `44'/148'/${path.index}'`;
});
var wcSessionPathsInitial = localstorage?.getItem(LocalStorageKeys.wcSessionPaths);
var wcSessionPaths = y$1(JSON.parse(wcSessionPathsInitial || "[]"));
function resetWalletState() {
	routerHistory.value = [];
	hardwareWalletPaths.value = [];
	wcSessionPaths.value = [];
	activeAddress.value = void 0;
	selectedModuleId.value = void 0;
}
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/state/events.js
function createSubject() {
	const trigger = y$1(null);
	let status = "active";
	let storedError = null;
	const nextListeners = /* @__PURE__ */ new Set();
	const errorListeners = /* @__PURE__ */ new Set();
	const completeListeners = /* @__PURE__ */ new Set();
	C(() => {
		if (status === "active" && trigger.value !== null) {
			const v = trigger.value;
			trigger.value = null;
			for (const cb of nextListeners) cb(v);
		}
	});
	function clearAll() {
		nextListeners.clear();
		errorListeners.clear();
		completeListeners.clear();
	}
	return {
		next(v) {
			if (status === "active") trigger.value = v;
		},
		error(err) {
			if (status !== "active") return;
			status = "error";
			storedError = err;
			for (const cb of errorListeners) cb(err);
			clearAll();
		},
		complete() {
			if (status !== "active") return;
			status = "completed";
			for (const cb of completeListeners) cb();
			clearAll();
		},
		subscribe(next, error, complete) {
			if (status === "error") {
				error?.(storedError);
				return () => {};
			}
			if (status === "completed") {
				complete?.();
				return () => {};
			}
			if (next) nextListeners.add(next);
			if (error) errorListeners.add(error);
			if (complete) completeListeners.add(complete);
			return () => {
				if (next) nextListeners.delete(next);
				if (error) errorListeners.delete(error);
				if (complete) completeListeners.delete(complete);
			};
		},
		isCompleted() {
			return status === "completed";
		},
		hasError() {
			return status === "error";
		}
	};
}
var moduleSelectedEvent = createSubject();
var addressUpdatedEvent = createSubject();
var closeEvent = createSubject();
var disconnectEvent = createSubject();
//#endregion
//#region node_modules/@creit-tech/stellar-wallets-kit/sdk/utils.js
function parseError(e) {
	return {
		code: e?.error?.code || e?.code || -1,
		message: e?.error?.message || e?.message || typeof e === "string" && e || "Unhandled error from the wallet",
		ext: e?.error?.ext || e?.ext
	};
}
function disconnect() {
	if (activeModule.value?.disconnect) activeModule.value.disconnect();
	resetWalletState();
	disconnectEvent.next();
	closeEvent.next();
}
//#endregion
export { LocalStorageKeys as A, J as B, selectedNetwork as C, KitEventType as D, wcSessionPaths as E, C as F, x$2 as H, g$1 as I, y$1 as L, SwkAppLightTheme as M, SwkAppMode as N, ModuleType as O, SwkAppRoute as P, d$2 as R, selectedModuleId as S, theme as T, _$2 as V, modalTitle as _, createSubject as a, route as b, activeAddress as c, allowedWallets as d, hardwareWalletPaths as f, mnemonicPath as g, installText as h, closeEvent as i, SwkAppDarkTheme as j, Networks as k, activeModule as l, horizonUrl as m, parseError as n, disconnectEvent as o, hideUnsupportedWallets as p, addressUpdatedEvent as r, moduleSelectedEvent as s, disconnect as t, activeModules as u, mode as v, showInstallLabel as w, routerHistory as x, resetWalletState as y, y$2 as z };

//# sourceMappingURL=utils-Db3O7fom.js.map