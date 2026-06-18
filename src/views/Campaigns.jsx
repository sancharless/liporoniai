import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Play, Pause, Square, Plus, Trash2, ShieldAlert,
  ArrowRight, Users, Send, Clock, Sliders, ChevronRight, X, 
  MessageSquare, FileText, CheckCircle
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [targetRegion, setTargetRegion] = useState('');
  const [tone, setTone] = useState('Profissional');
  const [timeRange, setTimeRange] = useState('09:00 - 18:00');
  const [maxMessages, setMaxMessages] = useState(10);
  const [initialMessage, setInitialMessage] = useState('Olá, {{nome}}! Meu nome é Liporoni, assistente virtual da nossa empresa. Vi que você trabalha na {{empresa}} no segmento de {{segmento}}. Trabalhamos com {{serviço}} que pode otimizar seu tempo. Posso te fazer uma pergunta rápida?');
  const [followUps, setFollowUps] = useState([
    { delayHours: 24, message: 'Olá, {{nome}}! Conseguiu ver a mensagem anterior?' },
    { delayHours: 72, message: 'Lembrete rápido: nossa proposta comercial para a {{empresa}} possui descontos válidos esta semana!' }
  ]);

  // Simulation Interval References
  const [simulationActive, setSimulationActive] = useState({}); // campId -> boolean

  useEffect(() => {
    loadCampaignsData();
  }, []);

  // Simulator for sending messages of running campaigns in the background
  useEffect(() => {
    const runningCampaigns = campaigns.filter(c => c.status === 'Em andamento');
    if (runningCampaigns.length === 0) return;

    const interval = setInterval(() => {
      runningCampaigns.forEach(camp => {
        simulateCampaignSending(camp);
      });
    }, 6000); // Send one message every 6 seconds for running campaigns

    return () => clearInterval(interval);
  }, [campaigns]);

  const loadCampaignsData = () => {
    setCampaigns(dbService.getCampaigns());
    setServices(dbService.getServices());
    setContacts(dbService.getContacts());
  };

  // Find contacts that match the campaign's target criteria (Segment)
  const getEligibleContacts = (camp) => {
    return contacts.filter(contact => {
      // Must not be blocked or opted-out
      if (contact.status === 'Bloqueado' || !contact.consent) return false;
      
      // Must match segment if specified
      if (camp.targetSegment && contact.segment !== camp.targetSegment) return false;

      // Must be new or available
      return contact.status === 'Novo contato' || contact.status === 'Disponível para prospecção';
    });
  };

  // Run the background prospecção dispatch simulation
  const simulateCampaignSending = (camp) => {
    const eligible = getEligibleContacts(camp);
    if (eligible.length === 0) {
      // No more eligible contacts: Mark campaign as Concluída!
      handleStatusChange(camp.id, 'Concluída');
      return;
    }

    // Pick first eligible contact to dispatch message
    const contact = eligible[0];
    const relatedService = services.find(s => s.id === camp.serviceId)?.name || 'Consultoria';

    // Personalize variables in message
    let personalizedMsg = camp.initialMessage || initialMessage;
    personalizedMsg = personalizedMsg
      .replace(/{{nome}}/g, contact.firstName)
      .replace(/{{empresa}}/g, contact.company)
      .replace(/{{segmento}}/g, contact.segment || 'Atendimento')
      .replace(/{{serviço}}/g, relatedService)
      .replace(/{{servico}}/g, relatedService);

    // Create the message object
    const newMsg = {
      sender: 'agent',
      message: personalizedMsg,
      timestamp: new Date().toISOString()
    };

    // Update contact status and history in database
    const updatedContact = {
      ...contact,
      status: 'Contato iniciado',
      lastContact: new Date().toISOString(),
      chatHistory: [newMsg],
      waitingResponse: true,
      tags: [...new Set([...contact.tags, 'Prospecção'])]
    };

    dbService.saveContact(updatedContact);

    // Update campaign counts
    const db = dbService.getDB();
    const campIdx = db.campaigns.findIndex(c => c.id === camp.id);
    if (campIdx >= 0) {
      db.campaigns[campIdx].sentCount += 1;
      db.campaigns[campIdx].deliveredCount += 1;
      // 50% chance they respond immediately in this simulation to feed stats!
      if (Math.random() > 0.5) {
        db.campaigns[campIdx].responseCount += 1;
      }
      dbService.saveDB(db);
    }

    // Refresh states
    loadCampaignsData();
    if (selectedCampaign && selectedCampaign.id === camp.id) {
      setSelectedCampaign(dbService.getCampaigns().find(c => c.id === camp.id));
    }
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!name || !serviceId) {
      alert('Nome e Serviço são obrigatórios.');
      return;
    }

    const newCampaign = {
      name,
      objective,
      serviceId,
      targetSegment,
      targetRegion,
      tone,
      timeRange,
      maxMessages: Number(maxMessages),
      initialMessage,
      followUps,
      status: 'Programada',
      sentCount: 0,
      deliveredCount: 0,
      responseCount: 0,
      conversionCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    dbService.saveCampaign(newCampaign);
    loadCampaignsData();
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setName('');
    setObjective('');
    setServiceId('');
    setTargetSegment('');
    setTargetRegion('');
    setTone('Profissional');
    setTimeRange('09:00 - 18:00');
    setMaxMessages(10);
    setInitialMessage('Olá, {{nome}}! Meu nome é Liporoni, assistente virtual da nossa empresa...');
  };

  const handleStatusChange = (id, newStatus) => {
    const db = dbService.getDB();
    const idx = db.campaigns.findIndex(c => c.id === id);
    if (idx >= 0) {
      db.campaigns[idx].status = newStatus;
      dbService.saveDB(db);
      loadCampaignsData();
      if (selectedCampaign && selectedCampaign.id === id) {
        setSelectedCampaign(db.campaigns[idx]);
      }
    }
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm('Excluir esta campanha permanentemente?')) {
      const db = dbService.getDB();
      db.campaigns = db.campaigns.filter(c => c.id !== id);
      dbService.saveDB(db);
      loadCampaignsData();
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
    }
  };

  return (
    <div className="table-card glass-panel" style={{ display: 'grid', gridTemplateColumns: selectedCampaign ? '1fr 340px' : '1fr', gap: '20px' }}>
      
      {/* CAMPAIGN LIST SECTION */}
      <div>
        <div className="view-header-row" style={{ marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Gestão de Campanhas</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dispare prospecções comerciais e configure acompanhamentos automatizados.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Criar Campanha</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {campaigns.map(camp => {
            const relatedService = services.find(s => s.id === camp.serviceId)?.name || 'Todos os Serviços';
            const eligibleCount = getEligibleContacts(camp).length;

            return (
              <div 
                key={camp.id} 
                className={`glass-panel ${selectedCampaign?.id === camp.id ? 'active' : ''}`} 
                style={{ 
                  padding: '20px', 
                  border: selectedCampaign?.id === camp.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  cursor: 'pointer' 
                }}
                onClick={() => setSelectedCampaign(camp)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Megaphone size={20} className="glow-text-blue" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{camp.name}</h3>
                  </div>
                  <span className={`badge ${
                    camp.status === 'Em andamento' ? 'badge-success' : 
                    camp.status === 'Pausada' ? 'badge-warning' : 
                    camp.status === 'Concluída' ? 'badge-primary' : 'badge-secondary'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <p><strong>Produto:</strong> {relatedService}</p>
                  <p><strong>Segmento Alvo:</strong> {camp.targetSegment || 'Qualquer'}</p>
                  <p><strong>Fila Elegível:</strong> {eligibleCount} leads restantes</p>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Progresso de envios</span>
                    <span>{camp.sentCount} / {camp.maxMessages}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min((camp.sentCount / camp.maxMessages) * 100, 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)' 
                    }}></div>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }} onClick={e => e.stopPropagation()}>
                  {camp.status === 'Programada' && (
                    <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%' }} onClick={() => handleStatusChange(camp.id, 'Em andamento')}>
                      <Play size={12} /> Iniciar
                    </button>
                  )}
                  {camp.status === 'Em andamento' && (
                    <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%' }} onClick={() => handleStatusChange(camp.id, 'Pausada')}>
                      <Pause size={12} /> Pausar Campanha
                    </button>
                  )}
                  {camp.status === 'Pausada' && (
                    <>
                      <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '50%' }} onClick={() => handleStatusChange(camp.id, 'Em andamento')}>
                        <Play size={12} /> Retomar
                      </button>
                      <button className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '50%' }} onClick={() => handleStatusChange(camp.id, 'Concluída')}>
                        <Square size={12} /> Concluir
                      </button>
                    </>
                  )}
                  {camp.status === 'Concluída' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Campanha Concluída</span>
                      <button onClick={() => handleDeleteCampaign(camp.id)} className="btn btn-danger" style={{ padding: '6px', borderRadius: '6px' }} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: SELECTED CAMPAIGN DETAIL & SIMULATION STATUS */}
      {selectedCampaign && (
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Detalhes da Campanha</h3>
            <button onClick={() => setSelectedCampaign(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8rem' }}>
            <div className="info-item">
              <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Nome da Campanha</label>
              <span style={{ fontWeight: 600 }}>{selectedCampaign.name}</span>
            </div>
            
            <div className="info-item">
              <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Objetivo Comercial</label>
              <span>{selectedCampaign.objective || 'Prospecção Geral'}</span>
            </div>

            {/* Campaign message preview */}
            <div className="info-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginBottom: '6px' }}>Mensagem Inicial Personalizada</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4, fontStyle: 'italic' }}>
                "{selectedCampaign.initialMessage || 'Olá, {{nome}}! Vi que você trabalha na {{empresa}}...'}"
              </p>
            </div>

            {/* Followups sequence preview */}
            <div className="info-item">
              <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginBottom: '8px' }}>Sequência de Follow-ups (Regras)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedCampaign.followUps || followUps).map((f, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.01)', borderLeft: '2px solid var(--primary)', padding: '8px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>Acompanhamento {i+1} (após {f.delayHours}h)</span>
                    <p style={{ color: 'var(--text-secondary)' }}>"{f.message}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulator Live status */}
            {selectedCampaign.status === 'Em andamento' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-dot active" style={{ width: '8px', height: '8px', animation: 'pulseGlow 1.5s infinite ease-in-out' }}></span>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>Simulador Ativo (Disparos a cada 6s)</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Varrendo lista de leads no banco de dados...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3>Criar Nova Campanha de Prospecção</h3>
            </div>
            
            <form onSubmit={handleCreateCampaign}>
              <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div className="form-group">
                  <label>Nome da Campanha *</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: Prospecção Tecnologia SP" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Objetivo Principal</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: Gerar reuniões de demonstração" value={objective} onChange={e => setObjective(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Serviço / Produto Promovido *</label>
                  <select className="filter-select" style={{ width: '100%' }} value={serviceId} onChange={e => setServiceId(e.target.value)} required>
                    <option value="">Selecione o serviço associado...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Segmento de Leads Alvo</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Tecnologia, Jurídico, etc." value={targetSegment} onChange={e => setTargetSegment(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Região Alvo</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: São Paulo/SP" value={targetRegion} onChange={e => setTargetRegion(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Tom de Voz da IA</label>
                    <select className="filter-select" style={{ width: '100%' }} value={tone} onChange={e => setTone(e.target.value)}>
                      <option value="Profissional">Profissional e Objetivo</option>
                      <option value="Consultivo">Consultivo e Educado</option>
                      <option value="Amigável">Amigável e Descontraído</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantidade de Enviar (Testes)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={maxMessages} onChange={e => setMaxMessages(e.target.value)} />
                  </div>
                </div>

                {/* Custom template message variables */}
                <div className="form-group">
                  <label>Modelo da Mensagem Inicial (use `{"{{nome}}"}`, `{"{{empresa}}"}`, `{"{{segmento}}"}`, `{"{{serviço}}"}`)</label>
                  <textarea 
                    className="form-control" 
                    style={{ paddingLeft: '14px', height: '100px', resize: 'vertical', fontSize: '0.8rem', lineHeight: '1.4' }}
                    value={initialMessage} 
                    onChange={e => setInitialMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar e Programar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
