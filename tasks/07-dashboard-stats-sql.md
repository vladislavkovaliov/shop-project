# Dashboard Stats SQL

```sql
-- Revenue (total)
SELECT ROUND(COALESCE(SUM(oi.quantity * p.price), 0)::numeric, 2) AS total_revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id;

-- Orders (count)
SELECT COUNT(*) AS total_orders FROM orders;

-- Users (count)
SELECT COUNT(*) AS total_users FROM users;

-- Conversion (users with >= 1 order / total users * 100)
SELECT ROUND(
    COUNT(DISTINCT o.user_id)::numeric / NULLIF(COUNT(DISTINCT u.id), 0) * 100, 2
) AS conversion_rate
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;
```

## Growth (сравнение с прошлым месяцем)

### Revenue growth
```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', o.created_at) AS month,
        SUM(oi.quantity * p.price) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
    GROUP BY DATE_TRUNC('month', o.created_at)
)
SELECT
    ROUND(MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN revenue END)::numeric, 2) AS current,
    ROUND(MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN revenue END)::numeric, 2) AS previous,
    ROUND(
        (MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN revenue END)::numeric
         - MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN revenue END))
        / NULLIF(MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN revenue END), 0) * 100, 1
    ) AS growth_percent
FROM monthly;
```

### Orders growth
```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS total
    FROM orders
    WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT
    MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN total END) AS current,
    MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END) AS previous,
    ROUND(
        (MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN total END)::numeric
         - MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END))
        / NULLIF(MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END), 0) * 100, 1
    ) AS growth_percent
FROM monthly;
```

### Users growth
```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS total
    FROM (
        SELECT MIN(o.created_at) AS created_at
        FROM orders o
        GROUP BY o.user_id
    ) first_orders
    WHERE created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT
    MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN total END) AS current,
    MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END) AS previous,
    ROUND(
        (MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN total END)::numeric
         - MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END))
        / NULLIF(MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN total END), 0) * 100, 1
    ) AS growth_percent
FROM monthly;
```

### Conversion growth
```sql
WITH monthly AS (
    SELECT
        DATE_TRUNC('month', month) AS month,
        ROUND(
            COUNT(DISTINCT user_id)::numeric / NULLIF(total_users, 0) * 100, 2
        ) AS conversion
    FROM (
        SELECT
            o.user_id,
            DATE_TRUNC('month', o.created_at) AS month,
            COUNT(*) OVER () AS total_users
        FROM orders o
        WHERE o.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
    ) sub
    GROUP BY DATE_TRUNC('month', month), total_users
)
SELECT
    MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN conversion END) AS current,
    MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN conversion END) AS previous,
    ROUND(
        (MAX(CASE WHEN month = DATE_TRUNC('month', NOW()) THEN conversion END)
         - MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN conversion END))
        / NULLIF(MAX(CASE WHEN month < DATE_TRUNC('month', NOW()) THEN conversion END), 0) * 100, 1
    ) AS growth_percent
FROM monthly;
```
