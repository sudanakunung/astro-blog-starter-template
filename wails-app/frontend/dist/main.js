// State management
let currentConfig = {
  store_id: 'navanusa',
  store_name: 'Navanusa Store',
  worker_url: 'http://localhost:4321',
  internal_token: '',
  deploy_hook_url: ''
};

let productsList = [];
let bannersList = [];

// Helper to check if running in Wails desktop app
function hasWails() {
  return window.go && window.go.main && window.go.main.App;
}

// DOM Elements - Tabs
const tabBtnProducts = document.getElementById('tab-btn-products');
const tabBtnBanners = document.getElementById('tab-btn-banners');
const tabBtnGallery = document.getElementById('tab-btn-gallery');
const tabProductsContent = document.getElementById('tab-products-content');
const tabBannersContent = document.getElementById('tab-banners-content');
const tabGalleryContent = document.getElementById('tab-gallery-content');

// DOM Elements - Products
const form = document.getElementById('product-form');
const pId = document.getElementById('p-id');
const pName = document.getElementById('p-name');
const pSlug = document.getElementById('p-slug');
const pStatus = document.getElementById('p-status');
const pPrice = document.getElementById('p-price');
const pStock = document.getElementById('p-stock');
const pWeight = document.getElementById('p-weight');
const pImage = document.getElementById('p-image');
const pImageFile = document.getElementById('p-image-file');
const btnUploadPImage = document.getElementById('btn-upload-p-image');
const btnUploadPText = document.getElementById('btn-upload-p-text');
const pDesc = document.getElementById('p-desc');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');

const btnSync = document.getElementById('btn-sync');
const btnResetForm = document.getElementById('btn-reset-form');
const btnRefresh = document.getElementById('btn-refresh');
const btnRebuild = document.getElementById('btn-rebuild');
const formTitle = document.getElementById('form-title');

const syncLogBox = document.getElementById('sync-log-box');
const stepD1 = document.getElementById('step-d1');
const stepD1Status = document.getElementById('step-d1-status');
const stepHook = document.getElementById('step-hook');
const stepHookStatus = document.getElementById('step-hook-status');
const syncTimer = document.getElementById('sync-timer');

const productListEl = document.getElementById('product-list');
const productCountBadge = document.getElementById('product-count');
const badgeStoreName = document.getElementById('badge-store-name');
const storeBadge = document.getElementById('store-badge');

// DOM Elements - Banners
const bannerForm = document.getElementById('banner-form');
const bId = document.getElementById('b-id');
const bTitle = document.getElementById('b-title');
const bImage = document.getElementById('b-image');
const bImageFile = document.getElementById('b-image-file');
const btnUploadBImage = document.getElementById('btn-upload-b-image');
const btnUploadBText = document.getElementById('btn-upload-b-text');
const bLink = document.getElementById('b-link');
const bLinkText = document.getElementById('b-link-text');
const bOrder = document.getElementById('b-order');
const bStatus = document.getElementById('b-status');
const bannerImagePreview = document.getElementById('banner-image-preview');
const bannerImagePreviewContainer = document.getElementById('banner-image-preview-container');
const btnResetBannerForm = document.getElementById('btn-reset-banner-form');
const bannerFormTitle = document.getElementById('banner-form-title');
const bannerListEl = document.getElementById('banner-list');
const bannerCountBadge = document.getElementById('banner-count');
const btnSyncBanner = document.getElementById('btn-sync-banner');

// Settings Modal Elements
const settingsModal = document.getElementById('settings-modal');
const btnSettingsOpen = document.getElementById('btn-settings-open');
const btnSettingsClose = document.getElementById('btn-settings-close');
const btnSettingsCancel = document.getElementById('btn-settings-cancel');
const settingsForm = document.getElementById('settings-form');
const cfgStoreId = document.getElementById('cfg-store-id');
const cfgStoreName = document.getElementById('cfg-store-name');
const cfgWorkerUrl = document.getElementById('cfg-worker-url');
const cfgToken = document.getElementById('cfg-token');
const cfgDeployHook = document.getElementById('cfg-deploy-hook');
const toastContainer = document.getElementById('toast-container');

// Integrations Modal Elements
const integrationsModal = document.getElementById('integrations-modal');
const btnIntegrationsOpen = document.getElementById('btn-integrations-open');
const btnIntegrationsClose = document.getElementById('btn-integrations-close');
const btnIntegrationsCancel = document.getElementById('btn-integrations-cancel');
const integrationsForm = document.getElementById('integrations-form');
const inputMayarKey = document.getElementById('input-mayar-key');
const inputMayarSecret = document.getElementById('input-mayar-secret');
const inputBiteshipKey = document.getElementById('input-biteship-key');
const btnTestMayar = document.getElementById('btn-test-mayar');
const btnTestBiteship = document.getElementById('btn-test-biteship');
const statusMayarKey = document.getElementById('status-mayar-key');
const statusMayarWebhook = document.getElementById('status-mayar-webhook');
const statusBiteshipKey = document.getElementById('status-biteship-key');

// Gallery DOM Elements
let mediaList = [];
let activeGalleryFilter = 'all'; // 'all' | 'image' | 'video'
let activePickerFilter = 'all';
let currentPickerTarget = 'product'; // 'product' | 'banner'
let currentPreviewItem = null;

const galleryCountBadge = document.getElementById('gallery-count-badge');
const galleryTotalBadge = document.getElementById('gallery-total-badge');
const galleryGrid = document.getElementById('gallery-grid');
const galleryDropzone = document.getElementById('gallery-dropzone');
const galleryFileInput = document.getElementById('gallery-file-input');
const btnBrowseMedia = document.getElementById('btn-browse-media');
const galleryUploadStatus = document.getElementById('gallery-upload-status');
const galleryUploadText = document.getElementById('gallery-upload-text');
const formAddMediaUrl = document.getElementById('form-add-media-url');
const inputMediaName = document.getElementById('input-media-name');
const inputMediaUrl = document.getElementById('input-media-url');
const selectMediaType = document.getElementById('select-media-type');
const btnRefreshGallery = document.getElementById('btn-refresh-gallery');
const filterAll = document.getElementById('filter-all');
const filterImages = document.getElementById('filter-images');
const filterVideos = document.getElementById('filter-videos');
const gallerySearch = document.getElementById('gallery-search');

// Picker & Preview Modal Elements
const btnGalleryPickProduct = document.getElementById('btn-gallery-pick-product');
const btnGalleryPickBanner = document.getElementById('btn-gallery-pick-banner');
const mediaPickerModal = document.getElementById('media-picker-modal');
const pickerModalTitle = document.getElementById('picker-modal-title');
const btnPickerClose = document.getElementById('btn-picker-close');
const btnPickerCancel = document.getElementById('btn-picker-cancel');
const pickerFilterAll = document.getElementById('picker-filter-all');
const pickerFilterImages = document.getElementById('picker-filter-images');
const pickerFilterVideos = document.getElementById('picker-filter-videos');
const pickerSearch = document.getElementById('picker-search');
const pickerGrid = document.getElementById('picker-grid');

