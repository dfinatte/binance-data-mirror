import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export const useMiningDataCloud = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MiningEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawEntry[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch mining entries
      const { data: entriesData } = await supabase
        .from('mining_entries')
        .select('*')
        .order('date', { ascending: true });

      // Fetch partners
      const { data: partnersData } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: true });

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .order('date', { ascending: true });

      if (entriesData) {
        setEntries(entriesData.map(e => ({
          id: e.id,
          date: e.date,
          btcAmount: Number(e.btc_amount),
          usdValue: Number(e.usd_value),
          brlValue: Number(e.brl_value),
        })));
      }

      if (partnersData) {
        setPartners(partnersData.map(p => ({
          id: p.id,
          name: p.name,
          quota: Number(p.quota),
          initialCapital: Number(p.initial_capital),
        })));
      }

      if (withdrawalsData) {
        setWithdrawals(withdrawalsData.map(w => ({
          id: w.id,
          date: w.date,
          brlAmount: Number(w.brl_amount),
          btcAmount: Number(w.btc_amount),
          beneficiary: w.partner_id,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addEntry = async (entry: Omit<MiningEntry, 'id'> & { date?: Date }) => {
    if (!user) return;

    const { error } = await supabase
      .from('mining_entries')
      .insert({
        user_id: user.id,
        btc_amount: entry.btcAmount,
        usd_value: entry.usdValue,
        brl_value: entry.brlValue,
        date: entry.date ? entry.date.toISOString() : new Date().toISOString(),
      });

    if (!error) {
      await fetchData();
    }
  };

  const addWithdrawal = async (withdrawal: Omit<WithdrawEntry, 'id' | 'date'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        partner_id: withdrawal.beneficiary,
        brl_amount: withdrawal.brlAmount,
        btc_amount: withdrawal.btcAmount,
      });

    if (!error) {
      await fetchData();
    }
  };

  const recalculateQuotas = (partnersList: Partner[]) => {
    const totalCapital = partnersList.reduce((sum, p) => sum + p.initialCapital, 0);
    return partnersList.map(p => ({
      ...p,
      quota: totalCapital > 0 ? (p.initialCapital / totalCapital) * 100 : 0,
    }));
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    if (!user) return;

    const partner = partners.find(p => p.id === id);
    if (!partner) return;

    const updatedPartner = { ...partner, ...updates };
    const allPartners = partners.map(p => p.id === id ? updatedPartner : p);
    const recalculated = recalculateQuotas(allPartners);
    const finalPartner = recalculated.find(p => p.id === id);

    if (finalPartner) {
      const { error } = await supabase
        .from('partners')
        .update({
          name: finalPartner.name,
          initial_capital: finalPartner.initialCapital,
          quota: finalPartner.quota,
        })
        .eq('id', id);

      if (!error) {
        // Update all partners quotas
        for (const p of recalculated) {
          if (p.id !== id) {
            await supabase
              .from('partners')
              .update({ quota: p.quota })
              .eq('id', p.id);
          }
        }
        await fetchData();
      }
    }
  };

  const addPartner = async (name: string, initialCapital: number) => {
    if (!user) return;

    const newPartner: Partner = {
      id: 'temp',
      name,
      quota: 0,
      initialCapital,
    };

    const allPartners = [...partners, newPartner];
    const recalculated = recalculateQuotas(allPartners);
    const newPartnerCalc = recalculated[recalculated.length - 1];

    const { error, data } = await supabase
      .from('partners')
      .insert({
        user_id: user.id,
        name,
        initial_capital: initialCapital,
        quota: newPartnerCalc.quota,
      })
      .select()
      .single();

    if (!error && data) {
      // Update existing partners quotas
      for (let i = 0; i < partners.length; i++) {
        await supabase
          .from('partners')
          .update({ quota: recalculated[i].quota })
          .eq('id', partners[i].id);
      }
      await fetchData();
    }
  };

  const removePartner = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (!error) {
      const remaining = partners.filter(p => p.id !== id);
      const recalculated = recalculateQuotas(remaining);
      
      for (const p of recalculated) {
        await supabase
          .from('partners')
          .update({ quota: p.quota })
          .eq('id', p.id);
      }
      await fetchData();
    }
  };

  const getTotals = () => {
    const totalBtc = entries.reduce((sum, e) => sum + e.btcAmount, 0);
    const totalWithdrawnBrl = withdrawals.reduce((sum, w) => sum + w.brlAmount, 0);
    const totalWithdrawnBtc = withdrawals.reduce((sum, w) => sum + w.btcAmount, 0);

    return {
      totalBtc,
      totalWithdrawnBrl,
      totalWithdrawnBtc,
      netBtc: totalBtc - totalWithdrawnBtc,
    };
  };

  const getPartnerStats = (partnerId: string, btcPrice: number) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return null;

    const totals = getTotals();
    const quotaDecimal = partner.quota / 100;

    const grossBtc = totals.totalBtc * quotaDecimal;
    const withdrawnBtc = withdrawals
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
    entries,
    withdrawals,
    partners,
    loading,
    addEntry,
    addWithdrawal,
    updatePartner,
    addPartner,
    removePartner,
    getTotals,
    getPartnerStats,
    refetch: fetchData,
  };
};
