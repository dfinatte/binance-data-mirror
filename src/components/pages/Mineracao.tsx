import { MiningEntry } from '@/hooks/useMiningData';
import { RefreshCw } from 'lucide-react';

interface MineracaoProps {
  entries: MiningEntry[];
}

export const Mineracao = ({ entries }: MineracaoProps) => {
  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (date: string) =>
    new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Registro de Entradas</h1>
        <p className="text-muted-foreground text-sm">Histórico de minerações registradas</p>
      </div>

      <div className="stat-card">
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 stat-label">Data</th>
                  <th className="text-right py-3 px-4 stat-label">Valor BTC</th>
                  <th className="text-right py-3 px-4 stat-label">Valor USD</th>
                  <th className="text-right py-3 px-4 stat-label">Valor BRL</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 text-right font-mono text-btc">{formatBtc(entry.btcAmount)}</td>
                    <td className="py-3 px-4 text-right font-mono text-success">
                      ${entry.usdValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-info">
                      {formatBrl(entry.brlValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashed-border p-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground uppercase tracking-wider">
              Nenhum registro encontrado
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Adicione minerações no Painel Geral
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
