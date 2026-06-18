-- =====================================================
-- restore.sql — полный сброс БД (схема + данные)
-- =====================================================

-- 1. Таблицы (порядок важен из-за FK)
DROP TABLE IF EXISTS daily_user_registrations CASCADE;
DROP TABLE IF EXISTS daily_purchases CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id    SERIAL PRIMARY KEY,
    name  TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id    SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE orders (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    title      TEXT NOT NULL,
    slug       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_categories (
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE TABLE order_items (
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT NOT NULL DEFAULT 1,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE daily_purchases (
    order_date DATE PRIMARY KEY,
    purchases INT NOT NULL DEFAULT 0
);

CREATE TABLE daily_user_registrations (
    created_at DATE PRIMARY KEY,
    count INT NOT NULL DEFAULT 0
);

-- 2. Пользователи
INSERT INTO users (name, email, created_at)
SELECT name, email, NOW() - random() * interval '30 days'
FROM (VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith',     'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com'),
    ('Diana Prince',  'diana@example.com'),
    ('Ethan Hunt',    'ethan@example.com'),
    ('Ghost User',    'ghost@example.com')
) AS u(name, email);

-- 3. Товары
INSERT INTO products (title, price) VALUES
('Keyboard',              45.99),
('Mouse',                 25.50),
('Monitor',              199.99),
('Laptop Stand',         120.00),
('Mechanical Keyboard',  149.90),
('Smartphone Alpha',     100),
('Wireless Headphones',   50),
('Winter Jacket',         25),
('Running Shoes',       1000),
('SQL for Beginners Book', 10);

-- 4. Категории
INSERT INTO categories (id, title, slug, created_at) VALUES
(1, 'Electronics', 'electronics',     NOW() - interval '30 days'),
(2, 'Apparel',     'apparel',         NOW() - interval '25 days'),
(3, 'Books',       'books',           NOW() - interval '20 days');

-- 5. Связи товаров с категориями
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1),  -- Keyboard               → Electronics
(2, 1),  -- Mouse                  → Electronics
(3, 1),  -- Monitor                → Electronics
(4, 1),  -- Laptop Stand           → Electronics
(5, 1),  -- Mechanical Keyboard    → Electronics
(6, 1),  -- Smartphone Alpha       → Electronics
(7, 1),  -- Wireless Headphones    → Electronics
(8, 2),  -- Winter Jacket          → Apparel
(9, 2),  -- Running Shoes          → Apparel
(10, 3); -- SQL for Beginners Book → Books

-- 6. Заказы
INSERT INTO orders (user_id, created_at) VALUES
(1, NOW() - interval '5 days'),
(2, NOW() - interval '4 days'),
(3, NOW() - interval '3 days'),
(1, NOW() - interval '2 days'),
(5, NOW() - interval '1 day'),
(2, NOW());

INSERT INTO orders (user_id, created_at)
SELECT u.id, NOW() - (random() * interval '30 days')
FROM users u
CROSS JOIN generate_series(1, 3);

-- 7. Элементы заказов (каждый товар получает ~40% заказов)
INSERT INTO order_items (order_id, product_id, quantity)
SELECT o.id, p.id, floor(random() * 3 + 1)::int
FROM products p
CROSS JOIN orders o
WHERE random() < 0.4
ON CONFLICT DO NOTHING;

-- 8. Индекс для обучения
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- 9. Заполнение daily_user_registrations из created_at пользователей
INSERT INTO daily_user_registrations (created_at, count)
SELECT created_at::date, COUNT(*)
FROM users
GROUP BY created_at::date
ON CONFLICT (created_at) DO NOTHING;
