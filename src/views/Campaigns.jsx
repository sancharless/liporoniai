import React, { useState, useEffect } from 'react';
import { Megaphone, Play, Pause, Square, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { dbService } from '../services/db';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [services, setServices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [targetRegion, setTargetRegion] = useState('');
  const [tone, setTone] = useState('Profissional');
  const [timeRange, setTimeRange] = useState('09:00 - 18:00');
  const [maxMessages, setMaxMessages] = useState(300);

  useEffect(() => {
    setCampaigns(dbService.getCampaigns());
    setServices(dbService.getServices());
  }, []);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!name || !serviceId) {
      alert('Nome da campanha e Serviço de interesse são obrigatórios.');
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
      status: 'Programada', // Inicialmente agendada
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      intervalMinutes: 5
    };

    dbService.saveCampaign(newCampaign);
    setCampaigns(dbService.getCampaigns());
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
    setMaxMessages(300);
  };

  const handleStatusChange = (id, newStatus) => {
    const db = dbService.getCampaigns();
    const camp = db.find(c => c.id === id);
    if (camp) {
      camp.status = newStatus;
      dbService.saveCampaign(camp);
      setCampaigns(dbService.getCampaigns());
    }
  };

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Campanhas de Prospecção</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure, inicie e monitore os disparos ativos e follow-ups.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Criar Campanha</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {campaigns.map(camp => {
          const relatedService = services.find(s => s.id === camp.serviceId)?.name || 'Todos os Serviços';
          
          return (
            <div key={camp.id} className="glass-panel" style={{ padding: '20px', position: 'relative', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Megaphone size={20} className="glow-text-blue" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{camp.name}</h3>
                </div>
                <span className={`badge ${
                  camp.status === 'Em andamento' ? 'badge-success' : 
                  camp.status === 'Pausada' ? 'badge-warning' : 
                  camp.status === 'Concluída' ? 'badge-primary' : 'badge-secondary'
                }`}>
                  {camp.status}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <p><strong>Objetivo:</strong> {camp.objective || 'Nenhum informado'}</p>
                <p><strong>Serviço:</strong> {relatedService}</p>
                <p><strong>Região/Segmento:</strong> {camp.targetRegion || 'Qualquer'} | {camp.targetSegment || 'Todos'}</p>
                <p><strong>Limite/Horário:</strong> {camp.maxMessages} envios | {camp.timeRange}</p>
              </div>

              {/* Progress metrics */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Enviados</span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{camp.sentCount || 0}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Respostas</span>
                    <p style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>{camp.responseCount || 0}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Faturamento</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', color: 'var(--success)' }}>
                      R$ {camp.revenue ? camp.revenue.toLocaleString('pt-BR') : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                {camp.status === 'Programada' && (
                  <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%' }} onClick={() => handleStatusChange(camp.id, 'Em andamento')}>
                    <Play size={12} /> Iniciar
                  </button>
                )}
                {camp.status === 'Em andamento' && (
                  <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%' }} onClick={() => handleStatusChange(camp.id, 'Pausada')}>
                    <Pause size={12} /> Pausar
                  </button>
                )}
                {camp.status === 'Pausada' && (
                  <>
                    <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '50%' }} onClick={() => handleStatusChange(camp.id, 'Em andamento')}>
                      <Play size={12} /> Retomar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '0.75rem', width: '50%' }} onClick={() => handleStatusChange(camp.id, 'Concluída')}>
                      <Square size={12} /> Encerrar
                    </button>
                  </>
                )}
                {camp.status === 'Concluída' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%', display: 'block' }}>
                    Esta campanha foi finalizada.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>Criar Nova Campanha</h3>
            </div>
            <form onSubmit={handleCreateCampaign}>
              <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Nome da Campanha *</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: Black Friday Ativos" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Objetivo</label>
                  <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: Divulgar novo serviço comercial" value={objective} onChange={e => setObjective(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Serviço Vinculado *</label>
                  <select className="filter-select" style={{ width: '100%' }} value={serviceId} onChange={e => setServiceId(e.target.value)} required>
                    <option value="">Selecione um serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Segmento Alvo</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="TI, Metalurgia, etc." value={targetSegment} onChange={e => setTargetSegment(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Região/Cidade Alvo</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Ex: São Paulo/SP" value={targetRegion} onChange={e => setTargetRegion(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Tom de Voz do Liporoni</label>
                    <select className="filter-select" style={{ width: '100%' }} value={tone} onChange={e => setTone(e.target.value)}>
                      <option value="Profissional">Profissional e sério</option>
                      <option value="Consultivo">Consultivo e explicativo</option>
                      <option value="Descontraído">Descontraído e amigável</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Horário de Envio</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="09:00 - 18:00" value={timeRange} onChange={e => setTimeRange(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Limite Máximo de Mensagens</label>
                  <input type="number" className="form-control" style={{ paddingLeft: '14px' }} placeholder="300" value={maxMessages} onChange={e => setMaxMessages(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
