/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = globalThis, F = B.ShadowRoot && (B.ShadyCSS === void 0 || B.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), et = /* @__PURE__ */ new WeakMap();
let pt = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (F && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = et.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && et.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const bt = (i) => new pt(typeof i == "string" ? i : i + "", void 0, G), N = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, r, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[o + 1], i[0]);
  return new pt(e, i, G);
}, gt = (i, t) => {
  if (F) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), r = B.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = e.cssText, i.appendChild(s);
  }
}, st = F ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return bt(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: At, defineProperty: wt, getOwnPropertyDescriptor: Et, getOwnPropertyNames: St, getOwnPropertySymbols: xt, getPrototypeOf: Pt } = Object, W = globalThis, it = W.trustedTypes, kt = it ? it.emptyScript : "", Ct = W.reactiveElementPolyfillSupport, U = (i, t) => i, L = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? kt : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, Q = (i, t) => !At(i, t), rt = { attribute: !0, type: String, converter: L, reflect: !1, useDefault: !1, hasChanged: Q };
Symbol.metadata ??= Symbol("metadata"), W.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let S = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = rt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, e);
      r !== void 0 && wt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: r, set: o } = Et(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: r, set(n) {
      const l = r?.call(this);
      o?.call(this, n), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? rt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Pt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const e = this.properties, s = [...St(e), ...xt(e)];
      for (const r of s) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, r] of e) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const r = this._$Eu(e, s);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) e.unshift(st(r));
    } else t !== void 0 && e.push(st(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return gt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : L).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = s.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : L;
      this._$Em = r;
      const l = n.fromAttribute(e, o.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, r = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Q)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: r, wrapped: o }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: n } = o, l = this[r];
        n !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
