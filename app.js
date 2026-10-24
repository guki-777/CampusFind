const seedItems = [
  { id: 'seed-1', status: 'found', category: 'Tech', title: 'AirPods Pro case', location: 'Student Union', date: 'Today', description: 'White case with a tiny blue sticker on the lid.', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80' },
  { id: 'seed-2', status: 'lost', category: 'Bags', title: 'Green canvas tote', location: 'Arts building', date: 'Yesterday', description: 'Has a small embroidered sun on the front pocket.', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80' },
  { id: 'seed-3', status: 'found', category: 'Keys', title: 'Set of bike keys', location: 'North parking lot', date: '2 days ago', description: 'Three keys on a red carabiner, found near the bike racks.', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80' },
  { id: 'seed-4', status: 'lost', category: 'Clothing', title: 'Navy varsity jacket', location: 'Recreation center', date: '3 days ago', description: 'Letterman jacket, size M. Name tag inside left pocket.', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
  { id: 'seed-5', status: 'found', category: 'Cards', title: 'Student ID card', location: 'West lecture hall', date: '4 days ago', description: 'Found under a seat in room 204. Photo is still clear.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80' },
  { id: 'seed-6', status: 'lost', category: 'Other', title: 'Silver water bottle', location: 'Library cafe', date: '5 days ago', description: 'Brushed steel bottle with a green campus sticker.', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }
];
const storedItems = JSON.parse(localStorage.getItem('campusfind-items') || '[]');
const returnedSeedIds = JSON.parse(localStorage.getItem('campusfind-returned') || '[]');
let items = [...storedItems, ...seedItems.map((item) => returnedSeedIds.includes(item.id) ? { ...item, returned: true } : item)];
let activeStatus = 'all';
let photoData = '';
const $ = (selector) => document.querySelector(selector);
const grid = $('#itemGrid');

function renderItems() {
  const query = $('#searchInput').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const visible = items.filter((item) => {
    const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
    const matchesCategory = category === 'all' || item.category === category;
    const text = `${item.title} ${item.location} ${item.description} ${item.category}`.toLowerCase();
    return matchesStatus && matchesCategory && text.includes(query);
  });
  $('#resultCount').textContent = String(visible.length).padStart(2, '0');
  $('#allCount').textContent = String(items.length).padStart(2, '0');
  grid.innerHTML = visible.map(cardTemplate).join('');
  $('#emptyState').hidden = visible.length !== 0;
}

function cardTemplate(item) {
  const returned = item.returned;
  const safeImage = item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  return `<article class="item-card${returned ? ' returned' : ''}">
    <div class="item-image"><img src="${safeImage}" alt="${item.title}" loading="lazy" /><span class="item-status ${item.status}"><span class="status-dot ${item.status === 'lost' ? 'lost-dot' : 'found-dot'}"></span>${returned ? 'Returned' : item.status}</span></div>
    <div class="item-info"><h3>${item.title}</h3><p class="item-meta">${item.location}<span>•</span>${item.date}</p><p class="item-description">${item.description}</p><div class="item-footer"><span class="item-category">${item.category}</span><div class="card-actions">${returned ? '<span class="item-category">✓ Resolved</span>' : `<button class="contact-button" data-contact="${item.id}" type="button">Contact ↗</button><button class="return-button" data-return="${item.id}" type="button" title="Mark item as returned">Mark returned</button>`}</div></div></div>
  </article>`;
}

function openModal(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; const first = $(id).querySelector('input:not([type="hidden"]), textarea'); if (first) first.focus(); }
function closeModal(modal) { modal.hidden = true; document.body.style.overflow = ''; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 3200); }
function saveItems() {
  localStorage.setItem('campusfind-items', JSON.stringify(items.filter((item) => !item.id.startsWith('seed-'))));
  localStorage.setItem('campusfind-returned', JSON.stringify(items.filter((item) => item.id.startsWith('seed-') && item.returned).map((item) => item.id)));
}

$('#openReportTop').addEventListener('click', () => openModal('#reportModal'));
$('#openReportHero').addEventListener('click', () => openModal('#reportModal'));
$('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); const dark = document.body.classList.contains('dark'); $('#themeIcon').textContent = dark ? '☀' : '☾'; $('#themeToggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); localStorage.setItem('campusfind-theme', dark ? 'dark' : 'light'); });
if (localStorage.getItem('campusfind-theme') === 'dark') { document.body.classList.add('dark'); $('#themeIcon').textContent = '☀'; }
$('#searchInput').addEventListener('input', renderItems);
$('#categoryFilter').addEventListener('change', renderItems);
document.querySelectorAll('.filter-button').forEach((button) => button.addEventListener('click', () => { document.querySelector('.filter-button.active').classList.remove('active'); button.classList.add('active'); activeStatus = button.dataset.status; renderItems(); }));
$('#clearFilters').addEventListener('click', () => { $('#searchInput').value = ''; $('#categoryFilter').value = 'all'; activeStatus = 'all'; document.querySelector('.filter-button.active').classList.remove('active'); document.querySelector('[data-status="all"]').classList.add('active'); renderItems(); });

document.addEventListener('click', (event) => {
  const contactButton = event.target.closest('[data-contact]');
  const returnButton = event.target.closest('[data-return]');
  if (contactButton) { const item = items.find((entry) => entry.id === contactButton.dataset.contact); $('#contactIntro').textContent = `Send a message about “${item.title}” to the person who reported it.`; $('#contactForm [name="itemId"]').value = item.id; openModal('#contactModal'); }
  if (returnButton) { const item = items.find((entry) => entry.id === returnButton.dataset.return); item.returned = true; saveItems(); renderItems(); showToast(`${item.title} marked as returned. Thanks for closing the loop.`); }
  if (event.target.matches('[data-close-modal]') || event.target.classList.contains('modal-backdrop')) { closeModal(event.target.closest('.modal-backdrop')); }
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(closeModal); if (event.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { event.preventDefault(); $('#searchInput').focus(); } });

$('#photoInput').addEventListener('change', (event) => { const file = event.target.files[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { showToast('That photo is larger than 5MB.'); event.target.value = ''; return; } const reader = new FileReader(); reader.addEventListener('load', () => { photoData = reader.result; $('#photoPreview').innerHTML = `<img src="${photoData}" alt="Selected item preview" />`; $('#photoPreview').hidden = false; }); reader.readAsDataURL(file); });
$('#reportForm').addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(event.target); const item = { id: `item-${Date.now()}`, status: data.get('status'), category: data.get('category'), title: data.get('title'), location: data.get('location'), date: 'Just now', description: data.get('description'), image: photoData }; items.unshift(item); saveItems(); renderItems(); event.target.reset(); photoData = ''; $('#photoPreview').hidden = true; closeModal($('#reportModal')); showToast('Your report is live on the campus board.'); document.querySelector('#browse').scrollIntoView({ behavior: 'smooth' }); });
$('#contactForm').addEventListener('submit', (event) => { event.preventDefault(); const name = new FormData(event.target).get('name'); event.target.reset(); closeModal($('#contactModal')); showToast(`Message sent. ${name}, the reporter can now reach you.`); });
renderItems();
