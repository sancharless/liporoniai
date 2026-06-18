import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Search, Trash2, Edit, Save, Calculator, 
  X, AlertTriangle, CheckCircle, Percent, DollarSign, UserCheck
} from 'lucide-react';
import { dbService } from '../services/db';

export default function Services() {
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Form State (Service CRUD)
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [technicalInfo, setTechnicalInfo] = useState('');
  const [priceType, setPriceType] = useState('fixed'); // fixed, recurring
  const [priceFixed, setPriceFixed] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('15');
  const [deliveryDays, setDeliveryDays] = useState('10');
  const [paymentTerms, setPaymentTerms] = useState('50% sinal + 50% entrega');

  // Calculator State
  const [calcContactId, setCalcContactId] = useState('');
  const [calcQty, setCalcQty] = useState(1);
  const [calcSetup, setCalcSetup] = useState(0);
  const [calcDiscount, setCalcDiscount] = useState(0);
  const [calcCommission, setCalcCommission] = useState(5);
  const [calcExtras, setCalcExtras] = useState(0);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = () => {
    setServices(dbService.getServices());
    setContacts(dbService.getContacts().filter(c => c.status !== 'Bloqueado'));
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceName) {
      alert('Nome do serviço é obrigatório.');
      return;
    }

    const newService = {
      name: serviceName,
      category: category || 'Geral',
      description,
      benefits,
      technicalInfo,
      priceType,
      priceFixed: priceType === 'fixed' ? Number(priceFixed) : 0,
      priceMonthly: priceType === 'recurring' ? Number(priceMonthly) : 0,
      priceMin: Number(priceMin) || 0,
      maxDiscountAllowed: Number(maxDiscount) || 15,
      estimatedDeliveryDays: Number(deliveryDays) || 10,
      proposalValidityDays: 30,
      paymentTerms
    };

    dbService.saveService(newService);
    loadServicesData();
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setServiceName('');
    setCategory('');
    setDescription('');
    setBenefits('');
    setTechnicalInfo('');
    setPriceType('fixed');
    setPriceFixed('');
    setPriceMonthly('');
    setPriceMin('');
    setMaxDiscount('15');
    setDeliveryDays('10');
    setPaymentTerms('50% sinal + 50% entrega');
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja excluir este serviço permanentemente?')) {
      dbService.deleteService(id);
      loadServicesData();
    }
  };

  // --------------------------------------------------------------------------
  // CALCULADORA DE PROPOSTAS (MOTOR DE CÁLCULO)
  // --------------------------------------------------------------------------

  const openCalculator = (service) => {
    setSelectedService(service);
    setCalcContactId(contacts.length > 0 ? contacts[0].id : '');
    setCalcQty(1);
    setCalcSetup(0);
    setCalcDiscount(0);
    setCalcCommission(5);
    setCalcExtras(0);
    setShowCalcModal(true);
  };

  // Perform calculator math
  const getCalculationDetails = () => {
    if (!selectedService) return null;
    
    const basePrice = selectedService.priceType === 'fixed' 
      ? selectedService.priceFixed 
      : selectedService.priceMonthly;

    const subtotal = basePrice * calcQty;
    const discountVal = subtotal * (calcDiscount / 100);
    const total = subtotal - discountVal + Number(calcSetup) + Number(calcExtras);
    const commissionVal = total * (calcCommission / 100);
    const margin = total - Number(calcSetup) - Number(calcExtras) - commissionVal;

    // Rules verification
    const discountExceeded = calcDiscount > (selectedService.maxDiscountAllowed || 15);
    const belowMinPrice = total < (selectedService.priceMin || 0);
    const requiresManagerApproval = discountExceeded || belowMinPrice;

    return {
      subtotal,
      discountVal,
      total,
      commissionVal,
      margin,
      requiresManagerApproval,
      discountExceeded,
      belowMinPrice
    };
  };

  const handleGenerateProposal = () => {
    if (!calcContactId) {
      alert('Selecione um contato para associar à proposta.');
      return;
    }

    const contact = contacts.find(c => c.id === calcContactId);
    const calcs = getCalculationDetails();
    
    if (!contact || !calcs) return;

    // Gerar proposta como Rascunho
    const currentProposals = dbService.getProposals();
    const nextNum = currentProposals.length + 1;
    const propNumber = `2026-000${nextNum}`;

    const newProposal = {
      proposalNumber: propNumber,
      contactId: contact.id,
      serviceId: selectedService.id,
      clientCompany: contact.company,
      clientContactName: `${contact.firstName} ${contact.lastName}`,
      introduction: `Proposta comercial para fornecimento de ${selectedService.name}.`,
      problemIdentified: `Necessidade de automatização e otimização identificada no segmento de ${contact.segment}.`,
      solutionRecommended: selectedService.description,
      scopeOfServices: selectedService.benefits,
      valueTotal: calcs.total,
      discount: calcs.discountVal,
      taxes: calcs.total * 0.06, // Simulação de 6% ISS/tributos
      paymentTerms: selectedService.paymentTerms,
      deliveryTerm: `${selectedService.estimatedDeliveryDays} dias úteis`,
      status: calcs.requiresManagerApproval ? 'Rascunho' : 'Enviada',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 0,
      lastViewedAt: null,
      acceptedAt: null,
      refusedAt: null,
      refuseReason: null
    };

    dbService.saveProposal(newProposal);

    // Atualiza status do contato
    const updatedContact = {
      ...contact,
      status: 'Proposta em elaboração',
      lastContact: new Date().toISOString(),
      leadScore: Math.min(contact.leadScore + 10, 100)
    };
    dbService.saveContact(updatedContact);
    loadServicesData();
    setShowCalcModal(false);

    if (calcs.requiresManagerApproval) {
      // Create notification of approval request
      const db = dbService.getDB();
      const newNotif = {
        id: 'not_' + Date.now(),
        type: 'human_request',
        title: 'Aprovação Exigida',
        message: `Cálculo fora dos limites comerciais para ${contact.company}. Exige assinatura de gestor.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      db.notifications.push(newNotif);
      dbService.saveDB(db);

      alert(`Orçamento salvo! A proposta nº ${propNumber} foi criada como RASCUNHO pois exige aprovação humana do gestor (desconto acima do limite ou abaixo do preço mínimo).`);
    } else {
      alert(`Proposta nº ${propNumber} criada e salva no histórico do contato!`);
    }
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.category.toLowerCase().includes(search.toLowerCase())
  );

  const calcs = getCalculationDetails();

  return (
    <div className="table-card glass-panel">
      <div className="view-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Produtos & Serviços</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure sua tabela de preços comerciais e utilize o motor de cálculo de propostas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="table-filters" style={{ marginBottom: '24px' }}>
        <div className="search-bar" style={{ width: '280px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome, categoria..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* SERVICES LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredServices.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Nenhum serviço ou produto encontrado.
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service.id} className="glass-panel" style={{ padding: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <Briefcase size={20} className="glow-text-blue" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{service.name}</h3>
              </div>

              <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '14px' }}>
                {service.category}
              </span>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px', flex: 1 }}>
                {service.description}
              </p>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <p><strong>Min. Preço de Venda:</strong> R$ {service.priceMin ? service.priceMin.toLocaleString('pt-BR') : '0'}</p>
                <p><strong>Desc. Máximo Permitido:</strong> {service.maxDiscountAllowed || 15}%</p>
                <p><strong>Entrega Estimada:</strong> {service.estimatedDeliveryDays} dias</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>Preço Base</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                    {service.priceType === 'fixed' 
                      ? service.priceFixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : `${service.priceMonthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês`
                    }
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openCalculator(service)} className="btn btn-secondary" style={{ padding: '8px 10px', borderRadius: '6px' }} title="Calcular Orçamento">
                    <Calculator size={16} />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="btn btn-danger" style={{ padding: '8px 10px', borderRadius: '6px' }} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==========================================================================
         CALCULADORA DE PROPOSTAS COMERCIAL (MODAL)
         ========================================================================== */}
      {showCalcModal && selectedService && calcs && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '640px', width: '100%' }}>
            
            {/* Header */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Calculator size={20} className="glow-text-blue" />
                <h3>Calculadora: {selectedService.name}</h3>
              </div>
              <button onClick={() => setShowCalcModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Layout Grid */}
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              
              {/* Form Input fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Parâmetros do Orçamento</h4>
                
                <div className="form-group">
                  <label>Vincular a Lead/Cliente *</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem' }}
                    value={calcContactId}
                    onChange={e => setCalcContactId(e.target.value)}
                  >
                    <option value="">Selecione um lead...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.company})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>{selectedService.priceType === 'fixed' ? 'Qtd Unidades' : 'Qtd Meses'}</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} min={1} value={calcQty} onChange={e => setCalcQty(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label>Instalação/Setup (R$)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} min={0} value={calcSetup} onChange={e => setCalcSetup(Number(e.target.value))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Desconto (%)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} min={0} max={100} value={calcDiscount} onChange={e => setCalcDiscount(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label>Comissão Vendedor (%)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} min={0} max={100} value={calcCommission} onChange={e => setCalcCommission(Number(e.target.value))} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Deslocamento / Custos Adicionais (R$)</label>
                  <input type="number" className="form-control" style={{ paddingLeft: '14px' }} min={0} value={calcExtras} onChange={e => setCalcExtras(Number(e.target.value))} />
                </div>
              </div>

              {/* Calculations results display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Detalhamento Financeiro</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Preço de Tabela (Unitário):</span>
                    <span>
                      {(selectedService.priceType === 'fixed' ? selectedService.priceFixed : selectedService.priceMonthly).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span>{calcs.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Desconto concedido:</span>
                    <span style={{ color: calcs.discountVal > 0 ? '#f87171' : 'inherit' }}>
                      -{calcs.discountVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({calcDiscount}%)
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Comissão do Vendedor:</span>
                    <span>{calcs.commissionVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div style={{ display: 'flex', justifyBetween: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Valor Final Proposta:</span>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{calcs.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                {/* Validation Warnings */}
                {calcs.requiresManagerApproval && (
                  <div className="error-message-box" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', marginTop: 'auto', display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '8px' }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
                      <strong>Alerta: Exige Aprovação Humana!</strong><br />
                      {calcs.discountExceeded && `* Desconto aplicado (${calcDiscount}%) maior que o máximo (${selectedService.maxDiscountAllowed}%).\n`}
                      {calcs.belowMinPrice && `* Valor final menor que o preço de venda mínimo (R$ ${selectedService.priceMin}).`}
                    </div>
                  </div>
                )}

                {!calcs.requiresManagerApproval && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 14px', borderRadius: '8px', color: '#34d399', fontSize: '0.7rem', display: 'flex', gap: '6px', alignItems: 'center', marginTop: 'auto' }}>
                    <CheckCircle size={14} />
                    <span>Orçamento em conformidade com as regras comerciais.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCalcModal(false)}>Fechar</button>
              <button className="btn btn-primary" onClick={handleGenerateProposal}>
                {calcs.requiresManagerApproval ? 'Enviar Rascunho p/ Aprovação' : 'Gerar Proposta Comercial'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================================================
         CADASTRO INDIVIDUAL DE SERVIÇOS (MODAL)
         ========================================================================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3>Cadastrar Novo Produto / Serviço</h3>
            </div>
            
            <form onSubmit={handleAddService}>
              <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Nome do Serviço *</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="Nome" value={serviceName} onChange={e => setServiceName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Categoria</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="SaaS, Consultoria, etc." value={category} onChange={e => setCategory(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição Comercial</label>
                  <textarea className="form-control" style={{ paddingLeft: '14px', height: '60px', resize: 'vertical', fontSize: '0.8rem' }} placeholder="Descreva o serviço para a IA apresentar aos clientes..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Tipo de Preço</label>
                    <select className="filter-select" style={{ width: '100%' }} value={priceType} onChange={e => setPriceType(e.target.value)}>
                      <option value="fixed">Preço Fixo / Projeto</option>
                      <option value="recurring">Recorrência Mensal</option>
                    </select>
                  </div>
                  {priceType === 'fixed' ? (
                    <div className="form-group">
                      <label>Preço Fixo (R$)</label>
                      <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={priceFixed} onChange={e => setPriceFixed(e.target.value)} />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Valor Recorrente Mensal (R$)</label>
                      <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={priceMonthly} onChange={e => setPriceMonthly(e.target.value)} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Preço Mínimo de Venda (R$)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Desconto Máximo Autorizado (%)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Prazo de Implantação (Dias)</label>
                    <input type="number" className="form-control" style={{ paddingLeft: '14px' }} value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Condições de Pagamento</label>
                    <input type="text" className="form-control" style={{ paddingLeft: '14px' }} placeholder="50% sinal e 50% na conclusão" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Benefícios comerciais (um por linha)</label>
                  <textarea className="form-control" style={{ paddingLeft: '14px', height: '60px', resize: 'vertical', fontSize: '0.8rem' }} placeholder="Lista de vantagens..." value={benefits} onChange={e => setBenefits(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
