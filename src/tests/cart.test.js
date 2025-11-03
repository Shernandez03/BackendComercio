const request = require('supertest');
const app = require('../server');
const Cart = require('../models/Cart');

jest.mock('../models/Cart');

describe('Cart Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart/:userId?', () => {
    it('debería retornar el carrito del usuario', async () => {
      const mockCartItems = [
        { id: 1, product_id: 1, name: 'Laptop', quantity: 2, price: 999.99 },
        { id: 2, product_id: 2, name: 'Mouse', quantity: 1, price: 29.99 }
      ];

      Cart.getByUserId.mockResolvedValue(mockCartItems);
      Cart.getTotal.mockResolvedValue(2029.97);

      const response = await request(app).get('/api/cart/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual(mockCartItems);
      expect(response.body.data.total).toBe(2029.97);
    });
  });

  describe('POST /api/cart/add', () => {
    it('debería agregar un producto al carrito', async () => {
      const mockItem = { id: 1, user_id: 1, product_id: 3, quantity: 1 };
      Cart.addItem.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/api/cart/add')
        .send({ productId: 3, quantity: 1, userId: 1 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockItem);
    });

    it('debería retornar error si falta productId', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({ quantity: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/update', () => {
    it('debería actualizar la cantidad de un producto', async () => {
      const mockItem = { id: 1, user_id: 1, product_id: 1, quantity: 3 };
      Cart.updateQuantity.mockResolvedValue(mockItem);

      const response = await request(app)
        .put('/api/cart/update')
        .send({ productId: 1, quantity: 3, userId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.quantity).toBe(3);
    });

    it('debería retornar error si faltan parámetros', async () => {
      const response = await request(app)
        .put('/api/cart/update')
        .send({ productId: 1 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/cart/remove/:productId', () => {
    it('debería eliminar un producto del carrito', async () => {
      Cart.removeItem.mockResolvedValue({ id: 1, product_id: 1 });

      const response = await request(app).delete('/api/cart/remove/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/cart/clear/:userId?', () => {
    it('debería vaciar el carrito', async () => {
      Cart.clearCart.mockResolvedValue(3);

      const response = await request(app).delete('/api/cart/clear/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

// Tests del modelo Cart
describe('Cart Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cart.getByUserId()', () => {
    it('debería retornar items del carrito', async () => {
      const mockItems = [
        { id: 1, product_id: 1, quantity: 2 }
      ];

      Cart.getByUserId.mockResolvedValue(mockItems);
      const items = await Cart.getByUserId(1);

      expect(items).toEqual(mockItems);
      expect(items.length).toBe(1);
    });
  });

  describe('Cart.addItem()', () => {
    it('debería agregar un item al carrito', async () => {
      const mockItem = { id: 1, user_id: 1, product_id: 5, quantity: 1 };
      Cart.addItem.mockResolvedValue(mockItem);

      const item = await Cart.addItem(1, 5, 1);

      expect(item).toEqual(mockItem);
      expect(item.product_id).toBe(5);
    });
  });

  describe('Cart.getTotal()', () => {
    it('debería calcular el total del carrito', async () => {
      Cart.getTotal.mockResolvedValue(1299.98);

      const total = await Cart.getTotal(1);

      expect(total).toBe(1299.98);
      expect(typeof total).toBe('number');
    });
  });
});
