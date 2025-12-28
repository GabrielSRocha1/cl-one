import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const id = localStorage.getItem('admin_id');

    if (!token || !id) {
      window.location.href = '/admin/login';
      return;
    }

    setAdminToken(token);
    setAdminId(id);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    toast.success('Logout realizado com sucesso');
    window.location.href = '/admin/login';
  };

  if (!adminToken || !adminId) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">MINTY Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Total de Usuários</h3>
            <p className="text-3xl font-bold text-white">1,234</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Carteiras Ativas</h3>
            <p className="text-3xl font-bold text-white">567</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Swaps Realizados</h3>
            <p className="text-3xl font-bold text-white">2,891</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Volume Total</h3>
            <p className="text-3xl font-bold text-white">$1.2M</p>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Gerenciamento de Usuários</h2>
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Ver Todos os Usuários</Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Buscar Usuário</Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Suspender Usuário</Button>
            </div>
          </Card>

          {/* Wallet Management */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Gerenciamento de Carteiras</h2>
            <div className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700">Ver Carteiras</Button>
              <Button className="w-full bg-green-600 hover:bg-green-700">Monitorar Saldos</Button>
              <Button className="w-full bg-green-600 hover:bg-green-700">Histórico de Transações</Button>
            </div>
          </Card>

          {/* Swap & Liquidity */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Swaps e Liquidez</h2>
            <div className="space-y-3">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Monitorar Swaps</Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Pools de Liquidez</Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Estatísticas</Button>
            </div>
          </Card>

          {/* Configuration */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Configurações</h2>
            <div className="space-y-3">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Gerenciar Chains</Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Configurar Taxas</Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Tokens Suportados</Button>
            </div>
          </Card>

          {/* Logs & Audit */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Logs e Auditoria</h2>
            <div className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700">Ver Logs</Button>
              <Button className="w-full bg-red-600 hover:bg-red-700">Auditoria de Ações</Button>
              <Button className="w-full bg-red-600 hover:bg-red-700">Relatórios</Button>
            </div>
          </Card>

          {/* Admin Management */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Gerenciamento de Admins</h2>
            <div className="space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Listar Admins</Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Criar Admin</Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Alterar Senha</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
