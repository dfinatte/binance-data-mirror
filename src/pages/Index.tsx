import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { MainLayout } from '@/components/MainLayout';
import { getStoredAuth } from '@/lib/auth';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setIsAuthenticated(getStoredAuth());
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <MainLayout onLogout={() => setIsAuthenticated(false)} />;
};

export default Index;
