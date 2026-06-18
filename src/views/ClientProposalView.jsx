import React, { useState, useEffect } from 'react';
import { 
  FileText, Check, X, Printer, AlertTriangle, Calendar, Building, 
  User, DollarSign, Clock, ArrowLeft, CheckCircle2, ThumbsUp, 
  ThumbsDown, Edit3, Shield, Info, CreditCard
} from 'lucide-react';
import { dbService } from '../services/db';

export default function ClientProposalView({ proposalId, onBackToDashboard }) {
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'accept', 'adjust', 'refuse'
  
  // Interactive form states
  const [signerName, setSignerName] = useState('');
  const [signerDoc, setSignerDoc] = useState('');
  const [consentCheck, setConsentCheck] = useState(false);
  const [adjustComments, setAdjustComments] = useState('');
  const [refuseReason, setRefuseReason] = useState('Preço elevado');
  const [refuseComments, setRefuseComments] = useState('');

  // Fetch proposal data
  useEffect(() => {
    loadProposal();
  }, [proposalId]);

  const loadProposal = () => {
    if (!proposalId) {
      setError('ID de proposta ausente.');
      return;
    }
    const prop = dbService.getProposalById(proposalId);
    if (!prop) {
      setError('Proposta comercial não localizada ou link inválido.');
      return;
    }
    
    // Register visual count increment on initial client load
    if (prop.status !== 'Rascunho' && !window.hasCountedView) {
      prop.viewCount = (prop.viewCount || 0) + 1;
      prop.lastViewedAt = new Date().toISOString();
      dbService.saveProposal(prop);
      window.hasCountedView = true;
    }

    setProposal(prop);
  };

  if (error) {
    return (
      <div className="login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="login-glow-1"></div>
        <div className="login-glow-2"></div>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: 700 }}>Proposta Inacessível</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>{error}</p>
          {onBackToDashboard ? (
            <button className="btn btn-secondary" onClick={onBackToDashboard}>
              <ArrowLeft size={16} />
              <span>Voltar ao CRM</span>
            </button>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por favor, entre em contato com seu gestor comercial da Liporoni.</p>
          )}
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Se a proposta for RASCUNHO e o cliente tentar ver (sem estar logado)
  const isUserLoggedIn = !!onBackToDashboard;
  if (proposal.status === 'Rascunho' && !isUserLoggedIn) {
    return (
      <div className="login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="login-glow-1"></div>
        <div className="login-glow-2"></div>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <Clock size={48} style={{ color: 'var(--warning)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', fontWeight: 700 }}>Proposta em Aprovação</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Esta proposta comercial está sendo revisada pela nossa diretoria e ainda não foi liberada para o cliente. Aguarde a notificação de envio.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Código de referência: {proposal.proposalNumber}</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptSubmit = (e) => {
    e.preventDefault();
    if (!signerName || !signerDoc) {
      alert('Nome completo e documento são obrigatórios para a assinatura digital.');
      return;
    }
    if (!consentCheck) {
      alert('Você precisa aceitar os termos da proposta para prosseguir.');
      return;
    }

    dbService.updateProposalStatus(proposal.id, 'Aceita', {
      signerName,
      signerDoc
    });
    
    setActiveModal(null);
    loadProposal();
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustComments.trim()) {
      alert('Descreva quais ajustes você deseja solicitar.');
      return;
    }

    dbService.updateProposalStatus(proposal.id, 'Ajuste solicitado', {
      comments: adjustComments
    });

    setActiveModal(null);
    loadProposal();
  };

  const handleRefuseSubmit = (e) => {
    e.preventDefault();
    
    dbService.updateProposalStatus(proposal.id, 'Recusada', {
      reason: refuseReason,
      comments: refuseComments
    });

    setActiveModal(null);
    loadProposal();
  };

  // Check if validity date is in the past
  const isExpired = new Date(proposal.validUntil) < new Date() && proposal.status === 'Enviada';

  // Format dynamic fields (split list points by lines)
  const formatListPoints = (text) => {
    if (!text) return [];
    return text.split('\n').map(p => p.trim()).filter(Boolean);
  };

  return (
    <div className="proposal-view-container" style={{ minHeight: '100vh', padding: '40px 20px', position: 'relative', overflowY: 'auto' }}>
      
      {/* Dynamic inline printable style overrides */}
      <style>{`
        @media print {
          body, .proposal-view-container {
            background: #ffffff !important;
            color: #111827 !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          .glass-panel {
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            color: #111827 !important;
            border-radius: 8px !important;
            padding: 24px !important;
            margin-bottom: 20px !important;
          }
          .glow-text-blue, .logo-accent {
            color: #0066ff !important;
            text-shadow: none !important;
          }
          .print-light-card {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            color: #111827 !important;
          }
          .badge-primary, .badge-success, .badge-warning, .badge-danger {
            border: 1px solid #374151 !important;
            color: #111827 !important;
            background: transparent !important;
          }
          h1, h2, h3, h4, span, p, strong {
            color: #111827 !important;
          }
        }
      `}</style>

      {/* Glow effects (no print) */}
      <div className="login-glow-1 no-print"></div>
      <div className="login-glow-2 no-print"></div>

      {/* TOP FLOATING NOTIFICATION / LOGGED-IN CONTROLS */}
      {isUserLoggedIn && (
        <div className="no-print glass-panel" style={{ maxWidth: '900px', margin: '0 auto 20px auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0, 210, 255, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} className="glow-text-blue" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Visualização de Administrador (CRM)</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }} onClick={onBackToDashboard}>
            <ArrowLeft size={14} />
            <span>Voltar ao CRM</span>
          </button>
        </div>
      )}

      {/* MAIN PROPOSAL AREA */}
      <div className="proposal-card glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '30px', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div className="logo-icon-wrapper" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <FileText size={16} />
              </div>
              <span className="logo-text" style={{ fontSize: '1.15rem' }}>Liporoni<span className="logo-accent">.ai</span></span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soluções inteligentes de automação e vendas</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PROPOSTA COMERCIAL</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>Nº {proposal.proposalNumber}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <span className={`badge badge-primary`}>Versão 1.0</span>
              {proposal.status === 'Aceita' && <span className="badge badge-success">Assinada / Fechada</span>}
              {proposal.status === 'Recusada' && <span className="badge badge-danger">Recusada</span>}
              {proposal.status === 'Em ajuste' && <span className="badge badge-warning">Em Negociação</span>}
              {proposal.status === 'Enviada' && !isExpired && <span className="badge badge-info">Aguardando Decisão</span>}
              {isExpired && <span className="badge badge-danger">Expirada</span>}
            </div>
          </div>
        </div>

        {/* PROPOSAL METADATA: ISSUANCE, VALIDITY & CLIENT DETAILS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }} className="print-light-card">
          
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados do Cliente</span>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={14} className="icon-info" />
                <strong style={{ color: 'var(--text-primary)' }}>{proposal.clientCompany}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} className="icon-info" />
                <span>{proposal.clientContactName}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cronograma & Validade</span>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} className="glow-text-blue" />
                <span>Emissão: {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isExpired ? 'var(--danger)' : 'inherit' }}>
                <Clock size={14} className={isExpired ? 'icon-danger' : 'icon-warning'} />
                <span>Validade: {new Date(proposal.validUntil).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* DYNAMIC PROPOSAL DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Section 1: Introduction */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>1. Introdução</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {proposal.introduction || 'Apresentamos nosso escopo de fornecimento de serviços e licenças desenhado especificamente para as necessidades de sua empresa.'}
            </p>
          </div>

          {/* Section 2: Identified Problem */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>2. Desafios Comercial Identificados</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {proposal.problemIdentified || 'Mapeamos gargalos operacionais no fluxo comercial tradicional, resultando em perda de leads por demora no tempo de resposta e ausência de qualificação estruturada.'}
            </p>
          </div>

          {/* Section 3: Recommended Solution */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>3. Solução Proposta</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {proposal.solutionRecommended}
            </p>
          </div>

          {/* Section 4: Scope of Deliverables */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>4. Escopo & Entregas Inclusas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formatListPoints(proposal.scopeOfServices).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Licenças de uso de software, documentação técnica, e suporte especializado da equipe Liporoni.</p>
              ) : (
                formatListPoints(proposal.scopeOfServices).map((point, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} className="icon-success" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{point}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Financial Values / Investment Matrix */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>5. Investimento</h3>
            
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px' }} className="print-light-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {proposal.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Valor de Tabela:</span>
                    <span>{(proposal.valueTotal + proposal.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}

                {proposal.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#f87171' }}>
                    <span>Desconto Comercial Concedido:</span>
                    <span>-{proposal.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Tributos Inclusos (ISS/Simulados):</span>
                  <span>{proposal.taxes ? proposal.taxes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'} (incluso)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={18} className="glow-text-blue" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Valor Final da Proposta:</span>
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                    {proposal.valueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Section 6: Payment Terms & Timeline */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>6. Termos Comerciais & Pagamento</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <CreditCard size={18} className="glow-text-blue" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Condições de Pagamento</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>{proposal.paymentTerms}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Clock size={18} className="glow-text-blue" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Prazo de Entrega / Implantação</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>{proposal.deliveryTerm}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* DECISION OR SIGNATURE RECEIPT DISPLAY */}
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '30px' }}>
          
          {proposal.status === 'Aceita' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={36} className="icon-success" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>Contrato Formalizado com Sucesso</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.4 }}>
                Esta proposta foi aprovada digitalmente em {new Date(proposal.acceptedAt).toLocaleString('pt-BR')}. Um recibo de aceite digital foi anexado ao histórico do contato no CRM.
              </p>
            </div>
          )}

          {proposal.status === 'Recusada' && (
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <X size={36} className="icon-danger" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171' }}>Proposta Recusada pelo Cliente</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.4 }}>
                Status: Recusada em {new Date(proposal.refusedAt).toLocaleString('pt-BR')}. <br />
                Motivo: <strong>{proposal.refuseReason}</strong>
              </p>
            </div>
          )}

          {proposal.status === 'Em ajuste' && (
            <div style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Edit3 size={36} className="icon-warning" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24' }}>Solicitação de Ajuste Registrada</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.4 }}>
                Nossa equipe comercial foi notificada. Entraremos em contato em breve com uma versão revisada.
              </p>
            </div>
          )}

          {/* INTERACTION PANEL (ONLY WHEN AWAITING DECISION) */}
          {proposal.status === 'Enviada' && !isExpired && (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setActiveModal('adjust')}>
                  <Edit3 size={16} />
                  <span>Solicitar Ajustes</span>
                </button>
                <button className="btn btn-danger" onClick={() => setActiveModal('refuse')}>
                  <ThumbsDown size={16} />
                  <span>Recusar</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handlePrint}>
                  <Printer size={16} />
                  <span>Imprimir / PDF</span>
                </button>
                
                <button className="btn btn-primary" onClick={() => setActiveModal('accept')}>
                  <ThumbsUp size={16} />
                  <span>Aceitar Proposta</span>
                </button>
              </div>

            </div>
          )}

          {isExpired && (
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>Esta proposta comercial expirou em {new Date(proposal.validUntil).toLocaleDateString('pt-BR')}. Entre em contato para renegociar os valores.</p>
            </div>
          )}

        </div>

      </div>

      {/* ==========================================================================
         INTERACTIVE DECISION MODALS
         ========================================================================== */}

      {/* MODAL: ACCEPT PROPOSAL */}
      {activeModal === 'accept' && (
        <div className="modal-overlay no-print">
          <div className="modal-card glass-panel" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Shield size={20} className="icon-success" />
                <h3>Aceite & Assinatura Digital</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'rgba(0, 210, 255, 0.03)', border: '1px solid rgba(0, 210, 255, 0.1)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <Info size={16} className="icon-info" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    Ao preencher os dados abaixo, você formaliza a aceitação eletrônica desta proposta de serviços comerciais com a Liporoni Comercial.
                  </p>
                </div>

                <div className="form-group">
                  <label>Nome Completo do Assinante *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '14px' }}
                    placeholder="Nome completo do responsável"
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CPF ou CNPJ *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '14px' }}
                    placeholder="Somente números"
                    value={signerDoc}
                    onChange={e => setSignerDoc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="consentCheck"
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                    checked={consentCheck}
                    onChange={e => setConsentCheck(e.target.checked)}
                  />
                  <label htmlFor="consentCheck" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.3 }}>
                    Li e concordo com os valores descritos, prazos de entrega e termos de faturamento nesta proposta comercial.
                  </label>
                </div>

              </div>

              <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Voltar</button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Assinatura Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST ADJUSTMENTS */}
      {activeModal === 'adjust' && (
        <div className="modal-overlay no-print">
          <div className="modal-card glass-panel" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Edit3 size={20} className="icon-warning" />
                <h3>Solicitar Ajustes na Proposta</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Escreva detalhadamente quais pontos da proposta comercial você gostaria de renegociar (ex: preços, formas de pagamento, escopo de entrega, prazos).
                </p>

                <div className="form-group">
                  <label>Comentários de Ajuste *</label>
                  <textarea 
                    className="form-control"
                    style={{ paddingLeft: '14px', height: '140px', resize: 'vertical', fontSize: '0.8rem', paddingTop: '10px' }}
                    placeholder="Descreva suas observações de ajuste aqui..."
                    value={adjustComments}
                    onChange={e => setAdjustComments(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--warning), #d97706)', color: 'white', border: 'none' }}>
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REFUSE PROPOSAL */}
      {activeModal === 'refuse' && (
        <div className="modal-overlay no-print">
          <div className="modal-card glass-panel" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ThumbsDown size={20} className="icon-danger" />
                <h3>Declinar Proposta Comercial</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRefuseSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Sentimos muito que a proposta não atenda seu cenário atual. Seu feedback nos ajuda a melhorar nossas soluções.
                </p>

                <div className="form-group">
                  <label>Motivo Principal da Recusa *</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={refuseReason}
                    onChange={e => setRefuseReason(e.target.value)}
                  >
                    <option value="Preço elevado">Preço elevado (fora de orçamento)</option>
                    <option value="Prefiro concorrente">Prefiro proposta da concorrência</option>
                    <option value="Prazo de entrega longo">Prazo de entrega muito longo</option>
                    <option value="Escopo não atende">O escopo não atende a nossa necessidade</option>
                    <option value="Outro motivo">Outro motivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Observações adicionais (opcional)</label>
                  <textarea 
                    className="form-control"
                    style={{ paddingLeft: '14px', height: '100px', resize: 'vertical', fontSize: '0.8rem', paddingTop: '10px' }}
                    placeholder="Se desejar, detalhe o motivo aqui..."
                    value={refuseComments}
                    onChange={e => setRefuseComments(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Voltar</button>
                <button type="submit" className="btn btn-danger">
                  Confirmar Recusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
