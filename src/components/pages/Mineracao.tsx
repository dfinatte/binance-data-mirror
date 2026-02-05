import { MiningEntry } from '@/hooks/useMiningData';
import { RefreshCw, Pickaxe, CalendarDays } from 'lucide-react';

interface MineracaoProps {
  entries: MiningEntry[];
}

export const Mineracao = ({ entries }: MineracaoProps) => {
  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const formatDateOnly = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Sort entries by date descending (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalBtc = entries.reduce((sum, e) => sum + e.btcAmount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Registro de Produção</h1>
          <p className="text-muted-foreground text-sm">Histórico de minerações registradas</p>
        </div>
        <div className="stat-card px-4 py-2">
          <p className="stat-label">Total Minerado</p>
          <p className="text-lg font-semibold font-mono text-btc">{formatBtc(totalBtc)}</p>
        </div>
      </div>

      <div className="stat-card">
        {sortedEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 stat-label">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Data da Produção
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 stat-label">Valor BTC</th>
                  <th className="text-right py-3 px-4 stat-label">Valor USD (registro)</th>
                  <th className="text-right py-3 px-4 stat-label">Valor BRL (registro)</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{formatDateOnly(entry.date)}</td>
                    <td className="py-3 px-4 text-right font-mono text-btc">{formatBtc(entry.btcAmount)}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      ${entry.usdValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {formatBrl(entry.brlValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashed-border p-12 flex flex-col items-center justify-center text-center">
            <Pickaxe className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground uppercase tracking-wider">
              Nenhum registro encontrado
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Adicione produções no Painel Geral
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
