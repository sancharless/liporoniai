import React, { useState, useEffect, useRef } from 'react';
import { dbService, logAuditEvent } from '../services/db';
import {
  Coins, Plus, X, ChevronRight, ChevronLeft,
  Edit3, Trash2, Calendar, User, Building2,
  DollarSign, TrendingUp, Target, Award,
  AlertCircle, CheckCircle2, Clock, Zap
} from 'lucide-react';

/* ─── column config ─────────────────────────────────────── */
const STAGES = [
  {
    id: 'prospecting',
    label: 'Prospecção',
    color: '#00d2ff',
    bg: 'rgba(0,210,255,0.08)',
    border: 'rgba(0,210,255,0.3)',
    icon: Zap,
    probability: '10–40%'
  },
  {
    id: 'proposal',
    label: 'Proposta Enviada',
    color: '#ffbb00',
    bg: 'rgba(255,187,0,0.08)',
    border: 'rgba(255,187,0,0.3)',
    icon: Target,
    probability: '40–70%'
  },
  {
    id: 'negotiation',
    label: 'Negociação',
    color: '#ff8844',
    bg: 'rgba(255,136,68,0.08)',
    border: 'rgba(255,136,68,0.3)',
    icon: TrendingUp,
    probability: '60–90%'
  },
  {
    id: 'closed_won',
    label: 'Fechamento',
    color: '#00ff88',
    bg: 'rgba(0,255,136,0.08)',
    border: 'rgba(0,255,136,0.3)',
    icon: CheckCircle2,
    probability: '100%'
  },
];

const STAGE_ORDER = STAGES.map(s => s.id);

function fmtBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function emptyOpp() {
  return {
    id: null,
    title: '',
    contactName: '',
    company: '',
    value: '',
    stage: 'prospecting',
    probability: 30,
    ownerName: 'Eduardo Santos',
    closeDate: '',
    notes: '',
  };
}

/* ─── drag state (ref-based, no re-render) ──────────────── */
let dragItem = null;

