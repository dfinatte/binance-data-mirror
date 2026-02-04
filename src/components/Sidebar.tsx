import { LayoutDashboard, RefreshCw, Download, Users, Settings, LogOut, Zap } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  netBtc: number;
  btcPrice: number;
}

const menuItems = [
  { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
  { id: 'mineracao', label: 'Mineração', icon: RefreshCw },
  { id: 'saques', label: 'Saques', icon: Download },
  { id: 'socios', label: 'Gestão Sócios', icon: Users },
  { id: 'config', label: 'Configuração', icon: Settings },
];

export const Sidebar = ({ currentPage, onNavigate, onLogout, netBtc, btcPrice }: SidebarProps) => {
  const formatBtc = (value: number) => value.toFixed(8);
  const formatBrl = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col min-h-screen">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              <span className="text-primary">MINER</span>
              <span className="text-foreground">DASH</span>
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-item w-full ${currentPage === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {currentPage === item.id && (
              <span className="ml-auto text-lg">›</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3">
        <div className="stat-card mb-3">
          <p className="stat-label">Saldo Líquido</p>
          <p className="text-btc text-lg font-semibold">₿ {formatBtc(netBtc)}</p>
          <p className="text-xs text-muted-foreground mt-1">≈ {formatBrl(netBtc * btcPrice)}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          BINANCE LIVE ENGINE
        </div>

        <button
          onClick={onLogout}
          className="sidebar-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};
