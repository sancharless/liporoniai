import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Users, Megaphone, Coins, 
  Briefcase, FileText, Calendar, GitBranch, Database, 
  BarChart3, UserCheck, Settings, LogOut, Bell, Search, 
  ChevronLeft, ChevronRight, MessageCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { dbService } from '../services/db';

export default function MainLayout({ currentView, onViewChange, user, onLogout, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentActive, setAgentActive] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Carrega notificações do banco de dados
    setNotifications(dbService.getNotifications());
    
    // Simula novas notificações em background a cada 45 segundos
    const interval = setInterval(() => {
      const dbNotifs = dbService.getNotifications();
      setNotifications(dbNotifs);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Conversas', icon: MessageSquare, badge: 2 },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { id: 'opportunities', label: 'Oportunidades', icon: Coins },
    { id: 'services', label: 'Produtos e Serviços', icon: Briefcase },
    { id: 'proposals', label: 'Propostas', icon: FileText },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'automations', label: 'Automações', icon: GitBranch },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: Database },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: UserCheck, adminOnly: true },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const handleMarkAsRead = (id) => {
    dbService.markNotificationRead(id);
    setNotifications(dbService.getNotifications());
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gestor Comercial';
      case 'seller': return 'Vendedor';
      default: return 'Operador';
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className={`sidebar glass-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <MessageCircle className="logo-icon glow-pulse" size={28} />
            </div>
            {!sidebarCollapsed && (
              <span className="logo-text">
                Liporoni<span className="logo-accent">.ai</span>
              </span>
            )}
          </div>
          <button 
            className="collapse-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              // Verifica se o item é apenas para administradores e se o usuário atual é admin
              if (item.adminOnly && user?.role !== 'admin') return null;

              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon size={20} className="nav-icon" />
                    {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="nav-badge glow-text">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            {!sidebarCollapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{getRoleLabel(user?.role)}</span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sair do Sistema">
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-layout">
        {/* NAVBAR */}
        <header className="navbar glass-panel">
          <div className="navbar-left">
            <h1 className="page-title">
              {menuItems.find(item => item.id === currentView)?.label || 'Liporoni'}
            </h1>
          </div>

          <div className="navbar-right">
            {/* Liporoni Agent Status Switch */}
            <div className="agent-status-panel">
              <span className="status-label">Agente Liporoni:</span>
              <button 
                className={`status-toggle ${agentActive ? 'active' : 'paused'}`}
                onClick={() => setAgentActive(!agentActive)}
                title={agentActive ? "Pausar respostas automáticas do agente" : "Ativar respostas automáticas do agente"}
              >
                <span className="status-dot"></span>
                <span className="status-text">{agentActive ? 'Ativo' : 'Pausado'}</span>
              </button>
            </div>

            {/* Global Search */}
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Buscar contatos, propostas..." />
            </div>

            {/* Notification Bell */}
            <div className="notification-wrapper">
              <button 
                className={`notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown glass-panel">
                  <div className="dropdown-header">
                    <h3>Notificações</h3>
                    {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} novas</span>}
                  </div>
                  <div className="dropdown-body">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">Nenhuma notificação</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <div className="notification-item-icon">
                            {notif.type === 'scoring' && <ShieldCheck className="icon-success" size={18} />}
                            {notif.type === 'human_request' && <AlertTriangle className="icon-warning" size={18} />}
                            {notif.type === 'proposal_accepted' && <MessageCircle className="icon-info" size={18} />}
                          </div>
                          <div className="notification-item-content">
                            <h4 className="notif-title">{notif.title}</h4>
                            <p className="notif-msg">{notif.message}</p>
                            <span className="notif-time">
                              {new Date(notif.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          {!notif.read && <span className="unread-indicator"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
}
