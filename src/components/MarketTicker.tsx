import { Globe, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketTickerProps {
  btcUsd: number;
  btcBrl: number;
  change24h: number;
  lastUpdate: Date | null;
}

export const MarketTicker = ({ btcUsd, btcBrl, change24h, lastUpdate }: MarketTickerProps) => {
  const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('pt-BR');
  };

  const isPositive = change24h >= 0;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="market-ticker">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">MARKET LIVE</span>
        <div className="h-4 w-px bg-border" />
        <div className="text-sm">
          <span className="text-muted-foreground text-xs mr-1">BTC/USD</span>
          <span className="text-success font-mono font-semibold">{formatUsd(btcUsd)}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-sm">
          <span className="text-muted-foreground text-xs mr-1">BTC/BRL</span>
          <span className="text-info font-mono font-semibold">{formatBrl(btcBrl)}</span>
        </div>
      </div>

      <div className="market-ticker">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : (
          <TrendingDown className="w-4 h-4 text-destructive" />
        )}
        <span className={`text-sm font-mono font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </span>
        <span className="text-xs text-muted-foreground">24h</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
        <Clock className="w-3 h-3" />
        Cotação: {formatTime(lastUpdate)}
      </div>
    </div>
  );
};