const mediaPreviewModal = document.getElementById('media-preview-modal');
const btnPreviewModalClose = document.getElementById('btn-preview-modal-close');
const previewModalTitle = document.getElementById('preview-modal-title');
const previewModalMeta = document.getElementById('preview-modal-meta');
const previewModalContent = document.getElementById('preview-modal-content');
const previewModalUrl = document.getElementById('preview-modal-url');
const btnPreviewCopy = document.getElementById('btn-preview-copy');
const btnPreviewUseP = document.getElementById('btn-preview-use-p');
const btnPreviewUseB = document.getElementById('btn-preview-use-b');

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'error' ? 'toast-error' : ''}`;
  const icon = type === 'success' ? '✓' : '⚠️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function generateSlug(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function loadConfig() {
  try {
    if (hasWails() && window.go.main.App.GetConfig) {
      const cfg = await window.go.main.App.GetConfig();
      if (cfg && cfg.store_id) {
        currentConfig = cfg;
      }
    } else {
      const saved = localStorage.getItem('astro_sync_config');
      if (saved) {
        currentConfig = { ...currentConfig, ...JSON.parse(saved) };
      }
    }
  } catch (e) {
    console.warn('Failed to load config:', e);
  }

  badgeStoreName.textContent = `Store: ${currentConfig.store_id || 'navanusa'}`;
  cfgStoreId.value = currentConfig.store_id || '';
  cfgStoreName.value = currentConfig.store_name || '';
  cfgWorkerUrl.value = currentConfig.worker_url || 'http://localhost:4321';
  cfgToken.value = currentConfig.internal_token || '';
  cfgDeployHook.value = currentConfig.deploy_hook_url || '';
}

async function saveConfig(cfg) {
  currentConfig = cfg;
  badgeStoreName.textContent = `Store: ${currentConfig.store_id || 'navanusa'}`;

  try {
    if (hasWails() && window.go.main.App.SaveConfig) {
      await window.go.main.App.SaveConfig(cfg);
    } else {
      localStorage.setItem('astro_sync_config', JSON.stringify(cfg));
    }
  } catch (e) {
    console.error('Failed to save config:', e);
  }
}

// ==========================================
// PRODUCTS MANAGEMENT
// ==========================================
async function loadProducts() {
  productListEl.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.75rem; background-color: #f8fafc; border-radius: 0.75rem; border: 1px dashed #cbd5e1;">
      <div class="spin" style="width: 1.25rem; height: 1.25rem; border: 2px solid #4f46e5; border-top-color: transparent; border-radius: 9999px; margin-bottom: 0.5rem;"></div>
      <div>Mengambil data produk dari database...</div>
    </div>
  `;

  try {
    if (hasWails() && window.go.main.App.FetchProducts) {
      const data = await window.go.main.App.FetchProducts();
      productsList = Array.isArray(data) ? data : [];
    } else {
      const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
      const targetUrl = `${base}/api/products?store_id=${encodeURIComponent(currentConfig.store_id || 'navanusa')}&all=true`;
      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      productsList = Array.isArray(data) ? data : [];
    }
    renderProducts();
  } catch (err) {
    productListEl.innerHTML = `
      <div style="padding: 2rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="width: 3rem; height: 3rem; margin: 0 auto 0.75rem; border-radius: 9999px; background-color: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          ⚠️
        </div>
        <h4 style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 0.25rem;">Tidak dapat terhubung ke Worker API</h4>
        <p style="font-size: 0.75rem; color: #64748b; max-width: 28rem; margin: 0 auto 1rem;">${err.message || err}. Pastikan Astro dev server (<code>npm run dev</code>) atau server produksi sedang aktif.</p>
        <button onclick="loadProducts()" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.85rem;">
          🔄 Coba Lagi
        </button>
      </div>
    `;
    productCountBadge.textContent = '0 Produk';
  }
}

