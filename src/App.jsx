import React, { useState, useEffect } from 'react';
import { initializeDB } from './services/db';
import { authService } from './services/auth';
import MainLayout from './components/MainLayout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Contacts from './views/Contacts';
import Campaigns from './views/Campaigns';
import Services from './views/Services';
import Proposals from './views/Proposals';
import Settings from './views/Settings';
import Chat from './views/Chat';
import Knowledge from './views/Knowledge';
import PlaceholderView from './views/PlaceholderView';
import ClientProposalView from './views/ClientProposalView';
import Agenda from './views/Agenda';
import Automations from './views/Automations';
import Users from './views/Users';
import Reports from './views/Reports';
import Opportunities from './views/Opportunities';
import Products from './views/Products';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [clientProposalId, setClientProposalId] = useState(null);

  useEffect(() => {
    // Inicializar o banco de dados simulado no LocalStorage
    initializeDB();
    setDbInitialized(true);

    const checkUrlRoute = () => {
      // 1. Check query params: ?proposta=prop_id or ?p=prop_id
      const params = new URLSearchParams(window.location.search);
      const propQuery = params.get('proposta') || params.get('p');
      if (propQuery) {
        setClientProposalId(propQuery);
        return;
      }

      // 2. Check hash route: #/proposta/prop_id or #/p/prop_id
      const hash = window.location.hash;
      if (hash.startsWith('#/proposta/')) {
        const hashId = hash.replace('#/proposta/', '');
        if (hashId) {
          setClientProposalId(hashId);
          return;
        }
      }
      if (hash.startsWith('#/p/')) {
        const hashId = hash.replace('#/p/', '');
        if (hashId) {
          setClientProposalId(hashId);
          return;
        }
      }

      // 3. Check pathname: /proposta/:id
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'proposta' && pathParts[2]) {
        setClientProposalId(pathParts[2]);
        return;
      }

      setClientProposalId(null);
    };

    checkUrlRoute();
    window.addEventListener('popstate', checkUrlRoute);
    window.addEventListener('hashchange', checkUrlRoute);

    // Verificar se o usuário já possui sessão ativa
    const activeUser = authService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }

    return () => {
      window.removeEventListener('popstate', checkUrlRoute);
      window.removeEventListener('hashchange', checkUrlRoute);
    };
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!dbInitialized) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Se for visualização pública de proposta, renderiza ClientProposalView sem exigir login
  if (clientProposalId) {
    return (
      <ClientProposalView 
        proposalId={clientProposalId} 
        onBackToDashboard={user ? () => {
          // Limpa a URL hash ou busca
          window.location.hash = '';
          if (window.location.search) {
            window.history.pushState(null, '', window.location.pathname);
          }
          if (window.location.pathname.includes('/proposta/')) {
            window.history.pushState(null, '', '/');
          }
          setClientProposalId(null);
        } : null}
      />
    );
  }

  // Se o usuário não estiver logado, exibe apenas a tela de login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Renderização condicional das visões com base na rota do estado
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'campaigns':
        return <Campaigns />;
      case 'services':
        return <Services />;
      case 'proposals':
        return <Proposals />;
      case 'settings':
        return <Settings />;
      case 'chat':
        return <Chat />;
      case 'knowledge':
        return <Knowledge />;
      case 'agenda':
        return <Agenda />;
      case 'automations':
        return <Automations />;
      case 'users':
        return <Users />;
      case 'reports':
        return <Reports />;
      case 'opportunities':
        return <Opportunities />;
      case 'products':
        return <Products />;
      default:
        return <PlaceholderView viewId={currentView} />;
    }
  };

  return (
    <MainLayout 
      currentView={currentView} 
      onViewChange={setCurrentView} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderView()}
    </MainLayout>
  );
}

export default App;
