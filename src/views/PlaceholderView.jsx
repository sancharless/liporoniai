import React from 'react';
import { 
  Database, HelpCircle
} from 'lucide-react';

export default function PlaceholderView({ viewId }) {
  
  const getHeaderInfo = () => {
    switch (viewId) {
      case 'knowledge':
        return {
          title: 'Base de Conhecimento',
          description: 'Documentos e manuais fornecidos ao Liporoni para responder às dúvidas dos leads.',
          icon: Database,
          color: 'var(--info)'
        };
      default:
        return {
          title: 'Módulo em Desenvolvimento',
          description: 'Este recurso está sendo preparado para a próxima etapa.',
          icon: HelpCircle,
          color: 'var(--text-muted)'
        };
    }
  };

  const info = getHeaderInfo();
  const Icon = info.icon;

  const renderContent = () => {
    switch (viewId) {
      case 'knowledge':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Manual Institucional Liporoni.pdf</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tamanho: 4.2 MB | Última atualização: 15/06/2026</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Contém informações sobre fundação, sócios e diferencial de mercado.</p>
              <span className="badge badge-success" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Treinado</span>
            </div>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Perguntas Frequentes Vendas.xlsx</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tamanho: 820 KB | Última atualização: 18/06/2026</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Lista de dúvidas frequentes sobre parcelamento e descontos.</p>
              <span className="badge badge-success" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>Treinado</span>
            </div>
          </div>
        );
      default:
        return <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Módulo em implantação.</p>;
    }
  };

  return (
    <div className="table-card glass-panel" style={{ padding: '30px' }}>
      <div className="view-header-row" style={{ marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '10px', borderRadius: '12px', color: info.color }}>
            <Icon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>{info.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{info.description}</p>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
