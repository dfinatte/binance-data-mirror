import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { MobileHeader } from './MobileHeader';
import { Dashboard } from './pages/Dashboard';
import { Mineracao } from './pages/Mineracao';
import { Saques } from './pages/Saques';
import { GestaoSocios } from './pages/GestaoSocios';
import { Configuracao } from './pages/Configuracao';
import { useBinancePrice } from '@/hooks/useBinancePrice';
import { useMiningDataCloud } from '@/hooks/useMiningDataCloud';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const priceData = useBinancePrice();
  const miningData = useMiningDataCloud();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  const totals = miningData.getTotals();

  const handleLogout = async () => {
    await signOut();
  };

  const renderPage = () => {
    if (miningData.loading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

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
            onUpdateEntry={miningData.updateEntry}
            onDeleteEntry={miningData.deleteEntry}
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
            onUpdateEntry={miningData.updateEntry}
            onDeleteEntry={miningData.deleteEntry}
            onAddWithdrawal={miningData.addWithdrawal}
            totals={totals}
          />
        );
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MobileHeader
          netBtc={totals.netBtc}
          btcPrice={priceData.btcBrl}
          onLogout={handleLogout}
          onRefresh={miningData.refetch}
          loading={miningData.loading}
        />
        <main className="flex-1 overflow-auto pb-20">
          {renderPage()}
        </main>
        <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        netBtc={totals.netBtc}
        btcPrice={priceData.btcBrl}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
};
