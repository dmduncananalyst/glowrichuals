
(function () {
  'use strict';

  const BROWN = '#3A241D';

  function countryListFrom(value) {
    const text = Array.isArray(value) ? value.join(' ') : String(value || '');
    const found = [];
    [
      ['New Zealand', /new\s*zealand/i],
      ['Fiji', /fiji/i],
      ['Bali', /bali/i]
    ].forEach(([name, pattern]) => {
      if (pattern.test(text) && !found.includes(name)) found.push(name);
    });
    return found;
  }

  function collectCountries(payload) {
    let countries = [];

    const visit = (value) => {
      if (value == null) return;
      if (typeof value === 'string' || Array.isArray(value)) {
        countries = countries.concat(countryListFrom(value));
        return;
      }
      if (typeof value === 'object') {
        Object.values(value).forEach(visit);
      }
    };

    visit(payload);
    return [...new Set(countries)];
  }

  function formatCountries(countries) {
    if (countries.length === 0) return 'the selected retreat';
    if (countries.length === 1) return `the ${countries[0]} Retreat`;
    if (countries.length === 2) return `the ${countries[0]} and ${countries[1]} Retreats`;
    return `the ${countries.slice(0, -1).join(', ')}, and ${countries[countries.length - 1]} Retreats`;
  }

  function showConfirmation(countries) {
    document.querySelectorAll('.hubspot-form-wrap.hubspot-waitlist').forEach((wrap) => {
      if (wrap.dataset.confirmationShown === 'true') return;
      wrap.dataset.confirmationShown = 'true';

      const frame = wrap.querySelector('.hs-form-frame');
      if (frame) frame.style.display = 'none';

      const existing = wrap.querySelector('.gr-waitlist-confirmation');
      if (existing) existing.remove();

      const box = document.createElement('div');
      box.className = 'gr-waitlist-confirmation';
      box.style.color = BROWN;
      box.style.textAlign = 'left';
      box.innerHTML =
        `<h3 style="color:${BROWN};margin:0 0 1rem;font-family:Georgia,serif;font-size:clamp(2.1rem,4vw,3rem);font-weight:400;line-height:1.08;">Thank you!</h3>` +
        `<p style="color:${BROWN};margin:0;font-size:1.05rem;line-height:1.7;">You are now on the waitlist for ${formatCountries(countries)}.</p>`;

      wrap.appendChild(box);
    });
  }

  // HubSpot legacy embed callbacks.
  window.addEventListener('message', function (event) {
    const data = event && event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'hsFormCallback' && data.eventName === 'onFormSubmitted') {
      const countries = collectCountries(data);
      showConfirmation(countries);
    }

    // Newer HubSpot form event payloads.
    if (
      data.type === 'hsFormCallback' &&
      (data.eventName === 'onFormSubmit' || data.eventName === 'onFormSubmitted')
    ) {
      const countries = collectCountries(data.data || data);
      if (data.eventName === 'onFormSubmitted') showConfirmation(countries);
    }
  });

  // HubSpot v4 global browser event support, when available.
  window.addEventListener('hs-form-event:on-submission:success', function (event) {
    const countries = collectCountries(event && event.detail ? event.detail : event);
    showConfirmation(countries);
  });
})();
