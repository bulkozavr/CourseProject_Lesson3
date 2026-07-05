(function () {
  'use strict';

  const API_URL = '/api/locales';

  const $ = function (id) { return document.getElementById(id); };

  const loadingEl  = $('loading');
  const errorEl    = $('error');
  const emptyEl    = $('empty');
  const wrapperEl  = $('table-wrapper');
  const tbodyEl    = $('locales-tbody');

  function show(element) {
    element.classList.remove('hidden');
  }

  function hide(element) {
    element.classList.add('hidden');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderTable(locales) {
    tbodyEl.innerHTML = '';

    for (const loc of locales) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHTML(loc.code) + '</td>' +
        '<td>' + escapeHTML(loc.language) + '</td>' +
        '<td>' + escapeHTML(loc.country) + '</td>' +
        '<td>' + escapeHTML(loc.currency) + '</td>' +
        '<td>' + escapeHTML(loc.tld) + '</td>' +
        '<td>' + loc.flag + '</td>';
      tbodyEl.appendChild(tr);
    }
  }

  async function loadLocales() {
    show(loadingEl);
    hide(errorEl);
    hide(emptyEl);
    hide(wrapperEl);

    try {
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error('Server returned ' + res.status);
      }

      const locales = await res.json();

      hide(loadingEl);

      if (!Array.isArray(locales) || locales.length === 0) {
        show(emptyEl);
        return;
      }

      renderTable(locales);
      show(wrapperEl);
    } catch (err) {
      hide(loadingEl);
      errorEl.textContent = 'Failed to load locales. ' + err.message;
      show(errorEl);
    }
  }

  loadLocales();
})();
