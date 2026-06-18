import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Play, Pause, Plus, Trash2, Save, ArrowDown, 
  Settings, Zap, CheckCircle2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  
  // Available triggers, conditions, and actions catalog
  const triggerTypes = [
    { type: 'contact_created', label: 'Contato Criado', icon: Zap, color: '#a855f7' },
    { type: 'message_received', label: 'Mensagem Recebida', icon: GitBranch, color: '#3b82f6' },
    { type: 'scoring_changed', label: 'Score Alterado', icon: Layers, color: '#eab308' }
  ];

  const conditionFields = [
    { field: 'segment', label: 'Segmento do Lead' },
    { field: 'leadScore', label: 'Lead Scoring (Pontos)' },
    { field: 'city', label: 'Cidade do Lead' },
    { field: 'status', label: 'Status Comercial' }
  ];

  const actionTypes = [
    { type: 'add_to_campaign', label: 'Adicionar à Campanha', color: '#10b981' },
    { type: 'start_ia_chat', label: 'Ativar Conversação IA (Liporoni)', color: '#00d2ff' },
    { type: 'notify_owner', label: 'Notificar Responsável Comercial', color: '#ef4444' }
  ];

  // Editor states (for the currently selected automation)
  const [flowName, setFlowName] = useState('');
  const [flowStatus, setFlowStatus] = useState('Ativa');
  
  const [triggerType, setTriggerType] = useState('contact_created');
  
  const [condField, setCondField] = useState('segment');
  const [condOperator, setCondOperator] = useState('equals');
  const [condValue, setCondValue] = useState('');
  
  const [actionType, setActionType] = useState('add_to_campaign');
  const [actionValue, setActionValue] = useState('');

  // Campaigns & Tags for dropdown options
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    loadAutomationsData();
  }, []);

  const loadAutomationsData = () => {
    const list = dbService.getAutomations();
    setAutomations(list);
    setCampaigns(dbService.getCampaigns());
    
    if (list.length > 0 && !selectedFlow) {
      selectFlow(list[0]);
    }
  };

  const selectFlow = (flow) => {
    setSelectedFlow(flow);
    setFlowName(flow.name);
    setFlowStatus(flow.status);
    
    setTriggerType(flow.trigger.type);
    
    setCondField(flow.condition.field);
    setCondOperator(flow.condition.operator);
    setCondValue(flow.condition.value);
    
    setActionType(flow.action.type);
    setActionValue(flow.action.value);
  };

  const handleCreateNewFlow = () => {
    const newFlow = {
      id: 'temp_new',
      name: 'Novo Fluxo de Automação',
      status: 'Inativa',
      trigger: { type: 'contact_created', label: 'Contato Criado' },
      condition: { field: 'segment', operator: 'equals', value: 'Tecnologia', label: 'Segmento é Tecnologia' },
      action: { type: 'add_to_campaign', value: campaigns.length > 0 ? campaigns[0].id : '', label: 'Adicionar à Campanha' }
    };
    
    setSelectedFlow(newFlow);
    setFlowName(newFlow.name);
    setFlowStatus(newFlow.status);
    setTriggerType(newFlow.trigger.type);
    setCondField(newFlow.condition.field);
    setCondOperator(newFlow.condition.operator);
    setCondValue(newFlow.condition.value);
    setActionType(newFlow.action.type);
    setActionValue(newFlow.action.value);
  };

  const handleSaveFlow = () => {
    if (!flowName.trim()) {
      alert('Diga o nome da automação.');
      return;
    }

    // Build human readable labels
    const selectedTriggerObj = triggerTypes.find(t => t.type === triggerType);
    const triggerLabel = selectedTriggerObj ? selectedTriggerObj.label : 'Gatilho';

    const selectedFieldObj = conditionFields.find(f => f.field === condField);
    const fieldLabel = selectedFieldObj ? selectedFieldObj.label : 'Campo';
    const operatorSymbol = condOperator === 'equals' ? 'é igual a' : condOperator === 'greater_than' ? 'maior que' : 'contém';
    const conditionLabel = `${fieldLabel} ${operatorSymbol} "${condValue}"`;

    const selectedActionObj = actionTypes.find(a => a.type === actionType);
    let actionValLabel = actionValue;
    if (actionType === 'add_to_campaign') {
      const camp = campaigns.find(c => c.id === actionValue);
      actionValLabel = camp ? camp.name : actionValue;
    } else if (actionType === 'start_ia_chat') {
      actionValLabel = 'Ativar Agente Virtual Liporoni';
    } else {
      actionValLabel = 'Equipe de Vendas';
    }
    const actionLabel = `${selectedActionObj ? selectedActionObj.label : 'Ação'}: ${actionValLabel}`;

    const savedFlow = {
      id: selectedFlow.id === 'temp_new' ? undefined : selectedFlow.id,
      name: flowName,
      status: flowStatus,
      trigger: { type: triggerType, label: triggerLabel },
      condition: { field: condField, operator: condOperator, value: condValue, label: conditionLabel },
      action: { type: actionType, value: actionValue, label: actionLabel }
    };

    const result = dbService.saveAutomation(savedFlow);
    loadAutomationsData();
    setSelectedFlow(result);
    alert('Fluxo de automação salvo com sucesso!');
  };

  const handleDeleteFlow = () => {
    if (selectedFlow.id === 'temp_new') {
      setSelectedFlow(null);
      loadAutomationsData();
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir esta automação permanentemente?')) {
      dbService.deleteAutomation(selectedFlow.id);
      setSelectedFlow(null);
      loadAutomationsData();
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', marginTop: '10px' }}>
      
      {/* Node custom styling overrides */}
      <style>{`
        .flow-node-card {
          width: 340px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          position: relative;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-normal);
        }
        .flow-node-card.node-trigger {
          border-color: #a855f7;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.1);
        }
        .flow-node-card.node-condition {
          border-color: #f59e0b;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.1);
        }
        .flow-node-card.node-action {
          border-color: #00d2ff;
          box-shadow: 0 0 15px rgba(0, 210, 255, 0.1);
        }
        .flow-node-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .flow-node-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .badge-trigger { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        .badge-condition { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .badge-action { background: rgba(0, 210, 255, 0.15); color: var(--primary); }
        
        .flow-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 12px 0;
        }
        .flow-line {
          width: 3px;
          height: 40px;
          background: linear-gradient(180deg, var(--glass-border), rgba(255,255,255,0.15));
        }
        .flow-arrow-head {
          color: rgba(255,255,255,0.15);
          margin-top: -6px;
        }
      `}</style>

      {/* LEFT: AUTOMATIONS SIDEBAR */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Automações</h3>
          <button className="collapse-btn" onClick={handleCreateNewFlow} title="Nova Automação">
            <Plus size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '480px' }}>
          {automations.map(flow => {
            const isSelected = selectedFlow && selectedFlow.id === flow.id;
            return (
              <div 
                key={flow.id} 
                className={`nav-item ${isSelected ? 'active' : ''}`}
                style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderLeft: isSelected ? '3px solid var(--primary)' : 'none' }}
                onClick={() => selectFlow(flow)}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflow: 'hidden' }}>
                  <GitBranch size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{flow.name}</span>
                </div>
                <span className={`badge ${flow.status === 'Ativa' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                  {flow.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: FLOW EDITOR WORKSPACE */}
      {selectedFlow ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
          
          {/* VISUAL FLOWCHART WORKSPACE */}
          <div className="table-card glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(15, 21, 36, 0.2) 0%, rgba(9, 13, 22, 0.4) 100%)' }}>
            
            {/* 1. TRIGGER NODE */}
            <div className="flow-node-card node-trigger">
              <div className="flow-node-header">
                <span className="flow-node-badge badge-trigger">Gatilho (Trigger)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Zap size={18} style={{ color: '#c084fc' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {triggerTypes.find(t => t.type === triggerType)?.label || 'Gatilho'}
                  </h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Inicia a execução do fluxo</p>
                </div>
              </div>
            </div>

            {/* CONNECT PATH */}
            <div className="flow-connector">
              <div className="flow-line" style={{ background: 'linear-gradient(180deg, #a855f7, #f59e0b)' }}></div>
              <ArrowDown size={14} className="flow-arrow-head" style={{ color: '#f59e0b' }} />
            </div>

            {/* 2. CONDITION NODE */}
            <div className="flow-node-card node-condition">
              <div className="flow-node-header">
                <span className="flow-node-badge badge-condition">Condição (Filter)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Settings size={18} style={{ color: '#fbbf24' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    Se: {conditionFields.find(f => f.field === condField)?.label || 'Campo'}
                  </h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {condOperator === 'equals' ? 'é igual a' : condOperator === 'greater_than' ? 'maior que' : 'contém'}: <strong>"{condValue || '...'}"</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* CONNECT PATH */}
            <div className="flow-connector">
              <div className="flow-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #00d2ff)' }}></div>
              <ArrowDown size={14} className="flow-arrow-head" style={{ color: '#00d2ff' }} />
            </div>

            {/* 3. ACTION NODE */}
            <div className="flow-node-card node-action">
              <div className="flow-node-header">
                <span className="flow-node-badge badge-action">Ação (Action)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {actionTypes.find(a => a.type === actionType)?.label || 'Ação'}
                  </h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Alvo: <strong>{actionType === 'add_to_campaign' ? (campaigns.find(c => c.id === actionValue)?.name || actionValue) : actionValue || 'Sem alvo'}</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT EDIT PANEL */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Configurar Automação</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure as propriedades dos nós</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              
              <div className="form-group">
                <label>Nome do Fluxo *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '14px' }}
                  placeholder="Nome descritivo"
                  value={flowName}
                  onChange={e => setFlowName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  className="filter-select"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                  value={flowStatus}
                  onChange={e => setFlowStatus(e.target.value)}
                >
                  <option value="Ativa">Ativa (Em execução)</option>
                  <option value="Inativa">Inativa (Pausada)</option>
                </select>
              </div>

              {/* GATILHO EDITOR */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Propriedades do Gatilho</h4>
                <div className="form-group">
                  <label>Evento Disparador</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={triggerType}
                    onChange={e => setTriggerType(e.target.value)}
                  >
                    {triggerTypes.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CONDIÇÃO EDITOR */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Propriedades da Condição</h4>
                
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Campo de Análise</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={condField}
                    onChange={e => setCondField(e.target.value)}
                  >
                    {conditionFields.map(f => (
                      <option key={f.field} value={f.field}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Operador</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                      value={condOperator}
                      onChange={e => setCondOperator(e.target.value)}
                    >
                      <option value="equals">Igual a</option>
                      <option value="contains">Contém</option>
                      <option value="greater_than">Maior que</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor Alvo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '14px' }}
                      placeholder="Valor"
                      value={condValue}
                      onChange={e => setCondValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* AÇÃO EDITOR */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Propriedades da Ação</h4>
                
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Executar Ação</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={actionType}
                    onChange={e => {
                      setActionType(e.target.value);
                      if (e.target.value === 'add_to_campaign') {
                        setActionValue(campaigns.length > 0 ? campaigns[0].id : '');
                      } else if (e.target.value === 'start_ia_chat') {
                        setActionValue('active');
                      } else {
                        setActionValue('all');
                      }
                    }}
                  >
                    {actionTypes.map(a => (
                      <option key={a.type} value={a.type}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Parâmetro da Ação</label>
                  {actionType === 'add_to_campaign' ? (
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                      value={actionValue}
                      onChange={e => setActionValue(e.target.value)}
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '14px' }}
                      value={actionValue}
                      onChange={e => setActionValue(e.target.value)}
                    />
                  )}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', gap: '10px' }}>
              <button className="btn btn-danger" style={{ padding: '12px' }} onClick={handleDeleteFlow}>
                <Trash2 size={16} />
              </button>
              
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveFlow}>
                <Save size={16} />
                <span>Salvar Fluxo</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        <div className="table-card glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Nenhuma automação selecionada. Crie uma nova na barra lateral.
        </div>
      )}

    </div>
  );
}
