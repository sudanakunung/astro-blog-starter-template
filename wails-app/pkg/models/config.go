package models

type StoreConfig struct {
	StoreID       string `json:"store_id"`
	StoreName     string `json:"store_name"`
	WorkerURL     string `json:"worker_url"`
	InternalToken string `json:"internal_token"`
	DeployHookURL string `json:"deploy_hook_url"`
}
