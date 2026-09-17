package models

type SyncResult struct {
	ProductID        string `json:"product_id"`
	ProductName      string `json:"product_name"`
	Success          bool   `json:"success"`
	Message          string `json:"message"`
	D1Status         string `json:"d1_status"`
	DeployHookStatus string `json:"deploy_hook_status"`
	Timestamp        int64  `json:"timestamp"`
}
