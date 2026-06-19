import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MessageCircle, AlertTriangle, ShieldCheck, 
  Check, User, UserCheck, ShieldAlert, FileText, Ban, 
  RefreshCw, CheckCircle, Clock, Terminal, SlidersHorizontal, 
  ArrowLeftRight, Smartphone, X, Wifi, WifiOff, QrCode
} from 'lucide-react';
import { dbService } from '../services/db';

// ── QR Code SVG gerado proceduralmente (visual convincente) ──
function QRCodeSVG() {
  // Matriz 21x21 de módulos simulada (padrão fixo visual)
  const size = 21;
  const cell = 8;
  const padding = 4;

  // Semente para gerar padrão pseudo-aleatório consistente
  const seed = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0],
    [0,1,1,0,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1],
    [0,1,0,0,0,1,0,1,0,1,1,1,0,1,0,0,1,0,1,1,0],
    [1,1,1,0,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,0,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,1,0,1,0,0,0,1,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,0,1,1,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1],
  ];

  const totalSize = size * cell + padding * 2;

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width="176"
      height="176"
      style={{ display: 'block' }}
    >
      <rect width={totalSize} height={totalSize} fill="white" />
      {seed.map((row, r) =>
        row.map((val, c) =>
          val === 1 ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + padding}
              y={r * cell + padding}
              width={cell}
              height={cell}
              fill="#111"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ── Modal de Conexão WhatsApp ──
function WhatsAppConnectModal({ onClose, connectionStatus, onSimulateConnect, onDisconnect, connectedPhone }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone size={18} style={{ color: 'var(--primary)' }} />
            Conectar WhatsApp Remetente
          </h3>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ alignItems: 'center', gap: '20px' }}>

          {/* Status Banner */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: connectionStatus === 'connected'
              ? 'rgba(34,197,94,0.06)'
              : connectionStatus === 'connecting'
              ? 'rgba(56,189,248,0.06)'
              : 'rgba(245,158,11,0.06)',
            border: connectionStatus === 'connected'
              ? '1px solid rgba(34,197,94,0.2)'
              : connectionStatus === 'connecting'
              ? '1px solid rgba(56,189,248,0.2)'
              : '1px solid rgba(245,158,11,0.2)',
          }}>
            <span className={`wa-qr-status-dot ${connectionStatus}`} />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>
              {connectionStatus === 'connected'
                ? `✅ Conectado — ${connectedPhone}`
                : connectionStatus === 'connecting'
                ? '🔄 Conectando ao WhatsApp...'
                : '⏳ Aguardando leitura do QR Code'}
            </span>
          </div>

          {/* QR Code or Connected State */}
          {connectionStatus !== 'connected' ? (
            <div className="wa-qr-code-wrapper">
              {connectionStatus === 'connecting' ? (
                <div style={{
                  width: '176px', height: '176px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '14px'
                }}>
                  <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
                  <span style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                    Autenticando...
                  </span>
                </div>
              ) : (
                <>
                  <div className="wa-qr-scan-line" />
                  <QRCodeSVG />
                </>
              )}
            </div>
          ) : (
            <div style={{
              width: '200px', height: '200px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '14px',
              background: 'rgba(34,197,94,0.06)',
              border: '2px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <CheckCircle size={48} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>
                CONECTADO
              </span>
              <span style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center' }}>
                {connectedPhone}
              </span>
            </div>
          )}

          {/* Instructions */}
          {connectionStatus === 'waiting' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Como conectar
              </span>
              {[
                'Abra o WhatsApp no seu celular',
                'Vá em Configurações → Aparelhos Conectados',
                'Toque em "Conectar um aparelho"',
                'Aponte a câmera para este QR Code',
              ].map((step, i) => (
                <div key={i} className="wa-step">
                  <span className="wa-step-num">{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Info box */}
          {connectionStatus === 'connected' && (
            <div style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,149,0,0.05)',
              border: '1px solid rgba(255,149,0,0.15)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              📤 Todos os disparos de WhatsApp desta conta serão feitos a partir do número conectado. Mantenha o celular com internet ativa.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {connectionStatus === 'connected' ? (
            <>
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '9px 18px' }} onClick={onDisconnect}>
                <WifiOff size={15} /> Desconectar
              </button>
              <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '9px 18px' }} onClick={onClose}>
                <Check size={15} /> Fechar
              </button>
            </>
          ) : connectionStatus === 'waiting' ? (
            <>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '9px 18px' }} onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '9px 18px' }} onClick={onSimulateConnect}>
                <QrCode size={15} /> Simular Conexão
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '9px 18px', width: '100%' }} disabled>
              <div className="spinner" /> Aguardando...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Chat Principal ──
