import type {
  ProposalInput,
  CalculatedPlans,
  OfficeSettings,
  CorporateService,
  PlanKey,
} from '@/types/proposal'
import {
  TAX_REGIME_LABELS,
  PLAN_NAMES,
  PLAN_COLORS,
  formatCurrency,
  getFilteredScopeFeatures,
} from '@/lib/pricingEngine'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Printer,
  Download,
  Check,
  X,
  Building2,
  Calendar,
  Phone,
  Mail,
  Globe,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'

interface ProposalPdfViewProps {
  proposal: ProposalInput & {
    code?: string
    valid_until?: string
    calculated_plans: CalculatedPlans
  }
  settings: OfficeSettings
  corporateServices: CorporateService[]
  onClose?: () => void
}

export default function ProposalPdfView({
  proposal,
  settings,
  corporateServices,
  onClose,
}: ProposalPdfViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const includedPlans = proposal.included_plans || ['bronze', 'prata', 'ouro']
  const scopeFeatures = getFilteredScopeFeatures(proposal.tax_regime)
  const activeCorporateServices = corporateServices.filter((s) => s.is_active !== false)

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              Pré-visualização da Proposta Comercial em PDF
            </h3>
            <p className="text-xs text-slate-400">
              Pronto para salvar como PDF via comando de impressão do navegador ou enviar ao cliente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
            >
              Voltar à Edição
            </Button>
          )}
          <Button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            Imprimir / Baixar PDF
          </Button>
        </div>
      </div>

      {/* PRINTABLE CONTAINER */}
      <div
        id="printable-proposal"
        className="proposal-print-area bg-white text-slate-900 shadow-2xl rounded-2xl p-6 sm:p-10 max-w-5xl mx-auto border border-slate-200"
      >
        {/* 1. Header with Office Branding */}
        <div className="border-b-2 border-amber-500 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500 text-slate-950 font-black rounded-lg text-lg tracking-wider">
                M&S
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {settings.office_name}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{settings.responsible_name}</p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded inline-block">
              {proposal.code || 'PROPOSTA COMERCIAL'}
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 pt-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
              {proposal.valid_until && (
                <>
                  <span className="mx-1">•</span>
                  <span>
                    Válida até: {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center sm:justify-end gap-3 text-slate-500 text-[11px] pt-0.5">
              {settings.contact_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {settings.contact_phone}
                </span>
              )}
              {settings.contact_email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {settings.contact_email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Client Profile Header */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 mb-8">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
            Dados do Cliente & Escopo Contratual
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Empresa / Razão Social:</span>
              <span className="font-bold text-sm text-slate-900 block truncate">
                {proposal.client_name}
              </span>
              {proposal.contact_person && (
                <span className="text-slate-500 text-[11px]">A/C: {proposal.contact_person}</span>
              )}
            </div>

            <div>
              <span className="text-slate-500 block">Regime Tributário:</span>
              <span className="font-semibold text-slate-800 block">
                {TAX_REGIME_LABELS[proposal.tax_regime]}
              </span>
              {proposal.client_segment && (
                <span className="text-slate-500 text-[11px]">
                  Segmento: {proposal.client_segment}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-500 block">Faturamento Estimado:</span>
              <span className="font-semibold text-slate-800 block">
                {formatCurrency(proposal.monthly_revenue)}/mês
              </span>
              <span className="text-slate-500 text-[11px]">
                {proposal.invoices_count} NFs previstas/mês
              </span>
            </div>

            <div>
              <span className="text-slate-500 block">Folha & Movimentações:</span>
              <span className="font-semibold text-slate-800 block">
                {proposal.employees_count} vidas / funcionários
              </span>
              <span className="text-slate-500 text-[11px]">
                {proposal.admissions_departures_count} mov. admissão/rescisão/mês
              </span>
            </div>
          </div>
        </div>

        {/* 3. Pricing Cards - Side by Side (Bronze, Prata, Ouro) */}
        <div className="mb-10">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Planos & Investimento Mensal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Selecione o plano ideal para a maturidade e volume operacional da sua empresa
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              includedPlans.length === 1
                ? 'max-w-md mx-auto'
                : includedPlans.length === 2
                  ? 'md:grid-cols-2 max-w-3xl mx-auto'
                  : 'md:grid-cols-3'
            } gap-5`}
          >
            {includedPlans.map((planKey) => {
              const breakdown = proposal.calculated_plans[planKey]
              const isRecommended = proposal.recommended_plan === planKey

              return (
                <div
                  key={planKey}
                  className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden ${
                    isRecommended
                      ? 'border-amber-500 shadow-xl ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/40 via-white to-white'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div
                      className={`p-4 border-b text-center relative ${
                        planKey === 'ouro'
                          ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white'
                          : planKey === 'prata'
                            ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                            : 'bg-gradient-to-r from-amber-800 to-amber-900 text-white'
                      }`}
                    >
                      {isRecommended && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Recomendado
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-bold uppercase tracking-wider">
                        {planKey === 'bronze' ? 'Bronze' : planKey === 'prata' ? 'Prata' : 'Ouro'}
                      </div>
                      <div className="text-[11px] opacity-90 mt-0.5">
                        {planKey === 'bronze'
                          ? 'Essencial & Cumprimento Legal'
                          : planKey === 'prata'
                            ? 'Profissional & Gerencial'
                            : 'Estratégico / Full Assessoria'}
                      </div>
                    </div>

                    {/* Price Header */}
                    <div className="p-5 text-center border-b bg-slate-50/50">
                      <div className="text-xs text-slate-500 font-medium">Honorários Mensais</div>
                      <div className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                        {formatCurrency(breakdown.total)}
                        <span className="text-xs font-normal text-slate-500">/mês</span>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span>Preço Base ({TAX_REGIME_LABELS[proposal.tax_regime]}):</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(breakdown.base)}
                        </span>
                      </div>

                      {breakdown.revenueTier > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                          <span>Adicional Faixa Faturamento:</span>
                          <span className="font-semibold text-slate-800">
                            +{formatCurrency(breakdown.revenueTier)}
                          </span>
                        </div>
                      )}

                      {breakdown.employees > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                          <span>Vidas na Folha ({proposal.employees_count}x):</span>
                          <span className="font-semibold text-slate-800">
                            +{formatCurrency(breakdown.employees)}
                          </span>
                        </div>
                      )}

                      {breakdown.admissions > 0 && (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                          <span>Movimentações RH ({proposal.admissions_departures_count}x):</span>
                          <span className="font-semibold text-slate-800">
                            +{formatCurrency(breakdown.admissions)}
                          </span>
                        </div>
                      )}

                      {breakdown.excessInvoices > 0 ? (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700 font-medium">
                          <span>Notas Excedentes ({breakdown.excessInvoicesCount}x):</span>
                          <span>+{formatCurrency(breakdown.excessInvoices)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 text-[11px]">
                          <span>Franquia NFs:</span>
                          <span>Incluso no pacote</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary tag */}
                  <div className="p-4 bg-slate-50 border-t text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isRecommended
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isRecommended ? '★ Melhor Custo-Benefício' : 'Disponível para contratação'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Scope Comparison Table ("O que está incluso") */}
        <div className="mb-10 page-break-inside-avoid">
          <div className="border-b pb-2 mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Matriz de Escopo: O Que Está Incluso em Cada Plano
            </h3>
            <span className="text-xs text-slate-500">
              Regime: {TAX_REGIME_LABELS[proposal.tax_regime]}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3 w-1/2">Serviço / Entrega do Escritório</th>
                  <th className="py-2.5 px-3 text-center">Bronze</th>
                  <th className="py-2.5 px-3 text-center">Prata</th>
                  <th className="py-2.5 px-3 text-center">Ouro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopeFeatures.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      {item.description && (
                        <div className="text-[10px] text-slate-500">{item.description}</div>
                      )}
                    </td>
                    {(['bronze', 'prata', 'ouro'] as PlanKey[]).map((pKey) => {
                      const val = item.availableIn[pKey]
                      return (
                        <td key={pKey} className="py-2 px-3 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-slate-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-[11px] font-medium text-slate-700">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Corporate Services Card (Societário & Descontos) - if enabled */}
        {proposal.include_corporate_card && activeCorporateServices.length > 0 && (
          <div className="mb-10 page-break-inside-avoid">
            <div className="border-b pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                Tabela de Serviços Societários & Vantagem Exclusiva
              </h3>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                Descontos de até 50% para clientes mensais
              </Badge>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">Serviço Societário / Paralegal</th>
                    <th className="py-2.5 px-3">Preço Balcão</th>
                    <th className="py-2.5 px-3 text-center">Seu Desconto</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-700">Preço com Desconto</th>
                    <th className="py-2.5 px-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCorporateServices.map((svc) => {
                    const discounted = svc.regular_price * (1 - (svc.discount_percent || 0) / 100)
                    return (
                      <tr key={svc.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{svc.name}</td>
                        <td className="py-2 px-3 text-slate-500 line-through">
                          {formatCurrency(svc.regular_price)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="font-bold text-emerald-600">
                            {svc.discount_percent}% OFF
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-700">
                          {formatCurrency(discounted)}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {svc.observations || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              * Taxas e emolumentos de órgãos públicos (Junta Comercial, Receita Federal, Prefeitura
              e Certificados Digitais) não estão inclusas nos honorários advocatícios/contábeis.
            </p>
          </div>
        )}

        {/* 6. Terms, Conditions & Signatures */}
        <div className="border-t pt-6 text-xs text-slate-600 space-y-4 page-break-inside-avoid">
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1">
              Condições Comerciais & Observações:
            </h4>
            <p className="leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {settings.commercial_notes ||
                'Valores para pagamento até o dia 10 de cada mês. Reajuste anual pelo IPCA. Não inclui taxas de órgãos externos.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-slate-700">
            <div className="space-y-1">
              <div className="border-b border-slate-300 w-3/4 mx-auto pb-8" />
              <div className="font-bold text-xs">{settings.office_name}</div>
              <div className="text-[11px] text-slate-500">{settings.responsible_name}</div>
            </div>

            <div className="space-y-1">
              <div className="border-b border-slate-300 w-3/4 mx-auto pb-8" />
              <div className="font-bold text-xs">{proposal.client_name}</div>
              <div className="text-[11px] text-slate-500">De acordo do Cliente</div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t pt-4 text-center text-[10px] text-slate-400">
            {settings.office_name} • {settings.contact_email} • {settings.contact_phone} •{' '}
            {settings.contact_website}
          </div>
        </div>
      </div>
    </div>
  )
}
