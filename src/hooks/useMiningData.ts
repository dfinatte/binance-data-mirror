import { useState, useEffect } from 'react';

export interface MiningEntry {
  id: string;
  date: string;
  btcAmount: number;
  usdValue: number;
  brlValue: number;
}

export interface WithdrawEntry {
  id: string;
  date: string;
  brlAmount: number;
  btcAmount: number;
  beneficiary: string;
}

export interface Partner {
  id: string;
  name: string;
  quota: number;
  initialCapital: number;
}

interface MiningData {
  entries: MiningEntry[];
  withdrawals: WithdrawEntry[];
  partners: Partner[];
}

const STORAGE_KEY = '_msh_data';

const getInitialData = (): MiningData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    entries: [],
    withdrawals: [],
    partners: [
      { id: '1', name: 'Sócio 1', quota: 50, initialCapital: 0 },
      { id: '2', name: 'Sócio 2', quota: 50, initialCapital: 0 },
    ],
  };
};

export const useMiningData = () => {
  const [data, setData] = useState<MiningData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addEntry = (entry: Omit<MiningEntry, 'id' | 'date'>) => {
    const newEntry: MiningEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
  };

  const addWithdrawal = (withdrawal: Omit<WithdrawEntry, 'id' | 'date'>) => {
    const newWithdrawal: WithdrawEntry = {
      ...withdrawal,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, withdrawals: [...prev.withdrawals, newWithdrawal] }));
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setData(prev => ({
      ...prev,
      partners: prev.partners.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const getTotals = () => {
    const totalBtc = data.entries.reduce((sum, e) => sum + e.btcAmount, 0);
    const totalWithdrawnBrl = data.withdrawals.reduce((sum, w) => sum + w.brlAmount, 0);
    const totalWithdrawnBtc = data.withdrawals.reduce((sum, w) => sum + w.btcAmount, 0);
    
    return {
      totalBtc,
      totalWithdrawnBrl,
      totalWithdrawnBtc,
      netBtc: totalBtc - totalWithdrawnBtc,
    };
  };

  const getPartnerStats = (partnerId: string, btcPrice: number) => {
    const partner = data.partners.find(p => p.id === partnerId);
    if (!partner) return null;

    const totals = getTotals();
    const quotaDecimal = partner.quota / 100;
    
    const grossBtc = totals.totalBtc * quotaDecimal;
    const withdrawnBtc = data.withdrawals
      .filter(w => w.beneficiary === partnerId)
      .reduce((sum, w) => sum + w.btcAmount, 0);
    const availableBtc = grossBtc - withdrawnBtc;

    return {
      grossBtc,
      withdrawnBtc,
      availableBtc,
      patrimonyBrl: availableBtc * btcPrice,
    };
  };

  return {
    ...data,
    addEntry,
    addWithdrawal,
    updatePartner,
    getTotals,
    getPartnerStats,
  };
};
