import { menuItems } from './data.js';

// --- State Management ---
const state = {
  searchQuery: '',
  activeCategory: 'ALL'
};

// --- DOM References ---
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const categoriesTabs = document.getElementById('categories-tabs');
const activeCategoryTitle = document.getElementById('active-category-title');
const emptyState = document.getElementById('empty-state');
const resetSearchBtn = document.getElementById('reset-search-btn');

// --- Category Normalization Helper ---
// Maps the UI tab values to the database category strings
function matchesCategoryFilter(itemCategory, filterValue) {
  if (filterValue === 'ALL') return true;
  if (filterValue === 'OTROS') return itemCategory === 'OTRAS BEBIDAS';
  if (filterValue === 'APERITIVOS') return itemCategory === 'APERITIVOS';
  return itemCategory === filterValue;
}

// Get user-friendly display title for the active category
function getCategoryDisplayTitle(filterValue) {
  switch (filterValue) {
    case 'ALL':
      return 'Todos los productos';
    case 'CAFÉS FRÍOS':
      return 'Cafés Fríos';
    case 'CAFÉS CALIENTES':
      return 'Cafés Calientes';
    case 'OTROS':
      return 'Otras Bebidas';
    case 'APERITIVOS':
      return 'Aperitivos';
    default:
      return filterValue;
  }
}

// --- Render Logic ---
function renderMenu() {
  // 1. Filter items based on active category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          item.descripcion.toLowerCase().includes(state.searchQuery.toLowerCase());
                          
    const matchesCat = matchesCategoryFilter(item.categoria, state.activeCategory);
    
    return matchesSearch && matchesCat;
  });

  // 2. Clear current content
  menuContainer.innerHTML = '';

  // 3. Toggle Empty State
  if (filteredItems.length === 0) {
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    menuContainer.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  menuContainer.classList.remove('hidden');

  // 4. Render product cards
  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer';
    
    // Subcategory badge logic
    const badgeHtml = item.subcategoria 
      ? `<span class="absolute top-2 left-2 bg-amber-950/80 backdrop-blur-sm text-[9px] text-amber-100 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm z-10">${item.subcategoria}</span>`
      : '';

    card.innerHTML = `
      <div class="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
        ${badgeHtml}
        <img 
          src="${item.foto}" 
          alt="${item.nombre}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        >
      </div>
      <div class="p-3.5 flex flex-col flex-grow">
        <h3 class="font-serif text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
          ${item.nombre}
        </h3>
        <p class="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed flex-grow">
          ${item.descripcion}
        </p>
        <div class="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium uppercase tracking-wider">
          <span>${item.categoria === 'OTRAS BEBIDAS' ? 'Otros' : item.categoria.toLowerCase()}</span>
          <i class="fa-solid fa-mug-hot text-amber-800/20"></i>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openModal(item);
    });

    menuContainer.appendChild(card);
  });
}

// --- Event Listeners ---

// Real-time search filter
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  
  if (state.searchQuery.length > 0) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }
  
  renderMenu();
});

// Clear search button click
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  renderMenu();
  searchInput.focus();
});

// Category tabs click
categoriesTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;

  // Update active styling
  document.querySelectorAll('.category-btn').forEach(button => {
    button.className = 'category-btn px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 bg-white text-stone-600 hover:text-stone-900 border border-stone-200';
  });
  
  btn.className = 'category-btn active px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 bg-amber-950 text-amber-50 shadow-md shadow-amber-950/20 border border-amber-950';

  // Update state and title
  state.activeCategory = btn.getAttribute('data-category');
  activeCategoryTitle.textContent = getCategoryDisplayTitle(state.activeCategory);

  // Smooth scroll active pill to center
  btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

  renderMenu();
});

// Reset search button (in empty state)
resetSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  
  // Set category back to ALL
  state.activeCategory = 'ALL';
  activeCategoryTitle.textContent = getCategoryDisplayTitle('ALL');
  
  document.querySelectorAll('.category-btn').forEach(button => {
    if (button.getAttribute('data-category') === 'ALL') {
      button.className = 'category-btn active px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 bg-amber-950 text-amber-50 shadow-md shadow-amber-950/20 border border-amber-950';
    } else {
      button.className = 'category-btn px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 bg-white text-stone-600 hover:text-stone-900 border border-stone-200';
    }
  });

  renderMenu();
});

// --- Initial Render ---
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
});

// --- Modal Functionality ---
const modal = document.getElementById('product-modal');
const modalContent = document.getElementById('modal-content');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalDescription = document.getElementById('modal-description');
const modalCloseBtnBottom = document.getElementById('modal-close-btn-bottom');

function openModal(item) {
  modalImage.src = item.foto;
  modalImage.alt = item.nombre;
  modalTitle.textContent = item.nombre;
  modalCategory.textContent = item.categoria === 'OTRAS BEBIDAS' ? 'Otros' : item.categoria.toLowerCase();
  modalDescription.textContent = item.descripcion;

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modalContent.classList.remove('scale-95');
  modalContent.classList.add('scale-100');
  document.body.classList.add('overflow-hidden');
}

function closeModal() {
  modal.classList.add('opacity-0', 'pointer-events-none');
  modalContent.classList.remove('scale-100');
  modalContent.classList.add('scale-95');
  document.body.classList.remove('overflow-hidden');
}

modalCloseBtnBottom.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
