-- Criar tabela de vendas para registrar histórico de todas as transações
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance das consultas de analytics
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);

-- Comentários para documentação
COMMENT ON TABLE sales IS 'Histórico de todas as vendas realizadas';
COMMENT ON COLUMN sales.product_id IS 'ID do produto vendido';
COMMENT ON COLUMN sales.quantity IS 'Quantidade vendida';
COMMENT ON COLUMN sales.price IS 'Preço unitário no momento da venda';
COMMENT ON COLUMN sales.total IS 'Valor total da venda (price * quantity)';
COMMENT ON COLUMN sales.sold_at IS 'Data e hora da venda';
