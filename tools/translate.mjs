// Pre-translates a built board page to DE/FR/IT at build time, with the same tables the browser uses
// (public/js/i18n.js), so /de, /fr and /it are real pages for crawlers instead of English markup that a
// script rewrites. Mirrors i18n.js walk(): text nodes, placeholder / aria-label / alt / title, links to
// /en/... pages. Left to the browser, as there: bound values (dc-text, data-t-*), dc-for rows (templates)
// and translate="no" subtrees.
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = fs.readFileSync(new URL('../public/js/i18n.js', import.meta.url), 'utf8');

/** i18n.js's t() for one language, loaded in a sandbox. */
export function translator(lang) {
  const sandbox = {
    document: { documentElement: { lang, hasAttribute: () => false }, title: '' },
    navigator: { languages: [lang] },
    location: { search: `?lang=${lang}`, pathname: '/build', hash: '', replace() {}, assign() {} },
    localStorage: { getItem: () => null, setItem() {} },
    NodeFilter: {},
  };
  sandbox.window = sandbox;
  vm.runInNewContext(SRC, sandbox, { filename: 'i18n.js' });
  return sandbox.ZALS_I18N.t;
}

const unesc = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];

/** Translates the <body> of `html` (head and everything before <body> is returned untouched). */
export function translatePage(html, lang) {
  const t = translator(lang);
  const at = html.search(/<body[\s>]/i);
  const head = html.slice(0, at), body = html.slice(at);
  const stack = []; // open elements: [name, translate="no"]
  let skip = 0;     // depth inside a translate="no" subtree
  const miss = new Set();

  const out = body.replace(/<(script|style|template)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/g, tok => {
    if (tok[0] !== '<') {
      if (skip || !/[A-Za-z]/.test(tok)) return tok;
      const v = escText(t(unesc(tok)));
      if (v === tok) miss.add(unesc(tok).replace(/\s+/g, ' ').trim());
      return v;
    }
    if (/^<(script|style|template)\b/i.test(tok) || tok.startsWith('<!--')) return tok;
    if (tok[1] === '/') {
      const name = tok.slice(2, -1).trim().toLowerCase();
      while (stack.length) { const [n, no] = stack.pop(); if (no) skip--; if (n === name) break; }
      return tok;
    }
    const name = (tok.match(/^<([a-z][\w-]*)/i) || [])[1].toLowerCase();
    let tag = tok;
    if (!skip) {
      for (const a of ATTRS) {
        const m = tag.match(new RegExp(`\\s${a}="([^"]*)"`));
        if (m && !new RegExp(`\\sdata-t-${a}=`).test(tag)) tag = tag.replace(m[0], ` ${a}="${escAttr(t(unesc(m[1])))}"`);
      }
      if (name === 'a') tag = tag.replace(/\shref="((?:https:\/\/z-als\.ch)?\/)(en|de|fr|it)(?=[/#"])/, (m, pre) => ` href="${pre}${lang}`);
    }
    if (!VOID.has(name) && !tok.endsWith('/>')) {
      const no = /\stranslate="no"/.test(tok);
      stack.push([name, no]);
      if (no) skip++;
    }
    return tag;
  });
  return { html: head + out, untranslated: [...miss] };
}