export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isHumanControl, setIsHumanControl] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');

  // Real-time simulation states
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [showWebhookConsole, setShowWebhookConsole] = useState(true);

  // WhatsApp Connection states
  const [showWAModal, setShowWAModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('waiting'); // waiting | connecting | connected
  const [connectedPhone, setConnectedPhone] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    setWebhookLogs([
      {
        id: 'log_0',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        direction: 'RECEIVED',
        event: 'webhook.received',
        payload: { object: 'whatsapp_business_account', entry: [{ changes: [{ field: 'messages', value: { messages: [{ from: '5511998877665', text: { body: 'Temos 5 vendedores dedicados.' } }] } }] }] }
      },
      {
        id: 'log_01',
        timestamp: new Date(Date.now() - 150000).toISOString(),
        direction: 'SENT',
        event: 'messages.sent_success',
        payload: { messaging_product: 'whatsapp', messages: [{ id: 'wamid.HBgMNTUxMTk5ODg3NzY2NRAJEg' }] }
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact?.chatHistory, isClientTyping, isAgentTyping]);

  const loadChats = () => {
    const list = dbService.getContacts().filter(c => c.chatHistory && c.chatHistory.length > 0);
    const updatedList = list.map(c => c.id === 'ct_3' ? { ...c, unread: true } : c);
    setContacts(updatedList);
    if (!selectedContact && updatedList.length > 0) {
      setSelectedContact(updatedList[0]);
    } else if (selectedContact) {
      const refreshed = updatedList.find(c => c.id === selectedContact.id);
      if (refreshed) setSelectedContact(refreshed);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const logWebhook = (direction, event, payload) => {
    const newLog = { id: 'log_' + Date.now(), timestamp: new Date().toISOString(), direction, event, payload };
    setWebhookLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  // ✅ FIX: toggleControl agora está definido
  const toggleControl = (contactId) => {
    setIsHumanControl(prev => ({ ...prev, [contactId]: !prev[contactId] }));
  };

  const handleSelectContact = (contact) => {
    if (contact.unread) contact.unread = false;
    setSelectedContact(contact);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;
    const typedText = inputText.trim();
    const isHuman = !!isHumanControl[selectedContact.id];

    logWebhook('SENT', 'api.send_message', {
      messaging_product: 'whatsapp',
      to: selectedContact.phone,
      type: 'text',
      text: { body: typedText }
    });

    const newMessage = { sender: isHuman ? 'human' : 'agent', message: typedText, timestamp: new Date().toISOString() };
    const updatedContact = { ...selectedContact, chatHistory: [...selectedContact.chatHistory, newMessage], lastContact: new Date().toISOString(), waitingResponse: false };

    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    loadChats();
    setInputText('');

    if (!isHuman) {
      setIsAgentTyping(true);
      setTimeout(() => { setIsAgentTyping(false); handleAutomaticResponse(updatedContact, typedText); }, 1500);
    } else {
      setIsClientTyping(true);
      setTimeout(() => { setIsClientTyping(false); simulateClientResponse(updatedContact, typedText); }, 3000);
    }
  };

  const handleAutomaticResponse = (contact, userText) => {
    const textLower = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let reply = '';
    let updateScore = 0;
    let statusChange = null;

    if (textLower.includes('parar') || textLower.includes('remover') || textLower.includes('sair') || textLower.includes('nao quero')) {
      reply = "Compreendo perfeitamente. Seu contato foi removido de nossa lista ativa. Tenha uma boa semana.";
      statusChange = 'Bloqueado';
      updateScore = -contact.leadScore;
      logWebhook('RECEIVED', 'webhook.opt_out', { phone: contact.phone, trigger: 'opt-out keyword' });
    } else if (textLower.includes('preco') || textLower.includes('quanto') || textLower.includes('custo') || textLower.includes('valor')) {
      reply = "Nossa linha de BBs AmmoBox começa em R$ 39,60/cx e equipamentos FEDERATY a partir de R$ 249. Qual produto te interessa? Posso montar uma proposta com condições de revendedor.";
      updateScore = 10;
      logWebhook('RECEIVED', 'webhook.intent_identified', { intent: 'price_inquiry', confidence: 0.94 });
    } else if (textLower.includes('proposta') || textLower.includes('orcamento')) {
      reply = `Perfeito! Posso gerar a proposta comercial customizada agora. Você confirma que o e-mail ${contact.email || ''} é o melhor para envio?`;
      updateScore = 15;
      logWebhook('RECEIVED', 'webhook.intent_identified', { intent: 'proposal_request', confidence: 0.98 });
    } else {
      reply = `Obrigado pelas informações! O TACT está processando sua necessidade. Qual seria o principal produto de interesse da ${contact.company}?`;
      updateScore = 5;
    }

    const agentMessage = { sender: 'agent', message: reply, timestamp: new Date().toISOString() };
    const finalContact = {
      ...contact,
      chatHistory: [...contact.chatHistory, agentMessage],
      leadScore: Math.min(Math.max(contact.leadScore + updateScore, 0), 100),
      classification: contact.leadScore + updateScore >= 75 ? 'Lead qualificado' : 'Lead morno'
    };
    if (statusChange) { finalContact.status = statusChange; finalContact.consent = false; finalContact.blockReason = 'Solicitou descadastro por palavra-chave.'; }
    dbService.saveContact(finalContact);
    setSelectedContact(finalContact);
    loadChats();
  };

  const simulateClientResponse = (contact, lastSentMsg) => {
    logWebhook('RECEIVED', 'webhook.message_received', {
      messages: [{ from: contact.phone, text: { body: 'Interessante isso.' } }]
    });
    const clientReplies = [
      "Perfeito! Vocês oferecem suporte no horário comercial?",
      "Certo! Qual o prazo de entrega para o interior de SP?",
      "Entendi. Vou alinhar isso com meu gerente e te aviso.",
      "Gostei. Pode enviar as condições de revenda no meu e-mail?"
    ];
    const clientMessage = { sender: 'client', message: clientReplies[Math.floor(Math.random() * clientReplies.length)], timestamp: new Date().toISOString() };
    const updated = { ...contact, chatHistory: [...contact.chatHistory, clientMessage], leadScore: Math.min(contact.leadScore + 5, 100) };
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
      const updated = { ...selectedContact, status: 'Bloqueado', consent: false, blockReason: 'Bloqueado manualmente no painel.' };
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
      proposalNumber: propNumber, contactId: selectedContact.id, serviceId: 'srv_1',
      clientCompany: selectedContact.company, clientContactName: `${selectedContact.firstName} ${selectedContact.lastName}`,
      introduction: `Proposta comercial gerada para ${selectedContact.company}.`,
      problemIdentified: `Necessidade comercial no segmento ${selectedContact.segment}.`,
      solutionRecommended: 'Implantação do agente comercial TACT.',
      scopeOfServices: 'Mapeamento de jornada comercial, configuração da IA, 30 dias de acompanhamento.',
      valueTotal: 5000.00, discount: 0, taxes: 0,
      paymentTerms: '50% sinal + 50% na aprovação.', deliveryTerm: '15 dias úteis.',
      status: 'Enviada', createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 0, lastViewedAt: null, acceptedAt: null, refusedAt: null, refuseReason: null
    };
    dbService.saveProposal(newProposal);
    const alertMsg = { sender: 'agent', message: `📄 Proposta Comercial *nº ${propNumber}* gerada! Valor: R$ 5.000,00. Link: https://liporoni.vercel.app/proposta/${propNumber}`, timestamp: new Date().toISOString() };
    const updatedContact = { ...selectedContact, status: 'Proposta enviada', chatHistory: [...selectedContact.chatHistory, alertMsg], leadScore: 90, classification: 'Oportunidade prioritária' };
    dbService.saveContact(updatedContact);
    setSelectedContact(updatedContact);
    loadChats();
    logWebhook('SENT', 'api.proposal_sent', { number: propNumber, client: selectedContact.company });
    alert(`Proposta nº ${propNumber} gerada com sucesso!`);
  };

  // WhatsApp connection simulation
  const handleSimulateConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setConnectedPhone('+55 11 9 9100-2030 (TACT Import)');
      logWebhook('RECEIVED', 'whatsapp.session_connected', { phone: '5511991002030', status: 'CONNECTED', timestamp: new Date().toISOString() });
    }, 2500);
  };

  const handleDisconnect = () => {
    setConnectionStatus('waiting');
    setConnectedPhone('');
    logWebhook('SENT', 'whatsapp.session_disconnected', { reason: 'user_requested', timestamp: new Date().toISOString() });
  };

  // Inbox filter
  const filteredChats = contacts.filter(contact => {
    const lastMsg = contact.chatHistory[contact.chatHistory.length - 1];
    switch (activeFilter) {
      case 'unread':    return !!contact.unread;
      case 'waiting':   return lastMsg && lastMsg.sender === 'client';
      case 'auto':      return !isHumanControl[contact.id];
      case 'human':     return !!isHumanControl[contact.id];
      case 'hot':       return contact.leadScore >= 75;
      case 'proposals': return contact.status === 'Proposta enviada';
      case 'blocked':   return contact.status === 'Bloqueado';
      default:          return true;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '14px' }}>

      {/* WhatsApp Connection Modal */}
      {showWAModal && (
        <WhatsAppConnectModal
          onClose={() => setShowWAModal(false)}
          connectionStatus={connectionStatus}
          onSimulateConnect={handleSimulateConnect}
          onDisconnect={handleDisconnect}
          connectedPhone={connectedPhone}
        />
      )}

      {/* CENTRAL CONVERSAS WRAPPER */}
      <div className="chat-inbox-container" style={{ flex: 1, minHeight: 0 }}>

        {/* LEFT PANEL — Chat List */}
        <div className="chat-sidebar-left glass-panel">

          {/* Header com botão WhatsApp */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Conversas
            </span>
            <button
              onClick={() => setShowWAModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                background: connectionStatus === 'connected' ? 'rgba(34,197,94,0.1)' : 'rgba(255,149,0,0.1)',
                color: connectionStatus === 'connected' ? '#4ade80' : 'var(--primary)',
                border: connectionStatus === 'connected' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,149,0,0.25)',
                transition: 'all 0.2s',
              }}
              title="Conectar WhatsApp"
            >
              {connectionStatus === 'connected'
                ? <><Wifi size={13} /> Conectado</>
                : <><Smartphone size={13} /> Conectar WA</>
              }
            </button>
          </div>

          {/* Search */}
          <div className="chat-search">
            <div className="search-bar" style={{ width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Pesquisar conversas..." style={{ fontSize: '0.8rem' }} />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="chat-filter-tabs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'unread', label: 'Não Lidas' },
              { id: 'waiting', label: 'Aguardando' },
              { id: 'auto', label: 'IA' },
              { id: 'human', label: 'Humano' },
              { id: 'hot', label: 'Quentes' },
              { id: 'proposals', label: 'Propostas' },
              { id: 'blocked', label: 'Bloqueados' },
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

          {/* Chat List */}
          <div className="chat-list">
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
                  >
                    <div className="chat-item-avatar">{contact.firstName[0]}</div>
                    <div className="chat-item-details">
                      <div className="chat-item-header">
                        <span className="chat-item-name">{contact.firstName} {contact.lastName}</span>
                        <span className="chat-item-time">
                          {new Date(contact.lastContact || contact.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="chat-item-company">{contact.company}</span>
                      <span className="chat-item-msg" style={{ fontWeight: contact.unread ? 'bold' : 'normal', color: contact.unread ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {lastMsg ? lastMsg.message : 'Sem mensagens'}
                      </span>
                    </div>
                    {contact.unread && <span className="unread-indicator" style={{ top: '50%', transform: 'translateY(-50%)', right: '14px' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER PANEL — Chat Messages */}
        <div className="chat-main-area glass-panel">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="chat-main-header">
                <div className="chat-header-userinfo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
                    <span className={`badge ${selectedContact.status === 'Bloqueado' ? 'badge-danger' : selectedContact.status === 'Venda realizada' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      {selectedContact.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span className={`status-dot ${isHumanControl[selectedContact.id] ? 'paused' : 'active'}`} style={{ width: '6px', height: '6px' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {isHumanControl[selectedContact.id] ? 'Atendimento Humano' : 'Atendimento IA (TACT)'}
                    </span>
                    {connectionStatus === 'connected' && (
                      <span style={{ fontSize: '0.65rem', color: '#4ade80', fontFamily: 'var(--font-heading)', marginLeft: '8px' }}>
                        📱 {connectedPhone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="chat-header-actions">
                  {connectionStatus !== 'connected' && (
                    <button
                      onClick={() => setShowWAModal(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 12px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-heading)',
                        cursor: 'pointer', background: 'rgba(239,68,68,0.08)',
                        color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <WifiOff size={13} /> WhatsApp Desconectado
                    </button>
                  )}
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

              {/* Messages */}
              <div className="chat-messages-container">
                {selectedContact.chatHistory.map((msg, idx) => (
                  <div key={idx} className={`message-bubble ${msg.sender === 'client' ? 'client' : 'agent'}`}>
                    <p>{msg.message}</p>
                    <span className="message-timestamp">
                      {msg.sender === 'human' && <span style={{ color: 'var(--warning)', marginRight: '4px', fontWeight: 600, fontSize: '0.6rem' }}>HUMANO</span>}
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender !== 'client' && <Check size={11} style={{ color: '#4ade80' }} />}
                    </span>
                  </div>
                ))}

                {isClientTyping && (
                  <div className="typing-indicator">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                )}
                {isAgentTyping && (
                  <div className="typing-indicator" style={{ background: 'rgba(255,149,0,0.05)', borderColor: 'rgba(255,149,0,0.15)' }}>
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="typing-dot" style={{ backgroundColor: 'var(--primary)' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="chat-input-area">
                <input
                  type="text"
                  className="chat-input-field"
                  placeholder={isHumanControl[selectedContact.id] ? "Digite sua resposta como atendente humano..." : "Envie um comando ou teste a IA (ex: 'quero uma proposta')"}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px', flexShrink: 0 }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '16px' }}>
              <MessageCircle size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '0.9rem' }}>Selecione um contato para carregar o histórico</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Contact Details */}
        <div className="chat-sidebar-right glass-panel">
          {selectedContact ? (
            <>
              <div className="lead-score-widget">
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Lead Scoring</span>
                <div className="score-circle">{selectedContact.leadScore}</div>
                <span className="badge badge-primary">{selectedContact.classification}</span>
              </div>

              <div>
                <span className="sidebar-section-title">Ações Operacionais</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }} onClick={handleGenerateProposal} disabled={selectedContact.status === 'Bloqueado'}>
                    <FileText size={16} /> <span>Gerar Proposta</span>
                  </button>
                  <button className="btn btn-danger" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }} onClick={handleBlockContact} disabled={selectedContact.status === 'Bloqueado'}>
                    <Ban size={16} /> <span>Bloquear Contato</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="sidebar-section-title">Dados e Status</span>
                <div className="info-item">
                  <label>Status Funil</label>
                  <select className="filter-select" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} value={selectedContact.status} onChange={e => handleStatusChange(e.target.value)}>
                    <option value="Novo contato">Novo contato</option>
                    <option value="Em atendimento">Em atendimento</option>
                    <option value="Em qualificação">Em qualificação</option>
                    <option value="Qualificado">Qualificado</option>
                    <option value="Proposta enviada">Proposta enviada</option>
                    <option value="Venda realizada">Venda realizada</option>
                    <option value="Bloqueado">Bloqueado</option>
                  </select>
                </div>
                <div className="info-item"><label>Empresa</label><span>{selectedContact.company}</span></div>
                <div className="info-item"><label>WhatsApp</label><span>{selectedContact.phone}</span></div>
                <div className="info-item"><label>Cidade/Estado</label><span>{selectedContact.city}/{selectedContact.state}</span></div>
                <div className="info-item"><label>Segmento</label><span>{selectedContact.segment}</span></div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', paddingTop: '30px' }}>
              Nenhum contato selecionado
            </div>
          )}
        </div>
      </div>

      {/* WEBHOOK CONSOLE */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', flexShrink: 0 }}>
        <div
          style={{ padding: '8px 16px', borderBottom: showWebhookConsole ? '1px solid var(--glass-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
          onClick={() => setShowWebhookConsole(!showWebhookConsole)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} className="glow-text-blue" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Console de Webhooks — WhatsApp Business API</span>
            {connectionStatus === 'connected' && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>AO VIVO</span>}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {showWebhookConsole ? 'Recolher [-]' : 'Expandir [+]'}
          </span>
        </div>
        {showWebhookConsole && (
          <div className="webhook-logger-panel">
            {webhookLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aguardando eventos...</div>
            ) : (
              webhookLogs.map(log => (
                <div key={log.id} className="webhook-log-line">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
