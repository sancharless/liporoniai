import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MessageCircle, AlertTriangle, ShieldCheck, 
  Check, User, UserCheck, ShieldAlert, FileText, Ban, 
  RefreshCw, CheckCircle, Clock, Terminal, SlidersHorizontal, ArrowLeftRight
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isHumanControl, setIsHumanControl] = useState({}); // contactId -> boolean
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, waiting, auto, human, hot, proposals, blocked
  
  // Real-time WhatsApp simulation states
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [showWebhookConsole, setShowWebhookConsole] = useState(true);

  const messagesEndRef = useRef(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
    
    // Add initial mock webhook logs for visual wow
    setWebhookLogs([
      {
        id: 'log_0',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        direction: 'RECEIVED',
        event: 'webhook.received',
        payload: {
          object: 'whatsapp_business_account',
          entry: [{
            id: 'wa_acc_10923',
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                messages: [{ from: '5511998877665', text: { body: 'Temos 5 vendedores dedicados a isso.' } }]
              }
            }]
          }]
        }
      },
      {
        id: 'log_01',
        timestamp: new Date(Date.now() - 150000).toISOString(),
        direction: 'SENT',
        event: 'messages.sent_success',
        payload: {
          messaging_product: 'whatsapp',
          contacts: [{ input: '5511998877665', wa_id: '5511998877665' }],
          messages: [{ id: 'wamid.HBgMNTUxMTk5ODg3NzY2NRAJEg' }]
        }
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact?.chatHistory, isClientTyping, isAgentTyping]);

  const loadChats = () => {
    const list = dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0);
    
    // Add simulated 'unread' tag to contact Carlos Gomes to simulate unread filter
    const updatedList = list.map(c => {
      if (c.id === 'ct_3') return { ...c, unread: true };
      return c;
    });

    setContacts(updatedList);
    if (!selectedContact && updatedList.length > 0) {
      setSelectedContact(updatedList[0]);
    } else if (selectedContact) {
      // Refresh current selected contact
      const refreshed = updatedList.find(c => c.id === selectedContact.id);
      if (refreshed) setSelectedContact(refreshed);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Log Webhook calls in real-time
  const logWebhook = (direction, event, payload) => {
    const newLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      direction,
      event,
      payload
    };
    setWebhookLogs(prev => [newLog, ...prev].slice(0, 10)); // keep last 10
  };

  const handleSelectContact = (contact) => {
    // Clear unread mark
    if (contact.unread) {
      contact.unread = false;
    }
    setSelectedContact(contact);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const typedText = inputText.trim();
    const isHuman = !!isHumanControl[selectedContact.id];

    // 1. Log sent message webhook payload
    logWebhook('SENT', 'api.send_message', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: selectedContact.phone,
      type: 'text',
      text: { body: typedText }
    });

    // 2. Add message to local chat history
    const newMessage = {
      sender: isHuman ? 'human' : 'agent',
      message: typedText,
      timestamp: new Date().toISOString()
    };

    const updatedContact = {
      ...selectedContact,
      chatHistory: [...selectedContact.chatHistory, newMessage],
      lastContact: new Date().toISOString(),
      // Last message is from us, so waiting answer is false
      waitingResponse: false
    };

    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    loadChats();
    setInputText('');

    // 3. Keyword analysis simulation when in AUTOMATIC mode
    if (!isHuman) {
      setIsAgentTyping(true);
      setTimeout(() => {
        setIsAgentTyping(false);
        handleAutomaticResponse(updatedContact, typedText);
      }, 1500);
    } else {
      // In Human mode: Client responds dynamically after 3 seconds to human prompt
      setIsClientTyping(true);
      setTimeout(() => {
        setIsClientTyping(false);
        simulateClientResponse(updatedContact, typedText);
      }, 3000);
    }
  };

  // Robot AI automatic replies matching guidelines
  const handleAutomaticResponse = (contact, userText) => {
    const textLower = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let reply = '';
    let updateScore = 0;
    let statusChange = null;

    if (textLower.includes('parar') || textLower.includes('remover') || textLower.includes('sair') || textLower.includes('nao quero')) {
      reply = "Compreendo perfeitamente. Seu contato foi removido de nossa lista ativa e novas prospecções comerciais foram bloqueadas. Tenha uma boa semana.";
      statusChange = 'Bloqueado';
      updateScore = -contact.leadScore; // reset score
      logWebhook('RECEIVED', 'webhook.opt_out', { phone: contact.phone, trigger: 'opt-out keyword' });
    } else if (textLower.includes('preco') || textLower.includes('quanto') || textLower.includes('custo') || textLower.includes('valor')) {
      reply = "Nossos serviços de automação custam a partir de R$ 349/mês para o plano SaaS, e R$ 5.000 para consultorias corporativas sob medida. Qual o tamanho da operação comercial da sua empresa hoje?";
      updateScore = 10;
      logWebhook('RECEIVED', 'webhook.intent_identified', { intent: 'price_inquiry', confidence: 0.94 });
    } else if (textLower.includes('proposta') || textLower.includes('orcamento')) {
      reply = "Perfeito! Posso gerar a proposta comercial customizada imediatamente. Você confirma que o e-mail cadastrado " + (contact.email || "") + " é o melhor para envio oficial?";
      updateScore = 15;
      logWebhook('RECEIVED', 'webhook.intent_identified', { intent: 'proposal_request', confidence: 0.98 });
    } else {
      reply = "Obrigado pelas informações! O Liporoni está processando sua necessidade comercial. Qual seria o principal problema operacional que você gostaria de resolver hoje na " + contact.company + "?";
      updateScore = 5;
    }

    const agentMessage = {
      sender: 'agent',
      message: reply,
      timestamp: new Date().toISOString()
    };

    const finalContact = {
      ...contact,
      chatHistory: [...contact.chatHistory, agentMessage],
      leadScore: Math.min(Math.max(contact.leadScore + updateScore, 0), 100),
      classification: contact.leadScore + updateScore >= 75 ? 'Lead qualificado' : 'Lead morno'
    };

    if (statusChange) {
      finalContact.status = statusChange;
      finalContact.consent = false;
      finalContact.blockReason = 'Solicitou descadastro por palavra-chave.';
    }

    dbService.saveContact(finalContact);
    setSelectedContact(finalContact);
    loadChats();
  };

  // Simulator for Client responses in human mode
  const simulateClientResponse = (contact, lastSentMsg) => {
    // Webhook event received
    logWebhook('RECEIVED', 'webhook.message_received', {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'wa_acc_10923',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            messages: [{ from: contact.phone, text: { body: 'Interessante isso.' } }]
          }
        }]
      }]
    });

    const clientReplies = [
      "Perfeito, compreendi. Vocês oferecem suporte no horário comercial?",
      "Certo! E qual o prazo de implantação da consultoria?",
      "Entendi. Vou alinhar isso internamente com meu gerente financeiro e te aviso.",
      "Gostei. Pode enviar os termos e condições no meu e-mail, por favor?"
    ];

    const randomMsg = clientReplies[Math.floor(Math.random() * clientReplies.length)];

    const clientMessage = {
      sender: 'client',
      message: randomMsg,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...contact,
      chatHistory: [...contact.chatHistory, clientMessage],
      leadScore: Math.min(contact.leadScore + 5, 100),
      classification: contact.leadScore + 5 >= 75 ? 'Lead qualificado' : contact.classification
    };

    dbService.saveContact(updated);
    setSelectedContact(updated);
    loadChats();
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedContact) return;
    const updated = { ...selectedContact, status: newStatus };
    dbService.saveContact(updated);
    setSelectedContact(updated);
    loadChats();
  };

  const handleBlockContact = () => {
    if (!selectedContact) return;
    if (window.confirm(`Deseja bloquear o envio de mensagens para ${selectedContact.firstName}?`)) {
      const updated = { 
        ...selectedContact, 
        status: 'Bloqueado',
        consent: false,
        blockReason: 'Bloqueado manualmente no painel de atendimento.'
      };
      dbService.saveContact(updated);
      setSelectedContact(updated);
      loadChats();
    }
  };

  const handleGenerateProposal = () => {
    if (!selectedContact) return;
    
    const currentProposals = dbService.getProposals();
    const nextNum = currentProposals.length + 1;
    const propNumber = `2026-000${nextNum}`;
    
    const newProposal = {
      proposalNumber: propNumber,
      contactId: selectedContact.id,
      serviceId: 'srv_1',
      clientCompany: selectedContact.company,
      clientContactName: `${selectedContact.firstName} ${selectedContact.lastName}`,
      introduction: `Proposta de Consultoria de IA Comercial gerada para a ${selectedContact.company}.`,
      problemIdentified: `Necessidade comercial no segmento ${selectedContact.segment}.`,
      solutionRecommended: 'Implantação do agente comercial inteligente Liporoni.',
      scopeOfServices: 'Mapeamento de jornada comercial, treinamento da LLM, implantação das regras comerciais.',
      valueTotal: 5000.00,
      discount: 0.00,
      taxes: 0.00,
      paymentTerms: '50% sinal + 50% na aprovação.',
      deliveryTerm: '15 dias úteis.',
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

    // Send proposal link inside the chat feed
    const alertMsg = {
      sender: 'agent',
      message: `📄 Proposta Comercial *nº ${propNumber}* gerada automaticamente! Valor: R$ 5.000,00. Visualize online pelo link: http://liporoni.vercel.app/proposta/${propNumber}`,
      timestamp: new Date().toISOString()
    };

    const updatedContact = {
      ...selectedContact,
      status: 'Proposta enviada',
      chatHistory: [...selectedContact.chatHistory, alertMsg],
      leadScore: 90,
      classification: 'Oportunidade prioritária'
    };

    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    loadChats();

    // Log the API events
    logWebhook('SENT', 'api.proposal_sent', {
      proposalId: `prop_${Date.now()}`,
      number: propNumber,
      client: selectedContact.company
    });

    alert(`Proposta nº ${propNumber} gerada com sucesso! Link enviado na conversa.`);
  };

  // INBOX FILTERING LOGIC
  const filteredChats = contacts.filter(contact => {
    const lastMsg = contact.chatHistory[contact.chatHistory.length - 1];
    
    switch (activeFilter) {
      case 'unread':
        return !!contact.unread;
      case 'waiting':
        // Last message was from client
        return lastMsg && lastMsg.sender === 'client';
      case 'auto':
        return !isHumanControl[contact.id];
      case 'human':
        return !!isHumanControl[contact.id];
      case 'hot':
        return contact.leadScore >= 75;
      case 'proposals':
        return contact.status === 'Proposta enviada';
      case 'blocked':
        return contact.status === 'Bloqueado';
      default:
        return true;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      
      {/* CENTRAL CONVERSAS WRAPPER */}
      <div className="chat-inbox-container" style={{ flex: 1 }}>
        {/* LEFT PANEL: ACTIVE CHATS LIST */}
        <div className="chat-sidebar-left glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header Search */}
          <div className="chat-search" style={{ padding: '14px 14px 4px 14px' }}>
            <div className="search-bar" style={{ width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Pesquisar conversas..." style={{ fontSize: '0.8rem' }} />
            </div>
          </div>

          {/* Inbox Filter Tabs */}
          <div className="chat-filter-tabs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'unread', label: 'Não Lidas' },
              { id: 'waiting', label: 'Aguardando' },
              { id: 'auto', label: 'Filtro: IA' },
              { id: 'human', label: 'Humano' },
              { id: 'hot', label: 'Quentes' },
              { id: 'proposals', label: 'Propostas' },
              { id: 'blocked', label: 'Bloqueados' }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`chat-filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chats Feed List */}
          <div className="chat-list" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Nenhuma conversa nesta categoria.
              </div>
            ) : (
              filteredChats.map(contact => {
                const lastMsg = contact.chatHistory[contact.chatHistory.length - 1];
                const isSelected = selectedContact?.id === contact.id;

                return (
                  <div 
                    key={contact.id} 
                    className={`chat-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectContact(contact)}
                    style={{ position: 'relative' }}
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
                      <span className="chat-item-msg" style={{ 
                        fontWeight: contact.unread ? 'bold' : 'normal', 
                        color: contact.unread ? 'var(--text-primary)' : 'var(--text-muted)' 
                      }}>
                        {lastMsg ? lastMsg.message : 'Nenhuma conversa'}
                      </span>
                    </div>

                    {/* Indicators */}
                    {contact.unread && (
                      <span className="unread-indicator" style={{ top: '50%', transform: 'translateY(-50%)', right: '14px' }}></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER PANEL: INTERACTIVE CHAT SCREEN */}
        <div className="chat-main-area glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedContact ? (
            <>
              {/* Header Info */}
              <div className="chat-main-header">
                <div className="chat-header-userinfo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
                    <span className={`badge ${
                      selectedContact.status === 'Novo contato' ? 'badge-info' : 
                      selectedContact.status === 'Bloqueado' ? 'badge-danger' : 'badge-success'
                    }`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      {selectedContact.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span className={`status-dot ${isHumanControl[selectedContact.id] ? 'paused' : 'active'}`} style={{ width: '6px', height: '6px' }}></span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {isHumanControl[selectedContact.id] ? 'Atendimento Comercial Humano' : 'Atendimento Liporoni Comercial (IA)'}
                    </span>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <button 
                    className={`btn ${isHumanControl[selectedContact.id] ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                    onClick={() => toggleControl(selectedContact.id)}
                  >
                    <ArrowLeftRight size={14} />
                    <span>{isHumanControl[selectedContact.id] ? 'Devolver à IA' : 'Assumir Atendimento'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="chat-messages-container" style={{ flex: 1, overflowY: 'auto' }}>
                {selectedContact.chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`message-bubble ${msg.sender === 'client' ? 'client' : 'agent'}`}
                  >
                    <p>{msg.message}</p>
                    <span className="message-timestamp">
                      {msg.sender === 'human' && <span style={{ color: 'var(--warning)', marginRight: '6px', fontWeight: 600 }}>(Humano)</span>}
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}

                {/* Simulated Typing Indicator Bubbles */}
                {isClientTyping && (
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                )}
                {isAgentTyping && (
                  <div className="typing-indicator" style={{ background: 'rgba(0, 210, 255, 0.05)', borderColor: 'rgba(0, 210, 255, 0.15)' }}>
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }}></span>
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }}></span>
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }}></span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Control Area */}
              <form onSubmit={handleSendMessage} className="chat-input-area">
                <input 
                  type="text" 
                  className="chat-input-field" 
                  placeholder={
                    isHumanControl[selectedContact.id] 
                      ? "Envie uma resposta humana..." 
                      : "Envie um comando ou teste a IA (ex: 'Quero uma proposta' ou 'Parar')"
                  }
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
              <p>Selecione um contato para carregar o histórico do WhatsApp</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CONTACT DETAILS & SCORING */}
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

              {/* Quick actions */}
              <div>
                <span className="sidebar-section-title">Ações Operacionais</span>
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

              {/* Status funil update */}
              <div>
                <span className="sidebar-section-title">Dados e Status</span>
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
                  <label>WhatsApp</label>
                  <span>{selectedContact.phone}</span>
                </div>
                <div className="info-item">
                  <label>Cidade/Estado</label>
                  <span>{selectedContact.city}/{selectedContact.state}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Nenhum contato ativo
            </div>
          )}
        </div>
      </div>

      {/* WEBHOOK DEV LOGGER CONSOLE (BOTTOM TRAY) */}
      <div className="glass-panel" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '15px', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div 
          style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          onClick={() => setShowWebhookConsole(!showWebhookConsole)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} className="glow-text-blue" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Console de Webhooks (WhatsApp Business API - Logs em Tempo Real)</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {showWebhookConsole ? 'Recolher Terminal [-]' : 'Expandir Terminal [+]'}
          </span>
        </div>
        
        {showWebhookConsole && (
          <div className="webhook-logger-panel">
            {webhookLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aguardando eventos de disparo de WhatsApp...</div>
            ) : (
              webhookLogs.map(log => (
                <div key={log.id} className="webhook-log-line">
                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: log.direction === 'SENT' ? '#60a5fa' : '#34d399', fontWeight: 600 }}>
                      [{log.direction}] {log.event}
                    </span>
                    <span className="webhook-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#9ca3af', fontSize: '0.65rem', margin: '4px 0' }}>
                    {JSON.stringify(log.payload)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
