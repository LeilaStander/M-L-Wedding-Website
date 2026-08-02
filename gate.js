// ============================================================
// PASSWORD GATE — simple front-door lock for the site.
//
// This is NOT strong security (anyone who views the page source
// can find the password), but it keeps the site out of Google
// search results in practice, and stops anyone without the link
// AND the password from browsing your guest details, RSVP,
// or bank details.
//
// Set your password below, then send it out along with the site
// link on your invitations.
// ============================================================
var GATE_PASSWORD = "Stander/2027";
var GATE_STORAGE_KEY = "marli-liam-gate-unlocked";

(function () {

  function init() {
    var gate = document.getElementById('password-gate');
    var input = document.getElementById('gate-password-input');
    var btn = document.getElementById('gate-submit-btn');
    var errorEl = document.getElementById('gate-error');

    function unlock() {
      localStorage.setItem(GATE_STORAGE_KEY, 'true');
      gate.style.display = 'none';
      var main = document.querySelector('main');
      if (main) main.style.display = '';
    }

    function tryUnlock() {
      if (input.value.trim().toLowerCase() === GATE_PASSWORD.toLowerCase()) {
        unlock();
      } else {
        errorEl.style.display = 'block';
        input.value = '';
        input.focus();
      }
    }

    var alreadyUnlocked = false;
    try {
      alreadyUnlocked = localStorage.getItem(GATE_STORAGE_KEY) === 'true';
    } catch (e) {
      // localStorage unavailable (private browsing etc) — just show the gate
    }

    if (alreadyUnlocked) {
      unlock();
    }

    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }

  // Wait for the full page (including <main>, which appears further down
  // in the HTML than this script tag) to exist before running — otherwise
  // an already-unlocked visitor's <main> reveal silently fails and the
  // page renders blank.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
