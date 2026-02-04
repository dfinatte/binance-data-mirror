import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');

export const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message);
        return;
      }
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Confirme seu email antes de fazer login');
        } else {
          setError(error.message);
        }
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email já está cadastrado');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar.');
        setEmail('');
        setPassword('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-primary">MINER</span>
            <span className="text-foreground">DASH</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de Mineração BTC
          </p>
        </div>

        {/* Form */}
        <div className="stat-card">
          <h2 className="text-lg font-semibold text-center mb-6">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="stat-label">Email</label>
              <div className="relative mt-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-dark pl-10"
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="stat-label">Senha</label>
              <div className="relative mt-1">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="input-dark pl-10"
                  disabled={loading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg py-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-success text-sm text-center bg-success/10 rounded-lg py-2">
                {success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Sincronizado em todos os dispositivos
        </p>
      </div>
    </div>
  );
};
