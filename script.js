// Mobile navigation toggle
(function initMobileNav() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  
  if (!toggle || !mobileNav) return;
  
  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    mobileNav.setAttribute('aria-hidden', isExpanded);
  });
  
  // Close mobile nav when clicking on links
  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
  
  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
})();

// Smooth scroll for in-page anchors
document.addEventListener('click', (e) => {
  const target = e.target.closest('a[href^="#"]');
  if (!target) return;
  const href = target.getAttribute('href');
  if (href.length > 1) {
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Waitlist form handling
(function initWaitlist() {
  const form = document.getElementById('wl-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const note = document.getElementById('wl-note');

  // Restore email/shop if previously entered
  try {
    const cached = JSON.parse(localStorage.getItem('pawpoint_waitlist') || 'null');
    if (cached) {
      if (cached.email) form.elements.email.value = cached.email;
      if (cached.shop) form.elements.shop.value = cached.shop;
      if (cached.team) form.elements.team.value = cached.team;
      if (cached.current) form.elements.current.value = cached.current;
    }
  } catch (_) {}

  form.addEventListener('input', () => {
    try {
      const payload = {
        email: form.elements.email.value.trim(),
        shop: form.elements.shop.value.trim(),
        team: form.elements.team.value,
        current: form.elements.current.value.trim(),
        ts: Date.now(),
      };
      localStorage.setItem('pawpoint_waitlist', JSON.stringify(payload));
    } catch (_) {}
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements.email.value.trim();
    const shop = form.elements.shop.value.trim();

    // Simple validation
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk || !shop) {
      showNote('Please enter a valid work email and shop name.', true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding…';

    // For hypothesis testing, we just store locally and optionally POST to a webhook.
    const entry = {
      email,
      shop,
      team: form.elements.team.value,
      current: form.elements.current.value.trim(),
      source: 'landing',
      ts: new Date().toISOString(),
      ua: navigator.userAgent,
    };

    try {
      // Keep a rolling log locally for quick export
      const key = 'pawpoint_waitlist_submissions';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));

      // Optional: send to webhook (disabled by default for GitHub Pages)
      // await fetch('https://example.com/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });

      form.reset();
      showNote('You’re on the list! We’ll email you when invites open.');
      submitBtn.textContent = 'Joined ✅';
    } catch (err) {
      console.error(err);
      showNote('Something went wrong. Please try again later.', true);
      submitBtn.textContent = 'Join waitlist';
      submitBtn.disabled = false;
      return;
    }

    setTimeout(() => {
      submitBtn.textContent = 'Join waitlist';
      submitBtn.disabled = false;
    }, 1800);

    function showNote(message, isError = false) {
      if (!note) return;
      note.textContent = message;
      note.style.color = isError ? 'var(--danger)' : 'var(--text-muted)';
    }
  });
})();

// Pricing toggle
(function initPricingToggle() {
  const monthly = { amount: '$30', period: '/month', sub: 'or <strong>$300 /year</strong> (save $60)' };
  const yearly = { amount: '$300', period: '/year', sub: '<strong>Equivalent to $25 /month</strong>' };

  const priceAmount = document.getElementById('price-amount');
  const pricePeriod = document.getElementById('price-period');
  const priceSub = document.getElementById('price-sub');
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  if (!priceAmount || !pricePeriod || !priceSub || !toggleBtns.length) return;

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      const mode = btn.getAttribute('data-billing');
      const p = mode === 'yearly' ? yearly : monthly;
      priceAmount.textContent = p.amount;
      pricePeriod.textContent = p.period;
      priceSub.innerHTML = p.sub;
    });
  });
})();

// Animated booking notifications
(function initBookingNotifications() {
  const notificationCard = document.getElementById('booking-notification');
  const bookingContent = document.getElementById('booking-content');
  
  if (!notificationCard || !bookingContent) return;

  // Sample booking data
  const bookings = [
    { pet: 'Fluffy', service: 'Full Groom', time: 'Tomorrow 2:00 PM' },
    { pet: 'Max', service: 'Nail Trim', time: 'Today 4:30 PM' },
    { pet: 'Bella', service: 'Bath & Brush', time: 'Friday 10:00 AM' },
    { pet: 'Charlie', service: 'Full Groom', time: 'Monday 1:00 PM' },
    { pet: 'Luna', service: 'Teeth Cleaning', time: 'Wednesday 3:15 PM' },
    { pet: 'Rocky', service: 'Bath & Brush', time: 'Thursday 11:30 AM' },
    { pet: 'Milo', service: 'Nail Trim', time: 'Saturday 2:45 PM' },
    { pet: 'Sophie', service: 'Full Groom', time: 'Tuesday 9:00 AM' }
  ];

  let currentIndex = 0;
  let isAnimating = false;
  let animationTimeout = null;
  let nextUpdateTimeout = null;

  function updateBooking() {
    if (isAnimating) return;
    
    isAnimating = true;
    const nextIndex = (currentIndex + 1) % bookings.length;
    const nextBooking = bookings[nextIndex];
    
    // Clear any existing timeouts
    if (animationTimeout) clearTimeout(animationTimeout);
    if (nextUpdateTimeout) clearTimeout(nextUpdateTimeout);
    
    // Add exit animation
    notificationCard.classList.add('exiting');
    
    animationTimeout = setTimeout(() => {
      // Update content
      const strongEl = bookingContent.querySelector('strong');
      const spanEl = bookingContent.querySelector('span');
      
      if (strongEl && spanEl) {
        strongEl.textContent = `${nextBooking.pet} - ${nextBooking.service}`;
        spanEl.textContent = nextBooking.time;
      }
      
      // Remove exit animation and add entrance animation
      notificationCard.classList.remove('exiting');
      notificationCard.classList.add('entering');
      
      // Clean up animation classes after entrance animation completes
      animationTimeout = setTimeout(() => {
        notificationCard.classList.remove('entering');
        isAnimating = false;
        currentIndex = nextIndex;
      }, 600);
    }, 400);
  }

  function scheduleNextUpdate() {
    const delay = 4000 + Math.random() * 2000; // 4-6 seconds
    nextUpdateTimeout = setTimeout(() => {
      updateBooking();
      scheduleNextUpdate();
    }, delay);
  }

  // Start the animation cycle
  // First update after 3 seconds, then every 4-6 seconds
  setTimeout(() => {
    updateBooking();
    scheduleNextUpdate();
  }, 3000);

  // Add hover pause functionality
  let isHovered = false;
  let hoverResumeTimeout = null;
  
  notificationCard.addEventListener('mouseenter', () => {
    isHovered = true;
    if (hoverResumeTimeout) {
      clearTimeout(hoverResumeTimeout);
      hoverResumeTimeout = null;
    }
  });
  
  notificationCard.addEventListener('mouseleave', () => {
    isHovered = false;
    // Resume animation after a short delay
    hoverResumeTimeout = setTimeout(() => {
      if (!isHovered && !isAnimating) {
        scheduleNextUpdate();
      }
    }, 1000);
  });
})();


