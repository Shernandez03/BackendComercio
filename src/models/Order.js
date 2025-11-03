const pool = require('../config/database');

class Order {
  static async create(userId, total, shippingAddress, items) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Crear la orden
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total, shipping_address, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, total, shippingAddress, 'pending']
      );
      const order = orderResult.rows[0];

      // Insertar los items de la orden
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price]
        );

        // Actualizar stock
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getById(id) {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) return null;

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;
    return order;
  }

  static async getByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = Order;
