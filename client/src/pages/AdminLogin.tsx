import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      // Salvar token no localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_id', data.admin.id.toString());
      toast.success('Login realizado com sucesso!');
      window.location.href = '/admin/dashboard';
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fazer login');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    await loginMutation.mutateAsync({ username, password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">MINTY Admin</h1>
          <p className="text-slate-400">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Usuário</label>
            <Input
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 mb-2">Credenciais de Demonstração:</p>
          <p className="text-sm text-slate-300">
            <strong>Usuário:</strong> Adilson Rocha
          </p>
          <p className="text-sm text-slate-300">
            <strong>Senha:</strong> tilibra4
          </p>
        </div>
      </Card>
    </div>
  );
}
