// ============================================================
//  LANDGASTHOF OSTERMÜNCHEN — shared.js
// ============================================================

// Mobile nav toggle
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
  // close on outside click
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
})();

// Active nav link highlight
(function() {
  const links = document.querySelectorAll('.main-nav a');
  const path  = window.location.pathname.replace(/\/$/, '') || '/index';
  links.forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/index';
    if (path.endsWith(href)) a.classList.add('active');
  });
})();

// Content loaded from data.js — merge into page
window.applyContent = function(data) {
  // Öffnungszeiten
  if (data.hours) {
    const el = document.getElementById('hours-data');
    if (el) el.innerHTML = renderHours(data.hours);
  }
  // Tageskarte
  if (data.menu) {
    const el = document.getElementById('menu-data');
    if (el) el.innerHTML = renderMenu(data.menu);
  }
  // Aktuelles
  if (data.news) {
    const el = document.getElementById('news-data');
    if (el) el.innerHTML = renderNews(data.news);
  }
  // Willkommen text
  if (data.welcome) {
    const el = document.getElementById('welcome-text');
    if (el) el.textContent = data.welcome;
  }
};

function renderHours(hours) {
  return hours.map(h => `
    <div class="hours-card">
      <h3>${h.label}</h3>
      <div class="day">${h.days}</div>
      <div class="time">${h.time}</div>
      ${h.note ? `<div class="note">${h.note}</div>` : ''}
    </div>`).join('');
}

function renderMenu(items) {
  return items.map(item => `
    <div class="dish-card">
      <div>
        <div class="dish-name">${item.name}</div>
        ${item.desc ? `<div class="dish-desc">${item.desc}</div>` : ''}
      </div>
      <div class="dish-price">${item.price}</div>
    </div>`).join('');
}

function renderNews(items) {
  return items.map(n => `
    <div class="news-card">
      <div class="news-date">${n.date}</div>
      <h3>${n.title}</h3>
      <p>${n.text}</p>
      ${n.img ? `<img class="news-img" src="${n.img}" alt="${n.title}" loading="lazy">` : ''}
    </div>`).join('');
}
