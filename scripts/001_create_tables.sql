-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública)
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);

-- Políticas para produtos (leitura pública para produtos ativos)
CREATE POLICY "products_select_public" ON products FOR SELECT USING (is_active = true);

-- Políticas para admin (usando service role ou verificação de admin)
-- Para operações de escrita, usaremos o service role no servidor

-- Inserir categorias iniciais
INSERT INTO categories (name, slug, icon) VALUES
  ('Sedas', 'sedas', 'Scroll'),
  ('Piteiras de Vidro', 'piteiras', 'Pipette'),
  ('Cuias', 'cuias', 'Coffee'),
  ('Tabaco', 'tabaco', 'Leaf'),
  ('Narguiles', 'narguiles', 'Wind'),
  ('Slicks', 'slicks', 'Box'),
  ('Isqueiros', 'isqueiros', 'Flame'),
  ('Cinzeiros', 'cinzeiros', 'Circle')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos iniciais
INSERT INTO products (name, description, price, stock, category_id, is_active) VALUES
  -- Sedas
  ('Seda RAW Classic King Size', 'Seda natural não branqueada, tamanho king size', 8.00, 50, (SELECT id FROM categories WHERE slug = 'sedas'), true),
  ('Seda Smoking Brown', 'Seda marrom natural, queima lenta', 7.00, 45, (SELECT id FROM categories WHERE slug = 'sedas'), true),
  ('Seda Elements Ultra Thin', 'Seda ultrafina de arroz', 9.00, 40, (SELECT id FROM categories WHERE slug = 'sedas'), true),
  ('Seda OCB Premium Slim', 'Seda premium extra fina', 6.50, 60, (SELECT id FROM categories WHERE slug = 'sedas'), true),
  
  -- Piteiras de Vidro
  ('Piteira de Vidro Murano Colorida', 'Piteira artesanal de vidro murano', 25.00, 30, (SELECT id FROM categories WHERE slug = 'piteiras'), true),
  ('Piteira de Vidro Transparente', 'Piteira simples de vidro cristal', 15.00, 50, (SELECT id FROM categories WHERE slug = 'piteiras'), true),
  ('Piteira de Vidro Espiral', 'Piteira com design espiral interno', 35.00, 20, (SELECT id FROM categories WHERE slug = 'piteiras'), true),
  ('Piteira de Vidro Flat', 'Piteira formato flat para melhor fluxo', 20.00, 35, (SELECT id FROM categories WHERE slug = 'piteiras'), true),
  
  -- Cuias
  ('Cuia Tradicional Porongo', 'Cuia de porongo natural tradicional', 45.00, 25, (SELECT id FROM categories WHERE slug = 'cuias'), true),
  ('Cuia de Madeira Premium', 'Cuia de madeira nobre revestida', 65.00, 15, (SELECT id FROM categories WHERE slug = 'cuias'), true),
  ('Cuia de Cerâmica Artesanal', 'Cuia de cerâmica pintada à mão', 55.00, 20, (SELECT id FROM categories WHERE slug = 'cuias'), true),
  ('Cuia de Inox Térmica', 'Cuia de inox com isolamento térmico', 85.00, 10, (SELECT id FROM categories WHERE slug = 'cuias'), true),
  
  -- Tabaco
  ('Tabaco Golden Virginia', 'Tabaco suave para enrolar', 35.00, 40, (SELECT id FROM categories WHERE slug = 'tabaco'), true),
  ('Tabaco Drum Original', 'Tabaco holandês encorpado', 42.00, 35, (SELECT id FROM categories WHERE slug = 'tabaco'), true),
  ('Tabaco Amsterdam', 'Tabaco premium importado', 38.00, 45, (SELECT id FROM categories WHERE slug = 'tabaco'), true),
  ('Tabaco Hi Tobacco', 'Tabaco nacional de qualidade', 28.00, 55, (SELECT id FROM categories WHERE slug = 'tabaco'), true),
  
  -- Narguiles
  ('Narguile Pequeno Egípcio', 'Narguile compacto estilo egípcio', 120.00, 15, (SELECT id FROM categories WHERE slug = 'narguiles'), true),
  ('Narguile Médio Premium', 'Narguile de alumínio com mangueira silicone', 180.00, 12, (SELECT id FROM categories WHERE slug = 'narguiles'), true),
  ('Narguile Grande Luxo', 'Narguile completo com LED', 280.00, 8, (SELECT id FROM categories WHERE slug = 'narguiles'), true),
  ('Narguile Portátil', 'Narguile compacto para viagem', 95.00, 20, (SELECT id FROM categories WHERE slug = 'narguiles'), true),
  
  -- Slicks
  ('Slick de Silicone Pequeno', 'Slick 5ml para concentrados', 15.00, 60, (SELECT id FROM categories WHERE slug = 'slicks'), true),
  ('Slick de Silicone Médio', 'Slick 10ml com divisórias', 25.00, 45, (SELECT id FROM categories WHERE slug = 'slicks'), true),
  ('Slick de Silicone Grande', 'Slick 22ml formato cubo', 35.00, 30, (SELECT id FROM categories WHERE slug = 'slicks'), true),
  ('Kit Slicks Variados', 'Kit com 5 slicks de tamanhos variados', 55.00, 20, (SELECT id FROM categories WHERE slug = 'slicks'), true),
  
  -- Isqueiros
  ('Isqueiro Clipper Classic', 'Isqueiro recarregável com pedra', 12.00, 80, (SELECT id FROM categories WHERE slug = 'isqueiros'), true),
  ('Isqueiro Zippo Original', 'Isqueiro Zippo cromado clássico', 150.00, 15, (SELECT id FROM categories WHERE slug = 'isqueiros'), true),
  ('Isqueiro Maçarico Portátil', 'Maçarico recarregável resistente ao vento', 45.00, 35, (SELECT id FROM categories WHERE slug = 'isqueiros'), true),
  ('Isqueiro USB Elétrico', 'Isqueiro elétrico recarregável USB', 35.00, 40, (SELECT id FROM categories WHERE slug = 'isqueiros'), true),
  
  -- Cinzeiros
  ('Cinzeiro de Vidro Redondo', 'Cinzeiro de vidro grosso resistente', 25.00, 40, (SELECT id FROM categories WHERE slug = 'cinzeiros'), true),
  ('Cinzeiro de Metal Premium', 'Cinzeiro de metal com tampa', 45.00, 25, (SELECT id FROM categories WHERE slug = 'cinzeiros'), true),
  ('Cinzeiro de Cerâmica Decorativo', 'Cinzeiro artesanal decorativo', 55.00, 20, (SELECT id FROM categories WHERE slug = 'cinzeiros'), true),
  ('Cinzeiro Portátil de Bolso', 'Cinzeiro compacto para viagem', 18.00, 50, (SELECT id FROM categories WHERE slug = 'cinzeiros'), true)
ON CONFLICT DO NOTHING;
