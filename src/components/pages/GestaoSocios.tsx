import { Partner } from '@/hooks/useMiningData';
import { Users, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
  onAddPartner: (name: string, initialCapital: number) => void;
  onRemovePartner: (id: string) => void;
}

export const GestaoSocios = ({ partners, btcPrice, getPartnerStats, onUpdatePartner, onAddPartner, onRemovePartner }: GestaoSociosProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapital, setEditCapital] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCapital, setNewCapital] = useState('');

  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const totalCapital = partners.reduce((sum, p) => sum + p.initialCapital, 0);

  const startEditing = (partner: Partner) => {
    setEditingId(partner.id);
    setEditName(partner.name);
    setEditCapital(partner.initialCapital.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditCapital('');
  };

  const saveEditing = (id: string) => {
    const capital = parseFloat(editCapital) || 0;
    onUpdatePartner(id, { 
      name: editName, 
      initialCapital: capital
    });
    setEditingId(null);
  };

  const handleAddPartner = () => {
    if (newName.trim()) {
      onAddPartner(newName.trim(), parseFloat(newCapital) || 0);
      setNewName('');
      setNewCapital('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Sócios</h1>
          <p className="text-muted-foreground text-sm">Controle de aportes e participação societária</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="stat-card px-4 py-2">
            <p className="stat-label">Capital Total</p>
            <p className="text-lg font-semibold text-foreground">{formatBrl(totalCapital)}</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Novo Sócio
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Adicionar Novo Sócio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="stat-label">Nome</label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do sócio"
                className="input-dark mt-1"
              />
            </div>
            <div>
              <label className="stat-label">Valor Aportado (R$)</label>
              <Input
                type="number"
                value={newCapital}
                onChange={e => setNewCapital(e.target.value)}
                placeholder="0.00"
                className="input-dark mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleAddPartner} className="btn-primary">
                <Check className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map(partner => {
          const stats = getPartnerStats(partner.id, btcPrice);
          if (!stats) return null;
          const isEditing = editingId === partner.id;

          return (
            <div key={partner.id} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  {isEditing ? (
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="input-dark w-40"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold">{partner.name}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-info px-3 py-1 rounded-full text-xs font-semibold">
                    {partner.quota.toFixed(1)}% COTA
                  </span>
                  {isEditing ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => saveEditing(partner.id)} className="h-8 w-8 text-success hover:text-success">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8 text-destructive hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEditing(partner)} className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {partners.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => onRemovePartner(partner.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="stat-label">Valor Aportado</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editCapital}
                      onChange={e => setEditCapital(e.target.value)}
                      className="input-dark mt-1"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-foreground font-mono font-semibold">{formatBrl(partner.initialCapital)}</p>
                  )}
                </div>
                <div>
                  <p className="stat-label">Cota Bruta</p>
                  <p className="text-btc font-mono font-semibold">{formatBtc(stats.grossBtc)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="stat-label">Total Sacado</p>
                  <p className="text-destructive font-mono font-semibold">{formatBtc(stats.withdrawnBtc)}</p>
                </div>
                <div>
                  <p className="stat-label">Saldo Disponível</p>
                  <p className="text-success font-mono font-semibold">{formatBtc(stats.availableBtc)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Patrimônio Atual</p>
                    <p className="text-foreground font-mono text-xl font-bold">{formatBrl(stats.patrimonyBrl)}</p>
                  </div>
                  <div className="text-right">
                    <p className="stat-label">Rendimento</p>
                    <p className={`font-mono font-semibold ${stats.patrimonyBrl > partner.initialCapital ? 'text-success' : 'text-destructive'}`}>
                      {partner.initialCapital > 0 
                        ? `${(((stats.patrimonyBrl - partner.initialCapital) / partner.initialCapital) * 100).toFixed(1)}%`
                        : '—'}
                    </p>
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