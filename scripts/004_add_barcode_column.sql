-- Adicionar coluna barcode se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products ADD COLUMN barcode TEXT UNIQUE;
  END IF;
END $$;

-- Atualizar produtos existentes com códigos de barras EAN-13
-- Formato: 789 (Brasil) + 4 dígitos categoria + 5 dígitos produto + 1 dígito verificador

-- Sedas (categoria 0001)
UPDATE products SET barcode = '7890001000011' WHERE name = 'Seda RAW Classic King Size' AND barcode IS NULL;
UPDATE products SET barcode = '7890001000028' WHERE name = 'Seda Smoking Brown' AND barcode IS NULL;
UPDATE products SET barcode = '7890001000035' WHERE name = 'Seda Elements Ultra Thin' AND barcode IS NULL;
UPDATE products SET barcode = '7890001000042' WHERE name = 'Seda OCB Premium Slim' AND barcode IS NULL;

-- Piteiras (categoria 0002)
UPDATE products SET barcode = '7890002000017' WHERE name = 'Piteira de Vidro Murano Colorida' AND barcode IS NULL;
UPDATE products SET barcode = '7890002000024' WHERE name = 'Piteira de Vidro Transparente' AND barcode IS NULL;
UPDATE products SET barcode = '7890002000031' WHERE name = 'Piteira de Vidro Espiral' AND barcode IS NULL;
UPDATE products SET barcode = '7890002000048' WHERE name = 'Piteira de Vidro Flat' AND barcode IS NULL;

-- Cuias (categoria 0003)
UPDATE products SET barcode = '7890003000016' WHERE name = 'Cuia Tradicional Porongo' AND barcode IS NULL;
UPDATE products SET barcode = '7890003000023' WHERE name = 'Cuia de Madeira Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7890003000030' WHERE name = 'Cuia de Cerâmica Artesanal' AND barcode IS NULL;
UPDATE products SET barcode = '7890003000047' WHERE name = 'Cuia de Inox Térmica' AND barcode IS NULL;

-- Tabaco (categoria 0004)
UPDATE products SET barcode = '7890004000015' WHERE name = 'Tabaco Golden Virginia' AND barcode IS NULL;
UPDATE products SET barcode = '7890004000022' WHERE name = 'Tabaco Drum Original' AND barcode IS NULL;
UPDATE products SET barcode = '7890004000039' WHERE name = 'Tabaco Amsterdam' AND barcode IS NULL;
UPDATE products SET barcode = '7890004000046' WHERE name = 'Tabaco Hi Tobacco' AND barcode IS NULL;

-- Narguiles (categoria 0005)
UPDATE products SET barcode = '7890005000014' WHERE name = 'Narguile Pequeno Egípcio' AND barcode IS NULL;
UPDATE products SET barcode = '7890005000021' WHERE name = 'Narguile Médio Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7890005000038' WHERE name = 'Narguile Grande Luxo' AND barcode IS NULL;
UPDATE products SET barcode = '7890005000045' WHERE name = 'Narguile Portátil' AND barcode IS NULL;

-- Slicks (categoria 0006)
UPDATE products SET barcode = '7890006000013' WHERE name = 'Slick de Silicone Pequeno' AND barcode IS NULL;
UPDATE products SET barcode = '7890006000020' WHERE name = 'Slick de Silicone Médio' AND barcode IS NULL;
UPDATE products SET barcode = '7890006000037' WHERE name = 'Slick de Silicone Grande' AND barcode IS NULL;
UPDATE products SET barcode = '7890006000044' WHERE name = 'Kit Slicks Variados' AND barcode IS NULL;

-- Isqueiros (categoria 0007)
UPDATE products SET barcode = '7890007000012' WHERE name = 'Isqueiro Clipper Classic' AND barcode IS NULL;
UPDATE products SET barcode = '7890007000029' WHERE name = 'Isqueiro Zippo Original' AND barcode IS NULL;
UPDATE products SET barcode = '7890007000036' WHERE name = 'Isqueiro Maçarico Portátil' AND barcode IS NULL;
UPDATE products SET barcode = '7890007000043' WHERE name = 'Isqueiro USB Elétrico' AND barcode IS NULL;

-- Cinzeiros (categoria 0008)
UPDATE products SET barcode = '7890008000011' WHERE name = 'Cinzeiro de Vidro Redondo' AND barcode IS NULL;
UPDATE products SET barcode = '7890008000028' WHERE name = 'Cinzeiro de Metal Premium' AND barcode IS NULL;
UPDATE products SET barcode = '7890008000035' WHERE name = 'Cinzeiro de Cerâmica Decorativo' AND barcode IS NULL;
UPDATE products SET barcode = '7890008000042' WHERE name = 'Cinzeiro Portátil de Bolso' AND barcode IS NULL;
