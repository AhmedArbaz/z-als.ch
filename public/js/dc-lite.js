/* dc-lite: a ~150-line stand-in for the Claude Design runtime.
 *
 * The design boards in /design are "dc" documents: HTML with {{ bindings }},
 * <sc-if>/<sc-for> blocks and a `class Component extends DCLogic` script. The
 * real runtime renders them through React + Babel loaded from unpkg (~3 MB per
 * visit). tools/build.mjs compiles the markup to plain HTML instead, and this
 * file binds it back to the unchanged component classes:
 *
 *   data-component="Name"   instance root; data-props holds static props
 *   data-t-<attr>="…{{x}}…" attribute template, re-evaluated on every render
 *   <dc-text data-k="x">    text binding (a DOM node value replaces children)
 *   <dc-if data-if="x">     shown when x is truthy
 *   <dc-for data-each="xs" data-as="x"><template>…</template></dc-for>
 *   data-on-<event>="fn"    handler looked up in the owner's renderVals()
 *
 * Bound text, text-like attributes and createElement strings pass through
 * public/js/i18n.js (ZALS_I18N.t); it translates the static markup itself.
 */
(function () {
  'use strict';

  const registry = {};
  const mounted = [];
  const T = s => (window.ZALS_I18N ? window.ZALS_I18N.t(s) : s);
  const TEXT_ATTRS = { placeholder: 1, 'aria-label': 1, alt: 1, title: 1 };
  const pending = new Set();
  let flushQueued = false;

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(update) {
      const patch = typeof update === 'function' ? update(this.state) : update;
      if (!patch) return;
      this.state = Object.assign({}, this.state, patch);
      pending.add(this);
      if (!flushQueued) {
        flushQueued = true;
        queueMicrotask(() => { flushQueued = false; const all = [...pending]; pending.clear(); all.forEach(render); });
      }
    }
  }

  // Enough of React.createElement for components that build a styled leaf node.
  const React = {
    createElement(tag, props, ...children) {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(props || {})) {
        if (k === 'style') Object.assign(el.style, v);
        else if (k !== 'key') el.setAttribute(k, v);
      }
      children.flat().forEach(c => el.append(c instanceof Node ? c : T(String(c))));
      return el;
    }
  };

  const lookup = (path, vals, scope) => {
    const parts = path.split('.');
    let v = scope && parts[0] in scope ? scope : vals;
    for (const p of parts) { if (v == null) return undefined; v = v[p]; }
    return v;
  };
  const fill = (tpl, vals, scope) =>
    tpl.replace(/\{\{\s*([\w.$]+)\s*\}\}/g, (_, p) => { const v = lookup(p, vals, scope); return v == null ? '' : String(v); });

  const ownerOf = el => el.closest('[data-component]');
  const scopeOf = el => { for (let n = el; n; n = n.parentElement) if (n.__scope) return n.__scope; return null; };

  // Every bound node under `root` that belongs to `inst` (nested components own their own).
  function collect(root, inst) {
    const out = [];
    const nodes = root.matches && root.matches('[data-component]') ? [root, ...root.querySelectorAll('*')] : root.querySelectorAll('*');
    for (const el of nodes) {
      const owner = ownerOf(el);
      if (owner && owner.__dc !== inst) continue;
      for (const a of [...el.attributes]) {
        if (a.name.startsWith('data-t-')) out.push({ kind: 'attr', el, attr: a.name.slice(7), tpl: a.value });
        if (a.name === 'data-on-mouseenter' || a.name === 'data-on-mouseleave') {
          const type = a.name.slice(8);
          if (!el.__hooked) el.__hooked = {};
          if (!el.__hooked[type]) { el.__hooked[type] = true; el.addEventListener(type, e => fire(el, type, e)); }
        }
      }
      if (el.tagName === 'DC-TEXT') out.push({ kind: 'text', el, key: el.dataset.k });
      else if (el.tagName === 'DC-IF') out.push({ kind: 'if', el, key: el.dataset.if });
      else if (el.tagName === 'DC-FOR') out.push({ kind: 'for', el, key: el.dataset.each, as: el.dataset.as, tpl: el.querySelector(':scope > template') });
    }
    return out;
  }

  function apply(b, vals, scope, inst) {
    if (b.kind === 'attr') {
      const v = TEXT_ATTRS[b.attr] ? T(fill(b.tpl, vals, scope)) : fill(b.tpl, vals, scope);
      if (b.attr === 'value') { if (b.el.value !== v) b.el.value = v; }
      else if (b.el.getAttribute(b.attr) !== v) b.el.setAttribute(b.attr, v);
    } else if (b.kind === 'text') {
      const v = lookup(b.key, vals, scope);
      // Like a React key: an identical node is kept, so its entry animation doesn't replay.
      if (v instanceof Node) { if (!(b.el.firstChild && b.el.firstChild.isEqualNode(v))) b.el.replaceChildren(v); }
      else { const s = v == null ? '' : T(String(v)); if (b.el.textContent !== s) b.el.textContent = s; }
    } else if (b.kind === 'if') {
      b.el.hidden = !lookup(b.key, vals, scope);
    } else if (b.kind === 'for') {
      const items = lookup(b.key, vals, scope) || [];
      b.el.querySelectorAll(':scope > :not(template)').forEach(n => n.remove());
      for (const item of items) {
        const frag = b.tpl.content.cloneNode(true);
        const itemScope = Object.assign({}, scope, { [b.as]: item });
        const kids = [...frag.children];
        kids.forEach(k => { k.__scope = itemScope; });
        b.el.append(frag);
        for (const k of kids) {
          for (const a of k.attributes) if (a.name.startsWith('data-t-')) apply({ kind: 'attr', el: k, attr: a.name.slice(7), tpl: a.value }, vals, itemScope, inst);
          collect(k, inst).forEach(x => apply(x, vals, itemScope, inst));
        }
      }
    }
  }

  function render(inst) {
    inst.vals = inst.renderVals ? inst.renderVals() : {};
    inst.bindings.forEach(b => apply(b, inst.vals, null, inst));
  }

  function fire(el, type, e) {
    const owner = ownerOf(el);
    const inst = owner && owner.__dc;
    if (!inst) return;
    const fn = lookup(el.getAttribute('data-on-' + type), inst.vals, scopeOf(el));
    if (typeof fn === 'function') fn(e);
  }

  // React semantics: onChange fires per keystroke, onFocus is focusin.
  const DELEGATED = { click: 'click', input: 'change', change: 'change', focusin: 'focus', submit: 'submit' };
  function delegate() {
    for (const [domType, name] of Object.entries(DELEGATED)) {
      document.addEventListener(domType, e => {
        const el = e.target.closest && e.target.closest('[data-on-' + name + ']');
        if (!el) return;
        // An <input type=date> emits both input and change; handle it once.
        if (name === 'change' && domType === 'change' && el.matches('input:not([type=date]):not([type=time]), textarea')) return;
        fire(el, name, e);
      });
    }
  }

  function mount() {
    if (window.ZALS_I18N) window.ZALS_I18N.walk(document);
    const roots = [...document.querySelectorAll('[data-component]')];
    const insts = roots.map(root => {
      const Cls = registry[root.dataset.component];
      if (!Cls) { console.error('dc-lite: no component', root.dataset.component); return null; }
      const inst = new Cls(JSON.parse(root.dataset.props || '{}'));
      root.__dc = inst;
      inst.root = root;
      return inst;
    }).filter(Boolean);
    insts.forEach(inst => { inst.bindings = collect(inst.root, inst); });
    insts.forEach(render);
    delegate();
    insts.forEach(inst => inst.componentDidMount && inst.componentDidMount());
    mounted.push(...insts);
  }

  window.DCLogic = DCLogic;
  window.React = React;
  // refresh(): re-render every component, e.g. after a language switch.
  window.DC = { register: (name, Cls) => { registry[name] = Cls; }, mount, refresh: () => mounted.forEach(render) };
})();
