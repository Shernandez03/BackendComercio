const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');

// Mock del modelo Product
jest.mock('../models/Product');

describe('Product Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('debería retornar todos los productos', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', price: 999.99, stock: 10 },
        { id: 2, name: 'Mouse', price: 29.99, stock: 50 }
      ];

      Product.getAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProducts);
      expect(Product.getAll).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores correctamente', async () => {
      Product.getAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería retornar un producto por ID', async () => {
      const mockProduct = { id: 1, name: 'Laptop', price: 999.99 };
      Product.getById.mockResolvedValue(mockProduct);

      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockProduct);
      expect(Product.getById).toHaveBeenCalledWith('1');
    });

    it('debería retornar 404 si el producto no existe', async () => {
      Product.getById.mockResolvedValue(null);

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    it('debería crear un nuevo producto', async () => {
      const newProduct = {
        name: 'Teclado',
        description: 'Teclado mecánico',
        price: 149.99,
        stock: 20
      };

      const mockCreatedProduct = { id: 3, ...newProduct };
      Product.create.mockResolvedValue(mockCreatedProduct);

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedProduct);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar un producto existente', async () => {
      const updatedData = { name: 'Laptop Pro', price: 1299.99 };
      const mockUpdatedProduct = { id: 1, ...updatedData };

      Product.update.mockResolvedValue(mockUpdatedProduct);

      const response = await request(app)
        .put('/api/products/1')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockUpdatedProduct);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar un producto', async () => {
      Product.delete.mockResolvedValue({ id: 1, name: 'Laptop' });

      const response = await request(app).delete('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

// Tests del modelo Product
describe('Product Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product.getAll()', () => {
    it('debería retornar array de productos', async () => {
      const mockProducts = [
        { id: 1, name: 'Producto 1' },
        { id: 2, name: 'Producto 2' }
      ];

      Product.getAll.mockResolvedValue(mockProducts);
      const products = await Product.getAll();

      expect(products).toEqual(mockProducts);
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('Product.getById()', () => {
    it('debería retornar un producto específico', async () => {
      const mockProduct = { id: 1, name: 'Laptop', price: 999.99 };
      Product.getById.mockResolvedValue(mockProduct);

      const product = await Product.getById(1);

      expect(product).toEqual(mockProduct);
      expect(product.id).toBe(1);
    });

    it('debería retornar null si no encuentra el producto', async () => {
      Product.getById.mockResolvedValue(null);

      const product = await Product.getById(999);

      expect(product).toBeNull();
    });
  });
});
