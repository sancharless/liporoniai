import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, MessageCircle, Users, Megaphone, Coins, 
  Briefcase, FileText, Calendar, GitBranch, Database, 
  BarChart3, UserCheck, Settings, LogOut, Bell, Search, 
  ChevronLeft, ChevronRight, Crosshair, AlertTriangle, ShieldCheck, Package,
  Target, Layers, TrendingUp
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
    { section: 'Operações', items: [
      { id: 'dashboard',     label: 'Dashboard',          icon: LayoutDashboard },
      { id: 'chat',          label: 'Conversas',          icon: MessageSquare, badge: 2 },
      { id: 'contacts',      label: 'Contatos',           icon: Users },
    ]},
    { section: 'Comercial', items: [
      { id: 'products',      label: 'Catálogo TACT',      icon: Package },
      { id: 'opportunities', label: 'Oportunidades',      icon: Target },
      { id: 'proposals',     label: 'Propostas',          icon: FileText },
      { id: 'campaigns',     label: 'Campanhas',          icon: Megaphone },
      { id: 'services',      label: 'Linhas de Produto',  icon: Layers },
    ]},
    { section: 'Gestão', items: [
      { id: 'agenda',        label: 'Agenda',             icon: Calendar },
      { id: 'automations',   label: 'Automações',         icon: GitBranch },
      { id: 'knowledge',     label: 'Base de Conhecimento', icon: Database },
      { id: 'reports',       label: 'Relatórios',         icon: BarChart3 },
      { id: 'users',         label: 'Usuários',           icon: UserCheck, adminOnly: true },
      { id: 'settings',      label: 'Configurações',      icon: Settings },
    ]},
  ];

  // Flatten for lookup
  const allItems = menuItems.flatMap(s => s.items);

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
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <Crosshair className="logo-icon glow-pulse" size={26} />
            </div>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="logo-text">
                  TACT<span className="logo-accent"> IMPORT</span>
                </span>
                <span className="logo-subtitle">Gestão Comercial</span>
              </div>
            )}
          </div>
          <button 
            className="collapse-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((section) => (
              <React.Fragment key={section.section}>
                {!sidebarCollapsed && <span className="nav-section-label">{section.section}</span>}
                {section.items.map((item) => {
                  if (item.adminOnly && user?.role !== 'admin') return null;
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <li key={item.id}>
                      <button 
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => onViewChange(item.id)}
                        title={sidebarCollapsed ? item.label : ''}
                      >
                        <Icon size={19} className="nav-icon" />
                        {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        {!sidebarCollapsed && item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
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
              {allItems.find(item => item.id === currentView)?.label || 'TACT'}
            </h1>
          </div>

          <div className="navbar-right">
            {/* TACT Agent Status Switch */}
            <div className="agent-status-panel">
              <span className="status-label">Agente TACT:</span>
              <button 
                className={`status-toggle ${agentActive ? 'active' : 'paused'}`}
                onClick={() => setAgentActive(!agentActive)}
                title={agentActive ? "Pausar respostas automáticas" : "Ativar respostas automáticas"}
              >
                <span className="status-dot"></span>
                <span className="status-text">{agentActive ? 'Online' : 'Pausado'}</span>
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
