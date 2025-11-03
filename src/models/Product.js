const pool = require('../config/database');

class Product {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC',
      [category]
    );
    return result.rows;
  }

  static async create(productData) {
    const { name, description, price, image_url, stock, category } = productData;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, stock, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, image_url, stock, category]
    );
    return result.rows[0];
  }

  static async update(id, productData) {
    const { name, description, price, image_url, stock, category } = productData;
    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, image_url = $4, stock = $5, category = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, image_url, stock, category, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async updateStock(id, quantity) {
    const result = await pool.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    return result.rows[0];
  }
}

module.exports = Product;
