package models

type MediaItem struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`       // "image" or "video"
	URL       string `json:"url"`        // Direct link URL
	Size      int64  `json:"size"`       // Size in bytes
	MimeType  string `json:"mime_type"`  // e.g. "image/jpeg", "video/mp4"
	CreatedAt string `json:"created_at"` // ISO string
	StoreID   string `json:"store_id"`
}
