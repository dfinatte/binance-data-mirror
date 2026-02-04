import { LayoutDashboard, RefreshCw, Download, Users, Settings } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'mineracao', label: 'Mining', icon: RefreshCw },
  { id: 'saques', label: 'Saques', icon: Download },
  { id: 'socios', label: 'Sócios', icon: Users },
  { id: 'config', label: 'Config', icon: Settings },
];

export const MobileNav = ({ currentPage, onNavigate }: MobileNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
              currentPage === item.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
