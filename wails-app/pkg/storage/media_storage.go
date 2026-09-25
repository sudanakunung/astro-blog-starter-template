package storage

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
	"wails-app/pkg/models"
)

type MediaStorage struct {
	filePath string
	mu       sync.RWMutex
}

func NewMediaStorage() *MediaStorage {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "."
	}
	appDir := filepath.Join(configDir, "astro-wails-admin")
	_ = os.MkdirAll(appDir, 0755)

	return &MediaStorage{
		filePath: filepath.Join(appDir, "media_gallery.json"),
	}
}

func (s *MediaStorage) LoadAll() ([]models.MediaItem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := os.ReadFile(s.filePath)
	if err != nil {
		// Jika belum ada file, buat default list kosong
		return []models.MediaItem{}, nil
	}

	var items []models.MediaItem
	if err := json.Unmarshal(data, &items); err != nil {
		return []models.MediaItem{}, err
	}

	return items, nil
}

func (s *MediaStorage) Save(item models.MediaItem) (models.MediaItem, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	items, _ := s.loadUnlocked()

	if item.ID == "" {
		item.ID = uuid.NewString()
	}
	if item.CreatedAt == "" {
		item.CreatedAt = time.Now().Format(time.RFC3339)
	}

	// Update jika sudah ada ID-nya, atau append jika baru
	found := false
	for i, existing := range items {
		if existing.ID == item.ID {
			items[i] = item
			found = true
			break
		}
	}

	if !found {
		// Prepend item baru ke urutan teratas
		items = append([]models.MediaItem{item}, items...)
	}

	data, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return item, err
	}

	err = os.WriteFile(s.filePath, data, 0644)
	return item, err
}

func (s *MediaStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	items, _ := s.loadUnlocked()
	var updated []models.MediaItem
	for _, it := range items {
		if it.ID != id {
			updated = append(updated, it)
		}
	}

	data, err := json.MarshalIndent(updated, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filePath, data, 0644)
}

func (s *MediaStorage) loadUnlocked() ([]models.MediaItem, error) {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return []models.MediaItem{}, nil
	}

	var items []models.MediaItem
	if err := json.Unmarshal(data, &items); err != nil {
		return []models.MediaItem{}, err
	}
	return items, nil
}
