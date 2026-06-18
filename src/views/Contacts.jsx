import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, Edit, AlertCircle, Check, 
  Upload, FileSpreadsheet, ArrowRight, Download, CheckCircle, 
  ChevronRight, X, MessageCircle, FileText, Send, Calendar, ShieldCheck
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [search, setSearch] = useState('');
  
  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  
  // Available filter options (computed dynamically)
  const [cities, setCities] = useState([]);
  const [segments, setSegments] = useState([]);
  const [tagsList, setTagsList] = useState([]);

  // Modals / Drawers state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null); // Contact for Details Drawer

  // New Contact Form State
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

  // CSV Import Workflow State
  const [importStep, setImportStep] = useState(1); // 1 = Upload, 2 = Mapear, 3 = Preview, 4 = Concluído
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [mappings, setMappings] = useState({});
  const [validatedContacts, setValidatedContacts] = useState([]);
  const [importSummary, setImportSummary] = useState({ imported: 0, updated: 0, failed: 0 });

  const systemFields = [
    { key: 'firstName', label: 'Nome *' },
    { key: 'lastName', label: 'Sobrenome' },
    { key: 'company', label: 'Empresa' },
    { key: 'role', label: 'Cargo' },
    { key: 'phone', label: 'Telefone/WhatsApp *' },
    { key: 'email', label: 'E-mail' },
    { key: 'city', label: 'Cidade' },
    { key: 'state', label: 'Estado' },
    { key: 'segment', label: 'Segmento' },
    { key: 'serviceOfInterest', label: 'Serviço de Interesse' },
    { key: 'tags', label: 'Tags' }
  ];

  useEffect(() => {
    loadContactsData();
  }, []);

  const loadContactsData = () => {
    const list = dbService.getContacts();
    setContacts(list);
    setProposals(dbService.getProposals());

    // Compute dynamic filter values
    const uniqueCities = [...new Set(list.map(c => c.city).filter(Boolean))];
    const uniqueSegments = [...new Set(list.map(c => c.segment).filter(Boolean))];
    const allTags = list.reduce((acc, c) => [...acc, ...(c.tags || [])], []);
    const uniqueTags = [...new Set(allTags.filter(Boolean))];

    setCities(uniqueCities);
    setSegments(uniqueSegments);
    setTagsList(uniqueTags);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!firstName || !phone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    const cleanPhone = validateAndFormatPhone(phone);
    if (cleanPhone.status === 'invalid') {
      alert('Número de telefone inválido.');
      return;
    }

    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const newContact = {
      firstName,
      lastName,
      company: company || 'Independente',
      role,
      phone: cleanPhone.formatted,
      email,
      city,
      state: state.toUpperCase(),
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
    loadContactsData();
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
      loadContactsData();
      if (selectedContact?.id === id) setSelectedContact(null);
    }
  };

  // --------------------------------------------------------------------------
  // PARSER E IMPORTAÇÃO DE PLANILHAS (CSV)
  // --------------------------------------------------------------------------

  // Função simples para analisar linhas de CSV respeitando delimitadores e aspas
  const parseCSVLine = (text, delimiter) => {
    const result = [];
    let insideQuote = false;
    let entries = [];
    let entry = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === delimiter && !insideQuote) {
        entries.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    entries.push(entry.trim());
    return entries;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      if (lines.length < 2) {
        alert('O arquivo selecionado está vazio ou não possui linhas de dados.');
        return;
      }

      // Detecção automática de delimitador (, ou ;)
      const firstLine = lines[0];
      const commas = (firstLine.match(/,/g) || []).length;
      const semicolons = (firstLine.match(/;/g) || []).length;
      const delimiter = semicolons > commas ? ';' : ',';

      const headers = parseCSVLine(firstLine, delimiter);
      const rows = lines.slice(1).map(line => parseCSVLine(line, delimiter));

      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto mapeamento sugerido de colunas
      const initialMappings = {};
      systemFields.forEach(field => {
        const matchingIndex = headers.findIndex(header => {
          const normalizedHeader = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const normalizedLabel = field.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return normalizedHeader.includes(field.key.toLowerCase()) || 
                 normalizedHeader.includes(normalizedLabel.split(' ')[0]);
        });
        if (matchingIndex >= 0) {
          initialMappings[field.key] = matchingIndex;
        }
      });

      setMappings(initialMappings);
      setImportStep(2);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleMappingChange = (fieldKey, columnIndex) => {
    setMappings(prev => ({
      ...prev,
      [fieldKey]: columnIndex === '' ? undefined : Number(columnIndex)
    }));
  };

  // Validação e padronização comercial do telefone
  const validateAndFormatPhone = (rawPhone) => {
    if (!rawPhone) return { status: 'invalid', formatted: '' };
    
    // Remove tudo que não for número
    let digits = rawPhone.replace(/\D/g, '');

    // Se começar com 0, remove o zero inicial (comum no Brasil antes do DDD)
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // Se tiver 8 ou 9 dígitos (sem DDD), marca como incompleto
    if (digits.length === 8 || digits.length === 9) {
      return { status: 'warning', formatted: digits, errorMsg: 'Sem DDD' };
    }

    // Formato padrão brasileiro com DDI (+55)
    if (digits.length === 10 || digits.length === 11) {
      return { status: 'valid', formatted: `+55${digits}` };
    }

    // Se já tiver DDI +55 (12 ou 13 dígitos)
    if (digits.length === 12 || digits.length === 13) {
      if (digits.startsWith('55')) {
        return { status: 'valid', formatted: `+${digits}` };
      }
    }

    return { status: 'invalid', formatted: rawPhone, errorMsg: 'Número inválido' };
  };

  const handleConfirmMapping = () => {
    // Validar se mapeou campos obrigatórios (Nome e Telefone)
    if (mappings['firstName'] === undefined) {
      alert('Por favor, mapeie a coluna correspondente ao campo "Nome".');
      return;
    }
    if (mappings['phone'] === undefined) {
      alert('Por favor, mapeie a coluna correspondente ao campo "Telefone".');
      return;
    }

    const validatedList = csvRows.map((row, idx) => {
      const firstNameVal = row[mappings['firstName']] || '';
      const lastNameVal = row[mappings['lastName']] || '';
      const companyVal = row[mappings['company']] || 'Importado';
      const roleVal = row[mappings['role']] || '';
      const phoneVal = row[mappings['phone']] || '';
      const emailVal = row[mappings['email']] || '';
      const cityVal = row[mappings['city']] || '';
      const stateVal = row[mappings['state']] || '';
      const segmentVal = row[mappings['segment']] || '';
      const serviceVal = row[mappings['serviceOfInterest']] || '';
      const tagsVal = row[mappings['tags']] || '';

      const phoneCheck = validateAndFormatPhone(phoneVal);
      const isDuplicate = contacts.some(c => c.phone === phoneCheck.formatted || (emailVal && c.email === emailVal));

      const tagsArray = tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(Boolean) : [];

      let errorMsg = '';
      let status = 'valid';

      if (!firstNameVal) {
        status = 'invalid';
        errorMsg = 'Nome ausente';
      } else if (phoneCheck.status === 'invalid') {
        status = 'invalid';
        errorMsg = 'Telefone inválido';
      } else if (phoneCheck.status === 'warning') {
        status = 'warning';
        errorMsg = 'Aviso: Sem DDD';
      }

      return {
        id: `row_${idx}`,
        firstName: firstNameVal,
        lastName: lastNameVal,
        company: companyVal,
        role: roleVal,
        phone: phoneCheck.formatted,
        email: emailVal,
        city: cityVal,
        state: stateVal.toUpperCase(),
        segment: segmentVal,
        serviceOfInterest: serviceVal,
        tags: tagsArray,
        status,
        errorMsg,
        isDuplicate
      };
    });

    setValidatedContacts(validatedList);
    setImportStep(3);
  };

  const handleProcessImport = () => {
    let imported = 0;
    let updated = 0;
    let failed = 0;

    const db = dbService.getDB();

    validatedContacts.forEach(parsed => {
      if (parsed.status === 'invalid') {
        failed++;
        return;
      }

      // Check if duplicate in original list
      const duplicateIndex = db.contacts.findIndex(c => c.phone === parsed.phone || (parsed.email && c.email === parsed.email));

      const contactData = {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        company: parsed.company,
        role: parsed.role,
        phone: parsed.phone,
        email: parsed.email,
        city: parsed.city,
        state: parsed.state,
        segment: parsed.segment,
        serviceOfInterest: parsed.serviceOfInterest,
        tags: [...new Set([...parsed.tags, 'Importado'])],
        consent: true
      };

      if (duplicateIndex >= 0) {
        // Atualiza contatos existentes (sobrescrevendo campos)
        db.contacts[duplicateIndex] = {
          ...db.contacts[duplicateIndex],
          ...contactData,
          lastContact: new Date().toISOString()
        };
        updated++;
      } else {
        // Cria novo contato
        const newContact = {
          id: 'ct_' + Date.now() + Math.random().toString(36).substr(2, 5),
          ...contactData,
          createdAt: new Date().toISOString(),
          status: 'Novo contato',
          leadScore: 30,
          classification: 'Lead frio',
          chatHistory: []
        };
        db.contacts.push(newContact);
        imported++;
      }
    });

    dbService.saveDB(db);
    setImportSummary({ imported, updated, failed });
    loadContactsData();
    setImportStep(4);
  };

  // --------------------------------------------------------------------------
  // FILTRAGEM AVANÇADA
  // --------------------------------------------------------------------------

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const searchMatch = fullName.includes(search.toLowerCase()) || 
                        contact.company.toLowerCase().includes(search.toLowerCase()) ||
                        contact.phone.includes(search);
    
    const statusMatch = statusFilter ? contact.status === statusFilter : true;
    const cityMatch = cityFilter ? contact.city === cityFilter : true;
    const segmentMatch = segmentFilter ? contact.segment === segmentFilter : true;
    const tagMatch = tagFilter ? contact.tags.includes(tagFilter) : true;

    return searchMatch && statusMatch && cityMatch && segmentMatch && tagMatch;
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

  // Relacionar propostas com o contato selecionado na lateral
  const getSelectedContactProposals = () => {
    if (!selectedContact) return [];
    return proposals.filter(p => p.contactId === selectedContact.id);
  };

  return (
    <div className="table-card glass-panel" style={{ position: 'relative' }}>
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Banco de Contatos</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gerencie a lista de leads comerciais, importações de base e prospecções.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Upload size={16} />
            <span>Importar CSV</span>
          </button>
          
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Novo Contato</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="table-filters" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        
        {/* Search */}
        <div className="search-bar" style={{ width: '220px', background: 'rgba(255,255,255,0.02)' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome, fone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
        </div>

        {/* Status */}
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <option value="">Status (Todos)</option>
          <option value="Novo contato">Novo contato</option>
          <option value="Em atendimento">Em atendimento</option>
          <option value="Em qualificação">Em qualificação</option>
          <option value="Qualificado">Qualificado</option>
          <option value="Proposta enviada">Proposta enviada</option>
          <option value="Venda realizada">Venda realizada</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>

        {/* Cidades */}
        <select 
          className="filter-select"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <option value="">Cidades (Todas)</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Segmentos */}
        <select 
          className="filter-select"
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <option value="">Segmentos (Todos)</option>
          {segments.map(seg => (
            <option key={seg} value={seg}>{seg}</option>
          ))}
        </select>

        {/* Tags */}
        <select 
          className="filter-select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <option value="">Tags (Todas)</option>
          {tagsList.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {/* Clear Filters button */}
        {(statusFilter || cityFilter || segmentFilter || tagFilter || search) && (
          <button 
            onClick={() => { setStatusFilter(''); setCityFilter(''); setSegmentFilter(''); setTagFilter(''); setSearch(''); }}
            style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* LIST TABLE */}
      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Contato</th>
              <th>Telefone</th>
              <th>Localização</th>
              <th>Segmento</th>
              <th>Scoring</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhum contato encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedContact(contact)}>
                  <td>
                    <div className="contact-name-cell">
                      <span style={{ fontWeight: 600 }}>{contact.firstName} {contact.lastName}</span>
                      <span className="contact-company">{contact.company}</span>
                    </div>
                  </td>
                  <td>{contact.phone}</td>
                  <td>{contact.city ? `${contact.city}/${contact.state}` : 'Não informado'}</td>
                  <td>{contact.segment || '-'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: contact.leadScore >= 75 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {contact.leadScore} pts
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="btn btn-danger" 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================================================
         DRAWER DE DETALHES DO CONTATO (DIREITA)
         ========================================================================== */}
      {selectedContact && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '450px', height: '100vh', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 700 }}>
                {selectedContact.firstName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedContact.firstName} {selectedContact.lastName}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedContact.company}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedContact(null)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '50%', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Lead Scoring */}
            <div style={{ display: 'flex', justifyBetween: 'space-between', background: 'rgba(0, 210, 255, 0.03)', border: '1px solid rgba(0, 210, 255, 0.12)', padding: '14px', borderRadius: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>LEAD SCORING</p>
                <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginTop: '2px' }}>{selectedContact.leadScore} Pontos</h4>
              </div>
              <span className="badge badge-primary">{selectedContact.classification}</span>
            </div>

            {/* Info Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
              <div className="info-item">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>WhatsApp</label>
                <span style={{ fontWeight: 500 }}>{selectedContact.phone}</span>
              </div>
              <div className="info-item">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>E-mail</label>
                <span style={{ fontWeight: 500 }}>{selectedContact.email || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Cidade</label>
                <span style={{ fontWeight: 500 }}>{selectedContact.city || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Estado</label>
                <span style={{ fontWeight: 500 }}>{selectedContact.state || 'Não informado'}</span>
              </div>
              <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Serviço de Interesse</label>
                <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{selectedContact.serviceOfInterest || 'Não informado'}</span>
              </div>
            </div>

            {/* Histórico de Conversas (Preview timeline) */}
            <div>
              <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px', marginBottom: '12px' }}>
                <MessageCircle size={14} /> Histórico de Conversas (WhatsApp)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {selectedContact.chatHistory && selectedContact.chatHistory.length > 0 ? (
                  selectedContact.chatHistory.map((chat, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: chat.sender === 'client' ? 'rgba(0,210,255,0.03)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>{chat.sender === 'client' ? 'Cliente' : 'Agente Liporoni'}</span>
                        <span>{new Date(chat.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p style={{ lineHeight: 1.3 }}>{chat.message}</p>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', padding: '10px' }}>
                    Nenhuma conversa iniciada.
                  </span>
                )}
              </div>
            </div>

            {/* Histórico de Propostas */}
            <div>
              <span className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px', marginBottom: '12px' }}>
                <FileText size={14} /> Histórico de Propostas
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getSelectedContactProposals().length > 0 ? (
                  getSelectedContactProposals().map(prop => (
                    <div 
                      key={prop.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--glass-border)', 
                        padding: '10px 14px', 
                        borderRadius: '8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>Prop nº {prop.proposalNumber}</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>Emitida em {new Date(prop.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)', display: 'block' }}>R$ {prop.valueTotal.toLocaleString('pt-BR')}</span>
                        <span className={`badge ${
                          prop.status === 'Aceita' ? 'badge-success' : 
                          prop.status === 'Recusada' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: '0.6rem', padding: '1px 6px', marginTop: '4px' }}>
                          {prop.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block', padding: '10px' }}>
                    Nenhuma proposta emitida para este lead.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL DE IMPORTAÇÃO PASSO A PASSO (CSV)
         ========================================================================== */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '750px', width: '100%' }}>
            
            {/* Modal Header */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet className="glow-text-blue" size={20} />
                  <span>Importar Contatos via Planilha (CSV)</span>
                </h3>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); setImportStep(1); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper indicator */}
            <div style={{ display: 'flex', gap: '10px', margin: '20px 0', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px', fontSize: '0.75rem' }}>
              <span style={{ color: importStep >= 1 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: importStep === 1 ? 700 : 500 }}>1. Upload</span>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: importStep >= 2 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: importStep === 2 ? 700 : 500 }}>2. Mapeamento</span>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: importStep >= 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: importStep === 3 ? 700 : 500 }}>3. Validação</span>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: importStep === 4 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: importStep === 4 ? 700 : 500 }}>4. Concluído</span>
            </div>

            {/* Step 1: Upload */}
            {importStep === 1 && (
              <div className="modal-body" style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ border: '2px dashed var(--glass-border)', padding: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', cursor: 'pointer', position: 'relative' }}>
                  <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>Arraste seu arquivo CSV ou clique para selecionar</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Formatos suportados: .csv (codificação UTF-8 recomendado)</p>
                  
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                  <Download size={14} />
                  <a href="/modelo_contatos.csv" download style={{ textDecoration: 'underline', fontWeight: 500 }}>
                    Baixar planilha modelo (modelo_contatos.csv)
                  </a>
                </div>
              </div>
            )}

            {/* Step 2: Mapping columns */}
            {importStep === 2 && (
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Relacione as colunas da sua planilha com os campos equivalentes do Liporoni.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {systemFields.map(field => (
                    <div key={field.key} style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{field.label}</span>
                      <select 
                        className="filter-select"
                        style={{ width: '180px', padding: '6px', fontSize: '0.75rem' }}
                        value={mappings[field.key] !== undefined ? mappings[field.key] : ''}
                        onChange={e => handleMappingChange(field.key, e.target.value)}
                      >
                        <option value="">Ignorar Campo</option>
                        {csvHeaders.map((header, idx) => (
                          <option key={idx} value={idx}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setImportStep(1)}>Voltar</button>
                  <button type="button" className="btn btn-primary" onClick={handleConfirmMapping}>
                    Validar Registros <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview and Validate */}
            {importStep === 3 && (
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', justifyContent: 'space-between' }}>
                  <span>Verifique as informações antes de importar. Erros em vermelho serão ignorados.</span>
                  <span><strong>Total:</strong> {validatedContacts.length} contatos encontrados</span>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                  <table className="contacts-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Telefone</th>
                        <th>Cidade/Segmento</th>
                        <th>Validação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validatedContacts.map(c => (
                        <tr key={c.id}>
                          <td>{c.firstName} {c.lastName}</td>
                          <td style={{ color: c.status === 'invalid' && c.errorMsg === 'Telefone inválido' ? 'var(--danger)' : 'inherit' }}>
                            {c.phone}
                          </td>
                          <td>{c.city || '-'}/{c.segment || '-'}</td>
                          <td>
                            {c.status === 'valid' && (
                              <span style={{ color: 'var(--success)' }}>
                                {c.isDuplicate ? '✓ Atualizará existente' : '✓ Válido'}
                              </span>
                            )}
                            {c.status === 'warning' && <span style={{ color: 'var(--warning)' }}>⚠️ {c.errorMsg}</span>}
                            {c.status === 'invalid' && <span style={{ color: 'var(--danger)' }}>✗ {c.errorMsg}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setImportStep(2)}>Voltar</button>
                  <button type="button" className="btn btn-primary" onClick={handleProcessImport}>
                    Concluir Importação
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Complete Summary */}
            {importStep === 4 && (
              <div className="modal-body" style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Importação Concluída com Sucesso!</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0', width: '100%', maxWidth: '450px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Novos</span>
                    <h4 style={{ fontSize: '1.4rem', color: 'var(--success)', marginTop: '4px' }}>{importSummary.imported}</h4>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Atualizados</span>
                    <h4 style={{ fontSize: '1.4rem', color: 'var(--info)', marginTop: '4px' }}>{importSummary.updated}</h4>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ignorados (Erro)</span>
                    <h4 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginTop: '4px' }}>{importSummary.failed}</h4>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ marginTop: '10px' }} 
                  onClick={() => { setShowImportModal(false); setImportStep(1); }}
                >
                  Fechar Importador
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL DE CADASTRO INDIVIDUAL (FUNDO)
         ========================================================================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Adicionar Novo Contato</h3>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Nome do serviço" value={serviceOfInterest} onChange={e => setServiceOfInterest(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Tags (separadas por vírgula)</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Vip, Retorno, Diretor" value={tags} onChange={e => setTags(e.target.value)} />
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
