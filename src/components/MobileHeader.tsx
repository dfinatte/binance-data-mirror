import { Zap, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  netBtc: number;
  btcPrice: number;
  onLogout: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const MobileHeader = ({ netBtc, btcPrice, onLogout, onRefresh, loading }: MobileHeaderProps) => {
  const formatBtc = (value: number) => value.toFixed(6);
  const formatBrl = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <header className="sticky top-0 z-40 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm">
              <span className="text-primary">MINER</span>
              <span className="text-foreground">DASH</span>
            </h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              LIVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="text-btc text-sm font-semibold">₿ {formatBtc(netBtc)}</p>
            <p className="text-[10px] text-muted-foreground">{formatBrl(netBtc * btcPrice)}</p>
          </div>
          
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
