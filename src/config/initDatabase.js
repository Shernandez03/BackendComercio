const pool = require('./database');

const initDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tabla de productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de carritos
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Tabla de órdenes
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de items de órdenes
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar productos de ejemplo
    await client.query(`
      INSERT INTO products (name, description, price, image_url, stock, category)
      VALUES
        ('Laptop HP Pavilion', 'Laptop potente para trabajo y estudio', 799.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 10, 'Electrónica'),
        ('iPhone 13', 'Smartphone de última generación', 999.99, 'https://images.unsplash.com/photo-1592286927505-b82c2456a41f?w=500', 15, 'Electrónica'),
        ('Auriculares Sony', 'Auriculares con cancelación de ruido', 249.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 20, 'Accesorios'),
        ('Mouse Logitech', 'Mouse ergonómico inalámbrico', 49.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 30, 'Accesorios'),
        ('Teclado Mecánico', 'Teclado mecánico RGB para gaming', 129.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 25, 'Accesorios'),
        ('Monitor Samsung 27"', 'Monitor Full HD para productividad', 299.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 12, 'Electrónica'),
        ('Webcam HD', 'Cámara web 1080p para videoconferencias', 79.99, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500', 18, 'Accesorios'),
        ('SSD 1TB Samsung', 'Disco sólido de alta velocidad', 149.99, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500', 22, 'Componentes')
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✅ Base de datos inicializada correctamente');
    console.log('📦 Productos de ejemplo insertados');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = initDatabase;