function renderProducts() {
  productCountBadge.textContent = `${productsList.length} Produk`;

  if (productsList.length === 0) {
    productListEl.innerHTML = `
      <div style="padding: 2.5rem 1.5rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="width: 3rem; height: 3rem; margin: 0 auto 0.75rem; border-radius: 9999px; background-color: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          📦
        </div>
        <h4 style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 0.25rem;">Belum ada produk di database</h4>
        <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 1rem;">Tambahkan produk katalog pertama Anda melalui formulir di sebelah kiri.</p>
      </div>
    `;
    return;
  }

  productListEl.innerHTML = productsList.map(p => {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price);
    const imgUrl = p.image_url || 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?auto=format&fit=crop&w=200&q=80';
    const isActive = p.is_active === 1;

    return `
      <div class="product-item">
        <div style="display: flex; align-items: center; gap: 0.875rem; min-width: 0;">
          <img src="${imgUrl}" alt="${p.name}" class="product-thumb" onerror="this.src='https://placehold.co/100x100?text=No+Image'" />
          <div class="product-info">
            <div class="product-name-row">
              <h4 class="product-name">${p.name}</h4>
              <span class="status-pill ${isActive ? 'status-active' : 'status-inactive'}">
                ${isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-meta">
              <span>Stok: <strong style="color: #334155;">${p.stock}</strong></span>
              <span>&bull;</span>
              <span>${p.weight_gram || 0}g</span>
              <span>&bull;</span>
              <span>/products/${p.slug}</span>
            </div>
          </div>
        </div>

        <div style="flex-shrink: 0;">
          <button onclick="editProduct('${p.id}')" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.375rem 0.625rem;">
            Edit
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// HERO CAROUSEL BANNERS MANAGEMENT
// ==========================================
async function loadBanners() {
  bannerListEl.innerHTML = `
    <div style="padding: 2.5rem; text-align: center; color: #94a3b8; font-size: 0.8rem; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
      <div class="spin" style="width: 1.5rem; height: 1.5rem; border: 2.5px solid #4f46e5; border-top-color: transparent; border-radius: 9999px; margin-bottom: 0.75rem;"></div>
      <div>Mengambil data slide banner dari database...</div>
    </div>
  `;

  try {
    if (hasWails() && window.go.main.App.FetchBanners) {
      const data = await window.go.main.App.FetchBanners();
      bannersList = Array.isArray(data) ? data : [];
    } else {
      const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
      const targetUrl = `${base}/api/banners?store_id=${encodeURIComponent(currentConfig.store_id || 'navanusa')}&all=true`;
      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      bannersList = Array.isArray(data) ? data : [];
    }
    renderBanners();
  } catch (err) {
    bannerListEl.innerHTML = `
      <div style="padding: 2rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="width: 3rem; height: 3rem; margin: 0 auto 0.75rem; border-radius: 9999px; background-color: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          🎨
        </div>
        <h4 style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 0.25rem;">Belum dapat memuat banner dari D1</h4>
        <p style="font-size: 0.75rem; color: #64748b; max-width: 28rem; margin: 0 auto 1rem;">${err.message || err}. Anda tetap dapat membuat banner baru lewat form sebelah kiri dan menyimpannya.</p>
        <button onclick="loadBanners()" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.4rem 0.85rem;">
          🔄 Coba Lagi
        </button>
      </div>
    `;
    bannerCountBadge.textContent = '0 Banner';
  }
}

function renderBanners() {
  bannerCountBadge.textContent = `${bannersList.length} Banner`;

  if (bannersList.length === 0) {
    bannerListEl.innerHTML = `
      <div style="padding: 2.5rem 1.5rem; text-align: center; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <div style="width: 3rem; height: 3rem; margin: 0 auto 0.75rem; border-radius: 9999px; background-color: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
          🖼️
        </div>
        <h4 style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 0.25rem;">Belum ada banner di database</h4>
        <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 1rem;">Storefront saat ini menampilkan banner default. Tambahkan banner kustom Anda sekarang!</p>
      </div>
    `;
    return;
  }


  bannerListEl.innerHTML = bannersList.map(b => {
    const isActive = b.is_active === 1;
    const imgUrl = b.image_url || 'https://placehold.co/600x300?text=No+Banner';

    return `
      <div class="product-item">
        <div style="display: flex; align-items: center; gap: 0.875rem; min-width: 0;">
          <img src="${imgUrl}" alt="${b.title}" class="banner-thumb" onerror="this.src='https://placehold.co/600x300?text=Error+Loading'" />
          <div class="product-info">
            <div class="product-name-row">
              <h4 class="product-name">${b.title}</h4>
              <span class="status-pill ${isActive ? 'status-active' : 'status-inactive'}">
                ${isActive ? 'Aktif' : 'Nonaktif'}
              </span>
              <span style="font-size: 0.6875rem; font-weight: 600; color: #6366f1; background-color: #e0e7ff; padding: 0.125rem 0.375rem; border-radius: 0.375rem;">
                Urutan: ${b.order_num ?? 0}
              </span>
            </div>
            <div class="product-meta">
              <span>Tombol: <strong style="color: #334155;">${b.link_text || 'view product'}</strong></span>
              <span>&bull;</span>
              <span>Link: <code>${b.link_url || '#'}</code></span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.375rem; flex-shrink: 0;">
          <button onclick="editBanner('${b.id}')" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.375rem 0.625rem;">
            Edit
          </button>
          <button onclick="deleteBanner('${b.id}')" class="btn btn-danger" style="font-size: 0.75rem; padding: 0.375rem 0.625rem;">
            Hapus
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.editBanner = function(id) {
  const b = bannersList.find(item => item.id === id);
  if (!b) return;

  bId.value = b.id;
  bTitle.value = b.title;
  bImage.value = b.image_url;
  bLink.value = b.link_url || '#';
  bLinkText.value = b.link_text || 'view product';
  bOrder.value = b.order_num ?? 0;
  bStatus.value = b.is_active ?? 1;

  if (b.image_url) {
    bannerImagePreview.src = b.image_url;
    bannerImagePreviewContainer.classList.remove('hidden');
  } else {
    bannerImagePreviewContainer.classList.add('hidden');
  }

  bannerFormTitle.textContent = 'Edit Slide: ' + b.title;
  btnResetBannerForm.textContent = 'Batal / Form Baru';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteBanner = async function(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus slide banner ini dari carousel?')) {
    return;
  }

  try {
    if (hasWails() && window.go.main.App.DeleteBanner) {
      await window.go.main.App.DeleteBanner(id);
      showToast('Banner berhasil dihapus!', 'success');
      await loadBanners();
      if (bId.value === id) {
        resetBannerForm();
      }
    } else {
      const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
      const headers = {};
      if (currentConfig.internal_token) {
        headers['Authorization'] = `Bearer ${currentConfig.internal_token}`;
      }

      const res = await fetch(`${base}/api/banners/${id}?store_id=${encodeURIComponent(currentConfig.store_id || 'navanusa')}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('Banner berhasil dihapus!', 'success');
        await loadBanners();
        if (bId.value === id) {
          resetBannerForm();
        }
      } else {
        showToast(data.error || 'Gagal menghapus banner', 'error');
      }
    }
  } catch (err) {
    showToast('Error: ' + (err.message || err), 'error');
  }
};

function resetBannerForm() {
  bId.value = '';
  bTitle.value = '';
  bImage.value = '';
  bLink.value = '#';
  bLinkText.value = 'view product';
  bOrder.value = '0';
  bStatus.value = '1';
  bannerImagePreviewContainer.classList.add('hidden');
  bannerFormTitle.textContent = 'Tambah / Edit Slide Banner';
  btnResetBannerForm.textContent = '+ Banner Baru';
}

// ==========================================
// STORE INTEGRATIONS
// ==========================================
async function loadStoreIntegrations() {
  try {
    if (hasWails() && window.go.main.App.GetStoreSettingsStatus) {
      const data = await window.go.main.App.GetStoreSettingsStatus();
      if (data) {
        statusMayarKey.innerHTML = `Mayar API Key: ${data.has_mayar_key ? `<span class="status-pill status-active">Aktif (${data.mayar_key_preview})</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
        statusMayarWebhook.innerHTML = `Mayar Webhook: ${data.has_mayar_webhook ? `<span class="status-pill status-active">Tersimpan</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
        statusBiteshipKey.innerHTML = `Biteship API Key: ${data.has_biteship_key ? `<span class="status-pill status-active">Aktif (${data.biteship_key_preview})</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
      }
    } else {
      const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
      const res = await fetch(`${base}/api/store/settings?store_id=${encodeURIComponent(currentConfig.store_id || 'navanusa')}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.ok) {
        statusMayarKey.innerHTML = `Mayar API Key: ${data.has_mayar_key ? `<span class="status-pill status-active">Aktif (${data.mayar_key_preview})</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
        statusMayarWebhook.innerHTML = `Mayar Webhook: ${data.has_mayar_webhook ? `<span class="status-pill status-active">Tersimpan</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
        statusBiteshipKey.innerHTML = `Biteship API Key: ${data.has_biteship_key ? `<span class="status-pill status-active">Aktif (${data.biteship_key_preview})</span>` : `<span class="status-pill status-inactive">Belum diset</span>`}`;
      }
    }
  } catch (e) {
    console.warn('Gagal memuat status integrasi:', e);
  }
}

window.editProduct = function(id) {
  const p = productsList.find(item => item.id === id);
  if (!p) return;

  pId.value = p.id;
  pName.value = p.name;
  pSlug.value = p.slug;
  pStatus.value = p.is_active;
  pPrice.value = p.price;
  pStock.value = p.stock;
  pWeight.value = p.weight_gram || '';
  pImage.value = p.image_url || '';
  pDesc.value = p.description || '';

  if (p.image_url) {
    imagePreview.src = p.image_url;
    imagePreviewContainer.classList.remove('hidden');
  } else {
    imagePreviewContainer.classList.add('hidden');
  }

  formTitle.textContent = 'Edit: ' + p.name;
  btnResetForm.textContent = 'Batal / Form Baru';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function resetForm() {
  pId.value = '';
  pName.value = '';
  pSlug.value = '';
  pStatus.value = '1';
  pPrice.value = '';
  pStock.value = '';
  pWeight.value = '';
  pImage.value = '';
  pDesc.value = '';
  imagePreviewContainer.classList.add('hidden');
  formTitle.textContent = 'Tambah / Edit Produk';
  syncLogBox.classList.add('hidden');
  btnResetForm.textContent = '+ Form Baru';
}

function openSettings() {
  cfgStoreId.value = currentConfig.store_id || '';
  cfgStoreName.value = currentConfig.store_name || '';
  cfgWorkerUrl.value = currentConfig.worker_url || 'http://localhost:4321';
  cfgToken.value = currentConfig.internal_token || '';
  cfgDeployHook.value = currentConfig.deploy_hook_url || '';
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

function openIntegrations() {
  loadStoreIntegrations();
  integrationsModal.classList.remove('hidden');
}

function closeIntegrations() {
  integrationsModal.classList.add('hidden');
}

// ========================================================
// MEDIA GALLERY & PICKER SYSTEM (PHOTO & VIDEO)
// ========================================================

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) {
    return dateStr;
  }
}

function isVideoUrl(url) {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.mkv') || clean.includes('/video/');
}

async function loadMediaGallery() {
  try {
    if (hasWails() && window.go.main.App.GetMediaList) {
      const items = await window.go.main.App.GetMediaList();
      if (Array.isArray(items) && items.length > 0) {
        mediaList = items;
      } else {
        const local = localStorage.getItem('astro_wails_media_gallery');
        if (local) {
          mediaList = JSON.parse(local);
        } else {
          mediaList = getDefaultMediaSamples();
        }
      }
    } else {
      const local = localStorage.getItem('astro_wails_media_gallery');
      if (local) {
        mediaList = JSON.parse(local);
      } else {
        mediaList = getDefaultMediaSamples();
      }
    }
  } catch (err) {
    console.warn('Error loading media gallery:', err);
    const local = localStorage.getItem('astro_wails_media_gallery');
    mediaList = local ? JSON.parse(local) : getDefaultMediaSamples();
  }

  updateMediaBadges();
  renderMediaGallery();
}

function getDefaultMediaSamples() {
  return [
    {
      id: 'sample-1',
      name: 'cincin-emas-berlian-lux.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      size: 1420000,
      mime_type: 'image/jpeg',
      created_at: new Date().toISOString(),
      store_id: currentConfig.store_id || 'navanusa'
    },
    {
      id: 'sample-2',
      name: 'kalung-emas-mewah-collection.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      size: 1850000,
      mime_type: 'image/jpeg',
      created_at: new Date().toISOString(),
      store_id: currentConfig.store_id || 'navanusa'
    },
    {
      id: 'sample-3',
      name: 'video-showcase-jewellery-demo.mp4',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      size: 15400000,
      mime_type: 'video/mp4',
      created_at: new Date().toISOString(),
      store_id: currentConfig.store_id || 'navanusa'
    }
  ];
}

function updateMediaBadges() {
  const count = mediaList.length;
  if (galleryCountBadge) galleryCountBadge.textContent = count;
  if (galleryTotalBadge) galleryTotalBadge.textContent = `${count} Media`;
}

async function saveMediaItem(item) {
  if (!item.id) {
    item.id = (hasWails() && window.go.main.App.GenerateUUID) ? await window.go.main.App.GenerateUUID() : 'media-' + Date.now();
  }
  if (!item.created_at) {
    item.created_at = new Date().toISOString();
  }
  if (!item.store_id) {
    item.store_id = currentConfig.store_id || 'navanusa';
  }

  const idx = mediaList.findIndex(m => m.id === item.id);
  if (idx >= 0) {
    mediaList[idx] = item;
  } else {
    mediaList.unshift(item);
  }

  try {
    if (hasWails() && window.go.main.App.SaveMediaItem) {
      await window.go.main.App.SaveMediaItem(item);
    }
  } catch (e) {
    console.warn('Backend save media error:', e);
  }
  try {
    localStorage.setItem('astro_wails_media_gallery', JSON.stringify(mediaList));
  } catch (e) {}

  updateMediaBadges();
  renderMediaGallery();
}

async function deleteMediaItem(id) {
  const item = mediaList.find(m => m.id === id);
  const name = item ? item.name : 'item ini';
  if (!confirm(`Hapus "${name}" dari galeri media?`)) return;

  mediaList = mediaList.filter(m => m.id !== id);

  try {
    if (hasWails() && window.go.main.App.DeleteMediaItem) {
      await window.go.main.App.DeleteMediaItem(id);
    }
  } catch (e) {
    console.warn('Backend delete media error:', e);
  }
  try {
    localStorage.setItem('astro_wails_media_gallery', JSON.stringify(mediaList));
  } catch (e) {}

  updateMediaBadges();
  renderMediaGallery();
  showToast('Media berhasil dihapus dari galeri', 'success');
}

function renderMediaGallery() {
  if (!galleryGrid) return;

  const searchQuery = (gallerySearch?.value || '').trim().toLowerCase();
  const filtered = mediaList.filter(item => {
    if (activeGalleryFilter === 'image' && item.type !== 'image') return false;
    if (activeGalleryFilter === 'video' && item.type !== 'video') return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery) && !item.url.toLowerCase().includes(searchQuery)) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: var(--radius-md); border: 1px dashed #cbd5e1;">
        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 0.75rem; color: #cbd5e1;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <div style="font-weight: 700; color: #475569; font-size: 0.875rem;">Belum ada media ditemukan</div>
        <div style="font-size: 0.75rem; margin-top: 0.25rem;">Tarik file ke kotak upload atau tambah tautan URL di sebelah kiri.</div>
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = filtered.map(item => {
    const isVid = item.type === 'video';
    const typeLabel = isVid ? '🎥 Video' : '📸 Foto';
    const badgeClass = isVid ? 'media-type-badge video' : 'media-type-badge';

    return `
      <div class="media-card" data-id="${item.id}">
        <div class="media-thumb-wrap">
          <span class="${badgeClass}">${typeLabel}</span>
          ${isVid ? `
            <video src="${item.url}" preload="metadata" muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
            <div style="position: absolute; width: 2.25rem; height: 2.25rem; border-radius: 50%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          ` : `
            <img class="media-thumb-img" src="${item.url}" alt="${item.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300?text=Gambar+Rusak'" />
          `}

          <!-- Hover Overlay -->
          <div class="media-thumb-overlay">
            <button type="button" class="media-action-circle btn-media-preview-action" data-id="${item.id}" title="Preview / Buka">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button type="button" class="media-action-circle btn-media-copy-action" data-url="${item.url}" title="Salin URL">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </button>
          </div>
        </div>

        <div class="media-card-body">
          <div class="media-name" title="${item.name}">${item.name}</div>
          <div class="media-meta">
            <span>${formatBytes(item.size)}</span>
            <span>${formatDate(item.created_at)}</span>
          </div>
        </div>

        <div class="media-card-footer">
          <div class="media-use-btn-group">
            <button type="button" class="btn-use-media btn-use-product btn-media-use-product" data-url="${item.url}" title="Gunakan sebagai foto produk">
              <span>+ Produk</span>
            </button>
            <button type="button" class="btn-use-media btn-use-banner btn-media-use-banner" data-url="${item.url}" title="Gunakan sebagai banner carousel">
              <span>+ Banner</span>
            </button>
          </div>
          <div class="media-bottom-actions">
            <button type="button" class="btn-media-link btn-media-copy-action" data-url="${item.url}">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              <span>Salin URL</span>
            </button>
            <button type="button" class="btn-media-delete btn-media-delete-action" data-id="${item.id}" title="Hapus dari galeri">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  galleryGrid.querySelectorAll('.btn-media-use-product').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      useMediaForProduct(b.dataset.url);
    });
  });

  galleryGrid.querySelectorAll('.btn-media-use-banner').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      useMediaForBanner(b.dataset.url);
    });
  });

  galleryGrid.querySelectorAll('.btn-media-copy-action').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      copyMediaUrl(b.dataset.url);
    });
  });

  galleryGrid.querySelectorAll('.btn-media-preview-action').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const it = mediaList.find(m => m.id === b.dataset.id);
      if (it) openMediaPreview(it);
    });
  });

  galleryGrid.querySelectorAll('.btn-media-delete-action').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMediaItem(b.dataset.id);
    });
  });
}

function copyMediaUrl(url) {
  if (!url) return;
  navigator.clipboard.writeText(url).then(() => {
    showToast('URL media disalin ke clipboard!', 'success');
  }).catch(() => {
    showToast('URL: ' + url, 'success');
  });
}

function useMediaForProduct(url) {
  if (!url) return;
  pImage.value = url;
  imagePreview.src = url;
  imagePreviewContainer.classList.remove('hidden');

  tabBtnProducts.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Media diterapkan ke formulir Produk!', 'success');
}

function useMediaForBanner(url) {
  if (!url) return;
  bImage.value = url;
  bannerImagePreview.src = url;
  bannerImagePreviewContainer.classList.remove('hidden');

  tabBtnBanners.click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Media diterapkan ke formulir Banner!', 'success');
}

// Media Picker Modal
function openMediaPicker(target) {
  currentPickerTarget = target;
  pickerModalTitle.textContent = target === 'product' ? 'Pilih Media untuk Produk' : 'Pilih Media untuk Banner';
  mediaPickerModal.classList.remove('hidden');
  renderMediaPicker();
}

function closeMediaPicker() {
  mediaPickerModal.classList.add('hidden');
}

function renderMediaPicker() {
  if (!pickerGrid) return;

  const q = (pickerSearch?.value || '').trim().toLowerCase();
  const filtered = mediaList.filter(item => {
    if (activePickerFilter === 'image' && item.type !== 'image') return false;
    if (activePickerFilter === 'video' && item.type !== 'video') return false;
    if (q && !item.name.toLowerCase().includes(q) && !item.url.toLowerCase().includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    pickerGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.8125rem;">
        Tidak ada media yang cocok. Buka tab Galeri untuk menambahkan foto/video baru.
      </div>
    `;
    return;
  }

  pickerGrid.innerHTML = filtered.map(item => {
    const isVid = item.type === 'video';
    return `
      <div class="picker-item" data-url="${item.url}" title="Klik untuk gunakan">
        ${isVid ? `
          <div style="height: 85px; background: #0f172a; display: flex; align-items: center; justify-content: center; position: relative;">
            <video src="${item.url}" preload="metadata" muted style="width: 100%; height: 100%; object-fit: cover;"></video>
            <span style="position: absolute; font-size: 0.65rem; background: rgba(225,29,72,0.9); color: white; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 700;">VIDEO</span>
          </div>
        ` : `
          <img class="picker-item-thumb" src="${item.url}" alt="${item.name}" loading="lazy" onerror="this.src='https://placehold.co/200x150?text=Foto'" />
        `}
        <div class="picker-item-title">${item.name}</div>
      </div>
    `;
  }).join('');

  pickerGrid.querySelectorAll('.picker-item').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.dataset.url;
      if (currentPickerTarget === 'product') {
        useMediaForProduct(url);
      } else {
        useMediaForBanner(url);
      }
      closeMediaPicker();
    });
  });
}

// Media Preview Modal
function openMediaPreview(item) {
  currentPreviewItem = item;
  previewModalTitle.textContent = item.name || 'Preview Media';
  previewModalMeta.textContent = `${item.type === 'video' ? 'Video' : 'Foto'} • ${formatBytes(item.size || 0)} • ${formatDate(item.created_at)}`;
  previewModalUrl.value = item.url;

  if (item.type === 'video' || isVideoUrl(item.url)) {
    previewModalContent.innerHTML = `
      <video src="${item.url}" controls autoplay playsinline style="max-width: 100%; max-height: 420px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        Browser Anda tidak mendukung tag video.
      </video>
    `;
  } else {
    previewModalContent.innerHTML = `
      <img src="${item.url}" alt="${item.name}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
    `;
  }

  mediaPreviewModal.classList.remove('hidden');
}

function closeMediaPreview() {
  if (previewModalContent) {
    previewModalContent.innerHTML = '';
  }
  mediaPreviewModal.classList.add('hidden');
}

// Upload Media Multi-Files (Drag & Drop or File Input)
async function handleMediaFilesUpload(files) {
  if (!files || files.length === 0) return;

  galleryUploadStatus.classList.remove('hidden');

  let successCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    galleryUploadText.textContent = `Mengunggah (${i + 1}/${files.length}): ${file.name}...`;

    const isVid = file.type.startsWith('video/') || isVideoUrl(file.name);
    const mediaType = isVid ? 'video' : 'image';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://minio.navanusa.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!resData.ok || !resData.data?.url) {
        throw new Error(resData.error || 'Gagal upload file');
      }

      const mediaItem = {
        name: file.name,
        type: mediaType,
        url: resData.data.url,
        size: file.size || resData.data.size || 0,
        mime_type: file.type || (isVid ? 'video/mp4' : 'image/jpeg'),
        created_at: new Date().toISOString(),
        store_id: currentConfig.store_id || 'navanusa'
      };

      await saveMediaItem(mediaItem);
      successCount++;
    } catch (err) {
      console.warn('Gagal upload ke MinIO:', err);
      showToast(`Upload ${file.name} gagal: ${err.message}`, 'error');
    }
  }

  galleryUploadStatus.classList.add('hidden');
  if (successCount > 0) {
    showToast(`${successCount} file berhasil diunggah ke Galeri!`, 'success');
  }
}

