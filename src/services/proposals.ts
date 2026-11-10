import pb from '@/lib/pocketbase/client'
import type { ProposalRecord, ProposalInput, CalculatedPlans } from '@/types/proposal'

export async function listProposals(): Promise<ProposalRecord[]> {
  try {
    const list = await pb.collection('proposals').getFullList<ProposalRecord>({
      sort: '-created',
    })
    return list
  } catch (err) {
    console.error('Erro ao listar propostas:', err)
    return []
  }
}

export async function getProposalById(id: string): Promise<ProposalRecord | null> {
  try {
    const rec = await pb.collection('proposals').getOne<ProposalRecord>(id)
    return rec
  } catch (err) {
    console.error(`Erro ao buscar proposta ${id}:`, err)
    return null
  }
}

export async function createProposal(
  input: ProposalInput,
  calculated: CalculatedPlans,
  validityDays: number = 15,
): Promise<ProposalRecord> {
  const currentYear = new Date().getFullYear()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const code = `PROP-${currentYear}-${randomSuffix}`

  const validUntilDate = new Date()
  validUntilDate.setDate(validUntilDate.getDate() + validityDays)

  const payload: Partial<ProposalRecord> = {
    ...input,
    code,
    calculated_plans: calculated,
    status: 'draft',
    valid_until: validUntilDate.toISOString().split('T')[0],
    created_by: pb.authStore.record?.id,
  }

  return await pb.collection('proposals').create<ProposalRecord>(payload)
}

export async function updateProposal(
  id: string,
  input: Partial<ProposalRecord>,
): Promise<ProposalRecord> {
  return await pb.collection('proposals').update<ProposalRecord>(id, input)
}

export async function deleteProposal(id: string): Promise<boolean> {
  return await pb.collection('proposals').delete(id)
}
