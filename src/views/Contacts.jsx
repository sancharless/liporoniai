import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit, AlertCircle, Check } from 'lucide-react';
import { dbService } from '../services/db';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [segment, setSegment] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState('');
  const [tags, setTags] = useState('');
  const [consent, setConsent] = useState(true);

  useEffect(() => {
    setContacts(dbService.getContacts());
  }, []);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!firstName || !phone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    const tagArray = tags ? tags.split(',').map(t => t.trim()) : [];

    const newContact = {
      firstName,
      lastName,
      company,
      role,
      phone,
      email,
      city,
      state,
      segment,
      serviceOfInterest,
      tags: tagArray,
      consent,
      status: 'Novo contato',
      leadScore: 30,
      classification: 'Lead frio',
      chatHistory: []
    };

    dbService.saveContact(newContact);
    setContacts(dbService.getContacts());
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCompany('');
    setRole('');
    setPhone('');
    setEmail('');
    setCity('');
    setState('');
    setSegment('');
    setServiceOfInterest('');
    setTags('');
    setConsent(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      dbService.deleteContact(id);
      setContacts(dbService.getContacts());
    }
  };

  // Filtrar contatos
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const searchMatch = fullName.includes(search.toLowerCase()) || 
                        contact.company.toLowerCase().includes(search.toLowerCase()) ||
                        contact.phone.includes(search);
    const statusMatch = statusFilter ? contact.status === statusFilter : true;
    return searchMatch && statusMatch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Novo contato': return 'badge-info';
      case 'Em atendimento': return 'badge-primary';
      case 'Qualificado': return 'badge-success';
      case 'Bloqueado': return 'badge-danger';
      case 'Proposta enviada': return 'badge-warning';
      case 'Venda realizada': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Banco de Contatos</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gerencie, filtre e adicione contatos comerciais.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Novo Contato</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="table-filters">
        <div className="search-bar" style={{ width: '280px' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome, empresa..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="Novo contato">Novo contato</option>
          <option value="Em atendimento">Em atendimento</option>
          <option value="Em qualificação">Em qualificação</option>
          <option value="Qualificado">Qualificado</option>
          <option value="Proposta enviada">Proposta enviada</option>
          <option value="Venda realizada">Venda realizada</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
      </div>

      {/* CONTACTS TABLE */}
      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Contato / Empresa</th>
              <th>Telefone</th>
              <th>Segmento / Cidade</th>
              <th>Scoring</th>
              <th>Status</th>
              <th>Tags</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhum contato encontrado.
                </td>
              </tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.id}>
                  <td>
                    <div className="contact-name-cell">
                      <span style={{ fontWeight: 600 }}>{contact.firstName} {contact.lastName}</span>
                      <span className="contact-company">{contact.company} - {contact.role}</span>
                    </div>
                  </td>
                  <td>{contact.phone}</td>
                  <td>
                    <div className="contact-name-cell">
                      <span>{contact.segment}</span>
                      <span className="contact-company">{contact.city}/{contact.state}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: 700, 
                      color: contact.leadScore >= 70 ? 'var(--primary)' : 'var(--text-secondary)'
                    }}>
                      {contact.leadScore} pts
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td>
                    <div className="tag-list">
                      {contact.tags.map((tag, idx) => (
                        <span key={idx} className="tag-pill">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="btn btn-danger" 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="Deletar Contato"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Adicionar Novo Contato</h3>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Nome" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Sobrenome</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Empresa</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Nome da empresa" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Cargo" value={role} onChange={e => setRole(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>WhatsApp (com DDD) *</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="11999998888" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" className="form-control" style={{ paddingLeft: '14px' }} placeholder="email@empresa.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Estado (ex: SP)" value={state} onChange={e => setState(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Segmento</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Tecnologia, Indústria, etc." value={segment} onChange={e => setSegment(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Serviço de Interesse</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Nome do produto" value={serviceOfInterest} onChange={e => setServiceOfInterest(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Tags (separadas por vírgula)</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Lead, Vip, Retorno" value={tags} onChange={e => setTags(e.target.value)} />
                </div>
                <div className="form-group checkbox-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <input type="checkbox" id="consent" checked={consent} onChange={e => setConsent(e.target.checked)} />
                  <label htmlFor="consent">Este cliente autorizou o envio de comunicações comerciais.</label>
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
