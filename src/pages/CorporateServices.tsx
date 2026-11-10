import { useState, useEffect } from 'react'
import {
  listCorporateServices,
  createCorporateService,
  updateCorporateService,
  deleteCorporateService,
} from '@/services/corporateServices'
import type { CorporateService } from '@/types/proposal'
import { formatCurrency } from '@/lib/pricingEngine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Briefcase, Plus, Pencil, Trash2, Tag, Percent, RefreshCw } from 'lucide-react'

export default function CorporateServicesPage() {
  const [services, setServices] = useState<CorporateService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<CorporateService | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [regularPrice, setRegularPrice] = useState<number>(500)
  const [discountPercent, setDiscountPercent] = useState<number>(30)
  const [observations, setObservations] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const data = await listCorporateServices()
      setServices(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços societários.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingService(null)
    setName('')
    setCategory('Societário')
    setRegularPrice(800)
    setDiscountPercent(30)
    setObservations('')
    setIsActive(true)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (s: CorporateService) => {
    setEditingService(s)
    setName(s.name)
    setCategory(s.category || 'Societário')
    setRegularPrice(s.regular_price)
    setDiscountPercent(s.discount_percent || 0)
    setObservations(s.observations || '')
    setIsActive(s.is_active ?? true)
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Atenção',
        description: 'Informe o nome do serviço societário.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingService) {
        await updateCorporateService(editingService.id, {
          name,
          category,
          regular_price: Number(regularPrice) || 0,
          discount_percent: Number(discountPercent) || 0,
          observations,
          is_active: isActive,
        })
        toast({ title: 'Serviço atualizado com sucesso!' })
      } else {
        await createCorporateService({
          name,
          category,
          regular_price: Number(regularPrice) || 0,
          discount_percent: Number(discountPercent) || 0,
          observations,
          order: services.length + 1,
          is_active: isActive,
        })
        toast({ title: 'Novo serviço societário criado!' })
      }
      setIsDialogOpen(false)
      loadServices()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o serviço.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o serviço "${name}"?`)) return

    try {
      await deleteCorporateService(id)
      toast({ title: 'Serviço excluído!' })
      loadServices()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o serviço.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-500" />
            Serviços Societários & Tabela de Descontos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Itens avulsos de legalização, alterações contratuais e certidões com condições especiais
            para clientes mensais
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço Societário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Catálogo de Serviços Paralegais e Societários</CardTitle>
          <CardDescription>
            Tabela de preços praticados para clientes do escritório e público em geral
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Carregando serviços...
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhum serviço societário cadastrado. Clique no botão acima para adicionar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-semibold text-xs">
                    <th className="py-3 px-4">Serviço / Descrição</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Preço Normal (Balcão)</th>
                    <th className="py-3 px-4 text-center">Desconto Cliente</th>
                    <th className="py-3 px-4">Valor com Desconto</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {services.map((item) => {
                    const discounted = item.regular_price * (1 - (item.discount_percent || 0) / 100)
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          {item.observations && (
                            <div className="text-xs text-slate-500 mt-0.5">{item.observations}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs font-normal">
                            {item.category || 'Societário'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.regular_price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-xs">
                            <Percent className="w-3 h-3" />
                            {item.discount_percent}% OFF
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(discounted)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              item.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }
                          >
                            {item.is_active ? 'Ativo no Card' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(item)}
                            className="cursor-pointer text-slate-600 hover:text-slate-900"
                            title="Editar serviço"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Excluir serviço"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Add / Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar Serviço Societário' : 'Novo Serviço Societário'}
              </DialogTitle>
              <DialogDescription>
                Defina o nome, valor regular de tabela e o percentual de desconto para clientes
                ativos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Nome do Serviço</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Abertura e Constituição de Filial"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Societário, CNDs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Preço Normal (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <Label>Desconto do Cliente (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  />
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs space-y-1">
                  <span className="text-slate-500">Valor Final Cliente:</span>
                  <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(regularPrice * (1 - (discountPercent || 0) / 100))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Observações / Condições</Label>
                <Textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Isento no Plano Ouro ou não inclui taxas públicas"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm">Exibir na Tabela de Societário</Label>
                  <p className="text-xs text-slate-500">
                    Controla se o serviço aparece na proposta comercial
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold cursor-pointer"
              >
                {isSaving ? 'Salvando...' : 'Salvar Serviço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
