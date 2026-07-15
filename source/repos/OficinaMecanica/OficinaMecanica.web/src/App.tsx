import { AuthProvider, useAuth } from './hooks/useAuth';
import { useNavigation, type Page } from './hooks/useNavigation';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { ClienteDetalhesPage } from './pages/ClienteDetalhesPage';
import { VeiculosPage } from './pages/VeiculosPage';
import { OrdemServicoFormPage } from './pages/OrdemServicoFormPage';
import { OrdemServicoDetalhesPage } from './pages/OrdemServicoDetalhesPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { HistoricoPage } from './pages/HistoricoPage';



const pageTitles: Record<Page, { title:string; subtitle:string }> = {

  dashboard: {
    title:'Dashboard',
    subtitle:'Visão geral da oficina'
  },

  clientes:{
    title:'Clientes',
    subtitle:'Gerencie seus clientes'
  },

  'cliente-detalhes':{
    title:'Detalhes do Cliente',
    subtitle:'Veículos e histórico do cliente'
  },

  veiculos:{
    title:'Veículos',
    subtitle:'Gerencie os veículos cadastrados'
  },

  'os-nova':{
    title:'Nova Ordem de Serviço',
    subtitle:'Crie uma nova OS'
  },

  'os-detalhes':{
    title:'Detalhes da OS',
    subtitle:'Informações completas da ordem'
  },

  historico:{
    title:'Histórico',
    subtitle:'Histórico de ordens de serviço'
  },

  configuracoes:{
    title:'Configurações',
    subtitle:'Ajustes do sistema'
  },

};





function AppContent(){

  const { user, logout } = useAuth();


  const {
    page,
    params,
    navigate
  } = useNavigation('dashboard');



  if(!user){

    return <LoginPage />;

  }




  const handleNavigate = (
    next:Page,
    p:Record<string,string> = {}
  ) => {

    navigate(next,p);

  };





  const renderPage = () => {


    switch(page){


      case 'dashboard':

        return (
          <DashboardPage
            onNavigate={handleNavigate}
          />
        );



      case 'clientes':

        return (
          <ClientesPage
            onNavigate={handleNavigate}
          />
        );



      case 'cliente-detalhes':

        return (
          <ClienteDetalhesPage

            clienteId={params.id}

            onNavigate={handleNavigate}

          />
        );



      case 'veiculos':

        return (
          <VeiculosPage />
        );



      case 'os-nova':

        return (
          <OrdemServicoFormPage
            onNavigate={handleNavigate}
          />
        );



      case 'os-detalhes':

        return (
          <OrdemServicoDetalhesPage

            osId={params.id}

            onNavigate={handleNavigate}

          />
        );



      case 'historico':

        return (
          <HistoricoPage
            onNavigate={handleNavigate}
          />
        );



      case 'configuracoes':

        return (
          <ConfiguracoesPage />
        );



      default:

        return (
          <DashboardPage
            onNavigate={handleNavigate}
          />
        );

    }

  };





  const {
    title,
    subtitle
  } = pageTitles[page];






  return (

    <div className="flex min-h-screen bg-graphite-950">


      <Sidebar

        current={page}

        onNavigate={handleNavigate}

        onLogout={logout}

      />



      <div className="
        flex-1
        flex
        flex-col
        min-w-0
      ">


        <Header

          title={title}

          subtitle={subtitle}

        />



        <main className="
          flex-1
          p-6
          animate-fade-in
        ">

          {renderPage()}

        </main>



      </div>



    </div>

  );

}







export default function App(){

  return (

    <AuthProvider>

      <AppContent />

    </AuthProvider>

  );

}