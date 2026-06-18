import React from 'react';
import { 
  Coins, Calendar, GitBranch, Database, BarChart3, 
  UserCheck, Plus, CheckCircle2, Clock, Play, HelpCircle
} from 'lucide-react';

export default function PlaceholderView({ viewId }) {
  
  const getHeaderInfo = () => {
    switch (viewId) {
      case 'opportunities':
        return {
          title: 'Pipeline de Oportunidades',
          description: 'Acompanhe as oportunidades ativas estruturadas no modelo Kanban.',
          icon: Coins,
          color: 'var(--primary)'
        };
      case 'agenda':
        return {
          title: 'Agenda & Visitas Técnicas',
          description: 'Visualize reuniões comerciais e visitas técnicas agendadas pelo Liporoni.',
          icon: Calendar,
          color: 'var(--warning)'
        };
      case 'automations':
        return {
          title: 'Automações & Gatilhos',
          description: 'Roteiros visuais de ação e decisão estruturados por fluxos condicionais.',
          icon: GitBranch,
          color: 'var(--primary)'
        };
      case 'knowledge':
        return {
          title: 'Base de Conhecimento',
          description: 'Documentos e manuais fornecidos ao Liporoni para responder às dúvidas dos leads.',
          icon: Database,
          color: 'var(--info)'
        };
      case 'reports':
        return {
          title: 'Relatórios & Exportações',
          description: 'Relatórios analíticos detalhados sobre o desempenho do robô e conversões.',
          icon: BarChart3,
          color: 'var(--success)'
        };
      case 'users':
        return {
          title: 'Gestão de Usuários & Níveis de Acesso',
          description: 'Administre credenciais, responsabilidades e permissões da equipe comercial.',
          icon: UserCheck,
          color: 'var(--danger)'
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
      case 'opportunities':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
            {/* Column 1 */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Prospecção Ativa</span>
                <span className="badge badge-primary">2</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tech Innovators</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Consultoria IA Comercial | R$ 5.000</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Oliveira & Associados</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Triagem e Atendimento | R$ 4.000</p>
                </div>
              </div>
            </div>
            {/* Column 2 */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ borderBottom: '2px solid var(--warning)', paddingBottom: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Proposta Enviada</span>
                <span className="badge badge-warning">1</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Indústria Metalúrgica Sul</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>WhatsApp API Oficial | R$ 4.788</p>
              </div>
            </div>
            {/* Column 3 */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ borderBottom: '2px solid var(--success)', paddingBottom: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fechamento Concluído</span>
                <span className="badge badge-success">1</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lins Consultórios</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Agendamento Automático | R$ 5.000</p>
              </div>
            </div>
          </div>
        );
      case 'agenda':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: '6px' }}>Reunião Demonstração</span>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Apresentação Comercial - Tech Innovators</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Responsável: Eduardo Santos | Horário: Amanhã às 14h00</p>
              </div>
              <span className="badge badge-info" style={{ alignSelf: 'center' }}>Agendado por Liporoni</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Visita Técnica</span>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Visita Física de Validação - Metalúrgica Sul</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Endereço: Curitiba/PR | Horário: 24/06 às 10h00</p>
              </div>
              <span className="badge badge-success" style={{ alignSelf: 'center' }}>Confirmada</span>
            </div>
          </div>
        );
      case 'automations':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
              <span className="badge badge-primary" style={{ marginBottom: '10px' }}>Fluxo Ativo</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Adicionar à Campanha Tech SP</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                <strong>Gatilho:</strong> Contato importado com a tag <code>Indústria</code>.<br />
                <strong>Ação:</strong> Adicionar automaticamente à lista de disparos.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
              <span className="badge badge-primary" style={{ marginBottom: '10px' }}>Fluxo Ativo</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Iniciar Qualificação Automática</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                <strong>Gatilho:</strong> Lead responde à mensagem de prospecção.<br />
                <strong>Ação:</strong> Liporoni assume e começa roteiro de triagem.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
              <span className="badge badge-warning" style={{ marginBottom: '10px' }}>Rascunho</span>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Notificar Scoring Alto</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                <strong>Gatilho:</strong> Contato ultrapassa 80 pontos no scoring.<br />
                <strong>Ação:</strong> Disparar e-mail e alerta no painel do consultor.
              </p>
            </div>
          </div>
        );
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
      case 'reports':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Fazer Download de Relatórios Consolidados</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>Exportar em PDF</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>Exportar em CSV (Excel)</button>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>Consolidado Trimestral</button>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff3366', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 700 }}>RL</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Dr. Roberto Liporoni</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@liporoni.com.br</p>
                </div>
              </div>
              <span className="badge badge-danger" style={{ alignSelf: 'center' }}>Administrador</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#33cc66', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 700 }}>MC</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mariana Costa</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>gestor@liporoni.com.br</p>
                </div>
              </div>
              <span className="badge badge-warning" style={{ alignSelf: 'center' }}>Gestor Comercial</span>
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
