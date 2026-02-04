import { WithdrawEntry, Partner } from '@/hooks/useMiningData';
import { Download } from 'lucide-react';

interface SaquesProps {
  withdrawals: WithdrawEntry[];
  partners: Partner[];
}

export const Saques = ({ withdrawals, partners }: SaquesProps) => {
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

  const getPartnerName = (id: string) => partners.find(p => p.id === id)?.name || 'Desconhecido';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Histórico de Saques</h1>
        <p className="text-muted-foreground text-sm">Registro de todas as retiradas</p>
      </div>

      <div className="stat-card">
        {withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 stat-label">Data</th>
                  <th className="text-left py-3 px-4 stat-label">Beneficiário</th>
                  <th className="text-right py-3 px-4 stat-label">Valor BRL</th>
                  <th className="text-right py-3 px-4 stat-label">Valor BTC</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(withdrawal => (
                  <tr key={withdrawal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{formatDate(withdrawal.date)}</td>
                    <td className="py-3 px-4 text-sm">{getPartnerName(withdrawal.beneficiary)}</td>
                    <td className="py-3 px-4 text-right font-mono text-success">
                      {formatBrl(withdrawal.brlAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-btc">
                      {formatBtc(withdrawal.btcAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashed-border p-12 flex flex-col items-center justify-center text-center">
            <Download className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground uppercase tracking-wider">
              Nenhum saque registrado
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Registre saques no Painel Geral
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
