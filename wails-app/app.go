package main

import (
	"context"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"wails-app/pkg/models"
	"wails-app/pkg/services"
	"wails-app/pkg/storage"
)

// App struct
type App struct {
	ctx             context.Context
	syncService     *services.SyncService
	settingsService *services.SettingsService
	configStorage   *storage.ConfigStorage
	mediaStorage    *storage.MediaStorage
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		syncService:     services.NewSyncService(),
		settingsService: services.NewSettingsService(),
		configStorage:   storage.NewConfigStorage(),
		mediaStorage:    storage.NewMediaStorage(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetConfig returns the saved store configuration
func (a *App) GetConfig() (models.StoreConfig, error) {
	return a.configStorage.Load()
}

// SaveConfig saves the store configuration
func (a *App) SaveConfig(cfg models.StoreConfig) error {
	return a.configStorage.Save(cfg)
}

// SyncProduct performs the 2-step synchronization (D1 upsert + Deploy Hook)
func (a *App) SyncProduct(product models.Product) (models.SyncResult, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return models.SyncResult{
			Success: false,
			Message: "Gagal membaca konfigurasi toko",
		}, err
	}

	if product.ID == "" {
		product.ID = uuid.NewString()
	}
	if product.StoreID == "" {
		product.StoreID = cfg.StoreID
	}

	return a.syncService.SyncProduct(product, cfg)
}

// FetchProducts retrieves current products from the remote Worker D1
func (a *App) FetchProducts() ([]models.Product, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return nil, err
	}
	return a.syncService.FetchRemoteProducts(cfg)
}

// TriggerRebuild triggers Cloudflare Pages deploy hook manually
func (a *App) TriggerRebuild() (string, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return "", err
	}
	return a.syncService.TriggerRebuild(cfg)
}

// SyncBanner mengirim data banner ke D1
func (a *App) SyncBanner(banner models.Banner) (models.SyncResult, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return models.SyncResult{
			Success: false,
			Message: "Gagal membaca konfigurasi toko",
		}, err
	}

	if banner.ID == "" {
		banner.ID = uuid.NewString()
	}
	if banner.StoreID == "" {
		banner.StoreID = cfg.StoreID
	}

	return a.syncService.SyncBanner(banner, cfg)
}

// FetchBanners mengambil semua banner dari D1
func (a *App) FetchBanners() ([]models.Banner, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return nil, err
	}
	return a.syncService.FetchRemoteBanners(cfg)
}

// DeleteBanner menghapus banner dari D1
func (a *App) DeleteBanner(bannerID string) error {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return err
	}
	return a.syncService.DeleteRemoteBanner(bannerID, cfg)
}


// SaveStoreSettings mengirim kredensial Mayar & Biteship ke D1 via Worker (dienkripsi di server)
func (a *App) SaveStoreSettings(settings models.StoreSettings) error {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return err
	}
	return a.settingsService.SaveStoreSettings(settings, cfg)
}

// GetStoreSettingsStatus mengambil status masked dari D1
func (a *App) GetStoreSettingsStatus() (*models.StoreSettingsStatus, error) {
	cfg, err := a.configStorage.Load()
	if err != nil {
		return nil, err
	}
	return a.settingsService.GetStoreSettingsStatus(cfg)
}

// TestMayarConnection menguji API key Mayar
func (a *App) TestMayarConnection(apiKey string) (models.ConnectionTestResult, error) {
	return a.settingsService.TestMayarConnection(apiKey)
}

// TestBiteshipConnection menguji API key Biteship
func (a *App) TestBiteshipConnection(apiKey string) (models.ConnectionTestResult, error) {
	return a.settingsService.TestBiteshipConnection(apiKey)
}

// GenerateSlug helper to create URL-friendly slug from title/name
func (a *App) GenerateSlug(name string) string {
	slug := strings.ToLower(name)
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}

// GenerateUUID helper to generate new product ID
func (a *App) GenerateUUID() string {
	return uuid.NewString()
}

// GetMediaList mengambil daftar foto dan video dari media storage
func (a *App) GetMediaList() ([]models.MediaItem, error) {
	return a.mediaStorage.LoadAll()
}

// SaveMediaItem menyimpan atau mengupdate item media
func (a *App) SaveMediaItem(item models.MediaItem) (models.MediaItem, error) {
	cfg, _ := a.configStorage.Load()
	if item.StoreID == "" {
		item.StoreID = cfg.StoreID
	}
	return a.mediaStorage.Save(item)
}

// DeleteMediaItem menghapus item media berdasarkan ID
func (a *App) DeleteMediaItem(id string) error {
	return a.mediaStorage.Delete(id)
}