S.elementStyles = [], S.shadowRootOptions = { mode: "open" }, S[U("elementProperties")] = /* @__PURE__ */ new Map(), S[U("finalized")] = /* @__PURE__ */ new Map(), Ct?.({ ReactiveElement: S }), (W.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, ot = (i) => i, I = X.trustedTypes, nt = I ? I.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, ut = "$lit$", m = `lit$${Math.random().toFixed(9).slice(2)}$`, _t = "?" + m, Ot = `<${_t}>`, E = document, R = () => E.createComment(""), T = (i) => i === null || typeof i != "object" && typeof i != "function", Y = Array.isArray, Ut = (i) => Y(i) || typeof i?.[Symbol.iterator] == "function", K = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, at = /-->/g, lt = />/g, g = RegExp(`>|${K}(?:([^\\s"'>=/]+)(${K}*=${K}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ct = /'/g, dt = /"/g, $t = /^(?:script|style|textarea|title)$/i, Rt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), u = Rt(1), x = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ht = /* @__PURE__ */ new WeakMap(), w = E.createTreeWalker(E, 129);
function ft(i, t) {
  if (!Y(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return nt !== void 0 ? nt.createHTML(t) : t;
}
const Tt = (i, t) => {
  const e = i.length - 1, s = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = O;
  for (let l = 0; l < e; l++) {
    const a = i[l];
    let d, p, c = -1, $ = 0;
    for (; $ < a.length && (n.lastIndex = $, p = n.exec(a), p !== null); ) $ = n.lastIndex, n === O ? p[1] === "!--" ? n = at : p[1] !== void 0 ? n = lt : p[2] !== void 0 ? ($t.test(p[2]) && (r = RegExp("</" + p[2], "g")), n = g) : p[3] !== void 0 && (n = g) : n === g ? p[0] === ">" ? (n = r ?? O, c = -1) : p[1] === void 0 ? c = -2 : (c = n.lastIndex - p[2].length, d = p[1], n = p[3] === void 0 ? g : p[3] === '"' ? dt : ct) : n === dt || n === ct ? n = g : n === at || n === lt ? n = O : (n = g, r = void 0);
    const v = n === g && i[l + 1].startsWith("/>") ? " " : "";
    o += n === O ? a + Ot : c >= 0 ? (s.push(d), a.slice(0, c) + ut + a.slice(c) + m + v) : a + m + (c === -2 ? l : v);
  }
  return [ft(i, o + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class M {
  constructor({ strings: t, _$litType$: e }, s) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [d, p] = Tt(t, e);
    if (this.el = M.createElement(d, s), w.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (r = w.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const c of r.getAttributeNames()) if (c.endsWith(ut)) {
          const $ = p[n++], v = r.getAttribute(c).split(m), j = /([.?@])?(.*)/.exec($);
          a.push({ type: 1, index: o, name: j[2], strings: v, ctor: j[1] === "." ? Nt : j[1] === "?" ? Ht : j[1] === "@" ? Dt : J }), r.removeAttribute(c);
        } else c.startsWith(m) && (a.push({ type: 6, index: o }), r.removeAttribute(c));
        if ($t.test(r.tagName)) {
          const c = r.textContent.split(m), $ = c.length - 1;
          if ($ > 0) {
            r.textContent = I ? I.emptyScript : "";
            for (let v = 0; v < $; v++) r.append(c[v], R()), w.nextNode(), a.push({ type: 2, index: ++o });
            r.append(c[$], R());
          }
        }
      } else if (r.nodeType === 8) if (r.data === _t) a.push({ type: 2, index: o });
      else {
        let c = -1;
        for (; (c = r.data.indexOf(m, c + 1)) !== -1; ) a.push({ type: 7, index: o }), c += m.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = E.createElement("template");
    return s.innerHTML = t, s;
  }
}
function P(i, t, e = i, s) {
  if (t === x) return t;
  let r = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = T(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(i), r._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = r : e._$Cl = r), r !== void 0 && (t = P(i, r._$AS(i, t.values), r, s)), t;
}
class Mt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, r = (t?.creationScope ?? E).importNode(e, !0);
    w.currentNode = r;
    let o = w.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new H(o, o.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (d = new jt(o, this, t)), this._$AV.push(d), a = s[++l];
      }
      n !== a?.index && (o = w.nextNode(), n++);
    }
    return w.currentNode = E, r;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class H {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = P(this, t, e), T(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== x && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ut(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && T(this._$AH) ? this._$AA.nextSibling.data = t : this.T(E.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = M.createElement(ft(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const o = new Mt(r, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ht.get(t.strings);
    return e === void 0 && ht.set(t.strings, e = new M(t)), e;
  }
  k(t) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, r = 0;
    for (const o of t) r === e.length ? e.push(s = new H(this.O(R()), this.O(R()), this, this.options)) : s = e[r], s._$AI(o), r++;
    r < e.length && (this._$AR(s && s._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = ot(t).nextSibling;
      ot(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class J {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, r, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = P(this, t, e, 0), n = !T(t) || t !== this._$AH && t !== x, n && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = o[0], a = 0; a < o.length - 1; a++) d = P(this, l[s + a], e, a), d === x && (d = this._$AH[a]), n ||= !T(d) || d !== this._$AH[a], d === h ? t = h : t !== h && (t += (d ?? "") + o[a + 1]), this._$AH[a] = d;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Nt extends J {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Ht extends J {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Dt extends J {
  constructor(t, e, s, r, o) {
    super(t, e, s, r, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = P(this, t, e, 0) ?? h) === x) return;
    const s = this._$AH, r = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== h && (s === h || r);
    r && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class jt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    P(this, t);
  }
}
const Bt = X.litHtmlPolyfillSupport;
Bt?.(M, H), (X.litHtmlVersions ??= []).push("3.3.2");
const Lt = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = r = new H(t.insertBefore(R(), o), o, void 0, e ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = globalThis;
class f extends S {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Lt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return x;
  }
}
f._$litElement$ = !0, f.finalized = !0, tt.litElementHydrateSupport?.({ LitElement: f });
const It = tt.litElementPolyfillSupport;
It?.({ LitElement: f });
(tt.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = (i) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(i, t);
  }) : customElements.define(i, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = { attribute: !0, type: String, converter: L, reflect: !1, hasChanged: Q }, qt = (i = zt, t, e) => {
  const { kind: s, metadata: r } = e;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), o.set(e.name, i), s === "accessor") {
    const { name: n } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(n, a, i, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, i, l), l;
    } };
  }
  if (s === "setter") {
    const { name: n } = e;
    return function(l) {
      const a = this[n];
      t.call(this, l), this.requestUpdate(n, a, i, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function C(i) {
  return (t, e) => typeof e == "object" ? qt(i, t, e) : ((s, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, s), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(i) {
  return C({ ...i, state: !0, attribute: !1 });
}
const A = "/api/update_blocklist";
class Vt {
  constructor(t) {
    this.token = t;
  }
  async request(t, e = {}) {
    const s = await fetch(t, {
      ...e,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...e.headers ?? {}
      }
    });
    if (!s.ok) {
      const r = typeof s.text == "function" ? await s.text() : "";
      throw new Error(`${s.status} ${r}`);
    }
    if (s.status !== 204)
      return await s.json();
  }
  listBlocks() {
    return this.request(`${A}/blocks`);
  }
  addBlock(t, e) {
    return this.request(`${A}/blocks`, {
      method: "POST",
      body: JSON.stringify({ device_id: t, reason: e })
    });
  }
  removeBlock(t) {
    return this.request(`${A}/blocks/${encodeURIComponent(t)}`, {
      method: "DELETE"
    });
  }
  listCandidates() {
    return this.request(`${A}/candidates`);
  }
  getOptions() {
    return this.request(`${A}/options`);
  }
  scan(t) {
    return this.request(`${A}/scan`, {
      method: "POST",
      body: JSON.stringify(t ? { block_id: t } : {})
    });
  }
  resolveRediscovery(t, e, s) {
    return this.request(`${A}/rediscovery/resolve`, {
      method: "POST",
      body: JSON.stringify({
        orphan_block_id: t,
        candidate_device_id: s ?? null,
        action: e
      })
    });
  }
}
var Wt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, vt = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? Jt(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(t, e, r) : n(r)) || r);
  return s && r && Wt(t, e, r), r;
};
let z = class extends f {
  constructor() {
    super(...arguments), this.blocks = [];
  }
  render() {
    return this.blocks.length ? u`
      <table>
        <thead>
          <tr>
            <th>Device</th><th>Reason</th><th>Last known version</th>
            <th>Last scan</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this.blocks.map(
      (i) => u`
              <tr data-test="block-row">
                <td>${i.device_id}</td>
                <td>${i.reason || "—"}</td>
                <td>${i.last_known_version ?? "unknown"}</td>
                <td>${i.last_scan_at ?? "never"}</td>
                <td>${i.status}</td>
                <td>
                  <button
                    class="remove"
                    data-test="remove-btn"
                    @click=${() => this._emitRemove(i.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            `
    )}
        </tbody>
      </table>
    ` : u`<div class="empty">No blocks. Use "Add block" to create one.</div>`;
  }
  _emitRemove(i) {
    this.dispatchEvent(
      new CustomEvent("block-remove", {
        detail: { block_id: i },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
z.styles = N`
    :host { display: block; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--divider-color, #ccc); }
    .empty { padding: 16px; color: var(--secondary-text-color, #666); }
    button.remove { color: var(--error-color, #d33); }
  `;
vt([
  C({ attribute: !1 })
], z.prototype, "blocks", 2);
z = vt([
  D("blocks-list")
], z);
var Zt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, Z = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? Kt(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(t, e, r) : n(r)) || r);
  return s && r && Zt(t, e, r), r;
};
let k = class extends f {
  constructor() {
    super(...arguments), this.candidates = [], this._deviceId = "", this._reason = "";
  }
  render() {
    return u`
      <form @submit=${this._onSubmit}>
        <label>
          Device to block
          <select @change=${(i) => this._deviceId = i.target.value}>
            <option value="">— select —</option>
            ${this.candidates.map(
      (i) => u`<option value=${i.device_id}>${i.name} (${i.manufacturer ?? ""} ${i.model ?? ""})</option>`
    )}
          </select>
        </label>
        <label>
          Reason (optional)
          <textarea
            rows="3"
            @input=${(i) => this._reason = i.target.value}
          ></textarea>
        </label>
        <div class="actions">
          <button type="button" @click=${this._cancel}>Cancel</button>
          <button type="submit" ?disabled=${!this._deviceId}>Add block</button>
        </div>
      </form>
    `;
  }
  _onSubmit(i) {
    i.preventDefault(), this._deviceId && this.dispatchEvent(
      new CustomEvent("block-add", {
        detail: { device_id: this._deviceId, reason: this._reason },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _cancel() {
    this.dispatchEvent(new CustomEvent("cancel", { bubbles: !0, composed: !0 }));
  }
};
k.styles = N`
    :host { display: block; padding: 16px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    label { font-weight: 600; }
    select, textarea { padding: 8px; font: inherit; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; }
  `;
Z([
  C({ attribute: !1 })
], k.prototype, "candidates", 2);
Z([
  y()
], k.prototype, "_deviceId", 2);
Z([
  y()
], k.prototype, "_reason", 2);
k = Z([
  D("add-block-dialog")
], k);
var Ft = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, mt = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? Gt(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(t, e, r) : n(r)) || r);
  return s && r && Ft(t, e, r), r;
};
let q = class extends f {
  constructor() {
    super(...arguments), this.pending = [];
  }
  render() {
    return this.pending.length ? u`
      ${this.pending.map(
      (i) => u`
          <div class="item">
            <div>
              <strong>Suspected re-pair.</strong>
              Blocked device appears to have returned as a new device
              (matched by ${i.match_type}). Re-apply block?
            </div>
            <div class="actions">
              <button data-action="accept" @click=${() => this._emit(i, "accept")}>
                Re-apply to this device
              </button>
              <button data-action="decline" @click=${() => this._emit(i, "decline")}>
                Delete block
              </button>
              <button data-action="dismiss" @click=${() => this._emit(i, "dismiss")}>
                Remind me later
              </button>
            </div>
          </div>
        `
    )}
    ` : u``;
  }
  _emit(i, t) {
    this.dispatchEvent(
      new CustomEvent("resolve", {
        detail: {
          orphan_block_id: i.orphan_block_id,
          candidate_device_id: i.candidate_device_id,
          action: t
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
q.styles = N`
    :host { display: block; }
    .item {
      background: var(--warning-color, #ffcc80);
      color: var(--primary-text-color, #000);
      padding: 12px; margin-bottom: 8px; border-radius: 4px;
    }
    .actions { margin-top: 8px; display: flex; gap: 8px; }
  `;
mt([
  C({ attribute: !1 })
], q.prototype, "pending", 2);
q = mt([
  D("rediscovery-prompt")
], q);
var Qt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, yt = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? Xt(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(t, e, r) : n(r)) || r);
  return s && r && Qt(t, e, r), r;
};
let V = class extends f {
  constructor() {
    super(...arguments), this.options = null;
  }
  render() {
    return this.options ? u`
      <dl>
        <dt>Scan window start</dt>
        <dd>${this.options.scan_start_time}</dd>
        <dt>Max duration (minutes)</dt>
        <dd>${this.options.scan_max_duration_minutes}</dd>
        <dt>Per-device timeout (seconds)</dt>
        <dd>${this.options.per_device_timeout_seconds}</dd>
      </dl>
      <div class="hint">
        Edit these values in Settings → Devices &amp; Services → Update Blocklist → Configure.
      </div>
    ` : u`<div>Loading…</div>`;
  }
};
V.styles = N`
    :host { display: block; padding: 16px; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; }
    dt { font-weight: 600; }
    .hint { color: var(--secondary-text-color, #666); margin-top: 16px; }
  `;
yt([
  C({ attribute: !1 })
], V.prototype, "options", 2);
V = yt([
  D("settings-view")
], V);
var Yt = Object.defineProperty, te = Object.getOwnPropertyDescriptor, b = (i, t, e, s) => {
  for (var r = s > 1 ? void 0 : s ? te(t, e) : t, o = i.length - 1, n; o >= 0; o--)
    (n = i[o]) && (r = (s ? n(t, e, r) : n(r)) || r);
  return s && r && Yt(t, e, r), r;
};
let _ = class extends f {
  constructor() {
    super(...arguments), this._blocks = [], this._pending = [], this._candidates = [], this._options = null, this._showAdd = !1, this._error = null;
  }
  _api() {
    return new Vt(this.hass?.auth?.accessToken ?? "");
  }
  connectedCallback() {
    super.connectedCallback(), this._refresh();
  }
  async _refresh() {
    try {
      const [i, t] = await Promise.all([
        this._api().listBlocks(),
        this._api().getOptions()
      ]);
      this._blocks = i.blocks, this._pending = i.pending_rediscovery, this._options = t;
    } catch (i) {
      this._error = i.message;
    }
  }
  async _openAdd() {
    try {
      const { candidates: i } = await this._api().listCandidates();
      this._candidates = i, this._showAdd = !0;
    } catch (i) {
      this._error = i.message;
    }
  }
  async _onAdd(i) {
    try {
      await this._api().addBlock(i.detail.device_id, i.detail.reason), this._showAdd = !1, await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  async _onRemove(i) {
    try {
      await this._api().removeBlock(i.detail.block_id), await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  async _onResolve(i) {
    try {
      await this._api().resolveRediscovery(
        i.detail.orphan_block_id,
        i.detail.action,
        i.detail.candidate_device_id
      ), await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  render() {
    return u`
      <header>
        <h1>Update Blocklist</h1>
        <button class="primary" @click=${this._openAdd}>Add block</button>
      </header>
      ${this._error ? u`<div class="error">${this._error}</div>` : u``}

      <rediscovery-prompt
        .pending=${this._pending}
        @resolve=${this._onResolve}
      ></rediscovery-prompt>

      <blocks-list .blocks=${this._blocks} @block-remove=${this._onRemove}></blocks-list>

      <settings-view .options=${this._options}></settings-view>

      ${this._showAdd ? u`
            <div class="overlay" @click=${() => this._showAdd = !1}>
              <div class="dialog" @click=${(i) => i.stopPropagation()}>
                <add-block-dialog
                  .candidates=${this._candidates}
                  @block-add=${this._onAdd}
                  @cancel=${() => this._showAdd = !1}
                ></add-block-dialog>
              </div>
            </div>
          ` : u``}
    `;
  }
};
_.styles = N`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--primary-font-family, sans-serif);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0;
      font-size: 1.4em;
    }
    button.primary {
      background: var(--primary-color, #03a9f4);
      color: white;
      border: 0;
      padding: 8px 14px;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: var(--error-color, #d33);
      padding: 8px 0;
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: grid;
      place-items: center;
    }
    .dialog {
      background: var(--card-background-color, white);
      border-radius: 8px;
      min-width: 400px;
    }
  `;
b([
  C({ attribute: !1 })
], _.prototype, "hass", 2);
b([
  y()
], _.prototype, "_blocks", 2);
b([
  y()
], _.prototype, "_pending", 2);
b([
  y()
], _.prototype, "_candidates", 2);
b([
  y()
], _.prototype, "_options", 2);
b([
  y()
], _.prototype, "_showAdd", 2);
b([
  y()
], _.prototype, "_error", 2);
_ = b([
  D("update-blocklist-panel")
], _);
export {
  _ as UpdateBlocklistPanel
};
