// ============================================================
// RSVP WIDGET — talks to the free Google Apps Script backend.
// Paste your deployed Web App URL below (see apps-script/README.md
// for how to get it).
// ============================================================
var RSVP_API_URL = "https://script.google.com/macros/s/AKfycbzNDFXekMiqCCgT3lMWXSWTPr0xeBFhzOdrEKxBwHVoqllKXlEH5ENK-0BVZBJEtrc/exec";

(function () {
  var allGuests = [];
  var currentParty = [];

  var searchInput = document.getElementById('rsvp-search-input');
  var resultsEl = document.getElementById('rsvp-results');
  var loadingEl = document.getElementById('rsvp-loading');
  var errorEl = document.getElementById('rsvp-error');
  var searchStage = document.getElementById('rsvp-search-stage');
  var partyStage = document.getElementById('rsvp-party-stage');
  var partyListEl = document.getElementById('rsvp-party-list');
  var doneStage = document.getElementById('rsvp-done-stage');
  var submitBtn = document.getElementById('rsvp-submit-btn');
  var submitStatus = document.getElementById('rsvp-submit-status');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function loadGuests() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    fetch(RSVP_API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function (data) {
        allGuests = data;
        loadingEl.style.display = 'none';
      })
      .catch(function (err) {
        loadingEl.style.display = 'none';
        showError('Kon nie die gastelys laai nie. Herlaai asseblief die bladsy.');
        console.error(err);
      });
  }

  function renderResults(query) {
    resultsEl.innerHTML = '';
    if (!query || query.length < 2) return;

    var q = query.toLowerCase();
    var matches = allGuests.filter(function (g) {
      return g.Name && g.Name.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);

    if (matches.length === 0) {
      var none = document.createElement('div');
      none.className = 'rsvp-result-empty';
      none.textContent = "Geen ooreenstemmende naam nie — probeer net jou voornaam of van.";
      resultsEl.appendChild(none);
      return;
    }

    matches.forEach(function (guest) {
      var item = document.createElement('div');
      item.className = 'rsvp-result-item';
      item.textContent = guest.Name;
      item.addEventListener('click', function () { selectGuest(guest); });
      resultsEl.appendChild(item);
    });
  }

  function selectGuest(guest) {
    currentParty = allGuests.filter(function (g) {
      return g.PartyID && g.PartyID === guest.PartyID;
    });
    if (currentParty.length === 0) currentParty = [guest];

    renderParty();
    searchStage.style.display = 'none';
    partyStage.style.display = 'block';
  }

  function renderParty() {
    partyListEl.innerHTML = '';
    currentParty.forEach(function (guest) {
      var row = document.createElement('div');
      row.className = 'rsvp-party-row';

      var nameEl = document.createElement('div');
      nameEl.className = 'rsvp-party-name';
      nameEl.textContent = guest.Name;

      var toggleWrap = document.createElement('div');
      toggleWrap.className = 'rsvp-toggle-group';

      var yesBtn = document.createElement('button');
      yesBtn.type = 'button';
      yesBtn.className = 'rsvp-toggle-btn';
      yesBtn.textContent = 'Eks in!';
      var noBtn = document.createElement('button');
      noBtn.type = 'button';
      noBtn.className = 'rsvp-toggle-btn';
      noBtn.textContent = 'Sal ongelukkig nie kan bywoon nie.';

      function paint() {
        [yesBtn, noBtn].forEach(function (btn) { btn.style.background = ''; btn.style.color = ''; });
        var active = guest._choice === 'Yes' ? yesBtn : (guest._choice === 'No' ? noBtn : null);
        if (active) {
          active.style.background = '#201E1A';
          active.style.color = '#FAF8F3';
        }
      }

      guest._choice = guest.Attending === 'Yes' ? 'Yes' : (guest.Attending === 'No' ? 'No' : null);
      paint();

      yesBtn.addEventListener('click', function () { guest._choice = 'Yes'; paint(); });
      noBtn.addEventListener('click', function () { guest._choice = 'No'; paint(); });

      toggleWrap.appendChild(yesBtn);
      toggleWrap.appendChild(noBtn);
      row.appendChild(nameEl);
      row.appendChild(toggleWrap);
      partyListEl.appendChild(row);
    });
  }

  function submitRsvp() {
    var unset = currentParty.filter(function (g) { return !g._choice; });
    if (unset.length > 0) {
      submitStatus.style.color = '#A34A3A';
      submitStatus.textContent = 'Merk asseblief bywoning vir die volgende mense.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Dien in...';
    submitStatus.textContent = '';

    var today = new Date().toISOString().slice(0, 10);
    var songRequest = document.getElementById('rsvp-song-input').value.trim();
    var message = document.getElementById('rsvp-message-input').value.trim();

    var updates = currentParty.map(function (guest) {
      // text/plain avoids a CORS preflight request, which Apps Script
      // web apps don't handle. The server still parses it as JSON.
      return fetch(RSVP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: guest.ID,
          attending: guest._choice,
          rsvpDate: today,
          songRequest: songRequest,
          message: message
        })
      });
    });

    Promise.all(updates)
      .then(function (responses) {
        return Promise.all(responses.map(function (r) { return r.json(); }));
      })
      .then(function (results) {
        var failed = results.some(function (r) { return !r.success; });
        if (failed) throw new Error('One or more updates failed');
        partyStage.style.display = 'none';
        doneStage.style.display = 'block';
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Dien RSVP in';
        submitStatus.style.color = '#A34A3A';
        submitStatus.textContent = 'Iets het verkeerd geloop — probeer asseblief weer.';
        console.error(err);
      });
  }

  searchInput.addEventListener('input', function (e) {
    renderResults(e.target.value.trim());
  });

  document.getElementById('rsvp-back-btn').addEventListener('click', function () {
    partyStage.style.display = 'none';
    searchStage.style.display = 'block';
    searchInput.value = '';
    resultsEl.innerHTML = '';
  });

  document.getElementById('rsvp-restart-btn').addEventListener('click', function () {
    doneStage.style.display = 'none';
    searchStage.style.display = 'block';
    searchInput.value = '';
    resultsEl.innerHTML = '';
    loadGuests();
  });

  submitBtn.addEventListener('click', submitRsvp);

  loadGuests();
})();
