const Cart = require('../models/Cart');

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.params.userId || 1; // Por simplicidad usamos userId 1
      const cartItems = await Cart.getByUserId(userId);
      const total = await Cart.getTotal(userId);
      res.json({ success: true, data: { items: cartItems, total } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async addItem(req, res) {
    try {
      const userId = req.body.userId || 1;
      const { productId, quantity } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId es requerido' });
      }

      const item = await Cart.addItem(userId, productId, quantity || 1);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateQuantity(req, res) {
    try {
      const userId = req.body.userId || 1;
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'productId y quantity son requeridos'
        });
      }

      const item = await Cart.updateQuantity(userId, productId, quantity);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item no encontrado' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async removeItem(req, res) {
    try {
      const userId = req.body.userId || 1;
      const { productId } = req.params;

      const item = await Cart.removeItem(userId, productId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item no encontrado' });
      }
      res.json({ success: true, message: 'Item eliminado del carrito' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async clearCart(req, res) {
    try {
      const userId = req.params.userId || 1;
      await Cart.clearCart(userId);
      res.json({ success: true, message: 'Carrito vaciado correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = cartController;
