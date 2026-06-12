-- =====================================================
-- add_category_data.sql — миграция существующей БД
-- Связывает все продукты с категориями и добавляет
-- заказы для всех категорий.
-- =====================================================

-- 1. Связать все продукты 1-10 с категориями
INSERT INTO product_categories (product_id, category_id)
SELECT p.id,
  CASE WHEN p.id <= 7 THEN 1
       WHEN p.id <= 9 THEN 2
       ELSE 3 END
FROM products p
WHERE p.id <= 10
ON CONFLICT DO NOTHING;

-- 2. Гарантированно покрыть все категории заказами
INSERT INTO order_items (order_id, product_id, quantity)
SELECT o.id, p.id, floor(random() * 3 + 1)::int
FROM products p
CROSS JOIN orders o
WHERE random() < 0.4
ON CONFLICT DO NOTHING;
