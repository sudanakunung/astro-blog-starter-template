export interface Store {
  id: string;
  name: string;
  domain: string | null;
  mayar_api_key?: string | null;
  mayar_webhook_secret?: string | null;
  biteship_api_key?: string | null;
  status: 'active' | 'suspended' | 'trial';
  created_at: number;
  updated_at: number;
}

export interface D1Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  category?: string | null;
  price: number; // Disimpan dalam integer Rupiah
  stock: number;
  image_url: string | null;
  weight_gram: number | null;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  shipping_cost: number;
  mayar_transaction_id?: string | null;
  biteship_order_id?: string | null;
  tracking_number?: string | null;
  created_at: number;
  updated_at: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface StockReservation {
  id: string;
  product_id: string;
  order_id: string;
  qty: number;
  status: 'active' | 'released' | 'committed';
  expires_at: number;
  created_at: number;
}

export interface D1Banner {
  id: string;
  store_id: string;
  title: string;
  image_url: string;
  link_url: string;
  link_text: string;
  order_num: number;
  is_active: number;
  created_at: number;
  updated_at: number;
}

