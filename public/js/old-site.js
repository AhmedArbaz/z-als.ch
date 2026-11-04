/* Behaviour for the pages harvested from the retired Next.js site (public/<locale>/..., see
   tools/harvest/): the header's Services/Fleet panels and phone menu, the WhatsApp button and the
   contact form. It mirrors the old React components (SiteHeader, WhatsAppFab, ContactForm) and sets
   the same attributes they set, so the harvested CSS (public/assets/old/site.css) styles them as before.
   The markup it toggles was captured in place with `hidden` by harvest.mjs. */
(() => {
  const header = document.getElementById('site-header');
  if (!header) return;
  const panels = [...header.querySelectorAll('[data-panel]')];
  const buttons = [...header.querySelectorAll('[data-open-panel]')];
  const overlay = document.querySelector('[data-overlay]');
  const fab = document.querySelector('[data-fab]');
  let open = null, pinned = false, scrolled = false, timer = 0, prevOverflow = '';

  const paint = () => {
    header.setAttribute('data-scrolled', String(scrolled));
    header.setAttribute('data-solid', String(scrolled || open !== null));
    for (const b of buttons) b.setAttribute('aria-expanded', String(b.dataset.openPanel === open));
    for (const p of panels) p.hidden = p.dataset.panel !== open;
  };
  const setOpen = v => { if (v !== open) pinned = false; open = v; paint(); };
  const hold = name => { clearTimeout(timer); setOpen(name); };
  const release = () => { clearTimeout(timer); timer = setTimeout(() => setOpen(null), 140); };

  // Panels: hover to open, a 140 ms grace period once the pointer leaves the header, click to toggle.
  // The panels sit inside the header, so crossing the bar between the nav and a panel keeps it open.
  header.addEventListener('mouseleave', release);
  const nav = header.querySelector('nav');
  if (nav) for (const a of nav.querySelectorAll('a')) a.addEventListener('mouseenter', release);
  for (const b of buttons) {
    b.addEventListener('mouseenter', () => hold(b.dataset.openPanel));
    // A click on a panel the hover just opened (or a touch tap, whose emulated mouseenter opens it first)
    // pins it open, however long the visitor took to click; the next click closes it. Keyboard (detail 0) toggles.
    b.addEventListener('click', e => {
      const k = b.dataset.openPanel;
      if (open === k && !pinned && e.detail > 0) { pinned = true; return; }
      setOpen(open === k ? null : k);
      pinned = open === k;
    });
  }
  for (const p of panels) {
    p.addEventListener('mouseenter', () => clearTimeout(timer));
    p.addEventListener('mouseleave', release);
  }

  // Phone menu: the page behind it must not scroll.
  const setOverlay = on => {
    if (!overlay || overlay.hidden === !on) return;
    if (on) { prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = prevOverflow || '';
    overlay.hidden = !on;
  };
  header.querySelector('[data-menu]')?.addEventListener('click', () => setOverlay(true));
  overlay?.querySelector('[data-close]')?.addEventListener('click', () => setOverlay(false));
  overlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOverlay(false)));

  const onScroll = () => {
    scrolled = window.scrollY > 24;
    if (fab) fab.hidden = !(window.scrollY > 200);
    paint();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) setOverlay(false); else setOpen(null); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') { setOpen(null); setOverlay(false); } });
  document.addEventListener('pointerdown', e => { if (!header.contains(e.target)) setOpen(null); });
  onScroll();

  // Contact form: checked here, then emailed to dispatch through /api/contact (server.mjs), Reply-To the
  // visitor. If that fails, the same text is offered as a prefilled WhatsApp message. Every visible text is
  // a <template data-state> in the page, so each locale carries its own.
  const form = document.querySelector('form[data-eyebrow]');
  if (!form) return;
  const live = form.querySelector('[aria-live]');
  const button = form.querySelector('button[type=submit]');
  const state = k => form.querySelector(`template[data-state="${k}"]`).innerHTML;
  const phone = (document.querySelector('a[href^="tel:"]')?.getAttribute('href') || 'tel:+41762720909').replace(/\D/g, '');
  const field = n => form.elements.namedItem(n);
  const val = n => (field(n) ? field(n).value.trim() : '');
  // The old enquirySchema's check: zod 4's email pattern.
  const EMAIL = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
  const RULES = {
    name: v => v && v.length <= 120,
    email: v => EMAIL.test(v) && v.length <= 254,
    phone: v => v.length <= 32,
    message: v => v && v.length <= 2000
  };
  const label = el => el.closest('label').querySelector('span').textContent.trim();
  form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));
  form.addEventListener('change', e => e.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (button.disabled) return;
    const bad = Object.keys(RULES).filter(n => !RULES[n](val(n))).map(field);
    if (!field('consent').checked) bad.push(field('consent'));
    for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
    if (bad.length) {
      for (const el of bad) el.setAttribute('aria-invalid', 'true');
      live.innerHTML = state('invalid');
      bad[0].focus();
      return;
    }
    const lines = [form.dataset.eyebrow];
    for (const n of ['name', 'email', 'phone', 'subject', 'message']) if (val(n)) lines.push(`${label(field(n))}: ${val(n)}`);
    const href = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
    button.disabled = true;
    live.innerHTML = state('sending');
    fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: val('name'), email: val('email'), phone: val('phone'), subject: val('subject'), message: val('message'),
        lang: document.documentElement.lang, zals_hp: val('zals_hp')
      })
    }).then(r => {
      if (!r.ok) throw new Error(String(r.status));
      live.innerHTML = state('sent');
      form.reset();
      if (window.zalsTrack) window.zalsTrack('contact_submit', { result: 'sent', link_location: location.pathname });
    }).catch(() => {
      if (window.zalsTrack) window.zalsTrack('contact_submit', { result: 'error', link_location: location.pathname });
      live.innerHTML = state('error').replace('{{href}}', href.replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
    }).finally(() => { button.disabled = false; });
  });
})();
