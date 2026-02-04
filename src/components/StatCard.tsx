import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'bitcoin';
}

export const StatCard = ({ label, value, subtitle, trend, icon, variant = 'default' }: StatCardProps) => {
  const valueColors = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    bitcoin: 'text-btc',
  };

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <p className="stat-label">{label}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 ? 'badge-success' : 'bg-destructive/20 text-destructive border border-destructive/30'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
          </div>
        )}
        {icon && (
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <p className={`stat-value ${valueColors[variant]}`}>{value}</p>
      
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};
