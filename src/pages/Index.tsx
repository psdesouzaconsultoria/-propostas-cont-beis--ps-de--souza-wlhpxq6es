import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProposalBuilder from '@/components/ProposalBuilder'
import ProposalsHistory from '@/pages/ProposalsHistory'
import CorporateServicesPage from '@/pages/CorporateServices'
import OfficeSettingsPage from '@/pages/OfficeSettings'
import ProposalPdfView from '@/components/ProposalPdfView'
import { getOfficeSettings, defaultPricingConfig } from '@/services/settings'
import { listCorporateServices } from '@/services/corporateServices'
import type { ProposalRecord, OfficeSettings, CorporateService } from '@/types/proposal'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  History,
  Briefcase,
  Building2,
  LogOut,
  PlusCircle,
  FileText,
  UserCheck,
} from 'lucide-react'

type NavTab = 'builder' | 'history' | 'services' | 'settings'

export default function Index() {
  const { user, logout } = useAuth()
  const [currentTab, setCurrentTab] = useState<NavTab>('builder')
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null)
  const [pdfProposal, setPdfProposal] = useState<ProposalRecord | null>(null)
  const [settings, setSettings] = useState<OfficeSettings | null>(null)
  const [services, setServices] = useState<CorporateService[]>([])

  useEffect(() => {
    // Load common settings & services
    const loadCommon = async () => {
      try {
        const [sets, svcs] = await Promise.all([getOfficeSettings(), listCorporateServices()])
        setSettings(sets)
        setServices(svcs)
      } catch (err) {
        console.error(err)
      }
    }
    loadCommon()
  }, [])

  const handleOpenProposal = (p: ProposalRecord) => {
    setSelectedProposal(p)
    setCurrentTab('builder')
  }

  const handleDuplicateProposal = (p: ProposalRecord) => {
    // Clone without id and code
    const cloned: ProposalRecord = {
      ...p,
      id: '',
      code: '',
      client_name: `${p.client_name} (Cópia)`,
    }
    setSelectedProposal(cloned)
    setCurrentTab('builder')
  }

  const handlePrintProposal = (p: ProposalRecord) => {
    setPdfProposal(p)
  }

  const handleNewProposal = () => {
    setSelectedProposal(null)
    setCurrentTab('builder')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Navigation Bar (hidden in print) */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                M&S Propostas Contábeis
              </h1>
              <p className="text-[11px] text-slate-500">
                Simulador Bronze, Prata & Ouro • Gestão Comercial
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={currentTab === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleNewProposal}
              className={`cursor-pointer gap-1.5 text-xs font-semibold ${
                currentTab === 'builder'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulador</span>
            </Button>

            <Button
              variant={currentTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setPdfProposal(null)
                setCurrentTab('history')
              }}
              className={`cursor-pointer gap-1.5 text-xs font-semibold ${
                currentTab === 'history'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico</span>
            </Button>

            <Button
              variant={currentTab === 'services' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setPdfProposal(null)
                setCurrentTab('services')
              }}
              className={`cursor-pointer gap-1.5 text-xs font-semibold ${
                currentTab === 'services'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Societário</span>
            </Button>

            <Button
              variant={currentTab === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setPdfProposal(null)
                setCurrentTab('settings')
              }}
              className={`cursor-pointer gap-1.5 text-xs font-semibold ${
                currentTab === 'settings'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Preços & Dados</span>
            </Button>
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.name || user?.email || 'Escritório'}
              </div>
              <div className="text-[10px] text-slate-400">Contador Responsável</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-500 hover:text-red-600 cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* If user clicked to view/print PDF of a proposal directly from history */}
        {pdfProposal && settings ? (
          <ProposalPdfView
            proposal={pdfProposal}
            settings={settings}
            corporateServices={services}
            onClose={() => setPdfProposal(null)}
          />
        ) : (
          <>
            {currentTab === 'builder' && (
              <ProposalBuilder
                initialProposal={selectedProposal}
                onSaved={() => {
                  // Stay or allow switching
                }}
              />
            )}

            {currentTab === 'history' && (
              <ProposalsHistory
                onOpenProposal={handleOpenProposal}
                onDuplicateProposal={handleDuplicateProposal}
                onPrintProposal={handlePrintProposal}
              />
            )}

            {currentTab === 'services' && <CorporateServicesPage />}

            {currentTab === 'settings' && <OfficeSettingsPage />}
          </>
        )}
      </main>
    </div>
  )
}
