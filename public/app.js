(function () {
  'use strict';

  var API_URL = '/api/locales';

  var loadingEl = document.getElementById('loading');
  var errorEl   = document.getElementById('error');
  var emptyEl   = document.getElementById('empty');
  var tableEl   = document.getElementById('locales-table');
  var tbodyEl   = document.getElementById('locales-tbody');

  function hide(el) { el.classList.add('hidden'); }
  function show(el) { el.classList.remove('hidden'); }

  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function flagClass(code) {
    var parts = code.split('-');
    return 'fi fi-' + (parts.length > 1 ? parts[1] : parts[0]).toLowerCase() + ' flag';
  }

  function renderRows(locales) {
    tbodyEl.innerHTML = '';
    for (var i = 0; i < locales.length; i++) {
      var l = locales[i];
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="' + flagClass(l.code) + '"></span></td>' +
        '<td class="code">'  + esc(l.code)     + '</td>' +
        '<td>'               + esc(l.language) + '</td>' +
        '<td>'               + esc(l.country)  + '</td>' +
        '<td>'               + esc(l.currency) + '</td>' +
        '<td>'               + esc(l.tld)      + '</td>';
      tbodyEl.appendChild(tr);
    }
  }

  function loadLocales() {
    show(loadingEl);
    hide(errorEl);
    hide(emptyEl);
    hide(tableEl);

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Server returned ' + res.status);
        return res.json();
      })
      .then(function (locales) {
        hide(loadingEl);

        if (!Array.isArray(locales) || locales.length === 0) {
          show(emptyEl);
          return;
        }

        renderRows(locales);
        show(tableEl);
      })
      .catch(function (err) {
        hide(loadingEl);
        errorEl.textContent = 'Ошибка загрузки: ' + err.message;
        show(errorEl);
      });
  }

  loadLocales();
})();
