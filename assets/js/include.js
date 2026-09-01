// Loads header/footer partials via fetch and marks the active nav link.
// Requires being served over http(s) (fetch is blocked on file://).
// Temporary V1-front mechanism — meant to transpose to server-side
// includes (EJS/Handlebars) once the backend lands.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-include]').forEach(async (el) => {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path);
      el.outerHTML = await res.text();
    } catch (err) {
      console.error(`include failed for ${path}`, err);
    }

    const page = document.body.dataset.page;
    if (page) {
      document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => {
        link.classList.add('active');
      });
    }
  });
});
