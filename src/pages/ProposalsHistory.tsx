import { useState, useEffect } from 'react'
import { listProposals, deleteProposal, updateProposal } from '@/services/proposals'
import type { ProposalRecord } from '@/types/proposal'
import { TAX_REGIME_LABELS, formatCurrency } from '@/lib/pricingEngine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import {
  History,
  FileText,
  Search,
  Trash2,
  ExternalLink,
  Printer,
  Calendar,
  Building,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
} from 'lucide-react'

interface ProposalsHistoryProps {
  onOpenProposal: (proposal: ProposalRecord) => void
  onDuplicateProposal: (proposal: ProposalRecord) => void
  onPrintProposal: (proposal: ProposalRecord) => void
}

export default function ProposalsHistory({
  onOpenProposal,
  onDuplicateProposal,
  onPrintProposal,
}: ProposalsHistoryProps) {
  const [proposals, setProposals] = useState<ProposalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    setIsLoading(true)
    try {
      const data = await listProposals()
      setProposals(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de propostas.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, clientName: string) => {
    if (!confirm(`Deseja excluir a proposta do cliente "${clientName}"?`)) return

    try {
      await deleteProposal(id)
      toast({ title: 'Proposta excluída com sucesso!' })
      loadProposals()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a proposta.',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (
    id: string,
    newStatus: 'draft' | 'sent' | 'approved' | 'declined',
  ) => {
    try {
      await updateProposal(id, { status: newStatus })
      toast({ title: 'Status da proposta atualizado!' })
      loadProposals()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProposals = proposals.filter((p) => {
    const q = searchTerm.toLowerCase()
    return (
      p.client_name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.contact_person?.toLowerCase().includes(q)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovada
          </Badge>
        )
      case 'sent':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="w-3 h-3 mr-1" /> Enviada
          </Badge>
        )
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" /> Declinada
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
            Rascunho
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-brand-gold-dark" />
            Histórico de Propostas Comerciais
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe propostas enviadas, reabra para edição ou gere novamente o PDF
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente ou código..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadProposals}
            title="Atualizar lista"
            className="cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Carregando histórico...
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Nenhuma proposta encontrada
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm
                  ? 'Tente buscar com outro termo'
                  : 'Crie sua primeira proposta comercial no simulador'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProposals.map((item) => {
                const recPlan = item.recommended_plan
                const recTotal = item.calculated_plans?.[recPlan]?.total ?? 0

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.code || 'PROP'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                          {item.client_name}
                        </h4>
                        {getStatusBadge(item.status || 'draft')}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {TAX_REGIME_LABELS[item.tax_regime] || item.tax_regime}
                        </span>
                        <span>•</span>
                        <span>Faturamento: {formatCurrency(item.monthly_revenue || 0)}/mês</span>
                        <span>•</span>
                        <span>{item.employees_count || 0} vidas</span>
                        <span>•</span>
                        <span>{item.invoices_count || 0} NFs/mês</span>
                        {item.valid_until && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Válida até {new Date(item.valid_until).toLocaleDateString('pt-BR')}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 pt-0.5">
                        <span className="font-semibold text-brand-gold-dark">
                          Recomendado: Plano {recPlan.toUpperCase()} ({formatCurrency(recTotal)}
                          /mês)
                        </span>
                        <span>•</span>
                        <span>Planos: {item.included_plans?.join(', ').toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Change status quick actions */}
                      <select
                        value={item.status || 'draft'}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as 'draft' | 'sent' | 'approved' | 'declined',
                          )
                        }
                        className="text-xs border rounded-md px-2 py-1.5 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="sent">Enviada</option>
                        <option value="approved">Aprovada</option>
                        <option value="declined">Declinada</option>
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrintProposal(item)}
                        className="cursor-pointer gap-1.5 text-xs text-slate-700 dark:text-slate-300"
                        title="Ver / Baixar PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-brand-gold-dark" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenProposal(item)}
                        className="cursor-pointer gap-1.5 text-xs bg-brand-gold/10 text-brand-gold-dark border-brand-gold/40 hover:bg-brand-gold/20"
                        title="Reabrir e editar no simulador"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicateProposal(item)}
                        className="cursor-pointer text-slate-500 hover:text-slate-800"
                        title="Duplicar como nova proposta"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.client_name)}
                        className="cursor-pointer text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
