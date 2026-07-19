/* ===== HAMBURGER NAV ===== */
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');

if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

/* ===== ACTIVE NAV STATE ===== */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link[data-page]').forEach(link => {
    if (link.dataset.page === page) link.classList.add('active');
  });
})();

/* ===== CONTACT FORM VALIDATION ===== */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'name', msg: 'Veuillez saisir votre nom.' },
      { id: 'company', msg: 'Veuillez saisir le nom de votre société.' },
      { id: 'email', msg: 'Veuillez saisir une adresse email valide.', type: 'email' },
      { id: 'pilier', msg: 'Veuillez sélectionner un pilier.' },
      { id: 'message', msg: 'Veuillez saisir votre message.' },
    ];

    fields.forEach(({ id, msg, type }) => {
      const el = document.getElementById(id);
      const err = document.getElementById(id + '-error');
      let ok = el.value.trim() !== '';
      if (ok && type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      el.classList.toggle('error', !ok);
      if (err) { err.textContent = msg; err.style.display = ok ? 'none' : 'block'; }
      if (!ok) valid = false;
    });

    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      const data = new FormData();
      data.append('name',    document.getElementById('name').value.trim());
      data.append('company', document.getElementById('company').value.trim());
      data.append('email',   document.getElementById('email').value.trim());
      data.append('pilier',  document.getElementById('pilier').value);
      data.append('message', document.getElementById('message').value.trim());

      fetch('send-mail.php', { method: 'POST', body: data })
        .then(function(res) { return res.json(); })
        .then(function(json) {
          if (json.ok) {
            form.style.display = 'none';
            document.getElementById('form-success').style.display = 'block';
          } else {
            btn.disabled = false;
            btn.textContent = 'Envoyer le message';
            alert('Une erreur est survenue. Veuillez réessayer.');
          }
        })
        .catch(function() {
          btn.disabled = false;
          btn.textContent = 'Envoyer le message';
          alert('Une erreur est survenue. Veuillez réessayer.');
        });
    }
  });

  // Clear error on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const err = document.getElementById(el.id + '-error');
      if (err) err.style.display = 'none';
    });
  });
}
