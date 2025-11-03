const Order = require('../models/Order');
const Cart = require('../models/Cart');

const orderController = {
  async createOrder(req, res) {
    try {
      const userId = req.body.userId || 1;
      const { shippingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'La dirección de envío es requerida'
        });
      }

      // Obtener items del carrito
      const cartItems = await Cart.getByUserId(userId);

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El carrito está vacío'
        });
      }

      // Calcular total
      const total = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);

      // Crear orden
      const order = await Order.create(userId, total, shippingAddress, cartItems);

      // Limpiar carrito
      await Cart.clearCart(userId);

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await Order.getById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserOrders(req, res) {
    try {
      const userId = req.params.userId || 1;
      const orders = await Order.getByUserId(userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAllOrders(req, res) {
    try {
      const orders = await Order.getAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await Order.updateStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = orderController;
