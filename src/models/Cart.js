const pool = require('../config/database');

class Cart {
  static async getByUserId(userId) {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.user_id,
              p.id as product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  static async addItem(userId, productId, quantity = 1) {
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  }

  static async updateQuantity(userId, productId, quantity) {
    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $3
       WHERE user_id = $1 AND product_id = $2
       RETURNING *`,
      [userId, productId, quantity]
    );
    return result.rows[0];
  }

  static async removeItem(userId, productId) {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );
    return result.rows[0];
  }

  static async clearCart(userId) {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  }

  static async getTotal(userId) {
    const result = await pool.query(
      `SELECT SUM(p.price * ci.quantity) as total
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    return parseFloat(result.rows[0].total) || 0;
  }
}

module.exports = Cart;
