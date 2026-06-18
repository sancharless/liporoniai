import React, { useState, useEffect } from 'react';
import { dbService, getDB } from '../services/db';
import {
  BarChart3, TrendingUp, Users, DollarSign, Award,
  Download, Printer, ArrowUp, ArrowDown, Minus, Calendar,
  RefreshCw
} from 'lucide-react';

/* ─── palettes ─────────────────────────────────────────── */
const NEON = { primary: '#00d2ff', success: '#00ff88', warning: '#ffbb00', danger: '#ff3366', info: '#4488ff' };

/* ─── helpers ─────────────────────────────────────────── */
function fmtBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
}

function calcConversion(contacts) {
  const total = contacts.length;
  const closed = contacts.filter(c => c.status === 'Venda Realizada').length;
  return total > 0 ? ((closed / total) * 100).toFixed(1) : '0.0';
}

/* ─── SVG Bar Chart ─────────────────────────────────────── */
function BarChartSVG({ data, colorKey = 'primary' }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const W = 520, H = 160, pad = { top: 10, bottom: 36, left: 10, right: 10 };
  const chartH = H - pad.top - pad.bottom;
  const barW = Math.floor((W - pad.left - pad.right) / data.length);
  const gap = Math.floor(barW * 0.28);
  const actualBarW = barW - gap;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON[colorKey]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={NEON[colorKey]} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
        <line key={i}
          x1={pad.left} y1={pad.top + chartH * (1 - pct)}
          x2={W - pad.right} y2={pad.top + chartH * (1 - pct)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = pad.left + i * barW + gap / 2;
        const y = pad.top + chartH - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={actualBarW} height={barH} rx="4" fill="url(#barGrad)" />
            <text x={x + actualBarW / 2} y={H - 18} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="Inter, sans-serif">{d.label}</text>
            <text x={x + actualBarW / 2} y={y - 5} textAnchor="middle" fill={NEON[colorKey]} fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── SVG Line Chart ─────────────────────────────────────── */
function LineChartSVG({ data }) {
  const W = 520, H = 160, pad = { top: 16, bottom: 36, left: 14, right: 14 };
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const stepX = chartW / (data.length - 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + chartH - (d.value / maxVal) * chartH,
    label: d.label, value: d.value
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${pad.top + chartH} L${points[0].x},${pad.top + chartH} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON.success} stopOpacity="0.25" />
          <stop offset="100%" stopColor={NEON.success} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
        <line key={i}
          x1={pad.left} y1={pad.top + chartH * (1 - pct)}
          x2={W - pad.right} y2={pad.top + chartH * (1 - pct)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <path d={areaD} fill="url(#lineArea)" />
      <path d={pathD} fill="none" stroke={NEON.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={NEON.success} stroke="#0a0a0f" strokeWidth="2" />
          <text x={p.x} y={H - 18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Inter, sans-serif">{p.label}</text>
          <text x={p.x} y={p.y - 10} textAnchor="middle" fill={NEON.success} fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">{p.value}</text>
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function ReportsView() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('Q2-2026');

  const loadData = () => {
    const db = getDB();
    const contacts = db.contacts || [];
    const proposals = db.proposals || [];
    const users = db.users || [];

    const accepted = proposals.filter(p => p.status === 'Aceita');
    const totalRevenue = accepted.reduce((sum, p) => {
      const v = parseFloat(String(p.total || p.totalValue || 0).replace(/[^\d.,]/g, '').replace(',', '.'));
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

    const scores = contacts.map(c => c.leadScore || 0).filter(s => s > 0);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(0) : 0;

    // Leads por status
    const statusCount = {};
    contacts.forEach(c => { statusCount[c.status] = (statusCount[c.status] || 0) + 1; });
    const barData = Object.entries(statusCount).map(([label, value]) => ({ label: label.split(' ')[0], value }));

    // Propostas por mês simuladas
    const lineData = [
      { label: 'Jan', value: 2 }, { label: 'Fev', value: 5 }, { label: 'Mar', value: 3 },
      { label: 'Abr', value: 7 }, { label: 'Mai', value: 4 }, { label: 'Jun', value: proposals.length }
    ];

    // Desempenho por usuário
    const sellerPerf = users.filter(u => u.role === 'seller' || u.role === 'manager').map(u => {
      const myContacts = contacts.filter(c => c.assignedTo === u.id || c.assignedTo === u.name);
      const myProposals = proposals.filter(p => p.userId === u.id);
      const myClosed = myContacts.filter(c => c.status === 'Venda Realizada').length;
      const myRevenue = myProposals.filter(p => p.status === 'Aceita').reduce((sum, p) => {
        const v = parseFloat(String(p.total || 0).replace(/[^\d.,]/g, '').replace(',', '.'));
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
      return { name: u.name, contacts: myContacts.length, proposals: myProposals.length, closed: myClosed, revenue: myRevenue };
    });

    setData({
      totalLeads: contacts.length,
      conversionRate: calcConversion(contacts),
      totalRevenue,
      avgScore,
      barData,
      lineData,
      sellerPerf,
      proposals: proposals.length,
      accepted: accepted.length
    });
  };

  useEffect(() => { loadData(); }, []);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Métrica', 'Valor'],
      ['Total de Leads', data.totalLeads],
      ['Taxa de Conversão (%)', data.conversionRate],
      ['Receita Propostas Aceitas', fmtBRL(data.totalRevenue)],
      ['Lead Score Médio', data.avgScore],
      ['Total de Propostas', data.proposals],
      ['Propostas Aceitas', data.accepted],
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `liporoni_relatorio_${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  if (!data) return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Carregando dados...</div>;

  const kpis = [
    { label: 'Total de Leads', value: data.totalLeads, icon: Users, color: NEON.primary, trend: '+12%', up: true },
    { label: 'Taxa de Conversão', value: `${data.conversionRate}%`, icon: TrendingUp, color: NEON.success, trend: '+3.2pp', up: true },
    { label: 'Receita Gerada', value: fmtBRL(data.totalRevenue), icon: DollarSign, color: NEON.warning, trend: '+8%', up: true },
    { label: 'Lead Score Médio', value: data.avgScore, icon: Award, color: NEON.danger, trend: '-2', up: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeInUp 0.4s ease' }} id="reports-printable">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(0,255,136,0.12)', padding: '12px', borderRadius: '14px', color: NEON.success }}>
            <BarChart3 size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Relatórios & Análises</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desempenho geral do CRM — período <strong style={{ color: 'var(--text-secondary)' }}>{period}</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            style={{ padding: '9px 14px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer' }}>
            <option value="Q1-2026">Q1 2026</option>
            <option value="Q2-2026">Q2 2026</option>
            <option value="2026">Ano 2026</option>
          </select>
          <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={exportCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem' }}>
            <Download size={14} /> Exportar CSV
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '0.82rem' }}>
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpis.map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* bg glow */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: k.color, opacity: 0.08, filter: 'blur(20px)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ background: `${k.color}18`, padding: '10px', borderRadius: '10px', color: k.color }}>
                <k.icon size={20} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: k.up ? NEON.success : NEON.danger, display: 'flex', alignItems: 'center', gap: '3px' }}>
                {k.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {k.trend}
              </span>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={15} style={{ color: NEON.primary }} /> Leads por Status Comercial
          </h3>
          <BarChartSVG data={data.barData.slice(0, 6)} colorKey="primary" />
        </div>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={15} style={{ color: NEON.success }} /> Propostas Geradas por Mês
          </h3>
          <LineChartSVG data={data.lineData} />
        </div>
      </div>

      {/* Seller performance table */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={15} style={{ color: NEON.warning }} /> Desempenho por Vendedor
        </h3>
        {data.sellerPerf.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {['Vendedor', 'Leads Atribuídos', 'Propostas', 'Vendas Fechadas', 'Conversão', 'Receita'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Vendedor' ? 'left' : 'center', fontWeight: 600, borderBottom: '1px solid var(--glass-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sellerPerf.map((s, idx) => {
                const conv = s.contacts > 0 ? ((s.closed / s.contacts) * 100).toFixed(0) : 0;
                return (
                  <tr key={s.name} style={{ borderBottom: idx < data.sellerPerf.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</td>
                    <td style={{ padding: '13px 14px', textAlign: 'center', fontSize: '0.88rem' }}>{s.contacts}</td>
                    <td style={{ padding: '13px 14px', textAlign: 'center', fontSize: '0.88rem' }}>{s.proposals}</td>
                    <td style={{ padding: '13px 14px', textAlign: 'center', fontSize: '0.88rem' }}>{s.closed}</td>
                    <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                      <span style={{ color: parseInt(conv) >= 30 ? NEON.success : parseInt(conv) >= 15 ? NEON.warning : NEON.danger, fontWeight: 700, fontSize: '0.88rem' }}>
                        {conv}%
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', textAlign: 'center', color: NEON.warning, fontWeight: 700, fontSize: '0.88rem' }}>
                      {fmtBRL(s.revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhum dado de desempenho disponível. Atribua contatos aos vendedores.
          </div>
        )}
      </div>

      {/* Additional stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Propostas Geradas', value: data.proposals, color: NEON.primary, sub: 'Total no período' },
          { label: 'Propostas Aceitas', value: data.accepted, color: NEON.success, sub: `${data.proposals > 0 ? ((data.accepted / data.proposals) * 100).toFixed(0) : 0}% de conversão` },
          { label: 'Propostas Pendentes', value: data.proposals - data.accepted, color: NEON.warning, sub: 'Aguardando resposta' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          #reports-printable { color: black !important; }
          .glass-panel { background: #f9f9f9 !important; border: 1px solid #ddd !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
