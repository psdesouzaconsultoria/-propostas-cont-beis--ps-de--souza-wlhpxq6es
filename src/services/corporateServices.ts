import pb from '@/lib/pocketbase/client'
import type { CorporateService } from '@/types/proposal'

export async function listCorporateServices(): Promise<CorporateService[]> {
  try {
    const list = await pb.collection('corporate_services').getFullList<CorporateService>({
      sort: 'order',
    })
    return list
  } catch (err) {
    console.error('Erro ao listar serviços societários:', err)
    return []
  }
}

export async function createCorporateService(
  service: Omit<CorporateService, 'id' | 'created' | 'updated'>,
): Promise<CorporateService> {
  return await pb.collection('corporate_services').create<CorporateService>(service)
}

export async function updateCorporateService(
  id: string,
  service: Partial<CorporateService>,
): Promise<CorporateService> {
  return await pb.collection('corporate_services').update<CorporateService>(id, service)
}

export async function deleteCorporateService(id: string): Promise<boolean> {
  return await pb.collection('corporate_services').delete(id)
}
