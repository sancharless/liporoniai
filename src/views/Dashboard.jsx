import React, { useState } from 'react';
import { 
  Users, Send, MessageSquare, ShieldCheck, 
  FileText, CheckCircle, TrendingUp, AlertCircle, 
  DollarSign, ArrowUpRight, BarChart2, Calendar, ShieldAlert
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Dashboard() {
  const [filterPeriod, setFilterPeriod] = useState('month'); // day, week, month

  // Carregar dados simulados para gerar métricas
  const contacts = dbService.getContacts();
  const campaigns = dbService.getCampaigns();
  const proposals = dbService.getProposals();

  // Calcular métricas
  const totalContacts = contacts.length + 854; // Mock de base maior histórica
  const availableProspects = contacts.filter(c => c.status === 'Disponível para prospecção').length + 245;
  const messagesSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0) + 1240;
  const messagesDelivered = campaigns.reduce((acc, c) => acc + c.deliveredCount, 0) + 1210;
  const responsesReceived = campaigns.reduce((acc, c) => acc + c.responseCount, 0) + 748;
  const responseRate = ((responsesReceived / messagesSent) * 100).toFixed(1);

  const qualifiedLeads = contacts.filter(c => c.classification === 'Lead qualificado' || c.classification === 'Oportunidade prioritária').length + 42;
  const proposalsSent = proposals.length + 18;
  const proposalsAccepted = proposals.filter(p => p.status === 'Aceita').length + 12;
  const conversionRate = ((proposalsAccepted / proposalsSent) * 100).toFixed(1);

  const totalProposalsValue = proposals.reduce((acc, p) => acc + p.valueTotal, 0) + 48000;
  const convertedRevenue = proposals.filter(p => p.status === 'Aceita').reduce((acc, p) => acc + p.valueTotal, 0) + 36000;

  const humanTransfers = contacts.filter(c => c.status === 'Encaminhado para atendente').length + 9;

  // Relação de dados por período para o gráfico de linha SVG
  const periodData = {
    day: {
      labels: ['08h', '10h', '12h', '14h', '16h', '18h'],
      sent: [10, 42, 85, 120, 180, 220],
      responses: [4, 18, 41, 62, 98, 124]
    },
    week: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      sent: [140, 290, 410, 580, 790, 850],
      responses: [80, 160, 240, 350, 480, 520]
    },
    month: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      sent: [250, 600, 950, 1385],
      responses: [140, 360, 580, 846]
    }
  };

  const currentChartData = periodData[filterPeriod];

  // Renderizar o gráfico de linhas via SVG dinâmico
  const renderLineChart = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    
    const maxVal = Math.max(...currentChartData.sent) * 1.1;
    
    // Mapear pontos
    const getPoints = (dataArray) => {
      return dataArray.map((val, index) => {
        const x = padding + (index * (width - 2 * padding)) / (dataArray.length - 1);
        const y = height - padding - (val * (height - 2 * padding)) / maxVal;
        return { x, y };
      });
    };

    const sentPoints = getPoints(currentChartData.sent);
    const respPoints = getPoints(currentChartData.responses);

    const makePath = (points) => {
      if (points.length === 0) return '';
      return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    };

    const makeAreaPath = (points) => {
      if (points.length === 0) return '';
      const path = makePath(points);
      return `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart-container" style={{ width: '100%', height: '100%' }}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          return (
            <line 
              key={i} 
              x1={padding} 
              y1={y} 
              x2={width - padding} 
              y2={y} 
              stroke="rgba(255, 255, 255, 0.04)" 
              strokeWidth={1} 
            />
          );
        })}

        {/* Areas */}
        <path d={makeAreaPath(sentPoints)} fill="url(#sentGlow)" opacity={0.15} />
        <path d={makeAreaPath(respPoints)} fill="url(#respGlow)" opacity={0.2} />

        {/* Lines */}
        <path d={makePath(sentPoints)} fill="none" stroke="var(--secondary)" strokeWidth={2.5} className="svg-chart-lines" />
        <path d={makePath(respPoints)} fill="none" stroke="var(--primary)" strokeWidth={2.5} className="svg-chart-lines" />

        {/* Points */}
        {sentPoints.map((p, i) => (
          <circle key={`sent-${i}`} cx={p.x} cy={p.y} r={4} fill="var(--secondary)" stroke="var(--bg-secondary)" strokeWidth={1} />
        ))}
        {respPoints.map((p, i) => (
          <circle key={`resp-${i}`} cx={p.x} cy={p.y} r={4} fill="var(--primary)" stroke="var(--bg-secondary)" strokeWidth={1} />
        ))}

        {/* Labels X */}
        {currentChartData.labels.map((lbl, index) => {
          const x = padding + (index * (width - 2 * padding)) / (currentChartData.labels.length - 1);
          return (
            <text 
              key={index} 
              x={x} 
              y={height - 10} 
              fill="var(--text-muted)" 
              fontSize={10} 
              textAnchor="middle"
              fontFamily="var(--font-heading)"
            >
              {lbl}
            </text>
          );
        })}

        {/* Defs para Gradientes */}
        <defs>
          <linearGradient id="sentGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="respGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="dashboard-grid">
      {/* KPI GRID */}
      <div className="kpi-container">
        {/* KPI 1 */}
        <div className="kpi-card glass-panel">
          <div className="kpi-glow"></div>
          <div className="kpi-card-header primary">
            <span>Contatos Totais</span>
            <div className="kpi-icon-wrapper">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalContacts}</div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14} />
            <span>+12% este mês</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card glass-panel">
          <div className="kpi-glow"></div>
          <div className="kpi-card-header primary">
            <span>Disparos WhatsApp</span>
            <div className="kpi-icon-wrapper">
              <Send size={18} />
            </div>
          </div>
          <div className="kpi-value">{messagesSent}</div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14} />
            <span>98.2% entregues</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card glass-panel">
          <div className="kpi-glow"></div>
          <div className="kpi-card-header success">
            <span>Taxa de Resposta</span>
            <div className="kpi-icon-wrapper">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="kpi-value">{responseRate}%</div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14} />
            <span>+3.4% vs média anterior</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card glass-panel">
          <div className="kpi-glow"></div>
          <div className="kpi-card-header success">
            <span>Faturamento Convertido</span>
            <div className="kpi-icon-wrapper">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {convertedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="kpi-trend trend-up">
            <ArrowUpRight size={14} />
            <span>Conversão: {conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="charts-row-1">
        {/* Line Chart */}
        <div className="chart-card glass-panel">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} className="glow-text-blue" />
              <h3>Desempenho de Disparos e Respostas</h3>
            </div>
            <div className="chart-filters">
              <button 
                className={`chart-filter-btn ${filterPeriod === 'day' ? 'active' : ''}`}
                onClick={() => setFilterPeriod('day')}
              >
                Hoje
              </button>
              <button 
                className={`chart-filter-btn ${filterPeriod === 'week' ? 'active' : ''}`}
                onClick={() => setFilterPeriod('week')}
              >
                Semana
              </button>
              <button 
                className={`chart-filter-btn ${filterPeriod === 'month' ? 'active' : ''}`}
                onClick={() => setFilterPeriod('month')}
              >
                Mês
              </button>
            </div>
          </div>
          <div className="chart-content">
            {renderLineChart()}
            <div className="chart-tooltip-sim">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary)' }}>
                ● Disparados: {currentChartData.sent[currentChartData.sent.length - 1]}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                ● Respondidos: {currentChartData.responses[currentChartData.responses.length - 1]}
              </span>
            </div>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="chart-card glass-panel">
          <div className="chart-header">
            <h3>Funil de Qualificação</h3>
          </div>
          <div className="funnel-container">
            <div className="funnel-stage">
              <span className="funnel-label">Base</span>
              <div className="funnel-bar" style={{ width: '100%' }}>100%</div>
              <span className="funnel-value">{totalContacts}</span>
            </div>
            <div className="funnel-stage">
              <span className="funnel-label">Contatados</span>
              <div className="funnel-bar" style={{ width: '85%' }}>85%</div>
              <span className="funnel-value">{messagesSent}</span>
            </div>
            <div className="funnel-stage">
              <span className="funnel-label">Respondidos</span>
              <div className="funnel-bar" style={{ width: '60%' }}>60%</div>
              <span className="funnel-value">{responsesReceived}</span>
            </div>
            <div className="funnel-stage">
              <span className="funnel-label">Qualificados</span>
              <div className="funnel-bar" style={{ width: '35%' }}>35%</div>
              <span className="funnel-value">{qualifiedLeads}</span>
            </div>
            <div className="funnel-stage">
              <span className="funnel-label">Ganhos</span>
              <div className="funnel-bar" style={{ width: '12%', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }}>12%</div>
              <span className="funnel-value">{proposalsAccepted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY METRICS / STATS BOX */}
      <div className="charts-row-1" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* KPI List Panel */}
        <div className="chart-card glass-panel">
          <div className="chart-header">
            <h3>Métricas Operacionais</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contatos Disponíveis</p>
              <h4 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginTop: '4px' }}>{availableProspects}</h4>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transf. p/ Humanos</p>
              <h4 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--warning)', marginTop: '4px' }}>{humanTransfers}</h4>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Propostas Emitidas</p>
              <h4 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '4px' }}>{proposalsSent}</h4>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Valor em Propostas</p>
              <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalProposalsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </h4>
            </div>
          </div>
        </div>

        {/* Campanha Status Grid */}
        <div className="chart-card glass-panel">
          <div className="chart-header">
            <h3>Status das Campanhas Ativas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaigns.map(camp => (
              <div 
                key={camp.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px' 
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{camp.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conversões: {camp.conversionCount} | Receita: R$ {camp.revenue.toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  {camp.status === 'Em andamento' && <span className="badge badge-success">Ativa</span>}
                  {camp.status === 'Pausada' && <span className="badge badge-warning">Pausada</span>}
                  {camp.status === 'Concluída' && <span className="badge badge-primary">Concluída</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
