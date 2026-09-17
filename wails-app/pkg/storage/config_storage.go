package storage

import (
	"encoding/json"
	"os"
	"path/filepath"

	"wails-app/pkg/models"
)

type ConfigStorage struct {
	filePath string
}

func NewConfigStorage() *ConfigStorage {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "."
	}
	appDir := filepath.Join(configDir, "astro-wails-admin")
	_ = os.MkdirAll(appDir, 0755)

	return &ConfigStorage{
		filePath: filepath.Join(appDir, "config.json"),
	}
}

func (s *ConfigStorage) Load() (models.StoreConfig, error) {
	var cfg models.StoreConfig

	// Cek jika file belum ada, return default
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return models.StoreConfig{
			StoreID:       "navanusa",
			StoreName:     "Navanusa Store",
			WorkerURL:     "http://localhost:4321",
			InternalToken: "",
			DeployHookURL: "",
		}, nil
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, err
	}

	return cfg, nil
}

func (s *ConfigStorage) Save(cfg models.StoreConfig) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.filePath, data, 0644)
}
