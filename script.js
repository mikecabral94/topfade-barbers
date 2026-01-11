// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

// Set minimum date for booking to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// Booking Form Submission
const bookingForm = document.getElementById('bookingForm');
const confirmModal = document.getElementById('confirmModal');

if (bookingForm && confirmModal) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData);

    // Add booking metadata
    data.id = Date.now();
    data.status = 'pending';
    data.createdAt = new Date().toISOString();

    // Save to localStorage
    const bookings = JSON.parse(localStorage.getItem('topfade_bookings') || '[]');
    bookings.push(data);
    localStorage.setItem('topfade_bookings', JSON.stringify(bookings));

    console.log('Booking saved:', data);

    // Show confirmation modal
    confirmModal.classList.add('active');

    // Reset form
    bookingForm.reset();
  });

  // Close Modal
  window.closeModal = function() {
    confirmModal.classList.remove('active');
  };

  // Close modal when clicking outside
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      closeModal();
    }
  });
}

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    } else {
      navbar.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    }
  });
}

// Smooth scroll for anchor links (exclude admin login button)
document.querySelectorAll('a[href^="#"]:not(#adminLoginBtn)').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Admin Login Modal
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const adminPassword = document.getElementById('adminPassword');

if (adminLoginBtn && adminLoginModal) {
  const ADMIN_PASSWORD = 'topfade2026';

  // Open login modal
  adminLoginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    adminLoginModal.classList.add('active');
    if (adminPassword) adminPassword.focus();
  });

  // Handle form submission
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const password = adminPassword ? adminPassword.value : '';

      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('topfade_admin_logged_in', 'true');
        if (loginError) loginError.classList.remove('show');
        window.location.href = 'admin.html';
      } else {
        if (loginError) loginError.classList.add('show');
        if (adminPassword) adminPassword.value = '';
      }

      return false;
    });
  }

  // Close modal function
  window.closeLoginModal = function() {
    adminLoginModal.classList.remove('active');
    if (loginError) loginError.classList.remove('show');
    if (adminPassword) adminPassword.value = '';
  };

  // Close on backdrop click
  adminLoginModal.addEventListener('click', function(e) {
    if (e.target === adminLoginModal) {
      window.closeLoginModal();
    }
  });
}
