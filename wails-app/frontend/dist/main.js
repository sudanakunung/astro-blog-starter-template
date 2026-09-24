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
const tabProductsContent = document.getElementById('tab-products-content');
const tabBannersContent = document.getElementById('tab-banners-content');

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

function setupEventListeners() {
  // Tabs
  tabBtnProducts.addEventListener('click', () => {
    tabBtnProducts.classList.add('active');
    tabBtnBanners.classList.remove('active');
    tabProductsContent.classList.remove('hidden');
    tabBannersContent.classList.add('hidden');
  });

  tabBtnBanners.addEventListener('click', () => {
    tabBtnBanners.classList.add('active');
    tabBtnProducts.classList.remove('active');
    tabBannersContent.classList.remove('hidden');
    tabProductsContent.classList.add('hidden');
    if (bannersList.length === 0) {
      loadBanners();
    }
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

  // MinIO Image Upload Handler
  async function uploadFileToMinio(file, targetInput, previewImg, previewContainer, btnTextEl, defaultText) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Pilih file gambar yang valid (JPG, PNG, WebP)', 'error');
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
        throw new Error(data.error || 'Gagal mengunggah gambar');
      }

      targetInput.value = data.data.url;
      previewImg.src = data.data.url;
      previewContainer.classList.remove('hidden');
      showToast('Gambar berhasil diunggah ke MinIO!', 'success');
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
  await loadStoreIntegrations();
  setupEventListeners();
});
