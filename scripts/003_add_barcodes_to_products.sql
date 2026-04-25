-- Script para adicionar códigos de barras aleatórios a todos os produtos
-- Formato: EAN-13 (13 dígitos começando com 789 - Brasil)

-- Atualizar cada produto com um código de barras único
UPDATE products SET barcode = '7891234500001' WHERE name = 'Seda RAW Classic King Size' AND barcode IS NULL;
UPDATE products SET barcode = '7891234500002' WHERE name = 'Seda Smoking Brown' AND barcode IS NULL;
UPDATE products SET barcode = '7891234500003' WHERE name = 'Seda Elements Ultra Thin' AND barcode IS NULL;
UPDATE products SET barcode = '7891234500004' WHERE name = 'Seda OCB Premium Slim' AND barcode IS NULL;

UPDATE products SET barcode = '7892345600001' WHERE name = 'Piteira de Vidro Murano Colorida' AND barcode IS NULL;
UPDATE products SET barcode = '7892345600002' WHERE name = 'Piteira de Vidro Transparente' AND barcode IS NULL;
UPDATE products SET barcode = '7892345600003' WHERE name = 'Piteira de Vidro Espiral' AND barcode IS NULL;
UPDATE products SET barcode = '7892345600004' WHERE name = 'Piteira de Vidro Flat' AND barcode IS NULL;

UPDATE products SET barcode = '7893456700001' WHERE name = 'Cuia Tradicional Porongo' AND barcode IS NULL;
UPDATE products SET barcode = '7893456700002' WHERE name = 'Cuia de Madeira Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7893456700003' WHERE name = 'Cuia de Cerâmica Artesanal' AND barcode IS NULL;
UPDATE products SET barcode = '7893456700004' WHERE name = 'Cuia de Inox Térmica' AND barcode IS NULL;

UPDATE products SET barcode = '7894567800001' WHERE name = 'Tabaco Golden Virginia' AND barcode IS NULL;
UPDATE products SET barcode = '7894567800002' WHERE name = 'Tabaco Drum Original' AND barcode IS NULL;
UPDATE products SET barcode = '7894567800003' WHERE name = 'Tabaco Amsterdam' AND barcode IS NULL;
UPDATE products SET barcode = '7894567800004' WHERE name = 'Tabaco Hi Tobacco' AND barcode IS NULL;

UPDATE products SET barcode = '7895678900001' WHERE name = 'Narguile Pequeno Egípcio' AND barcode IS NULL;
UPDATE products SET barcode = '7895678900002' WHERE name = 'Narguile Médio Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7895678900003' WHERE name = 'Narguile Grande Luxo' AND barcode IS NULL;
UPDATE products SET barcode = '7895678900004' WHERE name = 'Narguile Portátil' AND barcode IS NULL;

UPDATE products SET barcode = '7896789000001' WHERE name = 'Slick de Silicone Pequeno' AND barcode IS NULL;
UPDATE products SET barcode = '7896789000002' WHERE name = 'Slick de Silicone Médio' AND barcode IS NULL;
UPDATE products SET barcode = '7896789000003' WHERE name = 'Slick de Silicone Grande' AND barcode IS NULL;
UPDATE products SET barcode = '7896789000004' WHERE name = 'Kit Slicks Variados' AND barcode IS NULL;

UPDATE products SET barcode = '7897890100001' WHERE name = 'Isqueiro Clipper Classic' AND barcode IS NULL;
UPDATE products SET barcode = '7897890100002' WHERE name = 'Isqueiro Zippo Original' AND barcode IS NULL;
UPDATE products SET barcode = '7897890100003' WHERE name = 'Isqueiro Maçarico Portátil' AND barcode IS NULL;
UPDATE products SET barcode = '7897890100004' WHERE name = 'Isqueiro USB Elétrico' AND barcode IS NULL;

UPDATE products SET barcode = '7898901200001' WHERE name = 'Cinzeiro de Vidro Redondo' AND barcode IS NULL;
UPDATE products SET barcode = '7898901200002' WHERE name = 'Cinzeiro de Metal Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7898901200003' WHERE name = 'Cinzeiro de Cerâmica Decorativo' AND barcode IS NULL;
UPDATE products SET barcode = '7898901200004' WHERE name = 'Cinzeiro Portátil de Bolso' AND barcode IS NULL;

-- Para produtos que não foram cobertos acima, gerar código baseado no ID
UPDATE products 
SET barcode = '789' || LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0')
WHERE barcode IS NULL;
