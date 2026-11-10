import { useState, useEffect } from 'react'
import { getOfficeSettings, defaultPricingConfig } from '@/services/settings'
import { listCorporateServices } from '@/services/corporateServices'
import { createProposal, updateProposal } from '@/services/proposals'
import type {
  ProposalInput,
  OfficeSettings,
  CorporateService,
  TaxRegimeKey,
  PlanKey,
  ProposalRecord,
} from '@/types/proposal'
import {
  calculatePlanPricing,
  TAX_REGIME_LABELS,
  PLAN_NAMES,
  PLAN_COLORS,
  formatCurrency,
  getFilteredScopeFeatures,
} from '@/lib/pricingEngine'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/hooks/use-toast'
import ProposalPdfView from '@/components/ProposalPdfView'
import {
  Calculator,
  Save,
  Printer,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  FileCheck,
  HelpCircle,
  TrendingUp,
  FileText,
  Percent,
  Check,
  X,
} from 'lucide-react'

interface ProposalBuilderProps {
  initialProposal?: ProposalRecord | null
  onSaved?: (p: ProposalRecord) => void
}

export default function ProposalBuilder({ initialProposal, onSaved }: ProposalBuilderProps) {
  const [settings, setSettings] = useState<OfficeSettings | null>(null)
  const [corporateServices, setCorporateServices] = useState<CorporateService[]>([])
  const [showPdfView, setShowPdfView] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Current proposal state
  const [editingId, setEditingId] = useState<string | null>(initialProposal?.id || null)
  const [code, setCode] = useState<string>(initialProposal?.code || '')
  const [clientName, setClientName] = useState(initialProposal?.client_name || '')
  const [contactPerson, setContactPerson] = useState(initialProposal?.contact_person || '')
  const [contactEmail, setContactEmail] = useState(initialProposal?.contact_email || '')
  const [contactPhone, setContactPhone] = useState(initialProposal?.contact_phone || '')
  const [clientSegment, setClientSegment] = useState(initialProposal?.client_segment || '')

  const [taxRegime, setTaxRegime] = useState<TaxRegimeKey>(
    initialProposal?.tax_regime || 'simples_servico',
  )
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(
    initialProposal?.monthly_revenue ?? 60000,
  )
  const [employeesCount, setEmployeesCount] = useState<number>(
    initialProposal?.employees_count ?? 3,
  )
  const [invoicesCount, setInvoicesCount] = useState<number>(initialProposal?.invoices_count ?? 40)
  const [admissionsCount, setAdmissionsCount] = useState<number>(
    initialProposal?.admissions_departures_count ?? 1,
  )

  const [recommendedPlan, setRecommendedPlan] = useState<PlanKey>(
    initialProposal?.recommended_plan || 'prata',
  )
  const [includedPlans, setIncludedPlans] = useState<PlanKey[]>(
    initialProposal?.included_plans || ['bronze', 'prata', 'ouro'],
  )
  const [includeCorporateCard, setIncludeCorporateCard] = useState<boolean>(
    initialProposal?.include_corporate_card ?? true,
  )
  const [notes, setNotes] = useState(initialProposal?.notes || '')

  useEffect(() => {
    loadDependencies()
  }, [])

  useEffect(() => {
    if (initialProposal) {
      setEditingId(initialProposal.id)
      setCode(initialProposal.code || '')
      setClientName(initialProposal.client_name || '')
      setContactPerson(initialProposal.contact_person || '')
      setContactEmail(initialProposal.contact_email || '')
      setContactPhone(initialProposal.contact_phone || '')
      setClientSegment(initialProposal.client_segment || '')
      setTaxRegime(initialProposal.tax_regime || 'simples_servico')
      setMonthlyRevenue(initialProposal.monthly_revenue ?? 60000)
      setEmployeesCount(initialProposal.employees_count ?? 3)
      setInvoicesCount(initialProposal.invoices_count ?? 40)
      setAdmissionsCount(initialProposal.admissions_departures_count ?? 1)
      setRecommendedPlan(initialProposal.recommended_plan || 'prata')
      setIncludedPlans(initialProposal.included_plans || ['bronze', 'prata', 'ouro'])
      setIncludeCorporateCard(initialProposal.include_corporate_card ?? true)
      setNotes(initialProposal.notes || '')
    }
  }, [initialProposal])

  const loadDependencies = async () => {
    try {
      const [sets, svcs] = await Promise.all([getOfficeSettings(), listCorporateServices()])
      setSettings(sets)
      setCorporateServices(svcs)
    } catch (err) {
      console.error(err)
    }
  }

  // Reactive calculation
  const pricingConfig = settings?.pricing_config || defaultPricingConfig
  const calculatedPlans = calculatePlanPricing(
    {
      tax_regime: taxRegime,
      monthly_revenue: Number(monthlyRevenue) || 0,
      employees_count: Number(employeesCount) || 0,
      invoices_count: Number(invoicesCount) || 0,
      admissions_departures_count: Number(admissionsCount) || 0,
    },
    pricingConfig,
  )

  const handleToggleIncludedPlan = (plan: PlanKey) => {
    if (includedPlans.includes(plan)) {
      if (includedPlans.length === 1) {
        toast({
          title: 'Atenção',
          description: 'A proposta precisa exibir pelo menos um plano no PDF.',
          variant: 'destructive',
        })
        return
      }
      const updated = includedPlans.filter((p) => p !== plan)
      setIncludedPlans(updated)
      if (recommendedPlan === plan) {
        setRecommendedPlan(updated[0])
      }
    } else {
      setIncludedPlans([...includedPlans, plan])
    }
  }

  const handleSaveProposal = async () => {
    if (!clientName.trim()) {
      toast({
        title: 'Nome do cliente obrigatório',
        description: 'Preencha a Razão Social ou Nome do cliente antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const proposalData: ProposalInput = {
        client_name: clientName,
        contact_person: contactPerson,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        client_segment: clientSegment,
        tax_regime: taxRegime,
        monthly_revenue: Number(monthlyRevenue) || 0,
        employees_count: Number(employeesCount) || 0,
        invoices_count: Number(invoicesCount) || 0,
        admissions_departures_count: Number(admissionsCount) || 0,
        recommended_plan: recommendedPlan,
        included_plans: includedPlans,
        include_corporate_card: includeCorporateCard,
        notes,
      }

      let savedRecord: ProposalRecord

      if (editingId) {
        savedRecord = await updateProposal(editingId, {
          ...proposalData,
          calculated_plans: calculatedPlans,
        })
        toast({
          title: 'Proposta atualizada!',
          description: `Alterações salvas com sucesso para ${savedRecord.client_name}.`,
        })
      } else {
        savedRecord = await createProposal(
          proposalData,
          calculatedPlans,
          settings?.validity_days || 15,
        )
        setEditingId(savedRecord.id)
        setCode(savedRecord.code)
        toast({
          title: 'Proposta criada com sucesso!',
          description: `Código gerado: ${savedRecord.code}. Salva no histórico.`,
        })
      }

      if (onSaved) {
        onSaved(savedRecord)
      }
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível gravar a proposta no banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // If showing PDF preview mode
  if (showPdfView && settings) {
    return (
      <ProposalPdfView
        proposal={{
          code,
          client_name: clientName,
          contact_person: contactPerson,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          client_segment: clientSegment,
          tax_regime: taxRegime,
          monthly_revenue: Number(monthlyRevenue) || 0,
          employees_count: Number(employeesCount) || 0,
          invoices_count: Number(invoicesCount) || 0,
          admissions_departures_count: Number(admissionsCount) || 0,
          recommended_plan: recommendedPlan,
          included_plans: includedPlans,
          include_corporate_card: includeCorporateCard,
          notes,
          calculated_plans: calculatedPlans,
        }}
        settings={settings}
        corporateServices={corporateServices}
        onClose={() => setShowPdfView(false)}
      />
    )
  }

  const scopeFeatures = getFilteredScopeFeatures(taxRegime)
  const plans: PlanKey[] = ['bronze', 'prata', 'ouro']

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-slate-950 font-bold rounded-md text-xs uppercase">
              {editingId ? 'Editando Proposta' : 'Nova Proposta'}
            </span>
            {code && <span className="font-mono text-xs text-amber-400 font-bold">{code}</span>}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Simulador de Honorários & Proposta Comercial
          </h2>
          <p className="text-xs text-slate-400">
            Ajuste as variáveis do cliente para ver a composição dos planos Bronze, Prata e Ouro em
            tempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={() => setShowPdfView(true)}
            variant="outline"
            className="text-slate-100 border-slate-700 bg-slate-800 hover:bg-slate-700 font-semibold gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Visualizar / Gerar PDF
          </Button>

          <Button
            onClick={handleSaveProposal}
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar no Histórico'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Dados do Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Building className="w-4 h-4 text-amber-500" />
                1. Identificação do Cliente
              </CardTitle>
              <CardDescription>
                Informações da empresa que serão inseridas no cabeçalho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Razão Social / Nome da Empresa *</Label>
                <Input
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: TechLab Soluções Digitais Ltda"
                  className="font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Pessoa de Contato / Sócio</Label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Ex: Mariana Alencar"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ramo / Segmento</Label>
                  <Input
                    value={clientSegment}
                    onChange={(e) => setClientSegment(e.target.value)}
                    placeholder="Ex: Tecnologia & SaaS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">E-mail do Cliente</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Telefone / WhatsApp</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Variáveis de Cálculo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <Calculator className="w-4 h-4 text-amber-500" />
                2. Parâmetros & Operação do Cliente
              </CardTitle>
              <CardDescription>
                O motor recalcula os 3 planos instantaneamente com base nestes números
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Regime Tributário */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Regime Tributário</Label>
                <select
                  value={taxRegime}
                  onChange={(e) => setTaxRegime(e.target.value as TaxRegimeKey)}
                  className="w-full text-sm border rounded-lg p-2.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-medium"
                >
                  <option value="simples_servico">{TAX_REGIME_LABELS.simples_servico}</option>
                  <option value="simples_comercio">{TAX_REGIME_LABELS.simples_comercio}</option>
                  <option value="lucro_presumido">{TAX_REGIME_LABELS.lucro_presumido}</option>
                  <option value="lucro_real">{TAX_REGIME_LABELS.lucro_real}</option>
                </select>
              </div>

              {/* Faturamento Mensal */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">Faturamento Médio Mensal (R$)</Label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(Number(monthlyRevenue) || 0)}
                  </span>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={5000}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
                />
              </div>

              {/* Grid: Vidas, Notas e Admissões */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Vidas / CLT</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={employeesCount}
                    onChange={(e) => setEmployeesCount(Number(e.target.value) || 0)}
                    placeholder="Vidas"
                  />
                  <p className="text-[10px] text-slate-500">Folha de pagamento</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notas/Mês</Label>
                  <Input
                    type="number"
                    min={0}
                    step={5}
                    value={invoicesCount}
                    onChange={(e) => setInvoicesCount(Number(e.target.value) || 0)}
                    placeholder="NFs"
                  />
                  <p className="text-[10px] text-slate-500">Entrada + Saída</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Admissões/Mês</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={admissionsCount}
                    onChange={(e) => setAdmissionsCount(Number(e.target.value) || 0)}
                    placeholder="Movim."
                  />
                  <p className="text-[10px] text-slate-500">Admissão/Rescisão</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Configurações do PDF da Proposta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                <FileCheck className="w-4 h-4 text-amber-500" />
                3. Personalização Comercial do PDF
              </CardTitle>
              <CardDescription>
                Selecione os planos que entram na proposta e o plano recomendado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Planos exibidos no PDF */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold block">
                  Planos Visíveis na Proposta Comercial
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <label
                      key={p}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        includedPlans.includes(p)
                          ? 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                          : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={includedPlans.includes(p)}
                        onChange={() => handleToggleIncludedPlan(p)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="capitalize font-bold">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Plano Recomendado */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold block">
                  Marcar como Plano Recomendado (Destaque Comercial)
                </Label>
                <RadioGroup
                  value={recommendedPlan}
                  onValueChange={(val) => setRecommendedPlan(val as PlanKey)}
                  className="grid grid-cols-3 gap-2"
                >
                  {plans.map((p) => {
                    const isDisabled = !includedPlans.includes(p)
                    return (
                      <div
                        key={p}
                        className={`flex items-center space-x-2 border rounded-lg p-2 text-xs ${
                          recommendedPlan === p
                            ? 'border-amber-500 bg-amber-500/10 font-bold'
                            : 'border-slate-200 dark:border-slate-800'
                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <RadioGroupItem value={p} id={`rec-${p}`} disabled={isDisabled} />
                        <Label htmlFor={`rec-${p}`} className="capitalize cursor-pointer">
                          {p}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Card do Societário Switch */}
              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    Incluir Tabela de Serviços Societários no PDF
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Apresenta a tabela de atos e legalização com o desconto do cliente
                  </div>
                </div>
                <Switch checked={includeCorporateCard} onCheckedChange={setIncludeCorporateCard} />
              </div>

              {/* Observações da Proposta */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Observações Específicas Desta Proposta
                </Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Desconto promocional no primeiro trimestre ou carência na implantação..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Realtime Plan Calculation Cards & Scope Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header of results */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Composição de Preços Linha por Linha
            </h3>
            <Badge variant="outline" className="text-xs">
              Simulação em Tempo Real
            </Badge>
          </div>

          {/* Three Calculated Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((pKey) => {
              const breakdown = calculatedPlans[pKey]
              const isRecommended = recommendedPlan === pKey
              const isIncludedInPdf = includedPlans.includes(pKey)

              return (
                <Card
                  key={pKey}
                  className={`relative flex flex-col justify-between transition-all overflow-hidden ${
                    isRecommended
                      ? 'border-2 border-amber-500 shadow-xl ring-2 ring-amber-400/30'
                      : 'border-slate-200 dark:border-slate-800'
                  } ${!isIncludedInPdf ? 'opacity-50' : ''}`}
                >
                  <div>
                    {/* Header */}
                    <div
                      className={`p-3 text-center border-b ${
                        pKey === 'ouro'
                          ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white'
                          : pKey === 'prata'
                            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                            : 'bg-gradient-to-r from-amber-800 to-amber-900 text-white'
                      }`}
                    >
                      {isRecommended && (
                        <span className="inline-block bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full mb-1">
                          ★ Recomendado
                        </span>
                      )}
                      <div className="font-bold text-sm uppercase tracking-wider">{pKey}</div>
                    </div>

                    {/* Total Price */}
                    <div className="p-4 text-center border-b bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(breakdown.total)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">por mês</div>
                    </div>

                    {/* Breakdown */}
                    <div className="p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Base {taxRegime === 'simples_servico' ? 'Serviços' : 'Regime'}:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(breakdown.base)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Faixa Faturamento:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{formatCurrency(breakdown.revenueTier)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Vidas ({employeesCount}x):</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{formatCurrency(breakdown.employees)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Admissões ({admissionsCount}x):</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          +{formatCurrency(breakdown.admissions)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Notas Excedentes:</span>
                        <span
                          className={`font-semibold ${
                            breakdown.excessInvoices > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          +{formatCurrency(breakdown.excessInvoices)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardFooter className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t flex flex-col gap-1.5 text-center">
                    <span className="text-[11px] text-slate-500">
                      Franquia: {pricingConfig.invoicesAllowance[pKey]} NFs/mês
                    </span>
                    {!isIncludedInPdf && (
                      <Badge variant="outline" className="text-[10px] text-slate-400">
                        Oculto no PDF
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Scope Table Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Tabela &quot;O Que Está Incluso&quot; (Filtrada por Regime)
                  </CardTitle>
                  <CardDescription>
                    Escopo de trabalho entregue conforme o enquadramento tributário selecionado (
                    {TAX_REGIME_LABELS[taxRegime]})
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 z-10">
                    <tr className="border-b font-bold">
                      <th className="py-2.5 px-3">Entregas do Escritório</th>
                      <th className="py-2.5 px-3 text-center">Bronze</th>
                      <th className="py-2.5 px-3 text-center">Prata</th>
                      <th className="py-2.5 px-3 text-center">Ouro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scopeFeatures.map((feat, idx) => (
                      <tr
                        key={idx}
                        className={
                          idx % 2 === 0
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-50/50 dark:bg-slate-900/40'
                        }
                      >
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {feat.title}
                          </div>
                          {feat.description && (
                            <div className="text-[10px] text-slate-500">{feat.description}</div>
                          )}
                        </td>
                        {plans.map((p) => {
                          const val = feat.availableIn[p]
                          return (
                            <td key={p} className="py-2 px-3 text-center">
                              {typeof val === 'boolean' ? (
                                val ? (
                                  <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                  {val}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Societário Summary Preview */}
          {includeCorporateCard && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Card do Societário Ativo ({corporateServices.length} serviços cadastrados)
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                    Descontos Exclusivos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-slate-500 mb-3">
                  Ao gerar a proposta, este bloco será impresso demonstrando que clientes ativos
                  possuem condições especiais em serviços avulsos (aberturas, alterações contratuais
                  e certidões).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {corporateServices.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs"
                    >
                      <div className="font-semibold truncate text-slate-800 dark:text-slate-200">
                        {s.name}
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] mt-0.5">
                        {s.discount_percent}% de desconto
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
