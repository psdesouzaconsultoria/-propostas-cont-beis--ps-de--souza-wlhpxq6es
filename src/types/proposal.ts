export type PlanKey = 'bronze' | 'prata' | 'ouro'

export type TaxRegimeKey = 'simples_servico' | 'simples_comercio' | 'lucro_presumido' | 'lucro_real'

export interface RevenueTier {
  max: number // Faturamento máximo mensal
  additional: Record<PlanKey, number> // Adicional mensal
}

export interface PricingConfig {
  basePrices: Record<TaxRegimeKey, Record<PlanKey, number>>
  revenueTiers: RevenueTier[]
  employeeCostPerHead: Record<PlanKey, number>
  admissionDepartureCost: Record<PlanKey, number>
  invoicesAllowance: Record<PlanKey, number>
  excessInvoiceCost: Record<PlanKey, number>
}

export interface OfficeSettings {
  id: string
  collectionId?: string
  /** Nome do arquivo de imagem da logo enviado ao PocketBase (opcional). */
  logo?: string
  office_name: string
  responsible_name: string
  contact_email: string
  contact_phone: string
  contact_website: string
  validity_days: number
  commercial_notes: string
  pricing_config: PricingConfig
  created?: string
  updated?: string
}

export interface CorporateService {
  id: string
  name: string
  category: string
  regular_price: number
  discount_percent: number
  observations: string
  order: number
  is_active: boolean
  created?: string
  updated?: string
}

export interface ProposalInput {
  client_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  client_segment: string
  tax_regime: TaxRegimeKey
  monthly_revenue: number
  employees_count: number
  invoices_count: number
  admissions_departures_count: number
  recommended_plan: PlanKey
  included_plans: PlanKey[]
  include_corporate_card: boolean
  notes?: string
}

export interface PlanBreakdown {
  base: number
  revenueTier: number
  employees: number
  admissions: number
  excessInvoices: number
  excessInvoicesCount: number
  total: number
}

export interface CalculatedPlans {
  bronze: PlanBreakdown
  prata: PlanBreakdown
  ouro: PlanBreakdown
}

export interface ProposalRecord extends ProposalInput {
  id: string
  code: string
  calculated_plans: CalculatedPlans
  status: 'draft' | 'sent' | 'approved' | 'declined'
  valid_until?: string
  created_by?: string
  created?: string
  updated?: string
}

export interface ScopeFeature {
  title: string
  description?: string
  category:
    | 'Fiscal & Tributário'
    | 'Contábil & Balanços'
    | 'Folha & RH'
    | 'Gestão & Atendimento'
    | 'Tecnologia & BPO'
  availableIn: Record<PlanKey, boolean | string>
  applicableRegimes?: TaxRegimeKey[]
}
