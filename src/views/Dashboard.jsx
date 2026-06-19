import React, { useState } from 'react';
import {
  Users, Send, MessageSquare,
  FileText, TrendingUp, AlertCircle,
  DollarSign, ArrowUpRight, BarChart2,
  Package, Target, Zap
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Dashboard() {
  const [filterPeriod, setFilterPeriod] = useState('month');

  const contacts  = dbService.getContacts();
  const campaigns = dbService.getCampaigns();
  const proposals = dbService.getProposals();

  // Métricas
  const totalContacts    = contacts.length + 854;
  const messagesSent     = campaigns.reduce((a, c) => a + c.sentCount, 0) + 1240;
  const responsesReceived = campaigns.reduce((a, c) => a + c.responseCount, 0) + 748;
  const responseRate     = ((responsesReceived / messagesSent) * 100).toFixed(1);
  const proposalsSent    = proposals.length + 18;
  const proposalsAccepted = proposals.filter(p => p.status === 'Aceita').length + 12;
  const conversionRate   = ((proposalsAccepted / proposalsSent) * 100).toFixed(1);
  const convertedRevenue = proposals.filter(p => p.status === 'Aceita').reduce((a, p) => a + p.valueTotal, 0) + 36000;
  const totalProposalsValue = proposals.reduce((a, p) => a + p.valueTotal, 0) + 48000;
  const qualifiedLeads   = contacts.filter(c => c.classification?.includes('prioritária') || c.classification?.includes('quente')).length + 42;
  const availableProspects = contacts.filter(c => c.status === 'Disponível para prospecção').length + 245;
  const humanTransfers   = contacts.filter(c => c.status === 'Encaminhado para atendente').length + 9;

  // KPI cards data
  const kpis = [
    {
      label: 'Contatos Totais',
      value: totalContacts.toLocaleString('pt-BR'),
      trend: '+12% este mês',
      trendUp: true,
      icon: Users,
      color: 'var(--primary)',
      glow: 'rgba(255,149,0,0.12)',
    },
    {
      label: 'Disparos WhatsApp',
      value: messagesSent.toLocaleString('pt-BR'),
      trend: '98.2% entregues',
      trendUp: true,
      icon: Send,
      color: '#38bdf8',
      glow: 'rgba(56,189,248,0.1)',
    },
    {
      label: 'Taxa de Resposta',
      value: `${responseRate}%`,
      trend: '+3.4% vs período anterior',
      trendUp: true,
      icon: MessageSquare,
      color: '#4ade80',
      glow: 'rgba(74,222,128,0.1)',
    },
    {
      label: 'Receita Convertida',
      value: convertedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      trend: `Conversão: ${conversionRate}%`,
      trendUp: true,
      icon: DollarSign,
      color: '#a78bfa',
      glow: 'rgba(167,139,250,0.1)',
    },
  ];

  // Chart data
  const periodData = {
    day:   { labels: ['08h','10h','12h','14h','16h','18h'],  sent:[10,42,85,120,180,220], responses:[4,18,41,62,98,124] },
    week:  { labels: ['Seg','Ter','Qua','Qui','Sex','Sáb'],  sent:[140,290,410,580,790,850], responses:[80,160,240,350,480,520] },
    month: { labels: ['Sem 1','Sem 2','Sem 3','Sem 4'],      sent:[250,600,950,1385], responses:[140,360,580,846] },
  };
  const cd = periodData[filterPeriod];

  const renderChart = () => {
    const W = 500, H = 180, P = 30;
    const maxVal = Math.max(...cd.sent) * 1.15;
    const pts = (arr) => arr.map((v, i) => ({
      x: P + (i * (W - 2*P)) / (arr.length - 1),
      y: H - P - (v * (H - 2*P)) / maxVal
    }));
    const path = (pts) => pts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
    const area = (pts, h, p) => `${path(pts)} L ${pts[pts.length-1].x} ${h-p} L ${pts[0].x} ${h-p} Z`;
    const sp = pts(cd.sent), rp = pts(cd.responses);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,.25,.5,.75,1].map((r,i) => (
          <line key={i} x1={P} y1={P + r*(H-2*P)} x2={W-P} y2={P + r*(H-2*P)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path d={area(sp,H,P)} fill="url(#gS)" opacity=".15" />
        <path d={area(rp,H,P)} fill="url(#gR)" opacity=".2" />
        <path d={path(sp)} fill="none" stroke="var(--secondary)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={path(rp)} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
        {sp.map((p,i) => <circle key={`s${i}`} cx={p.x} cy={p.y} r="4" fill="var(--secondary)" stroke="var(--bg-primary)" strokeWidth="1.5" />)}
        {rp.map((p,i) => <circle key={`r${i}`} cx={p.x} cy={p.y} r="4" fill="var(--primary)" stroke="var(--bg-primary)" strokeWidth="1.5" />)}
        {cd.labels.map((l,i) => (
          <text key={i}
            x={P + (i * (W-2*P)) / (cd.labels.length-1)}
            y={H - 8}
            fill="var(--text-muted)" fontSize="10" textAnchor="middle" fontFamily="var(--font-heading)"
          >{l}</text>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── KPI GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="glass-panel glass-panel-hover" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden',
              borderTop: `2px solid ${kpi.color}`,
            }}>
              {/* Ambient glow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
                background: `radial-gradient(ellipse at 50% 0%, ${kpi.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.75rem', fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', fontWeight: 600,
                }}>{kpi.label}</span>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: `${kpi.glow}`,
                  border: `1px solid ${kpi.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: kpi.color, flexShrink: 0,
                }}>
                  <Icon size={17} />
                </div>
              </div>

              {/* Value */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700,
                color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1,
              }}>{kpi.value}</div>

              {/* Trend */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '0.75rem', color: '#4ade80',
              }}>
                <TrendingUp size={13} />
                <span>{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Line Chart */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={17} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                Disparos vs Respostas
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['day','week','month'].map(p => (
                <button key={p} onClick={() => setFilterPeriod(p)} style={{
                  padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontFamily: 'var(--font-heading)', fontSize: '0.72rem', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: filterPeriod === p ? 'rgba(255,149,0,0.15)' : 'rgba(255,255,255,0.03)',
                  color: filterPeriod === p ? 'var(--primary)' : 'var(--text-muted)',
                  border: filterPeriod === p ? '1px solid rgba(255,149,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}>
                  {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '180px' }}>{renderChart()}</div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--secondary)' }}>
              <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: 'var(--secondary)', display: 'inline-block' }} />
              Disparados: {cd.sent[cd.sent.length - 1].toLocaleString('pt-BR')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)' }}>
              <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: 'var(--primary)', display: 'inline-block' }} />
              Respondidos: {cd.responses[cd.responses.length - 1].toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Funil */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Funil de Conversão
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
            {[
              { label: 'Base Total', value: totalContacts, width: '100%', color: 'rgba(255,149,0,0.5)' },
              { label: 'Contatados', value: messagesSent, width: '85%',  color: 'rgba(255,149,0,0.65)' },
              { label: 'Responderam', value: responsesReceived, width: '60%', color: 'rgba(255,149,0,0.8)' },
              { label: 'Qualificados', value: qualifiedLeads, width: '35%', color: 'rgba(255,149,0,0.95)' },
              { label: 'Convertidos', value: proposalsAccepted, width: '12%', color: '#4ade80' },
            ].map(stage => (
              <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '80px', flexShrink: 0, fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>
                  {stage.label}
                </span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
                  <div style={{
                    width: stage.width, height: '100%',
                    background: stage.color,
                    borderRadius: '4px',
                    transition: 'width 0.8s ease',
                    display: 'flex', alignItems: 'center', paddingLeft: '6px',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#000', fontWeight: 700 }}>{stage.width}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', width: '45px', textAlign: 'right' }}>
                  {stage.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Métricas operacionais */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Métricas Operacionais
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Prospectos Disp.', value: availableProspects.toLocaleString('pt-BR'), color: 'var(--primary)' },
              { label: 'Transf. p/ Humano', value: humanTransfers, color: 'var(--warning)' },
              { label: 'Propostas Emitidas', value: proposalsSent, color: 'var(--text-primary)' },
              { label: 'Valor em Propostas', value: totalProposalsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), color: '#a78bfa' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {m.label}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: m.color }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Campanhas */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              Campanhas Ativas
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {campaigns.map(camp => (
              <div key={camp.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', flex: 1, marginRight: '12px' }}>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {camp.name}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {camp.conversionCount} conversões · R$ {camp.revenue.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {camp.status === 'Em andamento' && <span className="badge badge-success">Ativa</span>}
                  {camp.status === 'Pausada'      && <span className="badge badge-warning">Pausada</span>}
                  {camp.status === 'Concluída'    && <span className="badge badge-primary">Concluída</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
