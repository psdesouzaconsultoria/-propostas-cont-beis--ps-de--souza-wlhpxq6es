import { cn } from '@/lib/utils'
import { DEFAULT_LOGO } from '@/lib/brand'

interface OfficeLogoProps {
  /** URL da logo (arquivo enviado nas configurações) — se ausente, usa a logo padrão. */
  src?: string | null
  /** Classes de tamanho/arredondamento do contêiner. */
  className?: string
  alt?: string
}

/**
 * Logo do escritório PS DE SOUZA. Por padrão exibe a imagem oficial enviada
 * (fundo branco, sem transparência); nas configurações o escritório pode
 * enviar outra imagem, que passa a valer em todo o app.
 *
 * A imagem é sempre exibida com `object-contain` e largura automática,
 * respeitando a proporção natural do arquivo — nunca distorcida nem cortada.
 * As classes recebidas só definem altura (h-*) e arredondamento.
 */
export default function OfficeLogo({ src, className, alt }: OfficeLogoProps) {
  return (
    <img
      src={src || DEFAULT_LOGO}
      alt={alt || 'Logo PS DE SOUZA Consultoria & Serviços Contábil'}
      className={cn('h-10 w-auto object-contain', className)}
    />
  )
}
