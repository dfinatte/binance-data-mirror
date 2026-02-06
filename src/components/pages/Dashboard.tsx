import { TrendingUp, Plus, Download, FileText, CalendarIcon, Building2, Pickaxe, Calendar as CalendarIconFull, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Check, X } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { MarketTicker } from '@/components/MarketTicker';
import { MiningEntry, WithdrawEntry, Partner } from '@/hooks/useMiningData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isSameDay, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DashboardProps {
  btcUsd: number;
  btcBrl: number;
  change24h: number;
  lastUpdate: Date | null;
  entries: MiningEntry[];
  withdrawals: WithdrawEntry[];
  partners: Partner[];
  onAddEntry: (entry: { btcAmount: number; usdValue: number; brlValue: number; date?: Date }) => void;
  onUpdateEntry?: (id: string, updates: Partial<Omit<MiningEntry, 'id'>>) => void;
  onDeleteEntry?: (id: string) => void;
  onAddWithdrawal: (withdrawal: { brlAmount: number; btcAmount: number; beneficiary: string }) => void;
  totals: { totalBtc: number; totalWithdrawnBrl: number; totalWithdrawnBtc: number; netBtc: number };
}

export const Dashboard = ({
  btcUsd,
  btcBrl,
  change24h,
  lastUpdate,
  entries,
  withdrawals,
  partners,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onAddWithdrawal,
  totals,
}: DashboardProps) => {
  // Global date filter for ledger view
  const [globalDate, setGlobalDate] = useState<Date>(new Date());
  const [newBtc, setNewBtc] = useState('');
  const [newBrl, setNewBrl] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [withdrawBtc, setWithdrawBtc] = useState('');
  const [withdrawBrl, setWithdrawBrl] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  
  // Edit mode state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editBtc, setEditBtc] = useState('');
  const [editBrl, setEditBrl] = useState('');

  const formatBtc = (value: number) => `₿ ${value.toFixed(8)}`;
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Auto-calculate BRL when BTC changes (suggestion only)
  useEffect(() => {
    const btcVal = parseFloat(newBtc);
    if (!isNaN(btcVal) && btcVal > 0) {
      setNewBrl((btcVal * btcBrl).toFixed(2));
    } else {
      setNewBrl('');
    }
  }, [newBtc, btcBrl]);

  // Filter entries by selected global date
  const filteredEntriesForDate = useMemo(() => {
    return entries.filter(entry => isSameDay(new Date(entry.date), globalDate));
  }, [entries, globalDate]);

  const filteredWithdrawalsForDate = useMemo(() => {
    return withdrawals.filter(w => isSameDay(new Date(w.date), globalDate));
  }, [withdrawals, globalDate]);

  // Daily totals for the selected date
  const dailyMiningBtc = filteredEntriesForDate.reduce((sum, e) => sum + e.btcAmount, 0);
  const dailyMiningBrl = filteredEntriesForDate.reduce((sum, e) => sum + e.brlValue, 0);
  const dailyWithdrawalsBtc = filteredWithdrawalsForDate.reduce((sum, w) => sum + w.btcAmount, 0);
  
  // Check if current date has records
  const hasRecordsForDate = filteredEntriesForDate.length > 0 || filteredWithdrawalsForDate.length > 0;
  const isToday = isSameDay(globalDate, new Date());
  const isViewingPast = !isToday;

  // Cálculos separados - totais acumulados
  const totalInvestimentoEstrutura = partners.reduce((sum, p) => sum + p.initialCapital, 0);
  const producaoAcumuladaBtc = totals.netBtc;
  const valorRealDisponivel = producaoAcumuladaBtc * btcBrl;

  // Navigation helpers
  const goToPreviousDay = () => setGlobalDate(prev => subDays(prev, 1));
  const goToNextDay = () => setGlobalDate(prev => addDays(prev, 1));
  const goToToday = () => setGlobalDate(new Date());

  const handleAddEntry = () => {
    const btcAmount = parseFloat(newBtc);
    const brlAmount = parseFloat(newBrl);
    if (isNaN(btcAmount) || btcAmount <= 0) return;
    if (isNaN(brlAmount) || brlAmount <= 0) return;

    onAddEntry({
      btcAmount,
      usdValue: btcAmount * btcUsd,
      brlValue: brlAmount, // Use manually entered/edited value
      date: selectedDate,
    });
    setNewBtc('');
    setNewBrl('');
    setSelectedDate(new Date());
  };

  const handleStartEdit = (entry: MiningEntry) => {
    setEditingEntryId(entry.id);
    setEditBtc(entry.btcAmount.toFixed(8));
    setEditBrl(entry.brlValue.toFixed(2));
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditBtc('');
    setEditBrl('');
  };

  const handleSaveEdit = (entry: MiningEntry) => {
    if (!onUpdateEntry) return;
    
    const btcAmount = parseFloat(editBtc);
    const brlAmount = parseFloat(editBrl);
    if (isNaN(btcAmount) || btcAmount <= 0) return;
    if (isNaN(brlAmount) || brlAmount <= 0) return;

    onUpdateEntry(entry.id, {
      btcAmount,
      brlValue: brlAmount,
      usdValue: btcAmount * btcUsd,
    });
    
    handleCancelEdit();
  };

  const handleDeleteEntry = (id: string) => {
    if (!onDeleteEntry) return;
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      onDeleteEntry(id);
    }
  };

  const handleAddWithdrawal = () => {
    const btcAmount = parseFloat(withdrawBtc);
    if (isNaN(btcAmount) || btcAmount <= 0) return;
    if (!beneficiary) return;

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel de Monitoramento</h1>
          <p className="text-muted-foreground text-sm">Livro-razão e mineração em tempo real</p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Resumo de Gestão
        </Button>
      </div>

      {/* Global Date Navigator - Ledger Calendar */}
      <div className={cn(
        "stat-card border-l-4",
        isViewingPast ? "border-l-warning bg-warning/5" : "border-l-primary"
      )}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isViewingPast ? "bg-warning/10" : "bg-primary/10"
            )}>
              {isViewingPast ? (
                <Eye className={cn("w-5 h-5", isViewingPast ? "text-warning" : "text-primary")} />
              ) : (
                <CalendarIconFull className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="stat-label">NAVEGAÇÃO POR DATA</p>
                {isViewingPast && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-warning/20 text-warning rounded-full">
                    MODO VISUALIZAÇÃO
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isViewingPast 
                  ? 'Visualizando registros históricos (valores travados)'
                  : 'Selecione uma data para consultar o livro-razão'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPreviousDay}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[200px] justify-center text-center font-medium",
                    isViewingPast && "border-warning text-warning"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(globalDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={globalDate}
                  onSelect={(date) => date && setGlobalDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextDay}
              disabled={isToday}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {!isToday && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={goToToday}
                className="ml-2"
              >
                Hoje
              </Button>
            )}
          </div>
        </div>

        {/* Daily Summary for selected date */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Minerado no dia</p>
              <p className="text-lg font-bold font-mono text-btc">
                {dailyMiningBtc > 0 ? formatBtc(dailyMiningBtc) : '—'}
              </p>
              {dailyMiningBtc > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatBrl(dailyMiningBrl)} <span className="text-warning">(valor gravado)</span>
                </p>
              )}
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Saques no dia</p>
              <p className="text-lg font-bold font-mono text-destructive">
                {dailyWithdrawalsBtc > 0 ? formatBtc(dailyWithdrawalsBtc) : '—'}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Registros</p>
              <p className="text-lg font-bold">
                {hasRecordsForDate 
                  ? `${filteredEntriesForDate.length + filteredWithdrawalsForDate.length} lançamento(s)`
                  : 'Nenhum registro'
                }
              </p>
              {!hasRecordsForDate && (
                <p className="text-xs text-success mt-1">Disponível para novo input</p>
              )}
            </div>
          </div>

          {/* History list for selected date */}
          {filteredEntriesForDate.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">REGISTROS DO DIA</p>
              <div className="space-y-2">
                {filteredEntriesForDate.map(entry => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    {editingEntryId === entry.id ? (
                      // Edit mode
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">BTC</label>
                            <Input
                              type="number"
                              step="0.00000001"
                              value={editBtc}
                              onChange={e => setEditBtc(e.target.value)}
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Valor R$ (travado)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editBrl}
                              onChange={e => setEditBrl(e.target.value)}
                              className="h-8 font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-success hover:text-success"
                            onClick={() => handleSaveEdit(entry)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-mono text-btc font-medium">{formatBtc(entry.btcAmount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBrl(entry.brlValue)} <span className="text-warning">(gravado)</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleStartEdit(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MarketTicker
        btcUsd={btcUsd}
        btcBrl={btcBrl}
        change24h={change24h}
        lastUpdate={lastUpdate}
      />

      {/* Cards principais: Estrutura vs Produção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Investimento em Estrutura */}
        <div className="stat-card border-l-4 border-l-info">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="stat-label">INVESTIMENTO EM ESTRUTURA</p>
              <p className="text-xs text-muted-foreground">Capital fixo aportado pelos sócios</p>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-info">{formatBrl(totalInvestimentoEstrutura)}</p>
          <p className="text-xs text-muted-foreground mt-1">Valor em R$ • Não oscila com mercado</p>
        </div>

        {/* Card B: Produção Acumulada */}
        <div className="stat-card border-l-4 border-l-btc">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-btc/10 flex items-center justify-center">
              <Pickaxe className="w-5 h-5 text-btc" />
            </div>
            <div>
              <p className="stat-label">PRODUÇÃO ACUMULADA</p>
              <p className="text-xs text-muted-foreground">Saldo minerado disponível</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold font-mono text-btc">{formatBtc(producaoAcumuladaBtc)}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Valor atual:</span>
            <span className="text-lg font-semibold font-mono text-success">{formatBrl(valorRealDisponivel)}</span>
          </div>
        </div>
      </div>

      {/* Cards secundários */}
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
          subtitle="MINERADO TOTAL"
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
              <h3 className="font-semibold text-primary">Nova Produção (Baixa)</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="stat-label">Data da Produção</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 input-dark",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                <label className="stat-label flex items-center gap-2">
                  Valor R$ 
                  <span className="text-xs text-warning font-normal">(editável - será travado)</span>
                </label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={newBrl}
                    onChange={e => setNewBrl(e.target.value)}
                    placeholder="0.00"
                    className="input-dark pr-12 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success font-bold">R$</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sugestão: {newBtc ? formatBrl(parseFloat(newBtc) * btcBrl) : 'R$ 0,00'} (cotação atual)
                </p>
              </div>

              <div>
                <label className="stat-label">Valor USD (calculado)</label>
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
                Salvar Produção
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
