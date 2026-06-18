// Banco de dados simulado do Liporoni utilizando localStorage

const STORAGE_KEY = 'liporoni_db';

const defaultDatabase = {
  users: [
    {
      id: 'usr_1',
      name: 'Dr. Roberto Liporoni',
      email: 'admin@liporoni.com.br',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      company: 'Liporoni Comercial'
    },
    {
      id: 'usr_2',
      name: 'Mariana Costa',
      email: 'gestor@liporoni.com.br',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      company: 'Liporoni Comercial'
    },
    {
      id: 'usr_3',
      name: 'Eduardo Santos',
      email: 'vendedor@liporoni.com.br',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      company: 'Liporoni Comercial'
    }
  ],
  contacts: [
    {
      id: 'ct_1',
      firstName: 'Thiago',
      lastName: 'Mendes',
      company: 'Tech Innovators',
      role: 'Diretor Comercial',
      phone: '11998877665',
      email: 'thiago@techinnovators.com.br',
      city: 'São Paulo',
      state: 'SP',
      segment: 'Tecnologia',
      source: 'Outbound LinkedIn',
      serviceOfInterest: 'Consultoria de IA comercial',
      notes: 'Demonstrou interesse em automatizar a qualificação de leads.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-10T10:00:00Z',
      lastContact: '2026-06-18T09:15:00Z',
      nextContact: '2026-06-19T14:00:00Z',
      status: 'Qualificado',
      tags: ['Prioritário', 'PME'],
      consent: true,
      blockReason: null,
      leadScore: 85,
      classification: 'Lead quente',
      chatHistory: [
        { sender: 'agent', message: 'Olá, Thiago! Tudo bem? Meu nome é Liporoni, assistente virtual da Liporoni Comercial. Trabalhamos com Inteligência Artificial para aumentar vendas no segmento de Tecnologia. Posso fazer algumas perguntas rápidas para entender se isso faria sentido para a Tech Innovators?', timestamp: '2026-06-18T09:10:00Z' },
        { sender: 'client', message: 'Olá Liporoni, tudo bem por aqui. Claro, pode perguntar. Nós usamos WhatsApp hoje mas de forma bem manual.', timestamp: '2026-06-18T09:12:00Z' },
        { sender: 'agent', message: 'Excelente! Quantos vendedores vocês possuem hoje fazendo essa prospecção manual?', timestamp: '2026-06-18T09:13:00Z' },
        { sender: 'client', message: 'Temos 5 vendedores dedicados a isso.', timestamp: '2026-06-18T09:15:00Z' }
      ]
    },
    {
      id: 'ct_2',
      firstName: 'Aline',
      lastName: 'Prado',
      company: 'Indústria Metalúrgica Sul',
      role: 'Gerente de Compras',
      phone: '41991223344',
      email: 'aline@metalsul.com.br',
      city: 'Curitiba',
      state: 'PR',
      segment: 'Indústria',
      source: 'Importação Planilha',
      serviceOfInterest: 'Automação WhatsApp API',
      notes: 'Buscando integração direta de ERP com WhatsApp.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-12T11:20:00Z',
      lastContact: '2026-06-17T16:40:00Z',
      nextContact: '2026-06-20T10:00:00Z',
      status: 'Proposta enviada',
      tags: ['Empresa Grande', 'API'],
      consent: true,
      blockReason: null,
      leadScore: 95,
      classification: 'Oportunidade prioritária',
      chatHistory: [
        { sender: 'agent', message: 'Olá Aline! Como vai? Sou Liporoni, assistente comercial da Liporoni Comercial. Vi que você busca automação para a Indústria Metalúrgica Sul.', timestamp: '2026-06-17T16:00:00Z' },
        { sender: 'client', message: 'Sim, precisamos conectar nosso sistema interno para mandar avisos de faturamento e propostas automatizadas.', timestamp: '2026-06-17T16:15:00Z' },
        { sender: 'agent', message: 'Perfeito, nossa API atende exatamente a isso com suporte a ERPs. Preparei uma proposta sob medida para sua operação de grande porte.', timestamp: '2026-06-17T16:30:00Z' },
        { sender: 'client', message: 'Excelente, vou aguardar o envio.', timestamp: '2026-06-17T16:40:00Z' }
      ]
    },
    {
      id: 'ct_3',
      firstName: 'Carlos',
      lastName: 'Gomes',
      company: 'Gomes Logística',
      role: 'CEO',
      phone: '21987654321',
      email: 'carlos@gomeslog.com.br',
      city: 'Rio de Janeiro',
      state: 'RJ',
      segment: 'Serviços',
      source: 'Site - Orgânico',
      serviceOfInterest: 'Atendimento Híbrido Humano/IA',
      notes: 'Cliente ligou demonstrando urgência.',
      commercialOwner: 'usr_2',
      createdAt: '2026-06-14T08:30:00Z',
      lastContact: '2026-06-18T10:00:00Z',
      nextContact: '2026-06-18T16:00:00Z',
      status: 'Em atendimento',
      tags: ['Urgente'],
      consent: true,
      blockReason: null,
      leadScore: 70,
      classification: 'Lead morno',
      chatHistory: [
        { sender: 'agent', message: 'Olá Carlos! Sou o Liporoni da Liporoni Comercial. Notei que você acessou nossa página de Atendimento Híbrido.', timestamp: '2026-06-18T09:45:00Z' },
        { sender: 'client', message: 'Olá. Quero saber se a IA de vocês consegue transferir a conversa para os meus atendentes humanos de forma rápida no painel.', timestamp: '2026-06-18T10:00:00Z' }
      ]
    },
    {
      id: 'ct_4',
      firstName: 'Juliana',
      lastName: 'Ribeiro',
      company: 'Ribeiro Modas',
      role: 'Proprietária',
      phone: '31977665544',
      email: 'juliana@ribeirofashion.com',
      city: 'Belo Horizonte',
      state: 'MG',
      segment: 'Varejo',
      source: 'Anúncio Instagram',
      serviceOfInterest: 'Prospecção Ativa',
      notes: 'Respondeu pedindo para parar o contato.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-15T14:00:00Z',
      lastContact: '2026-06-16T11:20:00Z',
      nextContact: null,
      status: 'Bloqueado',
      tags: ['Varejo'],
      consent: false,
      blockReason: 'Solicitou descadastro',
      leadScore: 10,
      classification: 'Lead frio',
      chatHistory: [
        { sender: 'agent', message: 'Olá Juliana! Tudo bem? Sou Liporoni, assistente virtual da Liporoni Comercial...', timestamp: '2026-06-16T11:00:00Z' },
        { sender: 'client', message: 'Por favor, não me envie mais mensagens comerciais. Não tenho interesse.', timestamp: '2026-06-16T11:18:00Z' },
        { sender: 'agent', message: 'Compreendo perfeitamente, Juliana. Peço desculpas pelo incômodo. Seu contato foi removido de nossa base comercial e nenhum envio futuro será feito. Tenha um excelente dia!', timestamp: '2026-06-16T11:20:00Z' }
      ]
    },
    {
      id: 'ct_5',
      firstName: 'Marcos',
      lastName: 'Oliveira',
      company: 'Oliveira & Associados',
      role: 'Sócio',
      phone: '81988112233',
      email: 'marcos@oliveira.adv.br',
      city: 'Recife',
      state: 'PE',
      segment: 'Jurídico',
      source: 'Outbound LinkedIn',
      serviceOfInterest: 'Agendamento e Triagem',
      notes: 'Buscando triagem de clientes iniciais para escritório de advocacia.',
      commercialOwner: 'usr_2',
      createdAt: '2026-06-16T09:00:00Z',
      lastContact: '2026-06-18T10:25:00Z',
      nextContact: '2026-06-18T15:00:00Z',
      status: 'Em qualificação',
      tags: ['Profissional Liberal'],
      consent: true,
      blockReason: null,
      leadScore: 60,
      classification: 'Lead em análise',
      chatHistory: [
        { sender: 'agent', message: 'Olá Dr. Marcos! Tudo bem? Sou o Liporoni. Vi que o senhor se interessa por automação de triagem para escritórios jurídicos.', timestamp: '2026-06-18T10:10:00Z' },
        { sender: 'client', message: 'Sim, recebemos muitos contatos pelo WhatsApp e perdemos muito tempo catalogando dados básicos dos potenciais clientes.', timestamp: '2026-06-18T10:20:00Z' },
        { sender: 'agent', message: 'Entendi. O senhor já tem um roteiro padrão de perguntas de triagem que faz aos clientes?', timestamp: '2026-06-18T10:25:00Z' }
      ]
    },
    {
      id: 'ct_6',
      firstName: 'Roberta',
      lastName: 'Lins',
      company: 'Lins Consultórios',
      role: 'Diretora Clínica',
      phone: '85999221100',
      email: 'roberta@linsclinica.com.br',
      city: 'Fortaleza',
      state: 'CE',
      segment: 'Saúde',
      source: 'Indicação',
      serviceOfInterest: 'Agendamento de Consultas',
      notes: 'Fechou contrato no dia 16/06.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-11T16:00:00Z',
      lastContact: '2026-06-16T17:00:00Z',
      nextContact: null,
      status: 'Venda realizada',
      tags: ['Contrato Fechado', 'Saúde'],
      consent: true,
      blockReason: null,
      leadScore: 100,
      classification: 'Oportunidade prioritária',
      chatHistory: [
        { sender: 'agent', message: 'Roberta, a proposta nº 2004 foi gerada e enviada para você.', timestamp: '2026-06-16T16:00:00Z' },
        { sender: 'client', message: 'Aceito as condições! Acabei de assinar online.', timestamp: '2026-06-16T16:50:00Z' },
        { sender: 'agent', message: 'Muito obrigado, Roberta! Contrato formalizado com sucesso. Nossa equipe de implantação entrará em contato em breve.', timestamp: '2026-06-16T17:00:00Z' }
      ]
    }
  ],
  campaigns: [
    {
      id: 'camp_1',
      name: 'Campanha Tech SP 2026',
      status: 'Em andamento',
      objective: 'Divulgar Consultoria IA para empresas de TI',
      serviceId: 'srv_1',
      targetSegment: 'Tecnologia',
      targetRegion: 'São Paulo/SP',
      sentCount: 145,
      deliveredCount: 140,
      responseCount: 98,
      conversionCount: 18,
      revenue: 90000.00,
      tone: 'Profissional e técnico',
      timeRange: '09:00 - 18:00',
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      maxMessages: 500,
      intervalMinutes: 5,
      createdAt: '2026-06-10T09:00:00Z',
      commercialOwner: 'usr_3'
    },
    {
      id: 'camp_2',
      name: 'Prospecção Varejo Nacional',
      status: 'Pausada',
      objective: 'Atrair comércios para WhatsApp Comercial',
      serviceId: 'srv_2',
      targetSegment: 'Varejo',
      targetRegion: 'Brasil',
      sentCount: 89,
      deliveredCount: 85,
      responseCount: 32,
      conversionCount: 4,
      revenue: 16000.00,
      tone: 'Amigável e descontraído',
      timeRange: '10:00 - 17:00',
      days: ['Terça', 'Quarta', 'Quinta'],
      maxMessages: 300,
      intervalMinutes: 10,
      createdAt: '2026-06-12T10:00:00Z',
      commercialOwner: 'usr_3'
    },
    {
      id: 'camp_3',
      name: 'Reativação Leads Frios Sul',
      status: 'Concluída',
      objective: 'Retomar contato com leads sem resposta',
      serviceId: 'srv_3',
      targetSegment: 'Indústria',
      targetRegion: 'Região Sul',
      sentCount: 220,
      deliveredCount: 218,
      responseCount: 65,
      conversionCount: 11,
      revenue: 44000.00,
      tone: 'Consultivo e direto',
      timeRange: '09:00 - 17:30',
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      maxMessages: 400,
      intervalMinutes: 3,
      createdAt: '2026-06-01T08:00:00Z',
      commercialOwner: 'usr_2'
    }
  ],
  services: [
    {
      id: 'srv_1',
      name: 'Consultoria de IA Comercial',
      category: 'Consultoria',
      description: 'Implementação de inteligência artificial comercial para captação, qualificação e suporte a equipes de vendas.',
      benefits: 'Aumento na velocidade de qualificação, automatização de propostas comerciais e funil ativo 24/7.',
      technicalInfo: 'Treinamento de LLM customizado baseado no manual e histórico comercial da empresa contratante.',
      priceType: 'fixed',
      priceFixed: 5000.00,
      priceMin: 4500.00,
      estimatedDeliveryDays: 15,
      proposalValidityDays: 30,
      paymentTerms: '50% sinal e 50% na entrega'
    },
    {
      id: 'srv_2',
      name: 'Automação WhatsApp API',
      category: 'Software / SaaS',
      description: 'Plataforma de automação e integração de sistemas com a API oficial do WhatsApp Business.',
      benefits: 'Disparos massivos em conformidade com as regras da Meta, integração com ERP/CRM e multi-atendentes.',
      technicalInfo: 'Conexão via Webhooks, painel de relatórios em tempo real e hospedagem Cloud inclusa.',
      priceType: 'recurring',
      priceMonthly: 399.00,
      priceMin: 349.00,
      estimatedDeliveryDays: 3,
      proposalValidityDays: 15,
      paymentTerms: 'Recorrência mensal via cartão ou boleto'
    },
    {
      id: 'srv_3',
      name: 'Atendimento Híbrido Humano + IA',
      category: 'Serviços Combinados',
      description: 'Transição suave entre robôs inteligentes e vendedores humanos na central de atendimento do WhatsApp.',
      benefits: 'Redução do tempo de fila, satisfação do cliente com respostas imediatas e transição indolor para o vendedor.',
      technicalInfo: 'Ambiente web integrado com gerenciador de filas e chat multi-agente.',
      priceType: 'fixed',
      priceFixed: 4000.00,
      priceMin: 3500.00,
      estimatedDeliveryDays: 10,
      proposalValidityDays: 20,
      paymentTerms: 'Parcelado em até 3x sem juros'
    }
  ],
  proposals: [
    {
      id: 'prop_2001',
      proposalNumber: '2026-0001',
      contactId: 'ct_2',
      serviceId: 'srv_2',
      clientCompany: 'Indústria Metalúrgica Sul',
      clientContactName: 'Aline Prado',
      introduction: 'Temos o prazer de apresentar nossa proposta para o fornecimento da Plataforma Automação WhatsApp API.',
      problemIdentified: 'A Indústria Metalúrgica Sul possui gargalo de comunicação com clientes e necessita integrar o faturamento e disparo de propostas comerciais de forma ágil com o ERP.',
      solutionRecommended: 'Implantação do sistema Automação WhatsApp API integrado via webhook com o ERP atual da empresa.',
      scopeOfServices: 'Licença da plataforma por 12 meses, suporte técnico de segunda a sexta, API liberada para integrações ilimitadas.',
      valueTotal: 4788.00, // 399.00 * 12 meses
      discount: 300.00,
      taxes: 0.00,
      paymentTerms: 'Anual antecipado ou parcelado mensalmente de R$ 374,00 no boleto.',
      deliveryTerm: '3 dias úteis após assinatura comercial.',
      status: 'Enviada',
      createdAt: '2026-06-17T17:00:00Z',
      validUntil: '2026-07-02T23:59:59Z',
      viewCount: 1,
      lastViewedAt: '2026-06-18T08:30:00Z',
      acceptedAt: null,
      refusedAt: null,
      refuseReason: null
    },
    {
      id: 'prop_2004',
      proposalNumber: '2026-0002',
      contactId: 'ct_6',
      serviceId: 'srv_1',
      clientCompany: 'Lins Consultórios',
      clientContactName: 'Roberta Lins',
      introduction: 'Apresentamos nossa proposta comercial para o serviço de Consultoria de IA Comercial.',
      problemIdentified: 'Alto tempo de espera para agendamento e perda de contatos no horário noturno.',
      solutionRecommended: 'Implantação de Agente Inteligente customizado para agendamentos integrados com a agenda médica.',
      scopeOfServices: 'Mapeamento de jornada, treinamento da IA, integração com agenda do sistema Lins e 30 dias de acompanhamento pós-go-live.',
      valueTotal: 5000.00,
      discount: 500.00,
      taxes: 300.00,
      paymentTerms: 'Sinal de 50% + 50% na conclusão da entrega.',
      deliveryTerm: '15 dias úteis.',
      status: 'Aceita',
      createdAt: '2026-06-15T15:00:00Z',
      validUntil: '2026-07-15T23:59:59Z',
      viewCount: 4,
      lastViewedAt: '2026-06-16T16:45:00Z',
      acceptedAt: '2026-06-16T16:50:00Z',
      refusedAt: null,
      refuseReason: null
    }
  ],
  notifications: [
    {
      id: 'not_1',
      type: 'scoring',
      title: 'Lead Quente Identificado',
      message: 'O contato Thiago Mendes (Tech Innovators) atingiu 85 pontos de lead scoring.',
      timestamp: '2026-06-18T09:15:00Z',
      read: false
    },
    {
      id: 'not_2',
      type: 'human_request',
      title: 'Solicitação de Humano',
      message: 'Carlos Gomes (Gomes Logística) solicitou atendimento humano imediato.',
      timestamp: '2026-06-18T10:00:00Z',
      read: false
    },
    {
      id: 'not_3',
      type: 'proposal_accepted',
      title: 'Proposta Aceita!',
      message: 'A proposta comercial da Roberta Lins (Lins Consultórios) foi assinada.',
      timestamp: '2026-06-16T16:50:00Z',
      read: true
    }
  ],
  settings: {
    agentName: 'Liporoni',
    agentPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop',
    companyRepresented: 'Liporoni Comercial',
    greeting: 'Olá, {{nome}}! Tudo bem? Meu nome é Liporoni, assistente virtual da {{empresa}}.',
    toneOfVoice: 'Profissional, educado e focado no problema do cliente',
    formalGrade: 'moderate', // formal, moderate, informal
    maxResponseLength: 250,
    useEmojis: true,
    startTime: '08:00',
    endTime: '18:00',
    workDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    outOfHoursMessage: 'Olá! Agradeço seu contato. No momento estamos fora de nosso horário de atendimento (segunda a sexta, das 08h às 18h). Responderemos sua mensagem assim que iniciarmos nosso expediente comercial!',
    maxFollowUps: 3,
    followUpIntervalHours: 24,
    maxDiscountAllowed: 15.0 // percentual maximo
  },
  knowledgeBase: [
    {
      id: 'kn_1',
      title: 'Formas de Pagamento e Condições Comerciais',
      category: 'Financeiro',
      content: 'Aceitamos pagamento parcelado em até 3x sem juros no boleto bancário para contratos de consultoria. Para o plano SaaS de WhatsApp API, a recorrência é mensal no cartão de crédito ou faturamento antecipado anual com 10% de desconto.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:00:00Z'
    },
    {
      id: 'kn_2',
      title: 'Prazos de Implantação e Entrega',
      category: 'Implantação',
      content: 'O prazo de implantação da plataforma WhatsApp API oficial é de 3 dias úteis após fornecimento dos dados do cliente. A Consultoria Comercial com IA possui cronograma de entrega de 15 dias úteis, incluindo treinamento e testes.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:05:00Z'
    },
    {
      id: 'kn_3',
      title: 'Política de Cancelamento e Fidelidade',
      category: 'Contratos',
      content: 'Os planos de licença SaaS não possuem fidelidade e podem ser cancelados a qualquer momento sem cobrança de taxas adicionais. Os projetos de Consultoria possuem cláusula de fidelidade de 6 meses após a assinatura comercial.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:10:00Z'
    }
  ]
};