function setupEventListeners() {
  // Tabs
  tabBtnProducts.addEventListener('click', () => {
    tabBtnProducts.classList.add('active');
    tabBtnBanners.classList.remove('active');
    tabBtnGallery.classList.remove('active');
    tabProductsContent.classList.remove('hidden');
    tabBannersContent.classList.add('hidden');
    tabGalleryContent.classList.add('hidden');
  });

  tabBtnBanners.addEventListener('click', () => {
    tabBtnBanners.classList.add('active');
    tabBtnProducts.classList.remove('active');
    tabBtnGallery.classList.remove('active');
    tabBannersContent.classList.remove('hidden');
    tabProductsContent.classList.add('hidden');
    tabGalleryContent.classList.add('hidden');
    if (bannersList.length === 0) {
      loadBanners();
    }
  });

  tabBtnGallery.addEventListener('click', () => {
    tabBtnGallery.classList.add('active');
    tabBtnProducts.classList.remove('active');
    tabBtnBanners.classList.remove('active');
    tabGalleryContent.classList.remove('hidden');
    tabProductsContent.classList.add('hidden');
    tabBannersContent.classList.add('hidden');
    renderMediaGallery();
  });

  // Picker & Preview Modal Listeners
  btnGalleryPickProduct?.addEventListener('click', () => openMediaPicker('product'));
  btnGalleryPickBanner?.addEventListener('click', () => openMediaPicker('banner'));
  btnPickerClose?.addEventListener('click', closeMediaPicker);
  btnPickerCancel?.addEventListener('click', closeMediaPicker);
  mediaPickerModal?.addEventListener('click', (e) => {
    if (e.target === mediaPickerModal) closeMediaPicker();
  });

  pickerFilterAll?.addEventListener('click', () => {
    activePickerFilter = 'all';
    pickerFilterAll.classList.add('active');
    pickerFilterImages.classList.remove('active');
    pickerFilterVideos.classList.remove('active');
    renderMediaPicker();
  });
  pickerFilterImages?.addEventListener('click', () => {
    activePickerFilter = 'image';
    pickerFilterImages.classList.add('active');
    pickerFilterAll.classList.remove('active');
    pickerFilterVideos.classList.remove('active');
    renderMediaPicker();
  });
  pickerFilterVideos?.addEventListener('click', () => {
    activePickerFilter = 'video';
    pickerFilterVideos.classList.add('active');
    pickerFilterAll.classList.remove('active');
    pickerFilterImages.classList.remove('active');
    renderMediaPicker();
  });
  pickerSearch?.addEventListener('input', renderMediaPicker);

  btnPreviewModalClose?.addEventListener('click', closeMediaPreview);
  mediaPreviewModal?.addEventListener('click', (e) => {
    if (e.target === mediaPreviewModal) closeMediaPreview();
  });
  btnPreviewCopy?.addEventListener('click', () => {
    if (currentPreviewItem) copyMediaUrl(currentPreviewItem.url);
  });
  btnPreviewUseP?.addEventListener('click', () => {
    if (currentPreviewItem) {
      useMediaForProduct(currentPreviewItem.url);
      closeMediaPreview();
    }
  });
  btnPreviewUseB?.addEventListener('click', () => {
    if (currentPreviewItem) {
      useMediaForBanner(currentPreviewItem.url);
      closeMediaPreview();
    }
  });

  // Gallery Toolbar & Filters
  filterAll?.addEventListener('click', () => {
    activeGalleryFilter = 'all';
    filterAll.classList.add('active');
    filterImages.classList.remove('active');
    filterVideos.classList.remove('active');
    renderMediaGallery();
  });
  filterImages?.addEventListener('click', () => {
    activeGalleryFilter = 'image';
    filterImages.classList.add('active');
    filterAll.classList.remove('active');
    filterVideos.classList.remove('active');
    renderMediaGallery();
  });
  filterVideos?.addEventListener('click', () => {
    activeGalleryFilter = 'video';
    filterVideos.classList.add('active');
    filterAll.classList.remove('active');
    filterImages.classList.remove('active');
    renderMediaGallery();
  });
  gallerySearch?.addEventListener('input', renderMediaGallery);
  btnRefreshGallery?.addEventListener('click', loadMediaGallery);

  // Gallery Upload File Inputs & Dropzone
  btnBrowseMedia?.addEventListener('click', () => galleryFileInput.click());
  galleryFileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMediaFilesUpload(e.target.files);
      galleryFileInput.value = '';
    }
  });

  if (galleryDropzone) {
    galleryDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      galleryDropzone.classList.add('drag-over');
    });
    galleryDropzone.addEventListener('dragleave', () => {
      galleryDropzone.classList.remove('drag-over');
    });
    galleryDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      galleryDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleMediaFilesUpload(e.dataTransfer.files);
      }
    });
    galleryDropzone.addEventListener('click', (e) => {
      if (e.target !== btnBrowseMedia && !btnBrowseMedia.contains(e.target)) {
        galleryFileInput.click();
      }
    });
  }

  // Form Add Media URL
  formAddMediaUrl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = inputMediaUrl.value.trim();
    if (!url) return;

    let type = selectMediaType.value;
    if (type === 'auto') {
      type = isVideoUrl(url) ? 'video' : 'image';
    }

    const name = inputMediaName.value.trim() || url.split('/').pop().split('?')[0] || (type === 'video' ? 'video-item.mp4' : 'image-item.jpg');

    const item = {
      name: name,
      type: type,
      url: url,
      size: 0,
      mime_type: type === 'video' ? 'video/mp4' : 'image/jpeg',
      created_at: new Date().toISOString(),
      store_id: currentConfig.store_id || 'navanusa'
    };

    await saveMediaItem(item);
    inputMediaUrl.value = '';
    inputMediaName.value = '';
    selectMediaType.value = 'auto';
    showToast('Media baru berhasil didaftarkan ke galeri!', 'success');
  });

  pName.addEventListener('input', async () => {
    if (!pId.value) {
      if (hasWails() && window.go.main.App.GenerateSlug) {
        pSlug.value = await window.go.main.App.GenerateSlug(pName.value);
      } else {
        pSlug.value = generateSlug(pName.value);
      }
    }
  });

  // MinIO Image & Video Upload Handler
  async function uploadFileToMinio(file, targetInput, previewImg, previewContainer, btnTextEl, defaultText) {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/') || isVideoUrl(file.name);

    if (!isImage && !isVideo) {
      showToast('Pilih file gambar (JPG, PNG, WebP) atau video (MP4, WebM)', 'error');
      return;
    }

    btnTextEl.textContent = 'Mengunggah...';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://minio.navanusa.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.ok || !data.data?.url) {
        throw new Error(data.error || 'Gagal mengunggah media');
      }

      const mediaUrl = data.data.url;
      targetInput.value = mediaUrl;

      if (previewImg) {
        previewImg.src = mediaUrl;
      }
      if (previewContainer) {
        previewContainer.classList.remove('hidden');
      }

      // Otomatis daftarkan file yang diupload ke Galeri Media
      await saveMediaItem({
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: mediaUrl,
        size: file.size || data.data.size || 0,
        mime_type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        created_at: new Date().toISOString(),
        store_id: currentConfig.store_id || 'navanusa'
      });

      showToast('Media berhasil diunggah dan disimpan ke Galeri!', 'success');
    } catch (err) {
      showToast('Gagal upload: ' + err.message, 'error');
    } finally {
      btnTextEl.textContent = defaultText;
    }
  }

  if (btnUploadPImage && pImageFile) {
    btnUploadPImage.addEventListener('click', () => pImageFile.click());
    pImageFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFileToMinio(e.target.files[0], pImage, imagePreview, imagePreviewContainer, btnUploadPText, 'Upload ke MinIO');
        pImageFile.value = '';
      }
    });
  }

  if (btnUploadBImage && bImageFile) {
    btnUploadBImage.addEventListener('click', () => bImageFile.click());
    bImageFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFileToMinio(e.target.files[0], bImage, bannerImagePreview, bannerImagePreviewContainer, btnUploadBText, 'Upload ke MinIO');
        bImageFile.value = '';
      }
    });
  }

  pImage.addEventListener('input', () => {
    const url = pImage.value.trim();
    if (url) {
      imagePreview.src = url;
      imagePreviewContainer.classList.remove('hidden');
    } else {
      imagePreviewContainer.classList.add('hidden');
    }
  });

  bImage.addEventListener('input', () => {
    const url = bImage.value.trim();
    if (url) {
      bannerImagePreview.src = url;
      bannerImagePreviewContainer.classList.remove('hidden');
    } else {
      bannerImagePreviewContainer.classList.add('hidden');
    }
  });

  btnResetBannerForm.addEventListener('click', resetBannerForm);
  btnResetForm.addEventListener('click', resetForm);
  btnRefresh.addEventListener('click', () => {
    loadProducts();
    loadBanners();
    loadStoreIntegrations();
    showToast('Data produk, banner & integrasi diperbarui', 'success');
  });

  // Manual Rebuild Trigger
  btnRebuild.addEventListener('click', async () => {
    if (!currentConfig.deploy_hook_url) {
      showToast('Deploy Hook URL belum diisi di menu Settings', 'error');
      openSettings();
      return;
    }

    if (!confirm('Picu Rebuild Cloudflare Pages untuk meng-generate ulang seluruh halaman statis Astro sekarang?')) {
      return;
    }

    btnRebuild.disabled = true;
    btnRebuild.innerHTML = `<span class="spin" style="margin-right: 0.375rem;">⏳</span> Mengirim Webhook...`;

    try {
      if (hasWails() && window.go.main.App.TriggerRebuild) {
        const msg = await window.go.main.App.TriggerRebuild();
        showToast(msg || 'Rebuild Cloudflare Pages berhasil dipicu!', 'success');
      } else {
        const res = await fetch(currentConfig.deploy_hook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (res.ok) {
          showToast('Rebuild Cloudflare Pages berhasil dipicu!', 'success');
        } else {
          showToast(`Deploy hook status: ${res.status}`, 'error');
        }
      }
    } catch (err) {
      showToast(`Gagal trigger hook: ${err.message || err}`, 'error');
    }

    btnRebuild.disabled = false;
    btnRebuild.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      <span>Rebuild Astro</span>
    `;
  });

  // Settings Modal
  btnSettingsOpen.addEventListener('click', openSettings);
  storeBadge.addEventListener('click', openSettings);
  btnSettingsClose.addEventListener('click', closeSettings);
  btnSettingsCancel.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  // Integrations Modal
  btnIntegrationsOpen.addEventListener('click', openIntegrations);
  btnIntegrationsClose.addEventListener('click', closeIntegrations);
  btnIntegrationsCancel.addEventListener('click', closeIntegrations);
  integrationsModal.addEventListener('click', (e) => {
    if (e.target === integrationsModal) closeIntegrations();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettings();
      closeIntegrations();
    }
  });

  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newCfg = {
      store_id: cfgStoreId.value.trim(),
      store_name: cfgStoreName.value.trim(),
      worker_url: cfgWorkerUrl.value.trim(),
      internal_token: cfgToken.value.trim(),
      deploy_hook_url: cfgDeployHook.value.trim()
    };
    await saveConfig(newCfg);
    closeSettings();
    showToast('Pengaturan berhasil disimpan!', 'success');
    loadProducts();
    loadBanners();
  });

  // Test Mayar Connection
  btnTestMayar.addEventListener('click', async () => {
    const key = inputMayarKey.value.trim();
    if (!key) {
      showToast('Ketik API Key Mayar terlebih dahulu untuk ditest', 'error');
      return;
    }

    btnTestMayar.disabled = true;
    btnTestMayar.textContent = 'Testing...';

    try {
      if (hasWails() && window.go.main.App.TestMayarConnection) {
        const res = await window.go.main.App.TestMayarConnection(key);
        if (res.ok) {
          showToast(res.message || 'Koneksi Mayar Berhasil!', 'success');
        } else {
          showToast(res.error || res.message || 'Koneksi Mayar Gagal', 'error');
        }
      } else {
        const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
        const res = await fetch(`${base}/api/store/test-connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: 'mayar', api_key: key }),
        });
        const data = await res.json();
        if (data.ok) {
          showToast(data.message || 'Koneksi Mayar Berhasil!', 'success');
        } else {
          showToast(data.error || 'Koneksi Mayar Gagal', 'error');
        }
      }
    } catch (err) {
      showToast('Error: ' + (err.message || err), 'error');
    }

    btnTestMayar.disabled = false;
    btnTestMayar.textContent = 'Test Koneksi Mayar';
  });

  // Test Biteship Connection
  btnTestBiteship.addEventListener('click', async () => {
    const key = inputBiteshipKey.value.trim();
    if (!key) {
      showToast('Ketik API Key Biteship terlebih dahulu untuk ditest', 'error');
      return;
    }

    btnTestBiteship.disabled = true;
    btnTestBiteship.textContent = 'Testing...';

    try {
      if (hasWails() && window.go.main.App.TestBiteshipConnection) {
        const res = await window.go.main.App.TestBiteshipConnection(key);
        if (res.ok) {
          showToast(res.message || 'Koneksi Biteship Berhasil!', 'success');
        } else {
          showToast(res.error || res.message || 'Koneksi Biteship Gagal', 'error');
        }
      } else {
        const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
        const res = await fetch(`${base}/api/store/test-connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: 'biteship', api_key: key }),
        });
        const data = await res.json();
        if (data.ok) {
          showToast(data.message || 'Koneksi Biteship Berhasil!', 'success');
        } else {
          showToast(data.error || 'Koneksi Biteship Gagal', 'error');
        }
      }
    } catch (err) {
      showToast('Error: ' + (err.message || err), 'error');
    }

    btnTestBiteship.disabled = false;
    btnTestBiteship.textContent = 'Test Koneksi Biteship';
  });

  // Submit Integrations Form (Encrypted Save)
  integrationsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      store_id: currentConfig.store_id || 'navanusa',
      name: currentConfig.store_name || '',
      mayar_api_key: inputMayarKey.value.trim(),
      mayar_webhook_secret: inputMayarSecret.value.trim(),
      biteship_api_key: inputBiteshipKey.value.trim(),
    };

    const submitBtn = document.getElementById('btn-integrations-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengenkripsi & Menyimpan...';

    try {
      if (hasWails() && window.go.main.App.SaveStoreSettings) {
        await window.go.main.App.SaveStoreSettings(payload);
        showToast('Kredensial berhasil dienkripsi & disimpan ke D1!', 'success');
        inputMayarKey.value = '';
        inputMayarSecret.value = '';
        inputBiteshipKey.value = '';
        await loadStoreIntegrations();
        closeIntegrations();
      } else {
        const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
        const headers = { 'Content-Type': 'application/json' };
        if (currentConfig.internal_token) {
          headers['Authorization'] = `Bearer ${currentConfig.internal_token}`;
        }

        const res = await fetch(`${base}/api/store/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          showToast('Kredensial berhasil dienkripsi & disimpan ke D1!', 'success');
          inputMayarKey.value = '';
          inputMayarSecret.value = '';
          inputBiteshipKey.value = '';
          await loadStoreIntegrations();
          closeIntegrations();
        } else {
          showToast(data.error || 'Gagal menyimpan kredensial', 'error');
        }
      }
    } catch (err) {
      showToast('Error: ' + (err.message || err), 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Simpan Kredensial Terenkripsi';
  });

  // Submit Banner Form
  bannerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let bannerId = bId.value.trim();
    if (!bannerId) {
      if (hasWails() && window.go.main.App.GenerateUUID) {
        bannerId = await window.go.main.App.GenerateUUID();
      } else {
        bannerId = crypto.randomUUID ? crypto.randomUUID() : 'banner-' + Date.now();
      }
    }

    const banner = {
      id: bannerId,
      store_id: currentConfig.store_id || 'navanusa',
      title: bTitle.value.trim(),
      image_url: bImage.value.trim(),
      link_url: bLink.value.trim() || '#',
      link_text: bLinkText.value.trim() || 'view product',
      order_num: parseInt(bOrder.value, 10) || 0,
      is_active: parseInt(bStatus.value, 10) || 1
    };

    btnSyncBanner.disabled = true;
    btnSyncBanner.innerHTML = `<span class="spin" style="margin-right: 0.5rem;">⚙️</span> Menyimpan Banner...`;

    try {
      if (hasWails() && window.go.main.App.SyncBanner) {
        const result = await window.go.main.App.SyncBanner(banner);
        if (result.success) {
          showToast('Banner berhasil disimpan ke D1!', 'success');
          await loadBanners();
          resetBannerForm();
        } else {
          showToast(result.message || 'Gagal menyimpan banner', 'error');
        }
      } else {
        const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
        const headers = { 'Content-Type': 'application/json' };
        if (currentConfig.internal_token) {
          headers['Authorization'] = `Bearer ${currentConfig.internal_token}`;
        }

        const res = await fetch(`${base}/api/banners`, {
          method: 'POST',
          headers,
          body: JSON.stringify(banner),
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          showToast('Banner berhasil disimpan ke D1!', 'success');
          await loadBanners();
          resetBannerForm();
        } else {
          showToast(data.error || 'Gagal menyimpan banner', 'error');
        }
      }
    } catch (err) {
      showToast('Error: ' + (err.message || err), 'error');
    }

    btnSyncBanner.disabled = false;
    btnSyncBanner.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      <span>Simpan Banner ke D1</span>
    `;
  });

  // Product Form Submission (2-Step Sync)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let productId = pId.value.trim();
    if (!productId) {
      if (hasWails() && window.go.main.App.GenerateUUID) {
        productId = await window.go.main.App.GenerateUUID();
      } else {
        productId = crypto.randomUUID ? crypto.randomUUID() : 'prod-' + Date.now();
      }
    }

    const product = {
      id: productId,
      store_id: currentConfig.store_id || 'navanusa',
      name: pName.value.trim(),
      slug: pSlug.value.trim(),
      description: pDesc.value.trim(),
      price: parseInt(pPrice.value, 10) || 0,
      stock: parseInt(pStock.value, 10) || 0,
      weight_gram: parseInt(pWeight.value, 10) || 0,
      image_url: pImage.value.trim(),
      is_active: parseInt(pStatus.value, 10) || 1
    };

    btnSync.disabled = true;
    btnSync.innerHTML = `<span class="spin" style="margin-right: 0.5rem;">⚙️</span> Menyinkronkan Produk...`;

    syncLogBox.classList.remove('hidden');
    stepD1.querySelector('.step-indicator').className = 'step-indicator step-loading';
    stepD1Status.textContent = 'Mengirim data produk ke Cloudflare Worker / D1...';
    stepHook.querySelector('.step-indicator').className = 'step-indicator';
    stepHookStatus.textContent = 'Menunggu langkah 1 selesai...';

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      syncTimer.textContent = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    }, 100);

    try {
      if (hasWails() && window.go.main.App.SyncProduct) {
        const result = await window.go.main.App.SyncProduct(product);
        clearInterval(timerInterval);

        if (result.success) {
          stepD1.querySelector('.step-indicator').className = 'step-indicator step-success';
          stepD1Status.textContent = result.d1_status || 'Sukses disimpan ke D1';

          stepHook.querySelector('.step-indicator').className = 'step-indicator step-success';
          stepHookStatus.textContent = result.deploy_hook_status || 'Deploy hook selesai';

          showToast('Produk berhasil disinkronkan!', 'success');
          await loadProducts();
          resetForm();
        } else {
          stepD1.querySelector('.step-indicator').className = 'step-indicator step-error';
          stepD1Status.textContent = result.message || 'Gagal sinkronisasi';
          showToast(result.message || 'Gagal sinkronisasi', 'error');
        }
      } else {
        const base = (currentConfig.worker_url || 'http://localhost:4321').replace(/\/+$/, '');
        const headers = { 'Content-Type': 'application/json' };
        if (currentConfig.internal_token) {
          headers['Authorization'] = `Bearer ${currentConfig.internal_token}`;
        }

        const syncRes = await fetch(`${base}/api/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(product)
        });

        const syncData = await syncRes.json();
        if (!syncRes.ok || !syncData.ok) {
          throw new Error(syncData.error || `HTTP ${syncRes.status}`);
        }

        stepD1.querySelector('.step-indicator').className = 'step-indicator step-success';
        stepD1Status.textContent = `Sukses disimpan ke D1 (ID: ${product.id})`;

        if (currentConfig.deploy_hook_url) {
          stepHook.querySelector('.step-indicator').className = 'step-indicator step-loading';
          stepHookStatus.textContent = 'Memicu rebuild statis di Cloudflare Pages...';

          try {
            const hookRes = await fetch(currentConfig.deploy_hook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });

            if (hookRes.ok) {
              stepHook.querySelector('.step-indicator').className = 'step-indicator step-success';
              stepHookStatus.textContent = `Rebuild Astro berhasil dimulai (HTTP ${hookRes.status})`;
            } else {
              stepHook.querySelector('.step-indicator').className = 'step-indicator step-error';
              stepHookStatus.textContent = `Deploy Hook Warning (HTTP ${hookRes.status})`;
            }
          } catch (hookErr) {
            stepHook.querySelector('.step-indicator').className = 'step-indicator step-error';
            stepHookStatus.textContent = `Deploy Hook Gagal: ${hookErr.message}`;
          }
        } else {
          stepHook.querySelector('.step-indicator').className = 'step-indicator step-success';
          stepHookStatus.textContent = 'Dilewati (Deploy Hook URL kosong)';
        }

        clearInterval(timerInterval);
        showToast('Produk berhasil disinkronkan!', 'success');
        await loadProducts();
        resetForm();
      }
    } catch (err) {
      clearInterval(timerInterval);
      stepD1.querySelector('.step-indicator').className = 'step-indicator step-error';
      stepD1Status.textContent = `Gagal: ${err.message || err}`;
      showToast(`Gagal: ${err.message || err}`, 'error');
    }

    btnSync.disabled = false;
    btnSync.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      <span>Sync ke D1 & Rebuild Astro</span>
    `;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadProducts();
  await loadBanners();
  await loadMediaGallery();
  await loadStoreIntegrations();
  setupEventListeners();
});
