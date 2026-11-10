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
 * (fundo azul-marinho, pilar dourado e nome em branco); nas configurações o
 * escritório pode enviar outra imagem, que passa a valer em todo o app.
 */
export default function OfficeLogo({ src, className, alt }: OfficeLogoProps) {
  return (
    <img
      src={src || DEFAULT_LOGO}
      alt={alt || 'Logo PS DE SOUZA Consultoria & Serviços Contábil'}
      className={className || 'h-10 w-10 rounded-lg object-cover object-top'}
    />
  )
}
