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
      const name    = document.getElementById('name').value.trim();
      const company = document.getElementById('company').value.trim();
      const email   = document.getElementById('email').value.trim();
      const pilier  = document.getElementById('pilier').value;
      const message = document.getElementById('message').value.trim();

      const subject = encodeURIComponent('Contact EIC³ — ' + pilier + ' — ' + company);
      const body    = encodeURIComponent(
        'Nom : ' + name + '\n' +
        'Société : ' + company + '\n' +
        'Email : ' + email + '\n' +
        'Pilier : ' + pilier + '\n\n' +
        'Message :\n' + message
      );

      window.location.href = 'mailto:vincent.deguio@eic3.fr?subject=' + subject + '&body=' + body;

      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
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