/* ═══════════════════════════════════════════════════════ */
export default function OpportunitiesView() {
  const [opps, setOpps] = useState([]);
  const [selected, setSelected] = useState(null); // detail panel
  const [showModal, setShowModal] = useState(false);
  const [editOpp, setEditOpp] = useState(emptyOpp());
  const [dragOver, setDragOver] = useState(null);

  const load = () => setOpps(dbService.getOpportunities());

  useEffect(() => { load(); }, []);

  /* ── helpers ─────────────────────────────────────────────── */
  const columnOpps = (stageId) => opps.filter(o => o.stage === stageId);

  const totalPipeline = opps
    .filter(o => o.stage !== 'closed_won')
    .reduce((s, o) => s + (Number(o.value) || 0), 0);

  const totalClosed = opps
    .filter(o => o.stage === 'closed_won')
    .reduce((s, o) => s + (Number(o.value) || 0), 0);

  const convRate = opps.length > 0
    ? ((opps.filter(o => o.stage === 'closed_won').length / opps.length) * 100).toFixed(0)
    : 0;

  /* ── move card one step left/right ─────────────────────── */
  const moveCard = (oppId, direction) => {
    const opp = opps.find(o => o.id === oppId);
    if (!opp) return;
    const cur = STAGE_ORDER.indexOf(opp.stage);
    const next = cur + direction;
    if (next < 0 || next >= STAGE_ORDER.length) return;
    const newStage = STAGE_ORDER[next];
    dbService.moveOpportunity(oppId, newStage);
    logAuditEvent({
      userId: 'usr_1', userName: 'Dr. Roberto Liporoni',
      action: 'Mover Oportunidade', module: 'Pipeline',
      detail: `"${opp.title}" movida para ${STAGES.find(s => s.id === newStage)?.label}.`
    });
    load();
    if (selected?.id === oppId) setSelected({ ...opp, stage: newStage });
  };

  /* ── drag & drop ────────────────────────────────────────── */
  const handleDragStart = (opp) => { dragItem = opp; };
  const handleDragOver = (e, stageId) => { e.preventDefault(); setDragOver(stageId); };
  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (!dragItem || dragItem.stage === stageId) { setDragOver(null); return; }
    dbService.moveOpportunity(dragItem.id, stageId);
    logAuditEvent({
      userId: 'usr_1', userName: 'Dr. Roberto Liporoni',
      action: 'Mover Oportunidade', module: 'Pipeline',
      detail: `"${dragItem.title}" movida para ${STAGES.find(s => s.id === stageId)?.label}.`
    });
    dragItem = null;
    setDragOver(null);
    load();
  };
  const handleDragEnd = () => { dragItem = null; setDragOver(null); };

  /* ── save / delete ──────────────────────────────────────── */
  const handleSave = () => {
    if (!editOpp.title.trim()) return;
    const saved = dbService.saveOpportunity({ ...editOpp, value: Number(editOpp.value) || 0 });
    logAuditEvent({
      userId: 'usr_1', userName: 'Dr. Roberto Liporoni',
      action: editOpp.id ? 'Editar Oportunidade' : 'Criar Oportunidade',
      module: 'Pipeline',
      detail: `${editOpp.id ? 'Oportunidade' : 'Nova oportunidade'} "${editOpp.title}" — ${fmtBRL(editOpp.value)}.`
    });
    setShowModal(false);
    setEditOpp(emptyOpp());
    load();
  };

  const handleDelete = (id) => {
    const opp = opps.find(o => o.id === id);
    if (!opp) return;
    dbService.deleteOpportunity(id);
    logAuditEvent({ userId: 'usr_1', userName: 'Dr. Roberto Liporoni', action: 'Excluir Oportunidade', module: 'Pipeline', detail: `"${opp.title}" removida do pipeline.` });
    if (selected?.id === id) setSelected(null);
    load();
  };

  const handleEdit = (opp) => {
    setEditOpp({ ...opp, value: String(opp.value) });
    setShowModal(true);
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', animation: 'fadeInUp 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(0,210,255,0.12)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}>
            <Coins size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Pipeline de Oportunidades</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acompanhe e mova deals pelo funil comercial em tempo real.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditOpp(emptyOpp()); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Nova Oportunidade
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Total em Pipeline', value: fmtBRL(totalPipeline), icon: DollarSign, color: '#00d2ff', sub: `${opps.filter(o => o.stage !== 'closed_won').length} oportunidades` },
          { label: 'Receita Fechada', value: fmtBRL(totalClosed), icon: Award, color: '#00ff88', sub: `${opps.filter(o => o.stage === 'closed_won').length} deals ganhos` },
          { label: 'Taxa de Conversão', value: `${convRate}%`, icon: TrendingUp, color: '#ffbb00', sub: 'Prospecção → Fechamento' },
          { label: 'Ticket Médio', value: fmtBRL(opps.length > 0 ? opps.reduce((s, o) => s + (Number(o.value) || 0), 0) / opps.length : 0), icon: Target, color: '#ff8844', sub: 'Média por oportunidade' },
        ].map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', width: '60px', height: '60px', borderRadius: '50%', background: k.color, opacity: 0.09, filter: 'blur(14px)' }} />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: `${k.color}18`, padding: '8px', borderRadius: '10px', color: k.color, flexShrink: 0 }}>
                <k.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>{k.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{k.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban + detail panel */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>

        {/* Kanban board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flex: 1, alignItems: 'start' }}>
          {STAGES.map(stage => {
            const cards = columnOpps(stage.id);
            const stageTotal = cards.reduce((s, o) => s + (Number(o.value) || 0), 0);
            const isDropTarget = dragOver === stage.id;

            return (
              <div key={stage.id}
                onDragOver={e => handleDragOver(e, stage.id)}
                onDrop={e => handleDrop(e, stage.id)}
                onDragLeave={() => setDragOver(null)}
                style={{
                  background: isDropTarget ? stage.bg : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${isDropTarget ? stage.color : 'var(--glass-border)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: isDropTarget ? `0 0 20px ${stage.color}22` : 'none'
                }}>
                {/* Column header */}
                <div style={{ padding: '14px 16px', borderBottom: `2px solid ${stage.color}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: stage.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <stage.icon size={14} style={{ color: stage.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stage.color }}>{stage.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${stage.color}20`, color: stage.color, padding: '2px 8px', borderRadius: '20px' }}>
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Column total */}
                <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {fmtBRL(stageTotal)} · {stage.probability}
                </div>

                {/* Cards */}
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '80px' }}>
                  {cards.map(opp => {
                    const stageIdx = STAGE_ORDER.indexOf(opp.stage);
                    const canLeft = stageIdx > 0;
                    const canRight = stageIdx < STAGE_ORDER.length - 1;
                    const isSelected = selected?.id === opp.id;

                    return (
                      <div key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelected(isSelected ? null : opp)}
                        style={{
                          background: isSelected ? `${stage.color}12` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? stage.color : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? `0 0 14px ${stage.color}22` : 'none',
                        }}>

                        {/* Card title */}
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px', lineHeight: 1.3 }}>{opp.title}</div>

                        {/* Company */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          <Building2 size={11} /> {opp.company}
                        </div>

                        {/* Value + probability */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: stage.color }}>{fmtBRL(opp.value)}</span>
                          <span style={{ fontSize: '0.68rem', background: `${stage.color}18`, color: stage.color, padding: '2px 7px', borderRadius: '20px', fontWeight: 700 }}>
                            {opp.probability}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${opp.probability}%`, background: stage.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                        </div>

                        {/* Owner + date */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={10} /> {opp.ownerName.split(' ')[0]}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={10} /> {fmtDate(opp.closeDate)}
                          </span>
                        </div>

                        {/* Move + action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={e => { e.stopPropagation(); moveCard(opp.id, -1); }} disabled={!canLeft}
                              title="Mover para estágio anterior"
                              style={{ background: canLeft ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', color: canLeft ? 'var(--text-secondary)' : 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 6px', cursor: canLeft ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                              <ChevronLeft size={12} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); moveCard(opp.id, 1); }} disabled={!canRight}
                              title="Avançar estágio"
                              style={{ background: canRight ? `${stage.color}18` : 'transparent', border: 'none', color: canRight ? stage.color : 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 6px', cursor: canRight ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={e => { e.stopPropagation(); handleEdit(opp); }}
                              style={{ background: 'rgba(0,210,255,0.1)', border: 'none', color: 'var(--primary)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer' }}>
                              <Edit3 size={11} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDelete(opp.id); }}
                              style={{ background: 'rgba(255,51,102,0.1)', border: 'none', color: 'var(--danger)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer' }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {cards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 12px', color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>
                      <AlertCircle size={20} style={{ margin: '0 auto 6px', display: 'block', opacity: 0.4 }} />
                      Sem oportunidades
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const stage = STAGES.find(s => s.id === selected.stage) || STAGES[0];
          const current = opps.find(o => o.id === selected.id) || selected;
          return (
            <div className="glass-panel" style={{ width: '280px', flexShrink: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInUp 0.2s ease', borderLeft: `2px solid ${stage.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: stage.color, background: stage.bg, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${stage.border}` }}>
                  {stage.label}
                </span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px' }}>{current.title}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Building2 size={12} /> {current.company}
                </div>
              </div>

              <div style={{ background: stage.bg, borderRadius: '10px', padding: '14px', textAlign: 'center', border: `1px solid ${stage.border}` }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stage.color }}>{fmtBRL(current.value)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Valor estimado</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Contato', value: current.contactName, icon: User },
                  { label: 'Responsável', value: current.ownerName, icon: User },
                  { label: 'Previsão de Fechamento', value: fmtDate(current.closeDate), icon: Calendar },
                  { label: 'Probabilidade', value: `${current.probability}%`, icon: TrendingUp },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '7px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <f.icon size={12} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, marginTop: '1px' }}>{f.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Probability bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  <span>Progresso</span><span>{current.probability}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${current.probability}%`, background: `linear-gradient(90deg, ${stage.color}88, ${stage.color})`, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {current.notes && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>Observações</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{current.notes}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button className="btn btn-secondary" onClick={() => handleEdit(current)} style={{ flex: 1, fontSize: '0.8rem', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <Edit3 size={13} /> Editar
                </button>
                <button onClick={() => handleDelete(current.id)} style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.2)', color: 'var(--danger)', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── MODAL: Create/Edit ─────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', animation: 'fadeInUp 0.2s ease' }}>
          <div className="glass-panel" style={{ width: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
              {editOpp.id ? 'Editar Oportunidade' : 'Nova Oportunidade'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Título da Oportunidade *</label>
                <input value={editOpp.title} onChange={e => setEditOpp(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Consultoria IA Comercial"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              </div>

              {/* Company + Contact side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Empresa</label>
                  <input value={editOpp.company} onChange={e => setEditOpp(p => ({ ...p, company: e.target.value }))}
                    placeholder="Nome da empresa"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Contato</label>
                  <input value={editOpp.contactName} onChange={e => setEditOpp(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="Nome do contato"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Value + Stage side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Valor (R$)</label>
                  <input type="number" value={editOpp.value} onChange={e => setEditOpp(p => ({ ...p, value: e.target.value }))}
                    placeholder="0"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Estágio</label>
                  <select value={editOpp.stage} onChange={e => setEditOpp(p => ({ ...p, stage: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', boxSizing: 'border-box' }}>
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Probability */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Probabilidade de Fechamento: <strong style={{ color: 'var(--primary)' }}>{editOpp.probability}%</strong>
                </label>
                <input type="range" min="0" max="100" step="5" value={editOpp.probability}
                  onChange={e => setEditOpp(p => ({ ...p, probability: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
              </div>

              {/* Owner + Date side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Responsável</label>
                  <input value={editOpp.ownerName} onChange={e => setEditOpp(p => ({ ...p, ownerName: e.target.value }))}
                    placeholder="Nome do responsável"
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Previsão de Fechamento</label>
                  <input type="date" value={editOpp.closeDate} onChange={e => setEditOpp(p => ({ ...p, closeDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', colorScheme: 'dark', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Observações</label>
                <textarea value={editOpp.notes} onChange={e => setEditOpp(p => ({ ...p, notes: e.target.value }))}
                  rows={3} placeholder="Contexto, próximos passos, objeções…"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={14} /> {editOpp.id ? 'Salvar Alterações' : 'Criar Oportunidade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
