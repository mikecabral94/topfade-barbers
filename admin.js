// Admin Authentication
const ADMIN_PASSWORD = 'topfade2026';
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('password');
const navbar = document.querySelector('.navbar');
const adminMain = document.querySelector('.admin-main');

// Check login status on page load
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('topfade_admin_logged_in');

  if (isLoggedIn === 'true') {
    // User is logged in - show dashboard
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (navbar) navbar.classList.remove('hidden');
    if (adminMain) adminMain.classList.remove('hidden');
    loadBookings();
  } else {
    // User not logged in - show login form
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (navbar) navbar.classList.add('hidden');
    if (adminMain) adminMain.classList.add('hidden');
    if (passwordInput) passwordInput.focus();
  }
}

// Handle login form submission
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const password = passwordInput ? passwordInput.value : '';

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('topfade_admin_logged_in', 'true');
      if (loginError) loginError.classList.remove('show');
      checkAuth();
    } else {
      if (loginError) loginError.classList.add('show');
      if (passwordInput) passwordInput.value = '';
    }
  });
}

// Handle logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('topfade_admin_logged_in');
    checkAuth();
  });
}

// Check auth on page load
checkAuth();

// Service names mapping
const serviceNames = {
  haircut: 'Haircut - €15',
  skinfade: 'Skin Fade - €18',
  beard: 'Beard Trim - €10',
  combo: 'Haircut + Beard - €22',
  kids: 'Kids Cut - €12',
  shave: 'Hot Towel Shave - €20'
};

// Service names without prices (for messages)
const serviceNamesSimple = {
  haircut: 'Haircut',
  skinfade: 'Skin Fade',
  beard: 'Beard Trim',
  combo: 'Haircut + Beard',
  kids: 'Kids Cut',
  shave: 'Hot Towel Shave'
};

// Store last confirmed booking for message
let lastConfirmedBooking = null;

// Current filter
let currentFilter = 'all';
let selectedBookingId = null;

// Load and display bookings
function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem('topfade_bookings') || '[]');
  updateStats(bookings);
  displayBookings(bookings);
}

// Update statistics
function updateStats(bookings) {
  const today = new Date().toISOString().split('T')[0];

  document.getElementById('totalBookings').textContent = bookings.length;
  document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
  document.getElementById('confirmedBookings').textContent = bookings.filter(b => b.status === 'confirmed').length;
  document.getElementById('todayBookings').textContent = bookings.filter(b => b.date === today).length;
}

// Display bookings in table
function displayBookings(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  const noBookings = document.getElementById('noBookings');

  // Filter bookings
  let filtered = bookings;
  if (currentFilter !== 'all') {
    filtered = bookings.filter(b => b.status === currentFilter);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB - dateA;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    noBookings.classList.add('show');
    return;
  }

  noBookings.classList.remove('show');

  tbody.innerHTML = filtered.map(booking => `
    <tr>
      <td>
        <div class="booking-date">${formatDate(booking.date)}</div>
        <div class="booking-time">${booking.time}</div>
      </td>
      <td>${escapeHtml(booking.name)}</td>
      <td><a href="tel:${booking.phone}">${escapeHtml(booking.phone)}</a></td>
      <td>${serviceNames[booking.service] || booking.service}</td>
      <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
      <td>
        <button class="action-btn btn-view" onclick="viewBooking(${booking.id})">View</button>
        ${booking.status === 'pending' ? `
          <button class="action-btn btn-confirm" onclick="updateStatus(${booking.id}, 'confirmed')">✓</button>
        ` : ''}
        <button class="action-btn btn-delete" onclick="confirmDelete(${booking.id})">✕</button>
      </td>
    </tr>
  `).join('');
}

