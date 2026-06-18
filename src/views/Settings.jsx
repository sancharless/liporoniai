import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { dbService } from '../services/db';

export default function SettingsView() {
  const [settings, setSettings] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setSettings(dbService.getSettings());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    dbService.saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!settings) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="table-card glass-panel" style={{ padding: '30px' }}>
      <div className="view-header-row" style={{ marginBottom: '25px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Configurações do Agente Liporoni</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defina a personalidade, tom de voz, regras de negócio e limites operacionais da IA.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          <Save size={18} />
          <span>Salvar Alterações</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {saveSuccess && (
          <div className="badge badge-success" style={{ display: 'flex', width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.85rem' }}>
            Configurações salvas com sucesso no banco de dados!
          </div>
        )}

        <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Identidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
              Identidade & Personalidade
            </h3>
            
            <div className="form-group">
              <label>Nome do Agente</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '14px' }} 
                value={settings.agentName} 
                onChange={e => handleChange('agentName', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Empresa Representada</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '14px' }} 
                value={settings.companyRepresented} 
                onChange={e => handleChange('companyRepresented', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Tom de Voz Predominante</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '14px' }} 
                value={settings.toneOfVoice} 
                onChange={e => handleChange('toneOfVoice', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Grau de Formalidade</label>
              <select 
                className="filter-select" 
                style={{ width: '100%' }} 
                value={settings.formalGrade} 
                onChange={e => handleChange('formalGrade', e.target.value)}
              >
                <option value="formal">Alta Formalidade (Senhor/Senhora)</option>
                <option value="moderate">Moderado (Padrão corporativo amigável)</option>
                <option value="informal">Informal (Você/Emojis frequentes)</option>
              </select>
            </div>
          </div>

          {/* Regras e Limites */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
              Limites & Regras Comerciais
            </h3>

            <div className="form-group">
              <label>Desconto Máximo Autorizado (%)</label>
              <input 
                type="number" 
                className="form-control" 
                style={{ paddingLeft: '14px' }} 
                value={settings.maxDiscountAllowed} 
                onChange={e => handleChange('maxDiscountAllowed', Number(e.target.value))} 
              />
            </div>

            <div className="form-group">
              <label>Tamanho Máximo de Respostas (caracteres)</label>
              <input 
                type="number" 
                className="form-control" 
                style={{ paddingLeft: '14px' }} 
                value={settings.maxResponseLength} 
                onChange={e => handleChange('maxResponseLength', Number(e.target.value))} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Horário Inicial</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '14px' }} 
                  value={settings.startTime} 
                  onChange={e => handleChange('startTime', e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Horário Final</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '14px' }} 
                  value={settings.endTime} 
                  onChange={e => handleChange('endTime', e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group checkbox-group" style={{ marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="useEmojis" 
                checked={settings.useEmojis} 
                onChange={e => handleChange('useEmojis', e.target.checked)} 
              />
              <label htmlFor="useEmojis">Permitir uso de emojis nas conversas comerciais</label>
            </div>
          </div>

          {/* Textos de Mensagem */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
              Textos Operacionais
            </h3>

            <div className="form-group">
              <label>Mensagem de Saudação Inicial (use variáveis `{"{{nome}}"}` e `{"{{empresa}}"}`)</label>
              <textarea 
                className="form-control" 
                style={{ paddingLeft: '14px', height: '80px', resize: 'vertical' }} 
                value={settings.greeting} 
                onChange={e => handleChange('greeting', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Mensagem de Fora de Horário Comercial</label>
              <textarea 
                className="form-control" 
                style={{ paddingLeft: '14px', height: '80px', resize: 'vertical' }} 
                value={settings.outOfHoursMessage} 
                onChange={e => handleChange('outOfHoursMessage', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
