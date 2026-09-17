package models

type StoreSettings struct {
	StoreID             string `json:"store_id"`
	StoreName           string `json:"name,omitempty"`
	MayarAPIKey         string `json:"mayar_api_key"`
	MayarWebhookSecret  string `json:"mayar_webhook_secret"`
	BiteshipAPIKey      string `json:"biteship_api_key"`
}

type StoreSettingsStatus struct {
	StoreID             string `json:"store_id"`
	StoreName           string `json:"name"`
	HasMayarKey         bool   `json:"has_mayar_key"`
	MayarKeyPreview     string `json:"mayar_key_preview"`
	HasMayarWebhook     bool   `json:"has_mayar_webhook"`
	HasBiteshipKey      bool   `json:"has_biteship_key"`
	BiteshipKeyPreview  string `json:"biteship_key_preview"`
}

type ConnectionTestResult struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
