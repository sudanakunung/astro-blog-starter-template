package models

type Product struct {
	ID          string `json:"id"`
	StoreID     string `json:"store_id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
	Stock       int64  `json:"stock"`
	ImageURL    string `json:"image_url"`
	WeightGram  int64  `json:"weight_gram"`
	IsActive    int    `json:"is_active"`
	CreatedAt   int64  `json:"created_at,omitempty"`
	UpdatedAt   int64  `json:"updated_at,omitempty"`
}
