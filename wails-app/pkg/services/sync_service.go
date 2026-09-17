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

type SyncService struct {
	httpClient *http.Client
}

func NewSyncService() *SyncService {
	return &SyncService{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SyncProduct melakukan 2 langkah sinkronisasi:
// 1. Kirim data produk ke Cloudflare Worker / Astro API (simpan ke D1)
// 2. Trigger rebuild Astro via Cloudflare Pages Deploy Hook
func (s *SyncService) SyncProduct(product models.Product, cfg models.StoreConfig) (models.SyncResult, error) {
	result := models.SyncResult{
		ProductID:   product.ID,
		ProductName: product.Name,
		Timestamp:   time.Now().Unix(),
	}

	if cfg.WorkerURL == "" {
		result.Success = false
		result.Message = "Worker URL belum dikonfigurasi"
		return result, fmt.Errorf("worker url is required")
	}

	workerURL := strings.TrimRight(cfg.WorkerURL, "/")
	if product.StoreID == "" {
		product.StoreID = cfg.StoreID
	}

	// ==========================================
	// LANGKAH 1: Kirim data produk ke Worker / D1
	// ==========================================
	payload, err := json.Marshal(product)
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("Gagal encode JSON produk: %v", err)
		return result, err
	}

	req, err := http.NewRequest("POST", workerURL+"/api/products", bytes.NewBuffer(payload))
	if err != nil {
		result.Success = false
		result.Message = fmt.Sprintf("Gagal membuat HTTP request: %v", err)
		return result, err
	}

	if cfg.InternalToken != "" {
		req.Header.Set("Authorization", "Bearer "+cfg.InternalToken)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		result.Success = false
		result.D1Status = "Error: " + err.Error()
		result.Message = fmt.Sprintf("Gagal menghubungi Worker API: %v", err)
		return result, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		result.Success = false
		result.D1Status = fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(respBody))
		result.Message = fmt.Sprintf("Gagal simpan ke D1 (Status %d): %s", resp.StatusCode, string(respBody))
		return result, fmt.Errorf("worker returned status %d: %s", resp.StatusCode, string(respBody))
	}

	result.D1Status = fmt.Sprintf("Sukses disimpan ke D1 (HTTP %d)", resp.StatusCode)

	// ==========================================
	// LANGKAH 2: Trigger rebuild Astro via Deploy Hook
	// ==========================================
	if cfg.DeployHookURL != "" {
		deployReq, err := http.NewRequest("POST", cfg.DeployHookURL, bytes.NewBuffer([]byte("{}")))
		if err != nil {
			result.DeployHookStatus = fmt.Sprintf("Deploy Hook Error: %v", err)
		} else {
			deployReq.Header.Set("Content-Type", "application/json")
			deployResp, err := s.httpClient.Do(deployReq)
			if err != nil {
				result.DeployHookStatus = fmt.Sprintf("Deploy Hook Gagal: %v", err)
			} else {
				defer deployResp.Body.Close()
				deployBody, _ := io.ReadAll(deployResp.Body)
				if deployResp.StatusCode >= 200 && deployResp.StatusCode < 300 {
					result.DeployHookStatus = fmt.Sprintf("Rebuild Astro Berhasil Diterima (HTTP %d)", deployResp.StatusCode)
				} else {
					result.DeployHookStatus = fmt.Sprintf("Deploy Hook Warning (HTTP %d): %s", deployResp.StatusCode, string(deployBody))
				}
			}
		}
	} else {
		result.DeployHookStatus = "Dilewati (Deploy Hook URL tidak diisi)"
	}

	result.Success = true
	result.Message = "Produk berhasil disinkronisasi ke D1 & Rebuild Astro ditrigger"
	return result, nil
}

// FetchRemoteProducts mengambil daftar produk aktif dari D1 via Worker API
func (s *SyncService) FetchRemoteProducts(cfg models.StoreConfig) ([]models.Product, error) {
	if cfg.WorkerURL == "" {
		return nil, fmt.Errorf("worker url is required")
	}

	workerURL := strings.TrimRight(cfg.WorkerURL, "/")
	targetURL := fmt.Sprintf("%s/api/products?store_id=%s&all=true", workerURL, cfg.StoreID)

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal fetch produk: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("worker returned status %d: %s", resp.StatusCode, string(body))
	}

	var products []models.Product
	if err := json.NewDecoder(resp.Body).Decode(&products); err != nil {
		return nil, fmt.Errorf("gagal decode response json: %w", err)
	}

	return products, nil
}

// TriggerRebuild memanggil Deploy Hook Cloudflare Pages secara manual
func (s *SyncService) TriggerRebuild(cfg models.StoreConfig) (string, error) {
	if cfg.DeployHookURL == "" {
		return "", fmt.Errorf("deploy hook url belum diatur")
	}

	req, err := http.NewRequest("POST", cfg.DeployHookURL, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("gagal trigger deploy hook: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return fmt.Sprintf("Build Astro berhasil dimulai (HTTP %d)", resp.StatusCode), nil
	}

	return "", fmt.Errorf("deploy hook error (HTTP %d): %s", resp.StatusCode, string(body))
}
