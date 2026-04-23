/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis, G = z.ShadowRoot && (z.ShadyCSS === void 0 || z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), st = /* @__PURE__ */ new WeakMap();
let ut = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (G && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = st.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && st.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const bt = (s) => new ut(typeof s == "string" ? s : s + "", void 0, Q), T = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, o) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[o + 1], s[0]);
  return new ut(e, s, Q);
}, yt = (s, t) => {
  if (G) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = z.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, it = G ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return bt(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: wt, defineProperty: xt, getOwnPropertyDescriptor: At, getOwnPropertyNames: Et, getOwnPropertySymbols: kt, getPrototypeOf: St } = Object, W = globalThis, rt = W.trustedTypes, Pt = rt ? rt.emptyScript : "", Ct = W.reactiveElementPolyfillSupport, U = (s, t) => s, I = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Pt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, X = (s, t) => !wt(s, t), ot = { attribute: !0, type: String, converter: I, reflect: !1, useDefault: !1, hasChanged: X };
Symbol.metadata ??= Symbol("metadata"), W.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ot) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && xt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: o } = At(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: r, set(n) {
      const l = r?.call(this);
      o?.call(this, n), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ot;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = St(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const e = this.properties, i = [...Et(e), ...kt(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(it(r));
    } else t !== void 0 && e.push(it(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return yt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : I).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : I;
      this._$Em = r;
      const l = n.fromAttribute(e, o.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? X)(o, e) || i.useDefault && i.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: o }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, o] of i) {
        const { wrapped: n } = o, l = this[r];
        n !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
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
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[U("elementProperties")] = /* @__PURE__ */ new Map(), k[U("finalized")] = /* @__PURE__ */ new Map(), Ct?.({ ReactiveElement: k }), (W.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, nt = (s) => s, L = Y.trustedTypes, at = L ? L.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, _t = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, vt = "?" + y, Ot = `<${vt}>`, A = document, D = () => A.createComment(""), M = (s) => s === null || typeof s != "object" && typeof s != "function", tt = Array.isArray, Rt = (s) => tt(s) || typeof s?.[Symbol.iterator] == "function", F = `[ 	
\f\r]`, R = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, lt = /-->/g, dt = />/g, w = RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ct = /'/g, ht = /"/g, $t = /^(?:script|style|textarea|title)$/i, Ut = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), c = Ut(1), S = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), pt = /* @__PURE__ */ new WeakMap(), x = A.createTreeWalker(A, 129);
function ft(s, t) {
  if (!tt(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return at !== void 0 ? at.createHTML(t) : t;
}
const Dt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = R;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let p, u, d = -1, f = 0;
    for (; f < a.length && (n.lastIndex = f, u = n.exec(a), u !== null); ) f = n.lastIndex, n === R ? u[1] === "!--" ? n = lt : u[1] !== void 0 ? n = dt : u[2] !== void 0 ? ($t.test(u[2]) && (r = RegExp("</" + u[2], "g")), n = w) : u[3] !== void 0 && (n = w) : n === w ? u[0] === ">" ? (n = r ?? R, d = -1) : u[1] === void 0 ? d = -2 : (d = n.lastIndex - u[2].length, p = u[1], n = u[3] === void 0 ? w : u[3] === '"' ? ht : ct) : n === ht || n === ct ? n = w : n === lt || n === dt ? n = R : (n = w, r = void 0);
    const g = n === w && s[l + 1].startsWith("/>") ? " " : "";
    o += n === R ? a + Ot : d >= 0 ? (i.push(p), a.slice(0, d) + _t + a.slice(d) + y + g) : a + y + (d === -2 ? l : g);
  }
  return [ft(s, o + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class N {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [p, u] = Dt(t, e);
    if (this.el = N.createElement(p, i), x.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = x.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(_t)) {
          const f = u[n++], g = r.getAttribute(d).split(y), j = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: o, name: j[2], strings: g, ctor: j[1] === "." ? Nt : j[1] === "?" ? Tt : j[1] === "@" ? Bt : J }), r.removeAttribute(d);
        } else d.startsWith(y) && (a.push({ type: 6, index: o }), r.removeAttribute(d));
        if ($t.test(r.tagName)) {
          const d = r.textContent.split(y), f = d.length - 1;
          if (f > 0) {
            r.textContent = L ? L.emptyScript : "";
            for (let g = 0; g < f; g++) r.append(d[g], D()), x.nextNode(), a.push({ type: 2, index: ++o });
            r.append(d[f], D());
          }
        }
      } else if (r.nodeType === 8) if (r.data === vt) a.push({ type: 2, index: o });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(y, d + 1)) !== -1; ) a.push({ type: 7, index: o }), d += y.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const i = A.createElement("template");
    return i.innerHTML = t, i;
  }
}
function P(s, t, e = s, i) {
  if (t === S) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const o = M(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = P(s, r._$AS(s, t.values), r, i)), t;
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
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? A).importNode(e, !0);
    x.currentNode = r;
    let o = x.nextNode(), n = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let p;
        a.type === 2 ? p = new B(o, o.nextSibling, this, t) : a.type === 1 ? p = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (p = new Ht(o, this, t)), this._$AV.push(p), a = i[++l];
      }
      n !== a?.index && (o = x.nextNode(), n++);
    }
    return x.currentNode = A, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = P(this, t, e), M(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Rt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && M(this._$AH) ? this._$AA.nextSibling.data = t : this.T(A.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = N.createElement(ft(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const o = new Mt(r, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = pt.get(t.strings);
    return e === void 0 && pt.set(t.strings, e = new N(t)), e;
  }
  k(t) {
    tt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const o of t) r === e.length ? e.push(i = new B(this.O(D()), this.O(D()), this, this.options)) : i = e[r], i._$AI(o), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = nt(t).nextSibling;
      nt(t).remove(), t = i;
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
  constructor(t, e, i, r, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(t, e = this, i, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = P(this, t, e, 0), n = !M(t) || t !== this._$AH && t !== S, n && (this._$AH = t);
    else {
      const l = t;
      let a, p;
      for (t = o[0], a = 0; a < o.length - 1; a++) p = P(this, l[i + a], e, a), p === S && (p = this._$AH[a]), n ||= !M(p) || p !== this._$AH[a], p === h ? t = h : t !== h && (t += (p ?? "") + o[a + 1]), this._$AH[a] = p;
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
class Tt extends J {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Bt extends J {
  constructor(t, e, i, r, o) {
    super(t, e, i, r, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = P(this, t, e, 0) ?? h) === S) return;
    const i = this._$AH, r = t === h && i !== h || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== h && (i === h || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ht {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    P(this, t);
  }
}
const jt = Y.litHtmlPolyfillSupport;
jt?.(N, B), (Y.litHtmlVersions ??= []).push("3.3.2");
const zt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = e?.renderBefore ?? null;
    i._$litPart$ = r = new B(t.insertBefore(D(), o), o, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis;
class m extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = zt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return S;
  }
}
m._$litElement$ = !0, m.finalized = !0, et.litElementHydrateSupport?.({ LitElement: m });
const It = et.litElementPolyfillSupport;
It?.({ LitElement: m });
(et.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const H = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lt = { attribute: !0, type: String, converter: I, reflect: !1, hasChanged: X }, Vt = (s = Lt, t, e) => {
  const { kind: i, metadata: r } = e;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), o.set(e.name, s), i === "accessor") {
    const { name: n } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(n, a, s, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, s, l), l;
    } };
  }
  if (i === "setter") {
    const { name: n } = e;
    return function(l) {
      const a = this[n];
      t.call(this, l), this.requestUpdate(n, a, s, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function E(s) {
  return (t, e) => typeof e == "object" ? Vt(s, t, e) : ((i, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, i), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function v(s) {
  return E({ ...s, state: !0, attribute: !1 });
}
const b = "/api/update_blocklist";
class qt {
  constructor(t) {
    this.token = t;
  }
  async request(t, e = {}) {
    const i = await fetch(t, {
      ...e,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...e.headers ?? {}
      }
    });
    if (!i.ok) {
      const r = await i.text().catch(() => "");
      throw new Error(`${i.status} ${r}`);
    }
    if (i.status !== 204)
      return await i.json();
  }
  listBlocks() {
    return this.request(`${b}/blocks`);
  }
  addBlock(t, e) {
    return this.request(`${b}/blocks`, {
      method: "POST",
      body: JSON.stringify({ device_id: t, reason: e })
    });
  }
  removeBlock(t) {
    return this.request(`${b}/blocks/${encodeURIComponent(t)}`, {
      method: "DELETE"
    });
  }
  listCandidates() {
    return this.request(`${b}/candidates`);
  }
  getOptions() {
    return this.request(`${b}/options`);
  }
  getInfo() {
    return this.request(`${b}/info`);
  }
  scan(t) {
    return this.request(`${b}/scan`, {
      method: "POST",
      body: JSON.stringify(t ? { block_id: t } : {})
    });
  }
  resolveRediscovery(t, e, i) {
    return this.request(`${b}/rediscovery/resolve`, {
      method: "POST",
      body: JSON.stringify({
        orphan_block_id: t,
        candidate_device_id: i ?? null,
        action: e
      })
    });
  }
}
function Wt(s) {
  try {
    const t = new URL(s).searchParams.get("v");
    return t && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}
const Jt = Wt(import.meta.url);
var Zt = Object.defineProperty, Kt = Object.getOwnPropertyDescriptor, Z = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Kt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Zt(t, e, r), r;
};
let C = class extends m {
  constructor() {
    super(...arguments), this.blocks = [], this._detailBlock = null, this._iconErrors = /* @__PURE__ */ new Set();
  }
  render() {
    return this.blocks.length ? c`
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Device</th><th>Reason</th>
            <th>Pinned version</th><th>Last known version</th>
            <th>Last scan</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this.blocks.map(
      (s) => c`
              <tr data-test="block-row">
                <td class="icon-cell" data-test="brand-icon-cell">
                  ${this._renderIcon(s)}
                </td>
                <td>
                  <span
                    class="device-link"
                    @click=${() => this._detailBlock = s}
                    title="Click for details"
                  >${this._deviceDisplayName(s)}</span>
                </td>
                <td class="reason">${s.reason || "—"}</td>
                <td>${s.installed_version ?? "unknown"}</td>
                <td>${s.last_known_version ?? "unknown"}</td>
                <td>${s.last_scan_at ?? "never"}</td>
                <td>${s.status}</td>
                <td>
                  <button
                    class="remove"
                    data-test="remove-btn"
                    @click=${() => this._emitRemove(s.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            `
    )}
        </tbody>
      </table>
      ${this._detailBlock ? this._renderDetail(this._detailBlock) : h}
    ` : c`<div class="empty">No blocks. Use "Add block" to create one.</div>`;
  }
  _renderIcon(s) {
    const t = s.integration_domain;
    return !t || this._iconErrors.has(s.id) ? c`<ha-icon icon="mdi:devices" data-test="brand-icon-fallback"></ha-icon>` : c`<img
      src="https://brands.home-assistant.io/_/${t}/icon.png"
      alt=${t}
      data-test="brand-icon-img"
      @error=${() => this._onIconError(s.id)}
    />`;
  }
  _onIconError(s) {
    this._iconErrors.has(s) || (this._iconErrors = /* @__PURE__ */ new Set([...this._iconErrors, s]));
  }
  _deviceDisplayName(s) {
    return s.fingerprint?.name || s.device_id;
  }
  _renderDetail(s) {
    const t = [
      ["Name", s.fingerprint?.name || "—"],
      ["Manufacturer", s.fingerprint?.manufacturer || "—"],
      ["Model", s.fingerprint?.model || "—"],
      ["Device ID", s.device_id],
      ["Status", s.status],
      ["Reason", s.reason || "—"],
      ["Pinned version", s.installed_version ?? "unknown"],
      ["Latest version seen", s.last_known_version ?? "unknown"],
      ["Last scan", s.last_scan_at ?? "never"],
      ["Created", s.created_at]
    ];
    return c`
      <div class="overlay" @click=${() => this._detailBlock = null}>
        <div class="detail-dialog" @click=${(e) => e.stopPropagation()}>
          <h3>${s.fingerprint?.name || s.device_id}</h3>
          ${t.map(
      ([e, i]) => c`
              <div class="detail-row">
                <span class="detail-label">${e}</span>
                <span class="detail-value">${i}</span>
              </div>
            `
    )}
          <div class="detail-actions">
            <button @click=${() => this._detailBlock = null}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
  _emitRemove(s) {
    this.dispatchEvent(
      new CustomEvent("block-remove", {
        detail: { block_id: s },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
C.styles = T`
    :host { display: block; }
    table { border-collapse: collapse; width: 100%; }
    th, td {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid var(--divider-color, #ccc);
      white-space: nowrap;
      vertical-align: top;
    }
    td.icon-cell {
      width: 32px;
      padding-right: 0;
    }
    td.icon-cell img,
    td.icon-cell ha-icon {
      width: 24px;
      height: 24px;
      display: block;
      --mdc-icon-size: 24px;
    }
    td.reason {
      white-space: normal;
      word-break: break-word;
      max-width: 320px;
    }
    .empty { padding: 16px; color: var(--secondary-text-color, #666); }
    button.remove { color: var(--error-color, #d33); }
    .device-link {
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      text-decoration: none;
    }
    .device-link:hover { text-decoration: underline; }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: grid;
      place-items: center;
      padding: 16px;
      box-sizing: border-box;
      z-index: 10;
    }
    .detail-dialog {
      background: var(--card-background-color, white);
      border-radius: 8px;
      padding: 20px;
      box-sizing: border-box;
      width: min(500px, calc(100vw - 32px));
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 32px);
      overflow: auto;
    }
    .detail-dialog h3 { margin: 0 0 12px; }
    .detail-row {
      display: flex;
      gap: 16px;
      padding: 6px 0;
      border-bottom: 1px solid var(--divider-color, #eee);
    }
    .detail-label {
      font-weight: 600;
      flex: 0 0 140px;
      color: var(--secondary-text-color, #666);
    }
    .detail-value { word-break: break-all; flex: 1; }
    .detail-actions { margin-top: 16px; display: flex; justify-content: flex-end; }
  `;
Z([
  E({ attribute: !1 })
], C.prototype, "blocks", 2);
Z([
  v()
], C.prototype, "_detailBlock", 2);
Z([
  v()
], C.prototype, "_iconErrors", 2);
C = Z([
  H("blocks-list")
], C);
var Ft = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, K = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Gt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Ft(t, e, r), r;
};
let O = class extends m {
  constructor() {
    super(...arguments), this.candidates = [], this._deviceId = "", this._reason = "";
  }
  render() {
    return c`
      <form @submit=${this._onSubmit}>
        <label>
          Device to block
          <select @change=${(s) => this._deviceId = s.target.value}>
            <option value="">— select —</option>
            ${[...this.candidates].sort((s, t) => (s.name ?? "").localeCompare(t.name ?? "")).map(
      (s) => c`<option value=${s.device_id}>${s.name} (${s.manufacturer ?? ""} ${s.model ?? ""})</option>`
    )}
          </select>
        </label>
        <label>
          Reason (optional)
          <textarea
            rows="3"
            @input=${(s) => this._reason = s.target.value}
          ></textarea>
        </label>
        <div class="actions">
          <button type="button" @click=${this._cancel}>Cancel</button>
          <button type="submit" ?disabled=${!this._deviceId}>Add block</button>
        </div>
      </form>
    `;
  }
  _onSubmit(s) {
    s.preventDefault(), this._deviceId && this.dispatchEvent(
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
O.styles = T`
    :host { display: block; padding: 16px; box-sizing: border-box; }
    form { display: flex; flex-direction: column; gap: 12px; }
    label { font-weight: 600; }
    select, textarea {
      padding: 8px;
      font: inherit;
      box-sizing: border-box;
      max-width: 100%;
      width: 100%;
    }
    .actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
  `;
K([
  E({ attribute: !1 })
], O.prototype, "candidates", 2);
K([
  v()
], O.prototype, "_deviceId", 2);
K([
  v()
], O.prototype, "_reason", 2);
O = K([
  H("add-block-dialog")
], O);
var Qt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, mt = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Xt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Qt(t, e, r), r;
};
let V = class extends m {
  constructor() {
    super(...arguments), this.pending = [];
  }
  render() {
    return this.pending.length ? c`
      ${this.pending.map(
      (s) => c`
          <div class="item">
            <div>
              <strong>Suspected re-pair.</strong>
              Blocked device appears to have returned as a new device
              (matched by ${s.match_type}). Re-apply block?
            </div>
            <div class="actions">
              <button data-action="accept" @click=${() => this._emit(s, "accept")}>
                Re-apply to this device
              </button>
              <button data-action="decline" @click=${() => this._emit(s, "decline")}>
                Delete block
              </button>
              <button data-action="dismiss" @click=${() => this._emit(s, "dismiss")}>
                Remind me later
              </button>
            </div>
          </div>
        `
    )}
    ` : c``;
  }
  _emit(s, t) {
    this.dispatchEvent(
      new CustomEvent("resolve", {
        detail: {
          orphan_block_id: s.orphan_block_id,
          candidate_device_id: s.candidate_device_id,
          action: t
        },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
V.styles = T`
    :host { display: block; }
    .item {
      background: var(--warning-color, #ffcc80);
      color: var(--primary-text-color, #000);
      padding: 12px; margin-bottom: 8px; border-radius: 4px;
    }
    .actions { margin-top: 8px; display: flex; gap: 8px; }
  `;
mt([
  E({ attribute: !1 })
], V.prototype, "pending", 2);
V = mt([
  H("rediscovery-prompt")
], V);
var Yt = Object.defineProperty, te = Object.getOwnPropertyDescriptor, gt = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? te(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Yt(t, e, r), r;
};
let q = class extends m {
  constructor() {
    super(...arguments), this.options = null;
  }
  render() {
    return this.options ? c`
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
    ` : c`<div>Loading…</div>`;
  }
};
q.styles = T`
    :host { display: block; padding: 16px; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; }
    dt { font-weight: 600; }
    .hint { color: var(--secondary-text-color, #666); margin-top: 16px; }
  `;
gt([
  E({ attribute: !1 })
], q.prototype, "options", 2);
q = gt([
  H("settings-view")
], q);
var ee = Object.defineProperty, se = Object.getOwnPropertyDescriptor, $ = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? se(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && ee(t, e, r), r;
};
let _ = class extends m {
  constructor() {
    super(...arguments), this._backendVersion = null, this.loadedVersion = Jt, this._blocks = [], this._pending = [], this._candidates = [], this._options = null, this._showAdd = !1, this._error = null, this._version = null;
  }
  _api() {
    return new qt(this.hass?.auth?.accessToken ?? "");
  }
  connectedCallback() {
    super.connectedCallback(), this._refresh();
  }
  async _refresh() {
    try {
      const [s, t, e] = await Promise.all([
        this._api().listBlocks(),
        this._api().getOptions(),
        this._api().getInfo()
      ]);
      this._blocks = s.blocks, this._pending = s.pending_rediscovery, this._options = t, this._version = e.version || null, this._backendVersion = e.version || null;
    } catch (s) {
      this._error = s.message;
    }
  }
  _isVersionMismatch() {
    return this.loadedVersion !== null && this._backendVersion !== null && this.loadedVersion !== this._backendVersion;
  }
  _reload() {
    window.location.reload();
  }
  async _openAdd() {
    try {
      const { candidates: s } = await this._api().listCandidates();
      this._candidates = s, this._showAdd = !0;
    } catch (s) {
      this._error = s.message;
    }
  }
  async _onAdd(s) {
    try {
      await this._api().addBlock(s.detail.device_id, s.detail.reason), this._showAdd = !1, await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  async _onRemove(s) {
    try {
      await this._api().removeBlock(s.detail.block_id), await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  async _onResolve(s) {
    try {
      await this._api().resolveRediscovery(
        s.detail.orphan_block_id,
        s.detail.action,
        s.detail.candidate_device_id
      ), await this._refresh();
    } catch (t) {
      this._error = t.message;
    }
  }
  render() {
    return c`
      <header>
        <div class="title-group">
          <h1>Update Blocklist</h1>
          ${this._version ? c`<span class="version" data-test="panel-version">v${this._version}</span>` : c``}
        </div>
        <button class="primary" @click=${this._openAdd}>Add block</button>
      </header>
      ${this._isVersionMismatch() ? c`
            <div class="reload-banner" data-test="reload-banner" role="alert">
              <span>
                A new version of Update Blocklist is available
                (v${this._backendVersion}). Reload to update.
              </span>
              <button @click=${this._reload}>Reload</button>
            </div>
          ` : c``}
      ${this._error ? c`<div class="error">${this._error}</div>` : c``}

      <rediscovery-prompt
        .pending=${this._pending}
        @resolve=${this._onResolve}
      ></rediscovery-prompt>

      <blocks-list .blocks=${this._blocks} @block-remove=${this._onRemove}></blocks-list>

      <settings-view .options=${this._options}></settings-view>

      ${this._showAdd ? c`
            <div class="overlay" @click=${() => this._showAdd = !1}>
              <div class="dialog" @click=${(s) => s.stopPropagation()}>
                <add-block-dialog
                  .candidates=${this._candidates}
                  @block-add=${this._onAdd}
                  @cancel=${() => this._showAdd = !1}
                ></add-block-dialog>
              </div>
            </div>
          ` : c``}
    `;
  }
};
_.styles = T`
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
    .title-group {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .version {
      font-size: 0.8em;
      color: var(--secondary-text-color, #666);
      font-variant-numeric: tabular-nums;
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
      padding: 16px;
      box-sizing: border-box;
      z-index: 10;
    }
    .dialog {
      background: var(--card-background-color, white);
      border-radius: 8px;
      box-sizing: border-box;
      width: min(400px, calc(100vw - 32px));
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 32px);
      overflow: auto;
    }
    .reload-banner {
      background: var(--warning-color, #f6a609);
      color: #111;
      padding: 10px 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .reload-banner button {
      background: #111;
      color: #fff;
      border: 0;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
  `;
$([
  E({ attribute: !1 })
], _.prototype, "hass", 2);
$([
  v()
], _.prototype, "_backendVersion", 2);
$([
  E({ attribute: !1 })
], _.prototype, "loadedVersion", 2);
$([
  v()
], _.prototype, "_blocks", 2);
$([
  v()
], _.prototype, "_pending", 2);
$([
  v()
], _.prototype, "_candidates", 2);
$([
  v()
], _.prototype, "_options", 2);
$([
  v()
], _.prototype, "_showAdd", 2);
$([
  v()
], _.prototype, "_error", 2);
$([
  v()
], _.prototype, "_version", 2);
_ = $([
  H("update-blocklist-panel")
], _);
export {
  _ as UpdateBlocklistPanel
};
