import type { Order, OrderItem } from '../../types/d1';

export interface CreateOrderParams {
  id: string;
  store_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  total_amount: number;
  shipping_cost: number;
  shipping_courier?: string;
  shipping_service?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
}

export async function createOrder(db: D1Database, params: CreateOrderParams): Promise<{ success: boolean; orderId: string; error?: string }> {
  try {
    const statements: any[] = [];

    // 1. Insert main order
    statements.push(
      db.prepare(
        `INSERT INTO orders (id, store_id, customer_id, customer_name, customer_phone, customer_email, shipping_address, status, total_amount, shipping_cost, shipping_courier, shipping_service, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, unixepoch(), unixepoch())`
      ).bind(
        params.id,
        params.store_id,
        params.customer_id || null,
        params.customer_name,
        params.customer_phone,
        params.customer_email || null,
        params.shipping_address,
        Math.round(params.total_amount),
        Math.round(params.shipping_cost),
        params.shipping_courier || null,
        params.shipping_service || null
      )
    );

    // 2. Insert order items
    for (const item of params.items) {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      statements.push(
        db.prepare(
          `INSERT INTO order_items (id, order_id, product_id, product_name, price, qty, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          itemId,
          params.id,
          item.product_id,
          item.product_name,
          Math.round(item.price),
          Math.round(item.qty),
          Math.round(item.subtotal)
        )
      );

      // 3. Decrement stock if product exists
      statements.push(
        db.prepare(
          `UPDATE products 
           SET stock = MAX(0, stock - ?), updated_at = unixepoch() 
           WHERE id = ?`
        ).bind(Math.round(item.qty), item.product_id)
      );
    }

    // Execute in batch transaction
    await db.batch(statements);

    return { success: true, orderId: params.id };
  } catch (error: any) {
    console.error('Error creating order in D1:', error);
    return { success: false, orderId: params.id, error: error.message || 'Failed to create order' };
  }
}

export async function getOrderById(db: D1Database, storeId: string, orderId: string): Promise<{ order: Order | null; items: OrderItem[] }> {
  try {
    const order = await db
      .prepare(
        `SELECT id, store_id, customer_name, customer_phone, customer_email, shipping_address, status, total_amount, shipping_cost, mayar_transaction_id, biteship_order_id, tracking_number, created_at, updated_at 
         FROM orders 
         WHERE id = ? AND store_id = ? 
         LIMIT 1`
      )
      .bind(orderId, storeId)
      .first<Order>();

    if (!order) {
      return { order: null, items: [] };
    }

    const { results: items } = await db
      .prepare(
        `SELECT id, order_id, product_id, product_name, price, qty, subtotal 
         FROM order_items 
         WHERE order_id = ?`
      )
      .bind(orderId)
      .all<OrderItem>();

    return { order, items: items ?? [] };
  } catch (error) {
    console.error('Error fetching order by ID from D1:', error);
    return { order: null, items: [] };
  }
}
