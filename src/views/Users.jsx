import React, { useState, useEffect } from 'react';
import { dbService, logAuditEvent, getDB } from '../services/db';
import {
  Users, Shield, ClipboardList, Plus, X, Check,
  UserCheck, UserX, Edit3, Lock, Globe,
  Activity, Search, Filter
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const ROLE_LABELS = { admin: 'Administrador', manager: 'Gestor Comercial', seller: 'Vendedor' };
const ROLE_COLORS = { admin: 'var(--danger)', manager: 'var(--warning)', seller: 'var(--primary)' };
const ROLE_BG    = { admin: 'rgba(255,51,102,0.12)', manager: 'rgba(255,187,0,0.12)', seller: 'rgba(0,210,255,0.12)' };

const MODULE_PERMISSIONS = [
  { module: 'Dashboard', admin: true, manager: true, seller: true },
  { module: 'Contatos', admin: true, manager: true, seller: true },
  { module: 'Chat/Inbox', admin: true, manager: true, seller: true },
  { module: 'Campanhas', admin: true, manager: true, seller: false },
  { module: 'Propostas', admin: true, manager: true, seller: true },
  { module: 'Calculadora', admin: true, manager: true, seller: true },
  { module: 'Agenda', admin: true, manager: true, seller: true },
  { module: 'Automações', admin: true, manager: true, seller: false },
  { module: 'Relatórios', admin: true, manager: true, seller: false },
  { module: 'Usuários', admin: true, manager: false, seller: false },
];

const MODULE_EDIT_PERMISSIONS = [
  { module: 'Editar Margens/Preços', admin: true, manager: true, seller: false },
  { module: 'Excluir Contatos', admin: true, manager: true, seller: false },
  { module: 'Aprovar Propostas', admin: true, manager: true, seller: false },
  { module: 'Criar Usuários', admin: true, manager: false, seller: false },
  { module: 'Configurar Automações', admin: true, manager: false, seller: false },
  { module: 'Exportar Dados', admin: true, manager: true, seller: false },
];

const MODULE_ICONS = { 'Logs de Auditoria': Lock, 'Exportar Dados': Globe };

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function emptyUser() {
  return { id: null, name: '', email: '', role: 'seller', active: true, company: 'Liporoni Comercial', password: '' };
}

/* ─── ACTION ICON color map ────────────────────────────── */
const ACTION_COLOR = {
  'Login': 'var(--success)',
  'Logout': 'var(--text-muted)',
  'Criar Contato': 'var(--primary)',
  'Editar Contato': 'var(--info)',
  'Gerar Proposta': 'var(--warning)',
  'Aprovar Rascunho': 'var(--success)',
  'Iniciar Campanha': 'var(--danger)',
  'Criar Usuário': 'var(--primary)',
};

/* ═══════════════════════════════════════════════════════ */
export default function UsersView() {
  const [tab, setTab] = useState('team');
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(emptyUser());
  const [search, setSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');

  const loadData = () => {
    const raw = getDB();
    setUsers(raw.users || []);
    setAuditLog(dbService.getAuditLog());
  };

  useEffect(() => { loadData(); }, []);

  /* ── User CRUD ─────────────────────────────────────────── */
  const handleSave = () => {
    if (!editUser.name.trim() || !editUser.email.trim()) return;
    dbService.saveUser({ ...editUser, avatar: editUser.avatar || '' });
    logAuditEvent({
      userId: 'usr_1', userName: 'Dr. Roberto Liporoni',
      action: editUser.id ? 'Editar Usuário' : 'Criar Usuário',
      module: 'Usuários',
      detail: `${editUser.id ? 'Dados de' : 'Novo usuário'} ${editUser.name} (${ROLE_LABELS[editUser.role]}) ${editUser.id ? 'atualizados' : 'criado'}.`
    });
    setShowModal(false);
    setEditUser(emptyUser());
    loadData();
  };

  const handleToggle = (id) => {
    dbService.toggleUserActive(id);
    loadData();
  };

  const handleEdit = (u) => {
    setEditUser({ ...u, password: '' });
    setShowModal(true);
  };

  const handleNew = () => {
    setEditUser(emptyUser());
    setShowModal(true);
  };

  /* ── filtered lists ─────────────────────────────────────── */
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLog = auditLog.filter(e =>
    logFilter === 'all' || e.module === logFilter
  );

  const logModules = ['all', ...Array.from(new Set(auditLog.map(e => e.module)))];

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeInUp 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255,51,102,0.12)', padding: '12px', borderRadius: '14px', color: 'var(--danger)' }}>
            <Shield size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Usuários & Permissões</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gerencie a equipe, papéis de acesso e auditoria de ações do sistema.</p>
          </div>
        </div>
        {tab === 'team' && (
          <button className="btn btn-primary" onClick={handleNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Novo Usuário
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0' }}>
        {[
          { key: 'team', label: 'Equipe', icon: Users },
          { key: 'permissions', label: 'Permissões', icon: Shield },
          { key: 'audit', label: 'Auditoria', icon: ClipboardList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              color: tab === key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.2s ease'
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: TEAM ─────────────────────────────────────────── */}
      {tab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar usuário…"
              style={{ width: '100%', paddingLeft: '36px', padding: '10px 12px 10px 36px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { label: 'Total', value: users.length, color: 'var(--primary)' },
              { label: 'Ativos', value: users.filter(u => u.active).length, color: 'var(--success)' },
              { label: 'Inativos', value: users.filter(u => !u.active).length, color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label} className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Users list */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {['Usuário', 'Papel', 'E-mail', 'Desde', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: u.active ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {u.avatar
                          ? <img src={u.avatar} alt={u.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ROLE_COLORS[u.role]}` }} />
                          : <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: ROLE_BG[u.role], color: ROLE_COLORS[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', border: `2px solid ${ROLE_COLORS[u.role]}` }}>{initials(u.name)}</div>
                        }
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.company}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: ROLE_BG[u.role], color: ROLE_COLORS[u.role], padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${ROLE_COLORS[u.role]}44` }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, color: u.active ? 'var(--success)' : 'var(--danger)' }}>
                        {u.active ? <Check size={13} /> : <X size={13} />} {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(u)} title="Editar" style={{ background: 'rgba(0,210,255,0.1)', border: 'none', color: 'var(--primary)', borderRadius: '7px', padding: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleToggle(u.id)} title={u.active ? 'Desativar' : 'Ativar'}
                          style={{ background: u.active ? 'rgba(255,51,102,0.1)' : 'rgba(0,255,136,0.1)', border: 'none', color: u.active ? 'var(--danger)' : 'var(--success)', borderRadius: '7px', padding: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                          {u.active ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: PERMISSIONS ──────────────────────────────────── */}
      {tab === 'permissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>Acesso por Módulo</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>Módulo</th>
                  {['Administrador', 'Gestor Comercial', 'Vendedor'].map(r => (
                    <th key={r} style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULE_PERMISSIONS.map((row, idx) => (
                  <tr key={row.module} style={{ borderBottom: idx < MODULE_PERMISSIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '0.85rem', fontWeight: 500 }}>{row.module}</td>
                    {['admin', 'manager', 'seller'].map(role => (
                      <td key={role} style={{ padding: '11px 16px', textAlign: 'center' }}>
                        {row[role]
                          ? <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.1)', borderRadius: '50%', width: '24px', height: '24px' }}><Check size={13} /></span>
                          : <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,51,102,0.08)', borderRadius: '50%', width: '24px', height: '24px' }}><X size={13} /></span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--warning)' }}>Ações Privilegiadas</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>Ação</th>
                  {['Administrador', 'Gestor Comercial', 'Vendedor'].map(r => (
                    <th key={r} style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULE_EDIT_PERMISSIONS.map((row, idx) => (
                  <tr key={row.module} style={{ borderBottom: idx < MODULE_EDIT_PERMISSIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '11px 16px', fontSize: '0.85rem', fontWeight: 500 }}>{row.module}</td>
                    {['admin', 'manager', 'seller'].map(role => (
                      <td key={role} style={{ padding: '11px 16px', textAlign: 'center' }}>
                        {row[role]
                          ? <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.1)', borderRadius: '50%', width: '24px', height: '24px' }}><Check size={13} /></span>
                          : <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,51,102,0.08)', borderRadius: '50%', width: '24px', height: '24px' }}><X size={13} /></span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: AUDIT ─────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Módulo:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {logModules.map(m => (
                <button key={m} onClick={() => setLogFilter(m)}
                  style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: logFilter === m ? 'var(--primary)' : 'transparent',
                    borderColor: logFilter === m ? 'var(--primary)' : 'var(--glass-border)',
                    color: logFilter === m ? '#000' : 'var(--text-muted)'
                  }}>
                  {m === 'all' ? 'Todos' : m}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {['Usuário', 'Ação', 'Módulo', 'Detalhe', 'Data/Hora'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((e, idx) => (
                  <tr key={e.id} style={{ borderBottom: idx < filteredLog.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,210,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                          {initials(e.userName)}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{e.userName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ color: ACTION_COLOR[e.action] || 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Activity size={12} /> {e.action}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {e.module}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '260px' }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {e.detail}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(e.timestamp)}
                    </td>
                  </tr>
                ))}
                {filteredLog.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum evento registrado neste módulo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: Create/Edit User ────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', animation: 'fadeInUp 0.2s ease' }}>
          <div className="glass-panel" style={{ width: '440px', padding: '28px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
              {editUser.id ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Nome Completo', key: 'name', type: 'text', placeholder: 'Ex: João da Silva' },
                { label: 'E-mail', key: 'email', type: 'email', placeholder: 'joao@liporoni.com.br' },
                { label: 'Senha Temporária', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Empresa', key: 'company', type: 'text', placeholder: 'Liporoni Comercial' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={editUser[f.key] || ''}
                    onChange={e => setEditUser(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Papel</label>
                <select
                  value={editUser.role}
                  onChange={e => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gestor Comercial</option>
                  <option value="seller">Vendedor</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editUser.id ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
