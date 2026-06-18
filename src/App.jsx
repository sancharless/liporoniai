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
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Inicializar o banco de dados simulado no LocalStorage
    initializeDB();
    setDbInitialized(true);

    // Verificar se o usuário já possui sessão ativa
    const activeUser = authService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
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
      default:
        // opportunities, agenda, automations, reports, users
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
