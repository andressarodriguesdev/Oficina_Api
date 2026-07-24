import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { ClienteDetalhes } from './pages/ClienteDetalhes';
import { Veiculos } from './pages/Veiculos';
import { VeiculoDetalhes } from './pages/VeiculoDetalhes';
import { OrdensServico } from './pages/OrdensServico';
import { OrdemDetalhes } from './pages/OrdemDetalhes';
import { OrdemEditar } from './pages/OrdemEditar';
import { Historico } from './pages/Historico';
import { Configuracoes } from './pages/Configuracoes';
import { Financeiro } from './pages/Financeiro';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/painel" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClienteDetalhes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/veiculos/:id" element={<VeiculoDetalhes />} />
            <Route path="/ordens-servico" element={<OrdensServico />} />
            <Route path="/ordens-servico/:id" element={<OrdemDetalhes />} />
            <Route path="/ordens-servico/:id/editar" element={<OrdemEditar />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route  path="/financeiro" element={<Financeiro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
