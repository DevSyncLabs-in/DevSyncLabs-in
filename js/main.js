/* ============================================
   DEVSYNC LABS — Main JavaScript
   Animations, Blog, Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initParticles();
  initScrollReveal();
  initTypewriter();
  initCounters();
  initBlog();
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    toggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

/* --- Hero Floating Particles --- */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

/* --- Scroll Reveal (Intersection Observer) --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* --- Typewriter Effect --- */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const words = ['IoT Solutions', 'Cloud Infrastructure', 'AI & Automation', 'DevOps Pipelines', 'Embedded Systems', 'Custom Software'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const current = words[wordIndex];

    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

/* --- Animated Counters --- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, 16);
}

/* --- Blog Section --- */
let allBlogs = [];
let activeCategory = 'All';
let searchQuery = '';

async function initBlog() {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  try {
    const response = await fetch('data/blogs.json');
    allBlogs = await response.json();
    renderBlogs();
    initBlogFilters();
    initBlogSearch();
  } catch (err) {
    console.error('Failed to load blog data:', err);
    blogGrid.innerHTML = `
      <div class="blog-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Unable to load blog posts. Please try again later.</p>
      </div>
    `;
  }
}

function renderBlogs() {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  let filtered = allBlogs;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(b => b.category === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    blogGrid.innerHTML = `
      <div class="blog-empty">
        <i class="fas fa-search"></i>
        <p>No blog posts found matching your criteria.</p>
      </div>
    `;
    return;
  }

  blogGrid.innerHTML = filtered.map((blog, i) => `
    <article class="blog-card reveal reveal-delay-${(i % 3) + 1}" onclick="openBlogModal(${blog.id})" id="blog-card-${blog.id}">
      <div class="blog-card-image">
        <img src="${blog.image}" alt="${blog.title}" loading="lazy">
        <span class="blog-card-category">${blog.category}</span>
      </div>
      <div class="blog-card-body">
        <h3>${blog.title}</h3>
        <p>${blog.excerpt}</p>
        <div class="blog-card-meta">
          <span class="author">
            <i class="fas fa-user-circle"></i>
            ${blog.author}
          </span>
          <span class="read-time">
            <i class="fas fa-clock"></i>
            ${blog.readTime}
          </span>
        </div>
      </div>
    </article>
  `).join('');

  // Re-observe new elements for scroll reveal
  initScrollReveal();
}

function initBlogFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderBlogs();
    });
  });
}

function initBlogSearch() {
  const input = document.getElementById('blog-search-input');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      renderBlogs();
    }, 300);
  });
}

/* --- Blog Modal --- */
function openBlogModal(id) {
  const blog = allBlogs.find(b => b.id === id);
  if (!blog) return;

  const modal = document.getElementById('blog-modal');
  if (!modal) return;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  document.getElementById('modal-image').src = blog.image;
  document.getElementById('modal-image').alt = blog.title;
  document.getElementById('modal-category').textContent = blog.category;
  document.getElementById('modal-title').textContent = blog.title;
  document.getElementById('modal-author').innerHTML = `<i class="fas fa-user-circle"></i> ${blog.author}`;
  document.getElementById('modal-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatDate(blog.date)}`;
  document.getElementById('modal-readtime').innerHTML = `<i class="fas fa-clock"></i> ${blog.readTime}`;
  document.getElementById('modal-article').innerHTML = blog.content;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
  const modal = document.getElementById('blog-modal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeBlogModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBlogModal();
  }
});

/* --- Login Page Functions --- */
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.querySelector('.password-toggle');

  // Password visibility toggle
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
    });
  }

  // Form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    // Simulated login (GitHub Pages = static, no real auth)
    const submitBtn = loginForm.querySelector('.login-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitBtn.disabled = true;

    setTimeout(() => {
      showToast('Welcome back! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }, 1500);
  });
}

function showToast(message, type) {
  // Remove existing toasts
  document.querySelectorAll('.login-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `login-toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Auto-init login page if present
document.addEventListener('DOMContentLoaded', initLoginPage);
