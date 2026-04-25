-- Adicionar colunas de preco de custo e estoque minimo na tabela products
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna de preco de custo
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price TEXT DEFAULT NULL;

-- Adicionar coluna de estoque minimo
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT NULL;

-- Comentarios para documentacao
COMMENT ON COLUMN products.cost_price IS 'Preco de custo do produto para calculo de lucro';
COMMENT ON COLUMN products.min_stock IS 'Estoque minimo para alerta de reposicao';
