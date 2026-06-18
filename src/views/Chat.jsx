import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MessageCircle, AlertTriangle, ShieldCheck, 
  Check, User, UserCheck, ShieldAlert, FileText, Ban, 
  RefreshCw, CheckCircle, Clock
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isHumanControl, setIsHumanControl] = useState({}); // contactId -> boolean
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const list = dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0);
    setContacts(list);
    if (list.length > 0) {
      setSelectedContact(list[0]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact?.chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const newMessage = {
      sender: isHumanControl[selectedContact.id] ? 'human' : 'agent',
      message: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedContact = {
      ...selectedContact,
      chatHistory: [...selectedContact.chatHistory, newMessage],
      lastContact: new Date().toISOString()
    };

    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    
    // Atualizar a lista de contatos lateral
    setContacts(dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0));
    setInputText('');

    // Se estiver no controle do agente automático, simula uma resposta do cliente após 3 segundos
    if (!isHumanControl[selectedContact.id]) {
      setTimeout(() => {
        simulateClientResponse(updatedContact);
      }, 3000);
    }
  };

  const simulateClientResponse = (contact) => {
    const responses = [
      "Interessante! Quanto custa essa licença mensal?",
      "Certo. Vocês oferecem suporte técnico por telefone ou apenas e-mail?",
      "Ok, vou precisar falar com o meu sócio sobre isso antes de decidir.",
      "Você poderia me mandar mais informações por e-mail?",
      "Sim, temos interesse. Podemos agendar uma demonstração rápida amanhã?"
    ];
    
    const randomMsg = responses[Math.floor(Math.random() * responses.length)];
    const clientMessage = {
      sender: 'client',
      message: randomMsg,
      timestamp: new Date().toISOString()
    };

    const updatedContact = {
      ...contact,
      chatHistory: [...contact.chatHistory, clientMessage],
      // Se o cliente responder, aumenta o score!
      leadScore: Math.min(contact.leadScore + 5, 100)
    };

    dbService.saveContact(updatedContact);
    
    // Atualiza se ainda for o contato ativo
    setSelectedContact(prev => {
      if (prev && prev.id === contact.id) {
        return updatedContact;
      }
      return prev;
    });

    setContacts(dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0));
  };

  const toggleControl = (contactId) => {
    setIsHumanControl(prev => ({
      ...prev,
      [contactId]: !prev[contactId]
    }));
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedContact) return;
    const updated = { ...selectedContact, status: newStatus };
    dbService.saveContact(updated);
    setSelectedContact(updated);
    setContacts(dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0));
  };

  const handleBlockContact = () => {
    if (!selectedContact) return;
    if (window.confirm(`Deseja realmente bloquear ${selectedContact.firstName}? Ele não receberá mais mensagens automáticas.`)) {
      const updated = { 
        ...selectedContact, 
        status: 'Bloqueado',
        consent: false,
        blockReason: 'Bloqueado manualmente pela central de conversas.'
      };
      dbService.saveContact(updated);
      setSelectedContact(updated);
      setContacts(dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0));
    }
  };

  const handleGenerateProposal = () => {
    if (!selectedContact) return;
    
    // Gerar uma proposta simulada
    const currentProposals = dbService.getProposals();
    const nextNum = currentProposals.length + 1;
    const propNumber = `2026-000${nextNum}`;
    
    const newProposal = {
      proposalNumber: propNumber,
      contactId: selectedContact.id,
      serviceId: 'srv_1',
      clientCompany: selectedContact.company,
      clientContactName: `${selectedContact.firstName} ${selectedContact.lastName}`,
      introduction: `Proposta de Consultoria de IA Comercial gerada automaticamente para a ${selectedContact.company}.`,
      problemIdentified: `Necessidade de automatização identificada para o setor de ${selectedContact.segment}.`,
      solutionRecommended: 'Implantação do Agente Comercial Inteligente Liporoni.',
      scopeOfServices: 'Mapeamento comercial, treinamento da IA, integração inicial e suporte.',
      valueTotal: 5000.00,
      discount: 0.00,
      taxes: 0.00,
      paymentTerms: 'Parcelado em até 2x no boleto.',
      deliveryTerm: '10 dias úteis.',
      status: 'Enviada',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 0,
      lastViewedAt: null,
      acceptedAt: null,
      refusedAt: null,
      refuseReason: null
    };

    dbService.saveProposal(newProposal);

    // Mandar aviso no chat
    const alertMsg = {
      sender: 'agent',
      message: `📄 Proposta Comercial *nº ${propNumber}* gerada com sucesso! Valor: R$ 5.000,00. Clique no link para visualizar e dar seu aceite: http://liporoni.ai/proposta/${propNumber}`,
      timestamp: new Date().toISOString()
    };

    const updatedContact = {
      ...selectedContact,
      status: 'Proposta enviada',
      chatHistory: [...selectedContact.chatHistory, alertMsg],
      leadScore: 90
    };

    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    setContacts(dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0));

    alert(`Proposta nº ${propNumber} gerada e enviada via chat com sucesso!`);
  };

  return (
    <div className="chat-inbox-container">
      {/* LEFT SIDEBAR: ACTIVE CHATS */}
      <div className="chat-sidebar-left glass-panel" style={{ borderRight: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="chat-search">
          <div className="search-bar" style={{ width: '100%' }}>
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Pesquisar conversas..." />
          </div>
        </div>
        <div className="chat-list">
          {contacts.map(contact => {
            const lastMsg = contact.chatHistory[contact.chatHistory.length - 1];
            const isSelected = selectedContact?.id === contact.id;

            return (
              <div 
                key={contact.id} 
                className={`chat-list-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectContact(contact)}
              >
                <div className="chat-item-avatar">
                  {contact.firstName[0]}
                </div>
                <div className="chat-item-details">
                  <div className="chat-item-header">
                    <span className="chat-item-name">{contact.firstName} {contact.lastName}</span>
                    <span className="chat-item-time">
                      {new Date(contact.lastContact || contact.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <span className="chat-item-company">{contact.company}</span>
                  <span className="chat-item-msg">{lastMsg ? lastMsg.message : 'Nenhuma mensagem'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER AREA: ACTIVE CHAT SCREEN */}
      <div className="chat-main-area glass-panel">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="chat-main-header">
              <div className="chat-header-userinfo">
                <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className={`status-dot ${isHumanControl[selectedContact.id] ? 'paused' : 'active'}`} style={{ width: '6px', height: '6px' }}></span>
                  <span style={{ fontSize: '0.7rem' }}>
                    {isHumanControl[selectedContact.id] ? 'Controle Humano (Manual)' : 'Atendimento Liporoni (Automático)'}
                  </span>
                </div>
              </div>

              <div className="chat-header-actions">
                <button 
                  className={`btn ${isHumanControl[selectedContact.id] ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 12px', fontSize: '0.75rem' }}
                  onClick={() => toggleControl(selectedContact.id)}
                >
                  {isHumanControl[selectedContact.id] ? 'Devolver ao Liporoni' : 'Assumir Conversa'}
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="chat-messages-container">
              {selectedContact.chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`message-bubble ${
                    msg.sender === 'client' ? 'client' : 'agent'
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="message-timestamp">
                    {msg.sender === 'human' && <span style={{ color: 'var(--warning)', marginRight: '6px', fontWeight: 600 }}>(Vendedor)</span>}
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                className="chat-input-field" 
                placeholder={isHumanControl[selectedContact.id] ? "Escreva uma resposta humana..." : "Escreva uma mensagem de teste (Liporoni responderá se automático)..."}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <MessageCircle size={48} style={{ marginBottom: '16px' }} />
            <p>Selecione um contato para visualizar a conversa</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: LEAD INFORMATION */}
      <div className="chat-sidebar-right glass-panel">
        {selectedContact ? (
          <>
            {/* Score */}
            <div className="lead-score-widget">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LEAD SCORING</span>
              <div className="score-circle">
                {selectedContact.leadScore}
              </div>
              <span className="badge badge-primary">{selectedContact.classification}</span>
            </div>

            {/* Actions */}
            <div>
              <span className="sidebar-section-title">Ações Comerciais</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                  onClick={handleGenerateProposal}
                  disabled={selectedContact.status === 'Bloqueado'}
                >
                  <FileText size={16} />
                  <span>Gerar Proposta Comercial</span>
                </button>

                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                  onClick={handleBlockContact}
                  disabled={selectedContact.status === 'Bloqueado'}
                >
                  <Ban size={16} />
                  <span>Bloquear Contato</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div>
              <span className="sidebar-section-title">Dados do Contato</span>
              <div className="info-item">
                <label>Status Funil</label>
                <select 
                  className="filter-select" 
                  style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                  value={selectedContact.status}
                  onChange={e => handleStatusChange(e.target.value)}
                >
                  <option value="Novo contato">Novo contato</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Em qualificação">Em qualificação</option>
                  <option value="Qualificado">Qualificado</option>
                  <option value="Proposta enviada">Proposta enviada</option>
                  <option value="Venda realizada">Venda realizada</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </div>
              <div className="info-item">
                <label>Empresa</label>
                <span>{selectedContact.company}</span>
              </div>
              <div className="info-item">
                <label>Cargo</label>
                <span>{selectedContact.role || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>WhatsApp</label>
                <span>{selectedContact.phone}</span>
              </div>
              <div className="info-item">
                <label>E-mail</label>
                <span>{selectedContact.email || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>Cidade/Estado</label>
                <span>{selectedContact.city}/{selectedContact.state}</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Nenhum contato selecionado
          </div>
        )}
      </div>
    </div>
  );
}
