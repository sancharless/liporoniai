import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Edit, Save, X, AlertTriangle, CheckCircle2, 
  DollarSign, ChevronRight, Download, RefreshCw, FileText, 
  Layers, Check, Eye, Plus, ShoppingCart, Info, TrendingUp, HelpCircle
} from 'lucide-react';
import { dbService, logAuditEvent } from '../services/db';
import { authService } from '../services/auth';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Search and Filters
  const [search, setSearch] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState('Todas');
  const [filterNeedsRevision, setFilterNeedsRevision] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('code-asc');

  // Modals & Wizard
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Selected entities
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Product Form State (Manual Edit / Create)
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Airsoft');
  const [formSubcategory, setFormSubcategory] = useState('BBs e munições');
  const [formPage, setFormPage] = useState('1');
  const [formNeedsRevision, setFormNeedsRevision] = useState(false);
  const [formRevisionReason, setFormRevisionReason] = useState('');

  // Proposal Calculator State
  const [calcContactId, setCalcContactId] = useState('');
  const [calcQty, setCalcQty] = useState(1);
  const [calcDiscount, setCalcDiscount] = useState(0);
  const [calcSetup, setCalcSetup] = useState(0);
  const [calcExtras, setCalcExtras] = useState(0);
  const [calcCommission, setCalcCommission] = useState(5);
  const [calcPaymentTerms, setCalcPaymentTerms] = useState('À vista via PIX/TED ou faturamento boleto 28 dias');
  const [calcDeliveryTerm, setCalcDeliveryTerm] = useState('Pronta entrega (FOB)');

  // Wizard state machine: step 1 to 5
  const [wizardStep, setWizardStep] = useState(1);
  const [importText, setImportText] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [previewGroups, setPreviewGroups] = useState({
    novos: [],
    atualizados: [],
    semAlteracao: [],
    necessitaRevisao: [],
    duplicados: [],
    erros: []
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [importReport, setImportReport] = useState(null);

  // Subcategories definition based on rules
  const subcategories = [
    'Todas',
    'BBs e munições',
    'BBs Tracer',
    'Bolsas e cases',
    'Vestuário e proteção',
    'Baterias e carregadores',
    'Motores e peças',
    'Iluminação e outros',
    'Outros'
  ];

  const subcategoryColors = {
    'BBs e munições': { bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.25)', text: '#22d3ee', gradient: 'from-cyan-500/10 to-blue-500/10' },
    'BBs Tracer': { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: '#34d399', gradient: 'from-emerald-500/10 to-green-500/10' },
    'Bolsas e cases': { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24', gradient: 'from-amber-500/10 to-orange-500/10' },
    'Vestuário e proteção': { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.25)', text: '#a78bfa', gradient: 'from-violet-500/10 to-purple-500/10' },
    'Baterias e carregadores': { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', text: '#fca5a5', gradient: 'from-red-500/10 to-rose-500/10' },
    'Motores e peças': { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.25)', text: '#818cf8', gradient: 'from-indigo-500/10 to-blue-500/10' },
    'Iluminação e outros': { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.25)', text: '#f472b6', gradient: 'from-pink-500/10 to-rose-500/10' },
    'Outros': { bg: 'rgba(107, 114, 128, 0.08)', border: 'rgba(107, 114, 128, 0.25)', text: '#9ca3af', gradient: 'from-gray-500/10 to-slate-500/10' }
  };

  useEffect(() => {
    loadData();
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const loadData = () => {
    setProducts(dbService.getProducts());
    setContacts(dbService.getContacts().filter(c => c.status !== 'Bloqueado'));
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setFormCode('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('Airsoft');
    setFormSubcategory('BBs e munições');
    setFormPage('1');
    setFormNeedsRevision(false);
    setFormRevisionReason('');
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setSelectedProduct(prod);
    setFormCode(prod.code);
    setFormDescription(prod.description);
    setFormPrice(prod.price);
    setFormCategory(prod.category || 'Airsoft');
    setFormSubcategory(prod.subcategory || 'BBs e munições');
    setFormPage(prod.page ? String(prod.page) : '1');
    setFormNeedsRevision(prod.needsRevision || false);
    setFormRevisionReason(prod.revisionReason || '');
    setShowAddEditModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formCode || !formDescription || !formPrice) {
      alert('Código, Descrição e Preço são obrigatórios.');
      return;
    }

    const payload = {
      code: formCode.trim(),
      description: formDescription.trim(),
      price: parseFloat(formPrice),
      category: formCategory,
      subcategory: formSubcategory,
      page: parseInt(formPage, 10) || 1,
      needsRevision: formNeedsRevision,
      revisionReason: formNeedsRevision ? formRevisionReason.trim() : ''
    };

    dbService.saveProduct(payload);
    
    // Log audit
    logAuditEvent({
      userId: currentUser?.id,
      userName: currentUser?.name,
      action: selectedProduct ? 'Editar Produto' : 'Criar Produto',
      module: 'Catálogo',
      detail: `${selectedProduct ? 'Editado' : 'Criado'} produto cód ${payload.code} — R$ ${payload.price}`
    });

    loadData();
    setShowAddEditModal(false);
  };

  // --------------------------------------------------------------------------
  // PARSER & WIZARD ACTIONS
  // --------------------------------------------------------------------------

  // Helper to map code to subcategory based on rule 8
  const getSubcategoryByCode = (code) => {
    const numCode = parseInt(code, 10);
    const subcategoryMap = {
      'BBs e munições': [782, 781, 818, 783, 882, 858, 878, 879, 880, 881, 859, 885, 861, 883, 863, 884, 864, 876, 865, 874, 866, 873, 867, 877, 642, 643, 644, 645, 690, 797],
      'BBs Tracer': [886, 860, 887, 862, 822],
      'Bolsas e cases': [811, 812, 743, 821, 672, 606, 678, 746, 810, 809],
      'Vestuário e proteção': [803, 802, 815, 816, 814, 607, 617, 616, 625, 638, 641, 639, 619, 608, 650, 651],
      'Baterias e carregadores': [587, 598, 791, 614, 615, 630, 756, 824, 757, 819, 660, 661, 792, 676, 793, 760],
      'Motores e peças': [804, 805, 806],
      'Iluminação e outros': [798, 800, 801, 799]
    };

    for (const [subcat, codes] of Object.entries(subcategoryMap)) {
      if (codes.includes(numCode)) {
        return subcat;
      }
    }
    return 'Outros';
  };

  const handleValidateText = () => {
    if (!importText.trim()) {
      alert('Por favor, cole os dados do catálogo para validar.');
      return;
    }

    const lines = importText.split('\n');
    const parsedItems = [];
    const errorsList = [];
    const duplicatesMap = {};
    const seenCodes = new Set();

    let processedCount = 0;

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Skip header lines
      if (cleanLine.startsWith('FORMATO:') || cleanLine.startsWith('TOTAL DE') || cleanLine.startsWith('CATÁLOGO TACT') || cleanLine.startsWith('ORIGEM:')) {
        return;
      }

      const parts = cleanLine.split('|').map(p => p.trim());
      if (parts.length < 5) {
        // Line formatting error
        errorsList.push({
          lineNum: index + 1,
          content: cleanLine,
          reason: 'Quantidade insuficiente de colunas (mínimo de 5 esperado)'
        });
        return;
      }

      const pageStr = parts[0];
      const codeStr = parts[1];
      const description = parts[2];
      const priceBrl = parts[3];
      const priceNumStr = parts[4];
      const category = parts[5] || 'Airsoft';
      const needsRevisionStr = parts[6] || 'NÃO';
      const revisionReason = parts[7] || '';

      const page = parseInt(pageStr, 10);
      const priceNumeric = parseFloat(priceNumStr);

      if (isNaN(page)) {
        errorsList.push({
          lineNum: index + 1,
          content: cleanLine,
          reason: `Página inválida ou não numérica: "${pageStr}"`
        });
        return;
      }

      if (!codeStr) {
        errorsList.push({
          lineNum: index + 1,
          content: cleanLine,
          reason: 'Código do produto está vazio.'
        });
        return;
      }

      if (isNaN(priceNumeric)) {
        errorsList.push({
          lineNum: index + 1,
          content: cleanLine,
          reason: `Preço numérico inválido: "${priceNumStr}"`
        });
        return;
      }

      const needsRevision = needsRevisionStr.toUpperCase() === 'SIM' || description.endsWith('..') || description.endsWith('...');
      const finalRevisionReason = needsRevision ? (revisionReason || 'Descrição abreviada no catálogo de origem') : '';

      // Check duplicates in the import file itself
      if (seenCodes.has(codeStr)) {
        if (!duplicatesMap[codeStr]) {
          duplicatesMap[codeStr] = [];
        }
        duplicatesMap[codeStr].push({ page, code: codeStr, description, price: priceNumeric });
      } else {
        seenCodes.add(codeStr);
      }

      const item = {
        page,
        code: codeStr,
        description,
        price: priceNumeric,
        category,
        subcategory: getSubcategoryByCode(codeStr),
        needsRevision,
        revisionReason: finalRevisionReason
      };

      parsedItems.push(item);
      processedCount++;
    });

    // Save validation summary
    setValidationResult({
      processedCount,
      errorsCount: errorsList.length,
      errorsList,
      parsedItems
    });

    // Group items for Step 3 Preview
    const currentDBProducts = dbService.getProducts();
    const groups = {
      novos: [],
      atualizados: [],
      semAlteracao: [],
      necessitaRevisao: [],
      duplicados: [],
      erros: errorsList
    };

    parsedItems.forEach(item => {
      // Duplicate check
      const codeIsDuplicate = Object.keys(duplicatesMap).includes(item.code);
      
      if (codeIsDuplicate) {
        groups.duplicados.push(item);
      }

      // Check revision
      if (item.needsRevision) {
        groups.necessitaRevisao.push(item);
      }

      const existing = currentDBProducts.find(p => p.code === item.code);
      if (!existing) {
        if (!codeIsDuplicate) {
          groups.novos.push(item);
        }
      } else {
        const isDifferent = existing.price !== item.price || 
                            existing.description !== item.description || 
                            existing.category !== item.category || 
                            existing.subcategory !== item.subcategory ||
                            existing.page !== item.page ||
                            existing.needsRevision !== item.needsRevision;
        if (isDifferent) {
          if (!codeIsDuplicate) {
            groups.atualizados.push(item);
          }
        } else {
          if (!codeIsDuplicate) {
            groups.semAlteracao.push(item);
          }
        }
      }
    });

    setPreviewGroups(groups);
    setWizardStep(2);
  };

  const handleApplyImport = () => {
    if (!termsAccepted) {
      alert('Você precisa aceitar os termos antes de aplicar a importação.');
      return;
    }

    const itemsToImport = validationResult.parsedItems;
    
    // Perform bulk import
    const report = dbService.importProducts(itemsToImport, currentUser?.id, currentUser?.name);
    
    setImportReport(report);
    setWizardStep(5);
    loadData();
  };

  const handleDownloadCSV = () => {
    if (!importReport) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Codigo,Acao,Detalhes\n';
    
    importReport.log.forEach(row => {
      csvContent += `"${row.code}","${row.action}","${row.details}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_importacao_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseWizard = () => {
    setShowImportWizard(false);
    setWizardStep(1);
    setImportText('');
    setValidationResult(null);
    setTermsAccepted(false);
    setImportReport(null);
  };

  // --------------------------------------------------------------------------
  // CALCULATOR FUNCTIONS
  // --------------------------------------------------------------------------

  const handleOpenCalcModal = (prod) => {
    setSelectedProduct(prod);
    setCalcContactId(contacts.length > 0 ? contacts[0].id : '');
    setCalcQty(1);
    setCalcDiscount(0);
    setCalcSetup(0);
    setCalcExtras(0);
    setCalcCommission(5);
    setCalcPaymentTerms('À vista via PIX/TED ou faturamento boleto 28 dias');
    setCalcDeliveryTerm('Pronta entrega (FOB)');
    setShowCalcModal(true);
  };

  const getCalcDetails = () => {
    if (!selectedProduct) return null;
    
    const subtotal = selectedProduct.price * calcQty;
    const discountVal = subtotal * (calcDiscount / 100);
    const total = subtotal - discountVal + Number(calcSetup) + Number(calcExtras);
    const commissionVal = total * (calcCommission / 100);
    const margin = total - Number(calcSetup) - Number(calcExtras) - commissionVal;

    // Admin limit discount rules
    const discountExceeded = calcDiscount > 15; // standard limit of 15%
    const requiresManagerApproval = discountExceeded;

    return {
      subtotal,
      discountVal,
      total,
      commissionVal,
      margin,
      requiresManagerApproval,
      discountExceeded
    };
  };

  const handleCreateProposal = () => {
    if (!calcContactId) {
      alert('Selecione um contato para associar à proposta.');
      return;
    }

    const contact = contacts.find(c => c.id === calcContactId);
    const calcs = getCalcDetails();
    if (!contact || !calcs) return;

    const currentProposals = dbService.getProposals();
    const nextNum = currentProposals.length + 1;
    const propNumber = `2026-000${nextNum}`;

    const newProposal = {
      proposalNumber: propNumber,
      contactId: contact.id,
      serviceId: null, // this is a catalog product proposal
      productId: selectedProduct.code,
      clientCompany: contact.company,
      clientContactName: `${contact.firstName} ${contact.lastName}`,
      introduction: `Proposta comercial para fornecimento de munições/equipamentos táticos: ${selectedProduct.description}.`,
      problemIdentified: `Necessidade de reabastecimento comercial identificada para o cliente.`,
      solutionRecommended: `Fornecimento do item ${selectedProduct.description} (Código ${selectedProduct.code}) sob condições especiais de atacado/distribuição.`,
      scopeOfServices: `Item: ${selectedProduct.description}\nSubcategoria: ${selectedProduct.subcategory}\nQuantidade: ${calcQty} un.\nPreço Unitário: R$ ${selectedProduct.price.toFixed(2)}\nPreço Total: R$ ${calcs.total.toFixed(2)}`,
      valueTotal: calcs.total,
      discount: calcs.discountVal,
      taxes: calcs.total * 0.06, // 6% taxes simulated
      paymentTerms: calcPaymentTerms,
      deliveryTerm: calcDeliveryTerm,
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

    // Update contact status
    const updatedContact = {
      ...contact,
      status: 'Proposta em elaboração',
      lastContact: new Date().toISOString(),
      leadScore: Math.min(contact.leadScore + 10, 100)
    };
    dbService.saveContact(updatedContact);

    if (calcs.requiresManagerApproval) {
      // Create notification
      const db = dbService.getDB();
      db.notifications.push({
        id: 'not_' + Date.now(),
        type: 'human_request',
        title: 'Aprovação Exigida',
        message: `Desconto aplicado (${calcDiscount}%) na proposta #${propNumber} exige aprovação do gestor.`,
        timestamp: new Date().toISOString(),
        read: false
      });
      dbService.saveDB(db);

      alert(`Orçamento salvo! A proposta nº ${propNumber} foi criada como RASCUNHO pois exige aprovação humana do gestor (desconto acima do limite de 15%).`);
    } else {
      alert(`Proposta nº ${propNumber} criada com sucesso para ${contact.company}!`);
    }

    setShowCalcModal(false);
  };

  // --------------------------------------------------------------------------
  // SEARCH & FILTER LOGIC
  // --------------------------------------------------------------------------

  const filteredProducts = products.filter(prod => {
    // 1. Search term match code or description
    const term = search.toLowerCase();
    const matchesSearch = prod.code.toLowerCase().includes(term) || 
                          prod.description.toLowerCase().includes(term);

    // 2. Subcategory match
    const matchesSubcat = selectedSubcat === 'Todas' || prod.subcategory === selectedSubcat;

    // 3. Revision filter
    const matchesRevision = !filterNeedsRevision || prod.needsRevision === true;

    // 4. Price filter
    const price = prod.price;
    const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);

    return matchesSearch && matchesSubcat && matchesRevision && matchesMinPrice && matchesMaxPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'code-asc':
        return parseInt(a.code, 10) - parseInt(b.code, 10);
      case 'code-desc':
        return parseInt(b.code, 10) - parseInt(a.code, 10);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'page-asc':
        return a.page - b.page;
      default:
        return 0;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Catálogo de Produtos</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Consulte a tabela de equipamentos e BBs do catálogo TACT Airsoft.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentUser?.role === 'admin' && (
            <>
              <button className="btn btn-secondary" onClick={handleOpenAddModal}>
                <Plus size={16} />
                <span>Adicionar Item</span>
              </button>
              
              <button className="btn btn-primary" onClick={() => setShowImportWizard(true)}>
                <RefreshCw size={16} />
                <span>Importar Catálogo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* FILTER BAR PANEL */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Row 1: Search & Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          
          <div className="search-bar" style={{ maxWidth: 'none', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por código ou descrição..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="number" 
              className="form-control" 
              style={{ flex: 1, paddingLeft: '12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)' }}
              placeholder="Preço Mín (R$)"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
            />
            <input 
              type="number" 
              className="form-control" 
              style={{ flex: 1, paddingLeft: '12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)' }}
              placeholder="Preço Máx (R$)"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="filter-select" 
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="code-asc">Ordenar por: Código (Crescente)</option>
              <option value="code-desc">Ordenar por: Código (Decrescente)</option>
              <option value="price-asc">Ordenar por: Preço (Menor primeiro)</option>
              <option value="price-desc">Ordenar por: Preço (Maior primeiro)</option>
              <option value="page-asc">Ordenar por: Página do Catálogo</option>
            </select>
          </div>

        </div>

        {/* Row 2: Subcategory pills & revisions check */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {subcategories.map(subcat => {
              const isActive = selectedSubcat === subcat;
              const colorInfo = subcategoryColors[subcat] || { text: 'var(--text-primary)' };
              return (
                <button
                  key={subcat}
                  onClick={() => setSelectedSubcat(subcat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: isActive ? (colorInfo.bg || 'var(--primary-glow)') : 'transparent',
                    border: `1px solid ${isActive ? (colorInfo.border || 'var(--primary)') : 'var(--glass-border)'}`,
                    color: isActive ? colorInfo.text : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {subcat}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="revisionCheck" 
              style={{ cursor: 'pointer' }}
              checked={filterNeedsRevision}
              onChange={e => setFilterNeedsRevision(e.target.checked)}
            />
            <label htmlFor="revisionCheck" style={{ fontSize: '0.75rem', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} />
              <span>Apenas com truncamentos (Necessita revisão)</span>
            </label>
          </div>

        </div>

      </div>

      {/* PRODUCTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }} className="glass-panel">
            <Package size={40} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
            <p>Nenhum produto atende aos critérios de filtro aplicados.</p>
          </div>
        ) : (
          filteredProducts.map(prod => {
            const subcatColor = subcategoryColors[prod.subcategory] || subcategoryColors['Outros'];
            return (
              <div 
                key={prod.id} 
                className="glass-panel glass-panel-hover" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
              >
                
                {/* Fallback graphical visual container */}
                <div style={{ 
                  height: '140px', 
                  background: `linear-gradient(135deg, rgba(15, 21, 36, 0.95), rgba(9, 13, 22, 0.98))`, 
                  borderBottom: '1px solid var(--glass-border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  
                  {/* Catalog Source Indicator */}
                  <span style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    fontSize: '0.65rem', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)'
                  }}>
                    Catálogo Pág. {prod.page}
                  </span>

                  {/* Subcategory Label Indicator */}
                  <span style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    left: '10px', 
                    fontSize: '0.65rem', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    background: subcatColor.bg,
                    border: `1px solid ${subcatColor.border}`,
                    color: subcatColor.text
                  }}>
                    {prod.subcategory}
                  </span>

                  {/* Big visual icon placeholder representing item subcategory */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Package size={42} style={{ color: subcatColor.text, opacity: 0.8 }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      CÓD: #{prod.code}
                    </span>
                  </div>

                  {/* Pricing Tag Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    fontWeight: 800,
                    color: 'var(--accent-cyan)',
                    fontSize: '1.1rem',
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                  }}>
                    {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>

                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, minHeight: '40px' }}>
                      {prod.description}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Categoria: {prod.category || 'Airsoft'}
                    </span>
                  </div>

                  {/* Needs Revision Warning Message */}
                  {prod.needsRevision && (
                    <div style={{ 
                      background: 'rgba(245, 158, 11, 0.05)', 
                      border: '1px solid rgba(245, 158, 11, 0.2)', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      gap: '6px', 
                      alignItems: 'flex-start' 
                    }}>
                      <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.65rem', color: '#fbbf24', lineHeight: 1.3 }}>
                        <strong>Truncado no Catálogo:</strong><br />
                        {prod.revisionReason || 'Descrição abreviada'}
                      </div>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                    
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 12px', fontSize: '0.75rem', flex: 1 }}
                      onClick={() => handleOpenCalcModal(prod)}
                    >
                      <ShoppingCart size={14} />
                      <span>Proposta</span>
                    </button>

                    {currentUser?.role === 'admin' && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEditModal(prod)}
                        title="Corrigir / Editar dados do produto"
                      >
                        <Edit size={14} />
                      </button>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setShowHistoryModal(true);
                      }}
                      title="Visualizar histórico de preços"
                    >
                      <TrendingUp size={14} />
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ==========================================================================
         MODAL: PRICE HISTORY
         ========================================================================== */}
      {showHistoryModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '420px', width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} className="glow-text-blue" />
                <h3>Histórico de Preços — Cód #{selectedProduct.code}</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Rastreamento de todas as alterações tarifárias registradas para: <strong>{selectedProduct.description}</strong>
              </p>

              <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="contacts-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Data da Alteração</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProduct.priceHistory || []).length === 0 ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhum registro anterior localizado.
                        </td>
                      </tr>
                    ) : (
                      selectedProduct.priceHistory.map((h, i) => (
                        <tr key={i}>
                          <td>{new Date(h.date).toLocaleString('pt-BR')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                            {h.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL: ADD / EDIT PRODUCT INDIVIDUALLY
         ========================================================================== */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '520px', width: '100%' }}>
            <div className="modal-header">
              <h3>{selectedProduct ? 'Corrigir e Editar Produto' : 'Cadastrar Novo Produto'}</h3>
              <button onClick={() => setShowAddEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Código Único (Identificador) *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '12px' }}
                      value={formCode} 
                      onChange={e => setFormCode(e.target.value)} 
                      disabled={!!selectedProduct} // unique ID code cannot be edited once saved
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço Numérico BRL *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control" 
                      style={{ paddingLeft: '12px' }}
                      placeholder="Ex: 44.55"
                      value={formPrice} 
                      onChange={e => setFormPrice(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição Completa *</label>
                  <textarea 
                    className="form-control" 
                    style={{ paddingLeft: '12px', height: '60px', paddingTop: '8px', fontSize: '0.8rem' }}
                    placeholder="Descrição oficial do produto"
                    value={formDescription} 
                    onChange={e => setFormDescription(e.target.value)} 
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Categoria Principal</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '12px' }}
                      value={formCategory} 
                      onChange={e => setFormCategory(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Subcategoria</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%' }}
                      value={formSubcategory}
                      onChange={e => setFormSubcategory(e.target.value)}
                    >
                      {subcategories.filter(s => s !== 'Todas').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Página no Catálogo Original</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ paddingLeft: '12px' }}
                      value={formPage} 
                      onChange={e => setFormPage(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Revision Controls */}
                <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="formRevisionCheck"
                      checked={formNeedsRevision}
                      onChange={e => setFormNeedsRevision(e.target.checked)}
                    />
                    <label htmlFor="formRevisionCheck" style={{ fontSize: '0.75rem', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}>
                      Marcar como "Necessita Revisão" (Truncamento de descrição)
                    </label>
                  </div>
                  
                  {formNeedsRevision && (
                    <div className="form-group">
                      <label style={{ fontSize: '0.7rem' }}>Motivo da revisão</label>
                      <input 
                        type="text" 
                        className="form-control"
                        style={{ paddingLeft: '12px', fontSize: '0.75rem' }}
                        placeholder="Ex: Descrição abreviada no catálogo de origem"
                        value={formRevisionReason}
                        onChange={e => setFormRevisionReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MODAL: ADICIONAR PRODUTO À PROPOSTA (CALCULADORA DE VENDAS)
         ========================================================================== */}
      {showCalcModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '780px', width: '100%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ShoppingCart size={20} className="glow-text-blue" />
                <h3>Calculadora Comercial — Lançar Proposta</h3>
              </div>
              <button onClick={() => setShowCalcModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
              
              {/* Form Input Side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRODUTO SELECIONADO</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                    #{selectedProduct.code} - {selectedProduct.description}
                  </h4>
                  <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>
                    Preço de Tabela: R$ {selectedProduct.price.toFixed(2)}
                  </span>
                </div>

                <div className="form-group">
                  <label>Associar ao Lead / Contato *</label>
                  <select 
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={calcContactId}
                    onChange={e => setCalcContactId(e.target.value)}
                  >
                    {contacts.length === 0 ? (
                      <option value="">Nenhum lead qualificado disponível</option>
                    ) : (
                      contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} ({c.company})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Quantidade *</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-control"
                      style={{ paddingLeft: '12px' }}
                      value={calcQty}
                      onChange={e => setCalcQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Desconto (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      className="form-control"
                      style={{ paddingLeft: '12px' }}
                      value={calcDiscount}
                      onChange={e => setCalcDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Custo Extra (Logística / Seguro)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-control"
                      style={{ paddingLeft: '12px' }}
                      value={calcSetup}
                      onChange={e => setCalcSetup(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Comissão Vendedor (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="form-control"
                      style={{ paddingLeft: '12px' }}
                      value={calcCommission}
                      onChange={e => setCalcCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Condição de Pagamento</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '12px' }}
                    value={calcPaymentTerms}
                    onChange={e => setCalcPaymentTerms(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Prazo de Entrega</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '12px' }}
                    value={calcDeliveryTerm}
                    onChange={e => setCalcDeliveryTerm(e.target.value)}
                  />
                </div>

              </div>

              {/* Live Preview Calcs Side */}
              <div 
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '10px', 
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                  Resumo dos Cálculos
                </h4>

                {(() => {
                  const calcs = getCalcDetails();
                  if (!calcs) return null;
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>Subtotal ({calcQty} un.):</span>
                        <span>{calcs.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>

                      {calcs.discountVal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#f87171' }}>
                          <span>Desconto ({calcDiscount}%):</span>
                          <span>-{calcs.discountVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      )}

                      {calcSetup > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Custo de Entrega:</span>
                          <span>R$ {parseFloat(calcSetup).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>Comissão Vendedor ({calcCommission}%):</span>
                        <span>R$ {calcs.commissionVal.toFixed(2)}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                        <span>Valor Final:</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>
                          {calcs.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>

                      {/* Threshold warning message */}
                      {calcs.requiresManagerApproval ? (
                        <div style={{ 
                          background: 'rgba(245, 158, 11, 0.08)', 
                          border: '1px solid rgba(245, 158, 11, 0.25)', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          color: '#fbbf24', 
                          fontSize: '0.7rem', 
                          lineHeight: 1.3,
                          marginTop: 'auto' 
                        }}>
                          <div style={{ display: 'flex', gap: '6px', fontWeight: 600 }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            <span>Revisão do Gestor Exigida</span>
                          </div>
                          <p style={{ marginTop: '4px' }}>
                            Desconto aplicado maior que o limite de tolerância automática de 15%. Salvará como Rascunho.
                          </p>
                        </div>
                      ) : (
                        <div style={{ 
                          background: 'rgba(16, 185, 129, 0.06)', 
                          border: '1px solid rgba(16, 185, 129, 0.2)', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          color: '#34d399', 
                          fontSize: '0.7rem', 
                          display: 'flex', 
                          gap: '6px', 
                          alignItems: 'center', 
                          marginTop: 'auto' 
                        }}>
                          <CheckCircle2 size={14} />
                          <span>Preço adequado às regras.</span>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>

            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCalcModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreateProposal}>Gerar Proposta Comercial</button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================================================
         WIZARD MODAL: CATÁLOGO BULK IMPORT (5 STEPS)
         ========================================================================== */}
      {showImportWizard && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel" style={{ maxWidth: '850px', width: '100%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={20} className="glow-text-blue" />
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Importador de Catálogo TACT Airsoft</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Passo {wizardStep} de 5
                  </span>
                </div>
              </div>
              {wizardStep !== 5 && (
                <button onClick={handleCloseWizard} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Stepper Progress bar */}
            <div style={{ display: 'flex', padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ color: wizardStep >= 1 ? 'var(--primary)' : 'inherit' }}>1. Colar Dados</span>
              <span style={{ color: wizardStep >= 2 ? 'var(--primary)' : 'inherit' }}>2. Validação</span>
              <span style={{ color: wizardStep >= 3 ? 'var(--primary)' : 'inherit' }}>3. Prévia</span>
              <span style={{ color: wizardStep >= 4 ? 'var(--primary)' : 'inherit' }}>4. Confirmação</span>
              <span style={{ color: wizardStep >= 5 ? 'var(--primary)' : 'inherit' }}>5. Conclusão</span>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              
              {/* STEP 1: LOAD DATA */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Cole abaixo os dados textuais do catálogo no formato estruturado por colunas separadas por barras verticais (<code style={{ color: 'var(--primary)' }}>|</code>).
                  </p>
                  <textarea
                    style={{ 
                      flex: 1, 
                      minHeight: '200px', 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid var(--glass-border)', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem', 
                      color: '#a7f3d0', 
                      resize: 'none' 
                    }}
                    placeholder="Cole aqui a lista de produtos (Página | Código | Descrição | Preço BRL | Preço numérico | Categoria | Necessita revisão | Motivo)..."
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px' }}>
                    💡 <strong>Formato Aceito:</strong> Página | Código | Descrição | Preço BRL | Preço numérico | Categoria | Revisão | Motivo<br />
                    Ex: 1 | 782 | AMMOBOX BBS 0,25g C/3000 (75.. | R$ 44,55 | 44.55 | Airsoft | SIM | Descrição abreviada
                  </div>
                </div>
              )}

              {/* STEP 2: VALIDATION AND FORMAT STATUS */}
              {wizardStep === 2 && validationResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ 
                    background: validationResult.errorsCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                    border: `1px solid ${validationResult.errorsCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`, 
                    padding: '14px', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {validationResult.errorsCount > 0 ? (
                      <AlertTriangle size={24} className="icon-danger" />
                    ) : (
                      <CheckCircle2 size={24} className="icon-success" />
                    )}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {validationResult.errorsCount > 0 ? 'Validação Concluída com Inconsistências' : 'Validação Concluída com Sucesso!'}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Processados {validationResult.processedCount} produtos corretos. Encontrados {validationResult.errorsCount} erros de layout.
                      </p>
                    </div>
                  </div>

                  {validationResult.errorsCount > 0 && (
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'rgba(239,68,68,0.08)', padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#f87171' }}>
                        Linhas com erros de formatação (Serão ignoradas na importação)
                      </div>
                      <div style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '0.7rem', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {validationResult.errorsList.map((err, i) => (
                          <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Linha {err.lineNum}:</strong> {err.reason} <br />
                            <code style={{ color: 'var(--text-muted)' }}>"{err.content}"</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.errorsCount === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                      <p style={{ fontSize: '0.85rem' }}>
                        Todos os {validationResult.processedCount} produtos estão formatados em conformidade com as regras.<br />
                        As descrições abreviadas foram identificadas e as subcategorias mapeadas com base no código do produto.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 3: CLASSIFIED PREVIEW GROUPS */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Verifique abaixo a distribuição dos produtos que serão atualizados no sistema.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '12px', border: '1px solid rgba(0,210,255,0.2)', background: 'rgba(0,210,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NOVOS PRODUTOS</span>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginTop: '4px' }}>{previewGroups.novos.length}</h3>
                    </div>
                    <div style={{ padding: '12px', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ATUALIZADOS</span>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--success)', marginTop: '4px' }}>{previewGroups.atualizados.length}</h3>
                    </div>
                    <div style={{ padding: '12px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NECESSITA REVISÃO</span>
                      <h3 style={{ fontSize: '1.2rem', color: '#fbbf24', marginTop: '4px' }}>{previewGroups.necessitaRevisao.length}</h3>
                    </div>
                  </div>

                  {/* Accordion view of groups */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* Novos */}
                    {previewGroups.novos.length > 0 && (
                      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)' }}>
                          🆕 Novos ({previewGroups.novos.length})
                        </div>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', padding: '8px', fontSize: '0.65rem' }}>
                          {previewGroups.novos.map((item, i) => (
                            <div key={i}>#{item.code} - {item.description} (R$ {item.price.toFixed(2)})</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Atualizados */}
                    {previewGroups.atualizados.length > 0 && (
                      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', borderBottom: '1px solid var(--glass-border)' }}>
                          🔄 Atualizados ({previewGroups.atualizados.length})
                        </div>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', padding: '8px', fontSize: '0.65rem' }}>
                          {previewGroups.atualizados.map((item, i) => (
                            <div key={i}>#{item.code} - {item.description} (R$ {item.price.toFixed(2)})</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Necessitam Revisao */}
                    {previewGroups.necessitaRevisao.length > 0 && (
                      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', borderBottom: '1px solid var(--glass-border)' }}>
                          ⚠️ Necessita revisão ({previewGroups.necessitaRevisao.length}) - Descrições terminando em .. ou ...
                        </div>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', padding: '8px', fontSize: '0.65rem' }}>
                          {previewGroups.necessitaRevisao.map((item, i) => (
                            <div key={i}>#{item.code} - {item.description} (R$ {item.price.toFixed(2)})</div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* STEP 4: TERMS & CONDITIONAL CONFIRMATION */}
              {wizardStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Confirme as Condições de Importação
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} className="icon-success" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span><strong>Preservação de Registros:</strong> Produtos antigos que não aparecem neste catálogo continuarão cadastrados e intocados.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} className="icon-success" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span><strong>Histórico de Tarifas:</strong> Alterações de preço criarão um registro retroativo de histórico nos produtos existentes.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle2 size={16} className="icon-success" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span><strong>Segurança Comercial:</strong> Nenhuma proposta ou dados de leads qualificados serão excluídos.</span>
                    </div>
                  </div>

                  <div style={{ 
                    border: '1px solid var(--glass-border)', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.01)', 
                    display: 'flex', 
                    gap: '10px', 
                    alignItems: 'flex-start',
                    marginTop: '10px'
                  }}>
                    <input 
                      type="checkbox" 
                      id="confirmTerms" 
                      style={{ cursor: 'pointer', marginTop: '4px' }}
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                    />
                    <label htmlFor="confirmTerms" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', cursor: 'pointer', lineHeight: 1.4 }}>
                      Declaro que revisei a distribuição do catálogo e autorizo a aplicação destas modificações na base do Liporoni Comercial.
                    </label>
                  </div>

                </div>
              )}

              {/* STEP 5: FINAL IMPORT SUCCESS REPORT */}
              {wizardStep === 5 && importReport && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--success)' }}>
                      <Check size={40} className="icon-success" />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: 'var(--success)' }}>Catálogo Importado com Sucesso!</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Os produtos foram processados e aplicados no banco de dados. Um log de auditoria foi gerado.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                    <div style={{ padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>NOVOS</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{importReport.newCount}</strong>
                    </div>
                    <div style={{ padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>ATUALIZADOS</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{importReport.updatedCount}</strong>
                    </div>
                    <div style={{ padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SEM ALTERAÇÃO</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{importReport.unchangedCount}</strong>
                    </div>
                    <div style={{ padding: '10px', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>REVISÃO</span>
                      <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>{importReport.needsRevisionCount}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={handleDownloadCSV}>
                      <Download size={16} />
                      <span>Baixar Relatório de Auditoria (CSV)</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', padding: '16px 24px' }}>
              
              {/* Step 1 button */}
              {wizardStep === 1 && (
                <>
                  <button className="btn btn-secondary" onClick={handleCloseWizard}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleValidateText}>Validar Dados</button>
                </>
              )}

              {/* Step 2 button */}
              {wizardStep === 2 && (
                <>
                  <button className="btn btn-secondary" onClick={() => setWizardStep(1)}>Voltar</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setWizardStep(3)}
                    disabled={validationResult.processedCount === 0}
                  >
                    Avançar para Prévia
                  </button>
                </>
              )}

              {/* Step 3 button */}
              {wizardStep === 3 && (
                <>
                  <button className="btn btn-secondary" onClick={() => setWizardStep(2)}>Voltar</button>
                  <button className="btn btn-primary" onClick={() => setWizardStep(4)}>Avançar para Confirmação</button>
                </>
              )}

              {/* Step 4 button */}
              {wizardStep === 4 && (
                <>
                  <button className="btn btn-secondary" onClick={() => setWizardStep(3)}>Voltar</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleApplyImport}
                    disabled={!termsAccepted}
                  >
                    Aplicar Importação
                  </button>
                </>
              )}

              {/* Step 5 button */}
              {wizardStep === 5 && (
                <button className="btn btn-primary" onClick={handleCloseWizard}>Concluir</button>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
