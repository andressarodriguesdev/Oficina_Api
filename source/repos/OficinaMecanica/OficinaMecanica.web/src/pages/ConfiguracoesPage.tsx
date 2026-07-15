import { useState } from 'react';
import { Save, Building2, Bell, Lock, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Form';
import { useAuth } from '../hooks/useAuth';

export function ConfiguracoesPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Perfil */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-accent-400" />
          <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide">
            Perfil do Usuário
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nome</Label>
            <Input defaultValue={user?.name} />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email} />
          </div>
          <div>
            <Label>Função</Label>
            <Input defaultValue={user?.role} disabled className="opacity-60" />
          </div>
        </div>
      </Card>

      {/* Dados da oficina */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-accent-400" />
          <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide">
            Dados da Oficina
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nome da Oficina</Label>
            <Input defaultValue="OficinaMecanica" />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input defaultValue="12.345.678/0001-90" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input defaultValue="(11) 3333-4444" />
          </div>
          <div>
            <Label>Email de contato</Label>
            <Input defaultValue="contato@oficinamecanica.com" />
          </div>
          <div className="sm:col-span-2">
            <Label>Endereço</Label>
            <Input defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-accent-400" />
          <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide">
            Notificações
          </h4>
        </div>
        <div className="space-y-3">
          {[
            'Notificar novas ordens de serviço',
            'Notificar aprovações pendentes',
            'Notificar conclusão de serviços',
            'Resumo diário por email',
          ].map((label) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-accent-500 w-4 h-4" />
              <span className="text-sm text-graphite-300">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-accent-400" />
          <h4 className="text-sm font-semibold text-graphite-200 uppercase tracking-wide">
            Segurança
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Nova Senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <Label>Confirmar Senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4 pb-6">
        <Button icon={<Save size={18} />} onClick={handleSave}>Salvar Configurações</Button>
        {saved && (
          <span className="text-sm text-emerald-400 animate-fade-in">
            Configurações salvas com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}
