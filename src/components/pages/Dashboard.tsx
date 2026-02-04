import { TrendingUp, Plus, Download, FileText } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { MarketTicker } from '@/components/MarketTicker';
import { MiningEntry, WithdrawEntry, Partner } from '@/hooks/useMiningData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  btcUsd: number;
  btcBrl: number;
  change24h: number;
  lastUpdate: Date | null;
  entries: MiningEntry[];
  withdrawals: WithdrawEntry[];
  partners: Partner[];
  onAddEntry: (entry: { btcAmount: number; usdValue: number; brlValue: number }) => void;
  onAddWithdrawal: (withdrawal: { brlAmount: number; btcAmount: number; beneficiary: string }) => void;
  totals: { totalBtc: number; totalWithdrawnBrl: number; totalWithdrawnBtc: number; netBtc: number };
}

export const Dashboard = ({
  btcUsd,
  btcBrl,
  change24h,
  lastUpdate,
  entries,
  partners,
  onAddEntry,
  onAddWithdrawal,
  totals,
}: DashboardProps) => {
  const [newBtc, setNewBtc] = useState('');
  const [withdrawBrl, setWithdrawBrl] = useState('');
  const [withdrawBtc, setWithdrawBtc] = useState('');
  const [beneficiary, setBeneficiary] = useState('');

  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const handleAddEntry = () => {
    const btcAmount = parseFloat(newBtc);
    if (isNaN(btcAmount) || btcAmount <= 0) return;

    onAddEntry({
      btcAmount,
      usdValue: btcAmount * btcUsd,
      brlValue: btcAmount * btcBrl,
    });
    setNewBtc('');
  };

  const handleAddWithdrawal = () => {
    const btcAmount = parseFloat(withdrawBtc);
    if (isNaN(btcAmount) || btcAmount <= 0) return;
    if (!beneficiary) return;

    // BRL is always calculated from BTC at current rate
    const brlAmount = btcAmount * btcBrl;

    onAddWithdrawal({
      brlAmount,
      btcAmount,
      beneficiary,
    });
    setWithdrawBrl('');
    setWithdrawBtc('');
    setBeneficiary('');
  };

  // Prepare chart data
  const chartData = entries.reduce((acc: { date: string; btc: number }[], entry) => {
    const date = new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.btc += entry.btcAmount;
    } else {
      acc.push({ date, btc: entry.btcAmount });
    }
    return acc;
  }, []);

  // Cumulative chart data
  let cumulative = 0;
  const cumulativeData = chartData.map(d => {
    cumulative += d.btc;
    return { date: d.date, btc: cumulative };
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel de Monitoramento</h1>
          <p className="text-muted-foreground text-sm">Fluxo de caixa e mineração em tempo real</p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Resumo de Gestão
        </Button>
      </div>

      <MarketTicker
        btcUsd={btcUsd}
        btcBrl={btcBrl}
        change24h={change24h}
        lastUpdate={lastUpdate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="BTC / BRL"
          value={formatBrl(btcBrl)}
          subtitle="SPOT BRASIL"
          trend={change24h}
          variant="success"
        />
        <StatCard
          label="BTC / USD"
          value={formatUsd(btcUsd)}
          subtitle="SPOT GLOBAL"
          trend={change24h}
          variant="success"
        />
        <StatCard
          label="Bruto Total"
          value={formatBtc(totals.totalBtc)}
          subtitle="ENTRADAS TOTAIS"
          variant="bitcoin"
        />
        <StatCard
          label="Total Sacado"
          value={formatBtc(totals.totalWithdrawnBtc)}
          subtitle="DISTRIBUÍDO"
          variant="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Histórico Acumulado</h3>
          </div>
          
          {cumulativeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="btc"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 dashed-border flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          )}
        </div>

        {/* Forms */}
        <div className="space-y-4">
          {/* New Mining Entry */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Nova Mineração</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="stat-label">Valor BTC</label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.00000001"
                    value={newBtc}
                    onChange={e => setNewBtc(e.target.value)}
                    placeholder="0.00000000"
                    className="input-dark pr-10 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-btc font-bold">₿</span>
                </div>
              </div>

              <div>
                <label className="stat-label">Valor USD</label>
                <div className="relative mt-1">
                  <Input
                    type="text"
                    value={newBtc ? formatUsd(parseFloat(newBtc) * btcUsd) : '0.00'}
                    readOnly
                    className="input-dark pr-10 font-mono bg-muted"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success font-bold">$</span>
                </div>
              </div>

              <Button onClick={handleAddEntry} className="w-full btn-primary">
                Salvar Entrada
              </Button>
            </div>
          </div>

          {/* Withdrawal */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Registrar Saque</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="stat-label">Valor BTC</label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.00000001"
                    value={withdrawBtc}
                    onChange={e => {
                      const btc = e.target.value;
                      setWithdrawBtc(btc);
                      // Auto-calculate BRL from BTC
                      const btcVal = parseFloat(btc);
                      if (!isNaN(btcVal) && btcVal > 0) {
                        setWithdrawBrl((btcVal * btcBrl).toFixed(2));
                      } else {
                        setWithdrawBrl('');
                      }
                    }}
                    placeholder="0.00000000"
                    className="input-dark pr-10 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-btc font-bold">₿</span>
                </div>
              </div>

              <div>
                <label className="stat-label">Valor R$ (calculado)</label>
                <div className="relative mt-1">
                  <Input
                    type="text"
                    value={withdrawBrl ? formatBrl(parseFloat(withdrawBrl)) : ''}
                    readOnly
                    className="input-dark pr-12 font-mono bg-muted"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success font-bold">R$</span>
                </div>
              </div>

              <div>
                <label className="stat-label">Beneficiário</label>
                <Select value={beneficiary} onValueChange={setBeneficiary}>
                  <SelectTrigger className="input-dark mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddWithdrawal} className="w-full btn-primary">
                Registrar Saque
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