// Format date nicely
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-IE', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// View booking details
function viewBooking(id) {
  const bookings = JSON.parse(localStorage.getItem('topfade_bookings') || '[]');
  const booking = bookings.find(b => b.id === id);

  if (!booking) return;

  selectedBookingId = id;

  const detailsDiv = document.getElementById('bookingDetails');
  detailsDiv.innerHTML = `
    <div class="detail-item">
      <span class="detail-label">Customer Name</span>
      <span class="detail-value">${escapeHtml(booking.name)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Phone</span>
      <span class="detail-value"><a href="tel:${booking.phone}">${escapeHtml(booking.phone)}</a></span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Date</span>
      <span class="detail-value">${formatDate(booking.date)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Time</span>
      <span class="detail-value">${booking.time}</span>
    </div>
    <div class="detail-item full-width">
      <span class="detail-label">Service</span>
      <span class="detail-value">${serviceNames[booking.service] || booking.service}</span>
    </div>
    <div class="detail-item full-width">
      <span class="detail-label">Status</span>
      <span class="detail-value"><span class="status-badge status-${booking.status}">${booking.status}</span></span>
    </div>
    <div class="detail-item full-width">
      <span class="detail-label">Requested On</span>
      <span class="detail-value">${new Date(booking.createdAt).toLocaleString('en-IE')}</span>
    </div>
  `;

  // Show/hide buttons based on status
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  confirmBtn.style.display = booking.status === 'pending' ? 'inline-block' : 'none';
  cancelBtn.style.display = booking.status !== 'cancelled' ? 'inline-block' : 'none';

  document.getElementById('detailModal').classList.add('active');
}

// Update booking status
function updateStatus(id, newStatus) {
  const bookings = JSON.parse(localStorage.getItem('topfade_bookings') || '[]');
  const index = bookings.findIndex(b => b.id === id);

  if (index !== -1) {
    bookings[index].status = newStatus;
    localStorage.setItem('topfade_bookings', JSON.stringify(bookings));

    // If confirmed, show the confirmation message
    if (newStatus === 'confirmed') {
      lastConfirmedBooking = bookings[index];
      showConfirmationMessage(bookings[index]);
    }

    loadBookings();
    closeDetailModal();
  }
}

// Show confirmation message modal
function showConfirmationMessage(booking) {
  const serviceName = serviceNamesSimple[booking.service] || booking.service;
  const formattedDate = formatDateLong(booking.date);

  const message = `Hi ${booking.name}!

Your appointment at Top Fade Barbers has been confirmed.

Service: ${serviceName}
Date: ${formattedDate}
Time: ${booking.time}

Address: 7A Store St, Mountjoy, Dublin 1, D01 H2P2

See you soon!
Top Fade Barbers`;

  document.getElementById('confirmationMessage').textContent = message;
  document.getElementById('messageModal').classList.add('active');
}

// Format date for message (longer format)
function formatDateLong(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-IE', options);
}

// Close message modal
function closeMessageModal() {
  document.getElementById('messageModal').classList.remove('active');
  document.getElementById('copyFeedback').classList.remove('show');
}

// Copy message to clipboard
function copyMessage() {
  const message = document.getElementById('confirmationMessage').textContent;
  navigator.clipboard.writeText(message).then(() => {
    document.getElementById('copyFeedback').classList.add('show');
    setTimeout(() => {
      document.getElementById('copyFeedback').classList.remove('show');
    }, 2000);
  });
}

// Send via WhatsApp
function sendWhatsApp() {
  if (!lastConfirmedBooking) return;

  const message = document.getElementById('confirmationMessage').textContent;
  const phone = lastConfirmedBooking.phone.replace(/\s/g, '').replace(/^0/, '353');
  const encodedMessage = encodeURIComponent(message);

  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
}

// Confirm delete
function confirmDelete(id) {
  selectedBookingId = id;
  document.getElementById('deleteModal').classList.add('active');
}

// Delete booking
function deleteBooking() {
  if (!selectedBookingId) return;

  let bookings = JSON.parse(localStorage.getItem('topfade_bookings') || '[]');
  bookings = bookings.filter(b => b.id !== selectedBookingId);
  localStorage.setItem('topfade_bookings', JSON.stringify(bookings));

  closeDeleteModal();
  loadBookings();
}

// Close modals
function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
  selectedBookingId = null;
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadBookings();
  });
});

// Modal action buttons
document.getElementById('confirmBtn').addEventListener('click', () => {
  if (selectedBookingId) {
    updateStatus(selectedBookingId, 'confirmed');
  }
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  if (selectedBookingId) {
    updateStatus(selectedBookingId, 'cancelled');
  }
});

document.getElementById('confirmDeleteBtn').addEventListener('click', deleteBooking);

// Message modal buttons
document.getElementById('copyMessageBtn').addEventListener('click', copyMessage);
document.getElementById('whatsappBtn').addEventListener('click', sendWhatsApp);

// Close modals when clicking outside
document.getElementById('detailModal').addEventListener('click', (e) => {
  if (e.target.id === 'detailModal') closeDetailModal();
});

document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target.id === 'deleteModal') closeDeleteModal();
});

document.getElementById('messageModal').addEventListener('click', (e) => {
  if (e.target.id === 'messageModal') closeMessageModal();
});
