-- Adiciona codigos de barras em 3 produtos para teste
-- Formato EAN-13 (padrao brasileiro)

-- Atualiza os 3 primeiros produtos ativos com codigos de barras ....
UPDATE products
SET barcode = '7891234567890'
WHERE id = (SELECT id FROM products WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 0);

UPDATE products
SET barcode = '7891234567891'
WHERE id = (SELECT id FROM products WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 1);

UPDATE products
SET barcode = '7891234567892'
WHERE id = (SELECT id FROM products WHERE is_active = true ORDER BY created_at LIMIT 1 OFFSET 2);
