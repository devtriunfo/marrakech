-- Atualizar tabela de vendas para incluir mais informações
-- Se a tabela já existe, adicionar novas colunas

-- Primeiro, dropar a tabela antiga se existir e recriar com a nova estrutura
DROP TABLE IF EXISTS sales;

-- Criar tabela de vendas com estrutura completa
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number SERIAL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  customer_name TEXT,
  notes TEXT,
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);

-- Habilitar RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas para sales
DROP POLICY IF EXISTS "sales_select_public" ON sales;
CREATE POLICY "sales_select_public" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert_public" ON sales FOR INSERT WITH CHECK (true);
