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
	ctx           context.Context
	syncService   *services.SyncService
	configStorage *storage.ConfigStorage
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		syncService:   services.NewSyncService(),
		configStorage: storage.NewConfigStorage(),
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

// GenerateSlug helper to create URL-friendly slug from title/name
func (a *App) GenerateSlug(name string) string {
	slug := strings.ToLower(name)
	// Replace non-alphanumeric with hyphen
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}

// GenerateUUID helper to generate new product ID
func (a *App) GenerateUUID() string {
	return uuid.NewString()
}
