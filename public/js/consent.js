/* Cookie banner for Google Consent Mode v2. Plain JS: it runs on the boards, the restored pages and the
   404, none of which share a framework. The defaults ("denied") are set by the inline script that
   tools/seo.mjs puts in every <head>; this file asks the visitor and sends the answer to Google.

   Choice: localStorage "zals-consent" = {a: true|false, t: ms}, kept 12 months. Accepting grants
   analytics_storage only: the site runs no advertising, so ad_* stays denied. */
(function () {
  var KEY = 'zals-consent', YEAR = 31536e6;
  var TEXT = {
    en: { h: 'Help us improve the site', p: 'With your consent we collect visit statistics so we can make the website better. No advertising, and nothing is sold.', yes: 'Accept', no: 'Decline', more: 'Privacy notice', again: 'Cookie settings', label: 'Cookie consent' },
    de: { h: 'Helfen Sie uns, die Website zu verbessern', p: 'Mit Ihrer Einwilligung erfassen wir Besuchsstatistiken, um die Website zu verbessern. Keine Werbung, kein Verkauf von Daten.', yes: 'Akzeptieren', no: 'Ablehnen', more: 'Datenschutz', again: 'Cookie-Einstellungen', label: 'Cookie-Einwilligung' },
    fr: { h: 'Aidez-nous à améliorer le site', p: 'Avec votre accord, nous recueillons des statistiques de visite pour améliorer le site. Aucune publicité, aucune donnée vendue.', yes: 'Accepter', no: 'Refuser', more: 'Confidentialité', again: 'Réglages des cookies', label: 'Consentement aux cookies' },
    it: { h: 'Aiutaci a migliorare il sito', p: 'Con il tuo consenso raccogliamo statistiche sulle visite per migliorare il sito. Nessuna pubblicità, nessun dato venduto.', yes: 'Accetta', no: 'Rifiuta', more: 'Privacy', again: 'Impostazioni cookie', label: 'Consenso ai cookie' }
  };
  var box, again;

  function lang() { var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return TEXT[l] ? l : 'en'; }
  function read() { try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.t > Date.now() - YEAR ? v : null; } catch (e) { return null; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify({ a: a, t: Date.now() })); } catch (e) {} }
  function push() { (window.dataLayer = window.dataLayer || []).push(arguments); }

  /* Withdrawing consent also removes the analytics cookies Google already set (_ga, _ga_<id>, _gid) on this host and its parents. */
  function clearGa() {
    var parts = location.hostname.split('.'), domains = ['', location.hostname];
    for (var i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_gcl_)/.test(n)) domains.forEach(function (d) { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : ''); });
    });
  }

  function decide(a) {
    if (!a) clearGa();
    save(a);
    push('consent', 'update', { analytics_storage: a ? 'granted' : 'denied' });
    (window.dataLayer = window.dataLayer || []).push({ event: a ? 'consent_granted' : 'consent_declined' });
    close();
  }

  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text) e.textContent = text; return e; }
  var BTN = 'appearance:none;cursor:pointer;min-height:44px;padding:0 22px;border-radius:12px;font:600 13px/1 Manrope,system-ui,sans-serif;letter-spacing:.02em;border:1px solid #46659F;';

  function fill() {
    var t = TEXT[lang()];
    box.setAttribute('aria-label', t.label);
    box.replaceChildren();
    var copy = el('div', 'flex:1 1 320px;min-width:0');
    var small = window.matchMedia && window.matchMedia('(max-width:480px)').matches; /* a phone keeps the text, not the heading */
    copy.append(el('strong', 'display:' + (small ? 'none' : 'block') + ';font-size:14px;margin-bottom:4px', t.h), el('span', 'font-size:13px;line-height:1.55;color:rgba(255,255,255,.78)', t.p + ' '));
    var more = el('a', 'color:#fff;font-size:13px;text-decoration:underline;text-underline-offset:3px', t.more);
    more.href = '/legal#privacy';
    copy.lastChild.append(more);
    var row = el('div', 'display:flex;gap:10px;flex:0 0 auto;flex-wrap:wrap');
    var no = el('button', BTN + 'background:transparent;color:#fff', t.no), yes = el('button', BTN + 'background:#46659F;color:#fff', t.yes);
    no.type = yes.type = 'button';
    no.onclick = function () { decide(false); }; yes.onclick = function () { decide(true); };
    row.append(no, yes);
    box.append(copy, row);
  }

  function open() {
    if (!document.body) return;
    if (!box) {
      box = el('div', 'position:fixed;left:12px;right:12px;bottom:12px;z-index:80;max-width:900px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:14px 24px;padding:16px 20px;background:#0A1730;color:#fff;border:1px solid rgba(125,155,212,.34);border-radius:16px;box-shadow:0 24px 60px rgba(1,5,11,.5);font-family:Manrope,system-ui,sans-serif');
      box.setAttribute('role', 'region');
      new MutationObserver(function () { if (box && box.isConnected) fill(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
    fill();
    document.body.appendChild(box);
  }
  function close() { if (box && box.parentNode) box.parentNode.removeChild(box); showAgain(); }

  /* A small, quiet way back to the choice: in the page footer when there is one. */
  function showAgain() {
    if (again && again.isConnected) { again.textContent = TEXT[lang()].again; return; }
    var host = document.querySelector('footer') || document.body;
    if (!host) return;
    again = el('button', 'appearance:none;background:none;border:0;padding:6px 0;color:inherit;opacity:.85;font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer', TEXT[lang()].again);
    again.type = 'button';
    again.setAttribute('data-consent-open', '');
    again.onclick = open;
    host.appendChild(again);
  }

  window.zalsConsent = { open: open, state: function () { var v = read(); return v ? (v.a ? 'granted' : 'denied') : 'unset'; } };

  function start() { if (read()) showAgain(); else open(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
