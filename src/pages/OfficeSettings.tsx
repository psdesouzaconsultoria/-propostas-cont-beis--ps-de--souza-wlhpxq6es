import { useState, useEffect } from 'react'
import { getOfficeSettings, saveOfficeSettings, defaultPricingConfig } from '@/services/settings'
import type { OfficeSettings, PricingConfig, TaxRegimeKey, PlanKey } from '@/types/proposal'
import { TAX_REGIME_LABELS, formatCurrency } from '@/lib/pricingEngine'
import { DEFAULT_LOGO, resolveLogoUrl } from '@/lib/brand'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import {
  Building2,
  Save,
  RefreshCw,
  DollarSign,
  Calculator,
  Layers,
  ImageUp,
  Trash2,
} from 'lucide-react'

export default function OfficeSettingsPage() {
  const [settings, setSettings] = useState<OfficeSettings | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricingConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getOfficeSettings()
      setSettings(data)
      setLogoPreview(null)
      setLogoFile(null)
      setRemoveLogo(false)
      setPricing(data.pricing_config || defaultPricingConfig)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    try {
      const updated = await saveOfficeSettings({
        ...settings,
        pricing_config: pricing,
        // Ao remover a logo, envia nome vazio para limpar o campo arquivo
        ...(removeLogo ? { logo: '' } : {}),
        logoFile: removeLogo ? null : logoFile,
      })
      setSettings(updated)
      setLogoFile(null)
      setLogoPreview(null)
      setRemoveLogo(false)
      toast({
        title: 'Sucesso!',
        description: 'Dados do escritório e regras de preço salvos com sucesso.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Falha ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando configurações do escritório...
      </div>
    )
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setRemoveLogo(false)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const currentLogoSrc = () => {
    if (logoPreview) return logoPreview
    if (removeLogo) return DEFAULT_LOGO
    return resolveLogoUrl(settings)
  }

  const regimes: TaxRegimeKey[] = [
    'simples_servico',
    'simples_comercio',
    'lucro_presumido',
    'lucro_real',
  ]
  const plans: PlanKey[] = ['bronze', 'prata', 'ouro']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-gold-dark" />
            Configuração do Escritório & Tabela de Preços
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ajuste os dados cadastrais da sua empresa contábil, valores base por regime e variáveis
            de cálculo
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold gap-2 shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="office" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="office" className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Dados do Escritório
          </TabsTrigger>
          <TabsTrigger value="base" className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> Preços Base
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> Variáveis & Faixas
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Dados do Escritório */}
        <TabsContent value="office" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageUp className="w-5 h-5 text-brand-gold-dark" /> Logo do Escritório
              </CardTitle>
              <CardDescription>
                Aparece na barra de navegação, na tela de login e no cabeçalho/rodapé do PDF da
                proposta. A logo oficial da PS DE SOUZA já vem configurada por padrão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={currentLogoSrc()}
                  alt="Logo do escritório"
                  className="h-24 w-24 rounded-xl object-cover object-top border-2 border-brand-navy/20 shadow-md"
                />
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="logo-upload">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-navy bg-brand-gold hover:bg-brand-gold-dark cursor-pointer px-3 py-2 rounded-md shadow-sm transition-colors">
                        <ImageUp className="w-3.5 h-3.5" />
                        {settings.logo ? 'Trocar imagem' : 'Enviar imagem'}
                      </span>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>

                    {settings.logo && !removeLogo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                        onClick={() => {
                          setRemoveLogo(true)
                          setLogoFile(null)
                          setLogoPreview(null)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remover (voltar à logo padrão)
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {logoFile
                      ? `Imagem selecionada: ${logoFile.name}. Clique em "Salvar Alterações" para aplicar.`
                      : 'Formatos aceitos: PNG, JPG, WEBP ou SVG (até 5 MB).'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação Comercial</CardTitle>
              <CardDescription>
                Estes dados serão impressos no cabeçalho e rodapé da proposta comercial em PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Escritório / Razão Social</Label>
                  <Input
                    value={settings.office_name}
                    onChange={(e) => setSettings({ ...settings, office_name: e.target.value })}
                    placeholder="Ex: M&S Contabilidade Ltda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contador Responsável / CRC</Label>
                  <Input
                    value={settings.responsible_name}
                    onChange={(e) => setSettings({ ...settings, responsible_name: e.target.value })}
                    placeholder="Ex: João da Silva - Contador CRC/SP 123456/O"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>E-mail de Contato</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    placeholder="contato@escritorio.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp Comercial</Label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website / Portal</Label>
                  <Input
                    value={settings.contact_website}
                    onChange={(e) => setSettings({ ...settings, contact_website: e.target.value })}
                    placeholder="www.escritorio.com.br"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Validade Padrão da Proposta (em dias corridos)</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  className="max-w-[200px]"
                  value={settings.validity_days || 15}
                  onChange={(e) =>
                    setSettings({ ...settings, validity_days: Number(e.target.value) || 15 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Condições Comerciais e Observações Gerais da Proposta</Label>
                <Textarea
                  rows={4}
                  value={settings.commercial_notes}
                  onChange={(e) => setSettings({ ...settings, commercial_notes: e.target.value })}
                  placeholder="Instruções de pagamento, reajuste anual, escopo de taxas públicas e certificados..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Preços Base por Regime */}
        <TabsContent value="base" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preço Base por Regime Tributário (R$/mês)</CardTitle>
              <CardDescription>
                Ponto de partida do cálculo de cada plano antes de aplicar adicionais de
                faturamento, vidas e notas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regimes.map((regime) => (
                  <div
                    key={regime}
                    className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm">
                      {TAX_REGIME_LABELS[regime]}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {plans.map((p) => (
                        <div key={p} className="space-y-1.5">
                          <Label className="capitalize text-xs font-medium text-slate-500">
                            {p === 'bronze'
                              ? 'Plano Bronze'
                              : p === 'prata'
                                ? 'Plano Prata'
                                : 'Plano Ouro'}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-slate-400">
                              R$
                            </span>
                            <Input
                              type="number"
                              min={0}
                              step={10}
                              className="pl-9"
                              value={pricing.basePrices[regime]?.[p] ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                setPricing({
                                  ...pricing,
                                  basePrices: {
                                    ...pricing.basePrices,
                                    [regime]: {
                                      ...pricing.basePrices[regime],
                                      [p]: val,
                                    },
                                  },
                                })
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Variáveis (Vidas, Admissões, Notas e Faixas) */}
        <TabsContent value="variables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custo por Vida / Funcionário (R$/mês)</CardTitle>
                <CardDescription>
                  Cobrado por funcionário ativo na folha de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div key={p} className="space-y-1.5">
                    <Label className="capitalize text-xs font-medium">{p}</Label>
                    <Input
                      type="number"
                      step={1}
                      value={pricing.employeeCostPerHead[p] ?? 40}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          employeeCostPerHead: {
                            ...pricing.employeeCostPerHead,
                            [p]: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admissões & Rescisões (R$/movimento)</CardTitle>
                <CardDescription>Custo unitário por admissão ou rescisão no mês</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div key={p} className="space-y-1.5">
                    <Label className="capitalize text-xs font-medium">{p}</Label>
                    <Input
                      type="number"
                      step={5}
                      value={pricing.admissionDepartureCost[p] ?? 50}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          admissionDepartureCost: {
                            ...pricing.admissionDepartureCost,
                            [p]: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Franquia de Notas Fiscais (NFs/mês)</CardTitle>
                <CardDescription>Quantidade de NFs inclusas na mensalidade base</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div key={p} className="space-y-1.5">
                    <Label className="capitalize text-xs font-medium">{p}</Label>
                    <Input
                      type="number"
                      step={10}
                      value={pricing.invoicesAllowance[p] ?? 50}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          invoicesAllowance: {
                            ...pricing.invoicesAllowance,
                            [p]: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valor da Nota Excedente (R$/NF)</CardTitle>
                <CardDescription>Cobrança unitária por NF acima da franquia</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {plans.map((p) => (
                  <div key={p} className="space-y-1.5">
                    <Label className="capitalize text-xs font-medium">{p}</Label>
                    <Input
                      type="number"
                      step={0.1}
                      value={pricing.excessInvoiceCost[p] ?? 2}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          excessInvoiceCost: {
                            ...pricing.excessInvoiceCost,
                            [p]: Number(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-gold-dark" />
                Faixas de Faturamento Médio (Adicional Mensal em R$)
              </CardTitle>
              <CardDescription>
                Adicional cobrado por mês conforme a escala de faturamento da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500 pb-2 border-b">
                  <div>Até Faturamento</div>
                  <div>Adicional Bronze</div>
                  <div>Adicional Prata</div>
                  <div>Adicional Ouro</div>
                </div>
                {pricing.revenueTiers.map((tier, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Até {formatCurrency(tier.max)}
                    </div>
                    {plans.map((p) => (
                      <Input
                        key={p}
                        type="number"
                        step={50}
                        value={tier.additional[p] ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0
                          const newTiers = [...pricing.revenueTiers]
                          newTiers[idx] = {
                            ...newTiers[idx],
                            additional: {
                              ...newTiers[idx].additional,
                              [p]: val,
                            },
                          }
                          setPricing({ ...pricing, revenueTiers: newTiers })
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
