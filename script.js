/* ============================================================
   VIVASVAN AI — PORTFOLIO  |  script.js
   FastAPI Integration Ready
   ============================================================

   FASTAPI ENDPOINTS THIS FILE EXPECTS:
   ┌─────────────────────────────────────────────────────────┐
   │  GET  /health          → { "status": "ok" }             │
   │  GET  /api/skills      → [ SkillObject, … ]             │
   │  GET  /api/projects    → [ ProjectObject, … ]           │
   │  POST /api/contact     → { "message": "…" }             │
   └─────────────────────────────────────────────────────────┘

   SkillObject:
   { name, icon, level (0-100), levelLabel }

   ProjectObject:
   { title, description, tags: [] }
   ============================================================ */

const API_BASE = 'http://localhost:3000';

/* ============================================================
   1. STARFIELD CANVAS
   ============================================================ */
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let stars = [], W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createStars(n = 220) {
  stars = Array.from({ length: n }, () => ({
    x:         Math.random() * W,
    y:         Math.random() * H,
    r:         Math.random() * 1.4 + 0.2,
    speed:     Math.random() * 0.25 + 0.04,
    opacity:   Math.random() * 0.6 + 0.3,
    twinkle:   Math.random() * 0.015 + 0.004,
    tDir:      1,
    color:     Math.random() > 0.85 ? '230, 57, 70' : '255, 255, 255'
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    // slow drift downward
    s.y += s.speed;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }

    // twinkle
    s.opacity += s.twinkle * s.tDir;
    if (s.opacity > 0.95 || s.opacity < 0.1) s.tDir *= -1;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.color}, ${s.opacity})`;
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

resizeCanvas();
createStars();
drawStars();
window.addEventListener('resize', () => { resizeCanvas(); createStars(); });

/* ============================================================
   2. TYPEWRITER EFFECT
   ============================================================ */
function typewriter(el, text, speed = 52) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  el.appendChild(cursor);
  let i = 0;
  function type() {
    if (i < text.length) {
      cursor.before(text[i++]);
      setTimeout(type, speed + Math.random() * 25);
    }
  }
  setTimeout(type, 900);   // slight delay after page load
}

typewriter(
  document.getElementById('typewriter'),
  'Chemical Engineer with a passion for coding and AI'
);

/* ============================================================
   3. NAVBAR — shrink on scroll
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ============================================================
   4. SCROLL REVEAL — Intersection Observer
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      // Animate skill bar fill once card is visible
      if (entry.target.classList.contains('skill-card')) {
        const fill = entry.target.querySelector('.skill-bar-fill');
        if (fill) fill.style.width = fill.dataset.level + '%';
      }
    });
  },
  { threshold: 0.14 }
);

// Observe all section headers
document.querySelectorAll('.section-header').forEach(el => revealObserver.observe(el));

/* ============================================================
   5. DEFAULT FALLBACK DATA
      (used when FastAPI server is not running)
   ============================================================ */
const DEFAULT_SKILLS = [
  { name: 'Python',        icon: '<i class="ph ph-code"></i>', level: 90, levelLabel: 'Proficient'   },
  { name: 'FastAPI',       icon: '<i class="ph ph-lightning"></i>', level: 85, levelLabel: 'Proficient'     },
  { name: 'Scikit-learn',  icon: '<i class="ph ph-graph"></i>', level: 80, levelLabel: 'Advanced' },
  { name: 'C',             icon: '<i class="ph ph-cpu"></i>', level: 60, levelLabel: 'Intermediate'     },
];

const DEFAULT_PROJECTS = [];   // Shows "coming soon" card

/* ============================================================
   6. RENDER — SKILLS
   ============================================================ */
function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';

  skills.forEach((skill, i) => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.style.transitionDelay = `${i * 0.08}s`;

    card.innerHTML = `
      <span class="skill-icon">${skill.icon ?? '💡'}</span>
      <div class="skill-name">${skill.name}</div>
      <div class="skill-level">${skill.levelLabel}</div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-level="${skill.level}"></div>
      </div>
    `;

    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

/* ============================================================
   7. RENDER — PROJECTS
   ============================================================ */
function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const note = document.getElementById('projects-note');
  grid.innerHTML = '';

  if (!projects || projects.length === 0) {
    note.style.display = 'flex';
    return;
  }

  note.style.display = 'none';

  projects.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.transitionDelay = `${i * 0.12}s`;

    const tags = (proj.tags ?? [])
      .map(t => `<span class="project-tag">${t}</span>`)
      .join('');

    card.innerHTML = `
      <div class="project-num">0${i + 1}</div>
      <div class="project-title">${proj.title}</div>
      <div class="project-desc">${proj.description}</div>
      <div class="project-tags">${tags}</div>
    `;

    grid.appendChild(card);
    revealObserver.observe(card);
  });
}

/* ============================================================
   8. FASTAPI — health check
   ============================================================ */
async function checkAPIStatus() {
  const dot    = document.getElementById('status-dot');
  const label  = document.getElementById('api-status');
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      dot.className   = 'status-dot online';
      label.textContent = 'online ✓';
      label.style.color = '#00FF88';
      return true;
    }
  } catch (_) { /* server offline */ }

  dot.className   = 'status-dot offline';
  label.textContent = 'offline';
  label.style.color = '#FF6B6B';
  return false;
}

/* ============================================================
   9. FASTAPI — fetch skills  (falls back to DEFAULT_SKILLS)
   ============================================================ */
async function loadSkills() {
  try {
    const res  = await fetch(`${API_BASE}/api/skills`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error('non-200');
    const data = await res.json();
    renderSkills(data);
  } catch (_) {
    renderSkills(DEFAULT_SKILLS);   // graceful fallback
  }
}

/* ============================================================
   10. FASTAPI — fetch projects  (falls back to DEFAULT_PROJECTS)
   ============================================================ */
async function loadProjects() {
  try {
    const res  = await fetch(`${API_BASE}/api/projects`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error('non-200');
    const data = await res.json();
    renderProjects(data);
  } catch (_) {
    renderProjects(DEFAULT_PROJECTS);   // graceful fallback
  }
}

/* ============================================================
   11. CONTACT FORM → POST /api/contact
   ============================================================ */
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form   = e.target;
  const btn    = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<span>Sending…</span>';

  const payload = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      status.className   = 'form-status success';
      status.textContent = '✓ Message sent! I\'ll get back to you soon.';
      form.reset();
    } else {
      throw new Error(`Server responded ${res.status}`);
    }
  } catch (err) {
    status.className   = 'form-status error';
    status.textContent = '✗ Couldn\'t send — is your FastAPI server running on port 8000?';
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<span>Send Message</span><span class="btn-arrow">→</span>';
    // Auto-hide status after 6 s
    setTimeout(() => { status.className = 'form-status'; }, 6000);
  }
});

/* ============================================================
   12. INTERACTIVE MOUSE TRACKING
   ============================================================ */
document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".skill-card, .project-card").forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

/* ============================================================
   13. INIT — kick everything off
   ============================================================ */
(async () => {
  await checkAPIStatus();
  await Promise.all([ loadSkills(), loadProjects() ]);
})();

/* ============================================================
   14. IFRAME SMOOTH SCROLL FIX
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ============================================================
   FASTAPI STARTER — copy-paste boilerplate for quick reference
   ============================================================

   Install:  pip install fastapi uvicorn

   main.py
   -------
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   from pydantic import BaseModel

   app = FastAPI()

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_methods=["*"],
       allow_headers=["*"],
   )

   @app.get("/health")
   def health(): return {"status": "ok"}

   @app.get("/api/skills")
   def get_skills():
       return [
           {"name": "Python",       "icon": "🐍", "level": 80, "levelLabel": "Proficient"},
           {"name": "FastAPI",      "icon": "⚡", "level": 65, "levelLabel": "Learning"},
           {"name": "Scikit-learn", "icon": "🤖", "level": 70, "levelLabel": "Intermediate"},
           {"name": "TensorFlow",   "icon": "🧠", "level": 60, "levelLabel": "Learning"},
       ]

   @app.get("/api/projects")
   def get_projects(): return []

   class ContactForm(BaseModel):
       name: str
       email: str
       message: str

   @app.post("/api/contact")
   def contact(form: ContactForm):
       print(f"New message from {form.name} <{form.email}>: {form.message}")
       return {"message": "received"}

   Run:  uvicorn main:app --reload
   ============================================================ */