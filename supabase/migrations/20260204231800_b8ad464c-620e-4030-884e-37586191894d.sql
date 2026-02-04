-- Tabela de entradas de mineração
CREATE TABLE public.mining_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  btc_amount DECIMAL(18, 8) NOT NULL,
  usd_value DECIMAL(18, 2) NOT NULL,
  brl_value DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de sócios
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  initial_capital DECIMAL(18, 2) NOT NULL DEFAULT 0,
  quota DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de saques
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  brl_amount DECIMAL(18, 2) NOT NULL,
  btc_amount DECIMAL(18, 8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mining_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies para mining_entries
CREATE POLICY "Users can view their own mining entries"
ON public.mining_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mining entries"
ON public.mining_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mining entries"
ON public.mining_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para partners
CREATE POLICY "Users can view their own partners"
ON public.partners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own partners"
ON public.partners FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners"
ON public.partners FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners"
ON public.partners FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para withdrawals
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own withdrawals"
ON public.withdrawals FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();