// Inicializador
export const initializeDB = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
  }
};

// Obter dados gerais
export const getDB = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

// Salvar dados gerais
export const saveDB = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Funções utilitárias específicas de CRUD para a aplicação
export const dbService = {
  // Contatos
  getContacts: () => {
    return getDB().contacts;
  },
  saveContact: (contact) => {
    const db = getDB();
    const index = db.contacts.findIndex(c => c.id === contact.id);
    if (index >= 0) {
      db.contacts[index] = contact;
    } else {
      contact.id = 'ct_' + Date.now();
      contact.createdAt = new Date().toISOString();
      db.contacts.push(contact);
    }
    saveDB(db);
    return contact;
  },
  deleteContact: (id) => {
    const db = getDB();
    db.contacts = db.contacts.filter(c => c.id !== id);
    saveDB(db);
  },

  // Campanhas
  getCampaigns: () => {
    return getDB().campaigns;
  },
  saveCampaign: (campaign) => {
    const db = getDB();
    const index = db.campaigns.findIndex(c => c.id === campaign.id);
    if (index >= 0) {
      db.campaigns[index] = campaign;
    } else {
      campaign.id = 'camp_' + Date.now();
      campaign.createdAt = new Date().toISOString();
      campaign.sentCount = 0;
      campaign.deliveredCount = 0;
      campaign.responseCount = 0;
      campaign.conversionCount = 0;
      campaign.revenue = 0;
      db.campaigns.push(campaign);
    }
    saveDB(db);
    return campaign;
  },

  // Propostas
  getProposals: () => {
    return getDB().proposals;
  },
  saveProposal: (proposal) => {
    const db = getDB();
    const index = db.proposals.findIndex(p => p.id === proposal.id);
    if (index >= 0) {
      db.proposals[index] = proposal;
    } else {
      proposal.id = 'prop_' + Date.now();
      proposal.createdAt = new Date().toISOString();
      db.proposals.push(proposal);
    }
    saveDB(db);
    return proposal;
  },

  // Configurações
  getSettings: () => {
    return getDB().settings;
  },
  saveSettings: (settings) => {
    const db = getDB();
    db.settings = settings;
    saveDB(db);
    return settings;
  },

  // Serviços
  getServices: () => {
    return getDB().services || [];
  },
  saveService: (service) => {
    const db = getDB();
    if (!db.services) db.services = [];
    const index = db.services.findIndex(s => s.id === service.id);
    if (index >= 0) {
      db.services[index] = service;
    } else {
      service.id = 'srv_' + Date.now();
      db.services.push(service);
    }
    saveDB(db);
    return service;
  },
  deleteService: (id) => {
    const db = getDB();
    if (!db.services) return;
    db.services = db.services.filter(s => s.id !== id);
    saveDB(db);
  },

  // Notificações
  getNotifications: () => {
    return getDB().notifications;
  },
  markNotificationRead: (id) => {
    const db = getDB();
    const index = db.notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      db.notifications[index].read = true;
      saveDB(db);
    }
  },

  // Usuários
  getUsers: () => {
    return getDB().users;
  },

  // Base de Conhecimento
  getKnowledgeBase: () => {
    return getDB().knowledgeBase || [];
  },
  saveKnowledgeArticle: (article) => {
    const db = getDB();
    if (!db.knowledgeBase) db.knowledgeBase = [];
    const index = db.knowledgeBase.findIndex(a => a.id === article.id);
    if (index >= 0) {
      db.knowledgeBase[index] = { ...article, updatedAt: new Date().toISOString() };
    } else {
      article.id = 'kn_' + Date.now();
      article.updatedAt = new Date().toISOString();
      article.status = 'Treinado';
      db.knowledgeBase.push(article);
    }
    saveDB(db);
    return article;
  },
  deleteKnowledgeArticle: (id) => {
    const db = getDB();
    if (!db.knowledgeBase) return;
    db.knowledgeBase = db.knowledgeBase.filter(a => a.id !== id);
    saveDB(db);
  }
};
