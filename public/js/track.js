/* Events for Google Tag Manager. window.zalsTrack(name, params) pushes {event: name, ...params} to
   dataLayer; GTM maps them to GA4. Never pass names, phone numbers, emails or free text.

   Links are tracked here for every page, restored ones included: tel:, mailto: and WhatsApp. The booking
   wizard and the contact form call zalsTrack themselves. */
(function () {
  window.dataLayer = window.dataLayer || [];
  window.zalsTrack = function (name, params) {
    var e = { event: name };
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) e[k] = params[k];
    window.dataLayer.push(e);
  };

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var where = { link_location: location.pathname };
    if (/^tel:/i.test(h)) window.zalsTrack('phone_click', where);
    else if (/^mailto:/i.test(h)) window.zalsTrack('email_click', where);
    else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)) window.zalsTrack('whatsapp_click', where);
    else if (a.getAttribute('data-ask-ai')) window.zalsTrack('ask_ai', { method: a.getAttribute('data-ask-ai'), link_location: location.pathname });
  }, true);
})();
