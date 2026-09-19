package models

type Banner struct {
	ID        string `json:"id"`
	StoreID   string `json:"store_id"`
	Title     string `json:"title"`
	ImageURL  string `json:"image_url"`
	LinkURL   string `json:"link_url"`
	LinkText  string `json:"link_text"`
	OrderNum  int    `json:"order_num"`
	IsActive  int    `json:"is_active"`
	CreatedAt int64  `json:"created_at,omitempty"`
	UpdatedAt int64  `json:"updated_at,omitempty"`
}
