import { Settings, Database, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Configuracao = () => {
  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('_msh_data');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerenciamento do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Dados Locais</h3>
              <p className="text-xs text-muted-foreground">Armazenamento no navegador</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Todos os dados são armazenados localmente no seu navegador. Não são enviados para servidores externos.
          </p>
          <Button variant="destructive" onClick={handleClearData} className="w-full">
            Limpar Todos os Dados
          </Button>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">API Binance</h3>
              <p className="text-xs text-muted-foreground">Cotações em tempo real</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            As cotações são obtidas diretamente da API pública da Binance e atualizadas a cada 10 segundos.
          </p>
          <div className="flex items-center gap-2 text-success text-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Conectado
          </div>
        </div>

        <div className="stat-card md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold">Sobre o Sistema</h3>
              <p className="text-xs text-muted-foreground">Informações gerais</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versão</p>
              <p className="font-mono">1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Framework</p>
              <p className="font-mono">React + Vite</p>
            </div>
            <div>
              <p className="text-muted-foreground">API</p>
              <p className="font-mono">Binance Public</p>
            </div>
            <div>
              <p className="text-muted-foreground">Storage</p>
              <p className="font-mono">LocalStorage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
