import { useState, useEffect } from 'react';

interface PriceData {
  btcUsd: number;
  btcBrl: number;
  change24h: number;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useBinancePrice = () => {
  const [data, setData] = useState<PriceData>({
    btcUsd: 0,
    btcBrl: 0,
    change24h: 0,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchPrices = async () => {
    try {
      const [usdResponse, brlResponse, tickerResponse] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL'),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
      ]);

      const usdData = await usdResponse.json();
      const brlData = await brlResponse.json();
      const tickerData = await tickerResponse.json();

      setData({
        btcUsd: parseFloat(usdData.price),
        btcBrl: parseFloat(brlData.price),
        change24h: parseFloat(tickerData.priceChangePercent),
        loading: false,
        error: null,
        lastUpdate: new Date(),
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar cotações',
      }));
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return data;
};
