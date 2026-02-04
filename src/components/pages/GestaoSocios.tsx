import { Partner } from '@/hooks/useMiningData';
import { Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GestaoSociosProps {
  partners: Partner[];
  btcPrice: number;
  getPartnerStats: (id: string, btcPrice: number) => {
    grossBtc: number;
    withdrawnBtc: number;
    availableBtc: number;
    patrimonyBrl: number;
  } | null;
  onUpdatePartner: (id: string, updates: Partial<Partner>) => void;
}

export const GestaoSocios = ({ partners, btcPrice, getPartnerStats, onUpdatePartner }: GestaoSociosProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingPartners, setEditingPartners] = useState<Partner[]>(partners);

  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSaveConfig = () => {
    editingPartners.forEach(p => {
      onUpdatePartner(p.id, { name: p.name, quota: p.quota });
    });
    setIsConfigOpen(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Sócios</h1>
          <p className="text-muted-foreground text-sm">Controle de participações e capital investido</p>
        </div>

        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Configurar Sócios</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {editingPartners.map((partner, index) => (
                <div key={partner.id} className="p-4 rounded-lg bg-secondary space-y-3">
                  <h4 className="font-medium">{partner.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="stat-label">Nome</label>
                      <Input
                        value={partner.name}
                        onChange={e => {
                          const updated = [...editingPartners];
                          updated[index].name = e.target.value;
                          setEditingPartners(updated);
                        }}
                        className="input-dark mt-1"
                      />
                    </div>
                    <div>
                      <label className="stat-label">Cota (%)</label>
                      <Input
                        type="number"
                        value={partner.quota}
                        onChange={e => {
                          const updated = [...editingPartners];
                          updated[index].quota = parseFloat(e.target.value) || 0;
                          setEditingPartners(updated);
                        }}
                        className="input-dark mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={handleSaveConfig} className="w-full btn-primary">
                Salvar Configurações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map(partner => {
          const stats = getPartnerStats(partner.id, btcPrice);
          if (!stats) return null;

          return (
            <div key={partner.id} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{partner.name}</h3>
                </div>
                <span className="badge-info px-3 py-1 rounded-full text-xs font-semibold">
                  {partner.quota}% COTA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="stat-label">Cota Bruta</p>
                  <p className="text-btc font-mono font-semibold">{formatBtc(stats.grossBtc)}</p>
                </div>
                <div>
                  <p className="stat-label">Total Sacado</p>
                  <p className="text-destructive font-mono font-semibold">{formatBtc(stats.withdrawnBtc)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Saldo Disponível</p>
                    <p className="text-success font-mono text-xl font-bold">{formatBtc(stats.availableBtc)}</p>
                  </div>
                  <div className="text-right">
                    <p className="stat-label">Patrimônio</p>
                    <p className="text-foreground font-mono">{formatBrl(stats.patrimonyBrl)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
