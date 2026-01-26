(function () {
  function init() {
    var form = document.getElementById('ice-updates-form');
    var msg = document.getElementById('ice-updates-msg');
    if (!form || !msg) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('#ice-updates-submit');
      var name = (form.querySelector('[name="name"]') || {}).value;
      var company = (form.querySelector('[name="company"]') || {}).value;
      var phone = (form.querySelector('[name="phone"]') || {}).value;
      if (!name || !company || !phone) {
        msg.style.display = 'block';
        msg.textContent = 'Please fill Name, Company, and Phone.';
        return;
      }
      if (btn) btn.disabled = true;
      fetch('/api/ice-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, company: company, phone: phone })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          msg.style.display = 'block';
          if (data && data.ok) {
            msg.textContent = 'Thanks! You\'re signed up.';
            form.reset();
          } else {
            msg.textContent = (data && data.error) || 'Something went wrong.';
          }
        })
        .catch(function () {
          msg.style.display = 'block';
          msg.textContent = 'Run the local server (see README) to save sign-ups.';
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
