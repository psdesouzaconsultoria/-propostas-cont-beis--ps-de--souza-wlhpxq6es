import type {
  PricingConfig,
  ProposalInput,
  CalculatedPlans,
  PlanBreakdown,
  PlanKey,
  ScopeFeature,
  TaxRegimeKey,
} from '@/types/proposal'

export const TAX_REGIME_LABELS: Record<TaxRegimeKey, string> = {
  simples_servico: 'Simples Nacional (Serviços)',
  simples_comercio: 'Simples Nacional (Comércio/Indústria)',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

export const PLAN_NAMES: Record<PlanKey, string> = {
  bronze: 'Plano Bronze (Essencial)',
  prata: 'Plano Prata (Profissional)',
  ouro: 'Plano Ouro (Estratégico / Full BPO)',
}

export const PLAN_COLORS: Record<
  PlanKey,
  {
    badge: string
    border: string
    bg: string
    headerBg: string
    text: string
    highlight: string
  }
> = {
  bronze: {
    badge:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    border: 'border-amber-300 dark:border-amber-800',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    headerBg: 'bg-gradient-to-r from-amber-700 to-amber-900 text-white',
    text: 'text-amber-800 dark:text-amber-300',
    highlight: 'text-amber-900 dark:text-amber-200',
  },
  prata: {
    badge:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    border: 'border-slate-400 dark:border-slate-600 shadow-md',
    bg: 'bg-slate-50/50 dark:bg-slate-900/30',
    headerBg: 'bg-gradient-to-r from-slate-600 to-slate-800 text-white',
    text: 'text-slate-800 dark:text-slate-200',
    highlight: 'text-slate-900 dark:text-slate-100',
  },
  ouro: {
    badge:
      'bg-yellow-100 text-yellow-900 border-yellow-400 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-700',
    border: 'border-yellow-500/80 dark:border-yellow-600 shadow-lg ring-1 ring-yellow-400/40',
    bg: 'bg-yellow-50/40 dark:bg-yellow-950/20',
    headerBg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950',
    text: 'text-amber-900 dark:text-yellow-400',
    highlight: 'text-yellow-950 dark:text-yellow-200',
  },
}

/**
 * Calculates pricing for Bronze, Prata and Ouro based on inputs and pricing rules
 */
export function calculatePlanPricing(
  input: Pick<
    ProposalInput,
    | 'tax_regime'
    | 'monthly_revenue'
    | 'employees_count'
    | 'invoices_count'
    | 'admissions_departures_count'
  >,
  config: PricingConfig,
): CalculatedPlans {
  const {
    tax_regime,
    monthly_revenue,
    employees_count,
    invoices_count,
    admissions_departures_count,
  } = input

  const plans: PlanKey[] = ['bronze', 'prata', 'ouro']
  const result: Partial<CalculatedPlans> = {}

  // Find revenue tier additional cost
  // Tiers are sorted by max revenue ascending
  const sortedTiers = [...config.revenueTiers].sort((a, b) => a.max - b.max)
  let matchedTier = sortedTiers.find((t) => monthly_revenue <= t.max)
  if (!matchedTier && sortedTiers.length > 0) {
    // If above highest tier, use highest tier
    matchedTier = sortedTiers[sortedTiers.length - 1]
  }

  for (const plan of plans) {
    const base = config.basePrices[tax_regime]?.[plan] ?? 500
    const revenueTier = matchedTier ? (matchedTier.additional[plan] ?? 0) : 0
    const employees = Math.max(0, employees_count) * (config.employeeCostPerHead[plan] ?? 40)
    const admissions =
      Math.max(0, admissions_departures_count) * (config.admissionDepartureCost[plan] ?? 50)

    const allowance = config.invoicesAllowance[plan] ?? 50
    const excessInvoicesCount = Math.max(0, invoices_count - allowance)
    const excessInvoices = excessInvoicesCount * (config.excessInvoiceCost[plan] ?? 2.5)

    const total = base + revenueTier + employees + admissions + excessInvoices

    const breakdown: PlanBreakdown = {
      base,
      revenueTier,
      employees,
      admissions,
      excessInvoices: Math.round(excessInvoices * 100) / 100,
      excessInvoicesCount,
      total: Math.round(total * 100) / 100,
    }

    result[plan] = breakdown
  }

  return result as CalculatedPlans
}

/**
 * Master Scope Feature matrix ("O que está incluso")
 * Filtered by tax regime if applicable
 */
export const SCOPE_FEATURES: ScopeFeature[] = [
  // Fiscal & Tributário
  {
    category: 'Fiscal & Tributário',
    title: 'Apuração mensal de tributos e envio das guias (DAS, PIS, COFINS, IRPJ, CSLL, ISS)',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Fiscal & Tributário',
    title: 'Escrituração de Notas Fiscais de Entrada, Saída e Tomadas',
    description: 'Conforme franquia estipulada no plano',
    availableIn: {
      bronze: 'Até 30 NFs/mês',
      prata: 'Até 70 NFs/mês',
      ouro: 'Até 150 NFs/mês (ou ilimitado negociado)',
    },
  },
  {
    category: 'Fiscal & Tributário',
    title:
      'Entrega de Obrigações Acessórias (SPED Fiscal, EFD Contribuições, DCTF, DEFIS, ECD/ECF)',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Fiscal & Tributário',
    title: 'Planejamento Tributário Anual & Revisão de Enquadramento (Simples x Presumido x Real)',
    availableIn: { bronze: false, prata: '1x ao ano', ouro: 'Trimestral / Contínuo' },
  },
  {
    category: 'Fiscal & Tributário',
    title: 'Recuperação de Créditos Tributários Monofásicos (PIS/COFINS)',
    applicableRegimes: ['simples_comercio', 'lucro_presumido', 'lucro_real'],
    availableIn: {
      bronze: false,
      prata: 'Diagnóstico básico',
      ouro: 'Diagnóstico & Homologação completa',
    },
  },

  // Contábil & Balanços
  {
    category: 'Contábil & Balanços',
    title: 'Elaboração de Balancetes e Demonstrações Contábeis (DRE, Balanço Patrimonial, DMPL)',
    availableIn: { bronze: 'Anual', prata: 'Trimestral', ouro: 'Mensal com DFC' },
  },
  {
    category: 'Contábil & Balanços',
    title: 'Conciliação Bancária das Contas da Pessoa Jurídica (OFX / API)',
    availableIn: { bronze: 'Até 2 contas', prata: 'Até 5 contas', ouro: 'Ilimitadas + Cartões' },
  },
  {
    category: 'Contábil & Balanços',
    title: 'Controle de Ativo Imobilizado e Depreciações',
    applicableRegimes: ['lucro_presumido', 'lucro_real'],
    availableIn: { bronze: false, prata: true, ouro: true },
  },
  {
    category: 'Contábil & Balanços',
    title: 'Relatório Executivo Gerencial com Índices de Liquidez e Rentabilidade',
    availableIn: { bronze: false, prata: 'Semestral', ouro: 'Mensal com reunião' },
  },

  // Folha & RH
  {
    category: 'Folha & RH',
    title: 'Elaboração de Folha de Pagamento, Pró-Labore, Recibos e Guias (FGTS / INSS / IRRF)',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Folha & RH',
    title: 'Envio completo dos eventos do eSocial e DCTFWeb',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Folha & RH',
    title: 'Gestão de Férias, 13º Salário e Aviso Prévio com controle de prazos',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Folha & RH',
    title: 'Acompanhamento de Convenções Coletivas e Dissídios Sindicais',
    availableIn: { bronze: false, prata: true, ouro: true },
  },
  {
    category: 'Folha & RH',
    title: 'Integração de Ponto Eletrônico e Benefícios (Vale Refeição / Transporte / Plano)',
    availableIn: { bronze: false, prata: 'Básico', ouro: 'Avançado / Automatizado' },
  },

  // Gestão & Atendimento
  {
    category: 'Gestão & Atendimento',
    title: 'Canal de Atendimento do Escritório',
    availableIn: {
      bronze: 'E-mail e Chamados (sla 24h)',
      prata: 'WhatsApp e E-mail (sla 8h)',
      ouro: 'WhatsApp prioritário + Gerente Dedicado',
    },
  },
  {
    category: 'Gestão & Atendimento',
    title: 'Reuniões Periódicas de Alinhamento com o Contador Responsável',
    availableIn: {
      bronze: false,
      prata: 'Sob demanda (1x semestre)',
      ouro: 'Mensal (1h executiva)',
    },
  },
  {
    category: 'Gestão & Atendimento',
    title:
      'Certidões Negativas Mensais Automatizadas (Receita Federal, FGTS, Trabalhista e Estadual)',
    availableIn: { bronze: false, prata: true, ouro: 'Monitoramento semanal' },
  },

  // Tecnologia & BPO
  {
    category: 'Tecnologia & BPO',
    title: 'Acesso à Plataforma Digital / Painel do Cliente para envio de documentos e guias',
    availableIn: { bronze: true, prata: true, ouro: true },
  },
  {
    category: 'Tecnologia & BPO',
    title: 'Emissor Integrado de Notas Fiscais de Serviços (NFS-e) ou Vendas',
    availableIn: { bronze: false, prata: 'Incluso', ouro: 'Incluso + Emissão Assistida' },
  },
  {
    category: 'Tecnologia & BPO',
    title: 'BPO Financeiro (Contas a Pagar e Contas a Receber Conciliados)',
    availableIn: { bronze: false, prata: false, ouro: 'Opção de Pacote Integrado' },
  },
]

export function getFilteredScopeFeatures(regime: TaxRegimeKey): ScopeFeature[] {
  return SCOPE_FEATURES.filter((item) => {
    if (!item.applicableRegimes) return true
    return item.applicableRegimes.includes(regime)
  })
}

export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val)
}
