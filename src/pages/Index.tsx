import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import ProposalBuilder from '@/components/ProposalBuilder'
import ProposalsHistory from '@/pages/ProposalsHistory'
import CorporateServicesPage from '@/pages/CorporateServices'
import OfficeSettingsPage from '@/pages/OfficeSettings'
import ProposalPdfView from '@/components/ProposalPdfView'
import OfficeLogo from '@/components/OfficeLogo'
import { getOfficeSettings, defaultPricingConfig } from '@/services/settings'
import { listCorporateServices } from '@/services/corporateServices'
import { resolveLogoUrl } from '@/lib/brand'
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

  const logoUrl = settings ? resolveLogoUrl(settings) : undefined

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Navigation Bar (hidden in print) */}
      <header className="no-print bg-brand-navy dark:bg-slate-900 border-b-2 border-brand-gold sticky top-0 z-30 shadow-md">
        <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <OfficeLogo
              src={logoUrl}
              className="h-11 w-11 rounded-lg object-cover object-top shadow-sm ring-1 ring-white/20"
            />
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                PS de Souza Propostas
              </h1>
              <p className="text-[11px] text-brand-gold-light">
                Consultoria & Serviços Contábil • Bronze, Prata & Ouro
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {(
              [
                {
                  key: 'builder',
                  label: 'Simulador',
                  icon: PlusCircle,
                  onClick: handleNewProposal,
                },
                {
                  key: 'history',
                  label: 'Histórico',
                  icon: History,
                  onClick: () => {
                    setPdfProposal(null)
                    setCurrentTab('history')
                  },
                },
                {
                  key: 'services',
                  label: 'Societário',
                  icon: Briefcase,
                  onClick: () => {
                    setPdfProposal(null)
                    setCurrentTab('services')
                  },
                },
                {
                  key: 'settings',
                  label: 'Preços & Dados',
                  icon: Building2,
                  onClick: () => {
                    setPdfProposal(null)
                    setCurrentTab('settings')
                  },
                },
              ] as const
            ).map((item) => {
              const active = currentTab === item.key
              return (
                <Button
                  key={item.key}
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  className={`cursor-pointer gap-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-brand-gold hover:bg-brand-gold-dark text-brand-navy shadow-sm'
                      : 'text-slate-200 hover:bg-white/10 hover:text-brand-gold-light'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">
                {user?.name || user?.email || 'Escritório'}
              </div>
              <div className="text-[10px] text-brand-gold-light">Contador Responsável</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-300 hover:text-brand-gold-light hover:bg-white/10 cursor-pointer"
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
