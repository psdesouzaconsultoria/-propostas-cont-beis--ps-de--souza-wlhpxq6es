import pb from '@/lib/pocketbase/client'
import type { OfficeSettings, PricingConfig } from '@/types/proposal'

export const defaultPricingConfig: PricingConfig = {
  basePrices: {
    simples_servico: { bronze: 490, prata: 790, ouro: 1290 },
    simples_comercio: { bronze: 590, prata: 890, ouro: 1490 },
    lucro_presumido: { bronze: 890, prata: 1290, ouro: 1990 },
    lucro_real: { bronze: 1490, prata: 2190, ouro: 3290 },
  },
  revenueTiers: [
    { max: 30000, additional: { bronze: 0, prata: 0, ouro: 0 } },
    { max: 60000, additional: { bronze: 100, prata: 150, ouro: 200 } },
    { max: 100000, additional: { bronze: 200, prata: 300, ouro: 400 } },
    { max: 200000, additional: { bronze: 400, prata: 550, ouro: 750 } },
    { max: 500000, additional: { bronze: 800, prata: 1100, ouro: 1500 } },
    { max: 1000000, additional: { bronze: 1500, prata: 2000, ouro: 2800 } },
  ],
  employeeCostPerHead: {
    bronze: 45,
    prata: 40,
    ouro: 35,
  },
  admissionDepartureCost: {
    bronze: 60,
    prata: 50,
    ouro: 40,
  },
  invoicesAllowance: {
    bronze: 30,
    prata: 70,
    ouro: 150,
  },
  excessInvoiceCost: {
    bronze: 3.5,
    prata: 2.5,
    ouro: 1.8,
  },
}

export async function getOfficeSettings(): Promise<OfficeSettings> {
  try {
    const records = await pb.collection('settings').getFullList<OfficeSettings>({
      sort: '-created',
    })

    if (records.length > 0) {
      const rec = records[0]
      return {
        ...rec,
        pricing_config: rec.pricing_config || defaultPricingConfig,
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar configurações do PocketBase:', err)
  }

  return {
    id: '',
    office_name: 'M&S Contabilidade & Consultoria Estratégica',
    responsible_name: 'Paulo de Souza - Contador CRC/SP',
    contact_email: 'contato@mscontabilidade.com.br',
    contact_phone: '(11) 98765-4321',
    contact_website: 'www.mscontabilidade.com.br',
    validity_days: 15,
    commercial_notes:
      'Valores para pagamento até o dia 10 de cada mês via boleto ou Pix. Reajuste anual pelo IPCA. Não estão inclusas taxas de órgãos públicos (JUCESP, Receita, Prefeitura) ou certificados digitais.',
    pricing_config: defaultPricingConfig,
  }
}

export async function saveOfficeSettings(
  settings: Partial<OfficeSettings>,
): Promise<OfficeSettings> {
  if (settings.id) {
    const updated = await pb.collection('settings').update<OfficeSettings>(settings.id, settings)
    return updated
  } else {
    const created = await pb.collection('settings').create<OfficeSettings>(settings)
    return created
  }
}
