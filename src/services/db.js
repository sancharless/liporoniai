// Banco de dados simulado do Liporoni utilizando localStorage
import parsedProducts from '../data/parsed_products.json';

const STORAGE_KEY = 'liporoni_db';

const defaultDatabase = {
  products: parsedProducts,
  users: [
    {
      id: 'usr_1',
      name: 'Carlos Tact',
      email: 'admin@tactimport.com.br',
      role: 'admin',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      company: 'TACT Import',
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      id: 'usr_2',
      name: 'Ana Guedes',
      email: 'gestor@tactimport.com.br',
      role: 'manager',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      company: 'TACT Import',
      createdAt: '2026-02-15T09:00:00Z'
    },
    {
      id: 'usr_3',
      name: 'Rafael Camargo',
      email: 'vendedor@tactimport.com.br',
      role: 'seller',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      company: 'TACT Import',
      createdAt: '2026-03-10T10:00:00Z'
    }
  ],
  contacts: [
    {
      id: 'ct_1',
      firstName: 'Rodrigo',
      lastName: 'Marcelino',
      company: 'Arena Airsoft SP',
      role: 'Dono do Campo',
      phone: '11991234567',
      email: 'rodrigo@arenaairsoftsp.com.br',
      city: 'São Paulo',
      state: 'SP',
      segment: 'Varejo Airsoft',
      source: 'Outbound Instagram',
      serviceOfInterest: 'BBs e Munições Airsoft',
      notes: 'Dono de campo com loja própria. Compra BBs todo mês para revenda.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-10T10:00:00Z',
      lastContact: '2026-06-18T09:15:00Z',
      nextContact: '2026-06-19T14:00:00Z',
      status: 'Qualificado',
      tags: ['Prioritário', 'Revendedor'],
      consent: true,
      blockReason: null,
      leadScore: 88,
      classification: 'Lead quente',
      chatHistory: [
        { sender: 'agent', message: 'Olá, Rodrigo! 🎯 Aqui é o TACT da TACT Import. Trabalhamos com BBs AmmoBox e BLS, baterias LiPO e equipamentos táticos. Você já trabalha com nossas marcas?', timestamp: '2026-06-18T09:10:00Z' },
        { sender: 'client', message: 'Sim! Já compro AmmoBox, mas quero ver condições de revenda com maior volume.', timestamp: '2026-06-18T09:12:00Z' },
        { sender: 'agent', message: 'Perfeito! Para revendedores, temos desconto progressivo a partir de R$ 500. Qual sua demanda mensal aproximada?', timestamp: '2026-06-18T09:13:00Z' },
        { sender: 'client', message: 'Umas 30 caixas de BBs 0.25g por mês. Pra começar.', timestamp: '2026-06-18T09:15:00Z' }
      ]
    },
    {
      id: 'ct_2',
      firstName: 'Fernanda',
      lastName: 'Alves',
      company: 'Mil Tec Equipamentos',
      role: 'Gerente de Compras',
      phone: '41991223344',
      email: 'fernanda@miltec.com.br',
      city: 'Curitiba',
      state: 'PR',
      segment: 'Distribuição',
      source: 'Import. Planilha',
      serviceOfInterest: 'Equipamentos Táticos FEDERATY',
      notes: 'Distribuidora regional de equipamentos táticos. Pedido de coletes em volume.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-12T11:20:00Z',
      lastContact: '2026-06-17T16:40:00Z',
      nextContact: '2026-06-20T10:00:00Z',
      status: 'Proposta enviada',
      tags: ['Grande Volume', 'Coletes'],
      consent: true,
      blockReason: null,
      leadScore: 92,
      classification: 'Oportunidade prioritária',
      chatHistory: [
        { sender: 'agent', message: 'Olá Fernanda! 🛡️ Sou o TACT da TACT Import. Vimos que você busca equipamentos táticos FEDERATY em volume.', timestamp: '2026-06-17T16:00:00Z' },
        { sender: 'client', message: 'Sim, precisamos de 50 coletes Plate Carrier para entrega em julho.', timestamp: '2026-06-17T16:15:00Z' },
        { sender: 'agent', message: 'Temos estoque do JPS M2 em Multicam e Coyote. Preparei uma proposta com desconto para volume. Posso enviar?', timestamp: '2026-06-17T16:30:00Z' },
        { sender: 'client', message: 'Pode enviar, vou analisar com a diretoria.', timestamp: '2026-06-17T16:40:00Z' }
      ]
    },
    {
      id: 'ct_3',
      firstName: 'Bruno',
      lastName: 'Tavares',
      company: 'Campo de Airsoft Zona Leste',
      role: 'Proprietário',
      phone: '21987654321',
      email: 'bruno@airsoftzonaeste.com.br',
      city: 'Rio de Janeiro',
      state: 'RJ',
      segment: 'Airsoft',
      source: 'Site - Orgânico',
      serviceOfInterest: 'Baterias LiPO FEASSO',
      notes: 'Campo com loja de acessórios. Precisa de baterias e carregadores regularmente.',
      commercialOwner: 'usr_2',
      createdAt: '2026-06-14T08:30:00Z',
      lastContact: '2026-06-18T10:00:00Z',
      nextContact: '2026-06-18T16:00:00Z',
      status: 'Em atendimento',
      tags: ['Urgente'],
      consent: true,
      blockReason: null,
      leadScore: 72,
      classification: 'Lead morno',
      chatHistory: [
        { sender: 'agent', message: 'Olá Bruno! ⚡ TACT Import aqui. Você entrou em contato perguntando sobre baterias LiPO.', timestamp: '2026-06-18T09:45:00Z' },
        { sender: 'client', message: 'Sim! Quero saber se as baterias FEASSO são compatíveis com réplicas AEG de 7.4V.', timestamp: '2026-06-18T10:00:00Z' }
      ]
    },
    {
      id: 'ct_4',
      firstName: 'Lucas',
      lastName: 'Ferreira',
      company: 'Airsoft Nova Lima',
      role: 'Comprador',
      phone: '31977665544',
      email: 'lucas@airsoftnovalima.com.br',
      city: 'Belo Horizonte',
      state: 'MG',
      segment: 'Varejo',
      source: 'Anúncio Instagram',
      serviceOfInterest: 'Máscaras FJA-126',
      notes: 'Pediu para não receber mais mensagens de promoção.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-15T14:00:00Z',
      lastContact: '2026-06-16T11:20:00Z',
      nextContact: null,
      status: 'Bloqueado',
      tags: ['Varejo'],
      consent: false,
      blockReason: 'Solicitou descadastro de campanhas',
      leadScore: 12,
      classification: 'Lead frio',
      chatHistory: [
        { sender: 'agent', message: 'Olá Lucas! TACT Import aqui. Temos promoção nas máscaras FJA-126...', timestamp: '2026-06-16T11:00:00Z' },
        { sender: 'client', message: 'Gostaria de não receber mais promoções. Obrigado.', timestamp: '2026-06-16T11:18:00Z' },
        { sender: 'agent', message: 'Compreendo, Lucas. Seu contato foi removido das campanhas. Qualquer dúvida, é só entrar em contato diretamente!', timestamp: '2026-06-16T11:20:00Z' }
      ]
    },
    {
      id: 'ct_5',
      firstName: 'Paulo',
      lastName: 'Nascimento',
      company: 'Guarda Municipal de Campinas',
      role: 'Oficial de Compras',
      phone: '19988112233',
      email: 'paulo.nascimento@gmc.sp.gov.br',
      city: 'Campinas',
      state: 'SP',
      segment: 'Setor Público',
      source: 'Indicação',
      serviceOfInterest: 'Equipamentos Táticos e Coldres',
      notes: 'Instituição pública interessada em coldres Kydex e joelheiras para treinamento.',
      commercialOwner: 'usr_2',
      createdAt: '2026-06-16T09:00:00Z',
      lastContact: '2026-06-18T10:25:00Z',
      nextContact: '2026-06-18T15:00:00Z',
      status: 'Em qualificação',
      tags: ['Setor Público', 'Alto Potencial'],
      consent: true,
      blockReason: null,
      leadScore: 65,
      classification: 'Lead em análise',
      chatHistory: [
        { sender: 'agent', message: 'Bom dia, Paulo! TACT Import aqui. Somos distribuidores de equipamentos táticos FEDERATY. Vocês buscam coldres e joelheiras para uso institucional?', timestamp: '2026-06-18T10:10:00Z' },
        { sender: 'client', message: 'Sim, precisamos de 30 kits de joelheira+cotoveleira para treinamento tático interno.', timestamp: '2026-06-18T10:20:00Z' },
        { sender: 'agent', message: 'Perfeito! O kit FJA-160 FEDERATY é exatamente para isso. Posso enviar uma proposta formal com nota fiscal?', timestamp: '2026-06-18T10:25:00Z' }
      ]
    },
    {
      id: 'ct_6',
      firstName: 'Marcelo',
      lastName: 'Castro',
      company: 'Airsoft Center Poa',
      role: 'Sócio-Proprietário',
      phone: '51999221100',
      email: 'marcelo@airsoftcenterpoa.com.br',
      city: 'Porto Alegre',
      state: 'RS',
      segment: 'Varejo Airsoft',
      source: 'Indicação',
      serviceOfInterest: 'BBs AmmoBox e Equip. Táticos',
      notes: 'Fechou pedido grande de BBs e coletes em 16/06.',
      commercialOwner: 'usr_3',
      createdAt: '2026-06-11T16:00:00Z',
      lastContact: '2026-06-16T17:00:00Z',
      nextContact: null,
      status: 'Venda realizada',
      tags: ['Contrato Fechado', 'Airsoft'],
      consent: true,
      blockReason: null,
      leadScore: 100,
      classification: 'Oportunidade prioritária',
      chatHistory: [
        { sender: 'agent', message: 'Marcelo, a proposta nº 2026-0002 foi gerada: 200 cx AmmoBox 0.25g + 10 Coletes JPS M2.', timestamp: '2026-06-16T16:00:00Z' },
        { sender: 'client', message: 'Aceito! PIX na hora. Confirma os dados de pagamento.', timestamp: '2026-06-16T16:50:00Z' },
        { sender: 'agent', message: 'Pedido confirmado! Separ. em até 2 dias úteis. Muito obrigado, Marcelo!', timestamp: '2026-06-16T17:00:00Z' }
      ]
    }
  ],
  campaigns: [
    {
      id: 'camp_1',
      name: 'Prospecção Lojas Airsoft — SP Interior',
      status: 'Em andamento',
      objective: 'Captar novos revendedores de airsoft no interior de São Paulo',
      serviceId: 'srv_tact_1',
      targetSegment: 'Varejo Airsoft',
      targetRegion: 'São Paulo Interior',
      sentCount: 180,
      deliveredCount: 175,
      responseCount: 62,
      conversionCount: 14,
      revenue: 18500.00,
      tone: 'Especialista e apaixonado pelo segmento',
      timeRange: '09:00 - 18:00',
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      maxMessages: 400,
      intervalMinutes: 5,
      createdAt: '2026-06-10T09:00:00Z',
      commercialOwner: 'usr_3'
    },
    {
      id: 'camp_2',
      name: 'Reabastecimento BBs AmmoBox — Recorrentes',
      status: 'Em andamento',
      objective: 'Reativar clientes que compraram BBs há mais de 60 dias',
      serviceId: 'srv_tact_1',
      targetSegment: 'Jogadores Ativos',
      targetRegion: 'Brasil',
      sentCount: 95,
      deliveredCount: 92,
      responseCount: 41,
      conversionCount: 22,
      revenue: 8800.00,
      tone: 'Amigável e direto',
      timeRange: '10:00 - 17:00',
      days: ['Terça', 'Quarta', 'Quinta'],
      maxMessages: 250,
      intervalMinutes: 10,
      createdAt: '2026-06-12T10:00:00Z',
      commercialOwner: 'usr_3'
    },
    {
      id: 'camp_3',
      name: 'Lançamento Coletes FEDERATY 2026',
      status: 'Concluída',
      objective: 'Divulgar linha de coletes táticos Plate Carrier JPS M2',
      serviceId: 'srv_tact_2',
      targetSegment: 'Milsim e Skirmish',
      targetRegion: 'Brasil',
      sentCount: 310,
      deliveredCount: 305,
      responseCount: 88,
      conversionCount: 31,
      revenue: 28400.00,
      tone: 'Tático, técnico e apaixonado',
      timeRange: '09:00 - 17:30',
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      maxMessages: 500,
      intervalMinutes: 3,
      createdAt: '2026-06-01T08:00:00Z',
      commercialOwner: 'usr_2'
    }
  ],
  services: [
    {
      id: 'srv_tact_1',
      name: 'BBs e Munições Airsoft',
      category: 'Airsoft',
      description: 'Linha completa de BBs de alta precisão AmmoBox e BLS Perfect BB. Gramaturas: 0.20g, 0.25g, 0.28g, 0.30g. Disponível em caixa e granel (AmmoBox). Também BBs Tracer fluorescentes para partidas noturnas.',
      benefits: 'Maior precisão e alcance, menor fragmentação no cão e na réplica, produção com controle de qualidade rigoroso.',
      technicalInfo: 'Polímero de alta densidade, +/- 0.01mm de variação de diâmetro, acabamento polido. Homologado para uso em AEG e GBB.',
      priceType: 'fixed',
      priceFixed: 39.60,
      priceMin: 35.00,
      estimatedDeliveryDays: 3,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
    },
    {
      id: 'srv_tact_2',
      name: 'Equipamentos Táticos FEDERATY',
      category: 'Tático',
      description: 'Coletes Plate Carrier, Chest Rig, Coldres Kydex, Bandoleiras, Joelheiras e Cotoveleiras, Porta Magazines, Lanternas Táticas, Mochilas e Hidratação.',
      benefits: 'Equipamentos certificados para uso em campo de airsoft e uso tático. Material de alta resistência, sistema MOLLE modular.',
      technicalInfo: 'Coletes em Multicam, Coyote e Preto. Coldres Kydex compatibilizados por modelo de pistola. Lanternas até 1250 lumens.',
      priceType: 'fixed',
      priceFixed: 299.00,
      priceMin: 249.00,
      estimatedDeliveryDays: 5,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
    },
    {
      id: 'srv_tact_3',
      name: 'Baterias e Carregadores FEASSO',
      category: 'Airsoft',
      description: 'Baterias LiPO e NiMH para réplicas AEG. Linha FEASSO com modelos 7.4V e 11.1V. Carregadores específicos com proteção contra sobrecarga.',
      benefits: 'Alta durabilidade, recarga rápida, proteção eletrônica integrada, maior autonomia por partida.',
      technicalInfo: 'LiPO: 7.4V 1300mAh (FFB-006), 11.1V 1200mAh. NiMH: 8.4V 1600mAh. Conectores: Mini Tamiya, Large Tamiya, Deans.',
      priceType: 'fixed',
      priceFixed: 129.00,
      priceMin: 99.00,
      estimatedDeliveryDays: 3,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
    },
    {
      id: 'srv_tact_4',
      name: 'Máscaras de Proteção FEASSO',
      category: 'Proteção',
      description: 'Máscaras full-face e half-face para airsoft. Linha FEASSO FJA com proteção de policarbonato e espuma interna.',
      benefits: 'Proteção total do rosto contra impacto de BBs, visão ampla com lente anti-embaçante, conforto em partidas longas.',
      technicalInfo: 'Modelo FJA-126 (Jay Fast Mask), lente de policarbonato, ajuste headband, disponibilidade: Preto, Marrom e Multicam.',
      priceType: 'fixed',
      priceFixed: 189.00,
      priceMin: 159.00,
      estimatedDeliveryDays: 3,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
    },
    {
      id: 'srv_tact_5',
      name: 'BBs Tracer e Lanternas Táticas',
      category: 'Acessórios',
      description: 'BBs fluorescentes BLS Tracer para partidas noturnas. Lanternas táticas Taclight FEDERATY com até 1250 lumens e alcance de 240 metros.',
      benefits: 'Efeito visual impressionante em partidas noturnas. Lanternas com mont. Picatinny e ativação por pressão.',
      technicalInfo: 'BBs Tracer: 0.20g e 0.25g, fluorescentes UV. Lanterna FTL-G3: 1250 lm, IP65, bateria 18650 incluída.',
      priceType: 'fixed',
      priceFixed: 79.00,
      priceMin: 69.00,
      estimatedDeliveryDays: 3,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
    },
    {
      id: 'srv_tact_6',
      name: 'Automação e Informática FEASSO',
      category: 'Tecnologia',
      description: 'Impressoras térmicas, leitores de código de barras, hubs USB, cabos HDMI, adaptadores e acessórios para notebook. Linha FEASSO Automação e FEASSO Informática.',
      benefits: 'Soluções de tecnologia para o negócio: automação de loja, checkout rápido, conectividade home office.',
      technicalInfo: 'Impressoras térmicas 58/80mm. Leitores 1D/2D USB. HUBs USB 3.0 com até 7 portas. Extensor HDMI até 60m.',
      priceType: 'fixed',
      priceFixed: 149.00,
      priceMin: 119.00,
      estimatedDeliveryDays: 5,
      proposalValidityDays: 15,
      paymentTerms: 'PIX, boleto ou cartão em até 6x'
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
    agentName: 'TACT',
    agentPhoto: 'https://tactimport.com/image/catalog/logo-tipo/tact-logo-maior2.png',
    companyRepresented: 'TACT Import',
    greeting: 'Olá, {{nome}}! 🎯 Aqui é o TACT, assistente comercial da TACT Import. Trabalhamos com os melhores equipamentos de Airsoft e produtos táticos. Como posso te ajudar hoje?',
    toneOfVoice: 'Especialista em airsoft e equipamentos táticos, objetivo e apaixonado pelo segmento',
    formalGrade: 'moderate',
    maxResponseLength: 300,
    useEmojis: true,
    startTime: '08:00',
    endTime: '18:00',
    workDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    outOfHoursMessage: 'Olá! Aqui é o TACT da TACT Import 🎯 No momento estamos fora do horário de atendimento (segunda a sexta, 08h às 18h). Deixe sua mensagem e retornamos assim que possível!',
    maxFollowUps: 3,
    followUpIntervalHours: 24,
    maxDiscountAllowed: 10.0
  },
  knowledgeBase: [
    {
      id: 'kn_1',
      title: 'Diferença entre Gramaturas de BBs Airsoft',
      category: 'Produtos',
      content: 'BBs 0.20g: ideais para réplicas CQB e iniciantes, maior velocidade. BBs 0.25g: uso geral, melhor estabilidade em média distância. BBs 0.28g: recomendado para réplicas com hop-up regulado e campos abertos. BBs 0.30g: para snipers e réplicas de alta performance, maior precisão no vento. Marcas premium: AmmoBox e BLS Perfect BB. Escolha sempre a gramatura adequada à sua réplica e ao ambiente de jogo.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:00:00Z'
    },
    {
      id: 'kn_2',
      title: 'Guia de Baterias LiPO para Airsoft',
      category: 'Produtos',
      content: 'Baterias LiPO (Lítio Poímero) são mais leves e potentes que as NiMH. Voltagem: 7.4V para réplicas padrão, 11.1V para AEGs de alta performance. Capacidade em mAh: quanto maior, mais dura a bateria por partida. ATENÇÃO: baterias LiPO requerem carregador específico e não devem ser descarregadas abaixo de 3V por célula. Sempre armazene em bolsa ignifüga. Linha FEASSO: FFB-006 (7.4V 1300mAh) e FFB-007 (11.1V 1200mAh).',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:05:00Z'
    },
    {
      id: 'kn_3',
      title: 'Equipamentos Táticos — Coletes e Coldres',
      category: 'Táticos',
      content: 'Coletes Plate Carrier: estrutura modular com sistema MOLLE para adicionar bolsos e acessórios. Linha FEDERATY JPS M2 disponibiliza coletes em Multicam, Preto e Coyote. Coldres Kydex: material termoplástico rígido, saque rápido, compatibilidade por modelo de pistola (1911, G17, G19 etc.). Bandoleiras e chest rigs completam o setup para milsim e skirmish.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:10:00Z'
    },
    {
      id: 'kn_4',
      title: 'Política de Frete e Prazos TACT Import',
      category: 'Logística',
      content: 'Frete disponível para todo o Brasil via Correios e transportadoras parceiras. Prazo de separação: 1-2 dias úteis. Entrega: varia conforme região (3 a 10 dias úteis). Frete grátis para pedidos acima de R$ 299,00 para SP capital. Retirada no estoque em São Paulo disponível. Pedidos atacado (acima de 20 unidades) têm condições especiais de frete negociadas.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:15:00Z'
    },
    {
      id: 'kn_5',
      title: 'Condições Comerciais para Revendedores',
      category: 'Comercial',
      content: 'TACT Import atende tanto consumidor final (B2C) quanto revendedores (B2B). Para revenda: pedido mínimo de R$ 500,00. Desconto progressivo: 5% acima de R$ 500, 8% acima de R$ 1.000, 10% acima de R$ 3.000. Pagamento via PIX (desconto adicional de 2%), boleto 28 dias ou cartão em até 6x. Prazo de cadastro como revendedor: enviar CNPJ e inscrição estadual.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:20:00Z'
    },
    {
      id: 'kn_6',
      title: 'Garantia e Devolução — TACT Import',
      category: 'Pós-venda',
      content: 'Garantia assistida de 3 meses para defeitos de fábrica em baterias e acessórios elétricos. BBs não têm garantia. Devolução aceitável em até 7 dias corridos após recebimento se produto não aberto/usado (Código do Consumidor). Para acionar garantia: enviar foto/vídeo do defeito via WhatsApp ou e-mail com número do pedido. Site: tactimport.com/garantia-assistida.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:25:00Z'
    },
    {
      id: 'kn_7',
      title: 'BBs Tracer — O que são e como usar',
      category: 'Produtos',
      content: 'BBs Tracer são muços fluorescentes que acendem brevemente ao passar pelo tracer unit (silenciador com LED UV acoplado à réplica). Criam efeito visual de rajadas luminosas no escuro. Disponíveis em 0.20g e 0.25g. Marcas: BLS Tracer e AmmoBox Tracer. Compatíveis com TODAS as réplicas AEG e GBB que possuem rosca de supressor 14mm CW ou CCW.',
      type: 'text',
      status: 'Treinado',
      updatedAt: '2026-06-18T10:30:00Z'
    }
  ],
  meetings: [
    {
      id: 'meet_1',
      contactId: 'ct_1',
      title: 'Demonstração Comercial Liporoni',
      type: 'Demonstração',
      date: '2026-06-22',
      time: '14:00',
      status: 'Pendente',
      notes: 'Apresentar funcionamento do bot integrado com o banco de dados.'
    },
    {
      id: 'meet_2',
      contactId: 'ct_2',
      title: 'Alinhamento Técnico API',
      type: 'Reunião Técnica',
      date: '2026-06-24',
      time: '10:00',
      status: 'Confirmada',
      notes: 'Validar documentação dos webhooks do ERP.'
    },
    {
      id: 'meet_3',
      contactId: 'ct_5',
      title: 'Visita de Fechamento',
      type: 'Visita Comercial',
      date: '2026-06-26',
      time: '15:30',
      status: 'Confirmada',
      notes: 'Apresentar proposta física no escritório.'
    }
  ],
  automations: [
    {
      id: 'auto_1',
      name: 'Adicionar à Campanha Tech SP',
      status: 'Ativa',
      trigger: { type: 'contact_created', label: 'Contato Criado' },
      condition: { field: 'segment', operator: 'equals', value: 'Tecnologia', label: 'Segmento é Tecnologia' },
      action: { type: 'add_to_campaign', value: 'camp_1', label: 'Adicionar à Campanha Tech SP 2026' }
    },
    {
      id: 'auto_2',
      name: 'Qualificação Automática via IA',
      status: 'Ativa',
      trigger: { type: 'message_received', label: 'Mensagem Recebida' },
      condition: { field: 'leadScore', operator: 'greater_than', value: 30, label: 'Score do Lead > 30' },
      action: { type: 'start_ia_chat', value: 'active', label: 'Ativar Conversação com Liporoni.ai' }
    },
    {
      id: 'auto_3',
      name: 'Alerta de Lead Quente',
      status: 'Inativa',
      trigger: { type: 'scoring_changed', label: 'Score Alterado' },
      condition: { field: 'leadScore', operator: 'greater_than', value: 80, label: 'Score do Lead > 80' },
      action: { type: 'notify_owner', value: 'all', label: 'Notificar Responsável Comercial' }
    }
  ],
  opportunities: [
    {
      id: 'opp_1',
      title: 'Consultoria IA Comercial',
      contactId: 'ct_1',
      contactName: 'Thiago Mendes',
      company: 'Tech Innovators',
      value: 5000,
      stage: 'prospecting',
      probability: 30,
      ownerId: 'usr_3',
      ownerName: 'Eduardo Santos',
      closeDate: '2026-07-15',
      notes: 'Cliente demonstrou interesse em automatizar triagem comercial.',
      createdAt: '2026-06-01T08:00:00Z'
    },
    {
      id: 'opp_2',
      title: 'Triagem e Atendimento Automatizado',
      contactId: 'ct_2',
      contactName: 'Carlos Gomes',
      company: 'Oliveira & Associados',
      value: 4000,
      stage: 'prospecting',
      probability: 40,
      ownerId: 'usr_3',
      ownerName: 'Eduardo Santos',
      closeDate: '2026-07-20',
      notes: 'Aguardando reunião de alinhamento técnico.',
      createdAt: '2026-06-05T09:00:00Z'
    },
    {
      id: 'opp_3',
      title: 'WhatsApp API Oficial + Liporoni',
      contactId: 'ct_3',
      contactName: 'Ana Lima',
      company: 'Indústria Metalúrgica Sul',
      value: 4788,
      stage: 'proposal',
      probability: 65,
      ownerId: 'usr_2',
      ownerName: 'Mariana Costa',
      closeDate: '2026-06-30',
      notes: 'Proposta #2026-0001 enviada. Aguardando decisão da diretoria.',
      createdAt: '2026-06-10T10:00:00Z'
    },
    {
      id: 'opp_4',
      title: 'Agendamento Automático Premium',
      contactId: 'ct_4',
      contactName: 'Fernanda Ramos',
      company: 'Clínica Saúde Total',
      value: 6200,
      stage: 'negotiation',
      probability: 80,
      ownerId: 'usr_2',
      ownerName: 'Mariana Costa',
      closeDate: '2026-06-25',
      notes: 'Negociando desconto de 10% para contrato anual.',
      createdAt: '2026-06-12T11:00:00Z'
    },
    {
      id: 'opp_5',
      title: 'Agendamento Automático Clínica',
      contactId: 'ct_5',
      contactName: 'Aline Prado',
      company: 'Lins Consultórios',
      value: 5000,
      stage: 'closed_won',
      probability: 100,
      ownerId: 'usr_3',
      ownerName: 'Eduardo Santos',
      closeDate: '2026-06-15',
      notes: 'Contrato assinado digitalmente via portal de propostas.',
      createdAt: '2026-06-01T07:00:00Z'
    }
  ],
  auditLog: [
    { id: 'audit_1', userId: 'usr_1', userName: 'Carlos Tact', action: 'Login', module: 'Autenticação', detail: 'Acesso ao sistema TACT Import realizado com sucesso.', timestamp: '2026-06-18T08:00:00Z' },
    { id: 'audit_2', userId: 'usr_3', userName: 'Rafael Camargo', action: 'Criar Contato', module: 'Contatos', detail: 'Contato Rodrigo Marcelino (Arena Airsoft SP) adicionado à base.', timestamp: '2026-06-18T09:05:00Z' },
    { id: 'audit_3', userId: 'usr_3', userName: 'Rafael Camargo', action: 'Gerar Proposta', module: 'Catálogo', detail: 'Proposta #2026-0001 gerada para Mil Tec — 50 coletes JPS M2 — R$ 14.950,00.', timestamp: '2026-06-18T09:30:00Z' },
    { id: 'audit_4', userId: 'usr_2', userName: 'Ana Guedes', action: 'Aprovar Proposta', module: 'Propostas', detail: 'Proposta #2026-0001 aprovada e enviada para a Mil Tec Equipamentos.', timestamp: '2026-06-18T10:00:00Z' },
    { id: 'audit_5', userId: 'usr_1', userName: 'Carlos Tact', action: 'Iniciar Campanha', module: 'Campanhas', detail: 'Campanha "Prospecção Lojas Airsoft SP" ativada — 400 contatos.', timestamp: '2026-06-18T10:30:00Z' },
    { id: 'audit_6', userId: 'usr_3', userName: 'Rafael Camargo', action: 'Editar Produto', module: 'Catálogo', detail: 'Preço do AmmoBox 0.25g (cód. 782) atualizado para R$ 44,55.', timestamp: '2026-06-18T11:00:00Z' }
  ]
};

// Inicializador — TACT Import v2.0
export const initializeDB = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
    return;
  }
  try {
    const db = JSON.parse(existing);
    // Force reset if still pointing to old Liporoni data
    const isOldData = db.settings?.companyRepresented !== 'TACT Import';
    if (isOldData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
      return;
    }
    // Patch products if missing
    if (!db.products) {
      db.products = parsedProducts;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch (e) {
    console.error('DB parse error, resetting:', e);
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
  getProposalById: (id) => {
    return getDB().proposals.find(p => p.id === id || p.proposalNumber === id);
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
  updateProposalStatus: (id, status, details = {}) => {
    const db = getDB();
    const propIndex = db.proposals.findIndex(p => p.id === id || p.proposalNumber === id);
    if (propIndex < 0) return null;

    const proposal = db.proposals[propIndex];
    proposal.status = status;
    proposal.lastViewedAt = new Date().toISOString();

    const contactIndex = db.contacts.findIndex(c => c.id === proposal.contactId);
    let contact = contactIndex >= 0 ? db.contacts[contactIndex] : null;

    if (status === 'Aceita') {
      proposal.acceptedAt = new Date().toISOString();
      proposal.refusedAt = null;
      proposal.refuseReason = null;

      if (contact) {
        contact.status = 'Venda realizada';
        contact.leadScore = 100;
        contact.lastContact = new Date().toISOString();
        if (!contact.chatHistory) contact.chatHistory = [];
        contact.chatHistory.push({
          sender: 'agent',
          message: `✅ ASSINATURA DIGITAL REALIZADA - Proposta Comercial #${proposal.proposalNumber} aceita por ${details.signerName || 'Cliente'} (Documento: ${details.signerDoc || 'N/A'}). Status atualizado para Venda Realizada!`,
          timestamp: new Date().toISOString()
        });
      }

      // Add Notification
      db.notifications.push({
        id: 'not_' + Date.now(),
        type: 'proposal_accepted',
        title: 'Proposta Aceita!',
        message: `A proposta comercial nº ${proposal.proposalNumber} para ${proposal.clientCompany} foi assinada digitalmente.`,
        timestamp: new Date().toISOString(),
        read: false
      });

    } else if (status === 'Recusada') {
      proposal.refusedAt = new Date().toISOString();
      proposal.refuseReason = details.reason || 'Outro';
      proposal.acceptedAt = null;

      if (contact) {
        contact.status = 'Bloqueado'; // Evitar envios comerciais
        contact.consent = false;
        contact.blockReason = `Proposta Comercial Recusada: ${details.reason || 'Não especificado'}. Obs: ${details.comments || ''}`;
        contact.leadScore = Math.max(0, contact.leadScore - 30);
        contact.lastContact = new Date().toISOString();
        if (!contact.chatHistory) contact.chatHistory = [];
        contact.chatHistory.push({
          sender: 'client',
          message: `❌ PROPOSTA RECUSADA - Motivo: ${details.reason || 'Outro'}. Observações: ${details.comments || 'Nenhuma'}`,
          timestamp: new Date().toISOString()
        });
      }

      // Add Notification
      db.notifications.push({
        id: 'not_' + Date.now(),
        type: 'scoring',
        title: 'Proposta Recusada',
        message: `A proposta comercial nº ${proposal.proposalNumber} para ${proposal.clientCompany} foi recusada pelo cliente.`,
        timestamp: new Date().toISOString(),
        read: false
      });

    } else if (status === 'Ajuste solicitado' || status === 'Em ajuste') {
      proposal.status = 'Em ajuste'; // normalize state
      
      if (contact) {
        contact.status = 'Em atendimento';
        contact.lastContact = new Date().toISOString();
        if (!contact.chatHistory) contact.chatHistory = [];
        contact.chatHistory.push({
          sender: 'client',
          message: `✍️ SOLICITAÇÃO DE AJUSTE - O cliente solicitou alterações na proposta. Observações: ${details.comments || 'Sem comentários adicionais.'}`,
          timestamp: new Date().toISOString()
        });
      }

      // Add Notification
      db.notifications.push({
        id: 'not_' + Date.now(),
        type: 'human_request',
        title: 'Ajuste de Proposta Solicitado',
        message: `O cliente (${proposal.clientCompany}) solicitou alterações na proposta nº ${proposal.proposalNumber}.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    saveDB(db);
    return { proposal, contact };
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
  },

  // Reuniões / Agenda
  getMeetings: () => {
    return getDB().meetings || [];
  },
  saveMeeting: (meeting) => {
    const db = getDB();
    if (!db.meetings) db.meetings = [];
    const index = db.meetings.findIndex(m => m.id === meeting.id);
    if (index >= 0) {
      db.meetings[index] = meeting;
    } else {
      meeting.id = 'meet_' + Date.now();
      db.meetings.push(meeting);
    }
    saveDB(db);
    return meeting;
  },
  deleteMeeting: (id) => {
    const db = getDB();
    if (!db.meetings) return;
    db.meetings = db.meetings.filter(m => m.id !== id);
    saveDB(db);
  },

  // Automações / Workflows
  getAutomations: () => {
    return getDB().automations || [];
  },
  saveAutomation: (automation) => {
    const db = getDB();
    if (!db.automations) db.automations = [];
    const index = db.automations.findIndex(a => a.id === automation.id);
    if (index >= 0) {
      db.automations[index] = automation;
    } else {
      automation.id = 'auto_' + Date.now();
      db.automations.push(automation);
    }
    saveDB(db);
    return automation;
  },
  deleteAutomation: (id) => {
    const db = getDB();
    if (!db.automations) return;
    db.automations = db.automations.filter(a => a.id !== id);
    saveDB(db);
  },

  // Usuários (com CRUD e toggle ativo)
  saveUser: (user) => {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      db.users[index] = user;
    } else {
      user.id = 'usr_' + Date.now();
      user.createdAt = new Date().toISOString();
      db.users.push(user);
    }
    saveDB(db);
    return user;
  },
  toggleUserActive: (id) => {
    const db = getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index >= 0) {
      db.users[index].active = !db.users[index].active;
      saveDB(db);
    }
  },

  // Audit Log
  getAuditLog: () => {
    return (getDB().auditLog || []).slice().reverse(); // mais recente primeiro
  },

  // Oportunidades
  getOpportunities: () => getDB().opportunities || [],
  saveOpportunity: (opp) => {
    const db = getDB();
    if (!db.opportunities) db.opportunities = [];
    const index = db.opportunities.findIndex(o => o.id === opp.id);
    if (index >= 0) {
      db.opportunities[index] = opp;
    } else {
      opp.id = 'opp_' + Date.now();
      opp.createdAt = new Date().toISOString();
      db.opportunities.push(opp);
    }
    saveDB(db);
    return opp;
  },
  moveOpportunity: (id, newStage) => {
    const db = getDB();
    if (!db.opportunities) return;
    const idx = db.opportunities.findIndex(o => o.id === id);
    if (idx >= 0) {
      db.opportunities[idx].stage = newStage;
      saveDB(db);
    }
  },
  deleteOpportunity: (id) => {
    const db = getDB();
    if (!db.opportunities) return;
    db.opportunities = db.opportunities.filter(o => o.id !== id);
    saveDB(db);
  },

  // Produtos / Catálogo
  getProducts: () => {
    return getDB().products || [];
  },
  saveProduct: (product) => {
    const db = getDB();
    if (!db.products) db.products = [];
    const index = db.products.findIndex(p => p.code === product.code);
    const now = new Date().toISOString();
    
    // Convert price to number
    const newPrice = Number(product.price);
    
    let priceHistory = [];
    let existingProduct = null;
    
    if (index >= 0) {
      existingProduct = db.products[index];
      priceHistory = existingProduct.priceHistory || [];
      const oldPrice = existingProduct.price;
      
      if (oldPrice !== newPrice) {
        priceHistory.push({ price: newPrice, date: now });
      }
      
      db.products[index] = {
        ...existingProduct,
        ...product,
        price: newPrice,
        priceHistory,
        updatedAt: now,
        id: existingProduct.id || `prod_${product.code}`
      };
    } else {
      priceHistory.push({ price: newPrice, date: now });
      const newProd = {
        ...product,
        id: `prod_${product.code}`,
        price: newPrice,
        priceHistory,
        createdAt: now,
        updatedAt: now
      };
      db.products.push(newProd);
    }
    saveDB(db);
    return index >= 0 ? db.products[index] : db.products[db.products.length - 1];
  },
  importProducts: (productsList, userId, userName) => {
    const db = getDB();
    if (!db.products) db.products = [];
    
    const now = new Date().toISOString();
    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    let needsRevisionCount = 0;
    
    const importLog = [];
    
    productsList.forEach(item => {
      const code = item.code;
      const index = db.products.findIndex(p => p.code === code);
      const newPrice = Number(item.price);
      
      const needsRevision = item.needsRevision || item.description.endsWith('..') || item.description.endsWith('...');
      const revisionReason = needsRevision ? (item.revisionReason || 'Descrição abreviada no catálogo de origem') : '';
      
      if (index >= 0) {
        const existing = db.products[index];
        const oldPrice = existing.price;
        
        let priceHistory = existing.priceHistory || [];
        let priceChanged = false;
        
        if (oldPrice !== newPrice) {
          priceHistory.push({ price: newPrice, date: now });
          priceChanged = true;
        }
        
        // Check if anything changed
        const isDifferent = priceChanged || 
                            existing.description !== item.description || 
                            existing.category !== item.category || 
                            existing.subcategory !== item.subcategory ||
                            existing.page !== item.page ||
                            existing.needsRevision !== needsRevision;
                            
        if (isDifferent) {
          db.products[index] = {
            ...existing, // preserve manual edits/notes
            description: item.description,
            price: newPrice,
            category: item.category,
            subcategory: item.subcategory,
            page: item.page,
            needsRevision,
            revisionReason,
            priceHistory,
            updatedAt: now
          };
          updatedCount++;
          importLog.push({ code, action: 'UPDATE', details: `Preço antigo: R$ ${oldPrice} -> Novo: R$ ${newPrice}` });
        } else {
          unchangedCount++;
        }
      } else {
        const priceHistory = [{ price: newPrice, date: now }];
        db.products.push({
          id: `prod_${code}`,
          code,
          description: item.description,
          price: newPrice,
          category: item.category,
          subcategory: item.subcategory,
          page: item.page,
          needsRevision,
          revisionReason,
          priceHistory,
          createdAt: now,
          updatedAt: now
        });
        newCount++;
        importLog.push({ code, action: 'CREATE', details: `Criado com preço R$ ${newPrice}` });
      }
      
      if (needsRevision) {
        needsRevisionCount++;
      }
    });
    
    // Log audit event
    db.auditLog.push({
      id: 'audit_' + Date.now(),
      userId: userId || 'sys',
      userName: userName || 'Sistema',
      action: 'Importar Catálogo',
      module: 'Catálogo',
      detail: `Importação de catálogo concluída: ${newCount} novos, ${updatedCount} atualizados, ${unchangedCount} sem alteração.`,
      timestamp: now
    });
    
    saveDB(db);
    
    return {
      newCount,
      updatedCount,
      unchangedCount,
      needsRevisionCount,
      totalImported: productsList.length,
      log: importLog
    };
  },
  getPriceHistory: (code) => {
    const db = getDB();
    const product = (db.products || []).find(p => p.code === code);
    return product ? (product.priceHistory || []) : [];
  }
};

// Utilitário global de auditoria — importável em qualquer módulo
export const logAuditEvent = ({ userId, userName, action, module: mod, detail }) => {
  const db = getDB();
  if (!db.auditLog) db.auditLog = [];
  db.auditLog.push({
    id: 'audit_' + Date.now(),
    userId: userId || 'sys',
    userName: userName || 'Sistema',
    action,
    module: mod,
    detail,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
};
