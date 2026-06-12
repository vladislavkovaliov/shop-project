/*
* [x] Create a new `categories` table (id, title, slug, created_at) to group products.
* [x] Create a pivot table `product_categories` with foreign keys pointing to products and categories.
* [x] Add test categories (e.g., Electronics, Apparel, Books).
* [x] Link a single product to two categories simultaneously.
* [x] Write a query using two `JOIN`s to display the product title along with all its categories.
*/
    
CREATE TABLE product_categories (
	product_id BIGINT NOT NULL,
	category_id BIGINT NOT NULL,
	PRIMARY KEY (product_id, category_id),
	CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
	CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT INTO categories (id, title, slug, created_at) VALUES
(1, 'Electronics', 'electronics', NOW() - interval '30 days'),
(2, 'Apparel', 'apparel', NOW() - interval '25 days'),
(3, 'Books', 'books', NOW() - interval '20 days')
ON CONFLICT (id) DO NOTHING;

select * from products p ;

INSERT INTO products (title, price) VALUES
('Smartphone Alpha', 100),
('Wireless Headphones', 50),
('Winter Jacket', 25),
('Running Shoes', 1000),
('SQL for Beginners Book', 10)
ON CONFLICT DO NOTHING;


INSERT INTO product_categories (product_id, category_id) VALUES
(6, 1),  -- Smartphone Alpha       → Electronics
(7, 1),  -- Wireless Headphones    → Electronics
(8, 2),  -- Winter Jacket          → Apparel
(9, 2),  -- Running Shoes          → Apparel
(10, 3)  -- SQL for Beginners Book → Books
ON CONFLICT (product_id, category_id) DO NOTHING;

SELECT * FROM product_categories;

SELECT * FROM products p 
JOIN product_categories pc ON p.id = pc.product_id
JOIN categories c ON c.id = pc.category_id;
