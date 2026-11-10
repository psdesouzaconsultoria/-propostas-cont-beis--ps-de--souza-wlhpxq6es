import defaultLogo from '@/assets/2025-08-logo-ps-de-souza-azul-e3c63.jpg'
import pb from '@/lib/pocketbase/client'
import type { OfficeSettings } from '@/types/proposal'

/**
 * Identidade visual do escritório (cores da logo PS DE SOUZA):
 * - Azul-marinho escuro (#0D2B4E) = cor primária
 * - Dourado/âmbar (#F2A81D) = cor de destaque
 */
export const BRAND = {
  navy: '#0D2B4E',
  navyDark: '#081C36',
  navyLight: '#16395F',
  gold: '#F2A81D',
  goldDark: '#D18A0A',
  goldLight: '#F7C15C',
}

export const OFFICE_NAME = 'PS DE SOUZA CONSULTORIA & SERVIÇOS CONTÁBIL'

/** Logo padrão (imagem enviada pelo escritório, embutida no app). */
export const DEFAULT_LOGO = defaultLogo

/**
 * Resolve a URL da logo do escritório a partir das settings salvas no
 * PocketBase. Se houver um arquivo enviado nas configurações, devolve a URL
 * pública do arquivo; caso contrário, cai na logo oficial PS DE SOUZA
 * (asset embutido no app).
 */
export function resolveLogoUrl(settings?: Pick<OfficeSettings, 'id' | 'logo'> | null): string {
  if (settings?.logo && settings.id) {
    return `${pb.baseUrl}/api/files/settings/${settings.id}/${settings.logo}`
  }
  return DEFAULT_LOGO
}
