package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"wails-app/pkg/models"
)

type SettingsService struct {
	httpClient *http.Client
}

func NewSettingsService() *SettingsService {
	return &SettingsService{
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// SaveStoreSettings mengirim kredensial sensitif ke Worker untuk dienkripsi dan disimpan di D1
func (s *SettingsService) SaveStoreSettings(settings models.StoreSettings, cfg models.StoreConfig) error {
	if cfg.WorkerURL == "" {
		return fmt.Errorf("worker URL belum dikonfigurasi")
	}

	workerURL := strings.TrimRight(cfg.WorkerURL, "/")
	if settings.StoreID == "" {
		settings.StoreID = cfg.StoreID
	}

	payload, err := json.Marshal(settings)
	if err != nil {
		return fmt.Errorf("gagal serialize JSON settings: %w", err)
	}

	req, err := http.NewRequest("POST", workerURL+"/api/store/settings", bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("gagal membuat request: %w", err)
	}

	if cfg.InternalToken != "" {
		req.Header.Set("Authorization", "Bearer "+cfg.InternalToken)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("gagal menghubungi Worker: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("worker error (HTTP %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// GetStoreSettingsStatus mengambil status tersimpan (masked) dari D1
func (s *SettingsService) GetStoreSettingsStatus(cfg models.StoreConfig) (*models.StoreSettingsStatus, error) {
	if cfg.WorkerURL == "" {
		return nil, fmt.Errorf("worker URL belum dikonfigurasi")
	}

	workerURL := strings.TrimRight(cfg.WorkerURL, "/")
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/store/settings?store_id=%s", workerURL, cfg.StoreID), nil)
	if err != nil {
		return nil, err
	}

	if cfg.InternalToken != "" {
		req.Header.Set("Authorization", "Bearer "+cfg.InternalToken)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error status %d: %s", resp.StatusCode, string(body))
	}

	var status models.StoreSettingsStatus
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		return nil, err
	}

	return &status, nil
}

// TestMayarConnection menguji langsung kredensial ke API Mayar
func (s *SettingsService) TestMayarConnection(apiKey string) (models.ConnectionTestResult, error) {
	if apiKey == "" {
		return models.ConnectionTestResult{OK: false, Error: "API Key Mayar tidak boleh kosong"}, nil
	}

	req, err := http.NewRequest("GET", "https://api.mayar.id/hl/v1/user/profile", nil)
	if err != nil {
		return models.ConnectionTestResult{OK: false, Error: err.Error()}, err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return models.ConnectionTestResult{OK: false, Error: "Gagal kontak server Mayar: " + err.Error()}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		return models.ConnectionTestResult{OK: true, Message: "Koneksi ke Mayar Payment Gateway Berhasil!"}, nil
	}

	body, _ := io.ReadAll(resp.Body)
	return models.ConnectionTestResult{
		OK:    false,
		Error: fmt.Sprintf("Mayar API error (HTTP %d): %s", resp.StatusCode, string(body)),
	}, nil
}

// TestBiteshipConnection menguji langsung kredensial ke API Biteship
func (s *SettingsService) TestBiteshipConnection(apiKey string) (models.ConnectionTestResult, error) {
	if apiKey == "" {
		return models.ConnectionTestResult{OK: false, Error: "API Key Biteship tidak boleh kosong"}, nil
	}

	req, err := http.NewRequest("GET", "https://api.biteship.com/v1/couriers", nil)
	if err != nil {
		return models.ConnectionTestResult{OK: false, Error: err.Error()}, err
	}
	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return models.ConnectionTestResult{OK: false, Error: "Gagal kontak server Biteship: " + err.Error()}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		return models.ConnectionTestResult{OK: true, Message: "Koneksi ke Biteship Logistics API Berhasil!"}, nil
	}

	body, _ := io.ReadAll(resp.Body)
	return models.ConnectionTestResult{
		OK:    false,
		Error: fmt.Sprintf("Biteship API error (HTTP %d): %s", resp.StatusCode, string(body)),
	}, nil
}
