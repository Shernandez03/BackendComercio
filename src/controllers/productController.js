const Product = require('../models/Product');

const productController = {
  async getAllProducts(req, res) {
    try {
      const products = await Product.getAll();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Product.getById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const products = await Product.getByCategory(req.params.category);
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const product = await Product.update(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const product = await Product.delete(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = productController;
