import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Mineracao } from './pages/Mineracao';
import { Saques } from './pages/Saques';
import { GestaoSocios } from './pages/GestaoSocios';
import { Configuracao } from './pages/Configuracao';
import { useBinancePrice } from '@/hooks/useBinancePrice';
import { useMiningData } from '@/hooks/useMiningData';

interface MainLayoutProps {
  onLogout: () => void;
}

export const MainLayout = ({ onLogout }: MainLayoutProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const priceData = useBinancePrice();
  const miningData = useMiningData();

  const totals = miningData.getTotals();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            btcUsd={priceData.btcUsd}
            btcBrl={priceData.btcBrl}
            change24h={priceData.change24h}
            lastUpdate={priceData.lastUpdate}
            entries={miningData.entries}
            withdrawals={miningData.withdrawals}
            partners={miningData.partners}
            onAddEntry={miningData.addEntry}
            onAddWithdrawal={miningData.addWithdrawal}
            totals={totals}
          />
        );
      case 'mineracao':
        return <Mineracao entries={miningData.entries} />;
      case 'saques':
        return <Saques withdrawals={miningData.withdrawals} partners={miningData.partners} />;
      case 'socios':
        return (
          <GestaoSocios
            partners={miningData.partners}
            btcPrice={priceData.btcBrl}
            getPartnerStats={miningData.getPartnerStats}
            onUpdatePartner={miningData.updatePartner}
            onAddPartner={miningData.addPartner}
            onRemovePartner={miningData.removePartner}
          />
        );
      case 'config':
        return <Configuracao />;
      default:
        return (
          <Dashboard
            btcUsd={priceData.btcUsd}
            btcBrl={priceData.btcBrl}
            change24h={priceData.change24h}
            lastUpdate={priceData.lastUpdate}
            entries={miningData.entries}
            withdrawals={miningData.withdrawals}
            partners={miningData.partners}
            onAddEntry={miningData.addEntry}
            onAddWithdrawal={miningData.addWithdrawal}
            totals={totals}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={onLogout}
        netBtc={totals.netBtc}
        btcPrice={priceData.btcBrl}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
};
